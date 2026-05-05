use anyhow::Result;
use reqwest::Client;

use crate::config::WorkerConfig;
use crate::signing;
use crate::WebhookMessage;

pub async fn process_delivery(
    http_client: &Client,
    cfg: &WorkerConfig,
    webhook: &WebhookMessage,
    pool: &sqlx::PgPool,
) -> Result<()> {
    // Get current attempt count
    let delivery: (i32,) = sqlx::query_as(
        "SELECT attempt_count FROM deliveries WHERE id = $1"
    )
    .bind(&webhook.delivery_id)
    .fetch_one(&pool)
    .await?;

    let attempt = delivery.0 + 1;

    // Generate HMAC signature
    let signature = signing::compute_hmac(&webhook.signing_secret, &webhook.payload);

    // Send HTTP request
    let result = http_client
        .post(&webhook.endpoint_url)
        .header("Content-Type", "application/json")
        .header("X-Hookrelay-Signature", format!("sha256={}", signature))
        .header("X-Hookrelay-Delivery-Id", &webhook.delivery_id)
        .header("X-Hookrelay-Attempt", attempt.to_string())
        .body(webhook.payload.clone())
        .send()
        .await;

    match result {
        Ok(response) if response.status().is_success() => {
            tracing::info!("✅ Delivery {} succeeded (attempt {})", webhook.delivery_id, attempt);
            update_delivery_status(&pool, &webhook.delivery_id, "delivered", attempt, response.status().as_u16() as i32, None).await?;
        }
        Ok(response) => {
            let status = response.status().as_u16() as i32;
            let body = response.text().await.unwrap_or_default();
            tracing::warn!(
                "⚠️ Delivery {} got status {} (attempt {})",
                webhook.delivery_id, status, attempt
            );

            if attempt >= cfg.max_attempts {
                tracing::error!("❌ Delivery {} failed after {} attempts", webhook.delivery_id, attempt);
                update_delivery_status(&pool, &webhook.delivery_id, "failed", attempt, status, Some(&body)).await?;
                move_to_dead_letter(&pool, webhook, &format!("HTTP {}", status), attempt).await?;
            } else {
                update_delivery_status(&pool, &webhook.delivery_id, "pending", attempt, status, Some(&body)).await?;
                schedule_retry(&pool, &webhook.delivery_id, attempt, cfg).await?;
            }
        }
        Err(e) => {
            tracing::error!("❌ Delivery {} network error: {:?} (attempt {})", webhook.delivery_id, e, attempt);

            if attempt >= cfg.max_attempts {
                update_delivery_status(&pool, &webhook.delivery_id, "failed", attempt, 0, Some(&e.to_string())).await?;
                move_to_dead_letter(&pool, webhook, &e.to_string(), attempt).await?;
            } else {
                update_delivery_status(&pool, &webhook.delivery_id, "pending", attempt, 0, Some(&e.to_string())).await?;
                schedule_retry(&pool, &webhook.delivery_id, attempt, cfg).await?;
            }
        }
    }

    Ok(())
}

async fn update_delivery_status(
    pool: &sqlx::PgPool,
    delivery_id: &str,
    status: &str,
    attempt: i32,
    response_status: i32,
    response_body: Option<&str>,
) -> Result<()> {
    sqlx::query(
        "UPDATE deliveries SET status = $1, attempt_count = $2, response_status = $3, response_body = $4, last_attempt_at = now() WHERE id = $5"
    )
    .bind(status)
    .bind(attempt)
    .bind(response_status)
    .bind(response_body)
    .bind(delivery_id)
    .execute(pool)
    .await?;
    Ok(())
}

async fn schedule_retry(
    pool: &sqlx::PgPool,
    delivery_id: &str,
    attempt: i32,
    cfg: &WorkerConfig,
) -> Result<()> {
    let delay_idx = (attempt - 1).min(cfg.retry_delays_secs.len() as i32 - 1) as usize;
    let delay = cfg.retry_delays_secs[delay_idx];

    let next_retry = chrono::Utc::now() + chrono::Duration::seconds(delay as i64);

    sqlx::query(
        "UPDATE deliveries SET next_retry_at = $1 WHERE id = $2"
    )
    .bind(next_retry)
    .bind(delivery_id)
    .execute(pool)
    .await?;

    tracing::info!("⏰ Delivery {} scheduled for retry in {}s", delivery_id, delay);

    // Sleep then re-process (simplified; in production use Temporal)
    tokio::time::sleep(std::time::Duration::from_secs(delay)).await;

    // Re-queue to Kafka (simplified approach without Temporal)
    // In production, this would be a Temporal workflow timer
    Ok(())
}

async fn move_to_dead_letter(
    pool: &sqlx::PgPool,
    webhook: &WebhookMessage,
    reason: &str,
    attempts: i32,
) -> Result<()> {
    sqlx::query(
        "INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts) SELECT id, endpoint_id, customer_id, payload, $2, $3 FROM deliveries WHERE id = $1"
    )
    .bind(&webhook.delivery_id)
    .bind(reason)
    .bind(attempts)
    .execute(pool)
    .await?;

    tracing::info!("🪦 Delivery {} moved to dead letter queue", webhook.delivery_id);
    Ok(())
}
