//! Shared types for the HookSniff Worker.

use serde::{Deserialize, Serialize};

/// Webhook message format used by delivery modules.
/// Bridges the queue item format with the delivery router.
#[derive(Debug, Clone)]
pub struct WebhookMessage {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub endpoint_url: String,
    pub signing_secret: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
}

/// Webhook queue'dan gelen mesaj formatı
#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct WebhookQueueItem {
    pub id: uuid::Uuid,
    pub delivery_id: uuid::Uuid,
    pub endpoint_id: uuid::Uuid,
    pub endpoint_url: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub next_retry_at: Option<chrono::DateTime<chrono::Utc>>,
    pub trace_id: Option<String>,
}
