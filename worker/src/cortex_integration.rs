//! Cortex ↔ Worker Integration
//!
//! Connects the webhook delivery worker to Cortex intelligence:
//! - Reads routing decisions (smart routing)
//! - Applies recovery surge rate limits
//! - Reports delivery outcomes for ML learning
//! - Reads healing actions (rate_limit_reduce, timeout_adjust, etc.)

use sqlx::PgPool;
use uuid::Uuid;

/// Read Cortex routing decision for an endpoint
/// Returns the recommended URL if Cortex suggests switching
pub async fn get_routing_decision(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<Option<String>, sqlx::Error> {
    let result: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT recommended_url 
        FROM cortex_routing_decisions 
        WHERE endpoint_id = $1 
          AND created_at > NOW() - INTERVAL '15 minutes'
          AND applied = false
        ORDER BY created_at DESC 
        LIMIT 1
        "#
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|(url,)| url))
}

/// Get active recovery surge rate for an endpoint
/// Returns (surge_id, current_rate_per_min) if a surge is active
pub async fn get_surge_rate(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<Option<(i64, f64)>, sqlx::Error> {
    let result: Option<(i64, f64)> = sqlx::query_as(
        r#"
        SELECT id, current_rate_per_min 
        FROM recovery_surges 
        WHERE endpoint_id = $1 
          AND status = 'active'
        ORDER BY started_at DESC 
        LIMIT 1
        "#
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    Ok(result)
}

/// Check if endpoint has any active healing actions that affect delivery
/// Returns the most recent active action type (if any)
pub async fn get_active_healing_action(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<Option<HealingAction>, sqlx::Error> {
    let result: Option<(String, serde_json::Value)> = sqlx::query_as(
        r#"
        SELECT action_type, details 
        FROM healing_actions 
        WHERE endpoint_id = $1 
          AND outcome = 'pending'
          AND created_at > NOW() - INTERVAL '30 minutes'
        ORDER BY created_at DESC 
        LIMIT 1
        "#
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    Ok(result.map(|(action_type, details)| HealingAction {
        action_type,
        details,
    }))
}

/// Report delivery outcome to Cortex for ML learning
/// This feeds the bandit models and quality tracker
pub async fn report_delivery_outcome(
    pool: &PgPool,
    endpoint_id: Uuid,
    customer_id: Uuid,
    success: bool,
    latency_ms: f64,
    status_code: u16,
    strategy_used: &str,
) -> Result<(), sqlx::Error> {
    // Record in action memory for bandit learning
    let reward = if success {
        let latency_factor = (1.0 - latency_ms / 20000.0).max(0.5);
        latency_factor
    } else {
        0.0
    };

    // Update strategy weight for this endpoint
    sqlx::query(
        r#"
        INSERT INTO endpoint_strategy_weights (endpoint_id, strategy_name, attempts, successes, weight, last_used, updated_at)
        VALUES ($1, $2, 1, $3::INT, $4, NOW(), NOW())
        ON CONFLICT (endpoint_id, strategy_name) DO UPDATE SET
            attempts = endpoint_strategy_weights.attempts + 1,
            successes = endpoint_strategy_weights.successes + EXCLUDED.successes,
            weight = (endpoint_strategy_weights.successes + EXCLUDED.successes)::FLOAT / (endpoint_strategy_weights.attempts + 1)::FLOAT,
            last_used = NOW(),
            updated_at = NOW()
        "#
    )
    .bind(endpoint_id)
    .bind(strategy_used)
    .bind(if success { 1 } else { 0 })
    .bind(reward)
    .execute(pool)
    .await?;

    // Record ML decision for quality tracking
    sqlx::query(
        r#"
        INSERT INTO ml_decisions (endpoint_id, decision_type, chosen_action, context, reward)
        VALUES ($1, 'delivery_outcome', $2, $3, $4)
        "#
    )
    .bind(endpoint_id)
    .bind(strategy_used)
    .bind(serde_json::json!({
        "success": success,
        "latency_ms": latency_ms,
        "status_code": status_code,
    }))
    .bind(reward)
    .execute(pool)
    .await?;

    // Update recovery surge progress if active
    if let Some((surge_id, _rate)) = get_surge_rate(pool, endpoint_id).await? {
        if success {
            sqlx::query(
                "UPDATE recovery_surges SET processed_count = processed_count + 1 WHERE id = $1"
            ).bind(surge_id).execute(pool).await?;
        } else {
            sqlx::query(
                "UPDATE recovery_surges SET failed_count = failed_count + 1 WHERE id = $1"
            ).bind(surge_id).execute(pool).await?;
        }
    }

    Ok(())
}

/// Report endpoint health metrics to Cortex (called periodically by worker)
pub async fn report_endpoint_health(
    pool: &PgPool,
    endpoint_id: Uuid,
    success_rate_1h: f64,
    avg_latency_ms: f64,
    p95_latency_ms: f64,
) -> Result<(), sqlx::Error> {
    // Update endpoint profile with real-time data from worker
    sqlx::query(
        r#"
        UPDATE endpoint_profiles SET
            success_rate_1h = $2,
            avg_latency_ms = $3,
            latency_p95 = $4,
            updated_at = NOW()
        WHERE endpoint_id = $1
        "#
    )
    .bind(endpoint_id)
    .bind(success_rate_1h)
    .bind(avg_latency_ms)
    .bind(p95_latency_ms as i32)
    .execute(pool)
    .await?;

    Ok(())
}

#[derive(Debug)]
pub struct HealingAction {
    pub action_type: String,
    pub details: serde_json::Value,
}

impl HealingAction {
    /// Get the adjusted timeout from healing action details
    pub fn get_timeout_adjustment(&self) -> Option<f64> {
        self.details.get("timeout_factor").and_then(|v| v.as_f64())
    }

    /// Get the rate limit reduction factor
    pub fn get_rate_limit_factor(&self) -> Option<f64> {
        self.details.get("rate_factor").and_then(|v| v.as_f64())
    }
}
