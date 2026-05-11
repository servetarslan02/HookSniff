//! Retry Policy — Per-endpoint Custom Retry Scheduling
//!
//! Bu modül, webhook teslimatı başarısız olduğunda ne zaman tekrar deneneceğini
//! belirler. Her endpoint için özel retry politikası tanımlanabilir.
//!
//! ## Özellikler
//!
//! - **Exponential Backoff**: Deneme sayısı arttıkça bekleme süresi katlanarak artar
//! - **Jitter**: Thundering herd'i önlemek için rastgele gecikme eklenir
//! - **Max Attempt Limit**: Belirli bir deneme sayısından sonra vazgeçilir
//! - **Per-endpoint Customization**: Her endpoint farklı retry politikası kullanabilir
//!
//! ## Veritabanı Şeması
//!
//! ```sql
//! CREATE TABLE retry_policies (
//!     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//!     endpoint_id UUID NOT NULL UNIQUE REFERENCES endpoints(id) ON DELETE CASCADE,
//!     max_attempts INT NOT NULL DEFAULT 5,
//!     base_delay_ms BIGINT NOT NULL DEFAULT 1000,
//!     max_delay_ms BIGINT NOT NULL DEFAULT 3600000,
//!     multiplier DOUBLE PRECISION NOT NULL DEFAULT 2.0,
//!     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
//! );
//! ```
//!
//! ## Kullanım
//!
//! ```rust,ignore
//! use hooksniff_api::retry_policy;
//!
//! // Politikayı yükle
//! let policy = retry_policy::load_policy(&pool, endpoint_id).await?;
//!
//! // Sonraki retry zamanını hesapla
//! if let Some(delay) = policy.next_retry_delay(attempt_number) {
//!     // delay kadar bekle, sonra tekrar dene
//!     schedule_retry(delivery_id, delay).await?;
//! } else {
//!     // Max attempt aşıldı, dead letter'a taşı
//!     move_to_dead_letter(delivery_id).await?;
//! }
//! ```

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Model — Database Row
// ---------------------------------------------------------------------------

/// Retry politikası — veritabanı satırı
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct RetryPolicy {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub max_attempts: i32,
    pub base_delay_ms: i64,
    pub max_delay_ms: i64,
    pub multiplier: f64,
    pub created_at: DateTime<Utc>,
}

// ---------------------------------------------------------------------------
// Request / Response DTOs
// ---------------------------------------------------------------------------

/// Retry politikası oluşturma/güncelleme isteği
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpsertRetryPolicyRequest {
    /// Maksimum deneme sayısı (1-100 arası)
    pub max_attempts: Option<i32>,
    /// Temel bekleme süresi (milisaniye)
    pub base_delay_ms: Option<i64>,
    /// Maksimum bekleme süresi (milisaniye)
    pub max_delay_ms: Option<i64>,
    /// Backoff çarpanı (örn: 2.0 = exponential doubling)
    pub multiplier: Option<f64>,
}

/// Retry politikası yanıt DTO'su
#[derive(Debug, Serialize)]
pub struct RetryPolicyResponse {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub max_attempts: i32,
    pub base_delay_ms: i64,
    pub max_delay_ms: i64,
    pub multiplier: f64,
    /// Hesaplanmış retry schedule (attempt → delay_ms)
    pub schedule: Vec<RetryScheduleEntry>,
    pub created_at: DateTime<Utc>,
}

/// Retry schedule girişi — bir deneme için hesaplanan bekleme süresi
#[derive(Debug, Serialize)]
pub struct RetryScheduleEntry {
    pub attempt: i32,
    pub delay_ms: i64,
    pub delay_human: String,
}

impl RetryPolicy {
    /// Varsayılan retry politikası
    ///
    /// Endpoint için politika tanımlanmamışsa kullanılır.
    pub fn default_for_endpoint(endpoint_id: Uuid) -> Self {
        Self {
            id: Uuid::nil(),
            endpoint_id,
            max_attempts: 5,
            base_delay_ms: 1_000,    // 1 saniye
            max_delay_ms: 3_600_000, // 1 saat
            multiplier: 2.0,
            created_at: Utc::now(),
        }
    }

