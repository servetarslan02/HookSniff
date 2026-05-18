/*
 * Environment API for HookSniff
 */

use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::{
    EnvironmentIn, EnvironmentModelOut, EnvironmentPatch, EnvironmentVariableBulkUpsertIn,
    EnvironmentVariableIn, EnvironmentVariableOut,
};

pub struct Environment<'a> {
    client: &'a HookSniffHttpClient,
}

impl<'a> Environment<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self {
        Self { client }
    }

    pub async fn list(&self) -> Result<Vec<EnvironmentModelOut>, Error> {
        self.client.get("/api/v1/environments").await
    }

    pub async fn create(&self, body: &EnvironmentIn) -> Result<EnvironmentModelOut, Error> {
        self.client.post("/api/v1/environments", body).await
    }

    pub async fn get(&self, environment_id: &str) -> Result<EnvironmentModelOut, Error> {
        let path = format!("/api/v1/environments/{}", environment_id);
        self.client.get(&path).await
    }

    pub async fn update(
        &self,
        environment_id: &str,
        body: &EnvironmentPatch,
    ) -> Result<EnvironmentModelOut, Error> {
        let path = format!("/api/v1/environments/{}", environment_id);
        self.client.put(&path, body).await
    }

    pub async fn delete(&self, environment_id: &str) -> Result<(), Error> {
        let path = format!("/api/v1/environments/{}", environment_id);
        self.client.delete(&path).await
    }

    pub async fn list_variables(
        &self,
        environment_id: &str,
    ) -> Result<Vec<EnvironmentVariableOut>, Error> {
        let path = format!("/api/v1/environments/{}/variables", environment_id);
        self.client.get(&path).await
    }

    pub async fn get_variable(
        &self,
        environment_id: &str,
        variable_id: &str,
    ) -> Result<EnvironmentVariableOut, Error> {
        let path = format!(
            "/api/v1/environments/{}/variables/{}",
            environment_id, variable_id
        );
        self.client.get(&path).await
    }

    pub async fn create_variable(
        &self,
        environment_id: &str,
        body: &EnvironmentVariableIn,
    ) -> Result<EnvironmentVariableOut, Error> {
        let path = format!("/api/v1/environments/{}/variables", environment_id);
        self.client.post(&path, body).await
    }

    pub async fn update_variable(
        &self,
        environment_id: &str,
        variable_id: &str,
        body: &EnvironmentVariableIn,
    ) -> Result<EnvironmentVariableOut, Error> {
        let path = format!(
            "/api/v1/environments/{}/variables/{}",
            environment_id, variable_id
        );
        self.client.put(&path, body).await
    }

    pub async fn delete_variable(
        &self,
        environment_id: &str,
        variable_id: &str,
    ) -> Result<(), Error> {
        let path = format!(
            "/api/v1/environments/{}/variables/{}",
            environment_id, variable_id
        );
        self.client.delete(&path).await
    }

    pub async fn bulk_upsert_variables(
        &self,
        environment_id: &str,
        body: &EnvironmentVariableBulkUpsertIn,
    ) -> Result<Vec<EnvironmentVariableOut>, Error> {
        let path = format!("/api/v1/environments/{}/variables/bulk", environment_id);
        self.client.post(&path, body).await
    }
}
