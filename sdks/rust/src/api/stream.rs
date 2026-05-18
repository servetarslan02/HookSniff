use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{StreamChannel, StreamChannelIn, StreamChannelUpdate, StreamChannelDetail, StreamMessage, StreamSubscription, PublishEventIn, PublishEventResponse};

pub struct StreamApi<'a> { client: &'a HookSniffHttpClient }

impl<'a> StreamApi<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self { Self { client } }

    pub async fn list_channels(&self) -> Result<Vec<StreamChannel>, Error> {
        self.client.get("/api/v1/stream/channels").await
    }

    pub async fn get_channel(&self, id: &str) -> Result<StreamChannelDetail, Error> {
        self.client.get(&format!("/api/v1/stream/channels/{}", id)).await
    }

    pub async fn create_channel(&self, body: &StreamChannelIn) -> Result<StreamChannel, Error> {
        self.client.post("/api/v1/stream/channels", body).await
    }

    pub async fn update_channel(&self, id: &str, body: &StreamChannelUpdate) -> Result<StreamChannel, Error> {
        self.client.put(&format!("/api/v1/stream/channels/{}", id), body).await
    }

    pub async fn delete_channel(&self, id: &str) -> Result<(), Error> {
        self.client.delete(&format!("/api/v1/stream/channels/{}", id)).await
    }

    pub async fn list_messages(&self, id: &str) -> Result<Vec<StreamMessage>, Error> {
        self.client.get(&format!("/api/v1/stream/channels/{}/messages", id)).await
    }

    pub async fn list_subscriptions(&self) -> Result<Vec<StreamSubscription>, Error> {
        self.client.get("/api/v1/stream/subscriptions").await
    }

    pub async fn disconnect_subscription(&self, id: &str) -> Result<(), Error> {
        self.client.delete(&format!("/api/v1/stream/subscriptions/{}", id)).await
    }

    pub async fn publish(&self, body: &PublishEventIn) -> Result<PublishEventResponse, Error> {
        self.client.post("/api/v1/stream/publish", body).await
    }
}
