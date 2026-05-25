use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Delivery {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub payload: serde_json::Value,
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub last_attempt_at: Option<DateTime<Utc>>,
    pub response_status: Option<i32>,
    pub response_body: Option<String>,
    pub next_retry_at: Option<DateTime<Utc>>,
    pub replay_count: i32,
    pub created_at: DateTime<Utc>,
    // Fields added by migrations
    pub sequence_num: Option<i64>,
    pub fifo_group_id: Option<String>,
    pub updated_at: DateTime<Utc>,
    pub error_message: Option<String>,
    /// True if this delivery was created with a test API key (hr_test_*).
    #[sqlx(default)]
    pub is_test: bool,
    /// Custom headers to send with the delivery.
    #[sqlx(default)]
    pub custom_headers: Option<serde_json::Value>,
    /// Event name alias.
    #[sqlx(default)]
    pub event: Option<String>,
    /// When the delivery was processed.
    #[sqlx(default)]
    pub processed_at: Option<DateTime<Utc>>,
    /// Idempotency key for duplicate prevention.
    #[sqlx(default)]
    pub idempotency_key: Option<String>,
    /// Source IP of the webhook sender.
    #[sqlx(default)]
    pub source_ip: Option<String>,
    /// Original request headers.
    #[sqlx(default)]
    pub request_headers: Option<serde_json::Value>,
    /// Application this delivery belongs to.
    #[sqlx(default)]
    pub application_id: Option<Uuid>,
    /// Hash of the payload for deduplication.
    #[sqlx(default)]
    pub payload_hash: Option<String>,
}

/// Lightweight delivery struct for list queries.
/// Excludes `payload` (up to 256KB) and `response_body` to reduce DB bandwidth.
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct DeliveryListRow {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub last_attempt_at: Option<DateTime<Utc>>,
    pub response_status: Option<i32>,
    pub next_retry_at: Option<DateTime<Utc>>,
    pub replay_count: i32,
    pub created_at: DateTime<Utc>,
    pub sequence_num: Option<i64>,
    pub fifo_group_id: Option<String>,
    pub updated_at: DateTime<Utc>,
    pub error_message: Option<String>,
    #[sqlx(default)]
    pub is_test: bool,
}

impl DeliveryListRow {
    pub fn to_response(&self) -> DeliveryResponse {
        DeliveryResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            event: self.event_type.clone(),
            status: self.status.clone(),
            attempt_count: self.attempt_count,
            response_status: self.response_status,
            replay_count: Some(self.replay_count),
            created_at: self.created_at,
            is_test: Some(self.is_test),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateWebhookRequest {
    pub endpoint_id: Uuid,
    pub event: Option<String>,
    pub data: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct BatchWebhookRequest {
    pub webhooks: Vec<CreateWebhookRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeliveryResponse {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub event: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub replay_count: Option<i32>,
    pub created_at: DateTime<Utc>,
    /// True if this was a test delivery.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_test: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct DeliveryListResponse {
    pub deliveries: Vec<DeliveryResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, Serialize)]
pub struct BatchResponse {
    pub deliveries: Vec<DeliveryResponse>,
    pub errors: Vec<BatchError>,
}

#[derive(Debug, Serialize)]
pub struct BatchError {
    pub index: usize,
    pub error: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DeliveryAttempt {
    pub id: Uuid,
    pub delivery_id: Uuid,
    pub attempt_number: i32,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    pub trace_id: Option<String>,
    pub response_headers: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct DeliveryAttemptResponse {
    pub id: Uuid,
    pub delivery_id: Uuid,
    pub attempt_number: i32,
    pub status: String,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub response_headers: Option<serde_json::Value>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl DeliveryAttempt {
    pub fn to_response(&self) -> DeliveryAttemptResponse {
        let status = match self.status_code {
            Some(code) if (200..300).contains(&code) => "delivered".to_string(),
            _ => "failed".to_string(),
        };
        DeliveryAttemptResponse {
            id: self.id,
            delivery_id: self.delivery_id,
            attempt_number: self.attempt_number,
            status,
            status_code: self.status_code,
            response_body: self.response_body.clone(),
            response_headers: self.response_headers.clone(),
            duration_ms: self.duration_ms,
            error_message: self.error_message.clone(),
            created_at: self.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExportDelivery {
    pub id: Uuid,
    pub event: Option<String>,
    pub endpoint_url: String,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub created_at: DateTime<Utc>,
}

impl Delivery {
    pub fn to_response(&self) -> DeliveryResponse {
        DeliveryResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            event: self.event_type.clone(),
            status: self.status.clone(),
            attempt_count: self.attempt_count,
            response_status: self.response_status,
            replay_count: Some(self.replay_count),
            created_at: self.created_at,
            is_test: Some(self.is_test),
        }
    }
}


mod tests;
