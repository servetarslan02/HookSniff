use anyhow::Result;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

/// Strip `channel_binding=require` from a PostgreSQL connection URL.
/// sqlx 0.8 doesn't support channel_binding (Neon compatibility).
pub fn clean_database_url(database_url: &str) -> String {
    database_url
        .replace("?channel_binding=require&", "?")
        .replace("&channel_binding=require", "")
        .replace("?channel_binding=require", "")
}

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let clean_url = clean_database_url(database_url);
    let pool = PgPoolOptions::new()
        .max_connections(20)                              // Neon free tier: 100 max, 20 bizim için yeterli
        .min_connections(2)                               // Sıcak bağlantılar hazır beklesin
        .acquire_timeout(std::time::Duration::from_secs(5))  // 5sn'de bağlantı alamazsa hata döndür
        .idle_timeout(std::time::Duration::from_secs(300))   // 5dk kullanılmayan bağlantıyı kapat
        .max_lifetime(std::time::Duration::from_secs(1800))  // 30dk'da bir bağlantıları yenile (memory leak önleme)
        .connect(&clean_url)
        .await?;
    run_migrations(&pool).await?;
    tracing::info!(
        "✅ Database pool created (min=2, max=20, idle_timeout=5m, max_lifetime=30m)"
    );
    Ok(pool)
}

/// Create a small dedicated pool for health checks (5 connections).
pub async fn create_health_pool(database_url: &str) -> Result<PgPool> {
    let clean_url = clean_database_url(database_url);
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(std::time::Duration::from_secs(3))
        .connect(&clean_url)
        .await?;
    Ok(pool)
}

#[derive(Clone)]
pub struct HealthPool(pub PgPool);

// ════════════════════════════════════════════════════════
// Migration helpers
// ════════════════════════════════════════════════════════

async fn ensure_migrations_table(pool: &PgPool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS _migrations (
            name TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )",
    )
    .execute(pool)
    .await?;
    Ok(())
}

async fn is_migration_applied(pool: &PgPool, name: &str) -> Result<bool> {
    let row: Option<(String,)> = sqlx::query_as("SELECT name FROM _migrations WHERE name = $1")
        .bind(name)
        .fetch_optional(pool)
        .await?;
    Ok(row.is_some())
}

async fn record_migration(pool: &PgPool, name: &str) -> Result<()> {
    sqlx::query("INSERT INTO _migrations (name) VALUES ($1)")
        .bind(name)
        .execute(pool)
        .await?;
    Ok(())
}

async fn run_migration(pool: &PgPool, name: &str, sql: &str) -> Result<()> {
    if is_migration_applied(pool, name).await? {
        tracing::debug!("⏭️  Migration '{}' already applied, skipping", name);
        return Ok(());
    }
    tracing::info!("🔄 Running migration: {}", name);
    sqlx::raw_sql(sql).execute(pool).await?;
    record_migration(pool, name).await?;
    tracing::info!("✅ Migration '{}' completed", name);
    Ok(())
}

