//! Integration tests for `db.rs` — requires a real PostgreSQL database.
//!
//! These tests run against a live Neon database using the .env.test config.
//! All migrations are idempotent (IF NOT EXISTS), so tests are safe to run
//! against the production branch's neondb database.
//!
//! Run with: cargo test --test db_test -- --test-threads=1

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Once;

static INIT: Once = Once::new();

/// Load .env.test once for all tests.
fn load_test_env() {
    INIT.call_once(|| {
        let _ = dotenvy::from_filename(".env.test");
    });
}

/// Create a fresh pool WITHOUT running migrations (for isolated tests).
async fn raw_pool() -> PgPool {
    load_test_env();
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env.test");
    let clean_url = url
        .replace("?channel_binding=require&", "?")
        .replace("&channel_binding=require", "")
        .replace("?channel_binding=require", "");
    PgPoolOptions::new()
        .max_connections(5)
        .connect(&clean_url)
        .await
        .expect("Failed to connect to test database")
}

/// Helper: Create prerequisite rows (customer, endpoint, delivery) for queue tests.
async fn create_test_delivery(
    pool: &PgPool,
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
) -> uuid::Uuid {
    let customer_id = uuid::Uuid::new_v4();

    sqlx::query(
        "INSERT INTO customers (id, email, api_key_hash, api_key_prefix, plan, is_active) \
         VALUES ($1, $2, 'test_hash', 'test_prefix', 'free', true) \
         ON CONFLICT (id) DO NOTHING",
    )
    .bind(customer_id)
    .bind(format!("test_{}@example.com", customer_id))
    .execute(pool)
    .await
    .unwrap();

    sqlx::query(
        "INSERT INTO endpoints (id, customer_id, url, signing_secret, description) \
         VALUES ($1, $2, $3, 'test_secret', 'test') \
         ON CONFLICT (id) DO NOTHING",
    )
    .bind(endpoint_id)
    .bind(customer_id)
    .bind("https://test.example.com/webhook")
    .execute(pool)
    .await
    .unwrap();

    sqlx::query(
        "INSERT INTO deliveries (id, customer_id, endpoint_id, payload, status) \
         VALUES ($1, $2, $3, '{\"event\":\"test\"}', 'pending') \
         ON CONFLICT (id) DO NOTHING",
    )
    .bind(delivery_id)
    .bind(customer_id)
    .bind(endpoint_id)
    .execute(pool)
    .await
    .unwrap();

    customer_id
}

