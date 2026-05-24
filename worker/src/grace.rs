//! Grace period management for the HookSniff Worker.
//!
//! Downgrades customers to free plan after 7 days of failed payment.

use anyhow::Result;
use sqlx::PgPool;

/// Grace period in days after a failed payment before downgrade.
const GRACE_PERIOD_DAYS: i64 = 7;

/// Downgrade customers whose payment_failed_at is older than 7 days.
/// Called every 6 hours by the worker's main loop.
pub async fn process_expired_grace_periods(pool: &PgPool) -> Result<usize> {
    let cutoff = chrono::Utc::now() - chrono::Duration::days(GRACE_PERIOD_DAYS);

    // Find customers past grace period
    let rows: Vec<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT id FROM customers \
         WHERE payment_failed_at IS NOT NULL \
         AND payment_failed_at < $1 \
         AND plan != 'free'",
    )
    .bind(cutoff)
    .fetch_all(pool)
    .await?;

    let count = rows.len();

    for (customer_id,) in &rows {
        let free_limit: i32 = 10_000; // Plan::Free.max_webhooks_per_month()

        sqlx::query(
            "UPDATE customers SET plan = 'free', webhook_limit = $1, \
             payment_failed_at = NULL, cancel_at_period_end = false, updated_at = NOW() \
             WHERE id = $2",
        )
        .bind(free_limit)
        .bind(customer_id)
        .execute(pool)
        .await?;

        // Disable excess endpoints (free plan = 5)
        let max_endpoints: i64 = 5;
        let active_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true",
        )
        .bind(customer_id)
        .fetch_one(pool)
        .await?;

        if active_count.0 > max_endpoints {
            let excess = active_count.0 - max_endpoints;
            sqlx::query(
                "UPDATE endpoints SET is_active = false, updated_at = NOW() \
                 WHERE id IN (\
                   SELECT id FROM endpoints \
                   WHERE customer_id = $1 AND is_active = true \
                   ORDER BY created_at DESC \
                   LIMIT $2\
                 )",
            )
            .bind(customer_id)
            .bind(excess)
            .execute(pool)
            .await?;
        }

        tracing::info!(
            "⏰ Customer {} downgraded to free after {} day grace period",
            customer_id,
            GRACE_PERIOD_DAYS
        );
    }

    Ok(count)
}
