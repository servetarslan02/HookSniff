use axum::extract::{Extension, Path, Query};
use axum::routing::{delete, get, put};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_notifications))
        .route("/unread-count", get(unread_count))
        .route("/read-all", put(mark_all_read))
        .route("/{id}/read", put(mark_read))
        .route("/{id}", delete(delete_notification))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Notification {
    pub id: Uuid,
    pub customer_id: Uuid,
    #[serde(rename = "type")]
    pub notification_type: String,
    pub title: String,
    pub message: Option<String>,
    pub is_read: bool,
    pub link: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl sqlx::FromRow<'_, sqlx::postgres::PgRow> for Notification {
    fn from_row(row: &sqlx::postgres::PgRow) -> Result<Self, sqlx::Error> {
        use sqlx::Row;
        Ok(Self {
            id: row.get("id"),
            customer_id: row.get("customer_id"),
            notification_type: row.get("type"),
            title: row.get("title"),
            message: row.get("message"),
            is_read: row.get("is_read"),
            link: row.get("link"),
            created_at: row.get("created_at"),
        })
    }
}

#[derive(Debug, Deserialize)]
pub struct ListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub unread_only: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct NotificationListResponse {
    pub notifications: Vec<Notification>,
    pub total: i64,
    pub unread_count: i64,
    pub page: i64,
    pub per_page: i64,
}

/// GET /v1/notifications — List user's notifications with pagination
async fn list_notifications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ListParams>,
) -> Result<Json<NotificationListResponse>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;
    let unread_only = params.unread_only.unwrap_or(false);

    let (notifications, total) = if unread_only {
        let notifs = sqlx::query_as::<_, Notification>(
            r#"SELECT id, customer_id, type, title, message, is_read, link, created_at
               FROM notifications
               WHERE customer_id = $1 AND is_read = FALSE
               ORDER BY created_at DESC
               LIMIT $2 OFFSET $3"#,
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM notifications WHERE customer_id = $1 AND is_read = FALSE",
        )
        .bind(customer.id)
        .fetch_one(&pool)
        .await?;

        (notifs, total.0)
    } else {
        let notifs = sqlx::query_as::<_, Notification>(
            r#"SELECT id, customer_id, type, title, message, is_read, link, created_at
               FROM notifications
               WHERE customer_id = $1
               ORDER BY created_at DESC
               LIMIT $2 OFFSET $3"#,
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM notifications WHERE customer_id = $1",
        )
        .bind(customer.id)
        .fetch_one(&pool)
        .await?;

        (notifs, total.0)
    };

    let unread_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM notifications WHERE customer_id = $1 AND is_read = FALSE",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(NotificationListResponse {
        notifications,
        total,
        unread_count: unread_count.0,
        page,
        per_page,
    }))
}

/// GET /v1/notifications/unread-count — Count unread
async fn unread_count(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM notifications WHERE customer_id = $1 AND is_read = FALSE",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "unread_count": count.0 })))
}

/// PUT /v1/notifications/:id/read — Mark as read
async fn mark_read(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "read": true })))
}

/// PUT /v1/notifications/read-all — Mark all as read
async fn mark_all_read(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "UPDATE notifications SET is_read = TRUE WHERE customer_id = $1 AND is_read = FALSE",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "marked_read": result.rows_affected()
    })))
}

/// DELETE /v1/notifications/:id — Delete notification
async fn delete_notification(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "DELETE FROM notifications WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}
