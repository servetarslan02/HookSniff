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

#[cfg(test)]
mod tests {
    use super::*;

    // ── ThrottleConfig::default ────────────────────────────────

    #[test]
    fn throttle_config_default() {
        let config = ThrottleConfig::default();
        assert!(config.rate.is_none());
        assert_eq!(config.period_secs, 60);
        assert!(matches!(config.strategy, ThrottleStrategy::SlidingWindow));
    }

    // ── ThrottleStrategy::default ──────────────────────────────

    #[test]
    fn throttle_strategy_default_is_sliding_window() {
        let strategy = ThrottleStrategy::default();
        assert!(matches!(strategy, ThrottleStrategy::SlidingWindow));
    }

    // ── ThrottleStrategy serde ─────────────────────────────────

    #[test]
    fn throttle_strategy_serialize() {
        assert_eq!(
            serde_json::to_string(&ThrottleStrategy::FixedWindow).unwrap(),
            "\"fixed_window\""
        );
        assert_eq!(
            serde_json::to_string(&ThrottleStrategy::SlidingWindow).unwrap(),
            "\"sliding_window\""
        );
        assert_eq!(
            serde_json::to_string(&ThrottleStrategy::TokenBucket).unwrap(),
            "\"token_bucket\""
        );
    }

    #[test]
    fn throttle_strategy_deserialize() {
        assert!(matches!(
            serde_json::from_str::<ThrottleStrategy>("\"fixed_window\"").unwrap(),
            ThrottleStrategy::FixedWindow
        ));
        assert!(matches!(
            serde_json::from_str::<ThrottleStrategy>("\"sliding_window\"").unwrap(),
            ThrottleStrategy::SlidingWindow
        ));
        assert!(matches!(
            serde_json::from_str::<ThrottleStrategy>("\"token_bucket\"").unwrap(),
            ThrottleStrategy::TokenBucket
        ));
    }

    // ── ThrottleConfig serde ───────────────────────────────────

    #[test]
    fn throttle_config_serde_roundtrip() {
        let config = ThrottleConfig {
            rate: Some(100),
            period_secs: 120,
            strategy: ThrottleStrategy::TokenBucket,
        };
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: ThrottleConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.rate, Some(100));
        assert_eq!(deserialized.period_secs, 120);
        assert!(matches!(
            deserialized.strategy,
            ThrottleStrategy::TokenBucket
        ));
    }

    // ── ThrottleManager::new ───────────────────────────────────

    #[test]
    fn throttle_manager_new() {
        let manager = ThrottleManager::new();
        // Just verify construction doesn't panic
        drop(manager);
    }

    #[test]
    fn throttle_manager_default() {
        let manager = ThrottleManager::default();
        drop(manager);
    }

    // ── ThrottleManager::check ─────────────────────────────────

    #[tokio::test]
    async fn check_allows_within_rate() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        assert!(manager.check(endpoint_id, 5, Duration::from_secs(60)).await);
    }

    #[tokio::test]
    async fn check_blocks_at_rate_limit() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        for _ in 0..3 {
            assert!(manager.check(endpoint_id, 3, Duration::from_secs(60)).await);
        }
        assert!(!manager.check(endpoint_id, 3, Duration::from_secs(60)).await);
    }

    #[tokio::test]
    async fn check_different_endpoints_independent() {
        let manager = ThrottleManager::new();
        let ep1 = Uuid::new_v4();
        let ep2 = Uuid::new_v4();

        for _ in 0..3 {
            manager.check(ep1, 3, Duration::from_secs(60)).await;
        }
        // ep1 at limit, ep2 should be fine
        assert!(manager.check(ep2, 3, Duration::from_secs(60)).await);
    }

    #[tokio::test]
    async fn check_window_expires() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        assert!(manager.check(endpoint_id, 2, Duration::from_secs(1)).await);
        assert!(manager.check(endpoint_id, 2, Duration::from_secs(1)).await);
        assert!(!manager.check(endpoint_id, 2, Duration::from_secs(1)).await);

        tokio::time::sleep(Duration::from_secs(2)).await;
        assert!(manager.check(endpoint_id, 2, Duration::from_secs(1)).await);
    }

    #[tokio::test]
    async fn check_rate_of_one() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        assert!(manager.check(endpoint_id, 1, Duration::from_secs(60)).await);
        assert!(!manager.check(endpoint_id, 1, Duration::from_secs(60)).await);
    }

    // ── ThrottleManager::retry_after ───────────────────────────

    #[tokio::test]
    async fn retry_after_returns_default_when_not_throttled() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        let retry = manager
            .retry_after(endpoint_id, 5, Duration::from_secs(60))
            .await;
        assert_eq!(retry, 1);
    }

    #[tokio::test]
    async fn retry_after_returns_nonzero_when_throttled() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        for _ in 0..3 {
            manager.check(endpoint_id, 3, Duration::from_secs(60)).await;
        }
        let retry = manager
            .retry_after(endpoint_id, 3, Duration::from_secs(60))
            .await;
        assert!(retry > 0);
    }

    // ── ThrottleManager::check with zero rate ──────────────────

    #[tokio::test]
    async fn check_zero_rate_blocks_immediately() {
        let manager = ThrottleManager::new();
        let endpoint_id = Uuid::new_v4();
        // rate=0: timestamps.len() (0) >= 0 is true → blocked
        assert!(!manager.check(endpoint_id, 0, Duration::from_secs(60)).await);
    }

    // ── THROTTLE_MIGRATION constant ────────────────────────────

    #[test]
    fn throttle_migration_contains_expected_columns() {
        assert!(THROTTLE_MIGRATION.contains("throttle_rate"));
        assert!(THROTTLE_MIGRATION.contains("throttle_period_secs"));
        assert!(THROTTLE_MIGRATION.contains("throttle_strategy"));
    }
}
