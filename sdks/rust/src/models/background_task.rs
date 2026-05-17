use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BackgroundTaskOut {
    pub id: String,
    #[serde(rename = "customerId")]
    pub customer_id: String,
    #[serde(rename = "taskType")]
    pub task_type: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Option<HashMap<String, serde_json::Value>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Option<HashMap<String, serde_json::Value>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<Option<String>>,
    pub progress: i16,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "startedAt", skip_serializing_if = "Option::is_none")]
    pub started_at: Option<Option<String>>,
    #[serde(rename = "finishedAt", skip_serializing_if = "Option::is_none")]
    pub finished_at: Option<Option<String>>,
}
