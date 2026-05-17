use std::time::Duration;

use hooksniff::api::{HookSniff, HookSniffOptions};

pub struct TestClient {
    pub client: HookSniff,
}

pub struct TestClientBuilder {
    token: Option<String>,
    url: Option<String>,
    retries: Option<u32>,
    retry_schedule: Option<Vec<Duration>>,
}

impl TestClientBuilder {
    pub fn new() -> Self {
        Self {
            token: None,
            url: None,
            retries: None,
            retry_schedule: None,
        }
    }

    #[allow(unused)]
    pub fn token(mut self, token: String) -> Self {
        self.token = Some(token);
        self
    }

    pub fn url(mut self, url: String) -> Self {
        self.url = Some(url);
        self
    }

    pub fn retries(mut self, retries: u32) -> Self {
        self.retries = Some(retries);
        self
    }

    pub fn retry_schedule(mut self, retry_schedule: Vec<Duration>) -> Self {
        self.retry_schedule = Some(retry_schedule);
        self
    }

    pub fn build(self) -> TestClient {
        let token = self.token.unwrap_or_else(|| {
            std::env::var("HOOKSNIFF_TOKEN").expect("HOOKSNIFF_TOKEN is required to run this test")
        });
        let url = self.url.unwrap_or_else(|| {
            std::env::var("HOOKSNIFF_SERVER_URL").expect("HOOKSNIFF_SERVER_URL is required to run this test")
        });
        let client = HookSniff::new(
            token.clone(),
            Some(HookSniffOptions {
                server_url: Some(url.clone()),
                num_retries: self.retries,
                retry_schedule: self.retry_schedule,
                ..Default::default()
            }),
        );

        TestClient { client }
    }
}
