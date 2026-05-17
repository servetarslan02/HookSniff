use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{MessagePollerPollResponse, MessagePollerCursorResponse, MessagePollerCommitResponse};

pub struct MessagePoller<'a> { client: &'a HookSniffHttpClient }

impl<'a> MessagePoller<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self { Self { client } }

    /// Poll for new messages since the consumer's cursor.
    pub async fn poll(&self, consumer_id: &str, limit: Option<i32>, endpoint_id: Option<&str>, event_type: Option<&str>, include_payload: Option<bool>) -> Result<MessagePollerPollResponse, Error> {
        let mut path = format!("/api/v1/message-poller/poll?consumer_id={}", consumer_id);
        if let Some(l) = limit { path += &format!("&limit={}", l); }
        if let Some(ep) = endpoint_id { path += &format!("&endpoint_id={}", ep); }
        if let Some(et) = event_type { path += &format!("&event_type={}", et); }
        if let Some(ip) = include_payload { path += &format!("&include_payload={}", ip); }
        self.client.get(&path).await
    }

    /// Seek cursor to a specific message.
    pub async fn seek(&self, consumer_id: &str, message_id: &str, endpoint_id: Option<&str>) -> Result<MessagePollerCursorResponse, Error> {
        let mut body = serde_json::json!({
            "consumer_id": consumer_id,
            "message_id": message_id,
        });
        if let Some(ep) = endpoint_id { body["endpoint_id"] = serde_json::json!(ep); }
        self.client.post("/api/v1/message-poller/seek", &body).await
    }

    /// Commit cursor — advance past a processed message.
    pub async fn commit(&self, consumer_id: &str, message_id: &str, endpoint_id: Option<&str>) -> Result<MessagePollerCommitResponse, Error> {
        let mut body = serde_json::json!({
            "consumer_id": consumer_id,
            "message_id": message_id,
        });
        if let Some(ep) = endpoint_id { body["endpoint_id"] = serde_json::json!(ep); }
        self.client.post("/api/v1/message-poller/commit", &body).await
    }
}
