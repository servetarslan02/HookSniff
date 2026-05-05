use anyhow::Result;
use reqwest::Client;

use crate::config::WorkerConfig;
use crate::signing;
use crate::WebhookMessage;

pub async fn process_delivery(
    http_client: &Client,
    _cfg: &WorkerConfig,
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

    // Get retry policy from endpoint
    let endpoint_info: (Option<serde_json::Value>,) = sqlx::query_as(
        "SELECT retry_policy FROM endpoints WHERE id = $1"
    )
    .bind(&webhook.endpoint_id)
    .fetch_one(&pool)
    .await?;

    let retry_policy = endpoint_info.0.as_ref().and_then(|v| {
        serde_json::from_value::<RetryPolicy>(v.clone()).ok()
    }).unwrap_or_default();

    // Generate HMAC signature
    let signature = signing::compute_hmac(&webhook.signing_secret, &webhook.payload);

    // Record start time
    let start = std::time::Instant::now();

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

    let duration_ms = start.elapsed().as_millis() as i32;

    match result {
        Ok(response) if response.status().is_success() => {
            let status_code = response.status().as_u16() as i32;
            let body = response.text().await.unwrap_or_default();
            let truncated_body = truncate_str(&body, 1000);

            tracing::info!("✅ Delivery {} succeeded (attempt {})", webhook.delivery_id, attempt);
            update_delivery_status(&pool, &webhook.delivery_id, "delivered", attempt, status_code, None).await?;

            // Record delivery attempt
            record_attempt(pool, &webhook.delivery_id, attempt, Some(status_code), Some(&truncated_body), Some(duration_ms), None).await?;
        }
        Ok(response) => {
            let status = response.status().as_u16() as i32;
            let body = response.text().await.unwrap_or_default();
            let truncated_body = truncate_str(&body, 1000);
            tracing::warn!(
                "⚠️ Delivery {} got status {} (attempt {})",
                webhook.delivery_id, status, attempt
            );

            // Record delivery attempt
            record_attempt(pool, &webhook.delivery_id, attempt, Some(status), Some(&truncated_body), Some(duration_ms), None).await?;

            if attempt >= retry_policy.max_attempts {
                tracing::error!("❌ Delivery {} failed after {} attempts", webhook.delivery_id, attempt);
                update_delivery_status(&pool, &webhook.delivery_id, "failed", attempt, status, Some(&truncated_body)).await?;
                move_to_dead_letter(&pool, webhook, &format!("HTTP {}", status), attempt).await?;
            } else {
                update_delivery_status(&pool, &webhook.delivery_id, "pending", attempt, status, Some(&truncated_body)).await?;
                schedule_retry(&pool, &webhook.delivery_id, attempt, &retry_policy).await?;
            }
        }
        Err(e) => {
            tracing::error!("❌ Delivery {} network error: {:?} (attempt {})", webhook.delivery_id, e, attempt);

            // Record delivery attempt with error
            record_attempt(pool, &webhook.delivery_id, attempt, None, None, Some(duration_ms), Some(&e.to_string())).await?;

            if attempt >= retry_policy.max_attempts {
                update_delivery_status(&pool, &webhook.delivery_id, "failed", attempt, 0, Some(&e.to_string())).await?;
                move_to_dead_letter(&pool, webhook, &e.to_string(), attempt).await?;
            } else {
                update_delivery_status(&pool, &webhook.delivery_id, "pending", attempt, 0, Some(&e.to_string())).await?;
                schedule_retry(&pool, &webhook.delivery_id, attempt, &retry_policy).await?;
            }
        }
    }

    Ok(())
}

#[derive(serde::Deserialize)]
struct RetryPolicy {
    max_attempts: i32,
    backoff: String,
    initial_delay_secs: i32,
    max_delay_secs: i32,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        }
    }
}

impl RetryPolicy {
    fn delay_for_attempt(&self, attempt: i32) -> i64 {
        let base = self.initial_delay_secs as i64;
        match self.backoff.as_str() {
            "exponential" => {
                let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
                delay.min(self.max_delay_secs as i64)
            }
            "linear" => {
                let delay = base * attempt as i64;
                delay.min(self.max_delay_secs as i64)
            }
            _ => base,
        }
    }
}

fn truncate_str(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}

async fn record_attempt(
    pool: &sqlx::PgPool,
    delivery_id: &str,
    attempt_number: i32,
    status_code: Option<i32>,
    response_body: Option<&str>,
    duration_ms: Option<i32>,
    error_message: Option<&str>,
) -> Result<()> {
    sqlx::query(
        "INSERT INTO delivery_attempts (delivery_id, attempt_number, status_code, response_body, duration_ms, error_message) VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(delivery_id)
    .bind(attempt_number)
    .bind(status_code)
    .bind(response_body)
    .bind(duration_ms)
    .bind(error_message)
    .execute(pool)
    .await?;
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
    retry_policy: &RetryPolicy,
) -> Result<()> {
    let delay = retry_policy.delay_for_attempt(attempt);
    let next_retry = chrono::Utc::now() + chrono::Duration::seconds(delay);

    sqlx::query(
        "UPDATE deliveries SET next_retry_at = $1 WHERE id = $2"
    )
    .bind(next_retry)
    .bind(delivery_id)
    .execute(pool)
    .await?;

    tracing::info!("⏰ Delivery {} scheduled for retry in {}s", delivery_id, delay);

    // Sleep then re-process (simplified; in production use Temporal)
    tokio::time::sleep(std::time::Duration::from_secs(delay as u64)).await;

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
