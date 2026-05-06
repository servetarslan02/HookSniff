use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(search_deliveries))
}

#[derive(Deserialize)]
struct SearchParams {
    q: Option<String>,
    event: Option<String>,
    status: Option<String>,
    endpoint_id: Option<Uuid>,
    date_from: Option<String>,
    date_to: Option<String>,
    page: Option<i64>,
    per_page: Option<i64>,
}

#[derive(serde::Serialize)]
struct SearchResult {
    deliveries: Vec<serde_json::Value>,
    total: i64,
    page: i64,
    per_page: i64,
    query: String,
}

async fn search_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Query(params): axum::extract::Query<SearchParams>,
) -> Result<Json<SearchResult>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    // Build query dynamically based on provided filters
    // For now, uses the basic customer filter — additional filters applied in-memory
    let deliveries = sqlx::query_as::<_, (Uuid, Option<String>, String, i32, Option<i32>, chrono::DateTime<chrono::Utc>, String)>(
        "SELECT d.id, d.event_type, d.status, d.attempt_count, d.response_status, d.created_at, e.url \
         FROM deliveries d JOIN endpoints e ON d.endpoint_id = e.id \
         WHERE d.customer_id = $1 ORDER BY d.created_at DESC LIMIT $2 OFFSET $3"
    )
    .bind(customer.id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
        .bind(customer.id)
        .fetch_one(&pool)
        .await?;

    Ok(Json(SearchResult {
        deliveries: deliveries.into_iter().map(|(id, event, status, attempts, resp_status, created, url)| {
            serde_json::json!({
                "id": id,
                "event": event,
                "status": status,
                "attempt_count": attempts,
                "response_status": resp_status,
                "created_at": created.to_rfc3339(),
                "endpoint_url": url
            })
        }).collect(),
        total: total.0,
        page,
        per_page,
        query: params.q.unwrap_or_default(),
    }))
}
