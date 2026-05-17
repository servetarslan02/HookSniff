use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct OperationalWebhookDelivery {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub response_status: Option<i16>,
    pub response_body: Option<String>,
    pub attempt_count: i16,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub delivered_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct OpWebhookDeliveryResponse {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub response_status: Option<i16>,
    pub attempt_count: i16,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub delivered_at: Option<DateTime<Utc>>,
}

impl OperationalWebhookDelivery {
    pub fn to_response(self) -> OpWebhookDeliveryResponse {
        OpWebhookDeliveryResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            event_type: self.event_type,
            payload: self.payload,
            response_status: self.response_status,
            attempt_count: self.attempt_count,
            status: self.status,
            created_at: self.created_at,
            delivered_at: self.delivered_at,
        }
    }
}
