/// Analytics API endpoints for dashboard charts and metrics.
///
/// Provides time-bucketed delivery data, success rates, and latency metrics.
use axum::extract::{Extension, Query};
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/deliveries", get(delivery_trend))
        .route("/success-rate", get(success_rate))
        .route("/latency", get(latency_trend))
}

#[derive(Debug, Deserialize)]
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

    let buckets: Vec<(chrono::NaiveDateTime, i64, i64, i64)> = sqlx::query_as(
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
    let bucket_hours = query.bucket_size_hours();
    let range_label = query.range.as_deref().unwrap_or("24h");

    let buckets: Vec<(chrono::NaiveDateTime, f64, f64)> = sqlx::query_as(
        r#"
        SELECT
            date_trunc('hour', da.created_at) - (EXTRACT(HOUR FROM da.created_at)::int % $3) * INTERVAL '1 hour' AS bucket,
            COALESCE(AVG(da.duration_ms), 0)::FLOAT AS avg_ms,
            COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms), 0)::FLOAT AS p95_ms
        FROM delivery_attempts da
        JOIN deliveries d ON d.id = da.delivery_id
        WHERE d.customer_id = $1
          AND da.created_at >= now() - INTERVAL '1 hour' * $2
          AND da.duration_ms IS NOT NULL
        GROUP BY bucket
        ORDER BY bucket ASC
        "#,
    )
    .bind(customer.id)
    .bind(hours)
    .bind(bucket_hours as i32)
    .fetch_all(&pool)
    .await?;

    let overall: (f64,) = sqlx::query_as(
        r#"
        SELECT COALESCE(AVG(da.duration_ms), 0)::FLOAT
        FROM delivery_attempts da
        JOIN deliveries d ON d.id = da.delivery_id
        WHERE d.customer_id = $1
          AND da.created_at >= now() - INTERVAL '1 hour' * $2
          AND da.duration_ms IS NOT NULL
        "#,
    )
    .bind(customer.id)
    .bind(hours)
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
