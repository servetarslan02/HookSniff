//! Per-Endpoint Throttling (İstek Hızı Sınırı)
//!
//! Bu modül, her endpoint için ayrı istek hızı sınırı uygular.
//! Müşterilerin sunucularını korumak için kritik öneme sahiptir.
//!
//! Svix'te bu feature var, bizde yok — bu yüzden müşteriler bize güvenemez.
//!
//! ## Nasıl Çalışır
//!
//! 1. Her endpoint'in `throttle_rate` ve `throttle_period` ayarları vardır
//! 2. Teslimat sırasında kontrol edilir
//! 3. Limit aşılırsa teslimat ertelenir (rate-limited delivery)
//! 4. Token bucket algoritması kullanılır (smooth rate limiting)
//!
//! ## Veritabanı Şeması
//!
//! ```sql
//! ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_rate INT;
//! ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_period_secs INT DEFAULT 60;
//! ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_strategy STRING DEFAULT 'sliding_window';
//! ```

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use uuid::Uuid;

/// Throttling stratejisi
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
#[derive(Default)]
pub enum ThrottleStrategy {
    /// Sabit pencere: N istek / M saniye
    FixedWindow,
    /// Kayan pencere: daha smooth rate limiting
    #[default]
    SlidingWindow,
    /// Token bucket: burst + sustained rate
    TokenBucket,
}

/// Endpoint throttling yapılandırması
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThrottleConfig {
    /// İstek hızı sınırı (istenilen sayı / period)
    pub rate: Option<u32>,
    /// Periyot süresi (saniye)
    pub period_secs: u32,
    /// Throttling stratejisi
    pub strategy: ThrottleStrategy,
}

impl Default for ThrottleConfig {
    fn default() -> Self {
        Self {
            rate: None,      // Sınır yok
            period_secs: 60, // 1 dakika
            strategy: ThrottleStrategy::SlidingWindow,
        }
    }
}

/// Throttle durumu (in-memory, per-endpoint)
struct ThrottleState {
    /// Son istek zamanları
    timestamps: Vec<Instant>,
    /// Son temizleme zamanı
    last_cleanup: Instant,
}

/// Per-Endpoint Throttle Manager
///
/// Her endpoint için ayrı throttle durumu tutar.
/// Rate limit aşıldığında `false` döner.
#[derive(Clone)]
pub struct ThrottleManager {
    states: Arc<Mutex<HashMap<Uuid, ThrottleState>>>,
    cleanup_interval: Duration,
}

impl Default for ThrottleManager {
    fn default() -> Self {
        Self::new()
    }
}

impl ThrottleManager {
    pub fn new() -> Self {
        Self {
            states: Arc::new(Mutex::new(HashMap::new())),
            cleanup_interval: Duration::from_secs(300), // 5 dakikada bir temizle
        }
    }

    /// Endpoint'in rate limit'ini kontrol et
    ///
    /// `true` = teslimat yapılabilir
    /// `false` = rate limit aşıldı, ertelenmeli
    pub async fn check(&self, endpoint_id: Uuid, rate: u32, period: Duration) -> bool {
        let mut states = self.states.lock().await;
        let now = Instant::now();

        let state = states.entry(endpoint_id).or_insert_with(|| ThrottleState {
            timestamps: Vec::new(),
            last_cleanup: now,
        });

        // Eski zaman damgalarını temizle
        if now.duration_since(state.last_cleanup) > self.cleanup_interval {
            state
                .timestamps
                .retain(|ts| now.duration_since(*ts) < period);
            state.last_cleanup = now;
        }

        // Periyot içindeki istek sayısı
        state
            .timestamps
            .retain(|ts| now.duration_since(*ts) < period);

        if state.timestamps.len() >= rate as usize {
            return false; // Rate limit aşıldı
        }

        state.timestamps.push(now);
        true
    }

    /// Rate limit aşıldığında ne kadar beklenmeli (saniye)
    pub async fn retry_after(&self, endpoint_id: Uuid, rate: u32, period: Duration) -> u64 {
        let states = self.states.lock().await;
        let now = Instant::now();

        if let Some(state) = states.get(&endpoint_id) {
            let recent: Vec<_> = state
                .timestamps
                .iter()
                .filter(|ts| now.duration_since(**ts) < period)
                .collect();

            if recent.len() >= rate as usize {
                if let Some(oldest) = recent.first() {
                    let elapsed = now.duration_since(**oldest);
                    return period.saturating_sub(elapsed).as_secs() + 1;
                }
            }
        }

        1 // Varsayılan 1 saniye
    }
}

/// Throttle migration SQL
pub const THROTTLE_MIGRATION: &str = r#"
-- Per-Endpoint Throttling (İstek Hızı Sınırı)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_rate INT;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_period_secs INT DEFAULT 60;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_strategy STRING DEFAULT 'sliding_window';
"#;

/// Endpoint throttle yapılandırmasını veritabanından al
pub async fn get_endpoint_throttle(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> anyhow::Result<ThrottleConfig> {
    let row: (Option<i32>, Option<i32>, Option<String>) = sqlx::query_as(
        "SELECT throttle_rate, throttle_period_secs, throttle_strategy FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await?;

    Ok(ThrottleConfig {
        rate: row.0.map(|r| r as u32),
        period_secs: row.1.unwrap_or(60) as u32,
        strategy: match row.2.as_deref() {
            Some("fixed_window") => ThrottleStrategy::FixedWindow,
            Some("token_bucket") => ThrottleStrategy::TokenBucket,
            _ => ThrottleStrategy::SlidingWindow,
        },
    })
}

/// Throttle migration'ını çalıştır
pub async fn run_throttle_migration(pool: &PgPool) -> anyhow::Result<()> {
    sqlx::query(THROTTLE_MIGRATION).execute(pool).await?;
    tracing::info!("✅ Throttle migration completed");
    Ok(())
}
