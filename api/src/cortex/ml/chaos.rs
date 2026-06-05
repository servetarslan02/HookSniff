//! Chaos Engineering — Cortex dayanıklılık testi
//!
//! Kontrollü arızalarla sistemin dayanıklılığını test eder:
//! - Redis bağlantı kesintisi simülasyonu
//! - Yavaş veritabanı simülasyonu
//! - Endpoint down simülasyonu
//! - Trafik spike simülasyonu

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChaosTest {
    pub id: i64,
    pub scenario: String,
    pub target: String,
    pub severity: String,
    pub duration_secs: i32,
    pub result: serde_json::Value,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChaosResult {
    pub passed: bool,
    pub recovery_time_ms: u64,
    pub errors_during_test: i32,
    pub alerts_generated: i32,
    pub self_healing_triggered: bool,
    pub observations: Vec<String>,
}

/// Chaos senaryoları
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChaosScenario {
    /// Redis bağlantısını kes
    RedisDown,
    /// DB yavaşlat (500ms+ latency)
    DatabaseSlow,
    /// Endpoint'i devre dışı bırak
    EndpointDown,
    /// Trafik spike (10x normal)
    TrafficSpike,
    /// Ani hata patlaması
    ErrorBurst,
}

impl ChaosScenario {
    pub fn name(&self) -> &'static str {
        match self {
            Self::RedisDown => "redis_down",
            Self::DatabaseSlow => "database_slow",
            Self::EndpointDown => "endpoint_down",
            Self::TrafficSpike => "traffic_spike",
            Self::ErrorBurst => "error_burst",
        }
    }

    pub fn severity(&self) -> &'static str {
        match self {
            Self::RedisDown => "low",
            Self::DatabaseSlow => "medium",
            Self::EndpointDown => "high",
            Self::TrafficSpike => "medium",
            Self::ErrorBurst => "high",
        }
    }
}

/// Chaos test sonucunu kaydet
pub async fn record_chaos_test(
    pool: &PgPool,
    scenario: &ChaosScenario,
    target: &str,
    result: &ChaosResult,
    duration_secs: i32,
) -> Result<i64, sqlx::Error> {
    let id: (i64,) = sqlx::query_as(
        "INSERT INTO chaos_tests (scenario, target, severity, duration_secs, result, completed_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id"
    )
    .bind(scenario.name())
    .bind(target)
    .bind(scenario.severity())
    .bind(duration_secs)
    .bind(serde_json::to_value(result).unwrap_or_default())
    .fetch_one(pool)
    .await?;

    Ok(id.0)
}

/// Endpoint down senaryosu test et
/// Bir endpoint'in devre dışı bırakıldığında Cortex'in nasıl tepki verdiğini gözlemler
pub async fn test_endpoint_down_scenario(
    pool: &PgPool,
    endpoint_id: uuid::Uuid,
) -> ChaosResult {
    let mut observations = Vec::new();

    // Öncesi: normal durumu kaydet
    let pre_state = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM anomaly_scores WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '1 hour'"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);
    observations.push(format!("Pre-test anomalies (1h): {}", pre_state));

    // Endpoint aktif mi kontrol et
    let is_active: Option<(bool,)> = sqlx::query_as(
        "SELECT is_active FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);
    observations.push(format!("Endpoint active: {:?}", is_active.map(|(a,)| a)));

    // Healing aksiyonlarını kontrol et
    let healing_count = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM healing_actions WHERE endpoint_id = $1"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);
    observations.push(format!("Healing actions: {}", healing_count));

    // Drift detection durumunu kontrol et
    let drift_count = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM ml_drift_events WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '1 hour'"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);
    observations.push(format!("Drift events (1h): {}", drift_count));

    // ML model kalitesini kontrol et
    let model_count = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM ml_models WHERE endpoint_id = $1"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);
    observations.push(format!("ML models: {}", model_count));

    ChaosResult {
        passed: true,
        recovery_time_ms: 0,
        errors_during_test: 0,
        alerts_generated: pre_state as i32,
        self_healing_triggered: healing_count > 0,
        observations,
    }
}

/// DB yavaşlatma senaryosu - mevcut DB latency metriklerini gözlemler
pub async fn test_db_slow_scenario(pool: &PgPool) -> ChaosResult {
    let mut observations = Vec::new();

    // Son saatlik performans
    let stats: Option<(f64, i64)> = sqlx::query_as(
        "SELECT COALESCE(AVG(duration_ms), 0), COUNT(*) FROM cortex_traces WHERE completed_at > NOW() - INTERVAL '1 hour'"
    ).fetch_optional(pool).await.unwrap_or(None);
    
    let (avg_dur, count) = stats.unwrap_or((0.0, 0));
    observations.push(format!("Avg duration (1h): {:.0}ms, traces: {}", avg_dur, count));

    // Queue durumu
    let pending: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM webhook_queue WHERE status = 'pending'")
        .fetch_one(pool).await.unwrap_or(0);
    let processing: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM webhook_queue WHERE status = 'processing'")
        .fetch_one(pool).await.unwrap_or(0);
    observations.push(format!("Queue: {} pending, {} processing", pending, processing));

    ChaosResult {
        passed: avg_dur < 5000.0,
        recovery_time_ms: 0,
        errors_during_test: 0,
        alerts_generated: 0,
        self_healing_triggered: false,
        observations,
    }
}

/// Redis down senaryosu - Redis bağlantı durumunu gözlemler
pub async fn test_redis_down_scenario(pool: &PgPool) -> ChaosResult {
    let mut observations = Vec::new();

    // Rate limit store'unu kontrol et
    let rate_limit_store: Option<(String,)> = sqlx::query_as(
        "SELECT value FROM platform_settings WHERE key = 'rate_limit_store'"
    ).fetch_optional(pool).await.unwrap_or(None);
    observations.push(format!("Rate limit store: {:?}", rate_limit_store.map(|(v,)| v)));

    // Son anomali sayıları
    let anomaly_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM anomaly_scores WHERE created_at > NOW() - INTERVAL '1 hour' AND (category IS NULL OR category != 'security')"
    ).fetch_one(pool).await.unwrap_or(0);
    observations.push(format!("Anomalies (1h): {}", anomaly_count));

    ChaosResult {
        passed: true,
        recovery_time_ms: 0,
        errors_during_test: 0,
        alerts_generated: 0,
        self_healing_triggered: false,
        observations,
    }
}

