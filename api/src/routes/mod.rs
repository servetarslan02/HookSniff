pub mod auth;
pub mod endpoints;
pub mod health;
pub mod stats;
pub mod webhooks;

use axum::middleware as axum_middleware;
use axum::Router;

pub fn api_router() -> Router {
    let protected = Router::new()
        .nest("/endpoints", endpoints::router())
        .nest("/webhooks", webhooks::router())
        .nest("/stats", stats::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    Router::new()
        .nest("/auth", auth::router())
        .merge(protected)
}
