//! Retention cleanup for the HookSniff Worker.
//!
//! Deletes delivery data older than plan's retention days.
//! Runs every 6 hours.

use anyhow::Result;
use sqlx::PgPool;

/// Retention cleanup — delete delivery data older than plan's retention days.
/// Reads retention config from platform_settings, falls back to defaults.
/// Returns (total_deliveries_deleted, total_other_records_deleted).
pub async fn cleanup_expired_retention(pool: &PgPool) -> Result<(i64, i64)> {
    // Fetch retention days from platform_settings
    let settings: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(pool)
            .await?;

    let (ret_free, ret_startup, ret_pro, ret_enterprise) = if let Some((value,)) = settings {
        let obj = value.as_object();
        (
            obj.and_then(|o| o.get("retention_days_free"))
                .and_then(|v| v.as_i64())
                .unwrap_or(7),
            obj.and_then(|o| o.get("retention_days_startup"))
                .and_then(|v| v.as_i64())
                .unwrap_or(14),
            obj.and_then(|o| o.get("retention_days_pro"))
                .and_then(|v| v.as_i64())
                .unwrap_or(30),
            obj.and_then(|o| o.get("retention_days_enterprise"))
                .and_then(|v| v.as_i64())
                .unwrap_or(90),
        )
    } else {
        (7, 14, 180, 365)
    };

    // Delete deliveries per plan tier
    let plan_configs = [
        ("developer", ret_free),
        ("startup", ret_startup),
        ("pro", ret_pro),
        ("enterprise", ret_enterprise),
    ];

    let mut total_deliveries = 0i64;
    let mut total_attempts = 0i64;

    for (plan, days) in &plan_configs {
        let cutoff = chrono::Utc::now() - chrono::Duration::days(*days);

        // Delete old delivery_attempts first (FK dependency)
        let attempts_result = sqlx::query(
            "DELETE FROM delivery_attempts WHERE delivery_id IN (\
               SELECT d.id FROM deliveries d \
               JOIN customers c ON c.id = d.customer_id \
               WHERE c.plan = $1 AND d.created_at < $2\
             )",
        )
        .bind(plan)
        .bind(cutoff)
        .execute(pool)
        .await?;

        // Delete old deliveries
        let deliveries_result = sqlx::query(
            "DELETE FROM deliveries WHERE id IN (\
               SELECT d.id FROM deliveries d \
               JOIN customers c ON c.id = d.customer_id \
               WHERE c.plan = $1 AND d.created_at < $2\
             )",
        )
        .bind(plan)
        .bind(cutoff)
        .execute(pool)
        .await?;

        let del_count = deliveries_result.rows_affected();
        let att_count = attempts_result.rows_affected();

        if del_count > 0 || att_count > 0 {
            tracing::info!(
                "🧹 Retention cleanup [{}]: deleted {} deliveries, {} attempts ({} days)",
                plan,
                del_count,
                att_count,
                days
            );
        }

        total_deliveries += del_count as i64;
        total_attempts += att_count as i64;
    }

    // Also clean dead_letters older than 90 days (regardless of plan)
    let dead_cutoff = chrono::Utc::now() - chrono::Duration::days(90);
    let dead_result = sqlx::query("DELETE FROM dead_letters WHERE created_at < $1")
        .bind(dead_cutoff)
        .execute(pool)
        .await?;
    let dead_count = dead_result.rows_affected();
    if dead_count > 0 {
        tracing::info!("🧹 Retention cleanup: deleted {} old dead_letters", dead_count);
    }

    // Clean audit_log older than 365 days
    let audit_cutoff = chrono::Utc::now() - chrono::Duration::days(365);
    let audit_result = sqlx::query("DELETE FROM audit_log WHERE created_at < $1")
        .bind(audit_cutoff)
        .execute(pool)
        .await?;
    let audit_count = audit_result.rows_affected();
    if audit_count > 0 {
        tracing::info!(
            "🧹 Retention cleanup: deleted {} old audit_log entries",
            audit_count
        );
    }

    Ok((
        total_deliveries,
        total_attempts + dead_count as i64 + audit_count as i64,
    ))
}
