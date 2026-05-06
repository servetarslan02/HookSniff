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
}

#[derive(Debug, Serialize)]
pub struct DeliveryAttemptResponse {
    pub id: Uuid,
    pub attempt_number: i32,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
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
        }
    }
}

impl DeliveryAttempt {
    pub fn to_response(self) -> DeliveryAttemptResponse {
        DeliveryAttemptResponse {
            id: self.id,
            attempt_number: self.attempt_number,
            status_code: self.status_code,
            response_body: self.response_body,
            duration_ms: self.duration_ms,
            error_message: self.error_message,
            created_at: self.created_at,
        }
    }
}
