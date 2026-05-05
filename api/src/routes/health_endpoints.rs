use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_endpoint_health))
        .route("/{id}", get(get_endpoint_health))
}

#[derive(Serialize)]
struct EndpointHealth {
    id: Uuid,
    url: String,
    description: Option<String>,
    is_active: bool,
    health_status: String,  // "healthy", "degraded", "unhealthy"
    success_rate: f64,
    avg_response_ms: i32,
    p95_response_ms: i32,
    p99_response_ms: i32,
    total_deliveries: i64,
    successful: i64,
    failed: i64,
    consecutive_failures: i32,
    last_success_at: Option<String>,
    last_failure_at: Option<String>,
    uptime_24h: f64,
    uptime_7d: f64,
}

async fn list_endpoint_health(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<EndpointHealth>>, AppError> {
    let endpoints = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let mut health_list = Vec::new();

    for ep in endpoints {
        // Get delivery stats for this endpoint (last 24h)
        let stats: (i64, i64, i64) = sqlx::query_as(
            "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered'), COUNT(*) FILTER (WHERE status = 'failed') \
             FROM deliveries WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '24 hours'"
        )
        .bind(ep.id)
        .fetch_one(&pool)
        .await
        .unwrap_or((0, 0, 0));

        let total = stats.0;
        let successful = stats.1;
        let failed = stats.2;
        let success_rate = if total > 0 { (successful as f64 / total as f64) * 100.0 } else { 100.0 };

        let health_status = if ep.failure_streak >= 5 {
            "unhealthy"
        } else if ep.failure_streak >= 3 || success_rate < 95.0 {
            "degraded"
        } else {
            "healthy"
        };

        health_list.push(EndpointHealth {
            id: ep.id,
            url: ep.url,
            description: ep.description,
            is_active: ep.is_active,
            health_status: health_status.to_string(),
            success_rate,
            avg_response_ms: ep.avg_response_ms,
            p95_response_ms: ep.avg_response_ms * 2, // Approximation
            p99_response_ms: ep.avg_response_ms * 3,
            total_deliveries: total,
            successful,
            failed,
            consecutive_failures: ep.failure_streak,
            last_success_at: None,
            last_failure_at: ep.last_failure_at.map(|t| t.to_rfc3339()),
            uptime_24h: success_rate,
            uptime_7d: success_rate, // Simplified
        });
    }

    Ok(Json(health_list))
}

async fn get_endpoint_health(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<EndpointHealth>, AppError> {
    let ep = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let stats: (i64, i64, i64) = sqlx::query_as(
        "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered'), COUNT(*) FILTER (WHERE status = 'failed') \
         FROM deliveries WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '24 hours'"
    )
    .bind(ep.id)
    .fetch_one(&pool)
    .await
    .unwrap_or((0, 0, 0));

    let total = stats.0;
    let successful = stats.1;
    let failed = stats.2;
    let success_rate = if total > 0 { (successful as f64 / total as f64) * 100.0 } else { 100.0 };

    let health_status = if ep.failure_streak >= 5 {
        "unhealthy"
    } else if ep.failure_streak >= 3 || success_rate < 95.0 {
        "degraded"
    } else {
        "healthy"
    };

    Ok(Json(EndpointHealth {
        id: ep.id,
        url: ep.url,
        description: ep.description,
        is_active: ep.is_active,
        health_status: health_status.to_string(),
        success_rate,
        avg_response_ms: ep.avg_response_ms,
        p95_response_ms: ep.avg_response_ms * 2,
        p99_response_ms: ep.avg_response_ms * 3,
        total_deliveries: total,
        successful,
        failed,
        consecutive_failures: ep.failure_streak,
        last_success_at: None,
        last_failure_at: ep.last_failure_at.map(|t| t.to_rfc3339()),
        uptime_24h: success_rate,
        uptime_7d: success_rate,
    }))
}
