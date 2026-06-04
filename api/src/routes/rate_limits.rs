//! Per-Endpoint Rate Limiting API
//!
//! Allows customers to configure rate limits per endpoint.
//!
//! ## Endpoints
//!
//! - `GET /rate-limits` — List all rate limit configs
//! - `GET /rate-limits/:endpoint_id` — Get rate limit for an endpoint
//! - `POST /rate-limits/:endpoint_id` — Set rate limit for an endpoint
//! - `DELETE /rate-limits/:endpoint_id` — Remove rate limit (use defaults)

use axum::{
    extract::{Extension, Path},
    routing::{delete, get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_rate_limits))
        .route("/{endpoint_id}", get(get_rate_limit))
        .route("/{endpoint_id}", post(set_rate_limit))
        .route("/{endpoint_id}", delete(delete_rate_limit))
}

/// Rate limit configuration response
#[derive(Debug, Serialize)]
pub struct RateLimitConfigResponse {
    pub endpoint_id: Uuid,
    pub endpoint_url: String,
    pub requests_per_second: i32,
    pub requests_per_minute: i32,
    pub burst_size: i32,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Set rate limit request
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SetRateLimitRequest {
    pub requests_per_second: Option<i32>,
    pub burst_size: Option<i32>,
    pub enabled: Option<bool>,
}

/// Verify the endpoint belongs to the customer
async fn verify_endpoint_ownership(
    pool: &PgPool,
    customer_id: Uuid,
    endpoint_id: Uuid,
) -> Result<(), AppError> {
    let exists: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(endpoint_id)
            .bind(customer_id)
            .fetch_optional(pool)
            .await?;

    if exists.is_none() {
        return Err(AppError::NotFound);
    }
    Ok(())
}

/// GET /rate-limits — List all rate limit configs for the customer's endpoints
async fn list_rate_limits(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<RateLimitConfigResponse>>, AppError> {
    let rows = sqlx::query_as::<_, (Uuid, String, i32, i32, bool, DateTime<Utc>, DateTime<Utc>)>(
        "SELECT r.endpoint_id, e.url, r.requests_per_second, r.burst_size, r.enabled, r.created_at, r.updated_at
         FROM rate_limit_configs r
         INNER JOIN endpoints e ON e.id = r.endpoint_id
         WHERE e.customer_id = $1
         ORDER BY r.created_at DESC"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let configs = rows
        .into_iter()
        .map(
            |(endpoint_id, endpoint_url, requests_per_second, burst_size, enabled, created_at, updated_at)| {
                RateLimitConfigResponse {
                    endpoint_id,
                    endpoint_url,
                    requests_per_second,
                    requests_per_minute: requests_per_second * 60,
                    burst_size,
                    enabled,
                    created_at,
                    updated_at,
                }
            },
        )
        .collect();

    Ok(Json(configs))
}

/// GET /rate-limits/:endpoint_id — Get rate limit config for an endpoint
async fn get_rate_limit(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(endpoint_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    verify_endpoint_ownership(&pool, customer.id, endpoint_id).await?;

    let config = sqlx::query_as::<_, (Uuid, i32, i32, bool, DateTime<Utc>, DateTime<Utc>)>(
        "SELECT endpoint_id, requests_per_second, burst_size, enabled, created_at, updated_at
         FROM rate_limit_configs WHERE endpoint_id = $1",
    )
    .bind(endpoint_id)
    .fetch_optional(&pool)
    .await?;

    match config {
        Some((eid, rps, burst, enabled, created_at, updated_at)) => Ok(Json(serde_json::json!({
            "endpoint_id": eid,
            "requests_per_second": rps,
            "burst_size": burst,
            "enabled": enabled,
            "created_at": created_at,
            "updated_at": updated_at,
        }))),
        None => Ok(Json(serde_json::json!({
            "endpoint_id": endpoint_id,
            "requests_per_second": 10,
            "burst_size": 20,
            "enabled": true,
            "is_default": true,
        }))),
    }
}

/// POST /rate-limits/:endpoint_id — Set rate limit for an endpoint
async fn set_rate_limit(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(endpoint_id): Path<Uuid>,
    Json(req): Json<SetRateLimitRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    verify_endpoint_ownership(&pool, customer.id, endpoint_id).await?;

    let rps = req.requests_per_second.unwrap_or(10).clamp(1, 10000);
    let burst = req.burst_size.unwrap_or(20).clamp(1, 10000);
    let enabled = req.enabled.unwrap_or(true);

    sqlx::query(
        r#"INSERT INTO rate_limit_configs (endpoint_id, requests_per_second, burst_size, enabled)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (endpoint_id) DO UPDATE SET
               requests_per_second = EXCLUDED.requests_per_second,
               burst_size = EXCLUDED.burst_size,
               enabled = EXCLUDED.enabled,
               updated_at = now()"#,
    )
    .bind(endpoint_id)
    .bind(rps)
    .bind(burst)
    .bind(enabled)
    .execute(&pool)
    .await?;

    tracing::info!(
        "⚡ Rate limit set for endpoint {}: {} rps, burst {}",
        endpoint_id,
        rps,
        burst
    );

    Ok(Json(serde_json::json!({
        "updated": true,
        "endpoint_id": endpoint_id,
        "requests_per_second": rps,
        "burst_size": burst,
        "enabled": enabled,
    })))
}

/// DELETE /rate-limits/:endpoint_id — Remove rate limit (revert to defaults)
async fn delete_rate_limit(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(endpoint_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    verify_endpoint_ownership(&pool, customer.id, endpoint_id).await?;

    let result = sqlx::query("DELETE FROM rate_limit_configs WHERE endpoint_id = $1")
        .bind(endpoint_id)
        .execute(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "deleted": result.rows_affected() > 0,
        "message": "Rate limit removed. Default limits apply."
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limits_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_set_rate_limit_request_defaults() {
        let json = r#"{}"#;
        let req: SetRateLimitRequest = serde_json::from_str(json).unwrap();
        assert!(req.requests_per_second.is_none());
        assert!(req.burst_size.is_none());
    }

    #[test]
    fn test_set_rate_limit_request_full() {
        let json = r#"{"requests_per_second":100,"burst_size":200,"enabled":true}"#;
        let req: SetRateLimitRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.requests_per_second.unwrap(), 100);
        assert_eq!(req.burst_size.unwrap(), 200);
        assert!(req.enabled.unwrap());
    }

    #[test]
    fn test_rate_limit_config_response_serialization() {
        let resp = RateLimitConfigResponse {
            endpoint_id: Uuid::new_v4(),
            endpoint_url: "https://example.com/webhook".to_string(),
            requests_per_second: 50,
            requests_per_minute: 3000,
            burst_size: 100,
            enabled: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["requests_per_second"], 50);
        assert_eq!(json["burst_size"], 100);
    }
}
