//! HookRelay Worker — Webhook Teslimatı
//!
//! Kafka ve Temporal yok. PostgreSQL polling + LISTEN/NOTIFY.
//!
//! ## Nasıl Çalışır
//!
//! 1. `webhook_queue` tablosunu dinle (PostgreSQL LISTEN/NOTIFY)
//! 2. NOTIFY geldiğinde veya 1s fallback poll'da pending olanları al
//! 3. HTTP POST ile endpoint'e gönder
//! 4. Başarılı → delivered, başarısız → retry veya dead letter
//!
//! NOTIFY anlık tetikleme sağlar (< 10ms gecikme).
//! 1s poll fallback, NOTIFY kaçırılsa bile güvenilirliği garanti eder.
//!
//! ## Basit, güvenilir, bakımı kolay.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::postgres::{PgListener, PgPoolOptions};
use sqlx::PgPool;

mod config;
pub mod delivery;
mod signing;
pub mod telemetry;

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
    pub trace_id: Option<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing (OpenTelemetry + structured logging)
    let cfg = config::WorkerConfig::from_env()?;
    telemetry::init(
        cfg.otel_enabled,
        cfg.otel_exporter_otlp_endpoint.as_deref(),
        cfg.otel_exporter_otlp_headers.as_deref(),
    );

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

    tracing::info!("⚙️ Worker ready — polling webhook_queue every 1s (with LISTEN/NOTIFY)");

    // Graceful shutdown: listen for SIGTERM/SIGINT
    let shutdown = shutdown_signal();

    tokio::pin!(shutdown);

    // Create a dedicated PgListener connection for NOTIFY
    let mut listener = PgListener::connect(&cfg.database_url).await?;
    listener.listen("new_webhook").await?;
    tracing::info!("🔔 Listening on 'new_webhook' channel for instant wake-up");

    // Zombie reaper: recover stuck "processing" records every 30s
    let mut reaper_interval = tokio::time::interval(std::time::Duration::from_secs(30));
    reaper_interval.tick().await; // first tick completes immediately, skip it

    // Main loop: poll PostgreSQL queue with NOTIFY-based wake-up
    //
    // Flow: poll → if items found → process & loop immediately
    //                if empty     → LISTEN with 1s timeout → notification or timeout → poll
    // 1s poll fallback ensures reliability even if NOTIFY is missed
    loop {
        tokio::select! {
            _ = &mut shutdown => {
                tracing::info!("🛑 Shutdown signal received, waiting for in-flight deliveries...");
                break;
            }
            result = listener.recv() => {
                // NOTIFY received — wake up immediately
                match result {
                    Ok(notification) => {
                        tracing::debug!("🔔 NOTIFY received on '{}' — processing now", notification.channel());
                    }
                    Err(e) => {
                        tracing::warn!("⚠️ PgListener error, reconnecting: {:?}", e);
                        // Reconnect listener on error
                        match PgListener::connect(&cfg.database_url).await {
                            Ok(mut new_listener) => {
                                if new_listener.listen("new_webhook").await.is_ok() {
                                    listener = new_listener;
                                    tracing::info!("🔔 PgListener reconnected");
                                } else {
                                    tracing::error!("❌ Failed to re-listen on 'new_webhook'");
                                    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                                }
                            }
                            Err(conn_err) => {
                                tracing::error!("❌ Failed to reconnect PgListener: {:?}", conn_err);
                                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                            }
                        }
                    }
                }
                // Process immediately on NOTIFY (or after reconnect attempt)
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
            _ = tokio::time::sleep(std::time::Duration::from_secs(1)) => {
                // Fallback 1s poll — catches anything NOTIFY might have missed
                match process_pending(&pool, &http_client, &cfg).await {
                    Ok(processed) => {
                        if processed > 0 {
                            tracing::debug!("✅ Processed {} deliveries (poll fallback)", processed);
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ Queue processing error: {:?}", e);
                    }
                }
            }
            _ = reaper_interval.tick() => {
                match reap_zombies(&pool).await {
                    Ok(reaped) => {
                        if reaped > 0 {
                            tracing::warn!("🧟 Zombie reaper recovered {} stuck records", reaped);
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ Zombie reaper error: {:?}", e);
                    }
                }
            }
        }
    }

    tracing::info!("👋 HookRelay Worker shut down gracefully");

    // Flush OpenTelemetry traces before exit
    opentelemetry::global::shutdown_tracer_provider();

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
    let items: Vec<WebhookQueueItem> = {
        let _poll_guard = tracing::info_span!("queue-poll", batch_size = 50).entered();
        sqlx::query_as::<_, WebhookQueueItem>(
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
    .await?
    };

    let count = items.len();

    for item in items {
        let delivery_id = item.delivery_id;
        let attempt = item.attempt_count + 1;

        // Each delivery is processed inside a structured span (OTel-aware)
        let span = tracing::info_span!(
            "delivery-attempt",
            delivery_id = %delivery_id,
            endpoint_id = %item.endpoint_id,
            attempt = attempt,
            endpoint_url = %item.endpoint_url
        );
        let _guard = span.enter();

        // Capture the trace_id for this span so we can store it in the DB
        let trace_id = telemetry::current_trace_id();

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
            .header("X-HookSniff-Signature", format!("sha256={}", legacy_sig))
            .header("X-HookSniff-Delivery-Id", delivery_id.to_string())
            .header("X-HookSniff-Attempt", attempt.to_string())
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
                let _resp_span = tracing::info_span!("response-processing", status = tracing::field::Empty, duration_ms = duration_ms).entered();
                let status_code = response.status().as_u16() as i32;
                let resp_headers: serde_json::Value = serde_json::json!(
                    response.headers()
                        .iter()
                        .map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap_or("").to_string()))
                        .collect::<std::collections::HashMap<String, String>>()
                );
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
                    record_attempt(pool, delivery_id, attempt, Some(status_code), Some(&response_body), duration_ms, None, trace_id.as_deref(), Some(&resp_headers)).await?;

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
                    sqlx::query::<sqlx::Postgres>("UPDATE deliveries SET status = 'failed', error_message = $2 WHERE id = $1")
                        .bind(delivery_id)
                        .bind(format!("HTTP {}", status_code))
                        .execute(pool)
                        .await?;

                    record_attempt(pool, delivery_id, attempt, Some(status_code), Some(&response_body), duration_ms, Some(&format!("HTTP {}", status_code)), trace_id.as_deref(), Some(&resp_headers)).await?;

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

                    record_attempt(pool, delivery_id, attempt, Some(status_code), Some(&response_body), duration_ms, Some(&format!("HTTP {} — retry scheduled", status_code)), trace_id.as_deref(), Some(&resp_headers)).await?;
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

                    sqlx::query::<sqlx::Postgres>("UPDATE deliveries SET status = 'failed', error_message = $2 WHERE id = $1")
                        .bind(delivery_id)
                        .bind(&error_msg)
                        .execute(pool)
                        .await?;

                    record_attempt(pool, delivery_id, attempt, None, None, duration_ms, Some(&error_msg), trace_id.as_deref(), None).await?;

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

                    record_attempt(pool, delivery_id, attempt, None, None, duration_ms, Some(&error_msg), trace_id.as_deref(), None).await?;
                }
            }
        }
    }

    Ok(count)
}

