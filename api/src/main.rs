use anyhow::Result;
use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

mod config;
mod db;
mod error;
mod kafka;
mod middleware;
mod models;
mod routes;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("info".parse()?))
        .init();

    let cfg = config::Config::from_env()?;
    let pool = db::create_pool(&cfg.database_url).await?;
    let kafka_producer = kafka::create_producer(&cfg.kafka_brokers)?;

    let app = Router::new()
        .route("/health", get(routes::health::health_check))
        .nest("/v1", routes::api_router())
        .layer(axum::extract::Extension(pool))
        .layer(axum::extract::Extension(kafka_producer))
        .layer(axum::extract::Extension(cfg.clone()))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(&format!("0.0.0.0:{}", cfg.port)).await?;
    tracing::info!("🚀 Hookrelay API running on port {}", cfg.port);
    axum::serve(listener, app).await?;

    Ok(())
}
