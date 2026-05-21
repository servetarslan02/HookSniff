/// Analytics API endpoints for dashboard charts and metrics.
///
/// Provides time-bucketed delivery data, success rates, and latency metrics.
/// Analyst role (level 20+) can access all analytics endpoints via service token.
use axum::extract::{Extension, Query};
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/deliveries", get(delivery_trend))
        .route("/success-rate", get(success_rate))
        .route("/latency", get(latency_trend))
        .route("/analyst-dashboard", get(analyst_dashboard))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsQuery {
    pub range: Option<String>, // "24h", "7d", "30d"
}

impl AnalyticsQuery {
    fn interval_hours(&self) -> i64 {
        match self.range.as_deref() {
            Some("30d") => 30 * 24,
            Some("7d") => 7 * 24,
            _ => 24, // default 24h
        }
    }

    fn bucket_size_hours(&self) -> i64 {
        match self.range.as_deref() {
            Some("30d") => 24, // daily buckets
            Some("7d") => 6,   // 6-hour buckets
            _ => 1,            // hourly buckets for 24h
        }
    }
}

#[derive(Debug, Serialize)]
pub struct TimeBucket {
    pub timestamp: String,
    pub successful: i64,
    pub failed: i64,
    pub total: i64,
}

#[derive(Debug, Serialize)]
pub struct DeliveryTrendResponse {
    pub range: String,
    pub buckets: Vec<TimeBucket>,
}

#[derive(Debug, Serialize)]
pub struct SuccessRateResponse {
    pub range: String,
    pub successful: i64,
    pub failed: i64,
    pub pending: i64,
    pub success_rate: f64,
}

#[derive(Debug, Serialize)]
pub struct LatencyBucket {
    pub timestamp: String,
    pub avg_ms: f64,
    pub p95_ms: f64,
}

#[derive(Debug, Serialize)]
pub struct LatencyTrendResponse {
    pub range: String,
    pub buckets: Vec<LatencyBucket>,
    pub overall_avg_ms: f64,
}

/// GET /v1/analytics/deliveries?range=24h|7d|30d
/// Returns time-bucketed delivery counts (successful vs failed).
async fn delivery_trend(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<AnalyticsQuery>,
) -> Result<Json<DeliveryTrendResponse>, AppError> {
    let hours = query.interval_hours();
    let bucket_hours = query.bucket_size_hours();
    let range_label = query.range.as_deref().unwrap_or("24h");

    let buckets: Vec<(DateTime<Utc>, i64, i64, i64)> = sqlx::query_as(
        r#"
        SELECT
            date_trunc('hour', created_at) - (EXTRACT(HOUR FROM created_at)::int % $3) * INTERVAL '1 hour' AS bucket,
            COUNT(*) FILTER (WHERE status = 'delivered') AS successful,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed,
            COUNT(*) AS total
        FROM deliveries
        WHERE customer_id = $1
          AND created_at >= now() - INTERVAL '1 hour' * $2
        GROUP BY bucket
        ORDER BY bucket ASC
        "#,
    )
    .bind(customer.id)
    .bind(hours)
    .bind(bucket_hours as i32)
    .fetch_all(&pool)
    .await?;

    Ok(Json(DeliveryTrendResponse {
        range: range_label.to_string(),
        buckets: buckets
            .into_iter()
            .map(|(ts, successful, failed, total)| TimeBucket {
                timestamp: ts.to_string(),
                successful,
                failed,
                total,
            })
            .collect(),
    }))
}

/// GET /v1/analytics/success-rate?range=24h|7d|30d
/// Returns success/failure ratio for the given time range.
async fn success_rate(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<AnalyticsQuery>,
) -> Result<Json<SuccessRateResponse>, AppError> {
    let hours = query.interval_hours();
    let range_label = query.range.as_deref().unwrap_or("24h");

    let stats: (i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) FILTER (WHERE status = 'delivered'),
            COUNT(*) FILTER (WHERE status = 'failed'),
            COUNT(*) FILTER (WHERE status = 'pending')
        FROM deliveries
        WHERE customer_id = $1
          AND created_at >= now() - INTERVAL '1 hour' * $2
        "#,
    )
    .bind(customer.id)
    .bind(hours)
    .fetch_one(&pool)
    .await?;

    let total = stats.0 + stats.1 + stats.2;
    let rate = if total > 0 {
        (stats.0 as f64 / total as f64) * 100.0
    } else {
        100.0
    };

    Ok(Json(SuccessRateResponse {
        range: range_label.to_string(),
        successful: stats.0,
        failed: stats.1,
        pending: stats.2,
        success_rate: rate,
    }))
}

