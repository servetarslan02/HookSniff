//! A/B Testing Framework — Model karşılaştırma
//!
//! İki modeli aynı endpoint üzerinde karşılaştırır:
//! - Trafik split (A/B)
//! - İstatistiksel anlamlılık testi
//! - Kazanan otomatik belirleme

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// A/B Test kaydı
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbTest {
    pub id: i64,
    pub endpoint_id: Uuid,
    pub model_type: String,
    pub variant_a: String,      // Model A tanımı
    pub variant_b: String,      // Model B tanımı
    pub split_ratio: f64,       // 0.0-1.0 (A'ya giden trafik oranı)
    pub metric: String,         // "accuracy", "latency", "f1"
    pub status: String,         // "running", "completed", "cancelled"
    pub winner: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// A/B Test sonucu
#[derive(Debug, Serialize)]
pub struct AbTestResult {
    pub test_id: i64,
    pub variant_a_metrics: VariantMetrics,
    pub variant_b_metrics: VariantMetrics,
    pub statistical_significance: f64,
    pub winner: Option<String>,
    pub recommendation: String,
}

#[derive(Debug, Serialize)]
pub struct VariantMetrics {
    pub variant: String,
    pub predictions: i64,
    pub accuracy: f64,
    pub avg_reward: f64,
    pub avg_latency: f64,
}

/// Yeni A/B testi başlat
pub async fn start_ab_test(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    variant_a: &str,
    variant_b: &str,
    split_ratio: f64,
) -> Result<i64, sqlx::Error> {
    // Mevcut aktif test var mı?
    let active: Option<(i64,)> = sqlx::query_as(
        "SELECT id FROM ab_tests WHERE endpoint_id = $1 AND model_type = $2 AND status = 'running'"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;

    if active.is_some() {
        // Aktif testi iptal et
        sqlx::query(
            "UPDATE ab_tests SET status = 'cancelled' WHERE endpoint_id = $1 AND model_type = $2 AND status = 'running'"
        )
        .bind(endpoint_id)
        .bind(model_type)
        .execute(pool)
        .await?;
    }

    let id: (i64,) = sqlx::query_as(
        "INSERT INTO ab_tests (endpoint_id, model_type, variant_a, variant_b, split_ratio, metric, status)
         VALUES ($1, $2, $3, $4, $5, 'accuracy', 'running') RETURNING id"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(variant_a)
    .bind(variant_b)
    .bind(split_ratio)
    .fetch_one(pool)
    .await?;

    Ok(id.0)
}

/// A/B test sonucunu kaydet
pub async fn record_ab_decision(
    pool: &PgPool,
    test_id: i64,
    variant: &str,
    reward: f64,
    latency: f64,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO ab_test_decisions (test_id, variant, reward, latency_ms)
         VALUES ($1, $2, $3, $4)"
    )
    .bind(test_id)
    .bind(variant)
    .bind(reward)
    .bind(latency)
    .execute(pool)
    .await?;

    Ok(())
}

/// Rastgele varyant seç (split_ratio'ya göre)
pub fn select_variant(split_ratio: f64) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos();
    let r = (nanos % 1000) as f64 / 1000.0;

    if r < split_ratio { "A".to_string() } else { "B".to_string() }
}

/// Test sonucunu analiz et
pub async fn analyze_ab_test(
    pool: &PgPool,
    test_id: i64,
) -> Result<Option<AbTestResult>, sqlx::Error> {
    let test: Option<(Uuid, String, String, String, f64)> = sqlx::query_as(
        "SELECT endpoint_id, model_type, variant_a, variant_b, split_ratio FROM ab_tests WHERE id = $1"
    )
    .bind(test_id)
    .fetch_optional(pool)
    .await?;

    let (_, _, variant_a_name, variant_b_name, _) = match test {
        Some(t) => t,
        None => return Ok(None),
    };

    // A varyantı metrikleri
    let a_metrics: Option<(i64, f64, f64)> = sqlx::query_as(
        "SELECT COUNT(*), COALESCE(AVG(reward), 0), COALESCE(AVG(latency_ms), 0)
         FROM ab_test_decisions WHERE test_id = $1 AND variant = 'A'"
    )
    .bind(test_id)
    .fetch_optional(pool)
    .await?;
    let (a_count, a_avg_reward, a_avg_latency) = a_metrics.unwrap_or((0, 0.0, 0.0));

    // B varyantı metrikleri
    let b_metrics: Option<(i64, f64, f64)> = sqlx::query_as(
        "SELECT COUNT(*), COALESCE(AVG(reward), 0), COALESCE(AVG(latency_ms), 0)
         FROM ab_test_decisions WHERE test_id = $1 AND variant = 'B'"
    )
    .bind(test_id)
    .fetch_optional(pool)
    .await?;
    let (b_count, b_avg_reward, b_avg_latency) = b_metrics.unwrap_or((0, 0.0, 0.0));

    // Accuracy (reward > 0.5 = correct)
    let a_correct: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM ab_test_decisions WHERE test_id = $1 AND variant = 'A' AND reward > 0.5"
    )
    .bind(test_id)
    .fetch_optional(pool)
    .await?;
    let a_accuracy = if a_count > 0 { a_correct.unwrap_or((0,)).0 as f64 / a_count as f64 * 100.0 } else { 0.0 };

    let b_correct: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM ab_test_decisions WHERE test_id = $1 AND variant = 'B' AND reward > 0.5"
    )
    .bind(test_id)
    .fetch_optional(pool)
    .await?;
    let b_accuracy = if b_count > 0 { b_correct.unwrap_or((0,)).0 as f64 / b_count as f64 * 100.0 } else { 0.0 };

    // İstatistiksel anlamlılık (basit z-test)
    let n = a_count.min(b_count) as f64;
    let significance = if n >= 30.0 {
        let p_a = a_accuracy / 100.0;
        let p_b = b_accuracy / 100.0;
        let p_pool = (p_a * n + p_b * n) / (2.0 * n);
        let se = if p_pool > 0.0 && p_pool < 1.0 {
            (p_pool * (1.0 - p_pool) * 2.0 / n).sqrt()
        } else {
            0.0
        };
        if se > 0.0 {
            let z = (p_a - p_b).abs() / se;
            // p-value approximation
            (-z * z / 2.0).exp()
        } else {
            1.0
        }
    } else {
        1.0 // Yetersiz veri
    };

    let winner = if n >= 30.0 && significance < 0.05 {
        if a_avg_reward > b_avg_reward { Some(variant_a_name.clone()) } else { Some(variant_b_name.clone()) }
    } else {
        None
    };

    let recommendation = if n < 30.0 {
        "Yetersiz veri — en az 30 gözlem gerekli".to_string()
    } else if significance < 0.05 {
        format!("{} kazandı (p={:.3}, n={})", winner.as_deref().unwrap_or("?"), significance, n)
    } else {
        "İstatistiksel anlamlılık yok — test devam etmeli".to_string()
    };

    Ok(Some(AbTestResult {
        test_id,
        variant_a_metrics: VariantMetrics {
            variant: variant_a_name,
            predictions: a_count,
            accuracy: a_accuracy,
            avg_reward: a_avg_reward,
            avg_latency: a_avg_latency,
        },
        variant_b_metrics: VariantMetrics {
            variant: variant_b_name,
            predictions: b_count,
            accuracy: b_accuracy,
            avg_reward: b_avg_reward,
            avg_latency: b_avg_latency,
        },
        statistical_significance: significance,
        winner,
        recommendation,
    }))
}
