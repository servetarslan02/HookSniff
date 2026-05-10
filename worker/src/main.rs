//! HookSniff Worker — Webhook Teslimatı
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

/// Start a minimal HTTP health check server for Cloud Run.
/// Cloud Run requires containers to listen on PORT=8080.
async fn start_health_server(port: u16) {
    use axum::{routing::get, Router};

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/", get(|| async { "HookSniff Worker 🐝" }));

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("🏥 Health check server on :{}", port);

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(e) => {
            tracing::error!("❌ Failed to bind health server on port {}: {}", port, e);
            return;
        }
    };

    if let Err(e) = axum::serve(listener, app).await {
        tracing::error!("❌ Health server error: {}", e);
    }
}

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

    tracing::info!("🔧 HookSniff Worker starting...");
    tracing::info!(
        "   Database: {}",
        &cfg.database_url[..30.min(cfg.database_url.len())]
    );

    // Start health check HTTP server for Cloud Run (PORT env or 8080)
    let health_port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);
    tokio::spawn(start_health_server(health_port));

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

    // Concurrent delivery limit — prevents DDoS on target servers
    // Max 10 HTTP deliveries at the same time
    let delivery_semaphore = std::sync::Arc::new(tokio::sync::Semaphore::new(10));

    tracing::info!("⚙️ Worker ready — polling webhook_queue every 1s (with LISTEN/NOTIFY)");
    tracing::info!("🔒 Concurrent delivery limit: 10");

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
                match process_pending(&pool, &http_client, &cfg, delivery_semaphore.clone()).await {
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
                match process_pending(&pool, &http_client, &cfg, delivery_semaphore.clone()).await {
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
                // Also recover orphaned deliveries
                match reap_orphaned_deliveries(&pool).await {
                    Ok(orphaned) => {
                        if orphaned > 0 {
                            tracing::warn!("🧟 Re-queued {} orphaned deliveries", orphaned);
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ Orphaned delivery reaper error: {:?}", e);
                    }
                }
            }
        }
    }

    tracing::info!("👋 HookSniff Worker shut down gracefully");

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
    _cfg: &config::WorkerConfig,
    semaphore: std::sync::Arc<tokio::sync::Semaphore>,
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
        RETURNING id, delivery_id, endpoint_id, endpoint_url, payload, custom_headers,
                  attempt_count, max_attempts, next_retry_at, trace_id
        "#,
        )
        .fetch_all(pool)
        .await?
    };

    let count = items.len();

    // Batch-fetch signing secrets to avoid N+1 queries
    let endpoint_ids: Vec<uuid::Uuid> = items.iter().map(|i| i.endpoint_id).collect();
    let unique_ids: std::collections::HashSet<uuid::Uuid> = endpoint_ids.iter().cloned().collect();
    let unique_vec: Vec<uuid::Uuid> = unique_ids.into_iter().collect();

    let secret_rows: Vec<(uuid::Uuid, String)> =
        sqlx::query_as("SELECT id, signing_secret FROM endpoints WHERE id = ANY($1)")
            .bind(&unique_vec)
            .fetch_all(pool)
            .await?;

    let secret_map: std::collections::HashMap<uuid::Uuid, String> =
        secret_rows.into_iter().collect();

    // Process all pending items concurrently using tokio::spawn
    // Each delivery runs in its own task — one slow endpoint won't block others
    let mut handles = Vec::with_capacity(items.len());

    for item in items {
        let pool = pool.clone();
        let http_client = http_client.clone();
        let secret_map = secret_map.clone();

        let handle = tokio::spawn(async move {
            // Acquire semaphore permit — limits concurrent HTTP deliveries
            let _permit = semaphore.acquire().await.expect("semaphore closed");

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

            tracing::info!(
                "📤 Delivery {} (attempt {}/{})",
                delivery_id,
                attempt,
                item.max_attempts
            );

            // Get signing secret from batch-fetched map
            let signing_secret = match secret_map.get(&item.endpoint_id) {
                Some(s) if !s.is_empty() => s.clone(),
                _ => {
                    tracing::error!(
                        "❌ No signing_secret for endpoint {} — delivery {} will fail verification",
                        item.endpoint_id,
                        delivery_id
                    );
                    // Mark as dead letter since we can't sign the request
                    let mut tx = pool.begin().await?;
                    sqlx::query::<sqlx::Postgres>(
                        "UPDATE webhook_queue SET status = 'dead_letter', processed_at = now() WHERE id = $1"
                    )
                    .bind(item.id)
                    .execute(&mut *tx)
                    .await?;

                    sqlx::query::<sqlx::Postgres>(
                        "UPDATE deliveries SET status = 'failed', error_message = 'Endpoint signing secret missing' WHERE id = $1"
                    )
                    .bind(delivery_id)
                    .execute(&mut *tx)
                    .await?;

                    sqlx::query::<sqlx::Postgres>(
                        r#"INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts)
                           SELECT id, endpoint_id, customer_id, payload, 'Endpoint signing secret missing', $2
                           FROM deliveries WHERE id = $1"#
                    )
                    .bind(delivery_id)
                    .bind(attempt)
                    .execute(&mut *tx)
                    .await?;

                    tx.commit().await?;
                    return Ok::<(), anyhow::Error>(());
                }
            };

            // Build WebhookMessage and delegate HTTP delivery to the delivery module
            let webhook_msg = WebhookMessage {
                delivery_id: delivery_id.to_string(),
                endpoint_id: item.endpoint_id.to_string(),
                endpoint_url: item.endpoint_url.clone(),
                signing_secret,
                payload: item.payload.clone(),
                custom_headers: item.custom_headers.clone(),
            };

            let result = delivery::deliver_http(&http_client, &webhook_msg, attempt).await?;

            let status_code = result.status_code;
            let response_body = &result.response_body;
            let duration_ms = result.duration_ms;
            let resp_headers = &result.response_headers;
            let is_network_error = !result.error.is_empty();

            // Derive error message and optional fields for record_attempt
            let error_msg = if is_network_error {
                result.error.clone()
            } else {
                format!("HTTP {}", status_code)
            };
            let attempt_status = if is_network_error {
                None
            } else {
                Some(status_code)
            };
            let attempt_body = if is_network_error {
                None
            } else {
                Some(response_body.as_str())
            };
            let attempt_headers = if is_network_error {
                None
            } else {
                Some(resp_headers)
            };

            if result.success {
                // ✅ Başarılı
                tracing::info!(
                    "✅ Delivery {} → HTTP {} ({}ms)",
                    delivery_id,
                    status_code,
                    duration_ms
                );

                let mut tx = pool.begin().await?;

                sqlx::query::<sqlx::Postgres>(
                    r#"
                    UPDATE webhook_queue
                    SET status = 'delivered', processed_at = now(), attempt_count = $1
                    WHERE id = $2
                    "#,
                )
                .bind(attempt)
                .bind(item.id)
                .execute(&mut *tx)
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
                .bind(response_body)
                .bind(delivery_id)
                .execute(&mut *tx)
                .await?;

                // Record attempt
                record_attempt(
                    &mut tx,
                    delivery_id,
                    attempt,
                    AttemptRecord {
                        status_code: attempt_status,
                        response_body: attempt_body,
                        duration_ms,
                        error_message: None,
                        trace_id: trace_id.as_deref(),
                        response_headers: attempt_headers,
                    },
                )
                .await?;

                // Reset endpoint failure streak on success
                sqlx::query::<sqlx::Postgres>(
                    "UPDATE endpoints SET failure_streak = 0, avg_response_ms = $2 WHERE id = $1",
                )
                .bind(item.endpoint_id)
                .bind(duration_ms)
                .execute(&mut *tx)
                .await?;

                tx.commit().await?;
            } else if attempt >= item.max_attempts {
                // ❌ Max deneme aşıldı → dead letter
                tracing::error!(
                    "❌ Delivery {} → {} — max attempts, moving to dead letter",
                    delivery_id,
                    error_msg
                );

                let mut tx = pool.begin().await?;

                sqlx::query::<sqlx::Postgres>(
                    r#"
                    UPDATE webhook_queue
                    SET status = 'dead_letter', processed_at = now(), attempt_count = $1
                    WHERE id = $2
                    "#,
                )
                .bind(attempt)
                .bind(item.id)
                .execute(&mut *tx)
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
                .bind(&error_msg)
                .bind(attempt)
                .execute(&mut *tx)
                .await?;

                // Update delivery status
                sqlx::query::<sqlx::Postgres>(
                    "UPDATE deliveries SET status = 'failed', error_message = $2 WHERE id = $1",
                )
                .bind(delivery_id)
                .bind(&error_msg)
                .execute(&mut *tx)
                .await?;

                record_attempt(
                    &mut tx,
                    delivery_id,
                    attempt,
                    AttemptRecord {
                        status_code: attempt_status,
                        response_body: attempt_body,
                        duration_ms,
                        error_message: Some(&error_msg),
                        trace_id: trace_id.as_deref(),
                        response_headers: attempt_headers,
                    },
                )
                .await?;

                // Increment endpoint failure streak on dead letter
                sqlx::query::<sqlx::Postgres>(
                    "UPDATE endpoints SET failure_streak = failure_streak + 1, last_failure_at = now() WHERE id = $1"
                )
                .bind(item.endpoint_id)
                .execute(&mut *tx)
                .await?;

                tx.commit().await?;
            } else {
                // 🔄 Retry — exponential backoff
                let delay = calculate_backoff(attempt);
                let next_retry = chrono::Utc::now() + chrono::Duration::seconds(delay);

                tracing::warn!(
                    "⚠️ Delivery {} → {} — retrying in {}s (attempt {}/{})",
                    delivery_id,
                    error_msg,
                    delay,
                    attempt,
                    item.max_attempts
                );

                let mut tx = pool.begin().await?;

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
                .execute(&mut *tx)
                .await?;

                record_attempt(
                    &mut tx,
                    delivery_id,
                    attempt,
                    AttemptRecord {
                        status_code: attempt_status,
                        response_body: attempt_body,
                        duration_ms,
                        error_message: Some(&format!("{} — retry scheduled", error_msg)),
                        trace_id: trace_id.as_deref(),
                        response_headers: attempt_headers,
                    },
                )
                .await?;

                tx.commit().await?;
            }

            Ok::<(), anyhow::Error>(())
        });

        handles.push(handle);
    }

    // Wait for all concurrent deliveries to complete
    for handle in handles {
        if let Err(e) = handle.await {
            tracing::error!("❌ Delivery task panicked: {:?}", e);
        }
    }

    Ok(count)
}

