use anyhow::Result;
use serde::{Deserialize, Serialize};

/// MiMo AI API entegrasyonu
/// Log analizi, anomali tespiti, ses/görsel analiz için kullanılır
///
/// ## API Key Ayarı
/// Ortam değişkeni: `MIMO_API_KEY`
/// MiMo konsolundan alabilirsin: https://mimo.xiaomi.com

#[derive(Debug, Clone)]
pub struct MiMoClient {
    api_key: String,
    base_url: String,
    http_client: reqwest::Client,
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

impl MiMoClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://api.mimo.xiaomi.com/v1".to_string(),
            http_client: reqwest::Client::new(),
        }
    }

    /// MiMo API'ye istek gönder
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

    /// Log analizi yap — hata paternlerini tespit et
    pub async fn analyze_logs(&self, logs: &str) -> Result<String> {
        let system = r#"Sen HookRelay webhook servisi için bir log analiz uzmanısın.
Verilen logları analiz et ve şunları belirle:
1. Hata paternleri (tekrarlayan hatalar)
2. Anormal davranışlar
3. Performans sorunları
4. Güvenlik tehditleri
5. Önerilen aksiyonlar

JSON formatında yanıt ver:"#;

        self.chat(system, logs).await
    }

    /// Anomali tespiti yap
    pub async fn detect_anomaly(&self, metrics: &str) -> Result<String> {
        let system = r#"Sen bir anomali tespit uzmanısın.
Verilen metrikleri analiz et ve anormal durumları tespit et.
Normal aralık dışı değerleri, trend değişimlerini ve spike'ları belirle.
JSON formatında yanıt ver:"#;

        self.chat(system, metrics).await
    }

    /// Hata düzeltme önerisi ver
    pub async fn suggest_fix(&self, error_description: &str) -> Result<String> {
        let system = r#"Sen HookRelay webhook servisi için bir hata düzeltme uzmanısın.
Verilen hata için somut düzeltme önerileri sun.
Her öneri için:
- Ne yapılmalı
- Neden yapılmalı
- Risk seviyesi (düşük/orta/yüksek)
JSON formatında yanıt ver:"#;

        self.chat(system, error_description).await
    }

    /// Güvenlik tehdidi analizi yap
    pub async fn analyze_threat(&self, traffic_data: &str) -> Result<String> {
        let system = r#"Sen bir siber güvenlik uzmanısın.
Verilen trafik verisini analiz et ve potansiyel tehditleri tespit et:
- DDoS saldırıları
- Injection denemeleri
- Anormal trafik paternleri
- Brute force denemeleri
JSON formatında yanıt ver:"#;

        self.chat(system, traffic_data).await
    }

    /// Webhook sağlık raporu oluştur
    pub async fn health_report(&self, stats: &str) -> Result<String> {
        let system = r#"Sen HookRelay için bir sistem sağlık analistisin.
Verilen istatistikleri analiz et ve bir sağlık raporu oluştur:
- Genel durum (iyi/uyarı/kritik)
- Sorunlu alanlar
- İyileştirme önerileri
- Tahmini kapasite kullanımı
JSON formatında yanıt ver:"#;

        self.chat(system, stats).await
    }
}
