pub mod ai_center;
pub mod auth;
pub mod docs;
pub mod endpoints;
pub mod health;
pub mod routing;
pub mod stats;
pub mod webhooks;

use axum::middleware as axum_middleware;
use axum::Router;

pub fn api_router() -> Router {
    let protected = Router::new()
        .nest("/endpoints", endpoints::router())
        .nest("/webhooks", webhooks::router())
        .nest("/stats", stats::router())
        .nest("/ai", ai_center::router())
        .nest("/routing", routing::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    // Dashboard routes use JWT auth (separate from API key auth)
    // For now, dashboard routes share the same endpoints but could be
    // split into a separate /dashboard prefix if needed.

    Router::new()
        .nest("/auth", auth::router())
        .merge(protected)
}
