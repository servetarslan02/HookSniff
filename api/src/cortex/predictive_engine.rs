//! Stage 7: Predictive Engine
//!
//! Predicts failure probability and capacity forecast based on trends.

use super::config::CortexConfig;

/// Run predictions for all active endpoints.
pub async fn run_predictions(pool: &sqlx::PgPool, config: &CortexConfig) -> Result<u64, sqlx::Error> {
    let endpoints: Vec<(uuid::Uuid, uuid::Uuid)> = sqlx::query_as(
        "SELECT DISTINCT e.id, e.customer_id FROM endpoints e JOIN endpoint_hourly_stats hs ON hs.endpoint_id = e.id WHERE e.is_active = true"
    ).fetch_all(pool).await?;

    let mut count = 0u64;
    for (endpoint_id, customer_id) in endpoints {
        if let Some(pred) = predict_endpoint(pool, endpoint_id, config).await? {
            sqlx::query(
                "INSERT INTO predictions (endpoint_id, customer_id, prediction_type, probability, factors, time_horizon_mins) VALUES ($1, $2, $3, $4, $5, 60)"
            )
            .bind(endpoint_id)
            .bind(customer_id)
            .bind(&pred.prediction_type)
            .bind(pred.probability)
            .bind(&pred.factors)
            .execute(pool)
            .await?;

            if pred.probability > config.predictive_failure_threshold {
                tracing::warn!("⚠️ Predictive: endpoint {} has {:.0}% failure probability", endpoint_id, pred.probability * 100.0);
            }
            count += 1;
        }
    }

    super::CORTEX_METRICS.predictions_generated.fetch_add(count, std::sync::atomic::Ordering::Relaxed);
    Ok(count)
}

struct Prediction {
    prediction_type: String,
    probability: f64,
    factors: serde_json::Value,
}

async fn predict_endpoint(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
    config: &CortexConfig,
) -> Result<Option<Prediction>, sqlx::Error> {
    // Get last 6 hours of stats for trend analysis
    let stats: Vec<(i32, i32, i32)> = sqlx::query_as(
        "SELECT total_deliveries, successful, failed FROM endpoint_hourly_stats WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '6 hours' ORDER BY hour_start"
    ).bind(endpoint_id).fetch_all(pool).await?;

    if stats.len() < 3 { return Ok(None); }

    // Calculate trend: success rate over time
    let rates: Vec<f64> = stats.iter().map(|(t, s, _)| if *t > 0 { *s as f64 / *t as f64 } else { 1.0 }).collect();

    // Simple linear trend
    let n = rates.len() as f64;
    let x_mean = (n - 1.0) / 2.0;
    let y_mean = rates.iter().sum::<f64>() / n;
    let mut num = 0.0;
    let mut den = 0.0;
    for (i, &r) in rates.iter().enumerate() {
        let x = i as f64;
        num += (x - x_mean) * (r - y_mean);
        den += (x - x_mean).powi(2);
    }
    let slope = if den > 0.0 { num / den } else { 0.0 };

    // Momentum: difference between last 2 and first 2 rates
    let early = rates.iter().take(2).sum::<f64>() / 2.0;
    let late = rates.iter().rev().take(2).sum::<f64>() / 2.0;
    let momentum = late - early;

    let current_sr = *rates.last().unwrap_or(&1.0);
    let failure_prob = if slope < config.predictive_trend_threshold {
        // Declining trend
        (1.0 - current_sr + slope.abs()).min(1.0).max(0.0)
    } else if momentum < config.predictive_momentum_threshold {
        // Negative momentum
        (1.0 - current_sr + momentum.abs() * 0.5).min(1.0).max(0.0)
    } else {
        (1.0 - current_sr).max(0.0)
    };

    if failure_prob < 0.1 { return Ok(None); }

    Ok(Some(Prediction {
        prediction_type: "failure".to_string(),
        probability: failure_prob,
        factors: serde_json::json!({
            "current_sr": current_sr,
            "trend_slope": slope,
            "momentum": momentum,
            "hours_analyzed": stats.len(),
        }),
    }))
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

    // Get rate limit for this endpoint
    let rate_limit: Option<(i32,)> = sqlx::query_as(
        "SELECT webhook_limit FROM endpoints WHERE id = $1"
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
