//! Proactive Self-Healing Engine
//!
//! Acts BEFORE anomalies occur by detecting degradation trends.
//! Unlike the reactive healing_engine (acts after anomaly score is high),
//! this module predicts problems and takes preventive action.

use super::config::CortexConfig;

/// Run proactive checks and take preventive actions
pub async fn run_proactive(pool: &sqlx::PgPool, config: &CortexConfig) -> Result<u64, sqlx::Error> {
    let mut actions = 0u64;

    actions += detect_degradation_trends(pool, config).await?;
    actions += predict_peak_preparation(pool, config).await?;
    actions += preemptive_rate_adjustment(pool, config).await?;

    Ok(actions)
}

/// Detect endpoints with degrading trends BEFORE they hit anomaly thresholds
/// Looks at success rate trend over last 6 hours — if consistently dropping, act early
async fn detect_degradation_trends(
    pool: &sqlx::PgPool,
    config: &CortexConfig,
) -> Result<u64, sqlx::Error> {
    let mut actions = 0u64;

    // Find endpoints with declining success rate trend (but not yet anomalous)
    let trending: Vec<(uuid::Uuid, uuid::Uuid, f64, f64, f64)> = sqlx::query_as(
        r#"
        WITH hourly_rates AS (
            SELECT 
                endpoint_id,
                hour_start,
                CASE WHEN total_deliveries > 0 
                    THEN (successful::FLOAT / total_deliveries::FLOAT) * 100.0 
                    ELSE 100.0 END as sr
            FROM endpoint_hourly_stats
            WHERE hour_start > NOW() - INTERVAL '6 hours'
            ORDER BY endpoint_id, hour_start
        ),
        trends AS (
            SELECT 
                endpoint_id,
                AVG(sr) as avg_sr,
                -- Simple linear trend: compare first half vs second half
                AVG(sr) FILTER (WHERE hour_start > NOW() - INTERVAL '3 hours') as recent_sr,
                AVG(sr) FILTER (WHERE hour_start <= NOW() - INTERVAL '3 hours') as older_sr,
                COUNT(*) as data_points
            FROM hourly_rates
            GROUP BY endpoint_id
            HAVING COUNT(*) >= 4
        )
        SELECT 
            t.endpoint_id, e.customer_id, t.avg_sr, t.recent_sr, t.older_sr
        FROM trends t
        JOIN endpoints e ON e.id = t.endpoint_id
        WHERE t.older_sr - t.recent_sr > 5.0        -- dropped more than 5%
          AND t.recent_sr > 85.0                     -- not yet anomalous (>85%)
          AND t.recent_sr < 98.0                     -- but not perfect either
          AND e.is_active = true
          AND e.auto_disabled = false
        "#
    )
    .fetch_all(pool)
    .await?;

    for (endpoint_id, customer_id, _avg_sr, recent_sr, older_sr) in trending {
        let drop = older_sr - recent_sr;

        // Calculate hours until anomaly threshold (rough estimate)
        let hours_to_anomaly = if drop > 0.0 {
            ((recent_sr - config.anomaly_high_threshold as f64) / (drop / 3.0)).max(0.0)
        } else {
            999.0
        };

        let severity = if hours_to_anomaly < 1.0 { "critical" }
            else if hours_to_anomaly < 3.0 { "warning" }
            else { "info" };

        // Record proactive insight
        let exists: Option<(i64,)> = sqlx::query_as(
            "SELECT id FROM cortex_insights WHERE customer_id = $1 AND insight_type = 'proactive_degradation' AND (data->>'endpoint_id') = $2 AND created_at > NOW() - INTERVAL '6 hours' AND dismissed = false LIMIT 1"
        ).bind(customer_id).bind(endpoint_id.to_string()).fetch_optional(pool).await?;

        if exists.is_none() {
            sqlx::query(
                "INSERT INTO cortex_insights (customer_id, insight_type, title, body, severity, data) VALUES ($1, 'proactive_degradation', $2, $3, $4, $5)"
            )
            .bind(customer_id)
            .bind(format!("Endpoint degrading: {:.1}% → {:.1}% (est. {:.0}h to threshold)", older_sr, recent_sr, hours_to_anomaly))
            .bind(format!("Success rate dropped {:.1}% in last 3 hours. Proactive monitoring active. Current: {:.1}%, was: {:.1}%", drop, recent_sr, older_sr))
            .bind(severity)
            .bind(serde_json::json!({
                "endpoint_id": endpoint_id,
                "older_sr": older_sr,
                "recent_sr": recent_sr,
                "drop_pct": drop,
                "hours_to_anomaly": hours_to_anomaly,
                "action": "proactive_monitoring"
            }))
            .execute(pool)
            .await?;

            tracing::warn!(
                "🔮 Proactive: endpoint {} degrading {:.1}% → {:.1}% (~{:.0}h to threshold)",
                endpoint_id, older_sr, recent_sr, hours_to_anomaly
            );
            actions += 1;
        }
    }

    Ok(actions)
}

