use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::provider::{AiCapability, AiProvider, ProviderStatus};

/// MiMo AI Provider
/// Log analizi, anomali tespiti, güvenlik analizi için optimize edilmiş
///
/// ## API Key
/// Ortam değişkeni: `MIMO_API_KEY`
/// https://mimo.xiaomi.com

#[derive(Debug, Clone)]
pub struct MiMoProvider {
    api_key: String,
    base_url: String,
    http_client: reqwest::Client,
    enabled: bool,
}

#[derive(Debug, Serialize)]
struct MiMoRequest {
    model: String,
    messages: Vec<MiMoMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct MiMoMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct MiMoResponse {
    choices: Vec<MiMoChoice>,
}

#[derive(Debug, Deserialize)]
struct MiMoChoice {
    message: MiMoMessage,
}

impl MiMoProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://api.mimo.xiaomi.com/v1".to_string(),
            http_client: reqwest::Client::new(),
            enabled: true,
        }
    }

    pub fn from_env() -> Option<Self> {
        std::env::var("MIMO_API_KEY")
            .ok()
            .filter(|k| !k.is_empty() && k != "your-mimo-api-key-here")
            .map(Self::new)
    }
}

#[async_trait]
impl AiProvider for MiMoProvider {
    fn name(&self) -> &str {
        "mimo"
    }

    fn capabilities(&self) -> Vec<AiCapability> {
        vec![
            AiCapability::LogAnalysis,
            AiCapability::AnomalyDetection,
            AiCapability::ThreatAnalysis,
            AiCapability::ReportGeneration,
            AiCapability::General,
        ]
    }

    fn is_available(&self) -> bool {
        self.enabled
    }

    fn status(&self) -> ProviderStatus {
        ProviderStatus {
            name: "mimo".to_string(),
            enabled: self.enabled,
            capabilities: self.capabilities(),
            requests_today: 0, // TODO: track
            avg_latency_ms: 0,
            error_rate: 0.0,
            last_error: None,
        }
    }

    async fn chat(&self, system_prompt: &str, user_prompt: &str) -> Result<String> {
        let request = MiMoRequest {
            model: "mimo-v2.5-pro".to_string(),
            messages: vec![
                MiMoMessage {
                    role: "system".to_string(),
                    content: system_prompt.to_string(),
                },
                MiMoMessage {
                    role: "user".to_string(),
                    content: user_prompt.to_string(),
                },
            ],
            max_tokens: 4096,
            temperature: 0.3,
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
            anyhow::bail!("MiMo API hatası: {} - {}", status, body);
        }

        let result: MiMoResponse = response.json().await?;
        Ok(result
            .choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default())
    }

    async fn analyze_logs(&self, logs: &str) -> Result<String> {
        let system = r#"Sen HookRelay webhook servisi için bir log analiz uzmanısın.
Verilen logları analiz et ve şunları belirle:
1. Hata paternleri (tekrarlayan hatalar)
2. Anormal davranışlar
3. Performans sorunları
4. Güvenlik tehditleri
5. Önerilen aksiyonlar

JSON formatında yanıt ver:
{
  "issues": [{"type": "...", "severity": "...", "description": "...", "count": N}],
  "overall_severity": "low|medium|high|critical",
  "recommendations": ["..."],
  "patterns_found": ["..."]
}"#;

        self.chat(system, logs).await
    }

    async fn detect_anomaly(&self, metrics: &str) -> Result<String> {
        let system = r#"Sen bir anomali tespit uzmanısın.
Verilen metrikleri analiz et ve anormal durumları tespit et.
Normal aralık dışı değerleri, trend değişimlerini ve spike'ları belirle.

JSON formatında yanıt ver:
{
  "anomalies": [{"metric": "...", "value": N, "expected_range": [N, N], "severity": "..."}],
  "trend_changes": ["..."],
  "spikes_detected": ["..."]
}"#;

        self.chat(system, metrics).await
    }

    async fn analyze_threat(&self, traffic: &str) -> Result<String> {
        let system = r#"Sen bir siber güvenlik uzmanısın.
Verilen trafik verisini analiz et ve potansiyel tehditleri tespit et:
- DDoS saldırıları
- Injection denemeleri
- Anormal trafik paternleri
- Brute force denemeleri

JSON formatında yanıt ver:
{
  "threats": [{"type": "...", "severity": "...", "source": "...", "description": "..."}],
  "recommended_actions": ["..."],
  "overall_risk": "low|medium|high|critical"
}"#;

        self.chat(system, traffic).await
    }
}
