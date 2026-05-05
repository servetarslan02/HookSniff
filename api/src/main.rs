use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;


mod auth;
mod config;
mod db;
pub mod error;
pub mod events;
mod jobs;
mod kafka;
mod middleware;
mod models;
pub mod industry;
mod rate_limit;
mod routes;
pub mod schemas;
pub mod signing;
pub mod templates;
pub mod transform;
mod validation;
pub mod ws;

#[tokio::main]
async fn main() -> Result<()> {
    let cfg = config::Config::from_env()?;

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cfg.rust_log)),
        )
        .init();
    let pool = db::create_pool(&cfg.database_url).await?;
    let kafka_producer = kafka::create_producer(&cfg.kafka_brokers)?;

    let rate_limiter = rate_limit::RateLimiter::new(100, std::time::Duration::from_secs(60));

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
        .route("/docs", get(routes::docs::swagger_ui))
        .route("/v1/openapi.yaml", get(routes::docs::openapi_spec))
        .nest("/v1", routes::api_router())
        .layer(axum::extract::Extension(pool))
        .layer(axum::extract::Extension(kafka_producer))
        .layer(axum::extract::Extension(cfg.clone()))
        .layer(axum::extract::Extension(rate_limiter))
        .layer(
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
                    // Allow Idempotency-Key header
                    "Idempotency-Key".parse().unwrap(),
                ])
                .max_age(std::time::Duration::from_secs(3600)),
        )
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(&format!("0.0.0.0:{}", cfg.port)).await?;
    tracing::info!("🚀 Hookrelay API running on port {}", cfg.port);
    axum::serve(listener, app).await?;

    Ok(())
}
