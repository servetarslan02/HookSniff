use sqlx::PgPool;
use uuid::Uuid;

use crate::defense::blocker;

/// Circuit breaker states
#[derive(Debug, PartialEq)]
pub enum CircuitState {
    Closed,   // Normal operation
    Open,     // Blocked, waiting
    HalfOpen, // Testing
}

/// Check circuit state for an endpoint
pub async fn get_circuit_state(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> anyhow::Result<CircuitState> {
    // Check if endpoint is disabled by AI
    let is_active: (bool,) = sqlx::query_as(
        "SELECT is_active FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await?;

    if !is_active.0 {
        // Check if it was disabled recently (within 5 min = open, after = half-open)
        let recent_disable: (Option<chrono::DateTime<chrono::Utc>>,) = sqlx::query_as(
            "SELECT MAX(created_at) FROM ai_events WHERE target_id = $1 AND action_taken = 'auto_disable'"
        )
        .bind(endpoint_id)
        .fetch_one(pool)
        .await?;

        if let Some(disabled_at) = recent_disable.0 {
            let elapsed = chrono::Utc::now() - disabled_at;
            if elapsed > chrono::Duration::minutes(5) {
                return Ok(CircuitState::HalfOpen);
            }
        }

        return Ok(CircuitState::Open);
    }

    Ok(CircuitState::Closed)
}

/// Execute circuit breaker: disable endpoint, schedule re-test
pub async fn circuit_break(
    pool: &PgPool,
    endpoint_id: Uuid,
    reason: &str,
) -> anyhow::Result<()> {
    // Disable endpoint
    blocker::disable_endpoint(pool, endpoint_id, reason).await?;

    // Log circuit break action
    sqlx::query(
        "INSERT INTO ai_actions (action_type, description, target_type, target_id, status, risk_level, auto_approved, executed_at) VALUES ('fix', $1, 'endpoint', $2, 'executed', 'high', true, now())"
    )
    .bind(format!("Circuit break uygulandı: {}", reason))
    .bind(endpoint_id)
    .execute(pool)
    .await?;

    tracing::warn!("⚡ Circuit break uygulandı: Endpoint {} — {}", endpoint_id, reason);

    Ok(())
}

/// Test circuit: send single request, if successful re-enable
pub async fn test_circuit(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> anyhow::Result<bool> {
    // Check recent deliveries (last 2 minutes) for this endpoint
    let recent: (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'delivered') as success
        FROM deliveries
        WHERE endpoint_id = $1
          AND created_at > now() - INTERVAL '2 minutes'
        "#,
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await?;

    if recent.0 > 0 && recent.1 > 0 {
        // Success! Re-enable endpoint
        blocker::enable_endpoint(pool, endpoint_id).await?;

        sqlx::query(
            "INSERT INTO ai_events (event_type, severity, title, description, target_type, target_id, action_taken) VALUES ('fix', 'info', 'Circuit kapatıldı', 'Endpoint test başarılı, yeniden aktif', 'endpoint', $1, 'circuit_close')"
        )
        .bind(endpoint_id)
        .execute(pool)
        .await?;

        tracing::info!("✅ Circuit kapatıldı: Endpoint {} yeniden aktif", endpoint_id);
        return Ok(true);
    }

    Ok(false)
}
