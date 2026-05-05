use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::mimo::MiMoProvider;
use super::openai::OpenAiProvider;
use super::provider::{AiCapability, AiProvider, ProviderStatus};

/// Simple sliding-window rate limiter for AI provider calls.
/// Prevents burning through API quotas by limiting requests per provider
/// within a rolling time window.
///
/// FIX: Added to prevent unbounded API usage that could exhaust quotas
/// or trigger provider rate limits / bans.
struct ProviderRateLimiter {
    /// Maximum requests allowed per window per provider
    max_per_window: u32,
    /// Duration of the sliding window
    window_duration: chrono::Duration,
    /// Per-provider request timestamps
    request_log: HashMap<String, Vec<chrono::DateTime<chrono::Utc>>>,
}

impl ProviderRateLimiter {
    fn new(max_per_window: u32, window_duration: chrono::Duration) -> Self {
        Self {
            max_per_window,
            window_duration,
            request_log: HashMap::new(),
        }
    }

    /// Attempt to consume a rate limit token for the given provider.
    /// Returns `true` if allowed, `false` if rate limit exceeded.
    fn try_acquire(&mut self, provider_name: &str) -> bool {
        let now = chrono::Utc::now();
        let cutoff = now - self.window_duration;

        // Get or create log for this provider and prune old entries
        let log = self
            .request_log
            .entry(provider_name.to_string())
            .or_insert_with(Vec::new);
        log.retain(|ts| *ts > cutoff);

        if log.len() >= self.max_per_window as usize {
            tracing::warn!(
                "🚫 Rate limit exceeded for provider '{}': {}/{} requests in window",
                provider_name,
                log.len(),
                self.max_per_window
            );
            return false;
        }

        log.push(now);
        true
    }
}

/// AI Orkestratör — Tüm AI'ları koordine eden "CEO"
///
/// ## Nasıl Çalışır
///
/// 1. Tüm AI sağlayıcılarını tanır
/// 2. Her görev için en uygun AI'yı seçer
/// 3. Bir AI başarısız olursa diğerine geçer (failover)
/// 4. Yük dengesi yapar (load balancing)
/// 5. Performans metriklerini takip eder
///
/// ## Yeni AI Nasıl Eklenir
///
/// ```rust
/// // 1. Provider'ı oluştur
/// let gemini = GeminiProvider::new("api-key".to_string());
///
/// // 2. Orkestratöre ekle
/// orchestrator.add_provider(Box::new(gemini)).await;
///
/// // 3. .env'ye ekle: GEMINI_API_KEY=...
/// ```
///
/// ## Görev Dağılımı
///
/// | Görev | Öncelik | Neden |
/// |-------|---------|-------|
/// | Log analizi | MiMo → OpenAI | MiMo daha hızlı |
/// | Kod inceleme | OpenAI → MiMo | OpenAI daha iyi kod anlar |
/// | Güvenlik | MiMo → OpenAI | MiMo güvenlik odaklı |
/// | Komut yorumlama | OpenAI → MiMo | OpenAI NLP'de更强 |
/// | Rapor | Herhangi biri | Farketmez |

pub struct AiOrchestrator {
    providers: Arc<RwLock<Vec<Box<dyn AiProvider>>>>,
    task_history: Arc<RwLock<Vec<TaskRecord>>>,
    // FIX: Rate limiter to prevent burning through AI provider API quotas.
    // Default: 60 requests per provider per minute (configurable).
    rate_limiter: Arc<RwLock<ProviderRateLimiter>>,
}

#[derive(Debug, Clone, Serialize)]
struct TaskRecord {
    task_type: String,
    provider_used: String,
    success: bool,
    latency_ms: u64,
    timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiResponse {
    pub provider: String,
    pub task_type: String,
    pub result: String,
    pub latency_ms: u64,
    pub fallback_used: bool,
}

impl AiOrchestrator {
    pub fn new() -> Self {
        Self {
            providers: Arc::new(RwLock::new(Vec::new())),
            task_history: Arc::new(RwLock::new(Vec::new())),
            // FIX: Initialize rate limiter — 60 requests per provider per 1-minute window
            rate_limiter: Arc::new(RwLock::new(ProviderRateLimiter::new(
                60,
                chrono::Duration::minutes(1),
            ))),
        }
    }