/// GET /v1/analytics/latency?range=24h|7d|30d
/// Returns average latency over time.
async fn latency_trend(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<AnalyticsQuery>,
) -> Result<Json<LatencyTrendResponse>, AppError> {
    let hours = query.interval_hours();
    let range_label = query.range.as_deref().unwrap_or("24h");

    let buckets: Vec<(chrono::NaiveDateTime, f64, f64)> = sqlx::query_as(
        r#"
        SELECT
            date_trunc('hour', da.created_at) AS bucket,
            COALESCE(AVG(da.duration_ms), 0)::FLOAT AS avg_ms,
            COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms), 0)::FLOAT AS p95_ms
        FROM delivery_attempts da
        JOIN deliveries d ON d.id = da.delivery_id
        WHERE d.customer_id = $1
          AND da.created_at >= now() - make_interval(hours => $2)
          AND da.duration_ms IS NOT NULL
        GROUP BY date_trunc('hour', da.created_at)
        ORDER BY bucket ASC
        "#,
    )
    .bind(customer.id)
    .bind(hours as i32)
    .fetch_all(&pool)
    .await?;

    let overall: (f64,) = sqlx::query_as(
        r#"
        SELECT COALESCE(AVG(da.duration_ms), 0)::FLOAT
        FROM delivery_attempts da
        JOIN deliveries d ON d.id = da.delivery_id
        WHERE d.customer_id = $1
          AND da.created_at >= now() - make_interval(hours => $2)
          AND da.duration_ms IS NOT NULL
        "#,
    )
    .bind(customer.id)
    .bind(hours as i32)
    .fetch_one(&pool)
    .await?;

    Ok(Json(LatencyTrendResponse {
        range: range_label.to_string(),
        buckets: buckets
            .into_iter()
            .map(|(ts, avg, p95)| LatencyBucket {
                timestamp: ts.to_string(),
                avg_ms: avg,
                p95_ms: p95,
            })
            .collect(),
        overall_avg_ms: overall.0,
    }))
}