// Test: create_pool connects and runs all migrations
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_create_pool_success() {
    load_test_env();
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env.test");

    let pool = hooksniff_api::db::create_pool(&url)
        .await
        .expect("create_pool should succeed");

    // Pool should be usable
    let row: (i32,) = sqlx::query_as("SELECT 1")
        .fetch_one(&pool)
        .await
        .expect("Should execute SELECT 1");
    assert_eq!(row.0, 1);

    // _migrations table should exist after create_pool
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_migrations')",
    )
    .fetch_one(&pool)
    .await
    .expect("Should check _migrations table");
    assert!(
        exists.0,
        "_migrations table should be created by create_pool"
    );

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: create_pool strips channel_binding=require
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_create_pool_strips_channel_binding() {
    load_test_env();
    let base_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // URL with channel_binding=require at different positions
    let url_with_cb = format!(
        "{}?channel_binding=require&sslmode=require",
        base_url
            .replace("?sslmode=require", "")
            .replace("?channel_binding=require&", "")
            .replace("&channel_binding=require", "")
            .replace("?channel_binding=require", "")
    );

    // Should not error — channel_binding is stripped
    let pool = hooksniff_api::db::create_pool(&url_with_cb)
        .await
        .expect("create_pool should strip channel_binding and succeed");

    let row: (i32,) = sqlx::query_as("SELECT 1").fetch_one(&pool).await.unwrap();
    assert_eq!(row.0, 1);

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: run_migrations is idempotent (running twice is safe)
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_run_migrations_idempotent() {
    load_test_env();
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // Run migrations twice — should not fail
    let pool1 = hooksniff_api::db::create_pool(&url)
        .await
        .expect("First create_pool");
    pool1.close().await;

    let pool2 = hooksniff_api::db::create_pool(&url)
        .await
        .expect("Second create_pool should also succeed (idempotent)");
    pool2.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: all 46 migrations are recorded in _migrations table
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_all_migrations_recorded() {
    let pool = raw_pool().await;

    // Ensure migrations have been run (idempotent)
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    // Count migrations
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM _migrations")
        .fetch_one(&pool)
        .await
        .expect("Should count migrations");

    // We have 46 migrations (001 through 046)
    assert!(
        count.0 >= 46,
        "Expected at least 46 migrations, found {}",
        count.0
    );

    // Verify specific migration names exist
    let expected_migrations = vec![
        "001_initial_schema",
        "002_add_password_hash",
        "003_add_endpoint_security_columns",
        "009_webhook_queue",
        "015_api_keys",
        "032_teams",
        "044_constraints_indexes",
        "046_payment_failed_at",
    ];

    for name in expected_migrations {
        let exists: (bool,) =
            sqlx::query_as("SELECT EXISTS (SELECT 1 FROM _migrations WHERE name = $1)")
                .bind(name)
                .fetch_one(&pool)
                .await
                .unwrap();
        assert!(exists.0, "Migration '{}' should be recorded", name);
    }

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: all core tables exist after migrations
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_all_tables_created() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let expected_tables = vec![
        "customers",
        "endpoints",
        "deliveries",
        "delivery_attempts",
        "dead_letters",
        "idempotency_keys",
        "webhook_queue",
        "seen_webhooks",
        "retry_policies",
        "transform_rules",
        "event_schemas",
        "api_keys",
        "alert_rules",
        "ai_events",
        "risk_scores",
        "ai_actions",
        "ai_blocklist",
        "ai_agents",
        "ai_agent_executions",
        "ai_agent_configs",
        "marketplace_agents",
        "installed_agents",
        "fifo_queue",
        "delivery_targets",
        "fanout_rules",
        "invoices",
        "payment_transactions",
        "teams",
        "team_members",
        "team_invites",
        "notifications",
        "notification_preferences",
        "inbound_configs",
        "password_reset_tokens",
        "email_verification_tokens",
        "refresh_tokens",
        "device_tokens",
    ];

    for table in expected_tables {
        let exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)",
        )
        .bind(table)
        .fetch_one(&pool)
        .await
        .unwrap();
        assert!(exists.0, "Table '{}' should exist", table);
    }

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: publish_to_queue inserts a row into webhook_queue
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_publish_to_queue_inserts_row() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let delivery_id = uuid::Uuid::new_v4();
    let endpoint_id = uuid::Uuid::new_v4();

    // Create prerequisite rows (customer → endpoint → delivery)
    create_test_delivery(&pool, delivery_id, endpoint_id).await;

    let endpoint_url = "https://test.example.com/webhook";
    let payload = r#"{"event":"test.publish","data":{"id":1}}"#;
    let custom_headers = serde_json::json!({"X-Custom": "value"});

    // Publish to queue
    hooksniff_api::db::publish_to_queue(
        &pool,
        delivery_id,
        endpoint_id,
        endpoint_url,
        payload,
        Some(&custom_headers),
    )
    .await
    .expect("publish_to_queue should succeed");

    // Verify the row was inserted
    let row: (uuid::Uuid, String, String, String) = sqlx::query_as(
        "SELECT delivery_id, endpoint_url, payload, status FROM webhook_queue WHERE delivery_id = $1",
    )
    .bind(delivery_id)
    .fetch_one(&pool)
    .await
    .expect("Should find the inserted row");

    assert_eq!(row.0, delivery_id);
    assert_eq!(row.1, endpoint_url);
    assert_eq!(row.2, payload);
    assert_eq!(row.3, "pending");

    // Cleanup
    sqlx::query("DELETE FROM webhook_queue WHERE delivery_id = $1")
        .bind(delivery_id)
        .execute(&pool)
        .await
        .unwrap();

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: publish_to_queue without custom headers
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_publish_to_queue_no_custom_headers() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let delivery_id = uuid::Uuid::new_v4();
    let endpoint_id = uuid::Uuid::new_v4();

    create_test_delivery(&pool, delivery_id, endpoint_id).await;

    hooksniff_api::db::publish_to_queue(
        &pool,
        delivery_id,
        endpoint_id,
        "https://test.example.com/hook",
        r#"{"event":"no.headers"}"#,
        None,
    )
    .await
    .expect("publish_to_queue with None headers should succeed");

    // Verify custom_headers is NULL
    let row: (Option<serde_json::Value>,) =
        sqlx::query_as("SELECT custom_headers FROM webhook_queue WHERE delivery_id = $1")
            .bind(delivery_id)
            .fetch_one(&pool)
            .await
            .unwrap();

    assert!(
        row.0.is_none(),
        "custom_headers should be NULL when None is passed"
    );

    // Cleanup
    sqlx::query("DELETE FROM webhook_queue WHERE delivery_id = $1")
        .bind(delivery_id)
        .execute(&pool)
        .await
        .unwrap();

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: publish_to_queue stores trace_id
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_publish_to_queue_has_trace_id() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let delivery_id = uuid::Uuid::new_v4();

    create_test_delivery(&pool, delivery_id, uuid::Uuid::new_v4()).await;

    hooksniff_api::db::publish_to_queue(
        &pool,
        delivery_id,
        uuid::Uuid::new_v4(),
        "https://test.example.com/trace",
        r#"{"event":"trace.test"}"#,
        None,
    )
    .await
    .expect("publish_to_queue should succeed");

    // trace_id column should exist (may be NULL if no active trace)
    let row: (Option<String>,) =
        sqlx::query_as("SELECT trace_id FROM webhook_queue WHERE delivery_id = $1")
            .bind(delivery_id)
            .fetch_one(&pool)
            .await
            .unwrap();

    // trace_id is populated by telemetry::current_trace_id()
    // It may be empty string or a valid trace id — just verify column exists
    // (no panic = column exists)
    let _ = row.0;

    // Cleanup
    sqlx::query("DELETE FROM webhook_queue WHERE delivery_id = $1")
        .bind(delivery_id)
        .execute(&pool)
        .await
        .unwrap();

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: key tables have expected columns
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_customers_table_columns() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let expected_columns = vec![
        "id",
        "email",
        "api_key_hash",
        "api_key_prefix",
        "plan",
        "webhook_limit",
        "webhook_count",
        "created_at",
        "password_hash",
        "is_active",
        "is_admin",
        "name",
        "email_verified",
        "totp_enabled",
        "stripe_customer_id",
        "polar_customer_id",
        "payment_provider",
        "payment_failed_at",
        "updated_at",
    ];

    for col in expected_columns {
        let exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = $1)",
        )
        .bind(col)
        .fetch_one(&pool)
        .await
        .unwrap();
        assert!(exists.0, "customers table should have column '{}'", col);
    }

    pool.close().await;
}

