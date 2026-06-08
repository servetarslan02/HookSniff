use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::trace::TraceLayer;

use hooksniff_api::background;
use hooksniff_api::cache;
use hooksniff_api::config;
use hooksniff_api::cors;
use hooksniff_api::db;
use hooksniff_api::email;
use hooksniff_api::events;
use hooksniff_api::feature_flags;
use hooksniff_api::jobs;
use hooksniff_api::metrics;
use hooksniff_api::middleware;
use hooksniff_api::queue;
use hooksniff_api::notifications;
use hooksniff_api::rate_limit;
use hooksniff_api::routes;
use hooksniff_api::telemetry;
use hooksniff_api::throttle;

#[tokio::main]
async fn main() -> Result<()> {
    // Install ring as the default CryptoProvider for rustls 0.23+
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install rustls CryptoProvider");

    let cfg = config::Config::from_env()?;

    // Initialize tracing (OpenTelemetry + structured logging)
    let _tracer_guard = telemetry::init(&cfg);
    tracing::info!("Starting HookSniff API v{}", env!("CARGO_PKG_VERSION"));

    // Validate critical environment variables
    validate_encryption_key(&cfg)?;
    validate_jwt_config()?;

    let startup_start = std::time::Instant::now();
    let redis_startup = config::redis_startup_timeout();

    // ── Database & core services (parallel) ─────────────────────
    let db_url = cfg.database_url.clone();
    let redis_url = config::resolve_redis_url();

    let pool = db::create_pool(&db_url).await?;

    let (health_pool, rate_limiter, cache_layer) = tokio::join!(
        async {
            match db::create_health_pool(&db_url).await {
                Ok(p) => {
                    tracing::info!("✅ Health check pool created (5 connections)");
                    db::HealthPool(p)
                }
                Err(e) => {
                    tracing::warn!("Health pool creation failed ({e}), using main pool");
                    db::HealthPool(pool.clone())
                }
            }
        },
        rate_limit::create_rate_limiter(),
        async {
            if let Some(ref url) = redis_url {
                match tokio::time::timeout(redis_startup, cache::CacheLayer::new(url, cache::API_KEY_TTL))
                    .await
                {
                    Ok(Ok(c)) => Some(c),
                    Ok(Err(e)) => {
                        tracing::warn!("Redis cache unavailable ({e}), running without cache");
                        None
                    }
                    Err(_) => {
                        tracing::warn!(
                            "Redis cache connection timed out ({:?}), running without cache",
                            redis_startup
                        );
                        None
                    }
                }
            } else {
                tracing::info!("Redis URL not configured, running without cache");
                None
            }
        }
    );

    // Create read-only pool for analytics/health queries
    let readonly_pool = match db::create_readonly_pool(&db_url).await {
        Ok(p) => {
            tracing::info!("✅ Read-only pool created for analytics");
            Some(p)
        }
        Err(e) => {
            tracing::warn!("Read-only pool creation failed ({e}), using main pool for analytics");
            None
        }
    };

    routes::health::set_health_checks_ready();

    // ── Redis Streams Queue (webhook fast path) ─────────────────
    // USE_REDIS_QUEUE=true enables Redis queue; otherwise PG-only (safe rollback)
    let use_redis_queue = std::env::var("USE_REDIS_QUEUE")
        .map(|v| v == "true" || v == "1")
        .unwrap_or(false);
    let mut redis_queue: Option<queue::RedisQueue> = None;
    if use_redis_queue {
        if let Some(ref url) = redis_url {
            match tokio::time::timeout(redis_startup, queue::RedisQueue::new(url)).await {
                Ok(Ok(q)) => {
                    tracing::info!("✅ Redis Streams webhook queue active (USE_REDIS_QUEUE=true)");
                    redis_queue = Some(q);
                }
                Ok(Err(e)) => {
                    tracing::warn!("⚠️ Redis Streams queue unavailable ({}), using PG fallback", e);
                }
                Err(_) => {
                    tracing::warn!("⚠️ Redis Streams queue timed out, using PG fallback");
                }
            }
        } else {
            tracing::warn!("⚠️ USE_REDIS_QUEUE=true but REDIS_URL not set, using PG queue");
        }
    } else {
        tracing::info!("ℹ️ Redis queue disabled (USE_REDIS_QUEUE=false), using PG queue");
    }

    // Initialize global REDIS_QUEUE for handler access
    if let Some(q) = redis_queue.take() {
        let mut global = crate::db::REDIS_QUEUE.lock().expect("REDIS_QUEUE lock");
        *global = Some(q);
        tracing::info!("✅ Global REDIS_QUEUE initialized");
    }

    // ── Warm-up (background) ────────────────────────────────────
    let warmup_pool = pool.clone();
    let warmup_cache = cache_layer.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(30));
        loop {
            interval.tick().await;
            let _ = sqlx::query("SELECT 1").execute(&warmup_pool).await;
            if let Some(ref cache) = warmup_cache {
                let _ = cache.ping().await;
            }
        }
    });

    // ── Shared services ─────────────────────────────────────────
    let metrics = std::sync::Arc::new(metrics::Metrics::new());
    let throttle_manager = throttle::ThrottleManager::new();

    let feature_flag_service = feature_flags::FeatureFlagService::new(pool.clone()).await;
    let ffs_clone = feature_flag_service.clone();
    tokio::spawn(async move {
        feature_flags::feature_flag_refresher(ffs_clone).await;
    });

    let event_publisher_enabled = cfg.event_publisher_enabled;
    let (event_publisher, job_queue, sso_store) = tokio::join!(
        async {
            if !event_publisher_enabled {
                tracing::info!("Event publisher disabled (EVENT_PUBLISHER_ENABLED=false)");
                return None;
            }
            let redis_url = config::resolve_redis_url();
            let publisher = match tokio::time::timeout(
                redis_startup,
                events::EventPublisher::new(redis_url.as_deref()),
            )
            .await
            {
                Ok(p) => p,
                Err(_) => {
                    tracing::warn!(
                        "Redis EventPublisher timed out ({:?}), using local broadcast",
                        redis_startup
                    );
                    events::EventPublisher::new(None).await
                }
            };
            if publisher.has_redis() {
                tracing::info!("✅ Event publisher initialized (Redis Streams)");
            } else {
                tracing::info!("✅ Event publisher initialized (local broadcast only — no Redis)");
            }
            Some(publisher)
        },
        async {
            match config::resolve_redis_url() {
                Some(url) if !url.is_empty() => {
                    match tokio::time::timeout(redis_startup, jobs::job_queue::JobQueue::new(&url))
                        .await
                    {
                        Ok(Ok(q)) => Some(q),
                        Ok(Err(e)) => {
                            tracing::warn!(
                                "Redis job queue unavailable ({e}), falling back to tokio::spawn"
                            );
                            None
                        }
                        Err(_) => {
                            tracing::warn!(
                                "Redis job queue timed out ({:?}), falling back to tokio::spawn",
                                redis_startup
                            );
                            None
                        }
                    }
                }
                _ => {
                    tracing::info!("Redis URL not configured, using tokio::spawn for background jobs");
                    None
                }
            }
        },
        build_sso_store()
    );

    let ws_gateway = std::sync::Arc::new(hooksniff_api::ws::WsGateway::new(
        cfg.jwt_secret.clone(),
    ));
    if let Some(ref publisher) = event_publisher {
        let _bridge = hooksniff_api::ws::bridge::EventBridge::start(
            publisher.clone(),
            ws_gateway.clone(),
        );
        tracing::info!("✅ Event bridge started (EventPublisher → WsGateway)");
    }

    let qstash_client = hooksniff_api::qstash::QStashClient::from_env();
    if qstash_client.is_some() {
        tracing::info!("✅ QStash client initialized");
    }

    let r2_client = hooksniff_api::r2::R2Client::from_env();
    if r2_client.is_some() {
        tracing::info!("✅ R2 storage client initialized");
    }

    let email_provider = email::EmailProvider::from_config_with_db(&cfg, &pool).await;
    let fcm_client = notifications::FcmClient::from_config(&cfg);

    background::spawn_background_jobs(
        pool.clone(),
        job_queue.clone(),
        email_provider.clone(),
        fcm_client.clone(),
        cfg.retention_days,
    );

    middleware::start_auth_cache_cleanup();

    let pool_cortex = pool.clone();
    tokio::spawn(async move {
        hooksniff_api::cortex::scheduler::start_cortex_scheduler(pool_cortex);
    });

    // ── Build application ───────────────────────────────────────
    let startup_duration = startup_start.elapsed();
    tracing::info!(
        startup_ms = startup_duration.as_millis() as u64,
        "✅ API started"
    );

    let app = Router::new()
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
        .route("/health", get(routes::health::health_check))
        .route("/api/v1/health", get(routes::health::health_check))
        .route("/v1/health", get(routes::health::health_check))
        .route("/metrics", get(metrics::metrics_handler))
        .nest(
            "/v1",
            routes::create_routes(
                pool.clone(),
                rate_limiter.clone(),
                throttle_manager,
                metrics.clone(),
            ),
        )
        // ── Axum layer ordering ──────────────────────────────────────────────
        // `.layer(A).layer(B)` → request flows B → A → handler
        // Therefore: Extensions must be LAST (outermost) so they add data to the
        // request BEFORE any middleware tries to extract it.
        //
        // Order: routes → middleware (inner) → tower layers → Extensions (outer)
        //
        // Middleware (inner — runs AFTER extensions have added data)
        .layer(axum::middleware::from_fn(telemetry::trace_id_middleware))
        .layer(axum::middleware::from_fn(middleware::request_id_middleware))
        .layer(axum::middleware::from_fn(middleware::request_metrics_middleware))
        .layer(axum::middleware::from_fn(middleware::request_timeout_middleware))
        .layer(axum::middleware::from_fn(middleware::security_headers_middleware))
        .layer(axum::middleware::from_fn(rate_limit::rate_limit_middleware))
        .layer(axum::middleware::from_fn(middleware::ip_blocklist::ip_blocklist_middleware))
        .layer(axum::middleware::from_fn(middleware::bot_detection::bot_detection_middleware))
        .layer(axum::middleware::from_fn(middleware::ddos::ddos_middleware))
        // Tower layers (between middleware and extensions)
        .layer(tower_http::compression::CompressionLayer::new())
        .layer(tower_http::limit::RequestBodyLimitLayer::new(2 * 1024 * 1024))
        .layer(TraceLayer::new_for_http())
        .layer(cors::build_cors_layer(&cfg))
        // Extensions (outer — add data to request, so middleware can extract them)
        .layer(axum::Extension(std::sync::Arc::new(hooksniff_api::security::ddos::DdosProtection::new())))
        .layer(axum::Extension(std::sync::Arc::new(middleware::ip_blocklist::IpBlocklistCache::new())))
        .layer(axum::Extension(metrics))
        .layer(axum::Extension(rate_limiter))
        .layer(axum::Extension(sso_store))
        .layer(axum::Extension(r2_client))
        .layer(axum::Extension(qstash_client))
        .layer(axum::Extension(ws_gateway))
        .layer(axum::Extension(event_publisher))
        .layer(axum::Extension(feature_flag_service))
        .layer(axum::Extension(cache_layer))
        .layer(axum::Extension(job_queue))
        .layer(axum::Extension(email_provider))
        .layer(axum::Extension(cfg.clone()))
        .layer(axum::Extension(health_pool))
        .layer(axum::Extension(pool.clone()))
        .layer(axum::Extension(readonly_pool));

    // ── Start server — bind TCP listener FIRST so Render's startup probe sees the port ──
    let addr = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("🚀 HookSniff API running on port {}", cfg.port);

    // Bind the TCP listener immediately — Render needs to see the port open within seconds
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    
    // Mark health checks as ready AFTER full initialization but BEFORE serving
    // The health_check function returns 200 during startup when HEALTH_CHECKS_READY is false,
    // so Render's startup probe will pass immediately. Once we set this to true,
    // health_check will do full DB/Redis checks.
    routes::health::set_health_checks_ready();
    
    // Serve — all middleware layers, extensions, and routes are fully initialized here
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("👋 HookSniff API shut down gracefully");
    Ok(())
}

