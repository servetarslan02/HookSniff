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
use tracing_subscriber::prelude::*;
use tracing_subscriber::EnvFilter;

mod config;
pub mod delivery;
mod signing;

/// Webhook message format used by delivery modules.
/// Bridges the queue item format with the delivery router.
#[derive(Debug, Clone)]
pub struct WebhookMessage {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub endpoint_url: String,
    pub signing_secret: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
}

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
    // Structured logging: auto JSON in production, text in development
    let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());
    let use_json = env == "production" || env == "prod"
        || std::env::var("LOG_FORMAT").map(|v| v == "json").unwrap_or(false);

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    if use_json {
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().json())
            .init();
        tracing::info!("Logging format: JSON (env={})", env);
    } else {
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer())
            .init();
        tracing::info!("Logging format: text (env={})", env);
    }

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

    // Graceful shutdown: listen for SIGTERM/SIGINT
    let shutdown = shutdown_signal();

    tokio::pin!(shutdown);

    // Main loop: poll PostgreSQL queue with graceful shutdown support
    loop {
        tokio::select! {
            _ = &mut shutdown => {
                tracing::info!("🛑 Shutdown signal received, waiting for in-flight deliveries...");
                break;
            }
            _ = tokio::time::sleep(std::time::Duration::from_secs(1)) => {
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
            }
        }
    }

    tracing::info!("👋 HookRelay Worker shut down gracefully");
    Ok(())
}

/// Wait for SIGTERM or SIGINT signal for graceful shutdown
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received SIGINT (Ctrl+C), starting graceful shutdown...");
        }
        _ = terminate => {
            tracing::info!("Received SIGTERM, starting graceful shutdown...");
        }
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

        // Each delivery is processed inside a structured span
        let span = tracing::info_span!(
            "delivery",
            delivery_id = %delivery_id,
            endpoint_id = %item.endpoint_id,
            attempt = attempt
        );
        let _guard = span.enter();

        tracing::info!("📤 Delivery {} (attempt {}/{})", delivery_id, attempt, item.max_attempts);

        // Generate Standard Webhooks signature
        let timestamp = chrono::Utc::now().timestamp().to_string();
        let standard_sig = signing::compute_standard_signature(
            &item.signing_secret,
            &delivery_id.to_string(),
            &timestamp,
            &item.payload,
        );

        // Legacy hex signature for backward compat
        let legacy_sig = signing::compute_hmac(&item.signing_secret, &item.payload);

        // Build request with Standard Webhooks + legacy headers
        let mut req_builder = http_client
            .post(&item.endpoint_url)
            .header("Content-Type", "application/json")
            // Standard Webhooks headers
            .header("webhook-id", delivery_id.to_string())
            .header("webhook-timestamp", &timestamp)
            .header("webhook-signature", &standard_sig)
            // Legacy headers (backward compat)
            .header("X-Hookrelay-Signature", format!("sha256={}", legacy_sig))
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

/// Truncate string to max length (UTF-8 safe — rounds down to char boundary)
fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        // Find the nearest char boundary at or before max_len
        let mut end = max_len;
        while end > 0 && !s.is_char_boundary(end) {
            end -= 1;
        }
        format!("{}...", &s[..end])
    }
}