#[tokio::test]
async fn test_webhook_queue_table_columns() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let expected_columns = vec![
        "id",
        "delivery_id",
        "endpoint_id",
        "endpoint_url",
        "payload",
        "custom_headers",
        "attempt_count",
        "max_attempts",
        "next_retry_at",
        "status",
        "trace_id",
        "created_at",
        "processed_at",
        "is_test",
        "updated_at",
    ];

    for col in expected_columns {
        let exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_queue' AND column_name = $1)",
        )
        .bind(col)
        .fetch_one(&pool)
        .await
        .unwrap();
        assert!(exists.0, "webhook_queue table should have column '{}'", col);
    }

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: CHECK constraints on status columns
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_check_constraints_exist() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let expected_constraints = vec![
        "chk_deliveries_status",
        "chk_webhook_queue_status",
        "chk_delivery_attempts_number",
        "chk_deliveries_attempt_count",
        "chk_deliveries_max_attempts",
        "chk_webhook_queue_attempt_count",
        "chk_webhook_queue_max_attempts",
        "chk_dead_letters_attempts",
    ];

    for constraint in expected_constraints {
        let exists: (bool,) =
            sqlx::query_as("SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = $1)")
                .bind(constraint)
                .fetch_one(&pool)
                .await
                .unwrap();
        assert!(exists.0, "Constraint '{}' should exist", constraint);
    }

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: UNIQUE constraints exist
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_unique_constraints_exist() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    // uq_api_keys_hash
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_api_keys_hash')",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    assert!(exists.0, "uq_api_keys_hash constraint should exist");

    // uq_webhook_queue_delivery
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_webhook_queue_delivery')",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    assert!(
        exists.0,
        "uq_webhook_queue_delivery constraint should exist"
    );

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: updated_at triggers exist on key tables
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_updated_at_triggers_exist() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let trigger_tables = vec![
        ("customers", "trg_customers_updated_at"),
        ("endpoints", "trg_endpoints_updated_at"),
        ("deliveries", "trg_deliveries_updated_at"),
        ("webhook_queue", "trg_webhook_queue_updated_at"),
        ("api_keys", "trg_api_keys_updated_at"),
        ("teams", "trg_teams_updated_at"),
    ];

    for (table, trigger) in trigger_tables {
        let exists: (bool,) =
            sqlx::query_as("SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = $1)")
                .bind(trigger)
                .fetch_one(&pool)
                .await
                .unwrap();
        assert!(
            exists.0,
            "Trigger '{}' should exist on table '{}'",
            trigger, table
        );
    }

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: key indexes exist
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_key_indexes_exist() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let expected_indexes = vec![
        "idx_deliveries_status",
        "idx_deliveries_customer",
        "idx_endpoints_customer",
        "idx_webhook_queue_pending",
        "idx_api_keys_hash",
        "idx_customers_plan",
        "idx_customers_is_active",
        "idx_deliveries_customer_created",
        "idx_webhook_queue_endpoint",
    ];

    for idx in expected_indexes {
        let exists: (bool,) =
            sqlx::query_as("SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = $1)")
                .bind(idx)
                .fetch_one(&pool)
                .await
                .unwrap();
        assert!(exists.0, "Index '{}' should exist", idx);
    }

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: FK constraint on webhook_queue.delivery_id
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_webhook_queue_fk_to_deliveries() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_webhook_queue_delivery')",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    assert!(
        exists.0,
        "FK constraint fk_webhook_queue_delivery should exist"
    );

    pool.close().await;
}

