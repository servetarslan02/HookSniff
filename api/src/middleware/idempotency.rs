//! Idempotency and replay protection middleware.
//!
//! Provides two layers of protection:
//!
//! 1. **Idempotency keys** — Prevents duplicate processing of the same request
//!    using `Idempotency-Key` header (24-hour TTL).
//!
//! 2. **Replay protection** — Rejects webhook deliveries with timestamps
//!    older than a configurable tolerance window (default 5 minutes).
//!    Stores seen webhook IDs for the same window to prevent duplicates.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Default timestamp tolerance in seconds (5 minutes).
pub const DEFAULT_TIMESTAMP_TOLERANCE_SECS: i64 = 300;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct IdempotencyKey {
    pub key: String,
    pub customer_id: Uuid,
    pub response_body: serde_json::Value,
    pub status_code: i32,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

/// Check if an idempotency key exists and return cached response if so.
/// Returns None if key doesn't exist, has expired, or body hash doesn't match.
pub async fn check_idempotency(
    pool: &sqlx::PgPool,
    key: &str,
    customer_id: Uuid,
    body_hash: Option<&str>,
) -> Option<IdempotencyKey> {
    if let Some(hash) = body_hash {
        // Check with body hash — must match both key and body
        sqlx::query_as::<_, IdempotencyKey>(
            "SELECT * FROM idempotency_keys WHERE key = $1 AND customer_id = $2 AND expires_at > now() AND (body_hash = $3 OR body_hash IS NULL)",
        )
        .bind(key)
        .bind(customer_id)
        .bind(hash)
        .fetch_optional(pool)
        .await
        .ok()
        .flatten()
    } else {
        // Legacy check without body hash
        sqlx::query_as::<_, IdempotencyKey>(
            "SELECT * FROM idempotency_keys WHERE key = $1 AND customer_id = $2 AND expires_at > now()",
        )
        .bind(key)
        .bind(customer_id)
        .fetch_optional(pool)
        .await
        .ok()
        .flatten()
    }
}

/// Store an idempotency key with its response for 24 hours.
/// Optionally stores body hash for request body validation.
pub async fn store_idempotency(
    pool: &sqlx::PgPool,
    key: &str,
    customer_id: Uuid,
    response_body: serde_json::Value,
    status_code: i32,
    body_hash: Option<&str>,
) -> Result<(), sqlx::Error> {
    let expires_at = Utc::now() + chrono::Duration::hours(24);

    sqlx::query(
        "INSERT INTO idempotency_keys (key, customer_id, response_body, status_code, expires_at, body_hash) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (key) DO NOTHING",
    )
    .bind(key)
    .bind(customer_id)
    .bind(&response_body)
    .bind(status_code)
    .bind(expires_at)
    .bind(body_hash)
    .execute(pool)
    .await?;

    Ok(())
}

/// Compute a hash of the request body for idempotency validation.
/// Uses SHA-256 for cryptographic security (prevents hash collisions).
pub fn compute_body_hash(body: &serde_json::Value) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(body.to_string().as_bytes());
    hex::encode(hasher.finalize())
}

// ── Replay Protection ──────────────────────────────────────────────────

/// Record for tracking seen webhook IDs (replay protection).
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SeenWebhook {
    pub webhook_id: String,
    pub seen_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

/// Errors from replay protection checks.
#[derive(Debug, Clone)]
pub enum ReplayError {
    /// The webhook timestamp is too old.
    TimestampExpired { age_secs: i64, tolerance_secs: i64 },
    /// This webhook ID was already processed (duplicate).
    Duplicate { webhook_id: String },
}

impl std::fmt::Display for ReplayError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TimestampExpired {
                age_secs,
                tolerance_secs,
            } => write!(
                f,
                "Webhook timestamp expired: {}s old (tolerance: {}s)",
                age_secs, tolerance_secs
            ),
            Self::Duplicate { webhook_id } => {
                write!(f, "Duplicate webhook: {} already processed", webhook_id)
            }
        }
    }
}

impl std::error::Error for ReplayError {}

/// Check if a webhook timestamp is within the tolerance window.
///
/// Returns `Ok(())` if the timestamp is fresh enough, `Err(ReplayError)` otherwise.
pub fn check_timestamp(
    webhook_timestamp: i64,
    tolerance_secs: Option<i64>,
) -> Result<(), ReplayError> {
    let tolerance = tolerance_secs.unwrap_or(DEFAULT_TIMESTAMP_TOLERANCE_SECS);
    let now = Utc::now().timestamp();
    let age = (now - webhook_timestamp).abs();

    if age > tolerance {
        Err(ReplayError::TimestampExpired {
            age_secs: age,
            tolerance_secs: tolerance,
        })
    } else {
        Ok(())
    }
}

