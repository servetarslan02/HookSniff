//! System monitoring — failed deliveries, dead letters, queue status, rate limit violations, latency.

use axum::extract::{Extension, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::require_admin;

// ── Failed Deliveries ──────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct FailedDeliveriesParams {
    pub limit: Option<i64>,
    pub since: Option<String>,
    pub user_id: Option<Uuid>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct FailedDeliveryRow {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub endpoint_id: Uuid,
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub response_body: Option<String>,
    pub created_at: DateTime<Utc>,
    pub error_message: Option<String>,
    pub customer_email: Option<String>,
    pub endpoint_url: Option<String>,
}

/// GET /v1/admin/deliveries/failed — All users' failed deliveries.
pub async fn admin_failed_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<FailedDeliveriesParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let limit = params.limit.unwrap_or(50).min(200);
    let since = params.since.as_deref().unwrap_or("24h");
    let interval = match since {
        "1h" => "1 hour",
        "24h" => "24 hours",
        "7d" => "7 days",
        "30d" => "30 days",
        _ => "24 hours",
    };

    let rows = if let Some(uid) = params.user_id {
        sqlx::query_as::<_, FailedDeliveryRow>(&format!(
            r#"SELECT d.id, d.customer_id, d.endpoint_id, d.event_type, d.status,
                d.attempt_count, d.response_status,
                CASE WHEN LENGTH(d.response_body) > 4096
                    THEN LEFT(d.response_body, 4096) || '...[truncated]'
                    ELSE d.response_body
                END as response_body,
                d.created_at,
                (SELECT da.error_message FROM delivery_attempts da
                 WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message,
                c.email as customer_email,
                e.url as endpoint_url
            FROM deliveries d
            LEFT JOIN customers c ON c.id = d.customer_id
            LEFT JOIN endpoints e ON e.id = d.endpoint_id
            WHERE d.status = 'failed'
              AND d.customer_id = $1
              AND d.created_at >= NOW() - INTERVAL '{}'
            ORDER BY d.created_at DESC LIMIT $2"#, interval
        ))
        .bind(uid)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, FailedDeliveryRow>(&format!(
            r#"SELECT d.id, d.customer_id, d.endpoint_id, d.event_type, d.status,
                d.attempt_count, d.response_status,
                CASE WHEN LENGTH(d.response_body) > 4096
                    THEN LEFT(d.response_body, 4096) || '...[truncated]'
                    ELSE d.response_body
                END as response_body,
                d.created_at,
                (SELECT da.error_message FROM delivery_attempts da
                 WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message,
                c.email as customer_email,
                e.url as endpoint_url
            FROM deliveries d
            LEFT JOIN customers c ON c.id = d.customer_id
            LEFT JOIN endpoints e ON e.id = d.endpoint_id
            WHERE d.status = 'failed'
              AND d.created_at >= NOW() - INTERVAL '{}'
            ORDER BY d.created_at DESC LIMIT $1"#, interval
        ))
        .bind(limit)
        .fetch_all(&pool)
        .await?
    };

    Ok(Json(serde_json::json!({
        "deliveries": rows,
        "count": rows.len(),
    })))
}

// ── Dead Letters ───────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct DeadLetterParams {
    pub limit: Option<i64>,
    pub since: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct DeadLetterRow {
    pub id: Uuid,
    pub delivery_id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub payload: serde_json::Value,
    pub reason: Option<String>,
    pub attempts: i32,
    pub created_at: DateTime<Utc>,
    pub customer_email: Option<String>,
    pub endpoint_url: Option<String>,
}

/// GET /v1/admin/deliveries/dead-letters — Permanently failed deliveries.
pub async fn admin_dead_letters(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<DeadLetterParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let limit = params.limit.unwrap_or(50).min(200);
    let since = params.since.as_deref().unwrap_or("24h");
    let interval = match since {
        "1h" => "1 hour",
        "24h" => "24 hours",
        "7d" => "7 days",
        "30d" => "30 days",
        _ => "24 hours",
    };

    let rows = sqlx::query_as::<_, DeadLetterRow>(&format!(
        r#"SELECT dl.id, dl.delivery_id, dl.endpoint_id, dl.customer_id,
            '{{}}'::jsonb as payload, dl.reason, dl.attempts, dl.created_at,
            c.email as customer_email,
            e.url as endpoint_url
        FROM dead_letters dl
        LEFT JOIN customers c ON c.id = dl.customer_id
        LEFT JOIN endpoints e ON e.id = dl.endpoint_id
        WHERE dl.created_at >= NOW() - INTERVAL '{}'
        ORDER BY dl.created_at DESC LIMIT $1"#, interval
    ))
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "dead_letters": rows,
        "count": rows.len(),
    })))
}

// ── Queue Status ───────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct QueueStatus {
    pub pending: i64,
    pub processing: i64,
    pub failed: i64,
    pub total: i64,
    pub oldest_pending_at: Option<DateTime<Utc>>,
    pub failed_last_hour: i64,
}

