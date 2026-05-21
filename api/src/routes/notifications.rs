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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    pub id: Uuid,
    pub customer_id: Uuid,
    #[serde(rename = "type")]
    pub notification_type: String,
    pub title: String,
    pub message: Option<String>,
    #[serde(rename = "read")]
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
#[serde(deny_unknown_fields)]
pub struct ListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub unread_only: Option<bool>,
    pub read: Option<bool>,
    pub r#type: Option<String>,
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
    // RBAC: viewer or higher required to view notifications
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 200);
    let offset = (page - 1) * per_page;
    let unread_only = params.unread_only.unwrap_or(false);

    // read=true → only read, read=false → only unread, unset → all
    let read_filter = params.read;
    let type_filter = params.r#type.as_deref();

    // Build WHERE clause
    let mut where_clauses = vec!["customer_id = $1".to_string()];
    let mut param_idx = 2;

    if unread_only || read_filter == Some(false) {
        where_clauses.push("is_read = FALSE".to_string());
    } else if read_filter == Some(true) {
        where_clauses.push("is_read = TRUE".to_string());
    }

    if type_filter.is_some() {
        where_clauses.push(format!("type = ${}", param_idx));
        param_idx += 1;
    }

    let where_sql = where_clauses.join(" AND ");

    let (notifications, total) = {
        let notif_sql = format!(
            "SELECT id, customer_id, type, title, message, is_read, link, created_at FROM notifications WHERE {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
            where_sql, param_idx, param_idx + 1
        );
        let mut notif_query = sqlx::query_as::<_, Notification>(&notif_sql).bind(customer.id);
        if let Some(t) = type_filter {
            notif_query = notif_query.bind(t);
        }
        notif_query = notif_query.bind(per_page).bind(offset);
        let notifs = notif_query.fetch_all(&pool).await?;

        let count_sql = format!("SELECT COUNT(*) FROM notifications WHERE {}", where_sql);
        let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql).bind(customer.id);
        if let Some(t) = type_filter {
            count_query = count_query.bind(t);
        }
        let total = count_query.fetch_one(&pool).await?;

        (notifs, total)
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
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;
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
    // RBAC: viewer or higher (marking read is harmless)
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let result =
        sqlx::query("UPDATE notifications SET is_read = TRUE WHERE id = $1 AND customer_id = $2")
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
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;
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
    // RBAC: developer or higher required to delete notifications
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    let result = sqlx::query("DELETE FROM notifications WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    // ── Notification ────────────────────────────────────────

    #[test]
    fn test_notification_serialization() {
        let n = Notification {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            notification_type: "alert".to_string(),
            title: "High failure rate".to_string(),
            message: Some("Failure rate exceeded 5%".to_string()),
            is_read: false,
            link: Some("/alerts/123".to_string()),
            created_at: Utc.with_ymd_and_hms(2024, 1, 15, 10, 30, 0).unwrap(),
        };
        let json = serde_json::to_value(&n).unwrap();
        assert_eq!(json["type"], "alert");
        assert_eq!(json["title"], "High failure rate");
        assert!(!json["is_read"].as_bool().unwrap());
    }

    #[test]
    fn test_notification_type_field_rename() {
        let n = Notification {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            notification_type: "system".to_string(),
            title: "Update".to_string(),
            message: None,
            is_read: true,
            link: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&n).unwrap();
        // The field is renamed to "type" in serialization
        assert!(json.get("type").is_some());
        assert_eq!(json["type"], "system");
    }

    #[test]
    fn test_notification_optional_fields_none() {
        let n = Notification {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            notification_type: "info".to_string(),
            title: "Info".to_string(),
            message: None,
            is_read: false,
            link: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&n).unwrap();
        assert!(json["message"].is_null());
        assert!(json["link"].is_null());
    }

    #[test]
    fn test_notification_clone() {
        let n = Notification {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            notification_type: "test".to_string(),
            title: "Test".to_string(),
            message: None,
            is_read: false,
            link: None,
            created_at: Utc::now(),
        };
        let cloned = n.clone();
        assert_eq!(cloned.title, n.title);
    }

    #[test]
    fn test_notification_debug() {
        let n = Notification {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            notification_type: "test".to_string(),
            title: "Debug".to_string(),
            message: None,
            is_read: false,
            link: None,
            created_at: Utc::now(),
        };
        let _ = format!("{:?}", n);
    }

    // ── ListParams ──────────────────────────────────────────

    #[test]
    fn test_list_params_all_none() {
        let json = r#"{}"#;
        let params: ListParams = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
        assert!(params.unread_only.is_none());
    }

    #[test]
    fn test_list_params_all_some() {
        let json = r#"{"page":2,"per_page":50,"unread_only":true}"#;
        let params: ListParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.page, Some(2));
        assert_eq!(params.per_page, Some(50));
        assert_eq!(params.unread_only, Some(true));
    }

    #[test]
    fn test_list_params_unread_only_false() {
        let json = r#"{"unread_only":false}"#;
        let params: ListParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.unread_only, Some(false));
    }

    // ── NotificationListResponse ────────────────────────────

    #[test]
    fn test_notification_list_response_serialization() {
        let resp = NotificationListResponse {
            notifications: vec![],
            total: 0,
            unread_count: 0,
            page: 1,
            per_page: 20,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["unread_count"], 0);
        assert_eq!(json["page"], 1);
        assert_eq!(json["per_page"], 20);
        assert!(json["notifications"].as_array().unwrap().is_empty());
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_notifications_router_construction() {
        let _router = router();
    }
}
