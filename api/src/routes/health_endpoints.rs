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

/// Delivery stats per endpoint (24h window).
#[derive(sqlx::FromRow)]
struct EndpointStatsRow {
    endpoint_id: Uuid,
    total: i64,
    successful: i64,
    failed: i64,
}

/// Percentile stats from delivery_attempts (24h window).
#[derive(sqlx::FromRow)]
struct PercentileRow {
    endpoint_id: Uuid,
    p95_ms: Option<f64>,
    p99_ms: Option<f64>,
    avg_ms: Option<f64>,
}

/// 7-day delivery stats per endpoint.
#[derive(sqlx::FromRow)]
struct Stats7dRow {
    endpoint_id: Uuid,
    total: i64,
    successful: i64,
}

/// Last successful delivery per endpoint.
#[derive(sqlx::FromRow)]
struct LastSuccessRow {
    endpoint_id: Uuid,
    last_success_at: chrono::DateTime<chrono::Utc>,
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

    let endpoint_ids: Vec<Uuid> = endpoints.iter().map(|ep| ep.id).collect();

    if endpoint_ids.is_empty() {
        return Ok(Json(vec![]));
    }

    // 1. Delivery stats (24h)
    let stats_rows: Vec<EndpointStatsRow> = sqlx::query_as::<_, EndpointStatsRow>(
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
    .unwrap_or_default();

    // 2. Real p95/p99 from delivery_attempts (24h)
    let percentile_rows: Vec<PercentileRow> = sqlx::query_as::<_, PercentileRow>(
        "SELECT d.endpoint_id, \
         percentile_cont(0.95) WITHIN GROUP (ORDER BY da.duration_ms) as p95_ms, \
         percentile_cont(0.99) WITHIN GROUP (ORDER BY da.duration_ms) as p99_ms, \
         AVG(da.duration_ms) as avg_ms \
         FROM delivery_attempts da \
         JOIN deliveries d ON d.id = da.delivery_id \
         WHERE d.endpoint_id = ANY($1) AND da.created_at > NOW() - INTERVAL '24 hours' \
         GROUP BY d.endpoint_id",
    )
    .bind(&endpoint_ids)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    // 3. 7-day delivery stats
    let stats_7d_rows: Vec<Stats7dRow> = sqlx::query_as::<_, Stats7dRow>(
        "SELECT endpoint_id, \
         COUNT(*) as total, \
         COUNT(*) FILTER (WHERE status = 'delivered') as successful \
         FROM deliveries \
         WHERE endpoint_id = ANY($1) AND created_at > NOW() - INTERVAL '7 days' \
         GROUP BY endpoint_id",
    )
    .bind(&endpoint_ids)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    // 4. Last successful delivery per endpoint
    let last_success_rows: Vec<LastSuccessRow> = sqlx::query_as::<_, LastSuccessRow>(
        "SELECT endpoint_id, MAX(created_at) as last_success_at \
         FROM deliveries \
         WHERE endpoint_id = ANY($1) AND status = 'delivered' \
         GROUP BY endpoint_id",
    )
    .bind(&endpoint_ids)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    // Build lookup maps
    let stats_map: std::collections::HashMap<Uuid, (i64, i64, i64)> = stats_rows
        .into_iter()
        .map(|r| (r.endpoint_id, (r.total, r.successful, r.failed)))
        .collect();

    let percentile_map: std::collections::HashMap<Uuid, (f64, f64, f64)> = percentile_rows
        .into_iter()
        .map(|r| {
            let p95 = r.p95_ms.unwrap_or(0.0);
            let p99 = r.p99_ms.unwrap_or(0.0);
            let avg = r.avg_ms.unwrap_or(0.0);
            (r.endpoint_id, (p95, p99, avg))
        })
        .collect();

    let stats_7d_map: std::collections::HashMap<Uuid, (i64, i64)> = stats_7d_rows
        .into_iter()
        .map(|r| (r.endpoint_id, (r.total, r.successful)))
        .collect();

    let last_success_map: std::collections::HashMap<Uuid, chrono::DateTime<chrono::Utc>> =
        last_success_rows
            .into_iter()
            .map(|r| (r.endpoint_id, r.last_success_at))
            .collect();

    let health_list: Vec<EndpointHealth> = endpoints
        .into_iter()
        .map(|ep| {
            // 24h stats
            let (total, successful, failed) = stats_map.get(&ep.id).copied().unwrap_or((0, 0, 0));
            let success_rate = if total > 0 {
                (successful as f64 / total as f64) * 100.0
            } else {
                100.0
            };

            // 7d stats
            let (total_7d, successful_7d) = stats_7d_map.get(&ep.id).copied().unwrap_or((0, 0));
            let uptime_7d = if total_7d > 0 {
                (successful_7d as f64 / total_7d as f64) * 100.0
            } else {
                100.0
            };

            // Real percentiles from delivery_attempts
            let (p95, p99, avg) = percentile_map.get(&ep.id).copied().unwrap_or((0.0, 0.0, 0.0));

            let health_status = determine_health_status(ep.failure_streak, success_rate);

            EndpointHealth {
                id: ep.id,
                url: ep.url,
                description: ep.description,
                is_active: ep.is_active,
                health_status: health_status.to_string(),
                success_rate,
                avg_response_ms: avg.round() as i32,
                p95_response_ms: p95.round() as i32,
                p99_response_ms: p99.round() as i32,
                total_deliveries: total,
                successful,
                failed,
                consecutive_failures: ep.failure_streak,
                last_success_at: last_success_map.get(&ep.id).map(|t| t.to_rfc3339()),
                last_failure_at: ep.last_failure_at.map(|t| t.to_rfc3339()),
                uptime_24h: success_rate,
                uptime_7d,
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

    // 24h stats
    let (total, successful, failed): (i64, i64, i64) = sqlx::query_as(
        "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered'), COUNT(*) FILTER (WHERE status = 'failed') \
         FROM deliveries WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '24 hours'",
    )
    .bind(ep.id)
    .fetch_one(&pool)
    .await
    .unwrap_or((0, 0, 0));

    let success_rate = if total > 0 {
        (successful as f64 / total as f64) * 100.0
    } else {
        100.0
    };

    // Real p95/p99 from delivery_attempts
    let (p95, p99, avg): (Option<f64>, Option<f64>, Option<f64>) = sqlx::query_as(
        "SELECT \
         percentile_cont(0.95) WITHIN GROUP (ORDER BY da.duration_ms), \
         percentile_cont(0.99) WITHIN GROUP (ORDER BY da.duration_ms), \
         AVG(da.duration_ms) \
         FROM delivery_attempts da \
         JOIN deliveries d ON d.id = da.delivery_id \
         WHERE d.endpoint_id = $1 AND da.created_at > NOW() - INTERVAL '24 hours'",
    )
    .bind(ep.id)
    .fetch_one(&pool)
    .await
    .unwrap_or((None, None, None));

    // 7d stats
    let (total_7d, successful_7d): (i64, i64) = sqlx::query_as(
        "SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'delivered') \
         FROM deliveries WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '7 days'",
    )
    .bind(ep.id)
    .fetch_one(&pool)
    .await
    .unwrap_or((0, 0));

    let uptime_7d = if total_7d > 0 {
        (successful_7d as f64 / total_7d as f64) * 100.0
    } else {
        100.0
    };

    // Last successful delivery
    let last_success: Option<chrono::DateTime<chrono::Utc>> = sqlx::query_scalar(
        "SELECT MAX(created_at) FROM deliveries WHERE endpoint_id = $1 AND status = 'delivered'",
    )
    .bind(ep.id)
    .fetch_one(&pool)
    .await
    .unwrap_or(None);

    let health_status = determine_health_status(ep.failure_streak, success_rate);

    Ok(Json(EndpointHealth {
        id: ep.id,
        url: ep.url,
        description: ep.description,
        is_active: ep.is_active,
        health_status: health_status.to_string(),
        success_rate,
        avg_response_ms: avg.unwrap_or(0.0).round() as i32,
        p95_response_ms: p95.unwrap_or(0.0).round() as i32,
        p99_response_ms: p99.unwrap_or(0.0).round() as i32,
        total_deliveries: total,
        successful,
        failed,
        consecutive_failures: ep.failure_streak,
        last_success_at: last_success.map(|t| t.to_rfc3339()),
        last_failure_at: ep.last_failure_at.map(|t| t.to_rfc3339()),
        uptime_24h: success_rate,
        uptime_7d,
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
        assert_eq!(determine_health_status(5, 90.0), "unhealthy");
        assert_eq!(determine_health_status(10, 99.0), "unhealthy");
        assert_eq!(determine_health_status(3, 99.0), "degraded");
        assert_eq!(determine_health_status(4, 99.0), "degraded");
        assert_eq!(determine_health_status(0, 90.0), "degraded");
        assert_eq!(determine_health_status(1, 50.0), "degraded");
        assert_eq!(determine_health_status(0, 99.0), "healthy");
        assert_eq!(determine_health_status(2, 100.0), "healthy");
    }

    #[test]
    fn test_success_rate_calculation() {
        let total = 100i64;
        let successful = 95i64;
        let rate = if total > 0 {
            (successful as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        assert_eq!(rate, 95.0);

        let total = 0i64;
        let rate = if total > 0 {
            (successful as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        assert_eq!(rate, 100.0);
    }
}
