//! Admin broadcast management — global announcements to all users.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Types ──────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Broadcast {
    pub id: Uuid,
    pub title: String,
    pub message: String,
    pub broadcast_type: String,
    pub severity: String,
    pub link: Option<String>,
    pub link_text: Option<String>,
    pub target_plan: Option<String>,
    pub is_active: bool,
    pub starts_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateBroadcastRequest {
    pub title: String,
    pub message: String,
    #[serde(default = "default_broadcast_type")]
    pub broadcast_type: String,
    #[serde(default = "default_severity")]
    pub severity: String,
    pub link: Option<String>,
    pub link_text: Option<String>,
    pub target_plan: Option<String>,
    pub starts_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
}

fn default_broadcast_type() -> String {
    "announcement".to_string()
}
fn default_severity() -> String {
    "info".to_string()
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateBroadcastRequest {
    pub title: Option<String>,
    pub message: Option<String>,
    pub broadcast_type: Option<String>,
    pub severity: Option<String>,
    pub link: Option<String>,
    pub link_text: Option<String>,
    pub target_plan: Option<String>,
    pub is_active: Option<bool>,
    pub starts_at: Option<Option<DateTime<Utc>>>,
    pub expires_at: Option<Option<DateTime<Utc>>>,
}

#[derive(Debug, Deserialize)]
pub struct AdminBroadcastListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub is_active: Option<bool>,
    pub broadcast_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BroadcastListResponse {
    pub broadcasts: Vec<Broadcast>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

// ── Validation ─────────────────────────────────────────────

fn validate_broadcast_type(t: &str) -> Result<(), AppError> {
    let valid = ["maintenance", "feature", "announcement", "incident"];
    if valid.contains(&t) {
        Ok(())
    } else {
        Err(AppError::BadRequest(format!(
            "Invalid broadcast_type. Must be one of: {}",
            valid.join(", ")
        )))
    }
}

fn validate_severity(s: &str) -> Result<(), AppError> {
    let valid = ["info", "warning", "critical"];
    if valid.contains(&s) {
        Ok(())
    } else {
        Err(AppError::BadRequest(format!(
            "Invalid severity. Must be one of: {}",
            valid.join(", ")
        )))
    }
}

// ── Handlers ───────────────────────────────────────────────

/// GET /v1/admin/broadcasts — List all broadcasts (admin only).
pub async fn list_broadcasts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<AdminBroadcastListParams>,
) -> Result<Json<BroadcastListResponse>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    let mut where_clauses = Vec::new();
    let mut param_idx = 1;

    if let Some(_active) = params.is_active {
        where_clauses.push(format!("is_active = ${}", param_idx));
        param_idx += 1;
        // bind later
    }
    if params.broadcast_type.is_some() {
        where_clauses.push(format!("broadcast_type = ${}", param_idx));
        param_idx += 1;
    }

    let where_sql = if where_clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", where_clauses.join(" AND "))
    };

    // Fetch broadcasts
    let query_sql = format!(
        "SELECT id, title, message, broadcast_type, severity, link, link_text, target_plan, is_active, starts_at, expires_at, created_by, created_at, updated_at
         FROM broadcasts {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
        where_sql, param_idx, param_idx + 1
    );
    let mut query = sqlx::query_as::<_, Broadcast>(&query_sql);
    if let Some(active) = params.is_active {
        query = query.bind(active);
    }
    if let Some(ref bt) = params.broadcast_type {
        query = query.bind(bt);
    }
    query = query.bind(per_page).bind(offset);
    let broadcasts = query.fetch_all(&pool).await?;

    // Count
    let count_sql = format!("SELECT COUNT(*) FROM broadcasts {}", where_sql);
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
    if let Some(active) = params.is_active {
        count_query = count_query.bind(active);
    }
    if let Some(ref bt) = params.broadcast_type {
        count_query = count_query.bind(bt);
    }
    let total = count_query.fetch_one(&pool).await?;

    Ok(Json(BroadcastListResponse {
        broadcasts,
        total,
        page,
        per_page,
    }))
}

/// POST /v1/admin/broadcasts — Create a new broadcast (admin only).
pub async fn create_broadcast(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateBroadcastRequest>,
) -> Result<Json<Broadcast>, AppError> {
    require_admin_write(&customer)?;

    // Validate
    if req.title.trim().is_empty() {
        return Err(AppError::coded(ErrorCode::TitleRequired));
    }
    if req.message.trim().is_empty() {
        return Err(AppError::BadRequest("Message is required".into()));
    }
    validate_broadcast_type(&req.broadcast_type)?;
    validate_severity(&req.severity)?;

    let broadcast = sqlx::query_as::<_, Broadcast>(
        "INSERT INTO broadcasts (title, message, broadcast_type, severity, link, link_text, target_plan, starts_at, expires_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, title, message, broadcast_type, severity, link, link_text, target_plan, is_active, starts_at, expires_at, created_by, created_at, updated_at"
    )
    .bind(req.title.trim())
    .bind(req.message.trim())
    .bind(&req.broadcast_type)
    .bind(&req.severity)
    .bind(req.link.as_deref().filter(|s| !s.trim().is_empty()))
    .bind(req.link_text.as_deref().filter(|s| !s.trim().is_empty()))
    .bind(req.target_plan.as_deref())
    .bind(req.starts_at)
    .bind(req.expires_at)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "📢 Admin created broadcast: '{}' (type={}, severity={})",
        broadcast.title,
        broadcast.broadcast_type,
        broadcast.severity
    );

    Ok(Json(broadcast))
}

