// TODO (Item 289): Split main.rs into focused modules.
//   Current: 277-line main.rs handles config, DB pool, middleware, CORS,
//   background jobs, and server startup all in one function.
//   Proposed split:
//   - api/src/startup.rs — server builder, listener, graceful shutdown
//   - api/src/middleware_stack.rs — CORS, tracing, body limit, request ID
//   - api/src/jobs.rs — background task spawning (retention, cleanup, etc.)
//   - main.rs becomes a thin entrypoint that orchestrates the above

use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};
use tower_http::trace::TraceLayer;

use hooksniff_api::config;
use hooksniff_api::db;
use hooksniff_api::email;
use hooksniff_api::jobs;
use hooksniff_api::metrics;
use hooksniff_api::middleware;
use hooksniff_api::notifications;
use hooksniff_api::rate_limit;
use hooksniff_api::routes;
use hooksniff_api::telemetry;
use hooksniff_api::throttle;
use hooksniff_api::cache;
use hooksniff_api::events;
use hooksniff_api::feature_flags;

#[tokio::main]
async fn main() -> Result<()> {
    // Install ring as the default CryptoProvider for rustls 0.23+
    // Must happen before ANY TLS connection (HTTP clients, DB, Redis, OTEL)
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install rustls CryptoProvider");

    let cfg = config::Config::from_env()?;

    // Initialize tracing (OpenTelemetry + structured logging)
    // Guard flushes OTel traces on drop — keep alive until shutdown
    let _tracer_guard = telemetry::init(&cfg);

    tracing::info!("Starting HookSniff API v{}", env!("CARGO_PKG_VERSION"));

    // HS-263: Validate ENCRYPTION_KEY at startup
    // In production, fail hard if missing. In dev, warn and continue.
    if std::env::var("ENCRYPTION_KEY").is_err() {
        if cfg.is_production() {
            anyhow::bail!(
                "🚫 ENCRYPTION_KEY must be set in production — required for SSO secrets, API keys, etc. \
                 Generate one with: openssl rand -hex 32"
            );
        }
        tracing::warn!(
            "⚠️ ENCRYPTION_KEY not set — encrypted fields (SSO client_secret, etc.) will be unavailable. \
             Generate one with: openssl rand -hex 32"
        );
    } else {
        // Validate the key format (must be 64 hex chars = 32 bytes)
        let key_hex = std::env::var("ENCRYPTION_KEY").expect("ENCRYPTION_KEY already validated as present");
        if hex::decode(&key_hex).map(|b| b.len() != 32).unwrap_or(true) {
            anyhow::bail!(
                "🚫 ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters). \
                 Generate one with: openssl rand -hex 32"
            );
        }
    }

    // Item 260: Validate JWT RS256 key configuration
    let has_private_key = std::env::var("JWT_PRIVATE_KEY")
        .map(|v| !v.is_empty())
        .unwrap_or(false);
    let has_public_key = std::env::var("JWT_PUBLIC_KEY")
        .map(|v| !v.is_empty())
        .unwrap_or(false);

    match (has_private_key, has_public_key) {
        (true, true) => {
            tracing::info!("✅ JWT RS256 active — tokens signed with RSA asymmetric keys");
        }
        (true, false) => {
            tracing::warn!(
                "⚠️ JWT_PRIVATE_KEY set but JWT_PUBLIC_KEY missing — falling back to HS256. \
                 Set both to enable RS256: openssl genrsa -out jwt_private.pem 2048 && \
                 openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem"
            );
        }
        (false, true) => {
            tracing::warn!(
                "⚠️ JWT_PUBLIC_KEY set but JWT_PRIVATE_KEY missing — falling back to HS256. \
                 Set both to enable RS256."
            );
        }
        (false, false) => {
            // HS256 mode — check that JWT_SECRET is set
            if std::env::var("JWT_SECRET").is_err() {
                anyhow::bail!(
                    "🚫 Neither JWT_PRIVATE_KEY/JWT_PUBLIC_KEY nor JWT_SECRET is set. \
                     Set JWT_SECRET for HS256 or both RSA keys for RS256."
                );
            }
            tracing::info!("JWT HS256 active — set JWT_PRIVATE_KEY + JWT_PUBLIC_KEY to upgrade to RS256");
        }
    }

    let pool = db::create_pool(&cfg.database_url).await?;

    // Health-check pool (5 connections, independent of main pool)
    let health_pool = match db::create_health_pool(&cfg.database_url).await {
        Ok(p) => {
            tracing::info!("✅ Health check pool created (5 connections)");
            db::HealthPool(p)
        }
        Err(e) => {
            tracing::warn!("Health pool creation failed ({e}), using main pool");
            db::HealthPool(pool.clone())
        }
    };

    // Initialize Prometheus metrics
    let metrics = std::sync::Arc::new(metrics::Metrics::new());

    let rate_limiter = rate_limit::create_rate_limiter().await;
    let throttle_manager = throttle::ThrottleManager::new();

    // Redis cache layer (for API key validation, endpoint metadata, etc.)
    let cache_layer = match config::resolve_redis_url() {
        Some(url) => match cache::CacheLayer::new(&url, cache::API_KEY_TTL).await {
            Ok(c) => {
                tracing::info!("✅ Redis cache layer connected");
                Some(c)
            }
            Err(e) => {
                tracing::warn!("Redis cache unavailable ({e}), running without cache");
                None
            }
        },
        None => {
            tracing::info!("Redis URL not configured (REDIS_URL or UPSTASH_REDIS_REST_URL), running without cache");
            None
        }
    };

    // Feature flag service (loads from DB, refreshes every 60s)
    let feature_flag_service = feature_flags::FeatureFlagService::new(pool.clone()).await;
    let ffs_clone = feature_flag_service.clone();
    tokio::spawn(async move {
        feature_flags::feature_flag_refresher(ffs_clone).await;
    });

    // Initialize event publisher (Redis Streams + local broadcast)
    let event_publisher = if cfg.event_publisher_enabled {
        let redis_url = config::resolve_redis_url();
        let publisher = events::EventPublisher::new(redis_url.as_deref()).await;
        if publisher.has_redis() {
            tracing::info!("✅ Event publisher initialized (Redis Streams)");
        } else {
            tracing::info!("✅ Event publisher initialized (local broadcast only — no Redis)");
        }
        Some(publisher)
    } else {
        tracing::info!("Event publisher disabled (EVENT_PUBLISHER_ENABLED=false)");
        None
    };

    // Initialize WebSocket gateway
    let ws_gateway = std::sync::Arc::new(hooksniff_api::ws::WsGateway::new(
        cfg.jwt_secret.clone(),
    ));

    // Start EventPublisher → WsGateway bridge
    if let Some(ref publisher) = event_publisher {
        let _bridge = hooksniff_api::ws::bridge::EventBridge::start(
            publisher.clone(),
            ws_gateway.clone(),
        );
        tracing::info!("✅ Event bridge started (EventPublisher → WsGateway)");
    }

    // Initialize QStash client (if QSTASH_TOKEN is set)
    let qstash_client = match hooksniff_api::qstash::QStashClient::from_env() {
        Some(client) => {
            tracing::info!("✅ QStash client initialized (reliable message delivery)");
            Some(client)
        }
        None => {
            tracing::info!("QSTASH_TOKEN not set, QStash disabled");
            None
        }
    };

    // Initialize R2 storage client (if CF_ACCOUNT_ID and CF_R2_TOKEN are set)
    let r2_client = match hooksniff_api::r2::R2Client::from_env() {
        Some(client) => {
            tracing::info!("✅ R2 storage client initialized (dead letter archive)");
            Some(client)
        }
        None => {
            tracing::info!("CF_ACCOUNT_ID/CF_R2_TOKEN not set, R2 storage disabled");
            None
        }
    };

    // Initialize email provider (Resend primary → GCloud fallback → None)
    let email_provider = email::EmailProvider::from_config(&cfg);

    // Initialize FCM client for push notifications
    let fcm_client = notifications::FcmClient::from_config(&cfg);

    // Initialize Redis job queue (if Redis URL is available)
    let job_queue = match config::resolve_redis_url() {
        Some(ref url) if !url.is_empty() => {
            match jobs::job_queue::JobQueue::new(url).await {
                Ok(q) => Some(q),
                Err(e) => {
                    tracing::warn!("Redis job queue unavailable ({}), falling back to tokio::spawn", e);
                    None
                }
            }
        }
        _ => {
            tracing::info!("Redis URL not configured, using tokio::spawn for background jobs");
            None
        }
    };

    // Spawn job queue worker (processes email + notification jobs from Redis)
    if let Some(ref queue) = job_queue {
        let worker_queue = queue.clone();
        let worker_email = email_provider.clone();
        let worker_fcm = fcm_client.clone();
        let worker_pool = pool.clone();
        tokio::spawn(async move {
            worker_queue
                .process_jobs(worker_email, worker_fcm, worker_pool)
                .await;
        });

        // Spawn delayed job processor (moves ready delayed jobs to main queue)
        let _delayed_queue = queue.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                // We need a separate connection for delayed job processing
                // The job_queue's internal conn is used by the worker, so we create a new one
                if let Some(ref url) = config::resolve_redis_url() {
                    if let Ok(client) = redis::Client::open(url.as_str()) {
                        if let Ok(mut conn) = redis::aio::ConnectionManager::new(client).await {
                            if let Err(e) = jobs::job_queue::process_delayed_jobs(&mut conn).await {
                                tracing::warn!("Delayed job processor error: {:?}", e);
                            }
                        }
                    }
                }
            }
        });

        tracing::info!("✅ Redis job queue worker started");
    }

    // Scheduled background jobs with distributed locks
    // Only ONE instance runs each job (prevents duplicate work in multi-instance deployments)
    let sched_pool = pool.clone();
    let sched_queue = job_queue.clone();
    let retention_days = cfg.retention_days;
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;

            // Use Redis lock if available, otherwise run on every instance
            let should_run = if let Some(ref queue) = sched_queue {
                queue.try_acquire_lock("retention", 3600).await.unwrap_or(true)
            } else {
                true
            };

            if should_run {
                if let Err(e) = jobs::retention::run_retention(&sched_pool, retention_days).await {
                    tracing::error!("❌ Retention job failed: {:?}", e);
                }
            }
        }
    });

    // Monthly webhook count reset (distributed lock: 1 hour TTL)
    let reset_pool = pool.clone();
    let reset_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;

            let should_run = if let Some(ref queue) = reset_queue {
                queue.try_acquire_lock("monthly_reset", 3600).await.unwrap_or(true)
            } else {
                true
            };

            if should_run {
                if let Err(e) = jobs::retention::reset_monthly_webhook_counts(&reset_pool).await {
                    tracing::error!("❌ Monthly count reset failed: {:?}", e);
                }
            }
        }
    });

    // Daily webhook count reset (every 24 hours)
    let daily_reset_pool = pool.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            if let Err(e) = jobs::retention::reset_daily_webhook_counts(&daily_reset_pool).await {
                tracing::error!("❌ Daily count reset failed: {:?}", e);
            }
        }
    });

    // Cleanup: seen_webhooks + idempotency_keys + revoked_tokens (every 6 hours, distributed lock)
    let cleanup_pool = pool.clone();
    let cleanup_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(6 * 60 * 60)).await;

            let should_run = if let Some(ref queue) = cleanup_queue {
                queue.try_acquire_lock("cleanup_6h", 1800).await.unwrap_or(true)
            } else {
                true
            };

            if should_run {
                // Clean expired seen_webhooks
                match sqlx::query("DELETE FROM seen_webhooks WHERE expires_at < now()")
                    .execute(&cleanup_pool)
                    .await
                {
                    Ok(r) => {
                        let deleted = r.rows_affected();
                        if deleted > 0 {
                            tracing::info!("🧹 Cleaned {} expired seen_webhooks", deleted);
                        }
                    }
                    Err(e) => tracing::error!("❌ seen_webhooks cleanup failed: {:?}", e),
                }
                // Clean expired idempotency_keys
                match sqlx::query("DELETE FROM idempotency_keys WHERE expires_at < now()")
                    .execute(&cleanup_pool)
                    .await
                {
                    Ok(r) => {
                        let deleted = r.rows_affected();
                        if deleted > 0 {
                            tracing::info!("🧹 Cleaned {} expired idempotency_keys", deleted);
                        }
                    }
                    Err(e) => tracing::error!("❌ idempotency_keys cleanup failed: {:?}", e),
                }
                // Clean expired revoked_tokens
                match sqlx::query("DELETE FROM revoked_tokens WHERE expires_at < now()")
                    .execute(&cleanup_pool)
                    .await
                {
                    Ok(r) => {
                        let deleted = r.rows_affected();
                        if deleted > 0 {
                            tracing::info!("🧹 Cleaned {} expired revoked_tokens", deleted);
                        }
                    }
                    Err(e) => tracing::error!("❌ revoked_tokens cleanup failed: {:?}", e),
                }
            }
        }
    });

    // Metrics push job: push business metrics to Grafana Cloud every 60s (replaces monitor.sh)
    let metrics_pool = pool.clone();
    tokio::spawn(async move {
        jobs::metrics_push::run(metrics_pool).await;
    });

    // Dunning job: send payment reminder emails + in-app notifications daily
    // Sends emails at 3, 2, 1 days before grace period expiry
    let dunning_pool = pool.clone();
    let dunning_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;

            let should_run = if let Some(ref queue) = dunning_queue {
                queue.try_acquire_lock("dunning", 3600).await.unwrap_or(true)
            } else {
                true
            };

            if should_run {
                // Initialize Resend email client for dunning
                if let Some(email_client) = hooksniff_api::resend_email::ResendEmailClient::from_env() {
                    match jobs::dunning::run_dunning(&dunning_pool, &email_client).await {
                        Ok(sent) => {
                            if sent > 0 {
                                tracing::info!("📧 Dunning: {} payment reminder emails sent", sent);
                            }
                        }
                        Err(e) => tracing::error!("❌ Dunning job failed: {:?}", e),
                    }
                } else {
                    tracing::warn!("⚠️ Resend not configured, dunning emails skipped");
                }

                // Also attempt payment retries for customers in grace period
                match jobs::dunning::retry_failed_payments(&dunning_pool).await {
                    Ok(retried) => {
                        if retried > 0 {
                            tracing::info!("🔄 Payment retry: {} retries attempted", retried);
                        }
                    }
                    Err(e) => tracing::error!("❌ Payment retry job failed: {:?}", e),
                }

                // Activate pause for customers whose period ended with pause scheduled
                match jobs::dunning::activate_paused_subscriptions(&dunning_pool).await {
                    Ok(count) => {
                        if count > 0 {
                            tracing::info!("⏸️ Activated pause for {} subscriptions", count);
                        }
                    }
                    Err(e) => tracing::error!("❌ Pause activation job failed: {:?}", e),
                }

                // Expire paused subscriptions that exceeded 90 days
                match jobs::dunning::expire_paused_subscriptions(&dunning_pool).await {
                    Ok(count) => {
                        if count > 0 {
                            tracing::info!("⏰ Expired {} paused subscriptions", count);
                        }
                    }
                    Err(e) => tracing::error!("❌ Pause expiry job failed: {:?}", e),
                }
            }
        }
    });

    // Alert evaluation worker: check alert rules every 5 minutes
    let alert_pool = pool.clone();
    let alert_queue = job_queue.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(5 * 60)).await;

            let should_run = if let Some(ref queue) = alert_queue {
                queue.try_acquire_lock("alert_eval", 300).await.unwrap_or(true)
            } else {
                true
            };

            if should_run {
                if let Some(email_client) = hooksniff_api::resend_email::ResendEmailClient::from_env() {
                    match jobs::alert_eval::run_alert_evaluation(&alert_pool, &email_client).await {
                        Ok(triggered) => {
                            if triggered > 0 {
                                tracing::info!("🚨 Alert eval: {} alerts triggered", triggered);
                            }
                        }
                        Err(e) => tracing::error!("❌ Alert evaluation job failed: {:?}", e),
                    }
                } else {
                    tracing::warn!("⚠️ Resend not configured, alert emails skipped");
                }
            }
        }
    });

    // Start auth cache cleanup (evicts expired entries every 60s)
    middleware::start_auth_cache_cleanup();

    let app = Router::new()
        // Root — service info
        .route(
            "/",
            get(|| async {
                axum::Json(serde_json::json!({
                    "service": "HookSniff",
                    "version": env!("CARGO_PKG_VERSION"),
                    "status": "running",
                    "docs": "/v1/docs",
                    "health": "/health"
                }))
            }),
        )
        // Health check
        .route("/health", get(routes::health::health_check))
        // API v1 health alias (some clients check /api/v1/health)
        .route("/api/v1/health", get(routes::health::health_check))
        // v1 health alias (edge proxy forwards /v1/health)
        .route("/v1/health", get(routes::health::health_check))
        // Metrics (Prometheus)
        .route("/metrics", get(metrics::metrics_handler))
        // API v1
        .nest(
            "/v1",
            routes::create_routes(
                pool.clone(),
                rate_limiter.clone(),
                throttle_manager,
                metrics.clone(),
            ),
        )
        // Middleware
        // CORS: restrict origins in production
        .layer(axum::Extension(pool.clone()))
        .layer(axum::Extension(health_pool))
        .layer(axum::Extension(cfg.clone()))
        .layer(axum::Extension(metrics.clone()))
        .layer(axum::Extension(email_provider))
        .layer(axum::Extension(job_queue))
        .layer(axum::Extension(cache_layer))
        .layer(axum::Extension(feature_flag_service))
        .layer(axum::Extension(event_publisher))
        .layer(axum::Extension(ws_gateway))
        .layer(axum::Extension(qstash_client))
        .layer(axum::Extension(r2_client))
        .layer(axum::Extension({
            let mut sso_store = sso::SsoStateStore::new();
            if let Some(url) = config::resolve_redis_url() {
                match redis::Client::open(url.as_str()) {
                    Ok(client) => match redis::aio::ConnectionManager::new(client).await {
                        Ok(conn) => {
                            tracing::info!("✅ SSO state store using Redis");
                            sso_store = sso_store.with_redis(conn);
                        }
                        Err(e) => tracing::warn!("SSO state Redis unavailable ({e}), using in-memory"),
                    },
                    Err(e) => tracing::warn!("SSO state Redis client error ({e}), using in-memory"),
                }
            }
            sso_store
        }))
        .layer({
            let origins: Vec<axum::http::HeaderValue> = cfg
                .cors_origins
                .iter()
                .filter_map(|o| o.parse().ok())
                .collect();
            if cfg.is_production() && origins.is_empty() {
                // Production with no CORS origins configured — allow dashboard by default
                let default_origins: Vec<axum::http::HeaderValue> = [
                    "https://hooksniff.vercel.app",
                    "https://www.hooksniff.vercel.app",
                ]
                .iter()
                .filter_map(|o| o.parse().ok())
                .collect();
                tracing::warn!(
                    "⚠️ CORS_ORIGINS not set in production — defaulting to dashboard origins"
                );
                CorsLayer::new()
                    .allow_origin(AllowOrigin::list(default_origins))
                    .allow_methods([
                        axum::http::Method::GET,
                        axum::http::Method::POST,
                        axum::http::Method::PUT,
                        axum::http::Method::DELETE,
                        axum::http::Method::PATCH,
                        axum::http::Method::OPTIONS,
                    ])
                    .allow_headers(AllowHeaders::list([
                        axum::http::header::AUTHORIZATION,
                        axum::http::header::CONTENT_TYPE,
                        axum::http::header::ACCEPT,
                        axum::http::header::ORIGIN,
                        axum::http::header::HeaderName::from_static("x-api-key"),
                        axum::http::header::HeaderName::from_static("x-request-id"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-id"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-signature"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-timestamp"),
                    ]))
                    .allow_credentials(true)
                    .expose_headers([
                        axum::http::header::HeaderName::from_static("x-trace-id"),
                        axum::http::header::HeaderName::from_static("x-request-id"),
                        axum::http::header::ETAG,
                    ])
            } else if origins.is_empty() {
                // Development — allow localhost only
                let dev_origins: Vec<axum::http::HeaderValue> = [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                ]
                .iter()
                .filter_map(|o| o.parse().ok())
                .collect();
                CorsLayer::new()
                    .allow_origin(AllowOrigin::list(dev_origins))
                    .allow_methods([
                        axum::http::Method::GET,
                        axum::http::Method::POST,
                        axum::http::Method::PUT,
                        axum::http::Method::DELETE,
                        axum::http::Method::PATCH,
                        axum::http::Method::OPTIONS,
                    ])
                    .allow_headers(AllowHeaders::list([
                        axum::http::header::AUTHORIZATION,
                        axum::http::header::CONTENT_TYPE,
                        axum::http::header::ACCEPT,
                        axum::http::header::ORIGIN,
                        axum::http::header::HeaderName::from_static("x-api-key"),
                        axum::http::header::HeaderName::from_static("x-request-id"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-id"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-signature"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-timestamp"),
                    ]))
                    .allow_credentials(true)
                    .expose_headers([
                        axum::http::header::HeaderName::from_static("x-trace-id"),
                        axum::http::header::HeaderName::from_static("x-request-id"),
                        axum::http::header::ETAG,
                    ])
            } else {
                CorsLayer::new()
                    .allow_origin(AllowOrigin::list(origins))
                    .allow_methods([
                        axum::http::Method::GET,
                        axum::http::Method::POST,
                        axum::http::Method::PUT,
                        axum::http::Method::DELETE,
                        axum::http::Method::PATCH,
                        axum::http::Method::OPTIONS,
                    ])
                    .allow_headers(AllowHeaders::list([
                        axum::http::header::AUTHORIZATION,
                        axum::http::header::CONTENT_TYPE,
                        axum::http::header::ACCEPT,
                        axum::http::header::ORIGIN,
                        axum::http::header::HeaderName::from_static("x-api-key"),
                        axum::http::header::HeaderName::from_static("x-request-id"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-id"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-signature"),
                        axum::http::header::HeaderName::from_static("x-hooksniff-timestamp"),
                    ]))
                    .allow_credentials(true)
                    .expose_headers([
                        axum::http::header::HeaderName::from_static("x-trace-id"),
                        axum::http::header::HeaderName::from_static("x-request-id"),
                        axum::http::header::ETAG,
                    ])
            }
        })
        .layer(TraceLayer::new_for_http())
        .layer(tower_http::limit::RequestBodyLimitLayer::new(2 * 1024 * 1024)) // 2MB global body limit
        .layer(tower_http::compression::CompressionLayer::new()) // gzip response compression
        .layer(axum::middleware::from_fn(telemetry::trace_id_middleware))
        .layer(axum::middleware::from_fn(middleware::request_id_middleware))
        .layer(axum::middleware::from_fn(middleware::request_metrics_middleware))
        .layer(axum::middleware::from_fn(middleware::request_timeout_middleware))
        .layer(axum::middleware::from_fn(middleware::security_headers_middleware))
        .layer(axum::middleware::from_fn(rate_limit::rate_limit_middleware))
        .layer(axum::Extension(rate_limiter));

    let addr = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("🚀 HookSniff API running on port {}", cfg.port);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("👋 HookSniff API shut down gracefully");

    // _tracer_guard drops here → OTel traces flushed automatically

    Ok(())
}

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
