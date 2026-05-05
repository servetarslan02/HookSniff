use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::provider::{AiCapability, AiProvider, ProviderStatus};

/// OpenAI Provider
/// Kod inceleme, fix önerisi, doğal dil komutu için optimize edilmiş
///
/// ## API Key
/// Ortam değişkeni: `OPENAI_API_KEY`
/// https://platform.openai.com/api-keys

#[derive(Debug, Clone)]
pub struct OpenAiProvider {
    api_key: String,
    base_url: String,
    model: String,
    http_client: reqwest::Client,
    enabled: bool,
}

#[derive(Debug, Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Debug, Deserialize)]
struct OpenAIChoice {
    message: OpenAIMessage,
}

impl OpenAiProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-4o-mini".to_string(),
            http_client: reqwest::Client::new(),
            enabled: true,
        }
    }

    pub fn from_env() -> Option<Self> {
        std::env::var("OPENAI_API_KEY")
            .ok()
            .filter(|k| !k.is_empty() && k != "your-openai-api-key-here")
            .map(Self::new)
    }

    pub fn with_model(mut self, model: &str) -> Self {
        self.model = model.to_string();
        self
    }
}

#[async_trait]
impl AiProvider for OpenAiProvider {
    fn name(&self) -> &str {
        "openai"
    }

    fn capabilities(&self) -> Vec<AiCapability> {
        vec![
            AiCapability::CodeReview,
            AiCapability::CodeGeneration,
            AiCapability::CommandInterpretation,
            AiCapability::ReportGeneration,
            AiCapability::LogAnalysis,
            AiCapability::AnomalyDetection,
            AiCapability::ThreatAnalysis,
            AiCapability::General,
        ]
    }

    fn is_available(&self) -> bool {
        self.enabled
    }

    fn status(&self) -> ProviderStatus {
        ProviderStatus {
            name: "openai".to_string(),
            enabled: self.enabled,
            capabilities: self.capabilities(),
            requests_today: 0,
            avg_latency_ms: 0,
            error_rate: 0.0,
            last_error: None,
        }
    }

    async fn chat(&self, system_prompt: &str, user_prompt: &str) -> Result<String> {
        let request = OpenAIRequest {
            model: self.model.clone(),
            messages: vec![
                OpenAIMessage {
                    role: "system".to_string(),
                    content: system_prompt.to_string(),
                },
                OpenAIMessage {
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
            anyhow::bail!("OpenAI API hatası: {} - {}", status, body);
        }

        let result: OpenAIResponse = response.json().await?;
        Ok(result
            .choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default())
    }

    async fn review_code(&self, code: &str) -> Result<String> {
        let system = r#"Sen bir Rust kod inceleme uzmanısın.
Verilen kodu incele ve şunları tespit et:
1. Hatalar ve potansiyel sorunlar
2. Güvenlik açıkları
3. Performans sorunları
4. Kod kalitesi sorunları

JSON formatında yanıt ver:
{
  "issues": [{"line": N, "severity": "...", "type": "...", "description": "...", "fix": "..."}],
  "overall_quality": "good|needs_improvement|poor",
  "security_risks": ["..."]
}"#;

        self.chat(system, code).await
    }

    async fn generate_fix(&self, error: &str, context: &str) -> Result<String> {
        let system = r#"Sen bir Rust geliştiricisisin.
Verilen hata ve bağlam için çalışan bir düzeltme kodu oluştur.
Sadece düzeltilmiş kodu ve kısa bir açıklama döndür.

JSON formatında yanıt ver:
{
  "fix_code": "...",
  "explanation": "...",
  "risk_level": "low|medium|high",
  "tests_suggested": ["..."]
}"#;

        let prompt = format!("HATA:\n{}\n\nBAĞLAM:\n{}", error, context);
        self.chat(system, &prompt).await
    }

    async fn interpret_command(&self, command: &str) -> Result<String> {
        let system = r#"Sen HookRelay AI merkezi komut yorumlayıcısısın.
Kullanıcının doğal dil komutunu al ve bir JSON aksiyonuna çevir.

Desteklenen aksiyonlar:
- block_ip: {"action": "block_ip", "ip": "...", "duration_minutes": N, "reason": "..."}
- block_customer: {"action": "block_customer", "customer_id": "...", "duration_minutes": N, "reason": "..."}
- disable_endpoint: {"action": "disable_endpoint", "endpoint_id": "...", "reason": "..."}
- enable_endpoint: {"action": "enable_endpoint", "endpoint_id": "..."}
- adjust_retry: {"action": "adjust_retry", "endpoint_id": "...", "max_attempts": N, "backoff": "..."}
- get_report: {"action": "get_report", "type": "health|risk|traffic|summary"}
- get_status: {"action": "get_status"}

JSON formatında yanıt ver:"#;

        self.chat(system, command).await
    }

    async fn generate_report(&self, data: &str) -> Result<String> {
        let system = r#"Sen HookRelay için bir olay özet uzmanısın.
Verilen olayları analiz et ve kısa bir özet rapor oluştur:
- En önemli 3 olay
- Genel sistem durumu
- Acil aksiyon gereken durumlar
- Trend analizi

JSON formatında yanıt ver:
{
  "summary": "...",
  "top_events": [...],
  "system_health": "good|warning|critical",
  "urgent_actions": ["..."],
  "trends": ["..."]
}"#;

        self.chat(system, data).await
    }
}
