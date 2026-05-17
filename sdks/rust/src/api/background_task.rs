use crate::api_internal::HookSniffHttpClient;
use crate::error::Error;
use crate::models::BackgroundTaskOut;

pub struct BackgroundTask<'a> {
    client: &'a HookSniffHttpClient,
}

impl<'a> BackgroundTask<'a> {
    pub fn new(client: &'a HookSniffHttpClient) -> Self {
        Self { client }
    }

    pub async fn list(&self) -> Result<Vec<BackgroundTaskOut>, Error> {
        self.client.get("/api/v1/background-tasks").await
    }

    pub async fn get(&self, task_id: &str) -> Result<BackgroundTaskOut, Error> {
        let path = format!("/api/v1/background-tasks/{}", task_id);
        self.client.get(&path).await
    }

    pub async fn cancel(&self, task_id: &str) -> Result<BackgroundTaskOut, Error> {
        let path = format!("/api/v1/background-tasks/{}", task_id);
        self.client.put(&path, &serde_json::json!({})).await
    }
}
