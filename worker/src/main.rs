//! HookRelay Worker — Webhook Teslimatı
//!
//! Kafka ve Temporal yok. Sadece PostgreSQL polling.
//!
//! ## Nasıl Çalışır
//!
//! 1. Her saniye `webhook_queue` tablosunu kontrol et
//! 2. Pending olanları al
//! 3. HTTP POST ile endpoint'e gönder
//! 4. Başarılı → delivered, başarısız → retry veya dead letter
//!
//! ## Basit, güvenilir, bakımı kolay.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tracing_subscriber::EnvFilter;

mod config;
pub mod delivery;
mod signing;

/// Webhook queue'dan gelen mesaj formatı
#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct WebhookQueueItem {
    pub id: uuid::Uuid,
    pub delivery_id: uuid::Uuid,
    pub endpoint_id: uuid::Uuid,
    pub endpoint_url: String,
    pub signing_secret: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub next_retry_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse()?))
        .init();

    let cfg = config::WorkerConfig::from_env()?;

    tracing::info!("🔧 HookRelay Worker starting...");
    tracing::info!("   Database: {}", &cfg.database_url[..30.min(cfg.database_url.len())]);

    // Database pool
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&cfg.database_url)
        .await?;

    // HTTP client (shared, connection pooling)
    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .pool_max_idle_per_host(10)
        .build()?;

    tracing::info!("⚙️ Worker ready — polling webhook_queue every 1s");

    // Main loop: poll PostgreSQL queue
    loop {
        match process_pending(&pool, &http_client, &cfg).await {
            Ok(processed) => {
                if processed > 0 {
                    tracing::debug!("✅ Processed {} deliveries", processed);
                }
            }
            Err(e) => {
                tracing::error!("❌ Queue processing error: {:?}", e);
            }
        }

        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
    }
}

