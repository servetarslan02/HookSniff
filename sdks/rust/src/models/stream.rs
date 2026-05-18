use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChannel {
    pub id: String,
    pub customer_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub channel_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_filter: Option<Vec<String>>,
    pub enabled: bool,
    pub max_subscribers: i32,
    pub current_subscribers: i32,
    pub total_messages: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChannelDetail {
    #[serde(flatten)]
    pub channel: StreamChannel,
    pub recent_messages: Vec<StreamMessage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamMessage {
    pub id: String,
    pub channel_id: String,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub delivered_count: i32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamSubscription {
    pub id: String,
    pub channel_id: String,
    pub customer_id: String,
    pub connection_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_filter: Option<Vec<String>>,
    pub connected_at: String,
    pub last_heartbeat_at: String,
    pub messages_sent: i64,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChannelIn {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub channel_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_filter: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_subscribers: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChannelUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event_filter: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_subscribers: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishEventIn {
    pub channel_id: String,
    pub event_type: String,
    pub payload: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishEventResponse {
    pub success: bool,
    pub message_id: String,
    pub delivered_to: i32,
}
