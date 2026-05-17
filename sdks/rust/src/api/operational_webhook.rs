use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{OperationalWebhookDeliveryOut, OperationalWebhookEndpointIn, OperationalWebhookEndpointOut};

pub struct OperationalWebhook<'a> { client: &'a HookSniffHttpClient }

impl<'a> OperationalWebhook<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self { Self { client } }

    pub async fn list(&self) -> Result<Vec<OperationalWebhookEndpointOut>, Error> {
        self.client.get("/api/v1/operational-webhooks").await
    }
    pub async fn create(&self, body: &OperationalWebhookEndpointIn) -> Result<OperationalWebhookEndpointOut, Error> {
        self.client.post("/api/v1/operational-webhooks", body).await
    }
    pub async fn get(&self, id: &str) -> Result<OperationalWebhookEndpointOut, Error> {
        self.client.get(&format!("/api/v1/operational-webhooks/{}", id)).await
    }
    pub async fn update(&self, id: &str, body: &OperationalWebhookEndpointIn) -> Result<OperationalWebhookEndpointOut, Error> {
        self.client.put(&format!("/api/v1/operational-webhooks/{}", id), body).await
    }
    pub async fn delete(&self, id: &str) -> Result<(), Error> {
        self.client.delete(&format!("/api/v1/operational-webhooks/{}", id)).await
    }
    pub async fn list_deliveries(&self, id: &str) -> Result<Vec<OperationalWebhookDeliveryOut>, Error> {
        self.client.get(&format!("/api/v1/operational-webhooks/{}/deliveries", id)).await
    }
}