/// Process all pending items in the queue
async fn process_pending(
    pool: &PgPool,
    http_client: &reqwest::Client,
    cfg: &config::WorkerConfig,
) -> Result<usize> {
    // Fetch pending items (with FOR UPDATE SKIP LOCKED for concurrency)
    let items: Vec<WebhookQueueItem> = sqlx::query_as::<_, WebhookQueueItem>(
        r#"
        UPDATE webhook_queue
        SET status = 'processing'
        WHERE id IN (
            SELECT id FROM webhook_queue
            WHERE status = 'pending'
              AND (next_retry_at IS NULL OR next_retry_at <= now())
            ORDER BY created_at
            LIMIT 50
            FOR UPDATE SKIP LOCKED
        )
        RETURNING *
        "#,
    )
    .fetch_all(pool)
    .await?;

    let count = items.len();

    for item in items {
        let delivery_id = item.delivery_id;
        let attempt = item.attempt_count + 1;

        tracing::info!("📤 Delivery {} (attempt {}/{})", delivery_id, attempt, item.max_attempts);

        // Generate HMAC signature
        let signature = signing::compute_hmac(&item.signing_secret, &item.payload);

        // Build request
        let mut req_builder = http_client
            .post(&item.endpoint_url)
            .header("Content-Type", "application/json")
            .header("X-Hookrelay-Signature", format!("sha256={}", signature))
            .header("X-Hookrelay-Delivery-Id", delivery_id.to_string())
            .header("X-Hookrelay-Attempt", attempt.to_string())
            .body(item.payload.clone());

        // Add custom headers
        if let Some(ref headers) = item.custom_headers {
            if let Some(obj) = headers.as_object() {
                for (key, value) in obj {
                    if let Some(val) = value.as_str() {
                        req_builder = req_builder.header(key.as_str(), val);
                    }
                }
            }
        }

        // Send webhook
        let start = std::time::Instant::now();
        let result = req_builder.send().await;
        let duration_ms = start.elapsed().as_millis() as i32;

        match result {
            Ok(response) => {
                let status_code = response.status().as_u16() as i32;
                let body = response.text().await.unwrap_or_default();
                let response_body = truncate(&body, 1000);
                let success = (200..300).contains(&status_code);

                if success {
                    // ✅ Başarılı
                    tracing::info!("✅ Delivery {} → HTTP {} ({}ms)", delivery_id, status_code, duration_ms);

                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        UPDATE webhook_queue
                        SET status = 'delivered', processed_at = now(), attempt_count = $1
                        WHERE id = $2
                        "#,
                    )
                    .bind(attempt)
                    .bind(item.id)
                    .execute(pool)
                    .await?;

                    // Update deliveries table
                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        UPDATE deliveries
                        SET status = 'delivered', attempt_count = $1, response_status = $2,
                            response_body = $3, last_attempt_at = now()
                        WHERE id = $4
                        "#,
                    )
                    .bind(attempt)
                    .bind(status_code)
                    .bind(&response_body)
                    .bind(delivery_id)
                    .execute(pool)
                    .await?;

                    // Record attempt
                    record_attempt(pool, delivery_id, attempt, Some(status_code), Some(&response_body), duration_ms, None).await?;

                } else if attempt >= item.max_attempts {
                    // ❌ Max deneme aşıldı → dead letter
                    tracing::error!("❌ Delivery {} → HTTP {} — max attempts, moving to dead letter", delivery_id, status_code);

                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        UPDATE webhook_queue
                        SET status = 'dead_letter', processed_at = now(), attempt_count = $1
                        WHERE id = $2
                        "#,
                    )
                    .bind(attempt)
                    .bind(item.id)
                    .execute(pool)
                    .await?;

                    // Move to dead_letters
                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts)
                        SELECT id, endpoint_id, customer_id, payload, $2, $3
                        FROM deliveries WHERE id = $1
                        "#,
                    )
                    .bind(delivery_id)
                    .bind(format!("HTTP {}", status_code))
                    .bind(attempt)
                    .execute(pool)
                    .await?;

                    // Update delivery status
                    sqlx::query::<sqlx::Postgres>("UPDATE deliveries SET status = 'failed' WHERE id = $1")
                        .bind(delivery_id)
                        .execute(pool)
                        .await?;

                    record_attempt(pool, delivery_id, attempt, Some(status_code), Some(&response_body), duration_ms, Some(&format!("HTTP {}", status_code))).await?;

                } else {
                    // 🔄 Retry — exponential backoff
                    let delay = calculate_backoff(attempt);
                    let next_retry = chrono::Utc::now() + chrono::Duration::seconds(delay);

                    tracing::warn!("⚠️ Delivery {} → HTTP {} — retrying in {}s (attempt {}/{})", delivery_id, status_code, delay, attempt, item.max_attempts);

                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        UPDATE webhook_queue
                        SET status = 'pending', attempt_count = $1, next_retry_at = $2
                        WHERE id = $3
                        "#,
                    )
                    .bind(attempt)
                    .bind(next_retry)
                    .bind(item.id)
                    .execute(pool)
                    .await?;

                    record_attempt(pool, delivery_id, attempt, Some(status_code), Some(&response_body), duration_ms, Some(&format!("HTTP {} — retry scheduled", status_code))).await?;
                }
            }
            Err(e) => {
                // 🌐 Network hatası
                let error_msg = e.to_string();
                tracing::error!("❌ Delivery {} network error: {} (attempt {})", delivery_id, error_msg, attempt);

                if attempt >= item.max_attempts {
                    // Dead letter
                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        UPDATE webhook_queue
                        SET status = 'dead_letter', processed_at = now(), attempt_count = $1
                        WHERE id = $2
                        "#,
                    )
                    .bind(attempt)
                    .bind(item.id)
                    .execute(pool)
                    .await?;

                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts)
                        SELECT id, endpoint_id, customer_id, payload, $2, $3
                        FROM deliveries WHERE id = $1
                        "#,
                    )
                    .bind(delivery_id)
                    .bind(&error_msg)
                    .bind(attempt)
                    .execute(pool)
                    .await?;

                    sqlx::query::<sqlx::Postgres>("UPDATE deliveries SET status = 'failed' WHERE id = $1")
                        .bind(delivery_id)
                        .execute(pool)
                        .await?;

                    record_attempt(pool, delivery_id, attempt, None, None, duration_ms, Some(&error_msg)).await?;

                } else {
                    // Retry
                    let delay = calculate_backoff(attempt);
                    let next_retry = chrono::Utc::now() + chrono::Duration::seconds(delay);

                    sqlx::query::<sqlx::Postgres>(
                        r#"
                        UPDATE webhook_queue
                        SET status = 'pending', attempt_count = $1, next_retry_at = $2
                        WHERE id = $3
                        "#,
                    )
                    .bind(attempt)
                    .bind(next_retry)
                    .bind(item.id)
                    .execute(pool)
                    .await?;

                    record_attempt(pool, delivery_id, attempt, None, None, duration_ms, Some(&error_msg)).await?;
                }
            }
        }
    }

    Ok(count)
}

/// Record a delivery attempt
async fn record_attempt(
    pool: &PgPool,
    delivery_id: uuid::Uuid,
    attempt_number: i32,
    status_code: Option<i32>,
    response_body: Option<&str>,
    duration_ms: i32,
    error_message: Option<&str>,
) -> Result<()> {
    sqlx::query::<sqlx::Postgres>(
        r#"
        INSERT INTO delivery_attempts (delivery_id, attempt_number, status_code, response_body, duration_ms, error_message)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
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

/// Exponential backoff: 30s, 60s, 120s, 300s, 600s, 1800s
fn calculate_backoff(attempt: i32) -> i64 {
    let base = 30_i64;
    let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
    delay.min(1800) // Max 30 dakika
}

/// Truncate string to max length
fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}
