use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolledMessage {
    pub id: String,
    pub endpoint_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_status: Option<i32>,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payload: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagePollerCursor {
    pub consumer_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_message_id: Option<String>,
    pub last_sequence_num: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagePollerPollResponse {
    pub messages: Vec<PolledMessage>,
    pub cursor: MessagePollerCursor,
    pub done: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagePollerCursorResponse {
    pub cursor: MessagePollerCursor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagePollerCommitResponse {
    pub cursor: MessagePollerCursor,
    pub committed: bool,
}