/// Check if a webhook ID has already been seen (duplicate detection).
///
/// Returns `Ok(true)` if this is a new webhook, `Ok(false)` if already seen,
/// or `Err` on database errors.
pub async fn check_webhook_seen(
    pool: &sqlx::PgPool,
    webhook_id: &str,
) -> Result<bool, sqlx::Error> {
    let existing = sqlx::query_as::<_, SeenWebhook>(
        "SELECT * FROM seen_webhooks WHERE webhook_id = $1 AND expires_at > now()",
    )
    .bind(webhook_id)
    .fetch_optional(pool)
    .await?;

    Ok(existing.is_none())
}

/// Record a webhook ID as seen.
///
/// Stores the ID with a TTL matching the timestamp tolerance window.
pub async fn mark_webhook_seen(
    pool: &sqlx::PgPool,
    webhook_id: &str,
    tolerance_secs: Option<i64>,
) -> Result<(), sqlx::Error> {
    let tolerance = tolerance_secs.unwrap_or(DEFAULT_TIMESTAMP_TOLERANCE_SECS);
    let now = Utc::now();
    let expires_at = now + chrono::Duration::seconds(tolerance);

    sqlx::query(
        "INSERT INTO seen_webhooks (webhook_id, seen_at, expires_at) VALUES ($1, $2, $3) ON CONFLICT (webhook_id) DO NOTHING",
    )
    .bind(webhook_id)
    .bind(now)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(())
}

/// Perform full replay protection check: timestamp + duplicate detection.
///
/// This is the main entrypoint for replay protection. It:
/// 1. Validates the webhook timestamp is within tolerance
/// 2. Atomically inserts the webhook ID (INSERT ... ON CONFLICT DO NOTHING)
/// 3. Returns error if the ID was already present (duplicate)
///
/// Returns `Ok(())` if the webhook is valid, `Err(ReplayError)` otherwise.
pub async fn check_replay(
    pool: &sqlx::PgPool,
    webhook_id: &str,
    webhook_timestamp: i64,
    tolerance_secs: Option<i64>,
) -> Result<(), ReplayError> {
    // 1. Check timestamp freshness
    check_timestamp(webhook_timestamp, tolerance_secs)?;

    // 2. Atomic check-and-mark: INSERT ... ON CONFLICT DO NOTHING
    //    If rows_affected == 0, the webhook was already seen (duplicate).
    let tolerance = tolerance_secs.unwrap_or(DEFAULT_TIMESTAMP_TOLERANCE_SECS);
    let now = Utc::now();
    let expires_at = now + chrono::Duration::seconds(tolerance);

    let result = sqlx::query(
        "INSERT INTO seen_webhooks (webhook_id, seen_at, expires_at) \
         VALUES ($1, $2, $3) ON CONFLICT (webhook_id) DO NOTHING",
    )
    .bind(webhook_id)
    .bind(now)
    .bind(expires_at)
    .execute(pool)
    .await;

    match result {
        Ok(r) => {
            if r.rows_affected() == 0 {
                // Conflict — already seen
                Err(ReplayError::Duplicate {
                    webhook_id: webhook_id.to_string(),
                })
            } else {
                Ok(())
            }
        }
        Err(e) => {
            tracing::warn!("Failed to check seen webhooks: {:?}", e);
            // On DB error, allow the webhook through (fail open)
            Ok(())
        }
    }
}

