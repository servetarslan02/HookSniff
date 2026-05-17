use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{Integration, IntegrationIn, IntegrationUpdate, IntegrationEvent, IntegrationStats, IntegrationTestResponse};

pub struct IntegrationApi<'a> { client: &'a HookSniffHttpClient }

impl<'a> IntegrationApi<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self { Self { client } }

    pub async fn list(&self) -> Result<Vec<Integration>, Error> {
        self.client.get("/api/v1/integrations").await
    }

    pub async fn get(&self, id: &str) -> Result<Integration, Error> {
        self.client.get(&format!("/api/v1/integrations/{}", id)).await
    }

    pub async fn create(&self, body: &IntegrationIn) -> Result<Integration, Error> {
        self.client.post("/api/v1/integrations", body).await
    }

    pub async fn update(&self, id: &str, body: &IntegrationUpdate) -> Result<Integration, Error> {
        self.client.put(&format!("/api/v1/integrations/{}", id), body).await
    }

    pub async fn delete(&self, id: &str) -> Result<(), Error> {
        self.client.delete(&format!("/api/v1/integrations/{}", id)).await
    }

    pub async fn test(&self, id: &str) -> Result<IntegrationTestResponse, Error> {
        self.client.post(&format!("/api/v1/integrations/{}/test", id), &()).await
    }

    pub async fn list_events(&self, id: &str) -> Result<Vec<IntegrationEvent>, Error> {
        self.client.get(&format!("/api/v1/integrations/{}/events", id)).await
    }

    pub async fn get_stats(&self, id: &str) -> Result<IntegrationStats, Error> {
        self.client.get(&format!("/api/v1/integrations/{}/stats", id)).await
    }
}
