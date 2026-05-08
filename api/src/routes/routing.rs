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
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
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
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateRoutingRequest>,
) -> Result<Json<RoutingInfo>, AppError> {
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
    }

    let mut endpoint =
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
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
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
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
