//! Stage 6: Recovery Surge
//!
//! Controls the rate at which queued webhooks are re-delivered after an outage.
//! Prevents the "recovery surge" pattern where 500K queued webhooks crash the consumer.

use super::config::CortexConfig;

/// Start a recovery surge for an endpoint that has queued deliveries.
pub async fn start_surge(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
    queued_count: i32,
    config: &CortexConfig,
) -> Result<i64, sqlx::Error> {
    let steps = config.recovery_ramp_steps.clone();
    let total_steps = steps.len() as i32;
    let initial_rate = steps.first().copied().unwrap_or(10.0);

    let id: (i64,) = sqlx::query_as(
        "INSERT INTO recovery_surges (endpoint_id, trigger_reason, queued_count, current_rate_per_min, target_rate_per_min, ramp_step, total_steps) VALUES ($1, 'outage_recovery', $2, $3, $4, 1, $5) RETURNING id"
    )
    .bind(endpoint_id)
    .bind(queued_count)
    .bind(initial_rate)
    .bind(steps.last().copied().unwrap_or(200.0))
    .bind(total_steps)
    .fetch_one(pool)
    .await?;

    super::CORTEX_METRICS.recovery_surges_started.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    tracing::info!("🔄 Recovery surge started for endpoint {}: {} queued, {} steps", endpoint_id, queued_count, total_steps);

    Ok(id.0)
}

/// Advance the surge to the next ramp step.
/// Returns the new rate per minute.
pub async fn advance_surge(
    pool: &sqlx::PgPool,
    surge_id: i64,
    config: &CortexConfig,
) -> Result<f64, sqlx::Error> {
    let steps = &config.recovery_ramp_steps;

    let current: Option<(i32,)> = sqlx::query_as(
        "SELECT ramp_step FROM recovery_surges WHERE id = $1 AND status = 'active'"
    ).bind(surge_id).fetch_optional(pool).await?;

    let (step,) = match current {
        Some(s) => s,
        None => return Ok(0.0),
    };

    let next_step = step + 1;
    if next_step as usize >= steps.len() {
        // Surge complete
        sqlx::query(
            "UPDATE recovery_surges SET status = 'completed', completed_at = NOW(), ramp_step = $1 WHERE id = $2"
        ).bind(next_step).bind(surge_id).execute(pool).await?;
        super::CORTEX_METRICS.recovery_surges_completed.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        return Ok(0.0);
    }

    let new_rate = steps[next_step as usize - 1];
    sqlx::query(
        "UPDATE recovery_surges SET ramp_step = $1, current_rate_per_min = $2 WHERE id = $3"
    ).bind(next_step).bind(new_rate).bind(surge_id).execute(pool).await?;

    Ok(new_rate)
}

/// Get active surge for an endpoint (if any).
pub async fn get_active_surge(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
) -> Result<Option<(i64, f64, i32)>, sqlx::Error> {
    let result = sqlx::query_as(
        "SELECT id, current_rate_per_min, ramp_step FROM recovery_surges WHERE endpoint_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    Ok(result)
}
