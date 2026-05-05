use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Customer {
    pub id: Uuid,
    pub email: String,
    pub api_key_hash: String,
    pub api_key_prefix: String,
    pub plan: String,
    pub webhook_limit: i32,
    pub webhook_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCustomerRequest {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct CustomerResponse {
    pub id: Uuid,
    pub email: String,
    pub api_key: Option<String>, // Only returned on creation
    pub plan: String,
    pub webhook_limit: i32,
    pub webhook_count: i32,
    pub created_at: DateTime<Utc>,
}

impl Customer {
    pub fn to_response(self, api_key: Option<String>) -> CustomerResponse {
        CustomerResponse {
            id: self.id,
            email: self.email,
            api_key,
            plan: self.plan,
            webhook_limit: self.webhook_limit,
            webhook_count: self.webhook_count,
            created_at: self.created_at,
        }
    }
}
