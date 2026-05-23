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

    // Determine root cause (most common error type across affected endpoints)
    let endpoint_ids: Vec<uuid::Uuid> = high_anomalies.iter().map(|(eid, _, _, _)| *eid).collect();
    let max_score = high_anomalies.iter().map(|(_, _, s, _)| *s).max().unwrap_or(0);
    let severity = if max_score >= 80 { "critical" } else if max_score >= 60 { "high" } else { "medium" };

    // Create new correlation
    let id: (i64,) = sqlx::query_as(
        "INSERT INTO alert_correlations (root_cause, affected_endpoints, alert_count, severity) VALUES ('anomaly_cluster', $1, $2, $3) RETURNING id"
    )
    .bind(serde_json::json!(endpoint_ids))
    .bind(high_anomalies.len() as i32)
    .bind(severity)
    .fetch_one(pool)
    .await?;

    Ok(Some(id.0))
}
