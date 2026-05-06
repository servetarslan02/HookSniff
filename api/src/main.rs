use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::{AllowOrigin, Any, CorsLayer};
use tower_http::trace::TraceLayer;

mod auth;
mod billing;
mod config;
mod db;
pub mod error;
mod events;
mod fifo;
mod jobs;
pub mod metrics;
mod middleware;
mod models;
pub mod industry;
mod rate_limit;
mod retry_policy;
mod routes;
mod schemas;
mod signing;
mod ssrf;
mod templates;
mod throttle;
mod transform;
mod validation;
mod ws;

/// Initialize tracing with OpenTelemetry + structured logging
fn init_tracing(cfg: &config::Config) {
    use tracing_subscriber::prelude::*;

    let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());
    let use_json = env == "production" || env == "prod"
        || std::env::var("LOG_FORMAT").map(|v| v == "json").unwrap_or(false);

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cfg.rust_log));

    // OpenTelemetry tracing (only in production when OTEL_ENABLED=true)
    let otel_enabled = std::env::var("OTEL_ENABLED")
        .map(|v| v == "true")
        .unwrap_or(false);

    if otel_enabled {
        use opentelemetry::global;
        use opentelemetry_sdk::trace::TracerProvider;
        use opentelemetry_otlp::WithExportConfig;

        let otlp_endpoint = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
            .unwrap_or_else(|_| "http://localhost:4317".into());

        let otlp_headers = std::env::var("OTEL_EXPORTER_OTLP_HEADERS")
            .unwrap_or_default();

        // Parse headers from "Key=Value" format
        let mut header_map = std::collections::HashMap::new();
        for header in otlp_headers.split(',') {
            if let Some((key, value)) = header.trim().split_once('=') {
                header_map.insert(key.trim().to_string(), value.trim().to_string());
            }
        }

        let exporter = opentelemetry_otlp::new_exporter()
            .http()
            .with_endpoint(&otlp_endpoint)
            .with_headers(header_map)
            .build_span_exporter()
            .expect("Failed to build OTLP exporter");

        let provider = TracerProvider::builder()
            .with_simple_exporter(exporter)
            .build();

        global::set_tracer_provider(provider.clone());
        let tracer = provider.tracer("hookrelay");

        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);

        if use_json {
            let _ = tracing_subscriber::registry()
                .with(env_filter)
                .with(tracing_subscriber::fmt::layer().json())
                .with(otel_layer)
                .init();
        } else {
            let _ = tracing_subscriber::registry()
                .with(env_filter)
                .with(tracing_subscriber::fmt::layer())
                .with(otel_layer)
                .init();
        }

        tracing::info!("OpenTelemetry enabled, endpoint: {}", otlp_endpoint);
    } else if use_json {
        tracing::info!("Logging format: JSON (env={})", env);
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().json())
            .init();
    } else {
        tracing::info!("Logging format: text (env={})", env);
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer())
            .init();
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let cfg = config::Config::from_env()?;

    // Initialize tracing (OpenTelemetry + structured logging)
    init_tracing(&cfg);

    tracing::info!("Starting HookRelay API v{}", env!("CARGO_PKG_VERSION"));

    let pool = db::create_pool(&cfg.database_url).await?;

    // Initialize Prometheus metrics
    let metrics = std::sync::Arc::new(metrics::Metrics::new());

    let rate_limiter = rate_limit::create_rate_limiter().await;
    let throttle_manager = throttle::ThrottleManager::new();

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
            if let Err(e) = jobs::retention::reset_monthly_counts(&reset_pool).await {
                tracing::error!("❌ Monthly count reset failed: {:?}", e);
            }
        }
    });

    let app = Router::new()
        // Health check
        .route("/health", get(routes::health::health_check))
        // Metrics (Prometheus)
        .route("/metrics", get(routes::health::metrics))
        // API v1
        .nest("/v1", routes::create_routes(pool.clone(), rate_limiter, throttle_manager, metrics.clone()))
        // Middleware
        // CORS: restrict origins in production
        .layer({
            let origins: Vec<http::HeaderValue> = cfg.cors_origins.iter()
                .filter_map(|o| o.parse().ok())
                .collect();
            if cfg.is_production() && origins.is_empty() {
                // Production with no CORS origins = no cross-origin allowed
                CorsLayer::new()
                    .allow_origin(AllowOrigin::none())
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
        .layer(TraceLayer::new_for_http());

    let addr = format!("0.0.0.0:{}", cfg.port);
    tracing::info!("🚀 HookRelay API running on port {}", cfg.port);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("👋 HookRelay API shut down gracefully");

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