/// All migrations in order: (name, SQL content loaded at compile time via include_str!)
fn migrations() -> Vec<(&'static str, &'static str)> {
    vec![
        ("001_initial_schema", include_str!("../sql/migrations/001_initial_schema.sql")),
        ("002_add_password_hash", include_str!("../sql/migrations/002_add_password_hash.sql")),
        ("003_add_endpoint_security_columns", include_str!("../sql/migrations/003_add_endpoint_security_columns.sql")),
        ("004_add_secret_rotation", include_str!("../sql/migrations/004_add_secret_rotation.sql")),
        ("005_add_retry_policy", include_str!("../sql/migrations/005_add_retry_policy.sql")),
        ("006_routing", include_str!("../sql/migrations/006_routing.sql")),
        ("007_fifo_ordering", include_str!("../sql/migrations/007_fifo_ordering.sql")),
        ("008_endpoint_throttling", include_str!("../sql/migrations/008_endpoint_throttling.sql")),
        ("009_webhook_queue", include_str!("../sql/migrations/009_webhook_queue.sql")),
        ("010_add_endpoint_format", include_str!("../sql/migrations/010_add_endpoint_format.sql")),
        ("011_seen_webhooks", include_str!("../sql/migrations/011_seen_webhooks.sql")),
        ("012_retry_policies", include_str!("../sql/migrations/012_retry_policies.sql")),
        ("013_transform_rules", include_str!("../sql/migrations/013_transform_rules.sql")),
        ("014_event_schemas", include_str!("../sql/migrations/014_event_schemas.sql")),
        ("015_api_keys", include_str!("../sql/migrations/015_api_keys.sql")),
        ("016_alert_rules", include_str!("../sql/migrations/016_alert_rules.sql")),
        ("017_ai_center", include_str!("../sql/migrations/017_ai_center.sql")),
        ("018_ai_agents", include_str!("../sql/migrations/018_ai_agents.sql")),
        ("019_marketplace", include_str!("../sql/migrations/019_marketplace.sql")),
        ("020_fifo_queue", include_str!("../sql/migrations/020_fifo_queue.sql")),
        ("021_delivery_targets", include_str!("../sql/migrations/021_delivery_targets.sql")),
        ("022_stripe_columns", include_str!("../sql/migrations/022_stripe_columns.sql")),
        ("023_updated_at_webhook_queue", include_str!("../sql/migrations/023_updated_at_webhook_queue.sql")),
        ("024_listen_notify", include_str!("../sql/migrations/024_listen_notify.sql")),
        ("025_trace_id", include_str!("../sql/migrations/025_trace_id.sql")),
        ("026_response_headers", include_str!("../sql/migrations/026_response_headers.sql")),
        ("027_deliveries_updated_at_error", include_str!("../sql/migrations/027_deliveries_updated_at_error.sql")),
        ("028_invoices", include_str!("../sql/migrations/028_invoices.sql")),
        ("029_payment_transactions", include_str!("../sql/migrations/029_payment_transactions.sql")),
        ("030_customer_payment_columns", include_str!("../sql/migrations/030_customer_payment_columns.sql")),
        ("031_remove_signing_secret_from_queue", include_str!("../sql/migrations/031_remove_signing_secret_from_queue.sql")),
        ("032_teams", include_str!("../sql/migrations/032_teams.sql")),
        ("033_notifications", include_str!("../sql/migrations/033_notifications.sql")),
        ("034_idempotency_body_hash", include_str!("../sql/migrations/034_idempotency_body_hash.sql")),
        ("035_customer_missing_columns", include_str!("../sql/migrations/035_customer_missing_columns.sql")),
        ("036_inbound_configs", include_str!("../sql/migrations/036_inbound_configs.sql")),
        ("037_notification_preferences", include_str!("../sql/migrations/037_notification_preferences.sql")),
        ("038_email_verified_totp", include_str!("../sql/migrations/038_email_verified_totp.sql")),
        ("039_password_reset_tokens", include_str!("../sql/migrations/039_password_reset_tokens.sql")),
        ("040_email_verification_tokens", include_str!("../sql/migrations/040_email_verification_tokens.sql")),
        ("041_refresh_tokens", include_str!("../sql/migrations/041_refresh_tokens.sql")),
        ("042_device_tokens", include_str!("../sql/migrations/042_device_tokens.sql")),
        ("043_test_mode", include_str!("../sql/migrations/043_test_mode.sql")),
        ("044_constraints_indexes", include_str!("../sql/migrations/044_constraints_indexes.sql")),
        ("045_indexes_triggers_constraints", include_str!("../sql/migrations/045_indexes_triggers_constraints.sql")),
        ("046_payment_failed_at", include_str!("../sql/migrations/046_payment_failed_at.sql")),
        ("047_missing_performance_indexes", include_str!("../sql/migrations/047_missing_performance_indexes.sql")),
        ("048_cancel_at_period_end", include_str!("../sql/migrations/048_cancel_at_period_end.sql")),
        ("049_overage_columns", include_str!("../sql/migrations/049_overage_columns.sql")),
        ("050_webhook_count_bigint", include_str!("../sql/migrations/050_webhook_count_bigint.sql")),
        ("051_service_tokens", include_str!("../sql/migrations/051_service_tokens.sql")),
        ("052_endpoints_team_id", include_str!("../sql/migrations/052_endpoints_team_id.sql")),
        ("053_customer_consents", include_str!("../sql/migrations/053_customer_consents.sql")),
        ("054_weekly_digest", include_str!("../sql/migrations/054_weekly_digest.sql")),
    ]
}

