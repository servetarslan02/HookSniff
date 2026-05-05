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
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWebhookRequest {
    pub endpoint_id: Uuid,
    pub event: Option<String>,
    pub data: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct DeliveryResponse {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub event: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct DeliveryListResponse {
    pub deliveries: Vec<DeliveryResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

impl Delivery {
    pub fn to_response(self) -> DeliveryResponse {
        DeliveryResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            event: self.event_type,
            status: self.status,
            attempt_count: self.attempt_count,
            response_status: self.response_status,
            created_at: self.created_at,
        }
    }
}
