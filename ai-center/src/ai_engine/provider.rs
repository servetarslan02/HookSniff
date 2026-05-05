use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Tüm AI sağlayıcıları için ortak trait
/// Yeni AI eklemek istersen bu trait'i implement et
///
/// ## Yeni AI Nasıl Eklenir
///
/// 1. Yeni bir dosya oluştur (örn: `gemini.rs`)
/// 2. Bu trait'i implement et
/// 3. `orchestrator.rs`'e ekle
/// 4. `.env`'ye API key ekle
///
/// Örnek:
/// ```rust
/// pub struct GeminiProvider { ... }
///
/// #[async_trait]
/// impl AiProvider for GeminiProvider {
///     fn name(&self) -> &str { "gemini" }
///     fn capabilities(&self) -> Vec<AiCapability> { vec![AiCapability::Analysis] }
///     async fn chat(&self, system: &str, user: &str) -> Result<String> { ... }
/// }
/// ```

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AiCapability {
    /// Log analizi, hata paterni tespiti
    LogAnalysis,
    /// Anomali tespiti, metrik analizi
    AnomalyDetection,
    /// Kod inceleme, hata bulma
    CodeReview,
    /// Otomatik fix kodu üretme
    CodeGeneration,
    /// Güvenlik tehdidi analizi
    ThreatAnalysis,
    /// Doğal dil komutu yorumlama
    CommandInterpretation,
    /// Rapor/özet oluşturma
    ReportGeneration,
    /// Genel sohbet/analiz
    General,
}

/// AI sağlayıcı durumu
#[derive(Debug, Clone, Serialize)]
pub struct ProviderStatus {
    pub name: String,
    pub enabled: bool,
    pub capabilities: Vec<AiCapability>,
    pub requests_today: u64,
    pub avg_latency_ms: u64,
    pub error_rate: f64,
    pub last_error: Option<String>,
}

/// Tüm AI sağlayıcıları için ortak arayüz
#[async_trait]
pub trait AiProvider: Send + Sync {
    /// Sağlayıcı adı (örn: "mimo", "openai", "gemini")
    fn name(&self) -> &str;

    /// Bu sağlayıcının yetenekleri
    fn capabilities(&self) -> Vec<AiCapability>;

    /// Sağlayıcı aktif mi?
    fn is_available(&self) -> bool;

    /// Temel chat fonksiyonu
    async fn chat(&self, system_prompt: &str, user_prompt: &str) -> Result<String>;

    /// Durum bilgisi
    fn status(&self) -> ProviderStatus;

    /// Log analizi (varsayılan: genel chat kullanır)
    async fn analyze_logs(&self, logs: &str) -> Result<String> {
        let system = r#"Sen bir log analiz uzmanısın. Verilen logları analiz et.
Hata paternleri, anormal davranışlar, performans sorunları ve güvenlik tehditlerini tespit et.
JSON formatında yanıt ver: {"issues": [...], "severity": "low|medium|high|critical", "recommendations": [...]}"#;
        self.chat(system, logs).await
    }

    /// Anomali tespiti
    async fn detect_anomaly(&self, metrics: &str) -> Result<String> {
        let system = "Metrikleri analiz et, anomali varsa tespit et. JSON yanıt ver.";
        self.chat(system, metrics).await
    }

    /// Kod inceleme
    async fn review_code(&self, code: &str) -> Result<String> {
        let system = "Kodu incele, hataları ve güvenlik açıklarını bul. JSON yanıt ver.";
        self.chat(system, code).await
    }

    /// Fix kodu üret
    async fn generate_fix(&self, error: &str, context: &str) -> Result<String> {
        let system = "Verilen hata için düzeltme kodu üret. JSON yanıt ver: {\"fix_code\": \"...\", \"explanation\": \"...\"}";
        self.chat(system, &format!("HATA:\n{}\n\nBAĞLAM:\n{}", error, context)).await
    }

    /// Güvenlik analizi
    async fn analyze_threat(&self, traffic: &str) -> Result<String> {
        let system = "Trafik verisini analiz et, güvenlik tehditlerini tespit et. JSON yanıt ver.";
        self.chat(system, traffic).await
    }

    /// Komut yorumla
    async fn interpret_command(&self, command: &str) -> Result<String> {
        let system = r#"Doğal dil komutunu JSON aksiyonuna çevir.
Örnek: {"action": "block_ip", "ip": "1.2.3.4", "duration_minutes": 60}"#;
        self.chat(system, command).await
    }

    /// Rapor oluştur
    async fn generate_report(&self, data: &str) -> Result<String> {
        let system = "Verileri analiz et, özet rapor oluştur. JSON yanıt ver.";
        self.chat(system, data).await
    }
}
