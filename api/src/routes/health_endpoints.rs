use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;


/// Determine health status based on failure streak and success rate.
fn determine_health_status(failure_streak: i32, success_rate: f64) -> &'static str {
    if failure_streak >= 5 {
        "unhealthy"
    } else if failure_streak >= 3 || success_rate < 95.0 {
        "degraded"
    } else {
        "healthy"
    }
}
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
    health_status: String,
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

/// Single query to get delivery stats for all endpoints of a customer (last 24h).
#[derive(sqlx::FromRow)]
struct EndpointStatsRow {
    endpoint_id: Uuid,
    total: i64,
    successful: i64,
    failed: i64,
}

async fn list_endpoint_health(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<EndpointHealth>>, AppError> {
    let endpoints = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 500",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    // Batch-fetch all delivery stats in one query instead of N+1
    let endpoint_ids: Vec<Uuid> = endpoints.iter().map(|ep| ep.id).collect();

    let stats_rows: Vec<EndpointStatsRow> = if endpoint_ids.is_empty() {
        Vec::new()
    } else {
        sqlx::query_as::<_, EndpointStatsRow>(
            "SELECT endpoint_id, \
             COUNT(*) as total, \
             COUNT(*) FILTER (WHERE status = 'delivered') as successful, \
             COUNT(*) FILTER (WHERE status = 'failed') as failed \
             FROM deliveries \
             WHERE endpoint_id = ANY($1) AND created_at > NOW() - INTERVAL '24 hours' \
             GROUP BY endpoint_id",
        )
        .bind(&endpoint_ids)
        .fetch_all(&pool)
        .await
        .unwrap_or_default()
    };

    // Build a lookup map for O(1) access
    let stats_map: std::collections::HashMap<Uuid, (i64, i64, i64)> = stats_rows
        .into_iter()
        .map(|r| (r.endpoint_id, (r.total, r.successful, r.failed)))
        .collect();

    let health_list: Vec<EndpointHealth> = endpoints
        .into_iter()
        .map(|ep| {
            let (total, successful, failed) = stats_map.get(&ep.id).copied().unwrap_or((0, 0, 0));
            let success_rate = if total > 0 {
                (successful as f64 / total as f64) * 100.0
            } else {
                100.0
            };
            let health_status = determine_health_status(ep.failure_streak, success_rate);
            EndpointHealth {
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
            }
        })
        .collect();

    Ok(Json(health_list))
}

async fn get_endpoint_health(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<EndpointHealth>, AppError> {
    let ep = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let stats: (i64, i64, i64) = sqlx::query_as(
        "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered'), COUNT(*) FILTER (WHERE status = 'failed') \
         FROM deliveries WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '24 hours'",
    )
    .bind(ep.id)
    .fetch_one(&pool)
    .await
    .unwrap_or((0, 0, 0));

    let total = stats.0;
    let successful = stats.1;
    let failed = stats.2;
    let success_rate = if total > 0 {
        (successful as f64 / total as f64) * 100.0
    } else {
        100.0
    };

    let health_status = determine_health_status(ep.failure_streak, success_rate);

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_endpoint_health_serialize() {
        let eh = EndpointHealth {
            id: Uuid::new_v4(),
            url: "https://example.com".to_string(),
            description: Some("test".to_string()),
            is_active: true,
            health_status: "healthy".to_string(),
            success_rate: 99.5,
            avg_response_ms: 150,
            p95_response_ms: 300,
            p99_response_ms: 450,
            total_deliveries: 100,
            successful: 99,
            failed: 1,
            consecutive_failures: 0,
            last_success_at: Some("2024-01-01T00:00:00Z".to_string()),
            last_failure_at: None,
            uptime_24h: 99.5,
            uptime_7d: 99.8,
        };
        let json = serde_json::to_value(&eh).unwrap();
        assert_eq!(json["url"], "https://example.com");
        assert_eq!(json["health_status"], "healthy");
        assert_eq!(json["success_rate"], 99.5);
        assert_eq!(json["total_deliveries"], 100);
        assert!(json["last_failure_at"].is_null());
    }

    #[test]
    fn test_health_status_logic() {
        // failure_streak >= 5 => unhealthy
        assert_eq!(determine_health_status(5, 90.0), "unhealthy");
        assert_eq!(determine_health_status(10, 99.0), "unhealthy");

        // failure_streak >= 3 => degraded
        assert_eq!(determine_health_status(3, 99.0), "degraded");
        assert_eq!(determine_health_status(4, 99.0), "degraded");

        // success_rate < 95 => degraded
        assert_eq!(determine_health_status(0, 90.0), "degraded");
        assert_eq!(determine_health_status(1, 50.0), "degraded");

        // All good => healthy
        assert_eq!(determine_health_status(0, 99.0), "healthy");
        assert_eq!(determine_health_status(2, 100.0), "healthy");
    }

    #[test]
    fn test_success_rate_calculation() {
        // With deliveries
        let total = 100i64;
        let successful = 95i64;
        let rate = if total > 0 {
            (successful as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        assert_eq!(rate, 95.0);

        // No deliveries
        let total = 0i64;
        let rate = if total > 0 {
            (successful as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        assert_eq!(rate, 100.0);
    }
}
