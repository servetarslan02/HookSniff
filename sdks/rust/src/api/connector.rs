use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{Connector, ConnectorConfig, ConnectorConfigIn};

pub struct ConnectorApi<'a> { client: &'a HookSniffHttpClient }

impl<'a> ConnectorApi<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self { Self { client } }

    pub async fn list(&self) -> Result<Vec<Connector>, Error> {
        self.client.get("/api/v1/connectors").await
    }

    pub async fn get(&self, id: &str) -> Result<Connector, Error> {
        self.client.get(&format!("/api/v1/connectors/{}", id)).await
    }

    pub async fn list_configs(&self) -> Result<Vec<ConnectorConfig>, Error> {
        self.client.get("/api/v1/connectors/configs").await
    }

    pub async fn create_config(&self, body: &ConnectorConfigIn) -> Result<ConnectorConfig, Error> {
        self.client.post("/api/v1/connectors/configs", body).await
    }

    pub async fn update_config(&self, id: &str, body: &ConnectorConfigIn) -> Result<ConnectorConfig, Error> {
        self.client.put(&format!("/api/v1/connectors/configs/{}", id), body).await
    }

    pub async fn delete_config(&self, id: &str) -> Result<(), Error> {
        self.client.delete(&format!("/api/v1/connectors/configs/{}", id)).await
    }
}
