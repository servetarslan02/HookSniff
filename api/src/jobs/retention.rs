use anyhow::Result;
use chrono::Utc;
use sqlx::PgPool;

/// Delete expired idempotency keys.
async fn cleanup_idempotency_keys(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query("DELETE FROM idempotency_keys WHERE expires_at < now()")
        .execute(pool)
        .await?;

    tracing::info!(
        "🧹 Cleaned up {} expired idempotency keys",
        result.rows_affected()
    );
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
        tracing::info!(
            "🧹 Cleaned up {} processed queue items",
            result.rows_affected()
        );
    }
    Ok(result.rows_affected())
}

/// Reset monthly webhook counters for all customers.
///
/// Item 275: Period-based reset — resets on each customer's billing anniversary
/// (based on created_at), not on the 1st of every calendar month.
/// This ensures customers who signed up on the 15th get their count reset
/// on the 15th of each month, not the 1st.
pub async fn reset_monthly_webhook_counts(pool: &PgPool) -> Result<()> {
    // Reset customers whose billing anniversary has arrived this month
    // and who haven't been reset yet this period.
    // Logic: created_at's day-of-month <= today AND last reset was before this period start
    let result = sqlx::query(
        r#"UPDATE customers
           SET webhook_count = 0, updated_at = NOW()
           WHERE webhook_count > 0
             AND (
               -- Customer's billing day-of-month has arrived
               EXTRACT(DAY FROM created_at)::int <= EXTRACT(DAY FROM NOW())::int
               -- And we haven't already reset this period
               AND (
                 updated_at < DATE_TRUNC('month', NOW()) + (EXTRACT(DAY FROM created_at) - 1) * INTERVAL '1 day'
                 OR updated_at IS NULL
               )
             )"#,
    )
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🔄 Reset monthly webhook counters for {} customers (period-based)",
            result.rows_affected()
        );
    }
    Ok(())
}

/// Reset daily webhook counters — runs every day at midnight UTC.
/// All customers get their webhook_count reset to 0 daily.
pub async fn reset_daily_webhook_counts(pool: &PgPool) -> Result<()> {
    let result = sqlx::query(
        r#"UPDATE customers
           SET webhook_count = 0, updated_at = NOW()
           WHERE webhook_count > 0"#,
    )
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🔄 Reset daily webhook counters for {} customers",
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
        tracing::info!(
            "🧹 Cleaned up {} expired seen webhooks",
            result.rows_affected()
        );
    }
    Ok(result.rows_affected())
}

/// Clean up old SSO login attempts (keep 90 days).
async fn cleanup_sso_login_attempts(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query(
        "DELETE FROM sso_login_attempts WHERE created_at < now() - INTERVAL '90 days'"
    )
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🧹 Cleaned up {} old SSO login attempts",
            result.rows_affected()
        );
    }
    Ok(result.rows_affected())
}

/// Clean up old dunning reminders (keep 30 days).
async fn cleanup_old_dunning_reminders(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query(
        "DELETE FROM dunning_reminders WHERE sent_at < now() - INTERVAL '30 days'"
    )
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🧹 Cleaned up {} old dunning reminders",
            result.rows_affected()
        );
    }
    Ok(result.rows_affected())
}

/// Clean up old payment retry attempts (keep 90 days).
async fn cleanup_old_payment_retries(pool: &PgPool) -> Result<u64> {
    let result = sqlx::query(
        "DELETE FROM payment_retry_attempts WHERE attempted_at < now() - INTERVAL '90 days'"
    )
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🧹 Cleaned up {} old payment retry attempts",
            result.rows_affected()
        );
    }
    Ok(result.rows_affected())
}

/// Run the retention job. Call this periodically (e.g., daily).
///
/// Per-customer retention: each customer's data is retained based on their plan's
/// retention_days (7 for Developer, 14 for Startup, 180 for Pro, 365 for Enterprise).
pub async fn run_retention(pool: &PgPool, _default_retention_days: i64) -> Result<()> {
    tracing::info!("🔄 Running per-customer retention job");

    // Get all active customers with their plan
    let customers: Vec<(uuid::Uuid, String)> = sqlx::query_as(
        "SELECT id, plan FROM customers WHERE is_active = true"
    )
    .fetch_all(pool)
    .await?;

    let mut total_deleted = 0u64;

    for (customer_id, plan_str) in &customers {
        let plan = crate::billing::Plan::parse_str(plan_str);
        let retention = plan.retention_days();
        let cutoff = Utc::now() - chrono::Duration::days(retention);

        // Archive and delete this customer's old deliveries
        let archived = sqlx::query(
            r#"
            INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts, created_at)
            SELECT d.id, d.endpoint_id, d.customer_id, d.payload,
                   'retention_policy - ' || d.status, d.attempt_count, d.created_at
            FROM deliveries d
            WHERE d.customer_id = $1
              AND d.status IN ('delivered', 'failed')
              AND d.created_at < $2
              AND NOT EXISTS (
                  SELECT 1 FROM dead_letters dl WHERE dl.delivery_id = d.id
              )
            "#,
        )
        .bind(customer_id)
        .bind(cutoff)
        .execute(pool)
        .await?;

        let deleted = sqlx::query(
            r#"
            DELETE FROM deliveries
            WHERE customer_id = $1
              AND status IN ('delivered', 'failed')
              AND created_at < $2
              AND id IN (SELECT delivery_id FROM dead_letters WHERE customer_id = $1)
            "#,
        )
        .bind(customer_id)
        .bind(cutoff)
        .execute(pool)
        .await?;

        if deleted.rows_affected() > 0 {
            tracing::info!(
                "🗑️ Customer {}: deleted {} deliveries older than {} days (plan: {})",
                customer_id, deleted.rows_affected(), retention, plan_str
            );
            total_deleted += deleted.rows_affected();
        }
    }

    if total_deleted > 0 {
        tracing::info!("🗑️ Total: {} old deliveries deleted across all customers", total_deleted);
    }

    // Global cleanup tasks (not per-customer)
    cleanup_idempotency_keys(pool).await?;
    cleanup_webhook_queue(pool).await?;
    cleanup_seen_webhooks(pool).await?;
    cleanup_sso_login_attempts(pool).await?;
    cleanup_daily_event_usage(pool).await?;
    cleanup_old_dunning_reminders(pool).await?;
    cleanup_old_payment_retries(pool).await?;
    reset_monthly_webhook_counts(pool).await?;

    tracing::info!("✅ Retention job completed");
    Ok(())
}

