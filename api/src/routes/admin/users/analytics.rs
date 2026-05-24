use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::routes::admin::{require_admin, UserSummary, EndpointSummary, DeliverySummary};

// ── User Analytics ──────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsParams {
    pub days: Option<i64>,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
pub struct DailyDeliveryCount {
    pub date: String,
    pub total: i64,
    pub success: i64,
    pub failed: i64,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
pub struct EventTypeCount {
    #[serde(rename = "event")]
    pub event_type: Option<String>,
    pub count: i64,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
pub struct EndpointHealth {
    pub endpoint_id: Uuid,
    pub url: String,
    pub total: i64,
    pub success: i64,
    pub failed: i64,
    pub success_rate: f64,
    pub avg_latency_ms: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct UserAnalytics {
    pub daily_deliveries: Vec<DailyDeliveryCount>,
    #[serde(rename = "top_events")]
    pub top_event_types: Vec<EventTypeCount>,
    pub endpoint_health: Vec<EndpointHealth>,
}

/// GET /v1/admin/users/:id/analytics — Get user analytics for last N days.
pub async fn user_analytics(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<AnalyticsParams>,
) -> Result<Json<UserAnalytics>, AppError> {
    require_admin(&customer)?;

    let days = params.days.unwrap_or(30).clamp(1, 365);

    let daily_deliveries = sqlx::query_as::<_, DailyDeliveryCount>(
        r#"SELECT
            TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'delivered') as success,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM deliveries
        WHERE customer_id = $1
          AND created_at >= NOW() - INTERVAL '1 day' * $2::int
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)"#,
    )
    .bind(id)
    .bind(days)
    .fetch_all(&pool)
    .await?;

    let top_event_types = sqlx::query_as::<_, EventTypeCount>(
        r#"SELECT event_type, COUNT(*) as count
        FROM deliveries
        WHERE customer_id = $1
          AND created_at >= NOW() - INTERVAL '1 day' * $2::int
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 10"#,
    )
    .bind(id)
    .bind(days)
    .fetch_all(&pool)
    .await?;

    let endpoint_health = sqlx::query_as::<_, EndpointHealth>(
        r#"SELECT
            e.id as endpoint_id,
            e.url,
            COUNT(d.id) as total,
            COUNT(d.id) FILTER (WHERE d.status = 'delivered') as success,
            COUNT(d.id) FILTER (WHERE d.status = 'failed') as failed,
            CASE WHEN COUNT(d.id) > 0
                THEN ROUND(COUNT(d.id) FILTER (WHERE d.status = 'delivered')::numeric / COUNT(d.id) * 100, 1)
                ELSE 0.0
            END as success_rate,
            COALESCE(ROUND(AVG(da.duration_ms)::numeric, 0), 0.0) as avg_latency_ms
        FROM endpoints e
        LEFT JOIN deliveries d ON d.endpoint_id = e.id
          AND d.created_at >= NOW() - INTERVAL '1 day' * $2::int
        LEFT JOIN delivery_attempts da ON da.delivery_id = d.id
        WHERE e.customer_id = $1
        GROUP BY e.id, e.url
        ORDER BY total DESC"#,
    )
    .bind(id)
    .bind(days)
    .fetch_all(&pool)
    .await?;

    Ok(Json(UserAnalytics {
        daily_deliveries,
        top_event_types,
        endpoint_health,
    }))
}

