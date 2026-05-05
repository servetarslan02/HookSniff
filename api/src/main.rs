use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

mod auth;
mod billing;
mod config;
mod db;
pub mod error;
pub mod events;
pub mod fifo;
mod jobs;
pub mod kafka; // PostgreSQL queue wrapper (Kafka removed)
pub mod metrics;
mod middleware;
mod models;
pub mod industry;
mod rate_limit;
mod routes;
pub mod schemas;
pub mod signing;
pub mod templates;
pub mod throttle;
pub mod transform;
mod validation;
pub mod ws;

/// Initialize OpenTelemetry tracing with OTLP exporter
fn init_tracing(cfg: &config::Config) {
    use opentelemetry::trace::TracerProvider;
    use opentelemetry_sdk::trace::SdkTracerProvider;

    let otel_endpoint = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
        .unwrap_or_else(|_| "http://localhost:4317".to_string());

    let enable_otel = std::env::var("OTEL_ENABLED")
        .map(|v| v == "true" || v == "1")
        .unwrap_or(false);

    if enable_otel {
        let exporter = opentelemetry_otlp::SpanExporter::builder()
            .with_tonic()
            .with_endpoint(&otel_endpoint)
            .build()
            .expect("Failed to create OTLP exporter");

        let provider = SdkTracerProvider::builder()
            .with_simple_exporter(exporter)
            .build();

        let tracer = provider.tracer("hookrelay-api");
        opentelemetry::global::set_tracer_provider(provider);

        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);

        let use_json = std::env::var("LOG_FORMAT")
            .map(|v| v == "json")
            .unwrap_or(false);

        let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cfg.rust_log));

        if use_json {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(tracing_subscriber::fmt::layer().json())
                .with(otel_layer)
                .init();
        } else {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(tracing_subscriber::fmt::layer())
                .with(otel_layer)
                .init();
        }

        tracing::info!("OpenTelemetry tracing enabled → {}", otel_endpoint);
    } else {
        let use_json = std::env::var("LOG_FORMAT")
            .map(|v| v == "json")
            .unwrap_or(false);

        let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cfg.rust_log));

        if use_json {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(tracing_subscriber::fmt::layer().json())
                .init();
        } else {
            tracing_subscriber::registry()
                .with(env_filter)
                .with(tracing_subscriber::fmt::layer())
                .init();
        }
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

    let rate_limiter = rate_limit::RateLimiter::new(100, std::time::Duration::from_secs(60));
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

    let app = Router::new()
        .route("/health", get(routes::health::health_check))
        .route("/metrics", get(metrics::metrics_handler))
        .route("/docs", get(routes::docs::swagger_ui))
        .route("/v1/openapi.yaml", get(routes::docs::openapi_spec))
        .nest("/v1", routes::api_router())
        .layer(axum::extract::Extension(pool))
        .layer(axum::extract::Extension(cfg.clone()))
        .layer(axum::extract::Extension(rate_limiter.clone()))
        .layer(axum::extract::Extension(metrics.clone()))
        .layer(axum::extract::Extension(throttle_manager))
        .layer(axum::middleware::from_fn(rate_limit::rate_limit_middleware))
        .layer(axum::middleware::from_fn(middleware::request_id_middleware))
        .layer(axum::middleware::from_fn(metrics::metrics_middleware))
        .layer({
            let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());
            if env == "production" || env == "prod" {
                let origins: Vec<axum::http::HeaderValue> = std::env::var("CORS_ORIGINS")
                    .unwrap_or_else(|_| "https://dashboard.hookrelay.io,https://hookrelay.io".into())
                    .split(',')
                    .filter_map(|s| s.trim().parse().ok())
                    .collect();
                CorsLayer::new()
                    .allow_origin(tower_http::cors::AllowOrigin::list(origins))
                    .allow_methods([
                        axum::http::Method::GET,
                        axum::http::Method::POST,
                        axum::http::Method::DELETE,
                        axum::http::Method::OPTIONS,
                    ])
                    .allow_headers([
                        axum::http::header::AUTHORIZATION,
                        axum::http::header::CONTENT_TYPE,
                        "Idempotency-Key".parse().unwrap(),
                        "X-Request-ID".parse().unwrap(),
                        "X-Trace-ID".parse().unwrap(),
                    ])
                    .expose_headers([
                        "X-Request-ID".parse().unwrap(),
                        "X-RateLimit-Limit".parse().unwrap(),
                        "X-RateLimit-Remaining".parse().unwrap(),
                        "X-RateLimit-Reset".parse().unwrap(),
                    ])
                    .max_age(std::time::Duration::from_secs(3600))
            } else {
                CorsLayer::new()
                    .allow_origin(Any)
                    .allow_methods([
                        axum::http::Method::GET,
                        axum::http::Method::POST,
                        axum::http::Method::DELETE,
                        axum::http::Method::OPTIONS,
                    ])
                    .allow_headers([
                        axum::http::header::AUTHORIZATION,
                        axum::http::header::CONTENT_TYPE,
                        "Idempotency-Key".parse().unwrap(),
                        "X-Request-ID".parse().unwrap(),
                        "X-Trace-ID".parse().unwrap(),
                    ])
                    .expose_headers([
                        "X-Request-ID".parse().unwrap(),
                        "X-RateLimit-Limit".parse().unwrap(),
                        "X-RateLimit-Remaining".parse().unwrap(),
                        "X-RateLimit-Reset".parse().unwrap(),
                    ])
                    .max_age(std::time::Duration::from_secs(3600))
            }
        })
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(&format!("0.0.0.0:{}", cfg.port)).await?;
    tracing::info!("🚀 HookRelay API running on port {}", cfg.port);
    axum::serve(listener, app).await?;

    Ok(())
}
