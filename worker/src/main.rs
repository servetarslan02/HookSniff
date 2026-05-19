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
const DB_MAX_CONNECTIONS: u32 = 10;
/// Database connection acquisition timeout
const DB_ACQUIRE_TIMEOUT_SECS: u64 = 30;
/// HTTP client request timeout
const HTTP_TIMEOUT_SECS: u64 = 10;
/// HTTP client connection timeout
const HTTP_CONNECT_TIMEOUT_SECS: u64 = 3;
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
use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::postgres::{PgListener, PgPoolOptions};
use sqlx::PgPool;

mod circuit_breaker;
mod config;
pub mod delivery;
mod fifo;
pub mod metrics_push;
pub mod operational_webhook;
pub mod telemetry;
mod throttle;

/// Shared readiness state — set to true once DB pool is connected.
static READY: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Start health server with a pre-bound listener (for Cloud Run startup probe).
/// Provides Kubernetes-compatible health endpoints:
/// - `/health`  — legacy Cloud Run health check (always 200)
/// - `/livez`   — liveness probe: process is alive (always 200)
/// - `/readyz`  — readiness probe: ready to serve traffic (checks DB connectivity)
async fn start_health_server(listener: tokio::net::TcpListener) {
    use axum::{routing::get, Router};

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/livez", get(|| async { "ok" }))
        .route("/readyz", get(|| async {
            if READY.load(std::sync::atomic::Ordering::Relaxed) {
                (axum::http::StatusCode::OK, "ready")
            } else {
                (axum::http::StatusCode::SERVICE_UNAVAILABLE, "not ready")
            }
        }))
        .route("/", get(|| async { "HookSniff Worker 🐝" }));

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
    tokio::spawn(start_health_server(health_listener));
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
    READY.store(true, std::sync::atomic::Ordering::Relaxed);
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
                match process_expired_grace_periods(&pool).await {
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
                match cleanup_expired_retention(&pool).await {
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
        }
    }

    tracing::info!("👋 HookSniff Worker shut down gracefully");

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


// ── Delivery outcome helpers ────────────────────────────────

/// Create an in-app notification for a dead-lettered delivery.
async fn create_delivery_failure_notification(
    pool: &sqlx::PgPool,
    customer_id: uuid::Uuid,
    delivery_id: uuid::Uuid,
    endpoint_url: &str,
    error_msg: &str,
) {
    let title = format!("⚠️ Webhook Teslimat Başarısız");
    let message = format!(
        "{} adresine teslimat başarısız oldu: {}",
        endpoint_url, error_msg
    );
    let link = format!("/deliveries/{}", delivery_id);

    let _ = sqlx::query(
        "INSERT INTO notifications (customer_id, type, title, message, is_read, link) VALUES ($1, 'webhook_failed', $2, $3, false, $4)"
    )
    .bind(customer_id)
    .bind(&title)
    .bind(&message)
    .bind(&link)
    .execute(pool)
    .await;
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

            // Build WebhookMessage and delegate HTTP delivery to the delivery module
            let webhook_msg = WebhookMessage {
                delivery_id: delivery_id.to_string(),
                endpoint_id: item.endpoint_id.to_string(),
                endpoint_url: item.endpoint_url.clone(),
                signing_secret,
                payload: item.payload.clone(),
                custom_headers: item.custom_headers.clone(),
            };

            let result = delivery::deliver_with_routing(&http_client, &pool, &webhook_msg, attempt).await?;

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
                        create_delivery_failure_notification(&pool_clone, customer_id, delivery_id, &url_clone, &err_clone).await;
                    });
                }

                {
                    let pool_clone = pool.clone();
                    let url_clone = item.endpoint_url.clone();
                    tokio::spawn(async move { notify_endpoint_down(&pool_clone, endpoint_id, &url_clone, new_streak).await; });
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
                        create_delivery_failure_notification(&pool_clone, customer_id, delivery_id, &url_clone, &err_clone).await;
                    });
                }

                {
                    let pool_clone = pool.clone();
                    let url_clone = item.endpoint_url.clone();
                    tokio::spawn(async move { notify_endpoint_down(&pool_clone, endpoint_id, &url_clone, new_streak).await; });
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

/// Commit a delivery transaction with transient vs permanent error classification.
async fn commit_delivery_tx(
    tx: sqlx::PgTransaction<'_>,
    delivery_id: uuid::Uuid,
    context: &str,
) -> Result<bool> {
    match tx.commit().await {
        Ok(()) => Ok(true),
        Err(e) => {
            if is_transient_db_error(&e) {
                tracing::warn!(
                    "⚠️ Delivery {} — transient DB commit failure ({}): {:?}",
                    delivery_id, context, e
                );
            } else {
                tracing::error!(
                    "❌ Delivery {} — permanent DB commit failure ({}): {:?}",
                    delivery_id, context, e
                );
            }
            Ok(false)
        }
    }
}

/// Record the delivery attempt in the delivery_attempts table.
#[allow(clippy::too_many_arguments)]
async fn record_delivery_attempt(
    tx: &mut sqlx::PgTransaction<'_>,
    delivery_id: uuid::Uuid,
    attempt: i32,
    attempt_status: Option<i32>,
    attempt_body: Option<&str>,
    duration_ms: i32,
    error_message: Option<&str>,
    trace_id: Option<&str>,
    attempt_headers: Option<&serde_json::Value>,
) -> Result<()> {
    record_attempt(
        tx,
        delivery_id,
        attempt,
        AttemptRecord {
            status_code: attempt_status,
            response_body: attempt_body,
            duration_ms,
            error_message,
            trace_id,
            response_headers: attempt_headers,
        },
    )
    .await
}

/// Recover webhook_queue records stuck in "processing" for more than 5 minutes.
///
/// When the worker crashes mid-delivery, records stay in "processing" forever.
/// This reaper checks max_attempts:
///   - If attempt_count >= max_attempts → dead letter (don't retry forever)
///   - If attempt_count < max_attempts → reset to pending for retry
///
/// Item 267: Wrapped in a transaction for atomicity.
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
async fn reap_orphaned_deliveries(pool: &PgPool) -> Result<usize> {
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

/// Check if an HTTP status code is non-retryable (client error).
/// 4xx errors (except 429 Too Many Requests) should not be retried.
/// - 400 Bad Request → client mistake, retry won't help
/// - 401 Unauthorized → auth issue, retry won't help
/// - 403 Forbidden → permission issue, retry won't help
/// - 404 Not Found → endpoint gone, retry won't help
/// - 429 Too Many Requests → SHOULD be retried (rate limited)
/// - 5xx → SHOULD be retried (server error)
fn is_non_retryable(status_code: i32) -> bool {
    (400..500).contains(&status_code) && status_code != 429
}

/// Check if a sqlx error is transient (worth retrying or recovering).
///
/// Transient errors:
/// - Connection closed/timed out
/// - Serialization failure (PostgreSQL 40001)
/// - Deadlock detected (PostgreSQL 40P01)
/// - Connection pool timeout
fn is_transient_db_error(e: &sqlx::Error) -> bool {
    match e {
        sqlx::Error::Io(_) => true,
        sqlx::Error::PoolTimedOut => true,
        sqlx::Error::PoolClosed => true,
        sqlx::Error::Database(db_err) => {
            // PostgreSQL error codes for transient failures
            if let Some(code) = db_err.code() {
                let code_str = code.as_ref();
                // 40001: serialization_failure
                // 40P01: deadlock_detected
                // 08000: connection_exception
                // 08001: sqlclient_unable_to_establish_sqlconnection
                // 08003: connection_does_not_exist
                // 08004: sqlserver_rejected_establishment_of_sqlconnection
                // 08006: connection_failure
                // 57P01: admin_shutdown
                // 57P02: crash_shutdown
                // 57P03: cannot_connect_now
                return matches!(
                    code_str,
                    "40001"
                        | "40P01"
                        | "08000"
                        | "08001"
                        | "08003"
                        | "08004"
                        | "08006"
                        | "57P01"
                        | "57P02"
                        | "57P03"
                );
            }
            false
        }
        _ => false,
    }
}

// ──────────────────────────────────────────────────────────────
// Endpoint Down Email Notification
// ──────────────────────────────────────────────────────────────

/// Send email notification when an endpoint becomes unhealthy (failure_streak >= 5).
/// Reads Resend config from platform_settings.
/// Also dispatches `endpoint.disabled` operational webhook at threshold crossings.
async fn notify_endpoint_down(
    pool: &PgPool,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    failure_streak: i32,
) {
    // Only notify at threshold crossings: 5, 10, 20, 50
    if !matches!(failure_streak, 5 | 10 | 20 | 50) {
        return;
    }

    // Get customer email, customer_id, and platform settings
    let result = sqlx::query_as::<_, (String, uuid::Uuid, String, Option<String>, Option<String>)>(
        r#"SELECT c.email, c.id, e.url, s.resend_api_key, s.email_sender
           FROM endpoints e
           JOIN customers c ON e.customer_id = c.id
           CROSS JOIN (SELECT value FROM platform_settings WHERE key = 'main') ps
           LEFT JOIN LATERAL (
               SELECT
                   (ps.value->>'resend_api_key') as resend_api_key,
                   (ps.value->>'email_sender') as email_sender
           ) s ON true
           WHERE e.id = $1"#,
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await;

    let (customer_email, customer_id, _url, api_key_opt, sender_opt) = match result {
        Ok(Some(row)) => row,
        _ => return, // Silently skip if we can't fetch
    };

    // Dispatch operational webhook: endpoint.disabled
    {
        let http_client = reqwest::Client::new();
        let op_payload = serde_json::json!({
            "endpoint_id": endpoint_id.to_string(),
            "endpoint_url": endpoint_url,
            "failure_streak": failure_streak,
        });
        operational_webhook::dispatch_event(
            pool,
            &http_client,
            customer_id,
            operational_webhook::OpWebhookEvent::EndpointDisabled,
            op_payload,
        )
        .await;
    }

    let api_key = match api_key_opt {
        Some(k) if !k.is_empty() => k,
        _ => return, // No Resend key configured
    };

    let sender = sender_opt.as_deref().unwrap_or("noreply@resend.dev");

    let subject = format!("⚠️ Endpoint Down: {}", endpoint_url);
    let body = format!(
        "Your endpoint has been experiencing failures.\n\n\
         Endpoint: {}\n\
         Consecutive failures: {}\n\n\
         Please check your endpoint and ensure it's responding correctly.\n\n\
         — HookSniff",
        endpoint_url, failure_streak
    );

    let client = reqwest::Client::new();
    let _ = client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "from": sender,
            "to": [customer_email],
            "subject": subject,
            "text": body,
        }))
        .send()
        .await;

    tracing::info!("📧 Endpoint down notification sent for {}", endpoint_url);
}