/// Recover webhook_queue records stuck in "processing" for more than 5 minutes.
///
/// When the worker crashes mid-delivery, records stay in "processing" forever.
/// This reaper resets them to "pending" so another worker can pick them up.
async fn reap_zombies(pool: &PgPool) -> Result<usize> {
    // Find stuck records first so we can log each one
    let stuck: Vec<(uuid::Uuid, uuid::Uuid, i32)> = sqlx::query_as(
        r#"
        SELECT id, delivery_id, attempt_count
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

    // Reset them back to pending with incremented attempt count
    for (id, delivery_id, attempt) in &stuck {
        sqlx::query::<sqlx::Postgres>(
            r#"
            UPDATE webhook_queue
            SET status = 'pending',
                attempt_count = attempt_count + 1
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        tracing::warn!(
            "🧟 Recovered zombie: queue_id={} delivery_id={} next_attempt={}",
            id, delivery_id, attempt + 1
        );
    }

    Ok(stuck.len())
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
    trace_id: Option<&str>,
    response_headers: Option<&serde_json::Value>,
) -> Result<()> {
    sqlx::query::<sqlx::Postgres>(
        r#"
        INSERT INTO delivery_attempts (delivery_id, attempt_number, status_code, response_body, duration_ms, error_message, trace_id, response_headers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(delivery_id)
    .bind(attempt_number)
    .bind(status_code)
    .bind(response_body)
    .bind(duration_ms)
    .bind(error_message)
    .bind(trace_id)
    .bind(response_headers)
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
