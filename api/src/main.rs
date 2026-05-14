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
use hooksniff_api::rate_limit;
use hooksniff_api::routes;
use hooksniff_api::telemetry;
use hooksniff_api::throttle;
use hooksniff_api::cache;

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
        let key_hex = std::env::var("ENCRYPTION_KEY").unwrap();
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
    let cache_layer = match std::env::var("REDIS_URL") {
        Ok(url) => match cache::CacheLayer::new(&url, cache::API_KEY_TTL).await {
            Ok(c) => {
                tracing::info!("✅ Redis cache layer connected");
                Some(c)
            }
            Err(e) => {
                tracing::warn!("Redis cache unavailable ({e}), running without cache");
                None
            }
        },
        Err(_) => {
            tracing::info!("REDIS_URL not set, running without cache");
            None
        }
    };

    // Initialize email provider (Resend primary → GCloud fallback → None)
    let email_provider = email::EmailProvider::from_config(&cfg);

    // Spawn retention background job (runs every 24 hours)
    let retention_pool = pool.clone();
    let retention_days = cfg.retention_days;
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            if let Err(e) = jobs::retention::run_retention(&retention_pool, retention_days).await {
                tracing::error!("❌ Retention job failed: {:?}", e);
            }
        }
    });

    // Spawn monthly webhook_count reset job
    let reset_pool = pool.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(24 * 60 * 60)).await;
            if let Err(e) = jobs::retention::reset_monthly_webhook_counts(&reset_pool).await {
                tracing::error!("❌ Monthly count reset failed: {:?}", e);
            }
        }
    });

    // Spawn cleanup job for seen_webhooks + idempotency_keys (runs every 6 hours)
    let cleanup_pool = pool.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(6 * 60 * 60)).await;
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
            // HS-261: Clean expired revoked_tokens
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
    });

    // Start auth cache cleanup (evicts expired entries every 60s)
    middleware::start_auth_cache_cleanup();

    let app = Router::new()
        // Health check
        .route("/health", get(routes::health::health_check))
        // Metrics (Prometheus)
        .route("/metrics", get(metrics::metrics_handler))
        // API v1
        .nest(
            "/v1",
            routes::create_routes(
                pool.clone(),
                rate_limiter,
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
        .layer(axum::Extension(cache_layer))
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
        .layer(axum::middleware::from_fn(middleware::security_headers_middleware));

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