    /// Belirli bir deneme numarası için bekleme süresini hesapla
    ///
    /// Exponential backoff + jitter uygular:
    /// - Temel: `base_delay_ms * multiplier^(attempt - 1)`
    /// - Jitter: %0-25 rastgele ek gecikme (thundering herd koruması)
    /// - Üst sınır: `max_delay_ms`
    ///
    /// Attempt sayısı `max_attempts`'ı aşıyorsa `None` döner.
    pub fn next_retry_delay(&self, attempt: i32) -> Option<i64> {
        if attempt >= self.max_attempts {
            return None; // Max deneme aşıldı
        }

        let base = self.base_delay_ms as f64;
        let exponential = base * self.multiplier.powi(attempt.saturating_sub(1).max(0));

        // Üst sınır uygula
        let capped = exponential.min(self.max_delay_ms as f64);

        // Jitter ekle (0% - 25% rastgele artış)
        let jitter = capped * random_jitter_factor();
        let delay = (capped + jitter) as i64;

        // Alt sınır: en az base_delay_ms
        Some(delay.max(self.base_delay_ms))
    }

    /// Attempt sayısı max_attempts'ı aştı mı?
    pub fn is_exhausted(&self, attempt: i32) -> bool {
        attempt >= self.max_attempts
    }

    /// Deneme durumunu değerlendir
    ///
    /// Bir teslimat denemesi başarısız olduğunda çağrılır.
    /// Sonraki retry zamanlamasını döner.
    pub fn evaluate_attempt(&self, current_attempt: i32, success: bool) -> RetryDecision {
        if success {
            return RetryDecision::Success;
        }

        let next_attempt = current_attempt + 1;

        match self.next_retry_delay(next_attempt) {
            Some(delay_ms) => {
                let retry_at = Utc::now() + chrono::Duration::milliseconds(delay_ms);
                RetryDecision::Retry {
                    attempt: next_attempt,
                    delay_ms,
                    retry_at,
                }
            }
            None => RetryDecision::Exhausted {
                total_attempts: current_attempt,
            },
        }
    }

    /// Hesaplanmış retry schedule'ı oluştur (debug/display amaçlı)
    pub fn compute_schedule(&self) -> Vec<RetryScheduleEntry> {
        (1..=self.max_attempts)
            .filter_map(|attempt| {
                self.next_retry_delay(attempt)
                    .map(|delay_ms| RetryScheduleEntry {
                        attempt,
                        delay_ms,
                        delay_human: format_duration(delay_ms),
                    })
            })
            .collect()
    }

    /// Response DTO'ya dönüştür
    pub fn to_response(&self) -> RetryPolicyResponse {
        RetryPolicyResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            max_attempts: self.max_attempts,
            base_delay_ms: self.base_delay_ms,
            max_delay_ms: self.max_delay_ms,
            multiplier: self.multiplier,
            schedule: self.compute_schedule(),
            created_at: self.created_at,
        }
    }
}

// ---------------------------------------------------------------------------
// Retry Decision
// ---------------------------------------------------------------------------

/// Bir retry denemesinin sonucu
#[derive(Debug, Clone, Serialize)]
pub enum RetryDecision {
    /// Teslimat başarılı — retry gerekmez
    Success,
    /// Tekrar dene — belirtilen gecikme ile
    Retry {
        attempt: i32,
        delay_ms: i64,
        retry_at: DateTime<Utc>,
    },
    /// Max deneme sayısı aşıldı — dead letter'a taşı
    Exhausted { total_attempts: i32 },
}

// ---------------------------------------------------------------------------
// Database Operations
// ---------------------------------------------------------------------------

