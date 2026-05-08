//! Events polling endpoint for clients that cannot use SSE.
//!
//! GET /v1/events — Poll for recent deliveries (alternative to SSE stream).

use axum::extract::{Extension, Query};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::delivery::Delivery;

pub fn router() -> Router {
    Router::new().route("/", get(list_events))
}

#[derive(Debug, Deserialize)]
struct EventsParams {
    since: Option<String>,
    status: Option<String>,
    endpoint_id: Option<Uuid>,
    #[allow(dead_code)]
    event: Option<String>,
    page: Option<i64>,
    per_page: Option<i64>,
}

#[derive(Debug, Serialize)]
struct EventItem {
    id: Uuid,
    endpoint_id: Uuid,
    event: Option<String>,
    status: String,
    attempt_count: i32,
    response_status: Option<i32>,
    created_at: String,
}

#[derive(Debug, Serialize)]
struct EventsResponse {
    events: Vec<EventItem>,
    total: i64,
    page: i64,
    per_page: i64,
    has_more: bool,
}

async fn list_events(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<EventsParams>,
) -> Result<Json<EventsResponse>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).min(200);
    let offset = (page - 1) * per_page;

    // Simple approach: fetch with optional filters
    let deliveries = if let Some(ref since) = params.since {
        let parsed: DateTime<Utc> = since.parse().map_err(|_| {
            AppError::BadRequest("Invalid 'since' timestamp. Use ISO 8601 format.".into())
        })?;
        sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        )
        .bind(customer.id)
        .bind(parsed)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?
    } else if let Some(ref status) = params.status {
        sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        )
        .bind(customer.id)
        .bind(status)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?
    } else if let Some(endpoint_id) = params.endpoint_id {
        sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 AND endpoint_id = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        )
        .bind(customer.id)
        .bind(endpoint_id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?
    };

    // Get total count
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
        .bind(customer.id)
        .fetch_one(&pool)
        .await?;

    let events: Vec<EventItem> = deliveries
        .into_iter()
        .map(|d| EventItem {
            id: d.id,
            endpoint_id: d.endpoint_id,
            event: d.event_type,
            status: d.status,
            attempt_count: d.attempt_count,
            response_status: d.response_status,
            created_at: d.created_at.to_rfc3339(),
        })
        .collect();

    let has_more = (page * per_page) < total.0;

    Ok(Json(EventsResponse {
        events,
        total: total.0,
        page,
        per_page,
        has_more,
    }))
}
