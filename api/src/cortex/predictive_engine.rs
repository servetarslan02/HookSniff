//! Stage 7: Predictive Engine
//!
//! Predicts failure probability and capacity forecast based on trends.

use super::config::CortexConfig;

/// Run predictions for all active endpoints.
/// BATCH: Fetches all endpoint data in ONE query, then processes in-memory.
pub async fn run_predictions(pool: &sqlx::PgPool, config: &CortexConfig) -> Result<u64, sqlx::Error> {
    // Batch fetch: all endpoints with their stats in ONE query
    let all_stats: Vec<(uuid::Uuid, uuid::Uuid, Vec<(i32, i32, i32)>)> = {
        let endpoints: Vec<(uuid::Uuid, uuid::Uuid)> = sqlx::query_as(
            "SELECT DISTINCT e.id, e.customer_id FROM endpoints e JOIN endpoint_hourly_stats hs ON hs.endpoint_id = e.id WHERE e.is_active = true"
        ).fetch_all(pool).await?;

        // Batch fetch ALL hourly stats in one query
        let stats_rows: Vec<(uuid::Uuid, i32, i32, i32)> = sqlx::query_as(
            "SELECT endpoint_id, total_deliveries, successful, failed FROM endpoint_hourly_stats WHERE hour_start > NOW() - INTERVAL '6 hours' ORDER BY endpoint_id, hour_start"
        ).fetch_all(pool).await?;

        // Group in-memory by endpoint_id
        let mut grouped: std::collections::HashMap<uuid::Uuid, Vec<(i32, i32, i32)>> = std::collections::HashMap::new();
        for (eid, total, successful, failed) in stats_rows {
            grouped.entry(eid).or_default().push((total, successful, failed));
        }

        endpoints.into_iter()
            .filter_map(|(eid, cid)| grouped.remove(&eid).map(|stats| (eid, cid, stats)))
            .collect()
    };

    let mut count = 0u64;
    for (endpoint_id, customer_id, stats) in all_stats {
        if stats.len() < 3 { continue; }

        let rates: Vec<f64> = stats.iter().map(|(t, s, _)| if *t > 0 { *s as f64 / *t as f64 } else { 1.0 }).collect();

        // Simple trend analysis (ML path skipped in batch mode — needs per-endpoint model fetch)
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

        let current_sr = *rates.last().unwrap_or(&1.0);
        let failure_prob = if slope < config.predictive_trend_threshold {
            (1.0 - current_sr + slope.abs()).min(1.0).max(0.0)
        } else if momentum < config.predictive_momentum_threshold {
            (1.0 - current_sr + momentum.abs() * 0.5).min(1.0).max(0.0)
        } else {
            (1.0 - current_sr).max(0.0)
        };

        if failure_prob < 0.05 { continue; }

        sqlx::query(
            "INSERT INTO predictions (endpoint_id, customer_id, prediction_type, probability, factors, time_horizon_mins) VALUES ($1, $2, $3, $4, $5, 60)"
        )
        .bind(endpoint_id)
        .bind(customer_id)
        .bind("failure")
        .bind(failure_prob)
        .bind(serde_json::json!({
            "method": "batch_trend",
            "current_sr": current_sr,
            "trend_slope": slope,
            "momentum": momentum,
            "r2": r2,
            "hours_analyzed": stats.len(),
        }))
        .execute(pool)
        .await?;

        if failure_prob > config.predictive_failure_threshold {
 tracing::warn!(" Predictive: endpoint {} has {:.0}% failure probability", endpoint_id, failure_prob * 100.0);
        }
        count += 1;
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

    // Get rate limit for this endpoint
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
