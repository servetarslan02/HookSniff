use anyhow::Result;
use serde::{Deserialize, Serialize};

/// OpenAI API entegrasyonu
/// Kod inceleme, fix önerisi, doğal dil analizi için kullanılır
///
/// ## API Key Ayarı
/// Ortam değişkeni: `OPENAI_API_KEY`
/// OpenAI konsolundan alabilirsin: https://platform.openai.com/api-keys

#[derive(Debug, Clone)]
pub struct OpenAIClient {
    api_key: String,
    base_url: String,
    model: String,
    http_client: reqwest::Client,
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

impl OpenAIClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-4o-mini".to_string(),
            http_client: reqwest::Client::new(),
        }
    }

    pub fn with_model(mut self, model: &str) -> Self {
        self.model = model.to_string();
        self
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

    /// Kod inceleme yap — hataları ve güvenlik açıklarını tespit et
    pub async fn review_code(&self, code: &str) -> Result<String> {
        let system = r#"Sen bir Rust kod inceleme uzmanısın.
Verilen kodu incele ve şunları tespit et:
1. Hatalar ve potansiyel sorunlar
2. Güvenlik açıkları
3. Performans sorunları
4. Kod kalitesi sorunları
Her bulgu için: açıklama, ciddiyet (düşük/orta/yüksek/kritik), düzeltme önerisi
JSON formatında yanıt ver:"#;

        self.chat(system, code).await
    }

    /// Otomatik fix kodu oluştur
    pub async fn generate_fix(&self, error: &str, context: &str) -> Result<String> {
        let system = r#"Sen bir Rust geliştiricisisin.
Verilen hata ve bağlam için çalışan bir düzeltme kodu oluştur.
Sadece düzeltilmiş kodu ve kısa bir açıklama döndür.
JSON formatında yanıt ver: {"fix_code": "...", "explanation": "..."}"#;

        let prompt = format!("HATA:\n{}\n\nBAĞLAM:\n{}", error, context);
        self.chat(system, &prompt).await
    }

    /// Doğal dil komutunu aksiyona çevir
    pub async fn interpret_command(&self, command: &str) -> Result<String> {
        let system = r#"Sen HookRelay AI merkezi komut yorumlayıcısısın.
Kullanıcının doğal dil komutunu al ve bir JSON aksiyonuna çevir.
Örnek aksiyonlar:
- block_ip: {"action": "block_ip", "ip": "1.2.3.4", "duration_minutes": 60, "reason": "..."}
- adjust_retry: {"action": "adjust_retry", "endpoint_id": "...", "max_attempts": 5}
- disable_endpoint: {"action": "disable_endpoint", "endpoint_id": "...", "reason": "..."}
- get_report: {"action": "get_report", "type": "health|risk|traffic"}
JSON formatında yanıt ver:"#;

        self.chat(system, command).await
    }

    /// Olay özet raporu oluştur
    pub async fn summarize_events(&self, events: &str) -> Result<String> {
        let system = r#"Sen HookRelay için bir olay özet uzmanısın.
Verilen olayları analiz et ve kısa bir özet rapor oluştur:
- En önemli 3 olay
- Genel sistem durumu
- Acil aksiyon gereken durumlar
- Trend analizi
JSON formatında yanıt ver:"#;

        self.chat(system, events).await
    }
}
