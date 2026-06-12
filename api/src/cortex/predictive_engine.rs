//! Stage 7: Predictive Engine
//!
//! Predicts failure probability using:
//! - Holt-Winters time series models (when trained)
//! - Linear regression fallback (when no model exists)
//! - Momentum analysis

use super::config::CortexConfig;

/// Run predictions for all active endpoints.
/// BATCH: Fetches all data in 3 queries, processes in-memory.
pub async fn run_predictions(pool: &sqlx::PgPool, config: &CortexConfig) -> Result<u64, sqlx::Error> {
    // 1. BATCH: All endpoints with customer_id
    let endpoints: Vec<(uuid::Uuid, uuid::Uuid)> = sqlx::query_as(
        "SELECT DISTINCT e.id, e.customer_id FROM endpoints e \
         JOIN endpoint_hourly_stats hs ON hs.endpoint_id = e.id WHERE e.is_active = true"
    ).fetch_all(pool).await?;

    if endpoints.is_empty() { return Ok(0); }

    let endpoint_ids: Vec<uuid::Uuid> = endpoints.iter().map(|(eid, _)| *eid).collect();

    // 2. BATCH: All hourly stats in ONE query
    let stats_rows: Vec<(uuid::Uuid, i32, i32, i32)> = sqlx::query_as(
        "SELECT endpoint_id, total_deliveries, successful, failed \
         FROM endpoint_hourly_stats \
         WHERE hour_start > NOW() - INTERVAL '6 hours' \
         ORDER BY endpoint_id, hour_start"
    ).fetch_all(pool).await?;

    let mut stats_map: std::collections::HashMap<uuid::Uuid, Vec<(i32, i32, i32)>> =
        std::collections::HashMap::new();
    for (eid, total, successful, failed) in stats_rows {
        stats_map.entry(eid).or_default().push((total, successful, failed));
    }

    // 3. BATCH: All time series models in ONE query
    let model_rows: Vec<(uuid::Uuid, String, serde_json::Value)> = sqlx::query_as(
        "SELECT endpoint_id, model_type, parameters \
         FROM ml_models WHERE model_type = 'ts_success_rate'"
    ).fetch_all(pool).await?;

    let mut ts_models: std::collections::HashMap<uuid::Uuid, super::ml::time_series::TimeSeriesModel> =
        std::collections::HashMap::new();
    for (eid, _, params) in model_rows {
        if let Ok(model) = serde_json::from_value::<super::ml::time_series::TimeSeriesModel>(params) {
            if model.samples >= 3 {
                ts_models.insert(eid, model);
            }
        }
    }

    // 4. Predict for each endpoint
    let mut count = 0u64;
    let mut predictions_to_insert: Vec<(uuid::Uuid, uuid::Uuid, f64, serde_json::Value)> = Vec::new();

    for (endpoint_id, customer_id) in &endpoints {
        let stats = match stats_map.get(endpoint_id) {
            Some(s) if s.len() >= 3 => s,
            _ => continue,
        };

        let rates: Vec<f64> = stats.iter()
            .map(|(t, s, _)| if *t > 0 { *s as f64 / *t as f64 } else { 1.0 })
            .collect();

        let current_sr = *rates.last().unwrap_or(&1.0);

        // Use trained time series model if available
        let (failure_prob, method, factors) = if let Some(ts_model) = ts_models.get(endpoint_id) {
            // Holt-Winters forecast
            let forecast = ts_model.level + ts_model.trend;
            let forecast_sr = forecast.clamp(0.0, 1.0);
            let trend_slope = ts_model.trend;
            let r2 = ts_model.regression_r2;

            // Failure probability: based on forecast + trend direction + model confidence
            let base_prob = (1.0 - forecast_sr).max(0.0);
            let trend_factor = if trend_slope < -0.01 {
                trend_slope.abs() * 10.0 // Declining trend increases probability
            } else { 0.0 };
            let confidence_weight = (r2 * 0.5 + 0.5).min(1.0); // R² adjusts confidence

            let prob = ((base_prob + trend_factor) * confidence_weight).min(1.0).max(0.0);

            (prob, "holt_winters", serde_json::json!({
                "method": "holt_winters",
                "forecast_sr": forecast_sr,
                "level": ts_model.level,
                "trend": ts_model.trend,
                "regression_r2": r2,
                "residual_std": ts_model.residual_std,
                "samples": ts_model.samples,
                "current_sr": current_sr,
            }))
        } else {
            // Fallback: linear regression
            let n = rates.len() as f64;
            let x_mean = (n - 1.0) / 2.0;
            let y_mean = rates.iter().sum::<f64>() / n;
            let mut num = 0.0;
            let mut den = 0.0;
            let mut ss_tot = 0.0;
            for (i, &r) in rates.iter().enumerate() {
                let x = i as f64;
                num += (x - x_mean) * (r - y_mean);
                den += (x - x_mean).powi(2);
                ss_tot += (r - y_mean).powi(2);
            }
            let slope = if den > 0.0 { num / den } else { 0.0 };
            let intercept = y_mean - slope * x_mean;

            let ss_res: f64 = rates.iter().enumerate().map(|(i, &r)| {
                let predicted = intercept + slope * i as f64;
                (r - predicted).powi(2)
            }).sum();
            let r2 = if ss_tot > 0.0 { 1.0 - (ss_res / ss_tot) } else { 0.0 };
            if r2 < 0.3 { continue; }

            let early = rates.iter().take(2).sum::<f64>() / 2.0;
            let late = rates.iter().rev().take(2).sum::<f64>() / 2.0;
            let momentum = late - early;

            let prob = if slope < config.predictive_trend_threshold {
                (1.0 - current_sr + slope.abs()).min(1.0).max(0.0)
            } else if momentum < config.predictive_momentum_threshold {
                (1.0 - current_sr + momentum.abs() * 0.5).min(1.0).max(0.0)
            } else {
                (1.0 - current_sr).max(0.0)
            };

            (prob, "linear_regression", serde_json::json!({
                "method": "linear_regression",
                "current_sr": current_sr,
                "trend_slope": slope,
                "momentum": momentum,
                "r2": r2,
                "hours_analyzed": stats.len(),
            }))
        };

        if failure_prob < 0.05 { continue; }

        predictions_to_insert.push((*endpoint_id, *customer_id, failure_prob, factors));

        if failure_prob > config.predictive_failure_threshold {
            tracing::warn!(
                "⚠️ Predictive [{}]: endpoint {} has {:.0}% failure probability",
                method, endpoint_id, failure_prob * 100.0
            );
        }
        count += 1;
    }

    // 5. BATCH INSERT: All predictions in ONE query
    if !predictions_to_insert.is_empty() {
        let mut query = String::from(
            "INSERT INTO predictions (endpoint_id, customer_id, prediction_type, probability, factors, time_horizon_mins) VALUES "
        );
        let mut binds: Vec<String> = Vec::new();
        for (eid, cid, prob, factors) in &predictions_to_insert {
            binds.push(format!("('${}'::uuid, '${}'::uuid, 'failure', {}, '{}', 60)",
                eid, cid, prob, factors.to_string().replace('\'', "''")));
        }
        query.push_str(&binds.join(", "));
        sqlx::query(&query).execute(pool).await?;
    }

    super::CORTEX_METRICS.predictions_generated.fetch_add(count, std::sync::atomic::Ordering::Relaxed);
    Ok(count)
}

/// Capacity forecast: predict when endpoint will hit its rate limit.
pub async fn capacity_forecast(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
) -> Result<Option<serde_json::Value>, sqlx::Error> {
    let profile: Option<(f64, f64)> = sqlx::query_as(
        "SELECT avg_deliveries_per_hour, peak_deliveries_per_hour FROM endpoint_profiles WHERE endpoint_id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let (avg, peak) = match profile {
        Some((a, p)) => (a, p),
        None => return Ok(None),
    };

    let rate_limit: Option<(i32,)> = sqlx::query_as(
        "SELECT COALESCE(c.webhook_limit, 10000) FROM endpoints e JOIN customers c ON c.id = e.customer_id WHERE e.id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let limit = rate_limit.map(|(l,)| l).unwrap_or(10000);
    let usage_pct = if limit > 0 { (avg * 24.0 / limit as f64) * 100.0 } else { 0.0 };

    Ok(Some(serde_json::json!({
        "avg_per_hour": avg,
        "peak_per_hour": peak,
        "daily_limit": limit,
        "usage_pct": usage_pct,
        "estimated_days_to_limit": if avg > 0.0 { (limit as f64 - avg * 24.0) / (avg * 24.0) } else { 999.0 },
    })))
}
