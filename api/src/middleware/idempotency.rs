use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