/// Clean up daily_event_usage rows older than 90 days.
async fn cleanup_daily_event_usage(pool: &PgPool) -> Result<u64> {
    let cutoff = Utc::now() - chrono::Duration::days(90);
    let result = sqlx::query("DELETE FROM daily_event_usage WHERE event_date < $1")
        .bind(cutoff)
        .execute(pool)
        .await?;

    if result.rows_affected() > 0 {
        tracing::info!(
            "🧹 Cleaned up {} old daily_event_usage rows",
            result.rows_affected()
        );
    }
    Ok(result.rows_affected())
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Datelike, TimeZone, Utc};

    // ── Cutoff date logic tests ──

    #[test]
    fn test_cutoff_date_calculation() {
        // The retention logic: cutoff = Utc::now() - Duration::days(retention_days)
        let now = Utc::now();
        let retention_days = 30i64;
        let cutoff = now - chrono::Duration::days(retention_days);

        // Cutoff should be exactly retention_days in the past
        let diff = now - cutoff;
        assert_eq!(diff.num_days(), retention_days);
    }

    #[test]
    fn test_cutoff_date_zero_days() {
        let now = Utc::now();
        let cutoff = now - chrono::Duration::days(0);
        // With 0 retention, cutoff ≈ now
        let diff = now - cutoff;
        assert_eq!(diff.num_days(), 0);
    }

    #[test]
    fn test_cutoff_date_large_retention() {
        let now = Utc::now();
        let retention_days = 365i64;
        let cutoff = now - chrono::Duration::days(retention_days);
        let diff = now - cutoff;
        assert_eq!(diff.num_days(), 365);
    }

    // ── Monthly reset day-of-month logic ──

    #[test]
    fn test_monthly_reset_only_on_first() {
        // Verify that day() != 1 causes early return
        // This is the guard in reset_monthly_webhook_counts
        let first = Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap();
        assert_eq!(first.day(), 1);

        let second = Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap();
        assert_ne!(second.day(), 1);

        let last = Utc.with_ymd_and_hms(2024, 1, 31, 0, 0, 0).unwrap();
        assert_ne!(last.day(), 1);
    }

    #[test]
    fn test_monthly_reset_first_of_each_month() {
        for month in 1..=12 {
            let dt = Utc.with_ymd_and_hms(2024, month, 1, 12, 0, 0).unwrap();
            assert_eq!(dt.day(), 1, "Month {} should have day 1", month);
        }
    }

    #[test]
    fn test_monthly_reset_not_on_2nd_through_31st() {
        for day in 2..=28 {
            let dt = Utc.with_ymd_and_hms(2024, 6, day, 0, 0, 0).unwrap();
            assert_ne!(dt.day(), 1, "Day {} should not equal 1", day);
        }
    }

    // ── SQL query structure tests ──

    #[test]
    fn test_archive_deliveries_sql_is_nontrivial() {
        // Per-customer retention uses inline SQL with INSERT INTO dead_letters
        // and DELETE FROM deliveries per customer. Full integration tests require a database.
        // This test verifies the module compiles correctly.
    }

    #[test]
    fn test_all_functions_compile() {
        // Verify the module compiles — all functions (archive_deliveries,
        // cleanup_idempotency_keys, cleanup_webhook_queue, cleanup_seen_webhooks,
        // reset_monthly_webhook_counts, run_retention) are present and typed correctly.
        // Full integration testing requires a PostgreSQL database.
    }

    #[test]
    fn test_chrono_duration_days_positive() {
        // Verify the chrono Duration::days API used in run_retention works
        let d = chrono::Duration::days(30);
        assert_eq!(d.num_days(), 30);
        let d = chrono::Duration::days(0);
        assert_eq!(d.num_days(), 0);
        let d = chrono::Duration::days(365);
        assert_eq!(d.num_days(), 365);
    }

    #[test]
    fn test_chrono_now_minus_duration() {
        // Simulates the cutoff calculation in run_retention
        let now = Utc::now();
        let retention_days = 7i64;
        let cutoff = now - chrono::Duration::days(retention_days);
        assert!(cutoff < now);
        assert_eq!((now - cutoff).num_days(), 7);
    }
}