async fn run_migrations(pool: &PgPool) -> Result<()> {
    ensure_migrations_table(pool).await?;
    for (name, sql) in migrations() {
        run_migration(pool, name, sql).await?;
    }
    tracing::info!("✅ All database migrations completed");
    Ok(())
}

// ════════════════════════════════════════════════════════
// Queue helpers
// ════════════════════════════════════════════════════════

/// Publish a webhook delivery to the PostgreSQL-based queue.
pub async fn publish_to_queue(
    pool: &PgPool,
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    payload: &str,
    custom_headers: Option<&serde_json::Value>,
) -> Result<()> {
    let trace_id = crate::telemetry::current_trace_id();
    sqlx::query(
        r#"
        INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, trace_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(delivery_id)
    .bind(endpoint_id)
    .bind(endpoint_url)
    .bind(payload)
    .bind(custom_headers)
    .bind(trace_id)
    .execute(pool)
    .await?;
    tracing::debug!("📤 Webhook {} queued for delivery", delivery_id);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_database_url_no_channel_binding() {
        let url = "postgres://user:pass@ep-host.neon.tech/db?sslmode=require";
        assert_eq!(clean_database_url(url), url);
    }

    #[test]
    fn test_clean_database_url_channel_binding_at_end() {
        let url = "postgres://user:pass@ep-host.neon.tech/db?sslmode=require&channel_binding=require";
        let cleaned = clean_database_url(url);
        assert_eq!(cleaned, "postgres://user:pass@ep-host.neon.tech/db?sslmode=require");
        assert!(!cleaned.contains("channel_binding"));
    }

    #[test]
    fn test_clean_database_url_channel_binding_in_middle() {
        let url = "postgres://user:pass@ep-host.neon.tech/db?channel_binding=require&sslmode=require";
        let cleaned = clean_database_url(url);
        assert_eq!(cleaned, "postgres://user:pass@ep-host.neon.tech/db?sslmode=require");
        assert!(!cleaned.contains("channel_binding"));
    }

    #[test]
    fn test_clean_database_url_channel_binding_only_param() {
        let url = "postgres://user:pass@ep-host.neon.tech/db?channel_binding=require";
        let cleaned = clean_database_url(url);
        assert_eq!(cleaned, "postgres://user:pass@ep-host.neon.tech/db");
    }

    #[test]
    fn test_clean_database_url_channel_binding_no_query() {
        let url = "postgres://user:pass@ep-host.neon.tech/db";
        assert_eq!(clean_database_url(url), url);
    }

    #[test]
    fn test_clean_database_url_preserves_other_params() {
        let url = "postgres://user:pass@host/db?sslmode=require&connect_timeout=10&channel_binding=require";
        let cleaned = clean_database_url(url);
        assert!(cleaned.contains("sslmode=require"));
        assert!(cleaned.contains("connect_timeout=10"));
        assert!(!cleaned.contains("channel_binding"));
    }

    #[test]
    fn test_clean_database_url_empty_string() {
        assert_eq!(clean_database_url(""), "");
    }

    #[test]
    fn test_clean_database_url_multiple_channel_binding() {
        let url = "postgres://host/db?channel_binding=require&foo=bar&channel_binding=require";
        let cleaned = clean_database_url(url);
        assert!(!cleaned.contains("channel_binding"));
        assert!(cleaned.contains("foo=bar"));
    }

    #[test]
    fn test_migration_count() {
        let migs = migrations();
        assert_eq!(migs.len(), 54, "Expected exactly 54 migrations");
        for (i, (name, _)) in migs.iter().enumerate() {
            let expected_prefix = format!("{:03}_", i + 1);
            assert!(
                name.starts_with(&expected_prefix),
                "Migration {} should start with {}",
                name,
                expected_prefix
            );
        }
    }

    #[test]
    fn test_migration_names_unique() {
        let migs = migrations();
        let names: Vec<&str> = migs.iter().map(|(n, _)| *n).collect();
        let mut sorted = names.clone();
        sorted.dedup();
        assert_eq!(sorted.len(), names.len(), "Migration names must be unique");
    }
}
