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
