//! Stage 3b: Alert Correlation
//!
//! Groups related anomalies into a single root cause alert.
//! Prevents alert storms: 100 alerts → 1 root cause.

use super::config::CortexConfig;

/// Correlate recent high-score anomalies within the time window.
/// Returns the correlation ID if a new correlation was created.
pub async fn correlate_alerts(
    pool: &sqlx::PgPool,
    config: &CortexConfig,
) -> Result<Option<i64>, sqlx::Error> {
    let window_mins = config.alert_correlation_window_mins;
    let min_count = config.alert_correlation_min_count;

    // Find endpoints with high anomalies in the last N minutes
    let high_anomalies: Vec<(uuid::Uuid, uuid::Uuid, i32, String)> = sqlx::query_as(
        r#"
        SELECT endpoint_id, customer_id, score, category
        FROM anomaly_scores
        WHERE score > $1 AND created_at > NOW() - ($2 || ' minutes')::INTERVAL
        ORDER BY score DESC
        "#
    )
    .bind(config.anomaly_high_threshold)
    .bind(window_mins.to_string())
    .fetch_all(pool)
    .await?;

    if high_anomalies.len() < min_count as usize {
        return Ok(None);
    }

    // Check if there's already an active correlation in this window
    let existing: Option<(i64,)> = sqlx::query_as(
        "SELECT id FROM alert_correlations WHERE resolved = false AND last_seen > NOW() - ($1 || ' minutes')::INTERVAL LIMIT 1"
    )
    .bind(window_mins.to_string())
    .fetch_optional(pool)
    .await?;

    if let Some((id,)) = existing {
        // Update existing correlation
        let endpoint_ids: Vec<uuid::Uuid> = high_anomalies.iter().map(|(eid, _, _, _)| *eid).collect();
        sqlx::query(
            "UPDATE alert_correlations SET alert_count = $1, affected_endpoints = $2, last_seen = NOW() WHERE id = $3"
        )
        .bind(high_anomalies.len() as i32)
        .bind(serde_json::json!(endpoint_ids))
        .bind(id)
        .execute(pool)
        .await?;
        return Ok(Some(id));
    }

    // Determine root cause by analyzing error types across affected endpoints
    let endpoint_ids: Vec<uuid::Uuid> = high_anomalies.iter().map(|(eid, _, _, _)| *eid).collect();
    let max_score = high_anomalies.iter().map(|(_, _, s, _)| *s).max().unwrap_or(0);
    let severity = if max_score >= 80 { "critical" } else if max_score >= 60 { "high" } else { "medium" };

    // Analyze error patterns to determine real root cause
    let root_cause_detail = determine_root_cause(pool, &endpoint_ids).await;
    let root_cause = root_cause_detail.get("root_cause")
        .and_then(|v| v.as_str())
        .unwrap_or("anomaly_cluster")
        .to_string();

    // Create new correlation
    let id: (i64,) = sqlx::query_as(
        "INSERT INTO alert_correlations (root_cause, root_cause_detail, affected_endpoints, alert_count, severity) VALUES ($1, $2, $3, $4, $5) RETURNING id"
    )
    .bind(&root_cause)
    .bind(&root_cause_detail)
    .bind(serde_json::json!(endpoint_ids))
    .bind(high_anomalies.len() as i32)
    .bind(severity)
    .fetch_one(pool)
    .await?;

    Ok(Some(id.0))
}

/// Analyze error patterns across affected endpoints to determine root cause
async fn determine_root_cause(pool: &sqlx::PgPool, endpoint_ids: &[uuid::Uuid]) -> serde_json::Value {
    if endpoint_ids.is_empty() {
        return serde_json::json!({ "root_cause": "anomaly_cluster" });
    }

    // Get error breakdown from recent hourly stats for affected endpoints
    let error_data: Vec<(serde_json::Value,)> = match sqlx::query_as(
        "SELECT error_breakdown FROM endpoint_hourly_stats WHERE endpoint_id = ANY($1) AND hour_start > NOW() - INTERVAL '1 hour'"
    ).bind(endpoint_ids).fetch_all(pool).await {
        Ok(d) => d,
        Err(_) => return serde_json::json!({ "root_cause": "anomaly_cluster" }),
    };

    // Aggregate all error types
    let mut error_counts: std::collections::HashMap<String, i64> = std::collections::HashMap::new();
    let mut total_errors = 0i64;

    for (breakdown,) in &error_data {
        if let Some(obj) = breakdown.as_object() {
            for (err_type, count) in obj {
                if err_type == "success" { continue; }
                let c = count.as_i64().unwrap_or(0);
                *error_counts.entry(err_type.clone()).or_insert(0) += c;
                total_errors += c;
            }
        }
    }

    if total_errors == 0 {
        return serde_json::json!({ "root_cause": "anomaly_cluster", "detail": "No error data available" });
    }

    // Find dominant error
    let dominant = error_counts.iter()
        .max_by_key(|(_, c)| *c)
        .map(|(err, count)| (err.clone(), *count));

    let (dominant_err, dominant_count) = match dominant {
        Some(d) => d,
        None => return serde_json::json!({ "root_cause": "anomaly_cluster" }),
    };

    let dominant_pct = (dominant_count as f64 / total_errors as f64) * 100.0;

    // Classify root cause based on error patterns
    let root_cause = if dominant_pct > 70.0 {
        // Single error type dominates
        if dominant_err.contains("503") || dominant_err.contains("502") {
            "upstream_provider_outage"
        } else if dominant_err.contains("timeout") || dominant_err.contains("ETIMEDOUT") {
            "network_timeout"
        } else if dominant_err.contains("ECONNREFUSED") || dominant_err.contains("ECONNRESET") {
            "connection_failures"
        } else if dominant_err.contains("429") {
            "rate_limiting"
        } else if dominant_err.contains("500") {
            "server_errors"
        } else {
            "common_error_pattern"
        }
    } else if endpoint_ids.len() >= 3 {
        // Multiple endpoints affected with mixed errors
        "infrastructure_issue"
    } else {
        "anomaly_cluster"
    };

    serde_json::json!({
        "root_cause": root_cause,
        "dominant_error": dominant_err,
        "dominant_error_pct": dominant_pct,
        "total_errors": total_errors,
        "error_distribution": error_counts,
        "affected_endpoint_count": endpoint_ids.len(),
    })
}
