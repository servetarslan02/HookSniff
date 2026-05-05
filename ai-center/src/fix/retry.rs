use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::risk::scorer::risk_level;

/// Auto-adjust retry policy based on risk score
pub async fn adjust_retry_policy(
    pool: &PgPool,
    endpoint_id: Uuid,
    risk_score: i32,
) -> anyhow::Result<Option<String>> {
    let level = risk_level(risk_score);

    let new_policy = match level {
        "low" => {
            // Default policy
            json!({
                "max_attempts": 3,
                "backoff": "exponential",
                "initial_delay_secs": 10,
                "max_delay_secs": 3600
            })
        }
        "medium" => {
            // More aggressive retries
            json!({
                "max_attempts": 5,
                "backoff": "exponential",
                "initial_delay_secs": 15,
                "max_delay_secs": 3600
            })
        }
        "high" => {
            // Very aggressive retries + circuit breaker
            json!({
                "max_attempts": 7,
                "backoff": "exponential",
                "initial_delay_secs": 30,
                "max_delay_secs": 7200
            })
        }
        "critical" => {
            // Disable retries, circuit break
            json!({
                "max_attempts": 1,
                "backoff": "fixed",
                "initial_delay_secs": 0,
                "max_delay_secs": 0
            })
        }
        _ => return Ok(None),
    };

    // Check current policy
    let current: (Option<serde_json::Value>,) =
        sqlx::query_as("SELECT retry_policy FROM endpoints WHERE id = $1")
            .bind(endpoint_id)
            .fetch_one(pool)
            .await?;

    // Only update if policy is different
    if current.0.as_ref() == Some(&new_policy) {
        return Ok(None);
    }

    sqlx::query("UPDATE endpoints SET retry_policy = $1 WHERE id = $2")
        .bind(&new_policy)
        .bind(endpoint_id)
        .execute(pool)
        .await?;

    let action_desc = format!(
        "Retry policy güncellendi: {} seviye → max_attempts: {}",
        level,
        new_policy["max_attempts"]
    );

    // Log the action
    sqlx::query(
        "INSERT INTO ai_actions (action_type, description, target_type, target_id, status, risk_level, auto_approved, executed_at) VALUES ('fix', $1, 'endpoint', $2, 'executed', $3, true, now())"
    )
    .bind(&action_desc)
    .bind(endpoint_id)
    .bind(level)
    .execute(pool)
    .await?;

    tracing::info!("🔧 {}", action_desc);

    Ok(Some(action_desc))
}

/// Check if an endpoint should be circuit-broken (failure rate > 50%)
pub async fn check_circuit_break(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> anyhow::Result<bool> {
    let stats: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM deliveries
        WHERE endpoint_id = $1
          AND created_at > now() - INTERVAL '15 minutes'
        "#,
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await?;

    if stats.0 >= 10 {
        let failure_rate = stats.1 as f64 / stats.0 as f64;
        if failure_rate > 0.5 {
            tracing::warn!(
                "⚡ Circuit break gerekli: Endpoint {} — %{:.1} hata oranı",
                endpoint_id,
                failure_rate * 100.0
            );
            return Ok(true);
        }
    }

    Ok(false)
}