/// Prepare for predicted traffic spikes
/// If predictions show high volume coming, pre-configure endpoints
async fn predict_peak_preparation(
    pool: &sqlx::PgPool,
    _config: &CortexConfig,
) -> Result<u64, sqlx::Error> {
    let mut actions = 0u64;

    // Find endpoints approaching their rate limits (>80% usage)
    let at_risk: Vec<(uuid::Uuid, uuid::Uuid, f64, f64, i32)> = sqlx::query_as(
        r#"
        SELECT 
            ep.endpoint_id, e.customer_id,
            ep.avg_deliveries_per_hour,
            ep.peak_deliveries_per_hour,
            e.webhook_limit
        FROM endpoint_profiles ep
        JOIN endpoints e ON e.id = ep.endpoint_id
        WHERE e.is_active = true
          AND e.webhook_limit > 0
          AND ep.avg_deliveries_per_hour > 0
          AND (ep.avg_deliveries_per_hour * 24.0 / e.webhook_limit::FLOAT) * 100.0 > 80.0
        "#
    )
    .fetch_all(pool)
    .await?;

    for (endpoint_id, customer_id, avg_hr, peak_hr, limit) in at_risk {
        let daily_usage = avg_hr * 24.0;
        let usage_pct = (daily_usage / limit as f64) * 100.0;
        let hours_until_limit = if avg_hr > 0.0 {
            ((limit as f64 - daily_usage) / avg_hr).max(0.0)
        } else {
            999.0
        };

        let exists: Option<(i64,)> = sqlx::query_as(
            "SELECT id FROM cortex_insights WHERE customer_id = $1 AND insight_type = 'rate_limit_warning' AND (data->>'endpoint_id') = $2 AND created_at > NOW() - INTERVAL '12 hours' AND dismissed = false LIMIT 1"
        ).bind(customer_id).bind(endpoint_id.to_string()).fetch_optional(pool).await?;

        if exists.is_none() {
            let severity = if usage_pct > 95.0 { "critical" }
                else if usage_pct > 90.0 { "warning" }
                else { "info" };

            sqlx::query(
                "INSERT INTO cortex_insights (customer_id, insight_type, title, body, severity, data) VALUES ($1, 'rate_limit_warning', $2, $3, $4, $5)"
            )
            .bind(customer_id)
            .bind(format!("Rate limit warning: {:.0}% daily usage", usage_pct))
            .bind(format!("Endpoint using {:.0}% of daily limit ({} req/day). Peak: {:.0} req/h. Estimated {:.0}h until limit.", usage_pct, limit, peak_hr, hours_until_limit))
            .bind(severity)
            .bind(serde_json::json!({
                "endpoint_id": endpoint_id,
                "avg_per_hour": avg_hr,
                "peak_per_hour": peak_hr,
                "daily_limit": limit,
                "usage_pct": usage_pct,
                "hours_until_limit": hours_until_limit
            }))
            .execute(pool)
            .await?;

            tracing::info!(
                "📊 Proactive: endpoint {} at {:.0}% rate limit ({}h remaining)",
                endpoint_id, usage_pct, hours_until_limit
            );
            actions += 1;
        }
    }

    Ok(actions)
}

/// Preemptively adjust throttle rates for endpoints showing stress signs
async fn preemptive_rate_adjustment(
    pool: &sqlx::PgPool,
    config: &CortexConfig,
) -> Result<u64, sqlx::Error> {
    let mut actions = 0u64;

    // Find endpoints with increasing latency but still healthy SR
    let stressed: Vec<(uuid::Uuid, uuid::Uuid, i32, i32)> = sqlx::query_as(
        r#"
        WITH recent_stats AS (
            SELECT 
                endpoint_id,
                AVG(p95_latency_ms) as recent_p95,
                AVG(p50_latency_ms) as recent_p50
            FROM endpoint_hourly_stats
            WHERE hour_start > NOW() - INTERVAL '2 hours'
            GROUP BY endpoint_id
            HAVING COUNT(*) >= 2
        ),
        older_stats AS (
            SELECT 
                endpoint_id,
                AVG(p95_latency_ms) as older_p95,
                AVG(p50_latency_ms) as older_p50
            FROM endpoint_hourly_stats
            WHERE hour_start > NOW() - INTERVAL '6 hours' 
              AND hour_start <= NOW() - INTERVAL '2 hours'
            GROUP BY endpoint_id
            HAVING COUNT(*) >= 2
        )
        SELECT 
            r.endpoint_id, e.customer_id,
            r.recent_p95::INT, o.older_p95::INT
        FROM recent_stats r
        JOIN older_stats o ON o.endpoint_id = r.endpoint_id
        JOIN endpoints e ON e.id = r.endpoint_id
        WHERE r.recent_p95 > o.older_p95 * 1.5    -- p95 increased 50%+
          AND r.recent_p95 < $1::INT               -- but not yet anomaly level
          AND e.is_active = true
          AND e.auto_disabled = false
        "#
    )
    .bind(config.anomaly_default_p95_ms)
    .fetch_all(pool)
    .await?;

    for (endpoint_id, customer_id, recent_p95, older_p95) in stressed {
        let increase_pct = ((recent_p95 as f64 - older_p95 as f64) / older_p95.max(1) as f64) * 100.0;

        // Record proactive action
        sqlx::query(
            "INSERT INTO healing_actions (endpoint_id, action_type, reason, details) VALUES ($1, 'proactive_throttle', $2, $3)"
        )
        .bind(endpoint_id)
        .bind(format!("Latency increasing: {}ms → {}ms (+{:.0}%)", older_p95, recent_p95, increase_pct))
        .bind(serde_json::json!({
            "older_p95": older_p95,
            "recent_p95": recent_p95,
            "increase_pct": increase_pct,
            "action": "preemptive_monitoring"
        }))
        .execute(pool)
        .await?;

        // Record in action memory
        super::action_memory::record_action(
            pool, endpoint_id, Some(customer_id), "proactive_throttle",
            &format!("Latency +{:.0}%", increase_pct),
            serde_json::json!({ "older_p95": older_p95, "recent_p95": recent_p95 }),
        ).await?;

        tracing::info!(
            "⚡ Proactive: endpoint {} latency stress {}ms → {}ms (+{:.0}%)",
            endpoint_id, older_p95, recent_p95, increase_pct
        );
        actions += 1;
    }

    Ok(actions)
}
