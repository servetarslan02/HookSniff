use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct OperationalWebhookEndpoint {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    #[serde(skip_serializing)]
    pub signing_secret: String,
    pub event_types: Option<Vec<String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOpWebhookEndpointRequest {
    pub url: String,
    pub description: Option<String>,
    pub is_active: Option<bool>,
    pub event_types: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOpWebhookEndpointRequest {
    pub url: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
    pub event_types: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
pub struct OpWebhookEndpointResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub event_types: Option<Vec<String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl OperationalWebhookEndpoint {
    pub fn to_response(self) -> OpWebhookEndpointResponse {
        OpWebhookEndpointResponse {
            id: self.id,
            customer_id: self.customer_id,
            url: self.url,
            description: self.description,
            is_active: self.is_active,
            event_types: self.event_types,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

impl CreateOpWebhookEndpointRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.url.trim().is_empty() {
            return Err("URL cannot be empty".into());
        }
        if !self.url.starts_with("https://") && !self.url.starts_with("http://") {
            return Err("URL must start with http:// or https://".into());
        }
        Ok(())
    }
}
