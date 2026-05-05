use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Endpoint {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub signing_secret: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEndpointRequest {
    pub url: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EndpointResponse {
    pub id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

impl Endpoint {
    pub fn to_response(self) -> EndpointResponse {
        EndpointResponse {
            id: self.id,
            url: self.url,
            description: self.description,
            is_active: self.is_active,
            created_at: self.created_at,
        }
    }
}
