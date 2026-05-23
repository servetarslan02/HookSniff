//! Stage 8: Insights Engine
//!
//! Generates actionable insights, weekly reports, and customer health scores.

use super::config::CortexConfig;

/// Generate insights for all customers.
pub async fn generate_insights(pool: &sqlx::PgPool, config: &CortexConfig) -> Result<u64, sqlx::Error> {
    let mut count = 0u64;

    // 1. Find endpoints with declining success rates
    let declining: Vec<(uuid::Uuid, uuid::Uuid, f64, f64)> = sqlx::query_as(
        r#"
        SELECT ep.endpoint_id, e.customer_id, ep.success_rate_7d, ep.success_rate_24h
        FROM endpoint_profiles ep
        JOIN endpoints e ON e.id = ep.endpoint_id
        WHERE ep.success_rate_7d - ep.success_rate_24h > 5.0
          AND e.is_active = true
        "#
    ).fetch_all(pool).await?;

    for (eid, cid, sr7d, sr24h) in declining {
        let drop = sr7d - sr24h;
        let severity = if drop > 20.0 { "warning" } else { "info" };

        // Check for existing insight in last 24h to prevent duplicates
        let exists: Option<(i64,)> = sqlx::query_as(
            "SELECT id FROM cortex_insights WHERE customer_id = $1 AND insight_type = 'declining_health' AND (data->>'endpoint_id') = $2 AND created_at > NOW() - INTERVAL '24 hours' AND dismissed = false LIMIT 1"
        ).bind(cid).bind(eid.to_string()).fetch_optional(pool).await?;
        if exists.is_some() { continue; }

        sqlx::query(
            "INSERT INTO cortex_insights (customer_id, insight_type, title, body, severity, data) VALUES ($1, 'declining_health', $2, $3, $4, $5)"
        )
        .bind(cid)
        .bind(format!("Endpoint success rate dropped {:.1}%", drop))
        .bind(format!("7-day average: {:.1}%, 24h average: {:.1}%. Consider investigating recent changes.", sr7d, sr24h))
        .bind(severity)
        .bind(serde_json::json!({ "endpoint_id": eid, "sr_7d": sr7d, "sr_24h": sr24h }))
        .execute(pool).await?;
        count += 1;
    }

    // 2. Find high-latency endpoints
    let slow: Vec<(uuid::Uuid, uuid::Uuid, i32)> = sqlx::query_as(
        r#"
        SELECT ep.endpoint_id, e.customer_id, ep.latency_p95
        FROM endpoint_profiles ep
        JOIN endpoints e ON e.id = ep.endpoint_id
        WHERE ep.latency_p95 > $1 AND e.is_active = true
        "#
    )
    .bind(config.anomaly_default_p95_ms)
    .fetch_all(pool).await?;

    for (eid, cid, p95) in slow {
        let exists: Option<(i64,)> = sqlx::query_as(
            "SELECT id FROM cortex_insights WHERE customer_id = $1 AND insight_type = 'high_latency' AND (data->>'endpoint_id') = $2 AND created_at > NOW() - INTERVAL '24 hours' AND dismissed = false LIMIT 1"
        ).bind(cid).bind(eid.to_string()).fetch_optional(pool).await?;
        if exists.is_some() { continue; }

        sqlx::query(
            "INSERT INTO cortex_insights (customer_id, insight_type, title, body, severity, data) VALUES ($1, 'high_latency', $2, $3, 'info', $4)"
        )
        .bind(cid)
        .bind(format!("Endpoint p95 latency is {}ms", p95))
        .bind("Consider optimizing your endpoint or increasing timeout.".to_string())
        .bind(serde_json::json!({ "endpoint_id": eid, "p95_ms": p95 }))
        .execute(pool).await?;
        count += 1;
    }

    // 3. Find endpoints with dominant errors
    let error_endpoints: Vec<(uuid::Uuid, uuid::Uuid, String)> = sqlx::query_as(
        r#"
        SELECT ep.endpoint_id, e.customer_id, ep.dominant_error_type
        FROM endpoint_profiles ep
        JOIN endpoints e ON e.id = ep.endpoint_id
        WHERE ep.dominant_error_type IS NOT NULL
          AND ep.dominant_error_type != 'success'
          AND e.is_active = true
        "#
    ).fetch_all(pool).await?;

    for (eid, cid, err) in error_endpoints {
        let exists: Option<(i64,)> = sqlx::query_as(
            "SELECT id FROM cortex_insights WHERE customer_id = $1 AND insight_type = 'dominant_error' AND (data->>'endpoint_id') = $2 AND created_at > NOW() - INTERVAL '24 hours' AND dismissed = false LIMIT 1"
        ).bind(cid).bind(eid.to_string()).fetch_optional(pool).await?;
        if exists.is_some() { continue; }

        sqlx::query(
            "INSERT INTO cortex_insights (customer_id, insight_type, title, body, severity, data) VALUES ($1, 'dominant_error', $2, $3, 'info', $4)"
        )
        .bind(cid)
        .bind(format!("Frequent error: {}", err))
        .bind("This error is the most common failure for this endpoint. Check your server logs.".to_string())
        .bind(serde_json::json!({ "endpoint_id": eid, "error": err }))
        .execute(pool).await?;
        count += 1;
    }

    super::CORTEX_METRICS.insights_generated.fetch_add(count, std::sync::atomic::Ordering::Relaxed);
    Ok(count)
}