// ── Helpers ─────────────────────────────────────────────────────

/// Validate ENCRYPTION_KEY at startup
fn validate_encryption_key(cfg: &config::Config) -> Result<()> {
    if std::env::var("ENCRYPTION_KEY").is_err() {
        if cfg.is_production() {
            anyhow::bail!(
                "🚫 ENCRYPTION_KEY must be set in production — required for SSO secrets, API keys, etc. \
                 Generate one with: openssl rand -hex 32"
            );
        }
        tracing::warn!(
            "⚠️ ENCRYPTION_KEY not set — encrypted fields will be unavailable. \
             Generate one with: openssl rand -hex 32"
        );
    } else {
        let key_hex = std::env::var("ENCRYPTION_KEY").expect("already validated as present");
        if hex::decode(&key_hex).map(|b| b.len() != 32).unwrap_or(true) {
            anyhow::bail!(
                "🚫 ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters). \
                 Generate one with: openssl rand -hex 32"
            );
        }
    }
    Ok(())
}

/// Validate JWT RS256/HS256 configuration
fn validate_jwt_config() -> Result<()> {
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
        (true, false) | (false, true) => {
            tracing::warn!(
                "⚠️ JWT key pair incomplete — falling back to HS256. \
                 Set both JWT_PRIVATE_KEY + JWT_PUBLIC_KEY to enable RS256."
            );
        }
        (false, false) => {
            if std::env::var("JWT_SECRET").is_err() {
                anyhow::bail!(
                    "🚫 Neither JWT_PRIVATE_KEY/JWT_PUBLIC_KEY nor JWT_SECRET is set."
                );
            }
            tracing::info!("JWT HS256 active");
        }
    }
    Ok(())
}

/// Build SSO state store with optional Redis backend
async fn build_sso_store() -> routes::sso::SsoStateStore {
    let redis_startup = config::redis_startup_timeout();
    let mut sso_store = routes::sso::SsoStateStore::new();
    if let Some(url) = config::resolve_redis_url() {
        match redis::Client::open(url.as_str()) {
            Ok(client) => match tokio::time::timeout(
                redis_startup,
                redis::aio::ConnectionManager::new(client)
            ).await {
                Ok(Ok(conn)) => {
                    tracing::info!("✅ SSO state store using Redis");
                    sso_store = sso_store.with_redis(conn);
                }
                Ok(Err(e)) => tracing::warn!("SSO state Redis unavailable ({e}), using in-memory"),
                Err(_) => tracing::warn!(
                    "SSO state Redis timed out ({:?}), using in-memory",
                    redis_startup
                ),
            },
            Err(e) => tracing::warn!("SSO state Redis client error ({e}), using in-memory"),
        }
    }
    let cleanup_store = sso_store.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(300));
        loop {
            interval.tick().await;
            cleanup_store.cleanup_expired().await;
        }
    });
    sso_store
}

/// Graceful shutdown signal handler
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
