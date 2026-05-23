//! Stage 3: Anomaly Scorer — ML-Powered
//!
//! Uses adaptive thresholds (EWMA + IQR) and statistical anomaly detection
//! instead of fixed formulas. Each endpoint has its own learned "normal".

use super::config::CortexConfig;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AnomalyResult {
    pub score: i32,
    pub factors: serde_json::Value,
    pub category: String,
}

/// Calculate anomaly score using ML models (adaptive thresholds + statistical detection).
/// Falls back to formula-based scoring if ML models aren't trained yet.
pub async fn score_endpoint(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
    config: &CortexConfig,
) -> Result<Option<AnomalyResult>, sqlx::Error> {
    // Get latest hourly stats
    let row: Option<(i32, i32, i32, f64, f64, f64, f64, serde_json::Value)> = sqlx::query_as(
        r#"
        WITH latest AS (
            SELECT total_deliveries, successful, failed, avg_latency_ms,
                   p95_latency_ms, p99_latency_ms, error_breakdown
            FROM endpoint_hourly_stats
            WHERE endpoint_id = $1
            ORDER BY hour_start DESC LIMIT 1
        ),
        prof AS (
            SELECT latency_p95, latency_p99, success_rate_1h, avg_deliveries_per_hour
            FROM endpoint_profiles WHERE endpoint_id = $1
        )
        SELECT
            l.total_deliveries, l.successful, l.failed,
            COALESCE(p.latency_p95, $2)::FLOAT,
            COALESCE(p.latency_p99, $3)::FLOAT,
            COALESCE(p.success_rate_1h, 100.0)::FLOAT,
            COALESCE(p.avg_deliveries_per_hour, 0.0)::FLOAT,
            l.error_breakdown
        FROM latest l
        CROSS JOIN prof p
        "#
    )
    .bind(endpoint_id)
    .bind(config.anomaly_default_p95_ms)
    .bind(config.anomaly_default_p99_ms)
    .fetch_optional(pool)
    .await?;

    let (total, successful, failed, _p95, _p99, sr_1h, avg_per_hour, _errors) = match row {
        Some(r) => r,
        None => return Ok(None),
    };

    if total == 0 { return Ok(None); }

    let current_sr = if total > 0 { (successful as f64 / total as f64) * 100.0 } else { 100.0 };
    let current_latency = if total > 0 { (successful as f64 + failed as f64) / total as f64 } else { 0.0 };
    let delivery_rate = total as f64;

    // Try ML-based scoring first
    let ml_params = super::ml::get_model_params(pool, endpoint_id, "adaptive_threshold").await.unwrap_or(serde_json::json!({}));
    let ml_samples = ml_params.get("samples").and_then(|s| s.as_i64()).unwrap_or(0);

    let (score, factors, method) = if ml_samples >= 10 {
        // ML path: use adaptive thresholds
        let model: super::ml::adaptive_thresholds::AdaptiveThresholdModel =
            serde_json::from_value(ml_params).unwrap_or_default();

        let (is_anomalous, ml_score, reason) = super::ml::adaptive_thresholds::is_anomalous(
            &model, current_sr, current_latency,
        );

        let _ = is_anomalous; // we use score directly

        // Also run statistical anomaly detection
        let det_params = super::ml::get_model_params(pool, endpoint_id, "anomaly_detector").await.unwrap_or(serde_json::json!({}));
        let det_model: super::ml::anomaly_detection::AnomalyDetectorModel =
            serde_json::from_value(det_params).unwrap_or_default();

        let det_result = super::ml::anomaly_detection::detect(&det_model, current_sr, current_latency, delivery_rate);

        // Combine scores: weighted average of adaptive threshold + statistical detection
        let combined_score = (ml_score * 0.5 + det_result.score * 0.5).min(100.0);

        let factors = serde_json::json!({
            "adaptive_threshold": { "score": ml_score, "reason": reason },
            "statistical_detection": { "score": det_result.score, "methods": det_result.methods },
            "ml_confidence": det_result.confidence,
            "ml_samples": ml_samples,
        });

        (combined_score.round() as i32, factors, "ml")
    } else {
        // Fallback: formula-based scoring (ML not trained yet)
        let mut weighted_score = 0.0f64;
        let mut factors_map = serde_json::Map::new();

        let latency_ratio = if current_latency > 0.0 { current_latency / sr_1h.max(1.0) } else { 1.0 };
        let latency_score = ((latency_ratio - 1.0) * 100.0).max(0.0).min(100.0);
        factors_map.insert("latency_spike".into(), serde_json::json!(latency_score));
        weighted_score += latency_score * config.anomaly_weights.latency_spike;

        let sr_drop = (sr_1h - current_sr).max(0.0);
        let sr_score = (sr_drop * 2.0).min(100.0);
        factors_map.insert("success_drop".into(), serde_json::json!(sr_score));
        weighted_score += sr_score * config.anomaly_weights.success_drop;

        let expected_failures = if avg_per_hour > 0.0 { avg_per_hour * (1.0 - sr_1h / 100.0) } else { 0.0 };
        let error_ratio = if expected_failures > 0.0 { failed as f64 / expected_failures } else { failed as f64 };
        let error_score = ((error_ratio - 1.0) * 50.0).max(0.0).min(100.0);
        factors_map.insert("error_burst".into(), serde_json::json!(error_score));
        weighted_score += error_score * config.anomaly_weights.error_burst;

        let traffic_ratio = if avg_per_hour > 0.0 { delivery_rate / avg_per_hour } else { 1.0 };
        let traffic_score = ((traffic_ratio - 2.0).abs() * 30.0).max(0.0).min(100.0);
        factors_map.insert("traffic_anomaly".into(), serde_json::json!(traffic_score));
        weighted_score += traffic_score * config.anomaly_weights.traffic_anomaly;

        let consec_score = if total > 0 && successful == 0 { 100.0 } else { 0.0 };
        factors_map.insert("consecutive_failures".into(), serde_json::json!(consec_score));
        weighted_score += consec_score * config.anomaly_weights.consecutive_failures;

        (weighted_score.round() as i32, serde_json::Value::Object(factors_map), "formula")
    };

    let category = if score >= 80 { "critical" }
        else if score >= config.anomaly_high_threshold { "high" }
        else if score >= 40 { "medium" }
        else { "low" }.to_string();

    // Store the anomaly score
    let customer_id: Option<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT customer_id FROM endpoints WHERE id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    let cid = customer_id.map(|(c,)| c).unwrap_or(uuid::Uuid::nil());

    let mut factors_json = factors;
    if let Some(obj) = factors_json.as_object_mut() {
        obj.insert("method".into(), serde_json::json!(method));
    }

    // Only store medium+ anomalies (score >= 40) — low scores are noise
    if score >= 40 {
        sqlx::query(
            "INSERT INTO anomaly_scores (endpoint_id, customer_id, score, factors, category) VALUES ($1, $2, $3, $4, $5)"
        ).bind(endpoint_id).bind(cid).bind(score).bind(&factors_json).bind(&category)
        .execute(pool).await?;
    }

    Ok(Some(AnomalyResult { score, factors: factors_json, category }))
}
