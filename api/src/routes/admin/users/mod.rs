pub mod handlers;
pub mod analytics;
pub mod resources;

use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

// Re-export all handler functions
pub use handlers::*;
pub use analytics::*;
pub use resources::*;

#[derive(Debug, Serialize, FromRow)]
pub struct UserDetail {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub is_active: bool,
    pub is_admin: bool,
    pub email_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub webhook_count: i64,
    pub webhook_limit: i64,
    pub total_deliveries: i64,
    pub total_endpoints: i64,
}
