pub mod agents;
pub mod ai_center;
pub mod alerts;
pub mod analytics;
pub mod api_keys;
pub mod auth;
pub mod billing;
pub mod delivery_details;
pub mod docs;
pub mod endpoints;
pub mod health;
pub mod health_endpoints;
pub mod marketplace;
pub mod playground;
pub mod routing;
pub mod schemas;
pub mod search;
pub mod stats;
pub mod templates;
pub mod webhooks;

use axum::middleware as axum_middleware;
use axum::Router;

pub fn api_router() -> Router {
    let protected = Router::new()
        .nest("/endpoints", endpoints::router())
        .nest("/webhooks", webhooks::router())
        .nest("/webhooks", delivery_details::router())
        .nest("/search", search::router())
        .nest("/alerts", alerts::router())
        .nest("/api-keys", api_keys::router())
        .nest("/playground", playground::router())
        .nest("/endpoint-health", health_endpoints::router())
        .nest("/stats", stats::router())
        .nest("/ai", ai_center::router())
        .nest("/agents", agents::router())
        .nest("/routing", routing::router())
        .nest("/analytics", analytics::router())
        .nest("/templates", templates::router())
        .nest("/marketplace/agents", marketplace::router())
        .nest("/schemas", schemas::router())
        .nest("/billing", billing::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    Router::new()
        .nest("/auth", auth::router())
        .merge(protected)
}
