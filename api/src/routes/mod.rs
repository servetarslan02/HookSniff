pub mod admin;
pub mod alerts;
pub mod analytics;
pub mod api_keys;
pub mod applications;
pub mod audit_log;
pub mod auth;
pub mod auth_2fa;
pub mod background_tasks;
pub mod billing;
pub mod broadcasts;
pub mod contact;
pub mod cortex;
pub mod coupons;
pub mod custom_domains;
pub mod customer_portal;
pub mod delivery_details;
pub mod devices;
pub mod docs;
pub mod embed;
pub mod endpoints;
pub mod environments;
pub mod events;
pub mod health;
pub mod health_endpoints;
pub mod inbound;
pub mod notifications;
pub mod operational_webhooks;
pub mod message_poller;
pub mod connectors;
pub mod integrations;
pub mod oauth;
pub mod outbound_ips;
pub mod playground;
pub mod portal_config;
pub mod rate_limits;
pub mod routing;
pub mod schemas;
pub mod search;
pub mod simulator;
pub mod service_tokens;
pub mod sso;
pub mod stats;
pub mod stream;
pub mod teams;
pub mod templates;
pub mod transforms;
pub mod webhooks;
pub mod ws;

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
        .nest("/applications", applications::router())
        .nest("/outbound-ips", outbound_ips::router())
        .nest("/endpoints", endpoints::router())
        .nest("/environments", environments::router())
        .nest("/background-tasks", background_tasks::router())
        .nest("/operational-webhooks", operational_webhooks::router())
        .nest("/message-poller", message_poller::router())
        .nest("/connectors", connectors::router())
        .nest("/integrations", integrations::router())
        .nest("/endpoints/{endpoint_id}/transforms", transforms::router())
        .nest("/stream", stream::router())
        .nest("/events", events::router())
        .nest("/webhooks", webhooks::router())
        .nest("/webhooks", delivery_details::router())
        .nest("/search", search::router())
        .nest("/alerts", alerts::router())
        .nest("/api-keys", api_keys::router())
        .nest("/playground", playground::router())
        .nest("/simulator", simulator::router())
        .nest("/embed", embed::router())
        .nest("/endpoint-health", health_endpoints::router())
        .nest("/stats", stats::router())
        .nest("/routing", routing::router())
        .nest("/analytics", analytics::router())
        .nest("/templates", templates::router())
        .nest("/schemas", schemas::router())
        .nest("/billing", billing::router())
        .nest("/coupons", coupons::router())
        .nest("/portal", customer_portal::router())
        .nest("/portal", portal_config::router())
        .nest("/teams", teams::router())
        .nest("/notifications", notifications::router())
        .nest("/broadcasts", broadcasts::router())
        .nest("/devices", devices::router())
        .nest("/audit-log", audit_log::router())
        .nest("/sso", sso::router())
        .nest("/custom-domains", custom_domains::router())
        .nest("/rate-limits", rate_limits::router())
        .nest("/service-tokens", service_tokens::router())
        .nest("/ws", ws::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    // Inbound webhooks — config routes need auth, provider routes are public (signature-verified)
    let inbound_config_routes = Router::new()
        .nest("/inbound", inbound::router())
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));
    let inbound_public_routes = Router::new()
        .nest("/inbound", inbound::public_router());

    let admin_routes = Router::new()
        .nest("/admin", admin::router())
        .nest("/cortex", cortex::router())
        .layer(axum_middleware::from_fn(
            crate::middleware::admin_middleware,
        ))
        .layer(axum_middleware::from_fn(crate::middleware::auth_middleware));

    Router::new()
        .nest("/auth", auth::router())
        .nest("/oauth", oauth::router())
        .nest("/sso", sso::public_router())
        .nest("/contact", contact::router())
        .route(
            "/status",
            axum::routing::get(health::system_status).options(health::status_options),
        )
        .route(
            "/feature-flags",
            axum::routing::get(health::public_feature_flags),
        )
        .route(
            "/plans",
            axum::routing::get(admin::public_plans),
        )
        .merge(protected)
        .merge(inbound_config_routes)
        .merge(inbound_public_routes)
        .nest("/billing", billing::webhook_router())
        .merge(admin_routes)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── api_router construction ─────────────────────────────

    #[test]
    fn test_api_router_construction() {
        // Should not panic; verifies all route registrations compile
        let _router = api_router();
    }

    // ── Individual router constructions ─────────────────────

    #[test]
    fn test_all_sub_routers_construction() {
        // Verify each sub-router can be constructed without panicking
        let _ = auth::router();
        let _ = billing::router();
        let _ = admin::router();
        let _ = teams::router();
        let _ = inbound::router();
        let _ = inbound::public_router();
        let _ = customer_portal::router();
        let _ = analytics::router();
        let _ = notifications::router();
        let _ = broadcasts::router();
        let _ = search::router();
        let _ = playground::router();
        let _ = alerts::router();
        let _ = routing::router();
        let _ = schemas::router();
        let _ = stream::router();
        let _ = outbound_ips::router();
        let _ = audit_log::router();
        let _ = sso::router();
        let _ = custom_domains::router();
        let _ = rate_limits::router();
        let _ = portal_config::router();
        let _ = oauth::router();
        let _ = environments::router();
        let _ = background_tasks::router();
        let _ = operational_webhooks::router();
        let _ = message_poller::router();
        let _ = connectors::router();
        let _ = integrations::router();
        let _ = cortex::router();
    }
}
