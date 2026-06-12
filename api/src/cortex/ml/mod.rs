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
pub mod bootstrap;
pub mod drift_detection;
pub mod model_monitor;
pub mod explainable;
pub mod cortex_tracing;
pub mod feature_store;
pub mod versioning;
pub mod advanced_forecast;
pub mod chaos;
pub mod ab_testing;
pub mod automl;
#[cfg(test)]
mod tests;

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
        "drift_detector",
        "healing_bandit",
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

/// Run full ML training cycle for all endpoints.
/// BATCH MODE: Single query for all data, in-memory training, batch save.
pub async fn train_all(pool: &PgPool) -> Result<u64, sqlx::Error> {
    // 1. BATCH FETCH: All hourly stats in ONE query
    let all_stats_rows: Vec<(uuid::Uuid, f64, f64, f64, f64, i32)> = sqlx::query_as(
        "SELECT endpoint_id, \
         COALESCE(total_deliveries, 0)::FLOAT, \
         COALESCE(successful, 0)::FLOAT, \
         COALESCE(failed, 0)::FLOAT, \
         COALESCE(avg_latency_ms, 0)::FLOAT, \
         COALESCE(p95_latency_ms, 0) \
         FROM endpoint_hourly_stats ORDER BY endpoint_id, hour_start"
    ).fetch_all(pool).await?;

    // Group by endpoint_id in-memory
    let mut grouped: std::collections::HashMap<uuid::Uuid, Vec<(f64, f64, f64, f64, i32)>> =
        std::collections::HashMap::new();
    for (eid, total, successful, failed, avg_lat, p95_lat) in all_stats_rows {
        grouped.entry(eid).or_default().push((total, successful, failed, avg_lat, p95_lat));
    }

    // 2. BATCH FETCH: All existing models in ONE query
    let model_rows: Vec<(uuid::Uuid, String, serde_json::Value, i32)> = sqlx::query_as(
        "SELECT endpoint_id, model_type, parameters, COALESCE(training_samples, 0) \
         FROM ml_models WHERE model_type IN ('adaptive_threshold', 'anomaly_detector', 'ts_success_rate', 'ts_latency')"
    ).fetch_all(pool).await?;

    let mut models_by_endpoint: std::collections::HashMap<uuid::Uuid, std::collections::HashMap<String, (serde_json::Value, i32)>> =
        std::collections::HashMap::new();
    for (eid, mtype, params, samples) in model_rows {
        models_by_endpoint.entry(eid).or_default().insert(mtype, (params, samples));
    }

    // 3. TRAIN: Pure in-memory computation per endpoint
    let mut save_queue: Vec<(uuid::Uuid, String, serde_json::Value, i32)> = Vec::new();
    let mut feature_queue: Vec<(uuid::Uuid, String, f64)> = Vec::new();
    let mut trained = 0u64;

    for (endpoint_id, stats) in &grouped {
        if stats.len() < 3 { continue; }

        let success_rates: Vec<f64> = stats.iter().map(|(t, s, _, _, _)| if *t > 0.0 { s / t * 100.0 } else { 100.0 }).collect();
        let latencies: Vec<f64> = stats.iter().map(|(_, _, _, l, _)| *l).collect();
        let p95_latencies: Vec<f64> = stats.iter().map(|(_, _, _, _, p)| *p as f64).collect();
        let delivery_rates: Vec<f64> = stats.iter().map(|(t, _, _, _, _)| *t).collect();

        let endpoint_models = models_by_endpoint.get(endpoint_id);

        // 3a. Adaptive Thresholds
        let at_params = endpoint_models
            .and_then(|m| m.get("adaptive_threshold"))
            .map(|(p, _)| p.clone())
            .unwrap_or(serde_json::json!({}));
        let mut at_model: adaptive_thresholds::AdaptiveThresholdModel =
            serde_json::from_value(at_params).unwrap_or_default();
        train_adaptive_thresholds_in_memory(&mut at_model, &success_rates, &latencies, &p95_latencies);
        let at_json = serde_json::to_value(&at_model).unwrap();
        save_queue.push((*endpoint_id, "adaptive_threshold".to_string(), at_json, at_model.samples));
        feature_queue.push((*endpoint_id, "ewma_success_rate".to_string(), at_model.ewma_success_rate));
        feature_queue.push((*endpoint_id, "ewma_latency".to_string(), at_model.ewma_latency));
        feature_queue.push((*endpoint_id, "ewma_sr_stddev".to_string(), at_model.ewma_sr_variance.sqrt()));

        // 3b. Anomaly Detector
        let ad_params = endpoint_models
            .and_then(|m| m.get("anomaly_detector"))
            .map(|(p, _)| p.clone())
            .unwrap_or(serde_json::json!({}));
        let mut ad_model: anomaly_detection::AnomalyDetectorModel =
            serde_json::from_value(ad_params).unwrap_or_default();
        train_anomaly_detector_in_memory(&mut ad_model, &success_rates, &latencies, &delivery_rates);
        let ad_json = serde_json::to_value(&ad_model).unwrap();
        save_queue.push((*endpoint_id, "anomaly_detector".to_string(), ad_json, ad_model.samples));

        // 3c. Time Series (SR model)
        let ts_sr_params = endpoint_models
            .and_then(|m| m.get("ts_success_rate"))
            .map(|(p, _)| p.clone())
            .unwrap_or(serde_json::json!({}));
        let mut ts_sr_model: time_series::TimeSeriesModel =
            serde_json::from_value(ts_sr_params).unwrap_or_else(|_| time_series::TimeSeriesModel::new("success_rate"));
        train_time_series_in_memory(&mut ts_sr_model, &success_rates);
        let ts_sr_json = serde_json::to_value(&ts_sr_model).unwrap();
        save_queue.push((*endpoint_id, "ts_success_rate".to_string(), ts_sr_json, ts_sr_model.samples));

        // 3d. Time Series (Latency model)
        let ts_lat_params = endpoint_models
            .and_then(|m| m.get("ts_latency"))
            .map(|(p, _)| p.clone())
            .unwrap_or(serde_json::json!({}));
        let mut ts_lat_model: time_series::TimeSeriesModel =
            serde_json::from_value(ts_lat_params).unwrap_or_else(|_| time_series::TimeSeriesModel::new("latency"));
        train_time_series_in_memory(&mut ts_lat_model, &latencies);
        let ts_lat_json = serde_json::to_value(&ts_lat_model).unwrap();
        save_queue.push((*endpoint_id, "ts_latency".to_string(), ts_lat_json, ts_lat_model.samples));

        trained += 1;
    }

    // 4. BATCH SAVE: All models in ONE query
    if !save_queue.is_empty() {
        let mut query = String::from(
            "INSERT INTO ml_models (endpoint_id, model_type, parameters, training_samples, last_trained, updated_at) VALUES "
        );
        let mut binds: Vec<String> = Vec::new();
        for (eid, mtype, params, samples) in save_queue.iter() {
            binds.push(format!("('${}'::uuid, '{}', '{}', {}, NOW(), NOW())",
                eid, mtype, params.to_string().replace('\'', "''"), samples));
        }
        query.push_str(&binds.join(", "));
        query.push_str(" ON CONFLICT (endpoint_id, model_type) DO UPDATE SET \
            parameters = EXCLUDED.parameters, training_samples = EXCLUDED.training_samples, \
            last_trained = NOW(), updated_at = NOW()");
        sqlx::query(&query).execute(pool).await?;
    }

    // 5. BATCH SAVE: Features in ONE query
    if !feature_queue.is_empty() {
        let mut query = String::from(
            "INSERT INTO ml_features (endpoint_id, feature_name, feature_value) VALUES "
        );
        let mut binds: Vec<String> = Vec::new();
        for (eid, name, value) in &feature_queue {
            binds.push(format!("('${}'::uuid, '{}', {})", eid, name.replace('\'', "''"), value));
        }
        query.push_str(&binds.join(", "));
        sqlx::query(&query).execute(pool).await?;
    }

    // 6. BATCH: Init bandit models for endpoints that don't have them
    let existing_bandits: Vec<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT DISTINCT endpoint_id FROM ml_models WHERE model_type = 'retry_bandit'"
    ).fetch_all(pool).await?;
    let existing_set: std::collections::HashSet<uuid::Uuid> = existing_bandits.into_iter().map(|(e,)| e).collect();
    for eid in grouped.keys() {
        if !existing_set.contains(eid) {
            if let Err(e) = bandit::init_if_needed(pool, *eid).await {
                tracing::warn!("Bandit init failed for {}: {:?}", eid, e);
            }
        }
    }

    Ok(trained)
}

