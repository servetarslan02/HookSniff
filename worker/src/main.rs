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
//!
//! ## Known Architectural Limitation: Single-Queue Head-of-Line Blocking (Item 277)
//!
//! All webhook deliveries share a single `webhook_queue` table. A slow or
//! unresponsive endpoint can cause head-of-line blocking where subsequent
//! deliveries are delayed because the worker's concurrency semaphore
//! (`DELIVERY_CONCURRENCY_LIMIT`) is exhausted by slow deliveries.
//!
//! **Mitigations already in place:**
//! - `FOR UPDATE SKIP LOCKED` — concurrent workers don't block each other
//! - Per-endpoint circuit breaker — opens after 5 consecutive failures
//! - Per-endpoint throttle — rate limits retrying endpoints
//! - Concurrency semaphore — limits parallel HTTP deliveries
//! - FIFO ordering — optional per-endpoint ordering with timeout escape
//!
//! **Future improvements (not yet implemented):**
//! - Priority queuing (separate high/low priority queues)
//! - Per-endpoint concurrency limits (weighted fair queuing)
//! - Separate queue partitions by endpoint group

// Item 294: Named constants for magic numbers
/// Maximum database connections in the pool
const DB_MAX_CONNECTIONS: u32 = 25;
/// Database connection acquisition timeout
const DB_ACQUIRE_TIMEOUT_SECS: u64 = 5;
/// HTTP client request timeout
const HTTP_TIMEOUT_SECS: u64 = 5;
/// HTTP client connection timeout
const HTTP_CONNECT_TIMEOUT_SECS: u64 = 2;
/// Maximum idle connections per host in HTTP pool
const HTTP_POOL_MAX_IDLE_PER_HOST: usize = 30;
/// Maximum concurrent HTTP deliveries (global)
const DELIVERY_CONCURRENCY_LIMIT: usize = 50;
/// Maximum concurrent deliveries per endpoint — prevents one slow endpoint from blocking all others
const PER_ENDPOINT_CONCURRENCY_LIMIT: usize = 10;
/// Circuit breaker: failures before opening
const CIRCUIT_BREAKER_FAILURE_THRESHOLD: u32 = 5;
/// Circuit breaker: cooldown period in seconds
const CIRCUIT_BREAKER_COOLDOWN_SECS: u64 = 60;
/// Zombie reaper check interval
const ZOMBIE_REAPER_INTERVAL_SECS: u64 = 30;
/// Queue poll batch size
#[allow(dead_code)]
const QUEUE_BATCH_SIZE: i32 = 50;
/// Response body truncation limit for storage
const RESPONSE_BODY_TRUNCATE_BYTES: usize = 500;
/// Grace period checker interval
const GRACE_CHECK_INTERVAL_SECS: u64 = 6 * 3600;
/// Retention cleanup interval — runs every 6 hours
const RETENTION_CLEANUP_INTERVAL_SECS: u64 = 6 * 3600;
/// Cortex health report interval — every 5 minutes
const CORTEX_HEALTH_REPORT_INTERVAL_SECS: u64 = 300;
use anyhow::Result;
use sqlx::postgres::{PgListener, PgPoolOptions};
use sqlx::PgPool;

mod circuit_breaker;
mod config;
pub mod cortex_integration;
pub mod delivery;
mod fifo;
mod grace;
mod health;
mod helpers;
mod notifications;
pub mod metrics_push;
pub mod operational_webhook;
mod queue;
mod retention;
pub mod telemetry;
mod throttle;
mod types;

pub use types::{WebhookMessage, WebhookQueueItem};
use helpers::{
    calculate_backoff, commit_delivery_tx, is_non_retryable, is_transient_db_error,
    record_delivery_attempt, shutdown_signal,
};