/// Endpoint için retry politikasını yükle
///
/// Politika tanımlanmamışsa varsayılan politika döner.
pub async fn load_policy(pool: &PgPool, endpoint_id: Uuid) -> Result<RetryPolicy> {
    let policy: Option<RetryPolicy> = sqlx::query_as(
        r#"
        SELECT id, endpoint_id, max_attempts, base_delay_ms, max_delay_ms, multiplier, created_at
        FROM retry_policies
        WHERE endpoint_id = $1
        "#,
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await
    .context("Failed to load retry policy")?;

    Ok(policy.unwrap_or_else(|| RetryPolicy::default_for_endpoint(endpoint_id)))
}

/// Endpoint için retry politikası oluştur
pub async fn create_policy(
    pool: &PgPool,
    endpoint_id: Uuid,
    request: &UpsertRetryPolicyRequest,
) -> Result<RetryPolicy> {
    let max_attempts = request.max_attempts.unwrap_or(5).clamp(1, 100);
    let base_delay_ms = request.base_delay_ms.unwrap_or(1_000).max(100);
    let max_delay_ms = request.max_delay_ms.unwrap_or(3_600_000).max(base_delay_ms);
    let multiplier = request.multiplier.unwrap_or(2.0).clamp(1.0, 10.0);

    let policy: RetryPolicy = sqlx::query_as(
        r#"
        INSERT INTO retry_policies (endpoint_id, max_attempts, base_delay_ms, max_delay_ms, multiplier)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, endpoint_id, max_attempts, base_delay_ms, max_delay_ms, multiplier, created_at
        "#,
    )
    .bind(endpoint_id)
    .bind(max_attempts)
    .bind(base_delay_ms)
    .bind(max_delay_ms)
    .bind(multiplier)
    .fetch_one(pool)
    .await
    .context("Failed to create retry policy")?;

    tracing::info!(
        endpoint_id = %endpoint_id,
        policy_id = %policy.id,
        max_attempts = max_attempts,
        "Retry policy created"
    );

    Ok(policy)
}

/// Endpoint için retry politikasını güncelle (upsert)
pub async fn upsert_policy(
    pool: &PgPool,
    endpoint_id: Uuid,
    request: &UpsertRetryPolicyRequest,
) -> Result<RetryPolicy> {
    let max_attempts = request.max_attempts.unwrap_or(5).clamp(1, 100);
    let base_delay_ms = request.base_delay_ms.unwrap_or(1_000).max(100);
    let max_delay_ms = request.max_delay_ms.unwrap_or(3_600_000).max(base_delay_ms);
    let multiplier = request.multiplier.unwrap_or(2.0).clamp(1.0, 10.0);

    let policy: RetryPolicy = sqlx::query_as(
        r#"
        INSERT INTO retry_policies (endpoint_id, max_attempts, base_delay_ms, max_delay_ms, multiplier)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (endpoint_id) DO UPDATE SET
            max_attempts = EXCLUDED.max_attempts,
            base_delay_ms = EXCLUDED.base_delay_ms,
            max_delay_ms = EXCLUDED.max_delay_ms,
            multiplier = EXCLUDED.multiplier
        RETURNING id, endpoint_id, max_attempts, base_delay_ms, max_delay_ms, multiplier, created_at
        "#,
    )
    .bind(endpoint_id)
    .bind(max_attempts)
    .bind(base_delay_ms)
    .bind(max_delay_ms)
    .bind(multiplier)
    .fetch_one(pool)
    .await
    .context("Failed to upsert retry policy")?;

    tracing::info!(
        endpoint_id = %endpoint_id,
        policy_id = %policy.id,
        "Retry policy upserted"
    );

    Ok(policy)
}

/// Endpoint için retry politikasını sil
pub async fn delete_policy(pool: &PgPool, endpoint_id: Uuid) -> Result<bool> {
    let result = sqlx::query("DELETE FROM retry_policies WHERE endpoint_id = $1")
        .bind(endpoint_id)
        .execute(pool)
        .await
        .context("Failed to delete retry policy")?;

    Ok(result.rows_affected() > 0)
}

/// Tüm retry politikalarını listele
pub async fn list_policies(pool: &PgPool) -> Result<Vec<RetryPolicy>> {
    let policies: Vec<RetryPolicy> = sqlx::query_as(
        r#"
        SELECT id, endpoint_id, max_attempts, base_delay_ms, max_delay_ms, multiplier, created_at
        FROM retry_policies
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .context("Failed to list retry policies")?;

    Ok(policies)
}

// ---------------------------------------------------------------------------
// Convenience — Retry Delay Calculation with DB
// ---------------------------------------------------------------------------

/// Endpoint için bir sonraki retry zamanını hesapla (DB'den politika yükler)
///
/// Teslimat denemesi başarısız olduğunda çağrılır.
/// Sonraki retry zamanlamasını döner.
pub async fn compute_next_retry(
    pool: &PgPool,
    endpoint_id: Uuid,
    current_attempt: i32,
) -> Result<RetryDecision> {
    let policy = load_policy(pool, endpoint_id).await?;
    Ok(policy.evaluate_attempt(current_attempt, false))
}

// ---------------------------------------------------------------------------
// Migration SQL
// ---------------------------------------------------------------------------

/// Retry policy migration SQL — db.rs tarafından çağrılabilir
pub const RETRY_POLICY_MIGRATION_SQL: &str = r#"
-- Retry politikaları tablosu
CREATE TABLE IF NOT EXISTS retry_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL UNIQUE REFERENCES endpoints(id) ON DELETE CASCADE,
    max_attempts INT NOT NULL DEFAULT 5,
    base_delay_ms BIGINT NOT NULL DEFAULT 1000,
    max_delay_ms BIGINT NOT NULL DEFAULT 3600000,
    multiplier DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retry_policies_endpoint
    ON retry_policies(endpoint_id);
"#;

/// Retry policy migration'ını çalıştır
pub async fn run_retry_policy_migration(pool: &PgPool) -> Result<()> {
    sqlx::query(RETRY_POLICY_MIGRATION_SQL)
        .execute(pool)
        .await
        .context("Failed to run retry policy migration")?;
    tracing::info!("✅ Retry policy migration completed");
    Ok(())
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/// Rastgele jitter faktörü üret (0.0 - 0.25 arası)
///
/// Thundering herd problemini önlemek için kullanılır.
/// Gerçek production'da `rand` crate'i kullanılmalı,
/// ama bu basit implementasyon test ve demo amaçlıdır.
fn random_jitter_factor() -> f64 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    // Zaman bazlı basit pseudo-random
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos();

    let mut hasher = DefaultHasher::new();
    nanos.hash(&mut hasher);
    let hash = hasher.finish();

    // 0.0 - 0.25 arası normalize et
    (hash % 25) as f64 / 100.0
}

/// Milisaniye cinsinden süreyi insan-okunabilir formata çevir
fn format_duration(ms: i64) -> String {
    if ms < 1_000 {
        format!("{}ms", ms)
    } else if ms < 60_000 {
        format!("{:.1}s", ms as f64 / 1_000.0)
    } else if ms < 3_600_000 {
        format!("{:.1}m", ms as f64 / 60_000.0)
    } else {
        format!("{:.1}h", ms as f64 / 3_600_000.0)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------


/// Check if an HTTP status code is retryable.
///
/// - 429 (Too Many Requests) → always retry
/// - 5xx (Server Errors) → always retry
/// - 408 (Request Timeout) → retry
/// - Other 4xx (Client Errors) → do NOT retry (400, 401, 403, 404, etc.)
pub fn is_retryable_status(status: u16) -> bool {
    match status {
        429 => true,        // Rate limited — retry with backoff
        408 => true,        // Timeout — retry
        500..=599 => true,  // Server errors — retry
        400..=499 => false, // Client errors — don't retry
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_policy() -> RetryPolicy {
        RetryPolicy {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            max_attempts: 5,
            base_delay_ms: 1_000,
            max_delay_ms: 3_600_000,
            multiplier: 2.0,
            created_at: Utc::now(),
        }
    }

    #[test]
    fn test_default_policy() {
        let p = RetryPolicy::default_for_endpoint(Uuid::new_v4());
        assert_eq!(p.max_attempts, 5);
        assert_eq!(p.base_delay_ms, 1_000);
        assert_eq!(p.max_delay_ms, 3_600_000);
        assert_eq!(p.multiplier, 2.0);
    }

    #[test]
    fn test_exponential_backoff() {
        let p = test_policy();

        // Attempt 1: base_delay_ms (1000ms) + jitter
        let d1 = p.next_retry_delay(1).unwrap();
        assert!((1_000..=1_250).contains(&d1), "attempt 1: {}", d1);

        // Attempt 2: ~2000ms + jitter
        let d2 = p.next_retry_delay(2).unwrap();
        assert!((2_000..=2_500).contains(&d2), "attempt 2: {}", d2);

        // Attempt 3: ~4000ms + jitter
        let d3 = p.next_retry_delay(3).unwrap();
        assert!((4_000..=5_000).contains(&d3), "attempt 3: {}", d3);

        // Attempt 4: ~8000ms + jitter
        let d4 = p.next_retry_delay(4).unwrap();
        assert!((8_000..=10_000).contains(&d4), "attempt 4: {}", d4);

        // Attempt 5: max_attempts aşıldı
        assert!(p.next_retry_delay(5).is_none());
    }

    #[test]
    fn test_max_delay_cap() {
        let p = RetryPolicy {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            max_attempts: 20,
            base_delay_ms: 1_000,
            max_delay_ms: 10_000, // 10 saniye üst sınır
            multiplier: 2.0,
            created_at: Utc::now(),
        };

        // Attempt 10: exponential olarak çok büyük olmalı ama max_delay ile capped
        let delay = p.next_retry_delay(10).unwrap();
        assert!(
            delay <= 12_500, // 10_000 + %25 jitter
            "delay should be capped: {}",
            delay
        );
    }

    #[test]
    fn test_is_exhausted() {
        let p = test_policy();
        assert!(!p.is_exhausted(1));
        assert!(!p.is_exhausted(4));
        assert!(p.is_exhausted(5));
        assert!(p.is_exhausted(10));
    }

    #[test]
    fn test_evaluate_attempt_success() {
        let p = test_policy();
        let decision = p.evaluate_attempt(3, true);
        assert!(matches!(decision, RetryDecision::Success));
    }

    #[test]
    fn test_evaluate_attempt_retry() {
        let p = test_policy();
        let decision = p.evaluate_attempt(2, false);
        match decision {
            RetryDecision::Retry {
                attempt, delay_ms, ..
            } => {
                assert_eq!(attempt, 3);
                assert!(delay_ms >= 4_000);
            }
            _ => panic!("Expected Retry decision"),
        }
    }

    #[test]
    fn test_evaluate_attempt_exhausted() {
        let p = test_policy();
        let decision = p.evaluate_attempt(5, false);
        match decision {
            RetryDecision::Exhausted { total_attempts } => {
                assert_eq!(total_attempts, 5);
            }
            _ => panic!("Expected Exhausted decision"),
        }
    }

    #[test]
    fn test_compute_schedule() {
        let p = test_policy();
        let schedule = p.compute_schedule();

        // max_attempts = 5 ama attempt 5'te None döner, o yüzden 4 entry olmalı
        assert_eq!(schedule.len(), 4);

        // Attempt'ler sıralı olmalı
        for i in 1..schedule.len() {
            assert!(schedule[i].delay_ms >= schedule[i - 1].delay_ms);
        }
    }

    #[test]
    fn test_to_response() {
        let p = test_policy();
        let resp = p.to_response();

        assert_eq!(resp.max_attempts, 5);
        assert_eq!(resp.base_delay_ms, 1_000);
        assert!(!resp.schedule.is_empty());
    }

    #[test]
    fn test_format_duration() {
        assert_eq!(format_duration(500), "500ms");
        assert_eq!(format_duration(1_500), "1.5s");
        assert_eq!(format_duration(90_000), "1.5m");
        assert_eq!(format_duration(7_200_000), "2.0h");
    }

    #[test]
    fn test_jitter_factor_range() {
        // Birden fazla çağrı yaparak jitter'in 0.0-0.25 aralığında olduğunu doğrula
        for _ in 0..100 {
            let jitter = random_jitter_factor();
            assert!(
                (0.0..=0.25).contains(&jitter),
                "jitter out of range: {}",
                jitter
            );
        }
    }

    #[test]
    fn test_request_defaults() {
        let req = UpsertRetryPolicyRequest {
            max_attempts: None,
            base_delay_ms: None,
            max_delay_ms: None,
            multiplier: None,
        };

        // create_policy'de clamp uygulanır
        assert_eq!(req.max_attempts.unwrap_or(5), 5);
        assert_eq!(req.base_delay_ms.unwrap_or(1_000), 1_000);
    }

    #[test]
    fn test_linear_multiplier() {
        let p = RetryPolicy {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            max_attempts: 5,
            base_delay_ms: 1_000,
            max_delay_ms: 100_000,
            multiplier: 1.0, // Linear (sabit artış)
            created_at: Utc::now(),
        };

        // multiplier=1.0 → her attempt'te aynı delay
        let d1 = p.next_retry_delay(1).unwrap();
        let d2 = p.next_retry_delay(2).unwrap();
        let d3 = p.next_retry_delay(3).unwrap();

        // Jitter nedeniyle tam eşitlik yok ama yakın olmalı
        assert!((1_000..=1_250).contains(&d1));
        assert!((1_000..=1_250).contains(&d2));
        assert!((1_000..=1_250).contains(&d3));
    }
}
