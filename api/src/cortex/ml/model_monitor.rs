//! Model Monitoring — Per-endpoint model sağlık izleme
//!
//! Her ML modelinin performansını sürekli izler:
//! - Accuracy, Precision, Recall, F1 Score
//! - False Positive / False Negative oranları
//! - Model yaşı ve eğitim örnek sayısı
//! - Kötüleşen modelleri otomatik tespit eder

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// Model sağlık raporu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelHealth {
    pub endpoint_id: Uuid,
    pub model_type: String,
    pub health_status: HealthStatus,
    pub accuracy: f64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub false_positive_rate: f64,
    pub false_negative_rate: f64,
    pub predictions_total: i64,
    pub model_age_hours: f64,
    pub training_samples: i32,
    pub quality_score: f64, // 0-100
    pub issues: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
    Degraded,
}

impl std::fmt::Display for HealthStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            HealthStatus::Healthy => write!(f, "healthy"),
            HealthStatus::Warning => write!(f, "warning"),
            HealthStatus::Critical => write!(f, "critical"),
            HealthStatus::Degraded => write!(f, "degraded"),
        }
    }
}

/// Platform geneli model sağlık özeti
#[derive(Debug, Serialize)]
pub struct PlatformModelSummary {
    pub total_models: i64,
    pub healthy: i64,
    pub warning: i64,
    pub critical: i64,
    pub degraded: i64,
    pub avg_accuracy: f64,
    pub avg_f1: f64,
    pub worst_models: Vec<ModelHealth>,
}

