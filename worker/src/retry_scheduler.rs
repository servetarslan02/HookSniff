use anyhow::Result;
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde_json::json;
use std::time::Duration;

use crate::config::WorkerConfig;

/// Background task that polls the database every 30 seconds for deliveries
/// with `next_retry_at <= now()` and `status = 'pending'`, then re-publishes
/// them to Kafka for the worker to process.
pub async fn run_retry_scheduler(
    pool: sqlx::PgPool,
    producer: FutureProducer,
    cfg: WorkerConfig,
) {
    tracing::info!("⏰ Retry scheduler started — polling every 30s");

    loop {
        tokio::time::sleep(Duration::from_secs(30)).await;

        match poll_and_requeue(&pool, &producer, &cfg).await {
            Ok(count) => {
                if count > 0 {
                    tracing::info!("🔄 Retry scheduler: re-queued {} deliveries", count);
                }
            }
            Err(e) => {
                tracing::error!("❌ Retry scheduler error: {:?}", e);
            }
        }
    }
}

/// Find deliveries that are ready for retry and re-publish them to Kafka.
async fn poll_and_requeue(
    pool: &sqlx::PgPool,
    producer: &FutureProducer,
    cfg: &WorkerConfig,
) -> Result<usize> {
    // Find deliveries with next_retry_at <= now() and status = 'pending'
    let pending: Vec<(String, String, String, String, String, Option<serde_json::Value>, Option<String>, Option<String>)> = sqlx::query_as(
        r#"
        SELECT
            d.id,
            d.endpoint_id,
            e.url,
            e.signing_secret,
            d.payload::STRING,
            e.custom_headers,
            e.old_signing_secret,
            e.secret_rotated_at::STRING
        FROM deliveries d
        JOIN endpoints e ON d.endpoint_id = e.id
        WHERE d.status = 'pending'
          AND d.next_retry_at IS NOT NULL
          AND d.next_retry_at <= now()
        ORDER BY d.next_retry_at ASC
        LIMIT 50
        "#,
    )
    .fetch_all(pool)
    .await?;

    let count = pending.len();

    for (delivery_id, endpoint_id, url, signing_secret, payload, custom_headers, old_signing_secret, secret_rotated_at) in pending {
        let webhook_msg = json!({
            "delivery_id": delivery_id,
            "endpoint_id": endpoint_id,
            "endpoint_url": url,
            "signing_secret": signing_secret,
            "old_signing_secret": old_signing_secret,
            "secret_rotated_at": secret_rotated_at,
            "custom_headers": custom_headers,
            "payload": payload,
        });

        let msg_str = serde_json::to_string(&webhook_msg)?;

        match producer
            .send(
                FutureRecord::to(&cfg.kafka_topic)
                    .key(&delivery_id)
                    .payload(&msg_str),
                Duration::from_secs(5),
            )
            .await
        {
            Ok(_) => {
                tracing::debug!("📤 Re-queued delivery {} for retry", delivery_id);
            }
            Err((e, _)) => {
                tracing::error!(
                    "❌ Failed to re-queue delivery {}: {}",
                    delivery_id,
                    e
                );
            }
        }
    }

    Ok(count)
}
