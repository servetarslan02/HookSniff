//! Stage 5: Action Memory + Adaptive Learning
//!
//! Records every cortex action and its outcome.
//! Foundation for Multi-Armed Bandit: tracks which strategies work per endpoint.

use sqlx::PgPool;
use uuid::Uuid;

/// Record a new action in history.
pub async fn record_action(
    pool: &PgPool,
    endpoint_id: Uuid,
    customer_id: Option<Uuid>,
    action_type: &str,
    reason: &str,
    context: serde_json::Value,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO cortex_action_history (endpoint_id, customer_id, action_type, reason, context) VALUES ($1, $2, $3, $4, $5)"
    )
    .bind(endpoint_id)
    .bind(customer_id)
    .bind(action_type)
    .bind(reason)
    .bind(context)
    .execute(pool)
    .await?;
    super::CORTEX_METRICS.action_memory_records.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    Ok(())
}

/// Update the outcome of the most recent pending action for an endpoint.
pub async fn record_outcome(
    pool: &PgPool,
    endpoint_id: Uuid,
    outcome: &str,
    details: Option<serde_json::Value>,
) -> Result<(), sqlx::Error> {
    let now = chrono::Utc::now();
    sqlx::query(
        r#"
        UPDATE cortex_action_history
        SET outcome = $1, outcome_details = $2, resolved_at = $3,
            time_to_resolution_secs = EXTRACT(EPOCH FROM ($3 - created_at))::INT,
            success_score = CASE WHEN $1 = 'success' THEN 1.0 WHEN $1 = 'partial' THEN 0.5 ELSE 0.0 END
        WHERE id = (
            SELECT id FROM cortex_action_history
            WHERE endpoint_id = $4 AND outcome = 'pending'
            ORDER BY created_at DESC LIMIT 1
        )
        "#
    )
    .bind(outcome)
    .bind(details.unwrap_or(serde_json::json!({})))
    .bind(now)
    .bind(endpoint_id)
    .execute(pool)
    .await?;

    // Update strategy weights (Multi-Armed Bandit)
    update_strategy_weight(pool, endpoint_id, outcome).await?;

    Ok(())
}

/// Update strategy weights using Multi-Armed Bandit (epsilon-greedy).
async fn update_strategy_weight(pool: &PgPool, endpoint_id: Uuid, outcome: &str) -> Result<(), sqlx::Error> {
    // Get the last action's type as the "strategy"
    let last: Option<(String,)> = sqlx::query_as(
        "SELECT action_type FROM cortex_action_history WHERE endpoint_id = $1 AND outcome != 'pending' ORDER BY created_at DESC LIMIT 1"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let strategy = match last {
        Some((s,)) => s,
        None => return Ok(()),
    };

    let success = outcome == "success";

    // Upsert strategy weight
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
    .bind(&strategy)
    .bind(if success { 1 } else { 0 })
    .bind(if success { 1.0 } else { 0.0 })
    .execute(pool)
    .await?;

    Ok(())
}

/// Get the best strategy for an endpoint (highest weight).
/// Returns None if no strategies have been tried yet.
pub async fn get_best_strategy(pool: &PgPool, endpoint_id: Uuid) -> Result<Option<String>, sqlx::Error> {
    let result: Option<(String,)> = sqlx::query_as(
        "SELECT strategy_name FROM endpoint_strategy_weights WHERE endpoint_id = $1 AND attempts >= 3 ORDER BY weight DESC LIMIT 1"
    ).bind(endpoint_id).fetch_optional(pool).await?;
    Ok(result.map(|(s,)| s))
}
