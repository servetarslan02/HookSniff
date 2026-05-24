//! Queue recovery functions for the HookSniff Worker.
//!
//! Handles zombie record recovery and orphaned delivery re-queuing.

use anyhow::Result;
use sqlx::PgPool;

use crate::helpers::is_transient_db_error;
use crate::operational_webhook;

/// Recover webhook_queue records stuck in "processing" for more than 5 minutes.
///
/// When the worker crashes mid-delivery, records stay in "processing" forever.
/// This reaper checks max_attempts:
///   - If attempt_count >= max_attempts → dead letter (don't retry forever)
///   - If attempt_count < max_attempts → reset to pending for retry
///
/// Item 267: Wrapped in a transaction for atomicity.
pub async fn reap_zombies(pool: &PgPool) -> Result<usize> {
    // Find stuck records with their max_attempts
    let stuck: Vec<(uuid::Uuid, uuid::Uuid, uuid::Uuid, i32, i32)> = sqlx::query_as(
        r#"
        SELECT id, delivery_id, endpoint_id, attempt_count, max_attempts
        FROM webhook_queue
        WHERE status = 'processing'
          AND updated_at < now() - interval '5 minutes'
        "#,
    )
    .fetch_all(pool)
    .await?;

    if stuck.is_empty() {
        return Ok(0);
    }

    // Item 267: Wrap all zombie reaper operations in a single transaction
    let mut tx = pool.begin().await?;
    let mut dead_lettered: Vec<(uuid::Uuid, uuid::Uuid, i32)> = Vec::new(); // (delivery_id, endpoint_id, attempt)

    for (id, delivery_id, endpoint_id, attempt, max_attempts) in &stuck {
        if *attempt >= *max_attempts {
            // Max attempts exceeded → dead letter
            tracing::error!(
                "🧟 Zombie exceeded max attempts: queue_id={} delivery_id={} attempts={}/{} → dead_letter",
                id, delivery_id, attempt, max_attempts
            );

            sqlx::query::<sqlx::Postgres>(
                r#"
                UPDATE webhook_queue
                SET status = 'dead_letter', attempt_count = attempt_count + 1
                WHERE id = $1
                "#,
            )
            .bind(id)
            .execute(&mut *tx)
            .await?;

            // Insert into dead_letters table
            sqlx::query::<sqlx::Postgres>(
                r#"
                INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts)
                SELECT id, endpoint_id, customer_id, payload, $2, $3
                FROM deliveries WHERE id = $1
                "#,
            )
            .bind(delivery_id)
            .bind("zombie reaper: max attempts exceeded")
            .bind(attempt + 1)
            .execute(&mut *tx)
            .await?;

            // Update delivery status to failed
            sqlx::query::<sqlx::Postgres>(
                "UPDATE deliveries SET status = 'failed', error_message = $2 WHERE id = $1",
            )
            .bind(delivery_id)
            .bind("zombie reaper: max attempts exceeded")
            .execute(&mut *tx)
            .await?;

            dead_lettered.push((*delivery_id, *endpoint_id, *attempt));
        } else {
            // Reset to pending for retry
            sqlx::query::<sqlx::Postgres>(
                r#"
                UPDATE webhook_queue
                SET status = 'pending'
                WHERE id = $1
                "#,
            )
            .bind(id)
            .execute(&mut *tx)
            .await?;

            tracing::warn!(
                "🧟 Recovered zombie: queue_id={} delivery_id={} next_attempt={}",
                id,
                delivery_id,
                attempt + 1
            );
        }
    }

    // Item 34: Add context for transient DB failures in zombie reaper
    tx.commit().await.map_err(|e| {
        if is_transient_db_error(&e) {
            tracing::warn!("⚠️ Zombie reaper: transient DB commit failure: {:?}", e);
        }
        anyhow::anyhow!("Zombie reaper commit failed: {}", e)
    })?;

    // Dispatch operational webhooks for dead-lettered zombies
    for (delivery_id, endpoint_id, attempt) in dead_lettered {
        let pool_clone = pool.clone();
        tokio::spawn(async move {
            // Look up customer_id for this delivery
            if let Ok(Some(customer_id)) = sqlx::query_scalar::<_, uuid::Uuid>(
                "SELECT customer_id FROM deliveries WHERE id = $1",
            )
            .bind(delivery_id)
            .fetch_optional(&pool_clone)
            .await
            {
                let http_client = reqwest::Client::new();
                let op_payload = serde_json::json!({
                    "delivery_id": delivery_id.to_string(),
                    "endpoint_id": endpoint_id.to_string(),
                    "error": "zombie reaper: max attempts exceeded",
                    "attempt": attempt,
                });
                operational_webhook::dispatch_event(
                    &pool_clone,
                    &http_client,
                    customer_id,
                    operational_webhook::OpWebhookEvent::DeliveryFailed,
                    op_payload,
                )
                .await;
            }
        });
    }

    Ok(stuck.len())
}

/// Also recover deliveries stuck in 'pending' with no active queue entry.
/// These are orphaned records from crashed workers.
///
/// Item 268: Uses a single JOIN query instead of N+1 per-delivery queries.
pub async fn reap_orphaned_deliveries(pool: &PgPool) -> Result<usize> {
    // Single query: find orphaned deliveries with their endpoint URLs
    let orphaned: Vec<(uuid::Uuid, uuid::Uuid, uuid::Uuid, serde_json::Value, Option<serde_json::Value>, String)> =
        sqlx::query_as(
            r#"
            SELECT d.id, d.endpoint_id, d.customer_id, d.payload, d.custom_headers, e.url
            FROM deliveries d
            JOIN endpoints e ON e.id = d.endpoint_id
            WHERE d.status = 'pending'
              AND d.created_at < now() - interval '10 minutes'
              AND NOT EXISTS (
                  SELECT 1 FROM webhook_queue wq
                  WHERE wq.delivery_id = d.id
                    AND wq.status IN ('pending', 'processing')
              )
            LIMIT 100
            "#,
        )
        .fetch_all(pool)
        .await?;

    if orphaned.is_empty() {
        return Ok(0);
    }

    let count = orphaned.len();

    for (id, endpoint_id, _customer_id, payload, custom_headers, url) in &orphaned {
        sqlx::query::<sqlx::Postgres>(
            r#"INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, status, attempt_count)
               VALUES ($1, $2, $3, $4, $5, 'pending', 0)
               ON CONFLICT (delivery_id) DO NOTHING"#,
        )
        .bind(id)
        .bind(endpoint_id)
        .bind(url)
        .bind(payload)
        .bind(custom_headers)
        .execute(pool)
        .await?;

        tracing::warn!(
            "🧟 Re-queued orphaned delivery: {} (endpoint={})",
            id,
            endpoint_id
        );
    }

    Ok(count)
}