/// PUT /v1/admin/broadcasts/:id — Update a broadcast (admin only).
pub async fn update_broadcast(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateBroadcastRequest>,
) -> Result<Json<Broadcast>, AppError> {
    require_admin_write(&customer)?;

    if let Some(ref t) = req.broadcast_type {
        validate_broadcast_type(t)?;
    }
    if let Some(ref s) = req.severity {
        validate_severity(s)?;
    }

    let broadcast = sqlx::query_as::<_, Broadcast>(
        "UPDATE broadcasts SET
            title = COALESCE($1, title),
            message = COALESCE($2, message),
            broadcast_type = COALESCE($3, broadcast_type),
            severity = COALESCE($4, severity),
            link = COALESCE($5, link),
            link_text = COALESCE($6, link_text),
            target_plan = COALESCE($7, target_plan),
            is_active = COALESCE($8, is_active),
            starts_at = COALESCE($9, starts_at),
            expires_at = COALESCE($10, expires_at),
            updated_at = NOW()
         WHERE id = $11
         RETURNING id, title, message, broadcast_type, severity, link, link_text, target_plan, is_active, starts_at, expires_at, created_by, created_at, updated_at"
    )
    .bind(req.title.as_deref().filter(|s| !s.trim().is_empty()))
    .bind(req.message.as_deref().filter(|s| !s.trim().is_empty()))
    .bind(req.broadcast_type.as_deref())
    .bind(req.severity.as_deref())
    .bind(req.link.as_deref().filter(|s| !s.trim().is_empty()))
    .bind(req.link_text.as_deref().filter(|s| !s.trim().is_empty()))
    .bind(req.target_plan.as_deref())
    .bind(req.is_active)
    .bind(req.starts_at)
    .bind(req.expires_at)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    tracing::info!("📢 Admin updated broadcast: {}", broadcast.title);

    Ok(Json(broadcast))
}

/// DELETE /v1/admin/broadcasts/:id — Delete a broadcast (admin only).
pub async fn delete_broadcast(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let result = sqlx::query("DELETE FROM broadcasts WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("📢 Admin deleted broadcast: {}", id);

    Ok(Json(serde_json::json!({ "deleted": true })))
}

/// GET /v1/admin/broadcasts/:id — Get a single broadcast (admin only).
pub async fn get_broadcast(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Broadcast>, AppError> {
    require_admin(&customer)?;

    let broadcast = sqlx::query_as::<_, Broadcast>(
        "SELECT id, title, message, broadcast_type, severity, link, link_text, target_plan, is_active, starts_at, expires_at, created_by, created_at, updated_at
         FROM broadcasts WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(broadcast))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_broadcast_type_valid() {
        assert!(validate_broadcast_type("maintenance").is_ok());
        assert!(validate_broadcast_type("feature").is_ok());
        assert!(validate_broadcast_type("announcement").is_ok());
        assert!(validate_broadcast_type("incident").is_ok());
    }

    #[test]
    fn test_validate_broadcast_type_invalid() {
        assert!(validate_broadcast_type("invalid").is_err());
        assert!(validate_broadcast_type("").is_err());
    }

    #[test]
    fn test_validate_severity_valid() {
        assert!(validate_severity("info").is_ok());
        assert!(validate_severity("warning").is_ok());
        assert!(validate_severity("critical").is_ok());
    }

    #[test]
    fn test_validate_severity_invalid() {
        assert!(validate_severity("urgent").is_err());
        assert!(validate_severity("low").is_err());
    }

    #[test]
    fn test_default_broadcast_type() {
        assert_eq!(default_broadcast_type(), "announcement");
    }

    #[test]
    fn test_default_severity() {
        assert_eq!(default_severity(), "info");
    }

    #[test]
    fn test_create_request_deserialization() {
        let json = r#"{"title":"Maintenance","message":"We will be down for 30 minutes"}"#;
        let req: CreateBroadcastRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, "Maintenance");
        assert_eq!(req.message, "We will be down for 30 minutes");
        assert_eq!(req.broadcast_type, "announcement");
        assert_eq!(req.severity, "info");
        assert!(req.link.is_none());
    }

    #[test]
    fn test_create_request_full() {
        let json = r#"{
            "title":"New Feature",
            "message":"Check out our new dashboard!",
            "broadcast_type":"feature",
            "severity":"info",
            "link":"https://hooksniff.vercel.app/dashboard",
            "link_text":"View Dashboard",
            "target_plan":"pro"
        }"#;
        let req: CreateBroadcastRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.broadcast_type, "feature");
        assert_eq!(req.link, Some("https://hooksniff.vercel.app/dashboard".to_string()));
        assert_eq!(req.link_text, Some("View Dashboard".to_string()));
        assert_eq!(req.target_plan, Some("pro".to_string()));
    }

    #[test]
    fn test_broadcast_serialization() {
        let b = Broadcast {
            id: Uuid::new_v4(),
            title: "Test".to_string(),
            message: "Body".to_string(),
            broadcast_type: "announcement".to_string(),
            severity: "info".to_string(),
            link: None,
            link_text: None,
            target_plan: None,
            is_active: true,
            starts_at: None,
            expires_at: None,
            created_by: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_value(&b).unwrap();
        assert_eq!(json["title"], "Test");
        assert_eq!(json["broadcast_type"], "announcement");
        assert!(json["is_active"].as_bool().unwrap());
    }
}