// ──────────────────────────────────────────────────────────────
// HS-059: Grace period — downgrade customers after 7 days
// ──────────────────────────────────────────────────────────────

/// Grace period in days after a failed payment before downgrade.
const GRACE_PERIOD_DAYS: i64 = 7;

/// Downgrade customers whose payment_failed_at is older than 7 days.
/// Called every 6 hours by the worker's main loop.
async fn process_expired_grace_periods(pool: &PgPool) -> Result<usize> {
    let cutoff = chrono::Utc::now() - chrono::Duration::days(GRACE_PERIOD_DAYS);

    // Find customers past grace period
    let rows: Vec<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT id FROM customers \
         WHERE payment_failed_at IS NOT NULL \
         AND payment_failed_at < $1 \
         AND plan != 'free'",
    )
    .bind(cutoff)
    .fetch_all(pool)
    .await?;

    let count = rows.len();

    for (customer_id,) in &rows {
        let free_limit: i32 = 10_000; // Plan::Free.max_webhooks_per_month()

        sqlx::query(
            "UPDATE customers SET plan = 'free', webhook_limit = $1, \
             payment_failed_at = NULL, cancel_at_period_end = false, updated_at = NOW() \
             WHERE id = $2",
        )
        .bind(free_limit)
        .bind(customer_id)
        .execute(pool)
        .await?;

        // Disable excess endpoints (free plan = 5)
        let max_endpoints: i64 = 5;
        let active_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true",
        )
        .bind(customer_id)
        .fetch_one(pool)
        .await?;

        if active_count.0 > max_endpoints {
            let excess = active_count.0 - max_endpoints;
            sqlx::query(
                "UPDATE endpoints SET is_active = false, updated_at = NOW() \
                 WHERE id IN (\
                   SELECT id FROM endpoints \
                   WHERE customer_id = $1 AND is_active = true \
                   ORDER BY created_at DESC \
                   LIMIT $2\
                 )",
            )
            .bind(customer_id)
            .bind(excess)
            .execute(pool)
            .await?;
        }

        tracing::info!(
            "⏰ Customer {} downgraded to free after {} day grace period",
            customer_id,
            GRACE_PERIOD_DAYS
        );
    }

    Ok(count)
}

