use anyhow::Result;
use chrono::{DateTime, Utc};
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

/// Run the retention job. Call this periodically (e.g., daily).
pub async fn run_retention(pool: &PgPool, retention_days: i64) -> Result<()> {
    tracing::info!("🔄 Running retention job (retention_days={})", retention_days);

    let cutoff = Utc::now() - chrono::Duration::days(retention_days);

    archive_deliveries(pool, cutoff).await?;
    cleanup_idempotency_keys(pool).await?;

    tracing::info!("✅ Retention job completed");
    Ok(())
}
