use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{InboundConfig, InboundConfigIn};

pub struct Inbound<'a> { client: &'a HookSniffHttpClient }

impl<'a> Inbound<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self { Self { client } }

    pub async fn list_configs(&self) -> Result<Vec<InboundConfig>, Error> {
        self.client.get("/api/v1/inbound/configs").await
    }

    pub async fn create_config(&self, body: &InboundConfigIn) -> Result<InboundConfig, Error> {
        self.client.post("/api/v1/inbound/configs", body).await
    }

    pub async fn update_config(&self, id: &str, body: &InboundConfigIn) -> Result<InboundConfig, Error> {
        self.client.put(&format!("/api/v1/inbound/configs/{}", id), body).await
    }

    pub async fn delete_config(&self, id: &str) -> Result<(), Error> {
        self.client.delete(&format!("/api/v1/inbound/configs/{}", id)).await
    }
}