/// Pure in-memory adaptive threshold training (no DB calls)
fn train_adaptive_thresholds_in_memory(
    model: &mut adaptive_thresholds::AdaptiveThresholdModel,
    success_rates: &[f64],
    latencies: &[f64],
    p95_latencies: &[f64],
) {
    let alpha = model.alpha;
    let one_minus_alpha = 1.0 - alpha;

    for (i, sr) in success_rates.iter().enumerate() {
        model.ewma_success_rate = alpha * sr + one_minus_alpha * model.ewma_success_rate;
        let sr_diff = sr - model.ewma_success_rate;
        model.ewma_sr_variance = alpha * sr_diff * sr_diff + one_minus_alpha * model.ewma_sr_variance;

        if i < latencies.len() {
            model.ewma_latency = alpha * latencies[i] + one_minus_alpha * model.ewma_latency;
            let lat_diff = latencies[i] - model.ewma_latency;
            model.ewma_latency_variance = alpha * lat_diff * lat_diff + one_minus_alpha * model.ewma_latency_variance;
        }
        if i < p95_latencies.len() {
            model.ewma_p95 = alpha * p95_latencies[i] + one_minus_alpha * model.ewma_p95;
        }
        model.samples += 1;
    }

    let mut sorted_sr = success_rates.to_vec();
    sorted_sr.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let n = sorted_sr.len();
    if n >= 4 {
        model.sr_q1 = sorted_sr[n / 4];
        model.sr_q3 = sorted_sr[3 * n / 4];
    }

    let mut sorted_lat = latencies.to_vec();
    sorted_lat.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let n = sorted_lat.len();
    if n >= 4 {
        model.latency_q1 = sorted_lat[n / 4];
        model.latency_q3 = sorted_lat[3 * n / 4];
    }
}

