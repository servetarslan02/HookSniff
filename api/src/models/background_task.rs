use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Background task: async operation tracked per customer.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct BackgroundTask {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub task_type: String,
    pub status: String,
    pub data: Option<serde_json::Value>,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub progress: Option<i16>,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
}

/// Request body for creating a background task (internal use).
#[derive(Debug, Deserialize)]
pub struct CreateBackgroundTaskRequest {
    pub task_type: String,
    pub data: Option<serde_json::Value>,
}

/// API response shape.
#[derive(Debug, Serialize)]
pub struct BackgroundTaskResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub task_type: String,
    pub status: String,
    pub data: Option<serde_json::Value>,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub progress: i16,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
}

impl BackgroundTask {
    pub fn to_response(self) -> BackgroundTaskResponse {
        BackgroundTaskResponse {
            id: self.id,
            customer_id: self.customer_id,
            task_type: self.task_type,
            status: self.status,
            data: self.data,
            result: self.result,
            error: self.error,
            progress: self.progress.unwrap_or(0),
            created_at: self.created_at,
            started_at: self.started_at,
            finished_at: self.finished_at,
        }
    }
}