/// Generate weekly report for a customer.
pub async fn generate_weekly_report(
    pool: &sqlx::PgPool,
    customer_id: uuid::Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let endpoints: Vec<(String, f64, f64, i32, i32)> = sqlx::query_as(
        r#"
        SELECT e.url, COALESCE(ep.success_rate_7d, 100.0), COALESCE(ep.latency_p95::FLOAT, 0.0),
               COALESCE(ep.sample_size, 0), COALESCE(ep.confidence * 100, 0)::INT
        FROM endpoints e
        LEFT JOIN endpoint_profiles ep ON ep.endpoint_id = e.id
        WHERE e.customer_id = $1 AND e.is_active = true
        "#
    ).bind(customer_id).fetch_all(pool).await?;

    let total_deliveries: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at > NOW() - INTERVAL '7 days'"
    ).bind(customer_id).fetch_one(pool).await?;

    let success_rate: (f64,) = sqlx::query_as(
        "SELECT COALESCE(COUNT(*) FILTER (WHERE status = 'delivered')::FLOAT / NULLIF(COUNT(*), 0) * 100, 100.0) FROM deliveries WHERE customer_id = $1 AND created_at > NOW() - INTERVAL '7 days'"
    ).bind(customer_id).fetch_one(pool).await?;

    let active_insights: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM cortex_insights WHERE customer_id = $1 AND dismissed = false AND created_at > NOW() - INTERVAL '7 days'"
    ).bind(customer_id).fetch_one(pool).await?;

    let report = serde_json::json!({
        "period": "7d",
        "total_deliveries": total_deliveries.0,
        "overall_success_rate": success_rate.0,
        "active_insights": active_insights.0,
        "endpoints": endpoints.iter().map(|(url, sr, lat, samples, conf)| {
            serde_json::json!({
                "url": url,
                "success_rate": sr,
                "p95_latency_ms": lat,
                "sample_size": samples,
                "confidence_pct": conf,
            })
        }).collect::<Vec<_>>(),
    });

    // Store report
    let week_start = (chrono::Utc::now() - chrono::Duration::days(7)).date_naive();
    let _ = sqlx::query(
        "INSERT INTO weekly_reports (customer_id, week_start, report) VALUES ($1, $2, $3) ON CONFLICT (customer_id, week_start) DO UPDATE SET report = $3"
    ).bind(customer_id).bind(week_start).bind(&report).execute(pool).await;

    Ok(report)
}
