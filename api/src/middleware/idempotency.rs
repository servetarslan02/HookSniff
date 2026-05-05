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
/// Returns None if key doesn't exist or has expired.
pub async fn check_idempotency(
    pool: &sqlx::PgPool,
    key: &str,
    customer_id: Uuid,
) -> Option<IdempotencyKey> {
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

/// Store an idempotency key with its response for 24 hours.
pub async fn store_idempotency(
    pool: &sqlx::PgPool,
    key: &str,
    customer_id: Uuid,
    response_body: serde_json::Value,
    status_code: i32,
) -> Result<(), sqlx::Error> {
    let expires_at = Utc::now() + chrono::Duration::hours(24);

    sqlx::query(
        "INSERT INTO idempotency_keys (key, customer_id, response_body, status_code, expires_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO NOTHING",
    )
    .bind(key)
    .bind(customer_id)
    .bind(&response_body)
    .bind(status_code)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(())
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
pub fn check_timestamp(webhook_timestamp: i64, tolerance_secs: Option<i64>) -> Result<(), ReplayError> {
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
/// 2. Checks if the webhook ID was already seen
/// 3. Marks the webhook as seen if both checks pass
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

    // 2. Check for duplicates
    let is_new = check_webhook_seen(pool, webhook_id)
        .await
        .map_err(|e| {
            tracing::warn!("Failed to check seen webhooks: {:?}", e);
            // On DB error, allow the webhook through (fail open)
            ReplayError::Duplicate {
                webhook_id: webhook_id.to_string(),
            }
        })
        .unwrap_or(true);

    if !is_new {
        return Err(ReplayError::Duplicate {
            webhook_id: webhook_id.to_string(),
        });
    }

    // 3. Mark as seen
    let _ = mark_webhook_seen(pool, webhook_id, tolerance_secs).await;

    Ok(())
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

    #[test]
    fn test_check_timestamp_fresh() {
        let now = Utc::now().timestamp();
        assert!(check_timestamp(now, None).is_ok());
    }

    #[test]
    fn test_check_timestamp_expired() {
        let old = Utc::now().timestamp() - 600; // 10 min ago
        let result = check_timestamp(old, None);
        assert!(matches!(
            result,
            Err(ReplayError::TimestampExpired { .. })
        ));
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
}
