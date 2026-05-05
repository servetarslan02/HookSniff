pub mod auth;
pub mod endpoints;
pub mod health;
pub mod stats;
pub mod webhooks;

use axum::middleware as axum_middleware;
use axum::Router;
use sqlx::PgPool;

pub fn api_router() -> Router {
    Router::new()
        .nest("/auth", auth::router()) // Public: registration
        .nest("/endpoints", endpoints::router())
        .nest("/webhooks", webhooks::router())
        .nest("/stats", stats::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware))
}