    /// Create an orchestrator with custom rate limit settings.
    pub fn with_rate_limit(max_per_window: u32, window_seconds: i64) -> Self {
        Self {
            providers: Arc::new(RwLock::new(Vec::new())),
            task_history: Arc::new(RwLock::new(Vec::new())),
            rate_limiter: Arc::new(RwLock::new(ProviderRateLimiter::new(
                max_per_window,
                chrono::Duration::seconds(window_seconds),
            ))),
        }
    }

    /// Yeni AI sağlayıcı ekle (sınırsız)
    pub async fn add_provider(&self, provider: Box<dyn AiProvider>) {
        let name = provider.name().to_string();
        let mut providers = self.providers.write().await;
        tracing::info!("🤖 AI sağlayıcı eklendi: {}", name);
        providers.push(provider);
    }

    /// Tüm sağlayıcıların durumunu al
    pub async fn all_status(&self) -> Vec<ProviderStatus> {
        let providers = self.providers.read().await;
        providers.iter().map(|p| p.status()).collect()
    }

    /// En uygun AI'yı seç ve görevi ver
    async fn execute_with_best(
        &self,
        capability: &AiCapability,
        task_name: &str,
        task_fn: impl Fn(&dyn AiProvider) -> futures::future::BoxFuture<'_, Result<String>> + Send + Sync,
    ) -> Result<AiResponse> {
        let providers = self.providers.read().await;

        // Bu yeteneğe sahip ve aktif olanları filtrele
        let mut candidates: Vec<&Box<dyn AiProvider>> = providers
            .iter()
            .filter(|p| p.is_available() && p.capabilities().contains(capability))
            .collect();

        // Önce tercih edilen sırayla dene
        // MiMo → log/güvenlik, OpenAI → kod/komut
        candidates.sort_by(|a, b| {
            let priority = match capability {
                AiCapability::LogAnalysis | AiCapability::AnomalyDetection | AiCapability::ThreatAnalysis => {
                    // MiMo tercih
                    if a.name() == "mimo" { return std::cmp::Ordering::Less; }
                    if b.name() == "mimo" { return std::cmp::Ordering::Greater; }
                    std::cmp::Ordering::Equal
                }
                AiCapability::CodeReview | AiCapability::CodeGeneration | AiCapability::CommandInterpretation => {
                    // OpenAI tercih
                    if a.name() == "openai" { return std::cmp::Ordering::Less; }
                    if b.name() == "openai" { return std::cmp::Ordering::Greater; }
                    std::cmp::Ordering::Equal
                }
                _ => std::cmp::Ordering::Equal,
            };
            priority
        });

        let mut last_error = None;
        let mut fallback_used = false;

        for provider in &candidates {
            // FIX: Check rate limit before calling the provider.
            // Skip this provider if rate-limited, try the next one.
            {
                let mut limiter = self.rate_limiter.write().await;
                if !limiter.try_acquire(provider.name()) {
                    tracing::info!(
                        "⏭️ Skipping rate-limited provider '{}', trying next",
                        provider.name()
                    );
                    last_error = Some(anyhow::anyhow!(
                        "Provider '{}' rate limited",
                        provider.name()
                    ));
                    fallback_used = true;
                    continue;
                }
            }

            let start = std::time::Instant::now();
            match task_fn(provider.as_ref()).await {
                Ok(result) => {
                    let latency = start.elapsed().as_millis() as u64;

                    // Kayıt tut
                    let record = TaskRecord {
                        task_type: task_name.to_string(),
                        provider_used: provider.name().to_string(),
                        success: true,
                        latency_ms: latency,
                        timestamp: chrono::Utc::now(),
                    };
                    self.task_history.write().await.push(record);

                    return Ok(AiResponse {
                        provider: provider.name().to_string(),
                        task_type: task_name.to_string(),
                        result,
                        latency_ms: latency,
                        fallback_used,
                    });
                }
                Err(e) => {
                    tracing::warn!(
                        "⚠️ {} görevi {} ile başarısız: {:?}",
                        task_name,
                        provider.name(),
                        e
                    );
                    last_error = Some(e);
                    fallback_used = true;

                    // Başarısız kaydı
                    let record = TaskRecord {
                        task_type: task_name.to_string(),
                        provider_used: provider.name().to_string(),
                        success: false,
                        latency_ms: start.elapsed().as_millis() as u64,
                        timestamp: chrono::Utc::now(),
                    };
                    self.task_history.write().await.push(record);
                }
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("Uygun AI sağlayıcı bulunamadı")))
    }

