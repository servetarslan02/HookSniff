# 🤖 Yeni AI Sağlayıcı Nasıl Eklenir

Sistem **sınırsız AI sağlayıcı** destekler. İstediğin kadar ekleyebilirsin.

---

## Hızlı Başlangıç (3 Adım)

### 1. API Key Ekle
`.env` dosyasına ekle:
```bash
GEMINI_API_KEY=your-key-here
CLAUDE_API_KEY=your-key-here
# ...istediğin kadar
```

### 2. Provider Dosyası Oluştur
`ai-center/src/ai_engine/` klasörüne yeni dosya:

```rust
// ai-center/src/ai_engine/gemini.rs

use anyhow::Result;
use async_trait::async_trait;
use super::provider::{AiCapability, AiProvider, ProviderStatus};

pub struct GeminiProvider {
    api_key: String,
    http_client: reqwest::Client,
}

impl GeminiProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            http_client: reqwest::Client::new(),
        }
    }

    pub fn from_env() -> Option<Self> {
        std::env::var("GEMINI_API_KEY")
            .ok()
            .filter(|k| !k.is_empty() && k != "your-key-here")
            .map(Self::new)
    }
}

#[async_trait]
impl AiProvider for GeminiProvider {
    fn name(&self) -> &str { "gemini" }

    fn capabilities(&self) -> Vec<AiCapability> {
        vec![
            AiCapability::LogAnalysis,
            AiCapability::AnomalyDetection,
            AiCapability::CodeReview,
            AiCapability::General,
        ]
    }

    fn is_available(&self) -> bool { true }

    fn status(&self) -> ProviderStatus {
        ProviderStatus {
            name: "gemini".to_string(),
            enabled: true,
            capabilities: self.capabilities(),
            requests_today: 0,
            avg_latency_ms: 0,
            error_rate: 0.0,
            last_error: None,
        }
    }

    async fn chat(&self, system: &str, user: &str) -> Result<String> {
        // Gemini API çağrısı
        let response = self.http_client
            .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent")
            .header("x-goog-api-key", &self.api_key)
            .json(&serde_json::json!({
                "contents": [{"parts": [{"text": format!("{}\n\n{}", system, user)}]}]
            }))
            .send()
            .await?;

        // Response parsing...
        Ok("Gemini response".to_string())
    }
}
```

### 3. Orkestratöre Ekle
`ai-center/src/main.rs`'de:

```rust
// mod.rs'ye ekle
pub mod gemini;

// main.rs'de
if let Some(gemini) = ai_engine::gemini::GeminiProvider::from_env() {
    orchestrator.add_provider(Box::new(gemini)).await;
}
```

---

## Mevcut AI Sağlayıcılar

| Sağlayıcı | API Key | Ne İçin | Öncelik |
|-----------|---------|---------|---------|
| **MiMo** | `MIMO_API_KEY` | Log analizi, anomali, güvenlik | 🥇 |
| **OpenAI** | `OPENAI_API_KEY` | Kod inceleme, fix, komut | 🥈 |
| **Gemini** | `GEMINI_API_KEY` | Genel analiz | 🥉 |
| **Claude** | `CLAUDE_API_KEY` | Güvenlik, kod inceleme | 🥉 |
| **Mistral** | `MISTRAL_API_KEY` | Hızlı yanıt | 🥉 |
| **DeepSeek** | `DEEPSEEK_API_KEY` | Kod odaklı | 🥉 |

---

## Görev Dağılımı (Otomatik)

Orkestratör her görev için en uygun AI'yı otomatik seçer:

| Görev | 1. Tercih | 2. Tercih | Neden |
|-------|-----------|-----------|-------|
| Log analizi | MiMo | OpenAI | MiMo daha hızlı |
| Kod inceleme | OpenAI | Claude | OpenAI daha iyi kod anlar |
| Güvenlik | MiMo | Claude | MiMo güvenlik odaklı |
| Komut yorumlama | OpenAI | Gemini | OpenAI NLP'de更强 |
| Rapor | Herhangi biri | - | Farketmez |

Bir AI başarısız olursa → otomatik diğerine geçer (failover)

---

## Sınırsız Ekleme

Sistem şu şekilde tasarlandı:

```
providers: Vec<Box<dyn AiProvider>>
```

Yani:
- 10 tane API key ekleyebilirsin
- Her biri farklı iş yapabilir
- Hepsi birlikte çalışır
- Birisi çökse diğerleri devam eder

**Hiçbir sınır yok.** İstediğin kadar ekle.

---

## API Endpoint'leri

### Sağlayıcı Durumu
```
GET /v1/ai/providers
```

### AI İstatistikleri
```
GET /v1/ai/stats
```

### Olaylar
```
GET /v1/ai/events?severity=critical
```

### Aksiyonlar
```
GET /v1/ai/actions
POST /v1/ai/actions/{id}/approve
POST /v1/ai/actions/{id}/reject
```
