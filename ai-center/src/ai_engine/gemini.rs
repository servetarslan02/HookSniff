use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::provider::{AiCapability, AiProvider, ProviderStatus};

/// Google Gemini Provider
/// Uses Google's Generative AI API (https://generativelanguage.googleapis.com/v1beta)
///
/// ## API Key
/// Environment variable: `GEMINI_API_KEY`
/// https://aistudio.google.com/apikey

#[derive(Debug, Clone)]
pub struct GeminiProvider {
    api_key: String,
    http_client: reqwest::Client,
    enabled: bool,
}

#[derive(Debug, Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(rename = "generationConfig")]
    generation_config: GeminiGenerationConfig,
}

#[derive(Debug, Serialize)]
struct GeminiContent {
    role: String,
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Debug, Serialize)]
struct GeminiGenerationConfig {
    #[serde(rename = "maxOutputTokens")]
    max_output_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct GeminiResponse {
    candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    content: GeminiContentResponse,
}

#[derive(Debug, Deserialize)]
struct GeminiContentResponse {
    parts: Vec<GeminiPartResponse>,
}

#[derive(Debug, Deserialize)]
struct GeminiPartResponse {
    text: String,
}

impl GeminiProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            http_client: reqwest::Client::new(),
            enabled: true,
        }
    }

    pub fn from_env() -> Option<Self> {
        std::env::var("GEMINI_API_KEY")
            .ok()
            .filter(|k| !k.is_empty() && !k.starts_with("your-"))
            .map(Self::new)
    }

    fn api_url(&self) -> String {
        format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
            self.api_key
        )
    }
}

#[async_trait]
impl AiProvider for GeminiProvider {
    fn name(&self) -> &str {
        "gemini"
    }

    fn capabilities(&self) -> Vec<AiCapability> {
        vec![
            AiCapability::General,
            AiCapability::LogAnalysis,
            AiCapability::ReportGeneration,
        ]
    }

    fn is_available(&self) -> bool {
        self.enabled
    }

    fn status(&self) -> ProviderStatus {
        ProviderStatus {
            name: "gemini".to_string(),
            enabled: self.enabled,
            capabilities: self.capabilities(),
            requests_today: 0,
            avg_latency_ms: 0,
            error_rate: 0.0,
            last_error: None,
        }
    }

    async fn chat(&self, system_prompt: &str, user_prompt: &str) -> Result<String> {
        // Gemini API uses "contents" with roles "user" and "model".
        // System instructions go in the first user message.
        let combined_prompt = format!("{}\n\n{}", system_prompt, user_prompt);

        let request = GeminiRequest {
            contents: vec![GeminiContent {
                role: "user".to_string(),
                parts: vec![GeminiPart {
                    text: combined_prompt,
                }],
            }],
            generation_config: GeminiGenerationConfig {
                max_output_tokens: 4096,
                temperature: 0.2,
            },
        };

        let response = self
            .http_client
            .post(self.api_url())
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Gemini API error: {} - {}", status, body);
        }

        let result: GeminiResponse = response.json().await?;
        Ok(result
            .candidates
            .first()
            .and_then(|c| c.content.parts.first())
            .map(|p| p.text.clone())
            .unwrap_or_default())
    }
}