/// Recover webhook_queue records stuck in "processing" for more than 5 minutes.
///
/// When the worker crashes mid-delivery, records stay in "processing" forever.
/// This reaper checks max_attempts:
///   - If attempt_count >= max_attempts → dead letter (don't retry forever)
///   - If attempt_count < max_attempts → reset to pending for retry
async fn reap_zombies(pool: &PgPool) -> Result<usize> {
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

    for (id, delivery_id, _endpoint_id, attempt, max_attempts) in &stuck {
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
            .execute(pool)
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
            .execute(pool)
            .await?;

            // Update delivery status to failed
            sqlx::query::<sqlx::Postgres>(
                "UPDATE deliveries SET status = 'failed', error_message = $2 WHERE id = $1",
            )
            .bind(delivery_id)
            .bind("zombie reaper: max attempts exceeded")
            .execute(pool)
            .await?;
        } else {
            // Reset to pending for retry
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
                id,
                delivery_id,
                attempt + 1
            );
        }
    }

    Ok(stuck.len())
}

/// Also recover deliveries stuck in 'pending' with no active queue entry.
/// These are orphaned records from crashed workers.
async fn reap_orphaned_deliveries(pool: &PgPool) -> Result<usize> {
    let orphaned: Vec<(uuid::Uuid,)> = sqlx::query_as(
        r#"
        SELECT d.id FROM deliveries d
        WHERE d.status = 'pending'
          AND d.created_at < now() - interval '10 minutes'
          AND NOT EXISTS (
              SELECT 1 FROM webhook_queue wq
              WHERE wq.delivery_id = d.id
                AND wq.status IN ('pending', 'processing')
          )
        "#,
    )
    .fetch_all(pool)
    .await?;

    if orphaned.is_empty() {
        return Ok(0);
    }

    for (delivery_id,) in &orphaned {
        // Re-insert into queue for retry
        let delivery: Option<(uuid::Uuid, uuid::Uuid, uuid::Uuid, serde_json::Value, Option<serde_json::Value>)> =
            sqlx::query_as(
                "SELECT id, endpoint_id, customer_id, payload, custom_headers FROM deliveries WHERE id = $1"
            )
            .bind(delivery_id)
            .fetch_optional(pool)
            .await?;

        if let Some((id, endpoint_id, _customer_id, payload, custom_headers)) = delivery {
            let endpoint_url: Option<(String,)> =
                sqlx::query_as("SELECT url FROM endpoints WHERE id = $1")
                    .bind(endpoint_id)
                    .fetch_optional(pool)
                    .await?;

            if let Some((url,)) = endpoint_url {
                sqlx::query::<sqlx::Postgres>(
                    r#"INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, status, attempt_count)
                       VALUES ($1, $2, $3, $4, $5, 'pending', 0)
                       ON CONFLICT (delivery_id) DO NOTHING"#
                )
                .bind(id)
                .bind(endpoint_id)
                .bind(&url)
                .bind(&payload)
                .bind(&custom_headers)
                .execute(pool)
                .await?;

                tracing::warn!(
                    "🧟 Re-queued orphaned delivery: {} (endpoint={})",
                    id,
                    endpoint_id
                );
            }
        }
    }

    Ok(orphaned.len())
}

