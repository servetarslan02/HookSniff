//! FIFO-aware delivery check for the worker.
//!
//! When an endpoint has FIFO enabled, deliveries must be ordered.
//! This module checks if a delivery should proceed now or wait.

use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

/// Check if a delivery should proceed for a FIFO-enabled endpoint.
///
/// Returns `true` if:
/// - FIFO is not enabled for this endpoint (always deliver)
/// - This is the next item in sequence (can deliver now)
///
/// Returns `false` if:
/// - A previous item is still pending/processing (must wait)
pub async fn should_deliver_fifo(pool: &PgPool, endpoint_id: Uuid) -> Result<bool> {
    // Check if FIFO is enabled for this endpoint
    let fifo_enabled: bool =
        sqlx::query_scalar("SELECT COALESCE(fifo_enabled, false) FROM endpoints WHERE id = $1")
            .bind(endpoint_id)
            .fetch_one(pool)
            .await
            .unwrap_or(false);

    if !fifo_enabled {
        return Ok(true); // FIFO disabled, deliver immediately
    }

    // Find the oldest pending item for this endpoint
    let head: Option<(i64,)> = sqlx::query_as(
        "SELECT sequence_num FROM fifo_queue WHERE endpoint_id = $1 AND status = 'pending' ORDER BY sequence_num ASC LIMIT 1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    let (seq,) = match head {
        Some(s) => s,
        None => return Ok(true), // No pending FIFO items
    };

    // First item can always be delivered
    if seq <= 1 {
        return Ok(true);
    }

    // Check if previous item is completed
    let prev_status: Option<String> = sqlx::query_scalar(
        "SELECT status FROM fifo_queue WHERE endpoint_id = $1 AND sequence_num = $2"
    )
    .bind(endpoint_id)
    .bind(seq - 1)
    .fetch_optional(pool)
    .await?;

    match prev_status.as_deref() {
        Some("delivered") | Some("timed_out") | Some("dead_lettered") | None => Ok(true),
        _ => Ok(false), // Previous still pending/processing/failed
    }
}

/// Mark a FIFO item as delivered (unblocks next item).
pub async fn mark_fifo_delivered(pool: &PgPool, endpoint_id: Uuid, delivery_id: Uuid) -> Result<()> {
    // Find the FIFO item matching this delivery
    let item_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM fifo_queue WHERE endpoint_id = $1 AND status = 'processing' ORDER BY sequence_num ASC LIMIT 1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    if let Some(id) = item_id {
        sqlx::query("UPDATE fifo_queue SET status = 'delivered' WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        tracing::debug!(item_id = %id, delivery_id = %delivery_id, "FIFO item marked delivered");
    }
    Ok(())
}

/// Mark a FIFO item as failed (blocks subsequent items).
pub async fn mark_fifo_failed(pool: &PgPool, endpoint_id: Uuid) -> Result<()> {
    let item_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM fifo_queue WHERE endpoint_id = $1 AND status = 'processing' ORDER BY sequence_num ASC LIMIT 1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    if let Some(id) = item_id {
        sqlx::query("UPDATE fifo_queue SET status = 'failed' WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        tracing::warn!(item_id = %id, "FIFO item marked failed — blocking subsequent items");
    }
    Ok(())
}

/// Check and break FIFO chains that have timed out.
/// Called periodically by the worker.
pub async fn check_fifo_timeouts(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query(
        r#"
        UPDATE fifo_queue fq
        SET status = 'timed_out'
        FROM endpoints ep
        WHERE fq.endpoint_id = ep.id
          AND fq.status = 'pending'
          AND fq.created_at < now() - make_interval(secs => COALESCE(ep.fifo_max_wait_secs, 300))
        "#
    )
    .execute(pool)
    .await?;

    let count = result.rows_affected();
    if count > 0 {
        tracing::info!(count = count, "FIFO items timed out — chains broken");
    }
    Ok(count)
}
