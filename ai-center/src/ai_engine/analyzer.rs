use anyhow::Result;
use sqlx::PgPool;

use super::mimo::MiMoClient;
use super::openai::OpenAIClient;

/// Ana AI analiz motoru — MiMo ve OpenAI'ı birlikte kullanır
///
/// ## Yapılandırma Gereken API Key'ler
///
/// | API Key | Ortam Değişkeni | Nereden Alınır | Ne İçin |
/// |---------|----------------|----------------|---------|
/// | MiMo | `MIMO_API_KEY` | https://mimo.xiaomi.com | Log analizi, anomali tespiti |
/// | OpenAI | `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Kod inceleme, fix önerisi |
///
/// Her ikisi de opsiyonel. Birisi yoksa diğeri kullanılır.
/// İkisi de yoksa kural tabanlı analiz devam eder.

pub struct AiAnalyzer {
    mimo: Option<MiMoClient>,
    openai: Option<OpenAIClient>,
}

impl AiAnalyzer {
    pub fn from_env() -> Self {
        let mimo = std::env::var("MIMO_API_KEY")
            .ok()
            .filter(|k| !k.is_empty() && k != "your-mimo-api-key-here")
            .map(MiMoClient::new);

        let openai = std::env::var("OPENAI_API_KEY")
            .ok()
            .filter(|k| !k.is_empty() && k != "your-openai-api-key-here")
            .map(OpenAIClient::new);

        if mimo.is_some() {
            tracing::info!("✅ MiMo AI entegrasyonu aktif");
        } else {
            tracing::warn!("⚠️ MiMo API key tanımlanmamış (MIMO_API_KEY)");
        }

        if openai.is_some() {
            tracing::info!("✅ OpenAI entegrasyonu aktif");
        } else {
            tracing::warn!("⚠️ OpenAI API key tanımlanmamış (OPENAI_API_KEY)");
        }

        Self { mimo, openai }
    }

    /// Her iki AI'ın aktif olup olmadığını kontrol et
    pub fn status(&self) -> (&str, &str) {
        let mimo_status = if self.mimo.is_some() { "aktif" } else { "pasif" };
        let openai_status = if self.openai.is_some() { "aktif" } else { "pasif" };
        (mimo_status, openai_status)
    }

    /// Log analizi — MiMo varsa onu kullan, yoksa OpenAI
    pub async fn analyze_logs(&self, logs: &str) -> Result<String> {
        if let Some(ref mimo) = self.mimo {
            return mimo.analyze_logs(logs).await;
        }
        if let Some(ref openai) = self.openai {
            return openai.review_code(logs).await;
        }
        Ok(r#"{"status": "ai_disabled", "message": "AI API key tanımlanmamış, kural tabanlı analiz kullanılıyor"}"#.to_string())
    }

    /// Anomali tespiti — MiMo tercih edilir
    pub async fn detect_anomaly(&self, metrics: &str) -> Result<String> {
        if let Some(ref mimo) = self.mimo {
            return mimo.detect_anomaly(metrics).await;
        }
        if let Some(ref openai) = self.openai {
            let system = "Verilen metrikleri analiz et, anomali varsa tespit et. JSON yanıt ver.";
            return openai.review_code(&format!("METRIKLER:\n{}", metrics)).await;
        }
        Ok(r#"{"status": "ai_disabled"}"#.to_string())
    }

    /// Hata düzeltme önerisi — OpenAI tercih edilir
    pub async fn suggest_fix(&self, error: &str, context: &str) -> Result<String> {
        if let Some(ref openai) = self.openai {
            return openai.generate_fix(error, context).await;
        }
        if let Some(ref mimo) = self.mimo {
            return mimo.suggest_fix(error).await;
        }
        Ok(r#"{"status": "ai_disabled"}"#.to_string())
    }

    /// Güvenlik tehdidi analizi
    pub async fn analyze_threat(&self, traffic: &str) -> Result<String> {
        if let Some(ref mimo) = self.mimo {
            return mimo.analyze_threat(traffic).await;
        }
        if let Some(ref openai) = self.openai {
            let system = "Trafik verisini analiz et, güvenlik tehditlerini tespit et. JSON yanıt ver.";
            return openai.review_code(&format!("TRAFIK:\n{}", traffic)).await;
        }
        Ok(r#"{"status": "ai_disabled"}"#.to_string())
    }

    /// Sağlık raporu oluştur
    pub async fn health_report(&self, stats: &str) -> Result<String> {
        if let Some(ref mimo) = self.mimo {
            return mimo.health_report(stats).await;
        }
        if let Some(ref openai) = self.openai {
            let system = "Sistem istatistiklerini analiz et, sağlık raporu oluştur. JSON yanıt ver.";
            return openai.summarize_events(stats).await;
        }
        Ok(r#"{"status": "ai_disabled"}"#.to_string())
    }

    /// Doğal dil komutu yorumla — OpenAI tercih edilir
    pub async fn interpret_command(&self, command: &str) -> Result<String> {
        if let Some(ref openai) = self.openai {
            return openai.interpret_command(command).await;
        }
        if let Some(ref mimo) = self.mimo {
            let system = "Kullanıcı komutunu JSON aksiyonuna çevir. Örnek: {\"action\": \"block_ip\", \"ip\": \"1.2.3.4\"}";
            return mimo.analyze_logs(&format!("KOMUT: {}", command)).await;
        }
        Ok(r#"{"status": "ai_disabled"}"#.to_string())
    }
}
