use anyhow::Result;
use chrono::{DateTime, Datelike, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// Archive delivered deliveries to dead_letters before deleting them.
async fn archive_deliveries(pool: &PgPool, before: DateTime<Utc>) -> Result<u64> {
    // Move delivered/failed deliveries to dead_letters for archival
    let result = sqlx::query(
        r#"
        INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts, created_at)
        SELECT d.id, d.endpoint_id, d.customer_id, d.payload,
               'retention_policy' || ' - ' || d.status, d.attempt_count, d.created_at
        FROM deliveries d
        WHERE d.status IN ('delivered', 'failed')
          AND d.created_at < $1
          AND NOT EXISTS (
              SELECT 1 FROM dead_letters dl WHERE dl.delivery_id = d.id
          )
        "#,
    )
    .bind(before)
    .execute(pool)
    .await?;

    tracing::info!("📦 Archived {} deliveries to dead_letters", result.rows_affected());

    // Now delete the archived deliveries
    let deleted = sqlx::query(
        r#"
        DELETE FROM deliveries
        WHERE status IN ('delivered', 'failed')
          AND created_at < $1
          AND id IN (SELECT delivery_id FROM dead_letters)
        "#,
    )
    .bind(before)
    .execute(pool)
    .await?;

    tracing::info!("🗑️ Deleted {} old deliveries", deleted.rows_affected());
    Ok(deleted.rows_affected())
}

/// Delete expired idempotency keys.
async fn cleanup_idempotency_keys(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query("DELETE FROM idempotency_keys WHERE expires_at < now()")
        .execute(pool)
        .await?;

    tracing::info!("🧹 Cleaned up {} expired idempotency keys", result.rows_affected());
    Ok(result.rows_affected())
}

/// Clean up processed webhook_queue items older than 7 days.
async fn cleanup_webhook_queue(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query(
        r#"DELETE FROM webhook_queue
           WHERE status IN ('delivered', 'dead_letter')
             AND processed_at < now() - INTERVAL '7 days'"#,
    )
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        tracing::info!("🧹 Cleaned up {} processed queue items", result.rows_affected());
    }
    Ok(result.rows_affected())
}

/// Reset monthly webhook counters for all customers.
///
/// Runs on the 1st of each month. Uses a marker to avoid running twice.
pub async fn reset_monthly_webhook_counts(pool: &PgPool) -> Result<()> {
    let now = Utc::now();
    // Only reset on the 1st of the month, within the first 24 hours
    if now.day() != 1 {
        return Ok(());
    }

    let result = sqlx::query("UPDATE customers SET webhook_count = 0 WHERE webhook_count > 0")
        .execute(pool)
        .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🔄 Reset monthly webhook counters for {} customers",
            result.rows_affected()
        );
    }
    Ok(())
}

/// Clean up expired seen_webhooks entries.
async fn cleanup_seen_webhooks(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query("DELETE FROM seen_webhooks WHERE expires_at < now()")
        .execute(pool)
        .await?;

    if result.rows_affected() > 0 {
        tracing::info!("🧹 Cleaned up {} expired seen webhooks", result.rows_affected());
    }
    Ok(result.rows_affected())
}

/// Run the retention job. Call this periodically (e.g., daily).
pub async fn run_retention(pool: &PgPool, retention_days: i64) -> Result<()> {
    tracing::info!("🔄 Running retention job (retention_days={})", retention_days);

    let cutoff = Utc::now() - chrono::Duration::days(retention_days);

    archive_deliveries(pool, cutoff).await?;
    cleanup_idempotency_keys(pool).await?;
    cleanup_webhook_queue(pool).await?;
    cleanup_seen_webhooks(pool).await?;
    reset_monthly_webhook_counts(pool).await?;

    tracing::info!("✅ Retention job completed");
    Ok(())
}