/// Pure in-memory anomaly detector training (no DB calls)
fn train_anomaly_detector_in_memory(
    model: &mut anomaly_detection::AnomalyDetectorModel,
    success_rates: &[f64],
    latencies: &[f64],
    delivery_rates: &[f64],
) {
    // Golden dataset protection
    let recent_median = anomaly_detection::median(success_rates);
    let (blended_sr, blended_lat, blended_del) = if recent_median < 95.0 && success_rates.len() >= 6 {
        let golden_sr = 100.0;
        let golden_lat = latencies.iter().sum::<f64>() / latencies.len().max(1) as f64 * 0.5;
        let golden_del = delivery_rates.iter().sum::<f64>() / delivery_rates.len().max(1) as f64;

        let mut sr = success_rates.to_vec();
        let golden_count = (sr.len() as f64 * 0.3).ceil() as usize;
        sr.extend(std::iter::repeat_n(golden_sr, golden_count));

        let mut lat = latencies.to_vec();
        lat.extend(std::iter::repeat_n(golden_lat, golden_count));

        let mut del = delivery_rates.to_vec();
        del.extend(std::iter::repeat_n(golden_del, golden_count));

        (sr, lat, del)
    } else {
        (success_rates.to_vec(), latencies.to_vec(), delivery_rates.to_vec())
    };

    model.sr_median = anomaly_detection::median(&blended_sr);
    model.sr_mad = anomaly_detection::mad(&blended_sr, model.sr_median);
    model.latency_median = anomaly_detection::median(&blended_lat);
    model.latency_mad = anomaly_detection::mad(&blended_lat, model.latency_median);
    model.delivery_median = anomaly_detection::median(&blended_del);
    model.delivery_mad = anomaly_detection::mad(&blended_del, model.delivery_median);
    model.sr_latency_correlation = anomaly_detection::pearson_correlation(&blended_sr, &blended_lat);

    let window_size = 48;
    model.recent_sr = blended_sr.iter().rev().take(window_size).rev().cloned().collect();
    model.recent_latency = blended_lat.iter().rev().take(window_size).rev().cloned().collect();
    model.samples = blended_sr.len() as i32;
}