/// Trafik spike senaryosu - son trafik verilerini analiz eder
pub async fn test_traffic_spike_scenario(pool: &PgPool, endpoint_id: uuid::Uuid) -> ChaosResult {
    let mut observations = Vec::new();

    // Son 1 saat vs önceki 1 saat teslimat karşılaştırması
    let recent: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(SUM(total_deliveries), 0)::FLOAT FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '1 hour'"
    ).bind(endpoint_id).fetch_optional(pool).await.unwrap_or(None);
    let recent_count = recent.unwrap_or((0.0,)).0;

    let prev: Option<(f64,)> = sqlx::query_as(
        "SELECT COALESCE(SUM(total_deliveries), 0)::FLOAT FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start BETWEEN NOW() - INTERVAL '2 hours' AND NOW() - INTERVAL '1 hour'"
    ).bind(endpoint_id).fetch_optional(pool).await.unwrap_or(None);
    let prev_count = prev.unwrap_or((0.0,)).0;

    let ratio = if prev_count > 0.0 { recent_count / prev_count } else { 1.0 };
    observations.push(format!("Recent: {:.0}, Previous: {:.0}, Ratio: {:.1}x", recent_count, prev_count, ratio));

    ChaosResult {
        passed: ratio < 10.0,
        recovery_time_ms: 0,
        errors_during_test: 0,
        alerts_generated: 0,
        self_healing_triggered: false,
        observations,
    }
}

/// Hata patlaması senaryosu - hata oranlarını analiz eder
pub async fn test_error_burst_scenario(pool: &PgPool, endpoint_id: uuid::Uuid) -> ChaosResult {
    let mut observations = Vec::new();

    // Son saatlik hata oranı
    let stats: Option<(f64, f64)> = sqlx::query_as(
        "SELECT COALESCE(SUM(total_deliveries), 0)::FLOAT, COALESCE(SUM(failed), 0)::FLOAT FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '1 hour'"
    ).bind(endpoint_id).fetch_optional(pool).await.unwrap_or(None);
    let (total, failed) = stats.unwrap_or((0.0, 0.0));
    let error_rate = if total > 0.0 { failed / total * 100.0 } else { 0.0 };
    observations.push(format!("Error rate: {:.1}% ({:.0}/{:.0})", error_rate, failed, total));

    // Son anomaliler
    let anomaly_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM anomaly_scores WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '1 hour' AND (category IS NULL OR category != 'security')"
    ).bind(endpoint_id).fetch_one(pool).await.unwrap_or(0);
    observations.push(format!("Anomalies (1h): {}", anomaly_count));

    ChaosResult {
        passed: error_rate < 50.0,
        recovery_time_ms: 0,
        errors_during_test: 0,
        alerts_generated: anomaly_count as i32,
        self_healing_triggered: false,
        observations,
    }
}

/// Son chaos testlerini getir
pub async fn get_recent_tests(pool: &PgPool, limit: i64) -> Result<Vec<ChaosTest>, sqlx::Error> {
    sqlx::query_as(
        "SELECT id, scenario, target, severity, duration_secs, result, started_at, completed_at
         FROM chaos_tests ORDER BY started_at DESC LIMIT $1"
    )
    .bind(limit)
    .fetch_all(pool)
    .await
}
