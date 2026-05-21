/// Smart routing API endpoints.
///
/// Exposes routing configuration and health status for endpoints.
use axum::extract::{Extension, Path};
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::endpoint::{Endpoint, RoutingStrategy};

pub fn router() -> Router {
    Router::new()
        .route("/{id}/routing", get(get_routing).put(update_routing))
        .route("/{id}/health", get(get_health))
}

#[derive(Debug, Serialize)]
pub struct RoutingInfo {
    pub endpoint_id: Uuid,
    pub routing_strategy: String,
    pub fallback_url: Option<String>,
    pub avg_response_ms: i32,
    pub failure_streak: i32,
    pub is_healthy: bool,
    pub resolved_url: String,
    pub using_fallback: bool,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateRoutingRequest {
    pub routing_strategy: Option<String>,
    pub fallback_url: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EndpointHealth {
    pub endpoint_id: Uuid,
    pub is_healthy: bool,
    pub failure_streak: i32,
    pub avg_response_ms: i32,
    pub last_failure_at: Option<chrono::DateTime<chrono::Utc>>,
    pub routing_strategy: String,
    pub resolved_url: String,
    pub using_fallback: bool,
}

/// Get routing configuration and status for an endpoint.
async fn get_routing(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<RoutingInfo>, AppError> {
    let endpoint =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let (resolved_url, using_fallback) = endpoint.resolve_target_url();

    Ok(Json(RoutingInfo {
        endpoint_id: endpoint.id,
        routing_strategy: endpoint.routing_strategy.clone(),
        fallback_url: endpoint.fallback_url.clone(),
        avg_response_ms: endpoint.avg_response_ms,
        failure_streak: endpoint.failure_streak,
        is_healthy: endpoint.is_healthy(),
        resolved_url,
        using_fallback,
    }))
}

/// Update routing configuration for an endpoint.
async fn update_routing(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateRoutingRequest>,
) -> Result<Json<RoutingInfo>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Validate routing strategy if provided
    if let Some(ref strategy) = req.routing_strategy {
        RoutingStrategy::parse_str(strategy); // Accept any string, default to round-robin
    }

    // Validate fallback URL if provided
    if let Some(ref url) = req.fallback_url {
        if !url.starts_with("https://") && !url.starts_with("http://") {
            return Err(AppError::BadRequest(
                "Fallback URL must start with http:// or https://".into(),
            ));
        }
        // SSRF protection: block internal/private IPs
        if let Err(e) = crate::ssrf::validate_url(url) {
            tracing::warn!("SSRF blocked on fallback_url: {} — {:?}", url, e);
            return Err(AppError::Forbidden("Internal URLs are not allowed as fallback".into()));
        }
    }

    let mut endpoint =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    // Update fields if provided
    if let Some(strategy) = req.routing_strategy {
        sqlx::query("UPDATE endpoints SET routing_strategy = $1 WHERE id = $2")
            .bind(&strategy)
            .bind(id)
            .execute(&pool)
            .await?;
        endpoint.routing_strategy = strategy;
    }

    if let Some(fallback) = req.fallback_url {
        sqlx::query("UPDATE endpoints SET fallback_url = $1 WHERE id = $2")
            .bind(&fallback)
            .bind(id)
            .execute(&pool)
            .await?;
        endpoint.fallback_url = Some(fallback);
    }

    let (resolved_url, using_fallback) = endpoint.resolve_target_url();

    Ok(Json(RoutingInfo {
        endpoint_id: endpoint.id,
        routing_strategy: endpoint.routing_strategy.clone(),
        fallback_url: endpoint.fallback_url.clone(),
        avg_response_ms: endpoint.avg_response_ms,
        failure_streak: endpoint.failure_streak,
        is_healthy: endpoint.is_healthy(),
        resolved_url,
        using_fallback,
    }))
}

/// Get endpoint health status (for monitoring/alerting).
async fn get_health(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<EndpointHealth>, AppError> {
    let endpoint =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let (resolved_url, using_fallback) = endpoint.resolve_target_url();

    Ok(Json(EndpointHealth {
        endpoint_id: endpoint.id,
        is_healthy: endpoint.is_healthy(),
        failure_streak: endpoint.failure_streak,
        avg_response_ms: endpoint.avg_response_ms,
        last_failure_at: endpoint.last_failure_at,
        routing_strategy: endpoint.routing_strategy,
        resolved_url,
        using_fallback,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── RoutingInfo ─────────────────────────────────────────

    #[test]
    fn test_routing_info_serialization() {
        let info = RoutingInfo {
            endpoint_id: Uuid::new_v4(),
            routing_strategy: "round-robin".to_string(),
            fallback_url: Some("https://fallback.example.com".to_string()),
            avg_response_ms: 150,
            failure_streak: 0,
            is_healthy: true,
            resolved_url: "https://primary.example.com".to_string(),
            using_fallback: false,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["routing_strategy"], "round-robin");
        assert_eq!(json["fallback_url"], "https://fallback.example.com");
        assert_eq!(json["avg_response_ms"], 150);
        assert!(json["is_healthy"].as_bool().unwrap());
        assert!(!json["using_fallback"].as_bool().unwrap());
    }

    #[test]
    fn test_routing_info_no_fallback() {
        let info = RoutingInfo {
            endpoint_id: Uuid::new_v4(),
            routing_strategy: "sticky".to_string(),
            fallback_url: None,
            avg_response_ms: 200,
            failure_streak: 3,
            is_healthy: false,
            resolved_url: "https://fallback.example.com".to_string(),
            using_fallback: true,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert!(json["fallback_url"].is_null());
        assert!(json["using_fallback"].as_bool().unwrap());
        assert!(!json["is_healthy"].as_bool().unwrap());
    }

    // ── UpdateRoutingRequest ────────────────────────────────

    #[test]
    fn test_update_routing_request_with_both_fields() {
        let json = r#"{"routing_strategy":"round-robin","fallback_url":"https://fb.com"}"#;
        let req: UpdateRoutingRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.routing_strategy, Some("round-robin".to_string()));
        assert_eq!(req.fallback_url, Some("https://fb.com".to_string()));
    }

    #[test]
    fn test_update_routing_request_empty() {
        let json = r#"{}"#;
        let req: UpdateRoutingRequest = serde_json::from_str(json).unwrap();
        assert!(req.routing_strategy.is_none());
        assert!(req.fallback_url.is_none());
    }

    #[test]
    fn test_update_routing_request_partial() {
        let json = r#"{"routing_strategy":"sticky"}"#;
        let req: UpdateRoutingRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.routing_strategy, Some("sticky".to_string()));
        assert!(req.fallback_url.is_none());
    }

    // ── EndpointHealth ──────────────────────────────────────

    #[test]
    fn test_endpoint_health_serialization() {
        let health = EndpointHealth {
            endpoint_id: Uuid::new_v4(),
            is_healthy: true,
            failure_streak: 0,
            avg_response_ms: 100,
            last_failure_at: None,
            routing_strategy: "round-robin".to_string(),
            resolved_url: "https://example.com".to_string(),
            using_fallback: false,
        };
        let json = serde_json::to_value(&health).unwrap();
        assert!(json["is_healthy"].as_bool().unwrap());
        assert_eq!(json["failure_streak"], 0);
        assert!(json["last_failure_at"].is_null());
    }

    #[test]
    fn test_endpoint_health_unhealthy_with_last_failure() {
        let health = EndpointHealth {
            endpoint_id: Uuid::new_v4(),
            is_healthy: false,
            failure_streak: 5,
            avg_response_ms: 5000,
            last_failure_at: Some(chrono::Utc::now()),
            routing_strategy: "sticky".to_string(),
            resolved_url: "https://fallback.com".to_string(),
            using_fallback: true,
        };
        let json = serde_json::to_value(&health).unwrap();
        assert!(!json["is_healthy"].as_bool().unwrap());
        assert_eq!(json["failure_streak"], 5);
        assert!(json["last_failure_at"].is_string());
        assert!(json["using_fallback"].as_bool().unwrap());
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_routing_router_construction() {
        let _router = router();
    }
}