/// Pure in-memory time series training (no DB calls).
/// Mirrors time_series::fit_model logic: Holt-Winters + Linear Regression.
fn train_time_series_in_memory(
    model: &mut time_series::TimeSeriesModel,
    data: &[f64],
) {
    if data.is_empty() { return; }

    model.last_value = *data.last().unwrap();
    model.samples = data.len() as i32;

    // 1. Holt-Winters (double exponential smoothing)
    model.level = data[0];
    model.trend = 0.0;
    for &val in data.iter().skip(1) {
        let prev_level = model.level;
        model.level = model.alpha * val + (1.0 - model.alpha) * (prev_level + model.trend);
        model.trend = model.beta * (model.level - prev_level) + (1.0 - model.beta) * model.trend;
    }

    // 2. Linear Regression on recent window (last 24 points or all)
    let window_size = data.len().min(24);
    let recent: Vec<f64> = data.iter().rev().take(window_size).rev().cloned().collect();
    let n = recent.len() as f64;
    if n >= 3.0 {
        let mean_x = (n - 1.0) / 2.0;
        let mean_y = recent.iter().sum::<f64>() / n;
        let mut ss_xy = 0.0;
        let mut ss_xx = 0.0;
        let mut ss_yy = 0.0;
        for (i, &y) in recent.iter().enumerate() {
            let x = i as f64;
            ss_xy += (x - mean_x) * (y - mean_y);
            ss_xx += (x - mean_x).powi(2);
            ss_yy += (y - mean_y).powi(2);
        }
        model.regression_slope = if ss_xx > 0.0 { ss_xy / ss_xx } else { 0.0 };
        model.regression_intercept = mean_y - model.regression_slope * mean_x;
        model.regression_r2 = if ss_yy > 0.0 { 1.0 - (ss_xy.powi(2) / (ss_xx * ss_yy)) } else { 0.0 };
    }

    // 3. Residuals for prediction intervals
    let mut residuals = Vec::new();
    for (i, &val) in recent.iter().enumerate() {
        let predicted = model.regression_intercept + model.regression_slope * (i as f64);
        residuals.push(val - predicted);
    }
    let mean_res = residuals.iter().sum::<f64>() / residuals.len().max(1) as f64;
    let var_res = residuals.iter().map(|r| (r - mean_res).powi(2)).sum::<f64>() / residuals.len().max(1) as f64;
    model.residual_std = var_res.sqrt();
}

/// Train all ML models for a single endpoint (used by drift retraining).
/// Falls back to per-endpoint DB calls — use train_all() for batch.
async fn train_endpoint(pool: &PgPool, endpoint_id: uuid::Uuid) -> Result<(), sqlx::Error> {
    // Snapshot current models BEFORE training (for rollback support)
    for model_type in &["adaptive_threshold", "anomaly_detector", "ts_success_rate", "ts_latency"] {
        let _ = versioning::snapshot_current_model(pool, endpoint_id, model_type, "scheduled_training").await;
    }

    let stats: Vec<(f64, f64, f64, f64, i32)> = sqlx::query_as(
        "SELECT COALESCE(total_deliveries, 0)::FLOAT, COALESCE(successful, 0)::FLOAT, COALESCE(failed, 0)::FLOAT, COALESCE(avg_latency_ms, 0)::FLOAT, COALESCE(p95_latency_ms, 0) FROM endpoint_hourly_stats WHERE endpoint_id = $1 ORDER BY hour_start"
    ).bind(endpoint_id).fetch_all(pool).await?;

    if stats.len() < 3 { return Ok(()); }

    let success_rates: Vec<f64> = stats.iter().map(|(t, s, _, _, _)| if *t > 0.0 { s / t * 100.0 } else { 100.0 }).collect();
    let latencies: Vec<f64> = stats.iter().map(|(_, _, _, l, _)| *l).collect();
    let p95_latencies: Vec<f64> = stats.iter().map(|(_, _, _, _, p)| *p as f64).collect();
    let delivery_rates: Vec<f64> = stats.iter().map(|(t, _, _, _, _)| *t).collect();

    adaptive_thresholds::train(pool, endpoint_id, &success_rates, &latencies, &p95_latencies).await?;
    anomaly_detection::train(pool, endpoint_id, &success_rates, &latencies, &delivery_rates).await?;
    time_series::train(pool, endpoint_id, &success_rates, &latencies).await?;
    bandit::init_if_needed(pool, endpoint_id).await?;

    for sr in success_rates.iter().rev().take(1) {
        let _ = record_feature(pool, endpoint_id, "latest_success_rate", *sr).await;
    }
    if let Some(lat) = latencies.last() {
        let _ = record_feature(pool, endpoint_id, "latest_latency", *lat).await;
    }

    Ok(())
}

/// Drift sonrası tek endpoint için yeniden eğitim tetikler
pub async fn train_endpoint_for_drift(pool: &PgPool, endpoint_id: uuid::Uuid) -> Result<(), sqlx::Error> {
    train_endpoint(pool, endpoint_id).await
}
