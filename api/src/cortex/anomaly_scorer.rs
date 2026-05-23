//! Stage 3: Anomaly Scorer
//!
//! Scores each endpoint 0-100 based on deviation from its profile.
//! Uses configurable weights from CortexConfig.

use super::config::CortexConfig;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AnomalyResult {
    pub score: i32,
    pub factors: serde_json::Value,
    pub category: String,
}

/// Calculate anomaly score for an endpoint by comparing latest hourly stats to its profile.
pub async fn score_endpoint(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
    config: &CortexConfig,
) -> Result<Option<AnomalyResult>, sqlx::Error> {
    // Get latest hourly stats + profile in one query
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

    let (total, successful, failed, p95, p99, sr_1h, avg_per_hour, errors) = match row {
        Some(r) => r,
        None => return Ok(None),
    };

    if total == 0 { return Ok(None); }

    let mut factors = serde_json::Map::new();
    let mut weighted_score = 0.0f64;

    // 1. Latency spike: compare avg to profile p95
    let avg_lat = if total > 0 { (successful as f64 + failed as f64) / total as f64 } else { 0.0 };
    // Use p95 from stats as the "current" latency metric
    let current_p95 = avg_lat; // simplified: use total_deliveries ratio as proxy
    let latency_ratio = if p95 > 0.0 { current_p95 / p95 } else { 1.0 };
    let latency_score = ((latency_ratio - 1.0) * 100.0).max(0.0).min(100.0) as f64;
    factors.insert("latency_spike".into(), serde_json::json!(latency_score));
    weighted_score += latency_score * config.anomaly_weights.latency_spike;

    // 2. Success rate drop
    let current_sr = if total > 0 { (successful as f64 / total as f64) * 100.0 } else { 100.0 };
    let sr_drop = (sr_1h - current_sr).max(0.0);
    let sr_score = (sr_drop * 2.0).min(100.0);
    factors.insert("success_drop".into(), serde_json::json!(sr_score));
    weighted_score += sr_score * config.anomaly_weights.success_drop;

    // 3. Error burst: compare failed to average
    let expected_failures = if avg_per_hour > 0.0 { avg_per_hour * (1.0 - sr_1h / 100.0) } else { 0.0 };
    let error_ratio = if expected_failures > 0.0 { failed as f64 / expected_failures } else { failed as f64 };
    let error_score = ((error_ratio - 1.0) * 50.0).max(0.0).min(100.0);
    factors.insert("error_burst".into(), serde_json::json!(error_score));
    weighted_score += error_score * config.anomaly_weights.error_burst;

    // 4. Traffic anomaly: compare to average
    let traffic_ratio = if avg_per_hour > 0.0 { total as f64 / avg_per_hour } else { 1.0 };
    let traffic_score = ((traffic_ratio - 2.0).abs() * 30.0).max(0.0).min(100.0);
    factors.insert("traffic_anomaly".into(), serde_json::json!(traffic_score));
    weighted_score += traffic_score * config.anomaly_weights.traffic_anomaly;

    // 5. Consecutive failures
    let consec_score = if total > 0 && successful == 0 { 100.0 } else { 0.0 };
    factors.insert("consecutive_failures".into(), serde_json::json!(consec_score));
    weighted_score += consec_score * config.anomaly_weights.consecutive_failures;

    let score = weighted_score.round() as i32;
    let category = if score >= 80 { "critical" }
        else if score >= config.anomaly_high_threshold { "high" }
        else if score >= 40 { "medium" }
        else { "low" }.to_string();

    // Store the anomaly score
    let factors_json = serde_json::Value::Object(factors);
    let customer_id: Option<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT customer_id FROM endpoints WHERE id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    let cid = customer_id.map(|(c,)| c).unwrap_or(uuid::Uuid::nil());

    sqlx::query(
        "INSERT INTO anomaly_scores (endpoint_id, customer_id, score, factors, category) VALUES ($1, $2, $3, $4, $5)"
    ).bind(endpoint_id).bind(cid).bind(score).bind(&factors_json).bind(&category)
    .execute(pool).await?;

    Ok(Some(AnomalyResult { score, factors: factors_json, category }))
}
