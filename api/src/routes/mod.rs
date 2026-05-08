pub mod admin;
pub mod alerts;
pub mod analytics;
pub mod api_keys;
pub mod auth;
pub mod billing;
pub mod contact;
pub mod customer_portal;
pub mod delivery_details;
pub mod docs;
pub mod endpoints;
pub mod health;
pub mod health_endpoints;
pub mod inbound;
pub mod notifications;
pub mod outbound_ips;
pub mod playground;
pub mod routing;
pub mod schemas;
pub mod search;
pub mod stats;
pub mod stream;
pub mod teams;
pub mod templates;
pub mod transforms;
pub mod webhooks;


use axum::middleware as axum_middleware;
use axum::Router;

pub fn create_routes(
    pool: sqlx::PgPool,
    rate_limiter: crate::rate_limit::RateLimiter,
    throttle_manager: crate::throttle::ThrottleManager,
    metrics: std::sync::Arc<crate::metrics::Metrics>,
) -> Router {
    // Layer order matters: last .layer() = outermost middleware (runs first).
    // from_fn middleware must be INNERMOST so Extension layers inject values
    // into request extensions BEFORE the middleware tries to extract them.
    api_router()
        .layer(axum_middleware::from_fn(
            crate::rate_limit::rate_limit_middleware,
        ))
        .layer(axum::Extension(pool))
        .layer(axum::Extension(rate_limiter))
        .layer(axum::Extension(throttle_manager))
        .layer(axum::Extension(metrics))
}

pub fn api_router() -> Router {
    let protected = Router::new()
        .nest("/endpoints", endpoints::router())
        .nest("/endpoints/{endpoint_id}/transforms", transforms::router())
        .nest("/stream", stream::router())
        .nest("/webhooks", webhooks::router())
        .nest("/webhooks", delivery_details::router())
        .nest("/search", search::router())
        .nest("/alerts", alerts::router())
        .nest("/api-keys", api_keys::router())
        .nest("/playground", playground::router())
        .nest("/endpoint-health", health_endpoints::router())
        .nest("/stats", stats::router())
        .nest("/routing", routing::router())
        .nest("/analytics", analytics::router())
        .nest("/templates", templates::router())
        .nest("/schemas", schemas::router())
        .nest("/billing", billing::router())
        .nest("/portal", customer_portal::router())
        .nest("/teams", teams::router())
        .nest("/notifications", notifications::router())
        .nest("/agents", crate::agents::routes::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    // Inbound webhooks — uses API key auth (not JWT), so external services can call it
    let inbound_routes = Router::new()
        .nest("/inbound", inbound::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    let admin_routes = Router::new()
        .nest("/admin", admin::router())
        .layer(axum_middleware::from_fn(
            crate::middleware::admin_middleware,
        ))
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    Router::new()
        .nest("/auth", auth::router())
        .nest("/contact", contact::router())
        .nest("/outbound-ips", outbound_ips::router())
        .route(
            "/status",
            axum::routing::get(health::system_status).options(health::status_options),
        )
        .merge(protected)
        .merge(inbound_routes)
        .merge(admin_routes)
}