/// SQL migration to create the `seen_webhooks` table.
///
/// Run this as part of your database migrations:
/// ```sql
/// CREATE TABLE IF NOT EXISTS seen_webhooks (
///     webhook_id TEXT PRIMARY KEY,
///     seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
///     expires_at TIMESTAMPTZ NOT NULL
/// );
/// CREATE INDEX IF NOT EXISTS idx_seen_webhooks_expires
///     ON seen_webhooks (expires_at);
/// ```
pub const SEEN_WEBHOOKS_MIGRATION: &str = r#"
CREATE TABLE IF NOT EXISTS seen_webhooks (
    webhook_id TEXT PRIMARY KEY,
    seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_seen_webhooks_expires
    ON seen_webhooks (expires_at);
"#;

/// Cleanup expired seen webhook entries.
///
/// Should be called periodically (e.g., every hour) to prevent
/// the `seen_webhooks` table from growing indefinitely.
pub async fn cleanup_expired_webhooks(pool: &sqlx::PgPool) -> Result<u64, sqlx::Error> {
    let result = sqlx::query("DELETE FROM seen_webhooks WHERE expires_at < now()")
        .execute(pool)
        .await?;

    Ok(result.rows_affected())
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── check_timestamp ───────────────────────────────────────

    #[test]
    fn test_check_timestamp_fresh() {
        let now = Utc::now().timestamp();
        assert!(check_timestamp(now, None).is_ok());
    }

    #[test]
    fn test_check_timestamp_expired() {
        let old = Utc::now().timestamp() - 600; // 10 min ago
        let result = check_timestamp(old, None);
        assert!(matches!(result, Err(ReplayError::TimestampExpired { .. })));
    }

    #[test]
    fn test_check_timestamp_custom_tolerance() {
        let old = Utc::now().timestamp() - 600; // 10 min ago
                                                // With 15 minute tolerance, should pass
        assert!(check_timestamp(old, Some(900)).is_ok());
        // With 5 minute tolerance, should fail
        assert!(check_timestamp(old, Some(300)).is_err());
    }

    #[test]
    fn test_check_timestamp_future() {
        // Future timestamps within tolerance should be allowed
        let future = Utc::now().timestamp() + 60; // 1 min in future
        assert!(check_timestamp(future, None).is_ok());
    }

    #[test]
    fn test_check_timestamp_boundary() {
        // Exactly at tolerance boundary
        let now = Utc::now().timestamp();
        let tolerance = DEFAULT_TIMESTAMP_TOLERANCE_SECS;
        let _boundary = now - tolerance;
        // Should be right at the edge — may pass or fail depending on timing
        // But definitely past tolerance should fail
        assert!(check_timestamp(now - tolerance - 10, None).is_err());
    }

    // ── ReplayError ───────────────────────────────────────────

    #[test]
    fn test_replay_error_display() {
        let err = ReplayError::TimestampExpired {
            age_secs: 600,
            tolerance_secs: 300,
        };
        assert!(format!("{}", err).contains("600"));

        let err = ReplayError::Duplicate {
            webhook_id: "wh_123".to_string(),
        };
        assert!(format!("{}", err).contains("wh_123"));
    }

    #[test]
    fn test_replay_error_debug() {
        let err = ReplayError::TimestampExpired {
            age_secs: 100,
            tolerance_secs: 50,
        };
        let debug = format!("{:?}", err);
        assert!(debug.contains("TimestampExpired"));
    }

    // ── compute_body_hash ─────────────────────────────────────

    #[test]
    fn test_compute_body_hash_deterministic() {
        let body = serde_json::json!({"key": "value"});
        let h1 = compute_body_hash(&body);
        let h2 = compute_body_hash(&body);
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_compute_body_hash_different_bodies() {
        let b1 = serde_json::json!({"key": "value1"});
        let b2 = serde_json::json!({"key": "value2"});
        assert_ne!(compute_body_hash(&b1), compute_body_hash(&b2));
    }

    #[test]
    fn test_compute_body_hash_is_64_hex() {
        let body = serde_json::json!({"test": true});
        let hash = compute_body_hash(&body);
        assert_eq!(hash.len(), 64); // SHA-256 = 32 bytes = 64 hex chars
        assert!(hash.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn test_compute_body_hash_empty_object() {
        let body = serde_json::json!({});
        let hash = compute_body_hash(&body);
        assert_eq!(hash.len(), 64); // SHA-256 = 32 bytes = 64 hex chars
    }

    // ── DEFAULT_TIMESTAMP_TOLERANCE_SECS ──────────────────────

    #[test]
    fn test_default_tolerance_is_5_minutes() {
        assert_eq!(DEFAULT_TIMESTAMP_TOLERANCE_SECS, 300);
    }

    // ── IdempotencyKey serde ──────────────────────────────────

    #[test]
    fn test_idempotency_key_serde() {
        let key = IdempotencyKey {
            key: "test-key".to_string(),
            customer_id: Uuid::new_v4(),
            response_body: serde_json::json!({"status": "ok"}),
            status_code: 200,
            created_at: Utc::now(),
            expires_at: Utc::now() + chrono::Duration::hours(24),
        };
        let json = serde_json::to_string(&key).unwrap();
        let back: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(back.key, "test-key");
        assert_eq!(back.status_code, 200);
    }

    // ── SeenWebhook serde ─────────────────────────────────────

    #[test]
    fn test_seen_webhook_serde() {
        let wh = SeenWebhook {
            webhook_id: "wh_456".to_string(),
            seen_at: Utc::now(),
            expires_at: Utc::now() + chrono::Duration::hours(1),
        };
        let json = serde_json::to_string(&wh).unwrap();
        let back: SeenWebhook = serde_json::from_str(&json).unwrap();
        assert_eq!(back.webhook_id, "wh_456");
    }
}