/// GET /v1/admin/queue/status — Webhook queue depth.
pub async fn admin_queue_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<QueueStatus>, AppError> {
    require_admin(&customer)?;

    let row: (i64, i64, i64, i64, Option<DateTime<Utc>>, i64) = sqlx::query_as(
        "SELECT
            COUNT(*) FILTER (WHERE status = 'pending'),
            COUNT(*) FILTER (WHERE status = 'processing'),
            COUNT(*) FILTER (WHERE status = 'failed'),
            COUNT(*),
            MIN(created_at) FILTER (WHERE status = 'pending'),
            COUNT(*) FILTER (WHERE status = 'failed' AND updated_at >= NOW() - INTERVAL '1 hour')
        FROM webhook_queue",
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(QueueStatus {
        pending: row.0,
        processing: row.1,
        failed: row.2,
        total: row.3,
        oldest_pending_at: row.4,
        failed_last_hour: row.5,
    }))
}

// ── Rate Limit Violations ──────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RateLimitViolationParams {
    pub limit: Option<i64>,
    pub since: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct RateLimitViolationRow {
    pub id: Uuid,
    pub customer_id: Option<Uuid>,
    pub endpoint_id: Option<Uuid>,
    pub ip: Option<String>,
    pub requests_count: i32,
    pub limit_per_window: i32,
    pub window_seconds: i32,
    pub created_at: DateTime<Utc>,
    pub customer_email: Option<String>,
}

/// GET /v1/admin/rate-limit-violations — Recent rate limit violations.
pub async fn admin_rate_limit_violations(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<RateLimitViolationParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let limit = params.limit.unwrap_or(50).min(200);
    let since = params.since.as_deref().unwrap_or("24h");
    let interval = match since {
        "1h" => "1 hour",
        "24h" => "24 hours",
        "7d" => "7 days",
        "30d" => "30 days",
        _ => "24 hours",
    };

    let rows = sqlx::query_as::<_, RateLimitViolationRow>(&format!(
        r#"SELECT rv.id, rv.customer_id, rv.endpoint_id, rv.ip,
            rv.requests_count, rv.limit_per_window, rv.window_seconds, rv.created_at,
            c.email as customer_email
        FROM rate_limit_violations rv
        LEFT JOIN customers c ON c.id = rv.customer_id
        WHERE rv.created_at >= NOW() - INTERVAL '{}'
        ORDER BY rv.created_at DESC LIMIT $1"#, interval
    ))
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "violations": rows,
        "count": rows.len(),
    })))
}

// ── API Latency ────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct LatencyParams {
    pub period: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct EndpointLatencyRow {
    pub endpoint_id: Uuid,
    pub url: String,
    pub total_deliveries: i64,
    pub avg_latency_ms: Option<f64>,
    pub p95_latency_ms: Option<f64>,
    pub failed_count: i64,
    pub error_rate: f64,
}

/// GET /v1/admin/api-latency — Endpoint-based response time.
pub async fn admin_api_latency(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<LatencyParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let period = params.period.as_deref().unwrap_or("24h");
    let interval = match period {
        "1h" => "1 hour",
        "24h" => "24 hours",
        "7d" => "7 days",
        _ => "24 hours",
    };

    let rows = sqlx::query_as::<_, EndpointLatencyRow>(&format!(
        r#"SELECT
            e.id as endpoint_id,
            e.url,
            COUNT(DISTINCT d.id) as total_deliveries,
            AVG(da.duration_ms) as avg_latency_ms,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms) as p95_latency_ms,
            COUNT(CASE WHEN d.status = 'failed' THEN 1 END) as failed_count,
            CASE WHEN COUNT(DISTINCT d.id) > 0
                THEN ROUND(COUNT(CASE WHEN d.status = 'failed' THEN 1 END)::numeric / COUNT(DISTINCT d.id) * 100, 1)
                ELSE 0
            END as error_rate
        FROM endpoints e
        LEFT JOIN deliveries d ON d.endpoint_id = e.id
            AND d.created_at >= NOW() - INTERVAL '{}'
        LEFT JOIN delivery_attempts da ON da.delivery_id = d.id
        GROUP BY e.id, e.url
        HAVING COUNT(DISTINCT d.id) > 0
        ORDER BY avg_latency_ms DESC NULLS LAST
        LIMIT 50"#, interval
    ))
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "endpoints": rows,
        "period": period,
    })))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_failed_deliveries_params_defaults() {
        let params = FailedDeliveriesParams {
            limit: None,
            since: None,
            user_id: None,
        };
        assert!(params.limit.is_none());
        assert!(params.since.is_none());
        assert!(params.user_id.is_none());
    }

    #[test]
    fn test_dead_letter_params_defaults() {
        let params = DeadLetterParams {
            limit: None,
            since: None,
        };
        assert!(params.limit.is_none());
    }

    #[test]
    fn test_rate_limit_violation_params_defaults() {
        let params = RateLimitViolationParams {
            limit: None,
            since: None,
        };
        assert!(params.limit.is_none());
    }

    #[test]
    fn test_latency_params_defaults() {
        let params = LatencyParams { period: None };
        assert!(params.period.is_none());
    }

    #[test]
    fn test_queue_status_serialization() {
        let qs = QueueStatus {
            pending: 10,
            processing: 3,
            failed: 1,
            total: 14,
            oldest_pending_at: None,
            failed_last_hour: 0,
        };
        let json = serde_json::to_value(&qs).unwrap();
        assert_eq!(json["pending"], 10);
        assert_eq!(json["processing"], 3);
        assert_eq!(json["failed"], 1);
        assert_eq!(json["total"], 14);
    }
}