/// GET /v1/analytics/analyst-dashboard
/// Comprehensive dashboard for analyst role — combines key metrics in one call.
/// Requires analyst role (level 20+) when using service token.
///
/// Returns:
/// - Total deliveries (24h, 7d, 30d)
/// - Success rate (24h)
/// - Top 5 failing endpoints
/// - Top 5 event types
/// - Average latency (24h)
/// - Active endpoints count
async fn analyst_dashboard(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require analyst for dashboard ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_analyst(&pool, scope.team_id, customer.id).await?;
    }

    // Team filter
    let team_filter = service_token.as_ref().map(|s| s.team_id);

    // Total deliveries by period
    let deliveries_24h: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= now() - INTERVAL '24 hours'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let deliveries_7d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= now() - INTERVAL '7 days'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let deliveries_30d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= now() - INTERVAL '30 days'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    // Success rate (24h)
    let success: (i64, i64, i64) = sqlx::query_as(
        "SELECT \
            COUNT(*) FILTER (WHERE status = 'delivered'), \
            COUNT(*) FILTER (WHERE status = 'failed'), \
            COUNT(*) \
         FROM deliveries WHERE customer_id = $1 AND created_at >= now() - INTERVAL '24 hours'"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let success_rate = if success.2 > 0 {
        (success.0 as f64 / success.2 as f64) * 100.0
    } else {
        100.0
    };

    // Top 5 failing endpoints
    let failing_endpoints: Vec<(String, String, i64)> = sqlx::query_as(
        "SELECT e.name, e.url, COUNT(*) as fail_count \
         FROM deliveries d JOIN endpoints e ON d.endpoint_id = e.id \
         WHERE d.customer_id = $1 AND d.status = 'failed' AND d.created_at >= now() - INTERVAL '7 days' \
         GROUP BY e.name, e.url ORDER BY fail_count DESC LIMIT 5"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    // Top 5 event types
    let top_events: Vec<(String, i64)> = sqlx::query_as(
        "SELECT event_type, COUNT(*) as cnt \
         FROM deliveries WHERE customer_id = $1 AND created_at >= now() - INTERVAL '7 days' \
         GROUP BY event_type ORDER BY cnt DESC LIMIT 5"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    // Average latency (24h)
    let latency: (f64,) = sqlx::query_as(
        "SELECT COALESCE(AVG(da.duration_ms), 0)::FLOAT \
         FROM delivery_attempts da JOIN deliveries d ON d.id = da.delivery_id \
         WHERE d.customer_id = $1 AND da.created_at >= now() - INTERVAL '24 hours' AND da.duration_ms IS NOT NULL"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    // Active endpoints count
    let active_endpoints: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "period": {
            "deliveries_24h": deliveries_24h.0,
            "deliveries_7d": deliveries_7d.0,
            "deliveries_30d": deliveries_30d.0,
        },
        "success_rate_24h": {
            "rate": success_rate,
            "successful": success.0,
            "failed": success.1,
            "total": success.2,
        },
        "top_failing_endpoints": failing_endpoints.iter().map(|(name, url, count)| {
            serde_json::json!({"name": name, "url": url, "fail_count": count})
        }).collect::<Vec<_>>(),
        "top_event_types": top_events.iter().map(|(event, count)| {
            serde_json::json!({"event": event, "count": count})
        }).collect::<Vec<_>>(),
        "avg_latency_24h_ms": latency.0,
        "active_endpoints": active_endpoints.0,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── AnalyticsQuery ──────────────────────────────────────

    #[test]
    fn test_analytics_query_default_range() {
        let json = r#"{}"#;
        let q: AnalyticsQuery = serde_json::from_str(json).unwrap();
        assert!(q.range.is_none());
        assert_eq!(q.interval_hours(), 24);
        assert_eq!(q.bucket_size_hours(), 1);
    }

    #[test]
    fn test_analytics_query_24h() {
        let json = r#"{"range":"24h"}"#;
        let q: AnalyticsQuery = serde_json::from_str(json).unwrap();
        assert_eq!(q.range, Some("24h".to_string()));
        assert_eq!(q.interval_hours(), 24);
        assert_eq!(q.bucket_size_hours(), 1);
    }

    #[test]
    fn test_analytics_query_7d() {
        let json = r#"{"range":"7d"}"#;
        let q: AnalyticsQuery = serde_json::from_str(json).unwrap();
        assert_eq!(q.interval_hours(), 168);
        assert_eq!(q.bucket_size_hours(), 6);
    }

    #[test]
    fn test_analytics_query_30d() {
        let json = r#"{"range":"30d"}"#;
        let q: AnalyticsQuery = serde_json::from_str(json).unwrap();
        assert_eq!(q.interval_hours(), 720);
        assert_eq!(q.bucket_size_hours(), 24);
    }

    #[test]
    fn test_analytics_query_unknown_range_defaults_to_24h() {
        let json = r#"{"range":"90d"}"#;
        let q: AnalyticsQuery = serde_json::from_str(json).unwrap();
        assert_eq!(q.interval_hours(), 24);
        assert_eq!(q.bucket_size_hours(), 1);
    }

    // ── TimeBucket ──────────────────────────────────────────

    #[test]
    fn test_time_bucket_serialization() {
        let bucket = TimeBucket {
            timestamp: "2024-01-01 12:00:00".to_string(),
            successful: 100,
            failed: 5,
            total: 105,
        };
        let json = serde_json::to_value(&bucket).unwrap();
        assert_eq!(json["successful"], 100);
        assert_eq!(json["failed"], 5);
        assert_eq!(json["total"], 105);
    }

    // ── DeliveryTrendResponse ───────────────────────────────

    #[test]
    fn test_delivery_trend_response_serialization() {
        let resp = DeliveryTrendResponse {
            range: "24h".to_string(),
            buckets: vec![
                TimeBucket {
                    timestamp: "2024-01-01 00:00:00".to_string(),
                    successful: 50,
                    failed: 2,
                    total: 52,
                },
                TimeBucket {
                    timestamp: "2024-01-01 01:00:00".to_string(),
                    successful: 60,
                    failed: 0,
                    total: 60,
                },
            ],
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["range"], "24h");
        assert_eq!(json["buckets"].as_array().unwrap().len(), 2);
    }

    // ── SuccessRateResponse ─────────────────────────────────

    #[test]
    fn test_success_rate_response_serialization() {
        let resp = SuccessRateResponse {
            range: "7d".to_string(),
            successful: 1000,
            failed: 10,
            pending: 5,
            success_rate: 98.52,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["range"], "7d");
        assert_eq!(json["successful"], 1000);
        assert_eq!(json["failed"], 10);
        assert_eq!(json["pending"], 5);
        assert_eq!(json["success_rate"], 98.52);
    }

    // ── LatencyBucket ───────────────────────────────────────

    #[test]
    fn test_latency_bucket_serialization() {
        let bucket = LatencyBucket {
            timestamp: "2024-01-01 12:00:00".to_string(),
            avg_ms: 150.5,
            p95_ms: 300.0,
        };
        let json = serde_json::to_value(&bucket).unwrap();
        assert_eq!(json["avg_ms"], 150.5);
        assert_eq!(json["p95_ms"], 300.0);
    }

    // ── LatencyTrendResponse ────────────────────────────────

    #[test]
    fn test_latency_trend_response_serialization() {
        let resp = LatencyTrendResponse {
            range: "30d".to_string(),
            buckets: vec![],
            overall_avg_ms: 120.0,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["range"], "30d");
        assert_eq!(json["overall_avg_ms"], 120.0);
        assert!(json["buckets"].as_array().unwrap().is_empty());
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_analytics_router_construction() {
        let _router = router();
    }
}