    /// Log analizi (MiMo → OpenAI)
    pub async fn analyze_logs(&self, logs: &str) -> Result<AiResponse> {
        self.execute_with_best(
            &AiCapability::LogAnalysis,
            "log_analysis",
            |provider| Box::pin(async move { provider.analyze_logs(logs).await }),
        ).await
    }

    /// Anomali tespiti (MiMo → OpenAI)
    pub async fn detect_anomaly(&self, metrics: &str) -> Result<AiResponse> {
        self.execute_with_best(
            &AiCapability::AnomalyDetection,
            "anomaly_detection",
            |provider| Box::pin(async move { provider.detect_anomaly(metrics).await }),
        ).await
    }

    /// Kod inceleme (OpenAI → MiMo)
    pub async fn review_code(&self, code: &str) -> Result<AiResponse> {
        self.execute_with_best(
            &AiCapability::CodeReview,
            "code_review",
            |provider| Box::pin(async move { provider.review_code(code).await }),
        ).await
    }

    /// Fix kodu üret (OpenAI → MiMo)
    pub async fn generate_fix(&self, error: &str, context: &str) -> Result<AiResponse> {
        let error = error.to_string();
        let context = context.to_string();
        self.execute_with_best(
            &AiCapability::CodeGeneration,
            "code_generation",
            |provider| {
                let error = error.clone();
                let context = context.clone();
                Box::pin(async move { provider.generate_fix(&error, &context).await })
            },
        ).await
    }

    /// Güvenlik analizi (MiMo → OpenAI)
    pub async fn analyze_threat(&self, traffic: &str) -> Result<AiResponse> {
        self.execute_with_best(
            &AiCapability::ThreatAnalysis,
            "threat_analysis",
            |provider| Box::pin(async move { provider.analyze_threat(traffic).await }),
        ).await
    }

    /// Komut yorumla (OpenAI → MiMo)
    pub async fn interpret_command(&self, command: &str) -> Result<AiResponse> {
        self.execute_with_best(
            &AiCapability::CommandInterpretation,
            "command_interpretation",
            |provider| Box::pin(async move { provider.interpret_command(command).await }),
        ).await
    }

    /// Rapor oluştur (herhangi biri)
    pub async fn generate_report(&self, data: &str) -> Result<AiResponse> {
        self.execute_with_best(
            &AiCapability::ReportGeneration,
            "report_generation",
            |provider| Box::pin(async move { provider.generate_report(data).await }),
        ).await
    }

    /// Genel sohbet (herhangi biri)
    pub async fn chat(&self, system: &str, user: &str) -> Result<AiResponse> {
        let system = system.to_string();
        let user = user.to_string();
        self.execute_with_best(
            &AiCapability::General,
            "general_chat",
            |provider| {
                let system = system.clone();
                let user = user.clone();
                Box::pin(async move { provider.chat(&system, &user).await })
            },
        ).await
    }

    /// Son görev istatistikleri
    pub async fn task_stats(&self) -> serde_json::Value {
        let history = self.task_history.read().await;
        let total = history.len();
        let successful = history.iter().filter(|r| r.success).count();
        let failed = total - successful;

        let avg_latency = if total > 0 {
            history.iter().map(|r| r.latency_ms).sum::<u64>() / total as u64
        } else {
            0
        };

        // Provider bazlı istatistikler
        let mut provider_stats: HashMap<String, (u64, u64)> = HashMap::new();
        for record in history.iter() {
            let entry = provider_stats
                .entry(record.provider_used.clone())
                .or_insert((0, 0));
            if record.success {
                entry.0 += 1;
            } else {
                entry.1 += 1;
            }
        }

        serde_json::json!({
            "total_tasks": total,
            "successful": successful,
            "failed": failed,
            "avg_latency_ms": avg_latency,
            "provider_stats": provider_stats,
            "providers_online": self.all_status().await.len(),
        })
    }
}
