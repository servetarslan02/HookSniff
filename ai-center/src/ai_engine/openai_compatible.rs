use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::provider::{AiCapability, AiProvider, ProviderStatus};

/// Shared request/response types for OpenAI-compatible APIs.
/// Used by Groq, Cerebras, OpenRouter, and any future provider
/// that exposes an OpenAI-compatible chat completions endpoint.

#[derive(Debug, Serialize)]
pub struct CompatRequest {
    pub model: String,
    pub messages: Vec<CompatMessage>,
    pub max_tokens: u32,
    pub temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct CompatResponse {
    pub choices: Vec<CompatChoice>,
}

#[derive(Debug, Deserialize)]
pub struct CompatChoice {
    pub message: CompatMessage,
}

/// A generic provider for any OpenAI-compatible chat API.
/// Configure with base_url, model, api_key, name, and capabilities.
#[derive(Debug, Clone)]
pub struct OpenAiCompatibleProvider {
    pub name: String,
    pub api_key: String,
    pub base_url: String,
    pub model: String,
    pub capabilities: Vec<AiCapability>,
    pub http_client: reqwest::Client,
    pub enabled: bool,
}

impl OpenAiCompatibleProvider {
    pub fn new(
        name: &str,
        api_key: String,
        base_url: &str,
        model: &str,
        capabilities: Vec<AiCapability>,
    ) -> Self {
        Self {
            name: name.to_string(),
            api_key,
            base_url: base_url.to_string(),
            model: model.to_string(),
            capabilities,
            http_client: reqwest::Client::new(),
            enabled: true,
        }
    }

    /// Try to load from env. Returns None if the API key env var is missing or empty.
    pub fn from_env(
        env_var: &str,
        name: &str,
        base_url: &str,
        model: &str,
        capabilities: Vec<AiCapability>,
    ) -> Option<Self> {
        std::env::var(env_var)
            .ok()
            .filter(|k| !k.is_empty() && !k.starts_with("your-"))
            .map(|key| Self::new(name, key, base_url, model, capabilities))
    }
}

#[async_trait]
impl AiProvider for OpenAiCompatibleProvider {
    fn name(&self) -> &str {
        &self.name
    }

    fn capabilities(&self) -> Vec<AiCapability> {
        self.capabilities.clone()
    }

    fn is_available(&self) -> bool {
        self.enabled
    }

    fn status(&self) -> ProviderStatus {
        ProviderStatus {
            name: self.name.clone(),
            enabled: self.enabled,
            capabilities: self.capabilities(),
            requests_today: 0,
            avg_latency_ms: 0,
            error_rate: 0.0,
            last_error: None,
        }
    }

    async fn chat(&self, system_prompt: &str, user_prompt: &str) -> Result<String> {
        let request = CompatRequest {
            model: self.model.clone(),
            messages: vec![
                CompatMessage {
                    role: "system".to_string(),
                    content: system_prompt.to_string(),
                },
                CompatMessage {
                    role: "user".to_string(),
                    content: user_prompt.to_string(),
                },
            ],
            max_tokens: 4096,
            temperature: 0.2,
        };

        let response = self
            .http_client
            .post(format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("{} API error: {} - {}", self.name, status, body);
        }

        let result: CompatResponse = response.json().await?;
        Ok(result
            .choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default())
    }
}