#[tokio::main]
async fn main() -> Result<()> {
    // Install ring as the default CryptoProvider for rustls 0.23+
    // Must happen before ANY TLS connection (HTTP clients, DB, Redis)
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install rustls CryptoProvider");

    // Initialize tracing (OpenTelemetry + structured logging)
    let cfg = config::WorkerConfig::from_env()?;
    telemetry::init(
        cfg.otel_enabled,
        cfg.otel_exporter_otlp_endpoint.as_deref(),
        cfg.otel_exporter_otlp_headers.as_deref(),
    );

    tracing::info!("🔧 HookSniff Worker starting...");

    // ── CRITICAL: Start health server FIRST ──
    // Cloud Run startup probe checks port 8080 within 240s.
    // If DB/Redis is slow or down, health server must still respond.
    let health_port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);
    // Bind synchronously so Cloud Run sees the port immediately
    let health_listener =
        tokio::net::TcpListener::bind(std::net::SocketAddr::from(([0, 0, 0, 0], health_port)))
            .await?;
    tokio::spawn(health::start_health_server(health_listener));
    tracing::info!("🏥 Health server bound on :{}", health_port);

    // Start worker health metrics push to Grafana Cloud (every 60s)
    tokio::spawn(metrics_push::run());
    tracing::info!("📊 Worker metrics push started");

    // Database pool — strip channel_binding=require (sqlx 0.8 doesn't support it)
    let db_url = cfg
        .database_url
        .replace("?channel_binding=require&", "?")
        .replace("&channel_binding=require", "")
        .replace("?channel_binding=require", "");
    tracing::info!("   Database: {}", &db_url[..30.min(db_url.len())]);
    let pool = PgPoolOptions::new()
        .max_connections(DB_MAX_CONNECTIONS)
        .acquire_timeout(std::time::Duration::from_secs(DB_ACQUIRE_TIMEOUT_SECS))
        .connect(&db_url)
        .await
        .map_err(|e| {
            tracing::error!("❌ Database connection failed: {}", e);
            tracing::error!("   URL prefix: {}", &db_url[..30.min(db_url.len())]);
            e
        })?;

    // Mark readiness — DB pool connected, ready to serve traffic
    health::READY.store(true, std::sync::atomic::Ordering::Relaxed);
    tracing::info!("✅ Readiness probe: ready (DB connected)");

    // HTTP client (shared, connection pooling, optimized for low latency)
    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(HTTP_TIMEOUT_SECS))
        .connect_timeout(std::time::Duration::from_secs(HTTP_CONNECT_TIMEOUT_SECS))
        .pool_max_idle_per_host(HTTP_POOL_MAX_IDLE_PER_HOST)
        .tcp_keepalive(std::time::Duration::from_secs(60))
        .tcp_nodelay(true)
        .build()?;

    // Concurrent delivery limit — prevents DDoS on target servers
    let delivery_semaphore = std::sync::Arc::new(tokio::sync::Semaphore::new(DELIVERY_CONCURRENCY_LIMIT));

    // Per-endpoint concurrency limit — one slow endpoint can't block all others
    // Each endpoint gets its own semaphore (max 5 concurrent deliveries per endpoint)
    let endpoint_semaphores: std::sync::Arc<tokio::sync::Mutex<std::collections::HashMap<uuid::Uuid, std::sync::Arc<tokio::sync::Semaphore>>>> =
        std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new()));

    // HS-020: Circuit breaker — skip delivery for endpoints with consecutive failures
    // BUG-023: Persist state to Redis when REDIS_URL is set, survives restarts
    let circuit_breaker = if let Some(ref redis_url) = cfg.redis_url {
        circuit_breaker::CircuitBreaker::with_redis(
            circuit_breaker::CircuitBreakerConfig {
                failure_threshold: CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                cooldown_secs: CIRCUIT_BREAKER_COOLDOWN_SECS,
            },
            redis_url,
        )
        .await
    } else {
        tracing::info!("⚡ Circuit breaker: no REDIS_URL, using in-memory only");
        circuit_breaker::CircuitBreaker::new(circuit_breaker::CircuitBreakerConfig {
            failure_threshold: CIRCUIT_BREAKER_FAILURE_THRESHOLD,
            cooldown_secs: CIRCUIT_BREAKER_COOLDOWN_SECS,
        })
    };

    // BUG-024: Per-endpoint throttle — prevent overwhelming retrying endpoints
    // Persists to Redis when available, falls back to in-memory
    let throttle_manager = if let Some(ref redis_url) = cfg.redis_url {
        throttle::ThrottleManager::with_redis(
            throttle::ThrottleConfig::default(),
            redis_url,
        )
        .await
    } else {
        tracing::info!("🚦 Throttle: no REDIS_URL, using in-memory only");
        throttle::ThrottleManager::new(throttle::ThrottleConfig::default())
    };

    tracing::info!("⚙️ Worker ready — polling webhook_queue every 1s (with LISTEN/NOTIFY)");
    tracing::info!("🔒 Concurrent delivery limit: {} global, {} per endpoint", DELIVERY_CONCURRENCY_LIMIT, PER_ENDPOINT_CONCURRENCY_LIMIT);
    tracing::info!("⚡ Circuit breaker: {} failures → {}s cooldown", CIRCUIT_BREAKER_FAILURE_THRESHOLD, CIRCUIT_BREAKER_COOLDOWN_SECS);
    tracing::info!("🧹 Retention cleanup: every {}h (reads plan limits from platform_settings)", RETENTION_CLEANUP_INTERVAL_SECS / 3600);

    // Graceful shutdown: listen for SIGTERM/SIGINT
    let shutdown = shutdown_signal();

    tokio::pin!(shutdown);

    // Create a dedicated PgListener connection for NOTIFY
    let mut listener = PgListener::connect(&db_url).await?;
    listener.listen("new_webhook").await?;
    tracing::info!("🔔 Listening on 'new_webhook' channel for instant wake-up");

    // Zombie reaper: recover stuck "processing" records every 30s
    let mut reaper_interval = tokio::time::interval(std::time::Duration::from_secs(ZOMBIE_REAPER_INTERVAL_SECS));
    reaper_interval.tick().await; // first tick completes immediately, skip it

    // HS-059: Grace period checker — runs every 6 hours
    let mut grace_interval = tokio::time::interval(std::time::Duration::from_secs(GRACE_CHECK_INTERVAL_SECS));
    grace_interval.tick().await; // skip first immediate tick

    let mut retention_interval = tokio::time::interval(std::time::Duration::from_secs(RETENTION_CLEANUP_INTERVAL_SECS));
    retention_interval.tick().await; // skip first immediate tick

    // Cortex: periodic health report
    let mut cortex_health_interval = tokio::time::interval(std::time::Duration::from_secs(CORTEX_HEALTH_REPORT_INTERVAL_SECS));
    cortex_health_interval.tick().await; // skip first immediate tick

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
                        match PgListener::connect(&db_url).await {
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
                match process_pending(&pool, &http_client, &cfg, delivery_semaphore.clone(), endpoint_semaphores.clone(), circuit_breaker.clone(), throttle_manager.clone()).await {
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
                match process_pending(&pool, &http_client, &cfg, delivery_semaphore.clone(), endpoint_semaphores.clone(), circuit_breaker.clone(), throttle_manager.clone()).await {
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
                match queue::reap_zombies(&pool).await {
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
                match queue::reap_orphaned_deliveries(&pool).await {
                    Ok(orphaned) => {
                        if orphaned > 0 {
                            tracing::warn!("🧟 Re-queued {} orphaned deliveries", orphaned);
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ Orphaned delivery reaper error: {:?}", e);
                    }
                }
                // HS-023: Check FIFO timeouts
                match fifo::check_fifo_timeouts(&pool).await {
                    Ok(timed_out) => {
                        if timed_out > 0 {
                            tracing::warn!("📦 FIFO: {} items timed out", timed_out);
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ FIFO timeout checker error: {:?}", e);
                    }
                }
            }
            _ = grace_interval.tick() => {
                // HS-059: Downgrade customers past their grace period (7 days)
                match grace::process_expired_grace_periods(&pool).await {
                    Ok(downgraded) => {
                        if downgraded > 0 {
                            tracing::warn!(
                                "⏰ Grace period: downgraded {} customers to free plan",
                                downgraded
                            );
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ Grace period checker error: {:?}", e);
                    }
                }
            }
            _ = retention_interval.tick() => {
                // Retention cleanup — delete old delivery data per plan
                match retention::cleanup_expired_retention(&pool).await {
                    Ok((deliveries, attempts)) => {
                        if deliveries > 0 || attempts > 0 {
                            tracing::info!(
                                "🧹 Retention cleanup complete: {} deliveries, {} other records deleted",
                                deliveries, attempts
                            );
                        }
                    }
                    Err(e) => {
                        tracing::error!("❌ Retention cleanup error: {:?}", e);
                    }
                }
            }
            _ = cortex_health_interval.tick() => {
                // Cortex: Report endpoint health metrics for ML learning
                let endpoints: Vec<(uuid::Uuid,)> = sqlx::query_as(
                    "SELECT id FROM endpoints WHERE is_active = true LIMIT 200"
                ).fetch_all(&pool).await.unwrap_or_default();

                for (eid,) in &endpoints {
                    if let Ok(Some((sr, avg_lat, p95))) = sqlx::query_as::<_, (f64, f64, i32)>(
                        "SELECT success_rate_1h, avg_latency_ms, COALESCE(latency_p95, 0) FROM endpoint_profiles WHERE endpoint_id = $1"
                    ).bind(eid).fetch_optional(&pool).await {
                        let _ = cortex_integration::report_endpoint_health(
                            &pool, *eid, sr, avg_lat, p95 as f64
                        ).await;
                    }
                }
            }
        }
    }

    tracing::info!("👋 HookSniff Worker shut down gracefully");

    Ok(())
}

/// Move a delivery to dead_letter (non-retryable or max attempts exceeded).
/// Returns (new_failure_streak, customer_id) for the endpoint.
async fn dead_letter_delivery(
    pool: &PgPool,
    queue_id: uuid::Uuid,
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
    attempt: i32,
    error_msg: &str,
    attempt_status: Option<i32>,
    attempt_body: Option<&str>,
    attempt_headers: Option<&serde_json::Value>,
    duration_ms: i32,
    trace_id: Option<&str>,
    context: &str,
) -> Result<(i32, uuid::Uuid)> {
    let mut tx = pool.begin().await?;

    sqlx::query::<sqlx::Postgres>(
        "UPDATE webhook_queue SET status = 'dead_letter', processed_at = now(), attempt_count = $1 WHERE id = $2",
    )
    .bind(attempt).bind(queue_id).execute(&mut *tx).await?;

    // Get customer_id from the delivery before dead-lettering
    let customer_id: uuid::Uuid = sqlx::query_scalar(
        "SELECT customer_id FROM deliveries WHERE id = $1",
    )
    .bind(delivery_id).fetch_one(&mut *tx).await?;

    sqlx::query::<sqlx::Postgres>(
        r#"INSERT INTO dead_letters (delivery_id, endpoint_id, customer_id, payload, reason, attempts)
           SELECT id, endpoint_id, customer_id, payload, $2, $3 FROM deliveries WHERE id = $1"#,
    )
    .bind(delivery_id).bind(error_msg).bind(attempt).execute(&mut *tx).await?;

    sqlx::query::<sqlx::Postgres>(
        "UPDATE deliveries SET status = 'failed', error_message = $2 WHERE id = $1",
    )
    .bind(delivery_id).bind(error_msg).execute(&mut *tx).await?;

    record_delivery_attempt(&mut tx, delivery_id, attempt, attempt_status, attempt_body, duration_ms, Some(error_msg), trace_id, attempt_headers).await?;

    let new_streak: i32 = sqlx::query_scalar(
        "UPDATE endpoints SET failure_streak = failure_streak + 1, last_failure_at = now() WHERE id = $1 RETURNING failure_streak",
    )
    .bind(endpoint_id).fetch_one(&mut *tx).await.unwrap_or(0);

    commit_delivery_tx(tx, delivery_id, context).await?;
    Ok((new_streak, customer_id))
}

/// Schedule a delivery for retry with exponential backoff.
async fn retry_delivery(
    pool: &PgPool,
    queue_id: uuid::Uuid,
    delivery_id: uuid::Uuid,
    attempt: i32,
    next_retry: chrono::DateTime<chrono::Utc>,
    error_msg: &str,
    attempt_status: Option<i32>,
    attempt_body: Option<&str>,
    attempt_headers: Option<&serde_json::Value>,
    duration_ms: i32,
    trace_id: Option<&str>,
) -> Result<()> {
    let mut tx = pool.begin().await?;

    sqlx::query::<sqlx::Postgres>(
        "UPDATE webhook_queue SET status = 'pending', attempt_count = $1, next_retry_at = $2 WHERE id = $3",
    )
    .bind(attempt).bind(next_retry).bind(queue_id).execute(&mut *tx).await?;

    record_delivery_attempt(&mut tx, delivery_id, attempt, attempt_status, attempt_body, duration_ms, Some(&format!("{} — retry scheduled", error_msg)), trace_id, attempt_headers).await?;

    commit_delivery_tx(tx, delivery_id, "retry").await?;
    Ok(())
}

/// Process all pending items in the queue
async fn process_pending(
    pool: &PgPool,
    http_client: &reqwest::Client,
    _cfg: &config::WorkerConfig,
    semaphore: std::sync::Arc<tokio::sync::Semaphore>,
    endpoint_semaphores: std::sync::Arc<tokio::sync::Mutex<std::collections::HashMap<uuid::Uuid, std::sync::Arc<tokio::sync::Semaphore>>>>,
    circuit_breaker: circuit_breaker::CircuitBreaker,
    throttle_manager: throttle::ThrottleManager,
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

    let _count = items.len();

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
        let semaphore = semaphore.clone();
        let endpoint_semaphores = endpoint_semaphores.clone();
        let cb = circuit_breaker.clone();
        let tm = throttle_manager.clone();

        let handle = tokio::spawn(async move {
            // Per-endpoint concurrency: get or create semaphore for this endpoint
            let sem = {
                let mut map = endpoint_semaphores.lock().await;
                map.entry(item.endpoint_id).or_insert_with(|| {
                    std::sync::Arc::new(tokio::sync::Semaphore::new(PER_ENDPOINT_CONCURRENCY_LIMIT))
                }).clone()
            };
            let _endpoint_permit = sem.acquire().await.expect("endpoint semaphore closed");

            // Global concurrency limit
            let _permit = semaphore.acquire().await.expect("semaphore closed");

            let delivery_id = item.delivery_id;
            let endpoint_id = item.endpoint_id;
            let attempt = item.attempt_count + 1;

            // Idempotency guard: check if this delivery was already successfully delivered.
            // Prevents duplicate delivery if worker crashed after HTTP success but before DB commit.
            {
                let existing_status: Option<(String,)> = sqlx::query_as(
                    "SELECT status::text FROM deliveries WHERE id = $1"
                )
                .bind(delivery_id)
                .fetch_optional(&pool)
                .await?;

                if let Some((ref status,)) = existing_status {
                    if status == "delivered" {
                        tracing::info!(
                            "⏭️ Delivery {} already delivered — marking queue as done (idempotency)",
                            delivery_id
                        );
                        let _ = sqlx::query::<sqlx::Postgres>(
                            "UPDATE webhook_queue SET status = 'delivered', processed_at = now() WHERE id = $1"
                        )
                        .bind(item.id)
                        .execute(&pool)
                        .await;
                        return Ok::<(), anyhow::Error>(());
                    }
                }
            }

            // HS-020: Circuit breaker — skip delivery if endpoint circuit is open
            if !cb.allow_request(endpoint_id).await {
                tracing::warn!(
                    "⚡ Circuit OPEN — skipping delivery {} for endpoint {} (cooldown active)",
                    delivery_id,
                    endpoint_id
                );
                // Re-queue for later retry
                let _ = sqlx::query::<sqlx::Postgres>(
                    "UPDATE webhook_queue SET status = 'pending', next_retry_at = now() + interval '60 seconds' WHERE id = $1"
                )
                .bind(item.id)
                .execute(&pool)
                .await;
                return Ok::<(), anyhow::Error>(());
            }

            // HS-023: FIFO check — skip if endpoint is FIFO and previous item not completed
            if !fifo::should_deliver_fifo(&pool, endpoint_id)
                .await
                .unwrap_or(true)
            {
                tracing::debug!(
                    "📦 FIFO: delivery {} waiting for previous item (endpoint {})",
                    delivery_id,
                    endpoint_id
                );
                // Re-queue for later retry
                let _ = sqlx::query::<sqlx::Postgres>(
                    "UPDATE webhook_queue SET status = 'pending', next_retry_at = now() + interval '5 seconds' WHERE id = $1"
                )
                .bind(item.id)
                .execute(&pool)
                .await;
                return Ok::<(), anyhow::Error>(());
            }

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

                    // Item 34: Classify commit errors for monitoring
                    if let Err(e) = tx.commit().await {
                        if is_transient_db_error(&e) {
                            tracing::warn!("⚠️ Transient DB commit failure (dead_letter, signing missing): {e:?}");
                        } else {
                            tracing::error!("❌ DB commit failure (dead_letter, signing missing): {e:?}");
                        }
                    }
                    return Ok::<(), anyhow::Error>(());
                }
            };

            // ── Cortex: Check for healing actions before delivery ──
            let _adjusted_timeout_ms: Option<u64> = None;
            if let Ok(Some(action)) = cortex_integration::get_active_healing_action(&pool, endpoint_id).await {
                if let Some(factor) = action.get_timeout_adjustment() {
                    let _ = (30_000u64 as f64 * factor) as u64; // reserved for future use
                }
            }

            // ── Cortex: Check for smart routing decision ──
            let mut cortex_routing_url: Option<String> = None;
            if let Ok(Some(url)) = cortex_integration::get_routing_decision(&pool, endpoint_id).await {
                cortex_routing_url = Some(url.clone());
                tracing::info!("🔀 Cortex routing: endpoint {} → {}", endpoint_id, url);
            }

            // Build WebhookMessage and delegate HTTP delivery to the delivery module
            let mut webhook_msg = WebhookMessage {
                delivery_id: delivery_id.to_string(),
                endpoint_id: item.endpoint_id.to_string(),
                endpoint_url: item.endpoint_url.clone(),
                signing_secret,
                payload: item.payload.clone(),
                custom_headers: item.custom_headers.clone(),
            };

            // Apply Cortex routing decision if available
            if let Some(ref routed_url) = cortex_routing_url {
                webhook_msg.endpoint_url = routed_url.clone();
            }

            let result = delivery::deliver_with_routing(&http_client, &pool, &webhook_msg, attempt).await?;

            let status_code = result.status_code;
            let response_body = &result.response_body;
            let duration_ms = result.duration_ms;
            let resp_headers = &result.response_headers;
            let is_network_error = !result.error.is_empty();

            // ── Cortex: Report delivery outcome for ML learning ──
            {
                let strategy = if is_network_error { "network_error" } else { "http" };
                let success = result.success;
                let latency = duration_ms as f64;
                let code = if is_network_error { 0u16 } else { status_code as u16 };
                let pool_cx = pool.clone();
                tokio::spawn(async move {
                    // Get customer_id for this delivery
                    if let Ok(Some(cid)) = sqlx::query_scalar::<_, uuid::Uuid>(
                        "SELECT customer_id FROM deliveries WHERE id = $1"
                    ).bind(delivery_id).fetch_optional(&pool_cx).await {
                        let _ = cortex_integration::report_delivery_outcome(
                            &pool_cx, endpoint_id, cid, success, latency, code, strategy,
                        ).await;
                    }
                });
            }

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
            // HS-064: Truncate response body to prevent PII leakage in traces/storage
            let attempt_body = if is_network_error {
                None
            } else {
                let body = response_body.as_str();
                let truncated = if body.len() > RESPONSE_BODY_TRUNCATE_BYTES { &body[..RESPONSE_BODY_TRUNCATE_BYTES] } else { body };
                Some(truncated)
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
                record_delivery_attempt(
                    &mut tx,
                    delivery_id,
                    attempt,
                    attempt_status,
                    attempt_body,
                    duration_ms,
                    None,
                    trace_id.as_deref(),
                    attempt_headers,
                )
                .await?;

                // Item 265: Use running average for avg_response_ms instead of overwrite
                sqlx::query::<sqlx::Postgres>(
                    "UPDATE endpoints SET failure_streak = 0, avg_response_ms = CASE \
                     WHEN avg_response_ms IS NULL OR avg_response_ms = 0 THEN $2 \
                     ELSE ((avg_response_ms * 0.8) + ($2 * 0.2))::int \
                     END WHERE id = $1",
                )
                .bind(item.endpoint_id)
                .bind(duration_ms)
                .execute(&mut *tx)
                .await?;

                // HS-034: Commit transaction
                if !commit_delivery_tx(tx, delivery_id, "success").await? {
                    return Ok::<(), anyhow::Error>(());
                }

                // HS-020: Record success in circuit breaker
                cb.record_success(endpoint_id).await;

                // HS-023: Mark FIFO item as delivered
                let _ = fifo::mark_fifo_delivered(&pool, endpoint_id, delivery_id).await;
            } else if is_non_retryable(status_code) {
                // ❌ Client error (4xx except 429) → dead letter, don't retry
                tracing::error!("❌ Delivery {} → {} — non-retryable (HTTP {}), dead letter", delivery_id, error_msg, status_code);

                let dl_err = format!("{} (HTTP {}, non-retryable)", error_msg, status_code);
                let (new_streak, customer_id) = dead_letter_delivery(&pool, item.id, delivery_id, item.endpoint_id, attempt, &dl_err, attempt_status, attempt_body, attempt_headers, duration_ms, trace_id.as_deref(), "non-retryable dead letter").await?;

                // Create in-app notification for the customer
                {
                    let pool_clone = pool.clone();
                    let url_clone = item.endpoint_url.clone();
                    let err_clone = dl_err.clone();
                    tokio::spawn(async move {
                        notifications::create_delivery_failure_notification(&pool_clone, customer_id, delivery_id, &url_clone, &err_clone).await;
                    });
                }

                {
                    let pool_clone = pool.clone();
                    let url_clone = item.endpoint_url.clone();
                    tokio::spawn(async move { notifications::notify_endpoint_down(&pool_clone, endpoint_id, &url_clone, new_streak).await; });
                }

                // Dispatch operational webhook: delivery.failed
                {
                    let pool_clone = pool.clone();
                    let hc_clone = http_client.clone();
                    let op_payload = serde_json::json!({
                        "delivery_id": delivery_id.to_string(),
                        "endpoint_id": endpoint_id.to_string(),
                        "endpoint_url": item.endpoint_url,
                        "error": dl_err,
                        "attempt": attempt,
                        "status_code": status_code,
                    });
                    tokio::spawn(async move {
                        operational_webhook::dispatch_event(&pool_clone, &hc_clone, customer_id, operational_webhook::OpWebhookEvent::DeliveryFailed, op_payload).await;
                    });
                }

                cb.record_failure(endpoint_id).await;
                tm.record_attempt(endpoint_id).await;
                let _ = fifo::mark_fifo_failed(&pool, endpoint_id).await;
            } else if attempt >= item.max_attempts {
                // ❌ Max deneme aşıldı → dead letter
                tracing::error!("❌ Delivery {} → {} — max attempts, dead letter", delivery_id, error_msg);

                let (new_streak, customer_id) = dead_letter_delivery(&pool, item.id, delivery_id, item.endpoint_id, attempt, &error_msg, attempt_status, attempt_body, attempt_headers, duration_ms, trace_id.as_deref(), "max attempts dead letter").await?;

                // Create in-app notification for the customer
                {
                    let pool_clone = pool.clone();
                    let url_clone = item.endpoint_url.clone();
                    let err_clone = error_msg.clone();
                    tokio::spawn(async move {
                        notifications::create_delivery_failure_notification(&pool_clone, customer_id, delivery_id, &url_clone, &err_clone).await;
                    });
                }

                {
                    let pool_clone = pool.clone();
                    let url_clone = item.endpoint_url.clone();
                    tokio::spawn(async move { notifications::notify_endpoint_down(&pool_clone, endpoint_id, &url_clone, new_streak).await; });
                }

                // Dispatch operational webhook: delivery.failed
                {
                    let pool_clone = pool.clone();
                    let hc_clone = http_client.clone();
                    let op_payload = serde_json::json!({
                        "delivery_id": delivery_id.to_string(),
                        "endpoint_id": endpoint_id.to_string(),
                        "endpoint_url": item.endpoint_url,
                        "error": error_msg,
                        "attempt": attempt,
                        "max_attempts": item.max_attempts,
                    });
                    tokio::spawn(async move {
                        operational_webhook::dispatch_event(&pool_clone, &hc_clone, customer_id, operational_webhook::OpWebhookEvent::DeliveryFailed, op_payload).await;
                    });
                }

                cb.record_failure(endpoint_id).await;
                tm.record_attempt(endpoint_id).await;
                let _ = fifo::mark_fifo_failed(&pool, endpoint_id).await;
            } else {
                // 🔄 Retry — exponential backoff
                let delay = calculate_backoff(attempt);
                let next_retry = chrono::Utc::now() + chrono::Duration::seconds(delay);

                tracing::warn!("⚠️ Delivery {} → {} — retrying in {}s (attempt {}/{})", delivery_id, error_msg, delay, attempt, item.max_attempts);

                retry_delivery(&pool, item.id, delivery_id, attempt, next_retry, &error_msg, attempt_status, attempt_body, attempt_headers, duration_ms, trace_id.as_deref()).await?;

                cb.record_failure(endpoint_id).await;
                tm.record_attempt(endpoint_id).await;
            }

            Ok::<(), anyhow::Error>(())
        });

        handles.push(handle);
    }

    // Wait for all concurrent deliveries to complete
    // Item 269: Track actual processed count (not just fetched)
    let mut processed = 0usize;
    for handle in handles {
        match handle.await {
            Ok(Ok(())) => processed += 1,
            Ok(Err(e)) => {
                tracing::error!("❌ Delivery task error: {:?}", e);
                processed += 1; // Still counts as processed (attempted)
            }
            Err(e) => {
                tracing::error!("❌ Delivery task panicked: {:?}", e);
                // Panicked tasks don't count as processed
            }
        }
    }

    Ok(processed)
}

// ── Delivery outcome helpers (Item 293: reduce function length) ──────

/// Recover webhook_queue records stuck in "processing" for more than 5 minutes.
///
/// When the worker crashes mid-delivery, records stay in "processing" forever.
/// This reaper checks max_attempts:
