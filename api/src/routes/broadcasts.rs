//! User-facing broadcast endpoints — active broadcasts + dismiss.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

// ── Types ──────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct UserBroadcast {
    pub id: Uuid,
    pub title: String,
    pub message: String,
    pub broadcast_type: String,
    pub severity: String,
    pub link: Option<String>,
    pub link_text: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct BroadcastQueryParams {
    pub include_dismissed: Option<bool>,
}

// ── Handlers ───────────────────────────────────────────────

/// GET /v1/broadcasts — List active broadcasts for the current user.
///
/// Returns broadcasts that:
/// - are active (is_active = true)
/// - have started (starts_at IS NULL OR starts_at <= now)
/// - have not expired (expires_at IS NULL OR expires_at > now)
/// - match the user's plan (target_plan IS NULL OR target_plan = user.plan)
/// - are not dismissed by the user (unless include_dismissed = true)
pub async fn list_active_broadcasts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<BroadcastQueryParams>,
) -> Result<Json<Vec<UserBroadcast>>, AppError> {
    let include_dismissed = params.include_dismissed.unwrap_or(false);

    let broadcasts = if include_dismissed {
        sqlx::query_as::<_, (Uuid, String, String, String, String, Option<String>, Option<String>, DateTime<Utc>)>(
            "SELECT b.id, b.title, b.message, b.broadcast_type, b.severity, b.link, b.link_text, b.created_at
             FROM broadcasts b
             WHERE b.is_active = true
               AND (b.starts_at IS NULL OR b.starts_at <= NOW())
               AND (b.expires_at IS NULL OR b.expires_at > NOW())
               AND (b.target_plan IS NULL OR b.target_plan = $1)
             ORDER BY
               CASE b.severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END,
               b.created_at DESC
             LIMIT 50"
        )
        .bind(&customer.plan)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, (Uuid, String, String, String, String, Option<String>, Option<String>, DateTime<Utc>)>(
            "SELECT b.id, b.title, b.message, b.broadcast_type, b.severity, b.link, b.link_text, b.created_at
             FROM broadcasts b
             LEFT JOIN broadcast_dismissals bd ON bd.broadcast_id = b.id AND bd.customer_id = $2
             WHERE b.is_active = true
               AND (b.starts_at IS NULL OR b.starts_at <= NOW())
               AND (b.expires_at IS NULL OR b.expires_at > NOW())
               AND (b.target_plan IS NULL OR b.target_plan = $1)
               AND bd.id IS NULL
             ORDER BY
               CASE b.severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END,
               b.created_at DESC
             LIMIT 50"
        )
        .bind(&customer.plan)
        .bind(customer.id)
        .fetch_all(&pool)
        .await?
    };

    let result: Vec<UserBroadcast> = broadcasts
        .into_iter()
        .map(|(id, title, message, broadcast_type, severity, link, link_text, created_at)| {
            UserBroadcast {
                id,
                title,
                message,
                broadcast_type,
                severity,
                link,
                link_text,
                created_at,
            }
        })
        .collect();

    Ok(Json(result))
}

/// POST /v1/broadcasts/:id/dismiss — Dismiss a broadcast (hide from user's view).
pub async fn dismiss_broadcast(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Check broadcast exists
    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM broadcasts WHERE id = $1)")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    if !exists {
        return Err(AppError::NotFound);
    }

    // Upsert dismissal (ignore if already dismissed)
    sqlx::query(
        "INSERT INTO broadcast_dismissals (broadcast_id, customer_id)
         VALUES ($1, $2)
         ON CONFLICT (broadcast_id, customer_id) DO NOTHING"
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "dismissed": true })))
}

/// GET /v1/broadcasts/unread-count — Count of active (non-dismissed) broadcasts.
pub async fn broadcast_unread_count(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM broadcasts b
         LEFT JOIN broadcast_dismissals bd ON bd.broadcast_id = b.id AND bd.customer_id = $1
         WHERE b.is_active = true
           AND (b.starts_at IS NULL OR b.starts_at <= NOW())
           AND (b.expires_at IS NULL OR b.expires_at > NOW())
           AND (b.target_plan IS NULL OR b.target_plan = $2)
           AND bd.id IS NULL"
    )
    .bind(customer.id)
    .bind(&customer.plan)
    .fetch_one(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "unread_count": count.0 })))
}

// ── Router ─────────────────────────────────────────────────

pub fn router() -> axum::Router {
    axum::Router::new()
        .route("/", axum::routing::get(list_active_broadcasts))
        .route("/{id}/dismiss", axum::routing::post(dismiss_broadcast))
        .route("/unread-count", axum::routing::get(broadcast_unread_count))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_broadcast_serialization() {
        let b = UserBroadcast {
            id: Uuid::new_v4(),
            title: "Scheduled Maintenance".to_string(),
            message: "We'll be down from 2-4 AM UTC".to_string(),
            broadcast_type: "maintenance".to_string(),
            severity: "warning".to_string(),
            link: Some("https://status.hooksniff.com".to_string()),
            link_text: Some("View Status".to_string()),
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&b).unwrap();
        assert_eq!(json["title"], "Scheduled Maintenance");
        assert_eq!(json["severity"], "warning");
        assert_eq!(json["link_text"], "View Status");
    }

    #[test]
    fn test_broadcast_query_params_default() {
        let json = r#"{}"#;
        let params: BroadcastQueryParams = serde_json::from_str(json).unwrap();
        assert!(!params.include_dismissed.unwrap_or(false));
    }

    #[test]
    fn test_broadcast_query_params_include_dismissed() {
        let json = r#"{"include_dismissed": true}"#;
        let params: BroadcastQueryParams = serde_json::from_str(json).unwrap();
        assert!(params.include_dismissed.unwrap_or(false));
    }
}
