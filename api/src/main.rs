use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

mod config;
mod db;
mod error;
mod kafka;
mod middleware;
mod models;
mod rate_limit;
mod routes;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse()?))
        .init();

    let cfg = config::Config::from_env()?;
    let pool = db::create_pool(&cfg.database_url).await?;
    let kafka_producer = kafka::create_producer(&cfg.kafka_brokers)?;

    let rate_limiter = rate_limit::RateLimiter::new(100, std::time::Duration::from_secs(60));

    let app = Router::new()
        .route("/health", get(routes::health::health_check))
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
                ])
                .max_age(std::time::Duration::from_secs(3600)),
        )
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(&format!("0.0.0.0:{}", cfg.port)).await?;
    tracing::info!("🚀 Hookrelay API running on port {}", cfg.port);
    axum::serve(listener, app).await?;

    Ok(())
}
