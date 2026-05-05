use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

/// Block an IP address for a specified duration
pub async fn block_ip(pool: &PgPool, ip: &str, reason: &str, duration_minutes: i32) -> anyhow::Result<()> {
    let expires_at = Utc::now() + Duration::minutes(duration_minutes as i64);

    sqlx::query(
        "INSERT INTO ai_blocklist (block_type, block_value, reason, expires_at) VALUES ('ip', $1, $2, $3)"
    )
    .bind(ip)
    .bind(reason)
    .bind(expires_at)
    .execute(pool)
    .await?;

    tracing::warn!("🚫 IP engellendi: {} ({} dakika, sebep: {})", ip, duration_minutes, reason);
    Ok(())
}

/// Block a customer temporarily
pub async fn block_customer(pool: &PgPool, customer_id: Uuid, reason: &str, duration_minutes: i32) -> anyhow::Result<()> {
    let expires_at = Utc::now() + Duration::minutes(duration_minutes as i64);

    sqlx::query(
        "INSERT INTO ai_blocklist (block_type, block_value, reason, expires_at) VALUES ('customer', $1, $2, $3)"
    )
    .bind(customer_id.to_string())
    .bind(reason)
    .bind(expires_at)
    .execute(pool)
    .await?;

    tracing::warn!("🚫 Müşteri engellendi: {} ({} dakika, sebep: {})", customer_id, duration_minutes, reason);
    Ok(())
}

/// Disable an endpoint temporarily
pub async fn disable_endpoint(pool: &PgPool, endpoint_id: Uuid, reason: &str) -> anyhow::Result<()> {
    sqlx::query(
        "UPDATE endpoints SET is_active = false WHERE id = $1"
    )
    .bind(endpoint_id)
    .execute(pool)
    .await?;

    sqlx::query(
        "INSERT INTO ai_events (event_type, severity, title, description, target_type, target_id, action_taken) VALUES ('defense', 'warning', 'Endpoint devre dışı bırakıldı', $1, 'endpoint', $2, 'auto_disable')"
    )
    .bind(reason)
    .bind(endpoint_id)
    .execute(pool)
    .await?;

    tracing::warn!("⛔ Endpoint devre dışı bırakıldı: {} (sebep: {})", endpoint_id, reason);
    Ok(())
}

/// Re-enable an endpoint
pub async fn enable_endpoint(pool: &PgPool, endpoint_id: Uuid) -> anyhow::Result<()> {
    sqlx::query(
        "UPDATE endpoints SET is_active = true WHERE id = $1"
    )
    .bind(endpoint_id)
    .execute(pool)
    .await?;

    tracing::info!("✅ Endpoint yeniden aktif: {}", endpoint_id);
    Ok(())
}

/// Check if an IP is currently blocked
pub async fn is_ip_blocked(pool: &PgPool, ip: &str) -> anyhow::Result<bool> {
    let result: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM ai_blocklist WHERE block_type = 'ip' AND block_value = $1 AND (expires_at IS NULL OR expires_at > now()))"
    )
    .bind(ip)
    .fetch_one(pool)
    .await?;

    Ok(result.0)
}

/// Check if a customer is currently blocked
pub async fn is_customer_blocked(pool: &PgPool, customer_id: Uuid) -> anyhow::Result<bool> {
    let result: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM ai_blocklist WHERE block_type = 'customer' AND block_value = $1 AND (expires_at IS NULL OR expires_at > now()))"
    )
    .bind(customer_id.to_string())
    .fetch_one(pool)
    .await?;

    Ok(result.0)
}

/// Get all active blocks
pub async fn get_active_blocks(pool: &PgPool) -> anyhow::Result<Vec<(String, String, Option<String>, Option<chrono::DateTime<Utc>>)>> {
    let blocks = sqlx::query_as::<_, (String, String, Option<String>, Option<chrono::DateTime<Utc>>)>(
        "SELECT block_type, block_value, reason, expires_at FROM ai_blocklist WHERE expires_at IS NULL OR expires_at > now() ORDER BY created_at DESC"
    )
    .fetch_all(pool)
    .await?;

    Ok(blocks)
}