/// Retention cleanup — delete delivery data older than plan's retention days.
/// Reads retention config from platform_settings, falls back to defaults.
/// Runs every 6 hours.
async fn cleanup_expired_retention(pool: &PgPool) -> Result<(i64, i64)> {
    // Fetch retention days from platform_settings
    let settings: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(pool)
            .await?;

    let (ret_free, ret_startup, ret_pro, ret_enterprise) = if let Some((value,)) = settings {
        let obj = value.as_object();
        (
            obj.and_then(|o| o.get("retention_days_free")).and_then(|v| v.as_i64()).unwrap_or(7),
            obj.and_then(|o| o.get("retention_days_startup")).and_then(|v| v.as_i64()).unwrap_or(14),
            obj.and_then(|o| o.get("retention_days_pro")).and_then(|v| v.as_i64()).unwrap_or(30),
            obj.and_then(|o| o.get("retention_days_enterprise")).and_then(|v| v.as_i64()).unwrap_or(90),
        )
    } else {
        (7, 14, 180, 365)
    };

    // Delete deliveries per plan tier
    let plan_configs = [
        ("developer", ret_free),
        ("startup", ret_startup),
        ("pro", ret_pro),
        ("enterprise", ret_enterprise),
    ];

    let mut total_deliveries = 0i64;
    let mut total_attempts = 0i64;

    for (plan, days) in &plan_configs {
        let cutoff = chrono::Utc::now() - chrono::Duration::days(*days);

        // Delete old delivery_attempts first (FK dependency)
        let attempts_result = sqlx::query(
            "DELETE FROM delivery_attempts WHERE delivery_id IN (\
               SELECT d.id FROM deliveries d \
               JOIN customers c ON c.id = d.customer_id \
               WHERE c.plan = $1 AND d.created_at < $2\
             )"
        )
        .bind(plan)
        .bind(cutoff)
        .execute(pool)
        .await?;

        // Delete old deliveries
        let deliveries_result = sqlx::query(
            "DELETE FROM deliveries WHERE id IN (\
               SELECT d.id FROM deliveries d \
               JOIN customers c ON c.id = d.customer_id \
               WHERE c.plan = $1 AND d.created_at < $2\
             )"
        )
        .bind(plan)
        .bind(cutoff)
        .execute(pool)
        .await?;

        let del_count = deliveries_result.rows_affected();
        let att_count = attempts_result.rows_affected();

        if del_count > 0 || att_count > 0 {
            tracing::info!(
                "🧹 Retention cleanup [{}]: deleted {} deliveries, {} attempts ({} days)",
                plan, del_count, att_count, days
            );
        }

        total_deliveries += del_count as i64;
        total_attempts += att_count as i64;
    }

    // Also clean dead_letters older than 90 days (regardless of plan)
    let dead_cutoff = chrono::Utc::now() - chrono::Duration::days(90);
    let dead_result = sqlx::query("DELETE FROM dead_letters WHERE created_at < $1")
        .bind(dead_cutoff)
        .execute(pool)
        .await?;
    let dead_count = dead_result.rows_affected();
    if dead_count > 0 {
        tracing::info!("🧹 Retention cleanup: deleted {} old dead_letters", dead_count);
    }

    // Clean audit_log older than 365 days
    let audit_cutoff = chrono::Utc::now() - chrono::Duration::days(365);
    let audit_result = sqlx::query("DELETE FROM audit_log WHERE created_at < $1")
        .bind(audit_cutoff)
        .execute(pool)
        .await?;
    let audit_count = audit_result.rows_affected();
    if audit_count > 0 {
        tracing::info!("🧹 Retention cleanup: deleted {} old audit_log entries", audit_count);
    }

    Ok((total_deliveries, total_attempts + dead_count as i64 + audit_count as i64))
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── calculate_backoff ───────────────────────────────────

    #[test]
    fn test_backoff_first_attempt() {
        // attempt=1 → 30s
        assert_eq!(calculate_backoff(1), 30);
    }

    #[test]
    fn test_backoff_second_attempt() {
        // attempt=2 → 60s
        assert_eq!(calculate_backoff(2), 60);
    }

    #[test]
    fn test_backoff_third_attempt() {
        // attempt=3 → 120s
        assert_eq!(calculate_backoff(3), 120);
    }

    #[test]
    fn test_backoff_exponential_growth() {
        assert_eq!(calculate_backoff(4), 240);
        assert_eq!(calculate_backoff(5), 480);
        assert_eq!(calculate_backoff(6), 960);
    }

    #[test]
    fn test_backoff_capped_at_1800() {
        // attempt=10 → 30 * 2^9 = 15360, but capped at 1800
        assert_eq!(calculate_backoff(10), 1800);
        assert_eq!(calculate_backoff(20), 1800);
    }

    #[test]
    fn test_backoff_attempt_zero() {
        // attempt=0 → 30 * 2^(-1).max(0) = 30 * 1 = 30
        assert_eq!(calculate_backoff(0), 30);
    }

    // ── is_non_retryable ────────────────────────────────────

    #[test]
    fn test_non_retryable_400() {
        assert!(is_non_retryable(400));
    }

    #[test]
    fn test_non_retryable_401() {
        assert!(is_non_retryable(401));
    }

    #[test]
    fn test_non_retryable_403() {
        assert!(is_non_retryable(403));
    }

    #[test]
    fn test_non_retryable_404() {
        assert!(is_non_retryable(404));
    }

    #[test]
    fn test_retryable_429() {
        // 429 SHOULD be retried (rate limited)
        assert!(!is_non_retryable(429));
    }

    #[test]
    fn test_retryable_500() {
        assert!(!is_non_retryable(500));
    }

    #[test]
    fn test_retryable_502() {
        assert!(!is_non_retryable(502));
    }

    #[test]
    fn test_retryable_503() {
        assert!(!is_non_retryable(503));
    }

    #[test]
    fn test_non_retryable_300() {
        // 3xx is not in 400..500, so it's retryable (shouldn't happen in practice)
        assert!(!is_non_retryable(300));
    }

    #[test]
    fn test_non_retryable_200() {
        // 200 is not in 400..500, so it's retryable (shouldn't happen in practice)
        assert!(!is_non_retryable(200));
    }

    // ── is_transient_db_error ───────────────────────────────

    #[test]
    fn test_transient_db_pool_timeout() {
        let err = sqlx::Error::PoolTimedOut;
        assert!(is_transient_db_error(&err));
    }

    #[test]
    fn test_transient_db_pool_closed() {
        let err = sqlx::Error::PoolClosed;
        assert!(is_transient_db_error(&err));
    }

    #[test]
    fn test_transient_db_io_error() {
        let io_err = std::io::Error::new(std::io::ErrorKind::ConnectionReset, "reset");
        let err = sqlx::Error::Io(io_err);
        assert!(is_transient_db_error(&err));
    }

    #[test]
    fn test_non_transient_db_error() {
        // RowNotFound is not transient
        let err = sqlx::Error::RowNotFound;
        assert!(!is_transient_db_error(&err));
    }


}
