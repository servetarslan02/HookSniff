use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::{AllowOrigin, Any, CorsLayer};
use tower_http::trace::TraceLayer;

use hooksniff_api::config;
use hooksniff_api::db;
use hooksniff_api::email;
use hooksniff_api::jobs;
use hooksniff_api::metrics;
use hooksniff_api::rate_limit;
use hooksniff_api::routes;
use hooksniff_api::telemetry;
use hooksniff_api::throttle;

#[tokio::main]
async fn main() -> Result<()> {
    let cfg = config::Config::from_env()?;

    // Initialize tracing (OpenTelemetry + structured logging)
    telemetry::init(&cfg);

    tracing::info!("Starting HookSniff API v{}", env!("CARGO_PKG_VERSION"));

    let pool = db::create_pool(&cfg.database_url).await?;

    // Initialize Prometheus metrics
    let metrics = std::sync::Arc::new(metrics::Metrics::new());

    let rate_limiter = rate_limit::create_rate_limiter().await;
    let throttle_manager = throttle::ThrottleManager::new();

    // Initialize Resend email client (None if RESEND_API_KEY not set)
    let resend_client = email::ResendClient::from_config(&cfg);

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
        }
    });

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
        .layer(axum::Extension(cfg.clone()))
        .layer(axum::Extension(metrics.clone()))
        .layer(axum::Extension(resend_client))
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
                    .allow_methods(Any)
                    .allow_headers(Any)
            } else if origins.is_empty() {
                // Development with no CORS origins = allow all
                CorsLayer::permissive()
            } else {
                CorsLayer::new()
                    .allow_origin(AllowOrigin::list(origins))
                    .allow_methods(Any)
                    .allow_headers(Any)
            }
        })
        .layer(TraceLayer::new_for_http())
        .layer(axum::middleware::from_fn(telemetry::trace_id_middleware));

    let addr = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("🚀 HookSniff API running on port {}", cfg.port);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("👋 HookSniff API shut down gracefully");

    // Flush OpenTelemetry traces before exit
    opentelemetry::global::shutdown_tracer_provider();

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
