//! Security Module — Comprehensive Security Infrastructure
//!
//! All security-related functionality consolidated here:
//! - API key rotation
//! - DDoS protection
//! - Threat detection
//! - Incident response
//! - Compliance auditing
//! - Zero trust verification

pub mod auto_resolve;
pub mod behavioral;
pub mod compliance;
pub mod ddos;
pub mod incident_response;
pub mod ip_reputation;
pub mod threat_detector;
pub mod waf;
pub mod zero_trust;
pub mod alerting;

use sqlx::PgPool;
use uuid::Uuid;
use crate::middleware::{generate_api_key, hash_api_key};

/// API key rotation policy
pub struct RotationPolicy {
    pub max_age_days: u32,
    pub warn_before_days: u32,
    pub auto_rotate: bool,
}

impl Default for RotationPolicy {
    fn default() -> Self {
        Self { max_age_days: 90, warn_before_days: 7, auto_rotate: false }
    }
}

/// Rotate an API key: revoke old, create new
pub async fn rotate_api_key(
    pool: &PgPool,
    key_id: Uuid,
    customer_id: Uuid,
) -> Result<String, sqlx::Error> {
    let new_key = generate_api_key();
    let key_hash = hash_api_key(&new_key);
    let key_prefix = &new_key[..std::cmp::min(15, new_key.len())];

    let mut tx = pool.begin().await?;

    sqlx::query("UPDATE api_keys SET revoked = true, revoked_at = NOW() WHERE id = $1 AND customer_id = $2")
        .bind(key_id).bind(customer_id)
        .execute(&mut *tx).await?;

    let old_key: Option<(Option<String>, Option<String>)> = sqlx::query_as(
        "SELECT name, description FROM api_keys WHERE id = $1"
    )
    .bind(key_id)
    .fetch_optional(&mut *tx).await?;

    let (name, description) = old_key.unwrap_or((None, None));

    sqlx::query(
        "INSERT INTO api_keys (customer_id, name, description, api_key_hash, api_key_prefix, is_test, rotated_from) VALUES ($1, $2, $3, $4, $5, false, $6)"
    )
    .bind(customer_id).bind(name).bind(description).bind(&key_hash).bind(key_prefix).bind(key_id)
    .execute(&mut *tx).await?;

    crate::audit::log_action(pool, customer_id, "api_key_rotated", "api_key",
        Some(&key_id.to_string()), Some(serde_json::json!({ "reason": "manual_rotation" })), None, None
    ).await.ok();

    tx.commit().await?;
    Ok(new_key)
}

/// Rotate endpoint signing secret with 24h overlap.
/// Old secret stays valid for 24h via `previous_signing_secret` column.
pub async fn rotate_signing_secret(
    pool: &PgPool,
    endpoint_id: Uuid,
    customer_id: Uuid,
) -> Result<(String, String), sqlx::Error> {
    let new_secret = format!("whsec_{}", generate_api_key());

    // Get current secret
    let current: Option<(String,)> = sqlx::query_as(
        "SELECT signing_secret FROM endpoints WHERE id = $1 AND customer_id = $2"
    )
    .bind(endpoint_id).bind(customer_id)
    .fetch_optional(pool).await?;

    let old_secret = current.map(|(s,)| s).unwrap_or_default();

    // Save old secret as previous (24h overlap) + set new secret
    sqlx::query(
        "UPDATE endpoints SET \
         old_signing_secret = signing_secret, \
         secret_rotated_at = NOW(), \
         signing_secret = $1 \
         WHERE id = $2 AND customer_id = $3"
    )
    .bind(&new_secret).bind(endpoint_id).bind(customer_id)
    .execute(pool).await?;

    crate::audit::log_action(pool, customer_id, "signing_secret_rotated", "endpoint",
        Some(&endpoint_id.to_string()), Some(serde_json::json!({ "overlap_hours": 24 })), None, None
    ).await.ok();

    Ok((old_secret, new_secret))
}
