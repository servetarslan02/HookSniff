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

    // ── Database & Services (Parallel Initialization for Phase 7) ────────────────
    let db_url = cfg.database_url.clone();
    let redis_url = config::resolve_redis_url();

    let (pool_res, rate_limiter, cache_layer) = tokio::join!(
        db::create_pool(&db_url),
        rate_limit::create_rate_limiter(),
        async {
            if let Some(ref url) = redis_url {
                match cache::CacheLayer::new(url, cache::API_KEY_TTL).await {
                    Ok(c) => Some(c),
                    Err(e) => {
                        tracing::warn!("Redis cache unavailable ({e}), running without cache");
                        None
                    }
                }
            } else {
                tracing::info!("Redis URL not configured, running without cache");
                None
            }
        }
    );

    let pool = pool_res?;

    let health_pool = match db::create_health_pool(&db_url).await {
        Ok(p) => {
            tracing::info!("✅ Health check pool created (5 connections)");
            db::HealthPool(p)
        }
        Err(e) => {
            tracing::warn!("Health pool creation failed ({e}), using main pool");
            db::HealthPool(pool.clone())
        }
    };

    // ── Shared services ─────────────────────────────────────────
    let metrics = std::sync::Arc::new(metrics::Metrics::new());
    let throttle_manager = throttle::ThrottleManager::new();

    // Feature flags (DB-backed, refreshes every 60s)
    let feature_flag_service = feature_flags::FeatureFlagService::new(pool.clone()).await;
    let ffs_clone = feature_flag_service.clone();
    tokio::spawn(async move {
        feature_flags::feature_flag_refresher(ffs_clone).await;
    });

    // Event publisher (Redis Streams + local broadcast)
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

    // WebSocket gateway
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

    // Optional clients
    let qstash_client = hooksniff_api::qstash::QStashClient::from_env();
    if qstash_client.is_some() {
        tracing::info!("✅ QStash client initialized");
    }

    let r2_client = hooksniff_api::r2::R2Client::from_env();
    if r2_client.is_some() {
        tracing::info!("✅ R2 storage client initialized");
    }

    let email_provider = email::EmailProvider::from_config(&cfg);
    let fcm_client = notifications::FcmClient::from_config(&cfg);

    let job_queue = match config::resolve_redis_url() {
        Some(ref url) if !url.is_empty() => match jobs::job_queue::JobQueue::new(url).await {
            Ok(q) => Some(q),
            Err(e) => {
                tracing::warn!("Redis job queue unavailable ({}), falling back to tokio::spawn", e);
                None
            }
        },
        _ => {
            tracing::info!("Redis URL not configured, using tokio::spawn for background jobs");
            None
        }
    };

    // ── Background jobs ─────────────────────────────────────────
    background::spawn_background_jobs(
        pool.clone(),
        job_queue.clone(),
        email_provider.clone(),
        fcm_client.clone(),
        cfg.retention_days,
    );

    // Auth cache cleanup
    middleware::start_auth_cache_cleanup();

    // Cortex central scheduler
    hooksniff_api::cortex::scheduler::start_cortex_scheduler(pool.clone());

    // ── SSO state store ─────────────────────────────────────────
    let sso_store = build_sso_store().await;

    // ── Build application ───────────────────────────────────────
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
        .layer(axum::Extension(pool.clone()))
        .layer(axum::Extension(health_pool))
        .layer(axum::Extension(cfg.clone()))
        .layer(axum::Extension(email_provider))
        .layer(axum::Extension(job_queue))
        .layer(axum::Extension(cache_layer))
        .layer(axum::Extension(feature_flag_service))
        .layer(axum::Extension(event_publisher))
        .layer(axum::Extension(ws_gateway))
        .layer(axum::Extension(qstash_client))
        .layer(axum::Extension(r2_client))
        .layer(axum::Extension(sso_store))
        .layer(cors::build_cors_layer(&cfg))
        .layer(TraceLayer::new_for_http())
        .layer(tower_http::limit::RequestBodyLimitLayer::new(2 * 1024 * 1024))
        .layer(tower_http::compression::CompressionLayer::new())
        .layer(axum::middleware::from_fn(telemetry::trace_id_middleware))
        .layer(axum::middleware::from_fn(middleware::request_id_middleware))
        .layer(axum::middleware::from_fn(middleware::request_metrics_middleware))
        .layer(axum::middleware::from_fn(middleware::request_timeout_middleware))
        .layer(axum::middleware::from_fn(middleware::security_headers_middleware))
        .layer(axum::middleware::from_fn(rate_limit::rate_limit_middleware))
        .layer(axum::Extension(rate_limiter))
        .layer(axum::Extension(metrics));

    // ── Start server ────────────────────────────────────────────
    let addr = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("🚀 HookSniff API running on port {}", cfg.port);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
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
    let mut sso_store = routes::sso::SsoStateStore::new();
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
