//! ML Engine — Cortex Machine Learning Pipeline
//!
//! Implements real ML algorithms (not rule-based):
//! - Adaptive Thresholds (EWMA + IQR)
//! - Statistical Anomaly Detection (Modified Z-Score + Mahalanobis)
//! - Multi-Armed Bandit (UCB1 + Epsilon-Greedy)
//! - Time Series Forecasting (Exponential Smoothing + Linear Regression)
//! - Contextual Bandit (Thompson Sampling)

pub mod adaptive_thresholds;
pub mod anomaly_detection;
pub mod bandit;
pub mod time_series;
pub mod contextual_bandit;
pub mod quality_tracker;

use sqlx::PgPool;

/// Initialize ML models for an endpoint (called when endpoint is first created)
pub async fn init_endpoint_models(pool: &PgPool, endpoint_id: uuid::Uuid) -> Result<(), sqlx::Error> {
    let models = [
        "adaptive_threshold",
        "anomaly_detector",
        "retry_bandit",
        "circuit_bandit",
        "time_series",
        "contextual_bandit",
    ];
    for model_type in &models {
        sqlx::query(
            "INSERT INTO ml_models (endpoint_id, model_type, parameters) VALUES ($1, $2, '{}') ON CONFLICT (endpoint_id, model_type) DO NOTHING"
        )
        .bind(endpoint_id)
        .bind(model_type)
        .execute(pool)
        .await?;
    }
    Ok(())
}

/// Get model parameters for an endpoint
pub async fn get_model_params(pool: &PgPool, endpoint_id: uuid::Uuid, model_type: &str) -> Result<serde_json::Value, sqlx::Error> {
    let result: Option<(serde_json::Value,)> = sqlx::query_as(
        "SELECT parameters FROM ml_models WHERE endpoint_id = $1 AND model_type = $2"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;
    Ok(result.map(|(p,)| p).unwrap_or(serde_json::json!({})))
}

/// Save model parameters for an endpoint
pub async fn save_model_params(pool: &PgPool, endpoint_id: uuid::Uuid, model_type: &str, params: &serde_json::Value, samples: i32) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO ml_models (endpoint_id, model_type, parameters, training_samples, last_trained, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (endpoint_id, model_type) DO UPDATE SET
           parameters = $3, training_samples = $4, last_trained = NOW(), updated_at = NOW()"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(params)
    .bind(samples)
    .execute(pool)
    .await?;
    Ok(())
}

/// Record a feature value for an endpoint
pub async fn record_feature(pool: &PgPool, endpoint_id: uuid::Uuid, name: &str, value: f64) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO ml_features (endpoint_id, feature_name, feature_value) VALUES ($1, $2, $3)"
    )
    .bind(endpoint_id)
    .bind(name)
    .bind(value)
    .execute(pool)
    .await?;
    Ok(())
}

/// Record a decision and its outcome
pub async fn record_decision(pool: &PgPool, endpoint_id: uuid::Uuid, decision_type: &str, action: &str, context: serde_json::Value) -> Result<i64, sqlx::Error> {
    let id: (i64,) = sqlx::query_as(
        "INSERT INTO ml_decisions (endpoint_id, decision_type, chosen_action, context) VALUES ($1, $2, $3, $4) RETURNING id"
    )
    .bind(endpoint_id)
    .bind(decision_type)
    .bind(action)
    .bind(context)
    .fetch_one(pool)
    .await?;
    Ok(id.0)
}

/// Evaluate a decision (update reward)
pub async fn evaluate_decision(pool: &PgPool, decision_id: i64, reward: f64, regret: f64) -> Result<(), sqlx::Error> {
    sqlx::query(
        "UPDATE ml_decisions SET reward = $1, regret = $2, evaluated_at = NOW() WHERE id = $3"
    )
    .bind(reward)
    .bind(regret)
    .bind(decision_id)
    .execute(pool)
    .await?;
    Ok(())
}

/// Run full ML training cycle for all endpoints
pub async fn train_all(pool: &PgPool) -> Result<u64, sqlx::Error> {
    let endpoints: Vec<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT DISTINCT endpoint_id FROM endpoint_hourly_stats"
    ).fetch_all(pool).await?;

    let mut trained = 0u64;
    for (eid,) in &endpoints {
        if let Err(e) = train_endpoint(pool, *eid).await {
            tracing::warn!("ML training failed for endpoint {}: {:?}", eid, e);
        } else {
            trained += 1;
        }
    }
    Ok(trained)
}

/// Train all ML models for a single endpoint
async fn train_endpoint(pool: &PgPool, endpoint_id: uuid::Uuid) -> Result<(), sqlx::Error> {
    // Get hourly stats for this endpoint
    let stats: Vec<(f64, f64, f64, f64, i32)> = sqlx::query_as(
        "SELECT COALESCE(total_deliveries, 0)::FLOAT, COALESCE(successful, 0)::FLOAT, COALESCE(failed, 0)::FLOAT, COALESCE(avg_latency_ms, 0)::FLOAT, COALESCE(p95_latency_ms, 0) FROM endpoint_hourly_stats WHERE endpoint_id = $1 ORDER BY hour_start"
    ).bind(endpoint_id).fetch_all(pool).await?;

    if stats.len() < 3 { return Ok(()); }

    // Extract feature vectors
    let success_rates: Vec<f64> = stats.iter().map(|(t, s, _, _, _)| if *t > 0.0 { s / t * 100.0 } else { 100.0 }).collect();
    let latencies: Vec<f64> = stats.iter().map(|(_, _, _, l, _)| *l).collect();
    let p95_latencies: Vec<f64> = stats.iter().map(|(_, _, _, _, p)| *p as f64).collect();
    let delivery_rates: Vec<f64> = stats.iter().map(|(t, _, _, _, _)| *t).collect();

    // 1. Train Adaptive Thresholds (EWMA + IQR)
    adaptive_thresholds::train(pool, endpoint_id, &success_rates, &latencies, &p95_latencies).await?;

    // 2. Train Anomaly Detector
    anomaly_detection::train(pool, endpoint_id, &success_rates, &latencies, &delivery_rates).await?;

    // 3. Train Time Series Forecaster
    time_series::train(pool, endpoint_id, &success_rates, &latencies).await?;

    // 4. Bandit models are trained online (not batch)
    // Initialize if not exists
    bandit::init_if_needed(pool, endpoint_id).await?;

    Ok(())
}