/// Tek bir modelin sağlık durumunu hesapla
pub async fn check_model_health(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
) -> Result<Option<ModelHealth>, sqlx::Error> {
    // Model bilgisini al
    let model: Option<(serde_json::Value, Option<i32>, Option<chrono::DateTime<chrono::Utc>>)> = sqlx::query_as(
        "SELECT parameters, training_samples, last_trained FROM ml_models WHERE endpoint_id = $1 AND model_type = $2"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;

    let (params, training_samples, last_trained) = match model {
        Some(m) => m,
        None => return Ok(None),
    };
    let _params = params;
    let training_samples = training_samples.unwrap_or(0);

    // Son 24 saatteki prediction outcome'ları say
    let outcomes: Option<(i64, i64, i64)> = sqlx::query_as(
        "SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE within_tolerance = true) as correct,
            COUNT(*) FILTER (WHERE within_tolerance = false) as incorrect
         FROM ml_prediction_outcomes
         WHERE endpoint_id = $1 AND model_type = $2 AND recorded_at > NOW() - INTERVAL '24 hours'"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;

    let (total, correct, _incorrect) = outcomes.unwrap_or((0, 0, 0));

    let accuracy = if total > 0 { correct as f64 / total as f64 * 100.0 } else { 100.0 };
    let false_positive_rate = if total > 0 {
        // False positive: anomali alerti ama aslında normal
        let fp: Option<(i64,)> = sqlx::query_as(
            "SELECT COUNT(*) FROM ml_prediction_outcomes
             WHERE endpoint_id = $1 AND model_type = $2 AND predicted_anomaly = true AND actual_anomaly = false
             AND recorded_at > NOW() - INTERVAL '24 hours'"
        )
        .bind(endpoint_id)
        .bind(model_type)
        .fetch_optional(pool)
        .await?;
        fp.map(|(c,)| c).unwrap_or(0) as f64 / total as f64 * 100.0
    } else {
        0.0
    };

    let false_negative_rate = if total > 0 {
        let fn_: Option<(i64,)> = sqlx::query_as(
            "SELECT COUNT(*) FROM ml_prediction_outcomes
             WHERE endpoint_id = $1 AND model_type = $2 AND predicted_anomaly = false AND actual_anomaly = true
             AND recorded_at > NOW() - INTERVAL '24 hours'"
        )
        .bind(endpoint_id)
        .bind(model_type)
        .fetch_optional(pool)
        .await?;
        fn_.map(|(c,)| c).unwrap_or(0) as f64 / total as f64 * 100.0
    } else {
        0.0
    };

    // Precision, Recall, F1 hesapla
    let tp = correct as f64;
    let fp = false_positive_rate * total as f64 / 100.0;
    let fn_ = false_negative_rate * total as f64 / 100.0;

    let precision = if tp + fp > 0.0 { tp / (tp + fp) * 100.0 } else { 100.0 };
    let recall = if tp + fn_ > 0.0 { tp / (tp + fn_) * 100.0 } else { 100.0 };
    let f1 = if precision + recall > 0.0 { 2.0 * precision * recall / (precision + recall) } else { 0.0 };

    // Model yaşı
    let model_age_hours = last_trained
        .map(|t| chrono::Utc::now().signed_duration_since(t).num_minutes() as f64 / 60.0)
        .unwrap_or(0.0);

    // Quality score: %60 accuracy + %25 low FP + %15 stability
    let fp_score = (100.0 - false_positive_rate).max(0.0);
    let stability = if total >= 10 { 100.0 } else { total as f64 * 10.0 };
    let quality_score = accuracy * 0.60 + fp_score * 0.25 + stability * 0.15;

    // Sağlık durumu belirle
    let mut issues = Vec::new();
    if accuracy < 70.0 { issues.push(format!("accuracy_low ({:.0}%)", accuracy)); }
    if f1 < 60.0 { issues.push(format!("f1_low ({:.0}%)", f1)); }
    if false_positive_rate > 20.0 { issues.push(format!("false_positives_high ({:.0}%)", false_positive_rate)); }
    if false_negative_rate > 30.0 { issues.push(format!("false_negatives_high ({:.0}%)", false_negative_rate)); }
    if model_age_hours > 168.0 { issues.push(format!("model_stale ({:.0}h)", model_age_hours)); }
    if training_samples < 10 { issues.push(format!("few_samples ({})", training_samples)); }

    let health_status = if issues.is_empty() {
        HealthStatus::Healthy
    } else if accuracy < 50.0 || f1 < 40.0 {
        HealthStatus::Critical
    } else if accuracy < 70.0 || f1 < 60.0 {
        HealthStatus::Degraded
    } else {
        HealthStatus::Warning
    };

    Ok(Some(ModelHealth {
        endpoint_id,
        model_type: model_type.to_string(),
        health_status,
        accuracy,
        precision,
        recall,
        f1_score: f1,
        false_positive_rate,
        false_negative_rate,
        predictions_total: total,
        model_age_hours,
        training_samples,
        quality_score,
        issues,
    }))
}

/// Tüm endpoint'ler için tüm modellerin sağlık durumunu kontrol et
pub async fn check_all_models(pool: &PgPool) -> Result<Vec<ModelHealth>, sqlx::Error> {
    let model_types = [
        "adaptive_threshold",
        "anomaly_detector",
        "retry_bandit",
        "circuit_bandit",
        "time_series",
        "contextual_bandit",
        "drift_detector",
    ];

    let endpoints: Vec<(Uuid,)> = sqlx::query_as(
        "SELECT DISTINCT endpoint_id FROM ml_models"
    )
    .fetch_all(pool)
    .await?;

    let mut results = Vec::new();
    for (eid,) in &endpoints {
        for mt in &model_types {
            if let Some(health) = check_model_health(pool, *eid, mt).await? {
                results.push(health);
            }
        }
    }

    Ok(results)
}

/// Platform geneli model sağlık özeti
pub async fn get_platform_summary(pool: &PgPool) -> Result<PlatformModelSummary, sqlx::Error> {
    let all = check_all_models(pool).await?;
    let total = all.len() as i64;
    let healthy = all.iter().filter(|h| h.health_status == HealthStatus::Healthy).count() as i64;
    let warning = all.iter().filter(|h| h.health_status == HealthStatus::Warning).count() as i64;
    let critical = all.iter().filter(|h| h.health_status == HealthStatus::Critical).count() as i64;
    let degraded = all.iter().filter(|h| h.health_status == HealthStatus::Degraded).count() as i64;
    let avg_accuracy = if total > 0 { all.iter().map(|h| h.accuracy).sum::<f64>() / total as f64 } else { 0.0 };
    let avg_f1 = if total > 0 { all.iter().map(|h| h.f1_score).sum::<f64>() / total as f64 } else { 0.0 };

    let mut worst = all.clone();
    worst.sort_by(|a, b| a.quality_score.partial_cmp(&b.quality_score).unwrap());
    let worst_models: Vec<ModelHealth> = worst.into_iter().take(10).collect();

    Ok(PlatformModelSummary {
        total_models: total,
        healthy,
        warning,
        critical,
        degraded,
        avg_accuracy,
        avg_f1,
        worst_models,
    })
}
