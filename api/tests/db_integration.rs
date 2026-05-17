//! Integration tests for database module.
//! Run with: cargo test -p hooksniff-api db_tests -- --ignored
//! Requires: DATABASE_URL env var

use hooksniff_api::db::{self, clean_database_url};
use sqlx::PgPool;

async fn test_pool() -> PgPool {
    let database_url =
        std::env::var("DATABASE_URL").expect("DATABASE_URL must be set for integration tests");
    db::create_pool(&database_url)
        .await
        .expect("create_pool should succeed")
}

#[tokio::test]
#[ignore]
async fn integration_create_pool_and_migrate() {
    let pool = test_pool().await;

    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM _migrations")
        .fetch_one(&pool)
        .await
        .expect("should query _migrations");
    assert!(count.0 >= 46, "Expected at least 46 applied migrations, got {}", count.0);

    let tables = vec![
        "customers", "endpoints", "deliveries", "delivery_attempts",
        "dead_letters", "idempotency_keys", "webhook_queue", "api_keys",
        "alert_rules", "teams", "team_members", "notifications",
        "invoices", "payment_transactions", "password_reset_tokens",
        "email_verification_tokens", "refresh_tokens", "device_tokens",
    ];
    for table in tables {
        let exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)",
        )
        .bind(table)
        .fetch_one(&pool)
        .await
        .unwrap_or((false,));
        assert!(exists.0, "Table '{}' should exist", table);
    }
    pool.close().await;
}

#[tokio::test]
#[ignore]
async fn integration_publish_to_queue() {
    let pool = test_pool().await;

    let customer_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING id",
    )
    .bind("db-test@example.com")
    .bind("test-hash")
    .bind("test")
    .bind("test-pass")
    .fetch_one(&pool)
    .await
    .expect("insert customer");

    let endpoint_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO endpoints (customer_id, url, signing_secret)
         VALUES ($1, $2, $3) RETURNING id",
    )
    .bind(customer_id.0)
    .bind("https://example.com/webhook")
    .bind("whsec_test")
    .fetch_one(&pool)
    .await
    .expect("insert endpoint");

    let delivery_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING id",
    )
    .bind(endpoint_id.0)
    .bind(customer_id.0)
    .bind(serde_json::json!({"test": true}))
    .bind("test.event")
    .bind("pending")
    .fetch_one(&pool)
    .await
    .expect("insert delivery");

    db::publish_to_queue(
        &pool,
        delivery_id.0,
        endpoint_id.0,
        "https://example.com/webhook",
        r#"{"test":true}"#,
        Some(&serde_json::json!({"X-Custom": "value"})),
    )
    .await
    .expect("publish_to_queue should succeed");

    let queue_entry: (uuid::Uuid,) =
        sqlx::query_as("SELECT id FROM webhook_queue WHERE delivery_id = $1")
            .bind(delivery_id.0)
            .fetch_one(&pool)
            .await
            .expect("queue entry should exist");
    assert_eq!(queue_entry.0, delivery_id.0);

    // Cleanup
    sqlx::query("DELETE FROM webhook_queue WHERE delivery_id = $1").bind(delivery_id.0).execute(&pool).await.ok();
    sqlx::query("DELETE FROM deliveries WHERE id = $1").bind(delivery_id.0).execute(&pool).await.ok();
    sqlx::query("DELETE FROM endpoints WHERE id = $1").bind(endpoint_id.0).execute(&pool).await.ok();
    sqlx::query("DELETE FROM customers WHERE id = $1").bind(customer_id.0).execute(&pool).await.ok();
    pool.close().await;
}

#[tokio::test]
#[ignore]
async fn integration_migration_idempotency() {
    let pool = test_pool().await;
    let result = db::create_pool(&std::env::var("DATABASE_URL").unwrap()).await;
    assert!(result.is_ok(), "Running migrations twice should not fail (idempotent)");

    let dupes: (i64,) = sqlx::query_as("SELECT COUNT(*) - COUNT(DISTINCT name) FROM _migrations")
        .fetch_one(&pool)
        .await
        .expect("should count duplicates");
    assert_eq!(dupes.0, 0, "No duplicate migration names allowed");
    pool.close().await;
}

#[tokio::test]
#[ignore]
async fn integration_customer_crud() {
    let pool = test_pool().await;
    let test_email = format!("db-crud-test-{}@example.com", uuid::Uuid::new_v4());

    let customer_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash, plan)
         VALUES ($1, $2, $3, $4, $5) RETURNING id",
    )
    .bind(&test_email)
    .bind("crud-hash")
    .bind("crud")
    .bind("crud-pass")
    .bind("developer")
    .fetch_one(&pool)
    .await
    .expect("insert customer");

    let customer: (String, String) = sqlx::query_as("SELECT email, plan FROM customers WHERE id = $1")
        .bind(customer_id.0)
        .fetch_one(&pool)
        .await
        .expect("fetch customer");
    assert_eq!(customer.0, test_email);
    assert_eq!(customer.1, "developer");

    sqlx::query("UPDATE customers SET plan = $1 WHERE id = $2")
        .bind("pro").bind(customer_id.0).execute(&pool).await.expect("update customer");

    let updated: (String,) = sqlx::query_as("SELECT plan FROM customers WHERE id = $1")
        .bind(customer_id.0).fetch_one(&pool).await.expect("fetch updated");
    assert_eq!(updated.0, "pro");

    let deleted = sqlx::query("DELETE FROM customers WHERE id = $1")
        .bind(customer_id.0).execute(&pool).await.expect("delete customer");
    assert_eq!(deleted.rows_affected(), 1);
    pool.close().await;
}