/// Delivery attempt data for recording
struct AttemptRecord<'a> {
    status_code: Option<i32>,
    response_body: Option<&'a str>,
    duration_ms: i32,
    error_message: Option<&'a str>,
    trace_id: Option<&'a str>,
    response_headers: Option<&'a serde_json::Value>,
}

/// Record a delivery attempt
async fn record_attempt(
    conn: &mut sqlx::PgConnection,
    delivery_id: uuid::Uuid,
    attempt_number: i32,
    record: AttemptRecord<'_>,
) -> Result<()> {
    sqlx::query::<sqlx::Postgres>(
        r#"
        INSERT INTO delivery_attempts (delivery_id, attempt_number, status_code, response_body, duration_ms, error_message, trace_id, response_headers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(delivery_id)
    .bind(attempt_number)
    .bind(record.status_code)
    .bind(record.response_body)
    .bind(record.duration_ms)
    .bind(record.error_message)
    .bind(record.trace_id)
    .bind(record.response_headers)
    .execute(conn)
    .await?;

    Ok(())
}

/// Exponential backoff: 30s, 60s, 120s, 300s, 600s, 1800s
fn calculate_backoff(attempt: i32) -> i64 {
    let base = 30_i64;
    let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
    delay.min(1800) // Max 30 dakika
}