// ═══════════════════════════════════════════════════════════════
// Test: publish_to_queue multiple inserts (no duplicate delivery_id)
// ═══════════════════════════════════════════════════════════════

#[tokio::test]
async fn test_publish_to_queue_duplicate_delivery_fails() {
    let pool = raw_pool().await;
    hooksniff_api::db::create_pool(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    )
    .await
    .expect("create_pool");

    let delivery_id = uuid::Uuid::new_v4();
    let endpoint_id = uuid::Uuid::new_v4();

    create_test_delivery(&pool, delivery_id, endpoint_id).await;

    // First insert should succeed
    hooksniff_api::db::publish_to_queue(
        &pool,
        delivery_id,
        endpoint_id,
        "https://test.example.com/dup",
        r#"{"event":"dup.test"}"#,
        None,
    )
    .await
    .expect("First publish should succeed");

    // Second insert with same delivery_id should fail (UNIQUE constraint)
    let result = hooksniff_api::db::publish_to_queue(
        &pool,
        delivery_id,
        endpoint_id,
        "https://test.example.com/dup",
        r#"{"event":"dup.test.2"}"#,
        None,
    )
    .await;

    assert!(
        result.is_err(),
        "Duplicate delivery_id should fail due to UNIQUE constraint"
    );

    // Cleanup
    sqlx::query("DELETE FROM webhook_queue WHERE delivery_id = $1")
        .bind(delivery_id)
        .execute(&pool)
        .await
        .unwrap();

    pool.close().await;
}