#[tokio::test]
#[ignore]
async fn integration_endpoint_with_customer() {
    let pool = test_pool().await;
    let test_email = format!("endpoint-test-{}@example.com", uuid::Uuid::new_v4());

    let customer_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING id",
    )
    .bind(&test_email).bind("ep-hash").bind("ep").bind("ep-pass")
    .fetch_one(&pool).await.expect("insert customer");

    let endpoint_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO endpoints (customer_id, url, signing_secret, description, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING id",
    )
    .bind(customer_id.0).bind("https://example.com/hook").bind("whsec_test_endpoint")
    .bind("Test endpoint").bind(true)
    .fetch_one(&pool).await.expect("insert endpoint");

    sqlx::query("DELETE FROM customers WHERE id = $1")
        .bind(customer_id.0).execute(&pool).await.expect("delete customer");

    let endpoint_exists: (bool,) = sqlx::query_as("SELECT EXISTS(SELECT 1 FROM endpoints WHERE id = $1)")
        .bind(endpoint_id.0).fetch_one(&pool).await.unwrap_or((false,));
    assert!(!endpoint_exists.0, "Endpoint should be cascade-deleted with customer");
    pool.close().await;
}

#[tokio::test]
#[ignore]
async fn integration_constraints_check_status() {
    let pool = test_pool().await;
    let test_email = format!("constraint-test-{}@example.com", uuid::Uuid::new_v4());

    let customer_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING id",
    )
    .bind(&test_email).bind("c-hash").bind("c").bind("c-pass")
    .fetch_one(&pool).await.expect("insert customer");

    let endpoint_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO endpoints (customer_id, url, signing_secret)
         VALUES ($1, $2, $3) RETURNING id",
    )
    .bind(customer_id.0).bind("https://example.com/constraint").bind("whsec_constraint")
    .fetch_one(&pool).await.expect("insert endpoint");

    let bad_insert = sqlx::query(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, status)
         VALUES ($1, $2, $3, 'invalid_status')",
    )
    .bind(endpoint_id.0).bind(customer_id.0).bind(serde_json::json!({}))
    .execute(&pool).await;
    assert!(bad_insert.is_err(), "Invalid delivery status should be rejected by CHECK constraint");

    for status in &["pending", "processing", "delivered", "failed"] {
        let result = sqlx::query(
            "INSERT INTO deliveries (endpoint_id, customer_id, payload, status)
             VALUES ($1, $2, $3, $4)",
        )
        .bind(endpoint_id.0).bind(customer_id.0).bind(serde_json::json!({})).bind(status)
        .execute(&pool).await;
        assert!(result.is_ok(), "Status '{}' should be accepted", status);
    }

    sqlx::query("DELETE FROM deliveries WHERE endpoint_id = $1").bind(endpoint_id.0).execute(&pool).await.ok();
    sqlx::query("DELETE FROM endpoints WHERE id = $1").bind(endpoint_id.0).execute(&pool).await.ok();
    sqlx::query("DELETE FROM customers WHERE id = $1").bind(customer_id.0).execute(&pool).await.ok();
    pool.close().await;
}

#[tokio::test]
#[ignore]
async fn integration_updated_at_trigger() {
    let pool = test_pool().await;
    let test_email = format!("trigger-test-{}@example.com", uuid::Uuid::new_v4());

    let customer_id: (uuid::Uuid,) = sqlx::query_as(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING id",
    )
    .bind(&test_email).bind("trig-hash").bind("trig").bind("trig-pass")
    .fetch_one(&pool).await.expect("insert customer");

    let initial: (chrono::DateTime<chrono::Utc>,) =
        sqlx::query_as("SELECT updated_at FROM customers WHERE id = $1")
            .bind(customer_id.0).fetch_one(&pool).await.expect("fetch initial");

    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    sqlx::query("UPDATE customers SET name = $1 WHERE id = $2")
        .bind("Updated Name").bind(customer_id.0).execute(&pool).await.expect("update customer");

    let after: (chrono::DateTime<chrono::Utc>,) =
        sqlx::query_as("SELECT updated_at FROM customers WHERE id = $1")
            .bind(customer_id.0).fetch_one(&pool).await.expect("fetch after");

    assert!(after.0 > initial.0, "updated_at should be updated by trigger");

    sqlx::query("DELETE FROM customers WHERE id = $1").bind(customer_id.0).execute(&pool).await.ok();
    pool.close().await;
}
