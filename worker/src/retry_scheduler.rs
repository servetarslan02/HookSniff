//! Retry Scheduler — Re-queues failed deliveries for retry.
//!
//! Polls the `webhook_queue` table every 30 seconds for deliveries
//! with `next_retry_at <= now()` and `status = 'pending'`, then
//! marks them as available for the main processing loop.
//!
//! NOTE: This module is not currently wired into main.rs.
//! The main loop already handles retries via `next_retry_at` filtering.
//! This module exists for potential future use as a standalone scheduler.

use anyhow::Result;

/// Background task that ensures retry-eligible deliveries are picked up.
///
/// In the current architecture, the main polling loop in `process_pending`
/// already filters by `next_retry_at <= now()`, so this is a safety net
/// that can be enabled if needed.
pub async fn run_retry_scheduler(pool: sqlx::PgPool) {
    tracing::info!("⏰ Retry scheduler started — polling every 30s");

    loop {
        tokio::time::sleep(std::time::Duration::from_secs(30)).await;

        match reset_stale_processing(&pool).await {
            Ok(count) => {
                if count > 0 {
                    tracing::info!(
                        "🔄 Retry scheduler: reset {} stale 'processing' items back to 'pending'",
                        count
                    );
                }
            }
            Err(e) => {
                tracing::error!("❌ Retry scheduler error: {:?}", e);
            }
        }
    }
}

/// Reset items stuck in 'processing' for too long back to 'pending'.
///
/// If a worker crashes mid-delivery, items can get stuck in 'processing'.
/// This resets them after 5 minutes so they can be retried.
async fn reset_stale_processing(pool: &sqlx::PgPool) -> Result<usize> {
    let result = sqlx::query(
        r#"
        UPDATE webhook_queue
        SET status = 'pending'
        WHERE status = 'processing'
          AND processed_at < now() - INTERVAL '5 minutes'
        "#,
    )
    .execute(pool)
    .await?;

    Ok(result.rows_affected() as usize)
}
