//! Events polling endpoint for clients that cannot use SSE.
//!
//! GET /v1/events — Poll for recent deliveries (alternative to SSE stream).

use axum::extract::{Extension, Query};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new().route("/", get(list_events))
}


#[derive(Debug, Deserialize)]
struct EventsParams {
    since: Option<String>,
    status: Option<String>,
    endpoint_id: Option<Uuid>,
    event: Option<String>,
    page: Option<i64>,
    per_page: Option<i64>,
}

/// Lightweight struct for events query — only the columns we need from deliveries.
#[derive(Debug, FromRow)]
struct EventQuery {
    id: Uuid,
    endpoint_id: Uuid,
    event_type: Option<String>,
    status: String,
    attempt_count: i32,
    response_status: Option<i32>,
    created_at: DateTime<Utc>,
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
    // RBAC: viewer or higher required to view events
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).min(200);
    let offset = (page - 1) * per_page;

    // Build query with optional filters
    let mut conditions = vec!["customer_id = $1".to_string()];
    let mut bind_idx: i32 = 2;

    if params.since.is_some() {
        conditions.push(format!("created_at >= ${}", bind_idx));
        bind_idx += 1;
    }
    if params.status.is_some() {
        conditions.push(format!("status = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.endpoint_id.is_some() {
        conditions.push(format!("endpoint_id = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.event.is_some() {
        conditions.push(format!("event_type = ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = format!("WHERE {}", conditions.join(" AND "));
    let query = format!(
        "SELECT id, endpoint_id, event_type, status, attempt_count, response_status, created_at FROM deliveries {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
        where_clause,
        bind_idx,
        bind_idx + 1
    );

    let mut q = sqlx::query_as::<_, EventQuery>(&query).bind(customer.id);

    if let Some(ref since) = params.since {
        let parsed: DateTime<Utc> = since.parse().map_err(|_| {
            AppError::BadRequest("Invalid date format for 'since' parameter. Please use ISO 8601 format (e.g. 2024-01-01T00:00:00Z).".into())
        })?;
        q = q.bind(parsed);
    }
    if let Some(ref status) = params.status {
        q = q.bind(status);
    }
    if let Some(endpoint_id) = params.endpoint_id {
        q = q.bind(endpoint_id);
    }
    if let Some(ref event) = params.event {
        q = q.bind(event);
    }

    let deliveries = q.bind(per_page).bind(offset).fetch_all(&pool).await?;

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_events_params_deserialize() {
        let json = r#"{
            "since": "2024-01-01T00:00:00Z",
            "status": "delivered",
            "endpoint_id": "550e8400-e29b-41d4-a716-446655440000",
            "event": "order.created",
            "page": 2,
            "per_page": 100
        }"#;
        let params: EventsParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.since.unwrap(), "2024-01-01T00:00:00Z");
        assert_eq!(params.status.unwrap(), "delivered");
        assert!(params.endpoint_id.is_some());
        assert_eq!(params.event.unwrap(), "order.created");
        assert_eq!(params.page.unwrap(), 2);
        assert_eq!(params.per_page.unwrap(), 100);
    }

    #[test]
    fn test_events_params_defaults() {
        let json = r#"{}"#;
        let params: EventsParams = serde_json::from_str(json).unwrap();
        assert!(params.since.is_none());
        assert!(params.status.is_none());
        assert!(params.endpoint_id.is_none());
        assert!(params.event.is_none());
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
    }

    #[test]
    fn test_event_item_serialize() {
        let item = EventItem {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            event: Some("order.created".to_string()),
            status: "delivered".to_string(),
            attempt_count: 1,
            response_status: Some(200),
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&item).unwrap();
        assert_eq!(json["event"], "order.created");
        assert_eq!(json["status"], "delivered");
        assert_eq!(json["attempt_count"], 1);
        assert_eq!(json["response_status"], 200);
    }

    #[test]
    fn test_event_item_serialize_no_event() {
        let item = EventItem {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            event: None,
            status: "pending".to_string(),
            attempt_count: 0,
            response_status: None,
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&item).unwrap();
        assert!(json["event"].is_null());
        assert!(json["response_status"].is_null());
    }

    #[test]
    fn test_events_response_serialize() {
        let resp = EventsResponse {
            events: vec![],
            total: 0,
            page: 1,
            per_page: 50,
            has_more: false,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["page"], 1);
        assert_eq!(json["per_page"], 50);
        assert_eq!(json["has_more"], false);
    }

    #[test]
    fn test_pagination_logic() {
        let page = 2i64;
        let per_page = 50i64;
        let offset = (page - 1) * per_page;
        assert_eq!(offset, 50);

        let total = 120i64;
        let has_more = (page * per_page) < total;
        assert!(has_more);

        let total = 100i64;
        let has_more = (page * per_page) < total;
        assert!(!has_more);
    }

    #[test]
    fn test_pagination_clamping() {
        // page 0 should be clamped to 1
        let page = 0i64;
        let clamped = page.max(1);
        assert_eq!(clamped, 1);

        // per_page 500 should be clamped to 200
        let per_page = 500i64;
        let clamped = per_page.min(200);
        assert_eq!(clamped, 200);
    }
}
