//! Customer relationship management — notes, tags, communications.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono;
use serde::Deserialize;
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Communication Logger (shared across modules) ──────────

/// Log a communication event to `communication_history`.
pub async fn log_communication(
    pool: &PgPool,
    customer_id: Uuid,
    comm_type: &str,
    subject: Option<&str>,
    details: Option<serde_json::Value>,
    admin_user_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO communication_history (customer_id, type, subject, details, admin_user_id) VALUES ($1, $2, $3, $4, $5)"
    )
    .bind(customer_id)
    .bind(comm_type)
    .bind(subject)
    .bind(details)
    .bind(admin_user_id)
    .execute(pool)
    .await?;
    Ok(())
}

// ── Request / Response Types ──────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateNoteRequest {
    pub content: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateTagRequest {
    pub tag: String,
}

#[derive(Debug, serde::Serialize, FromRow)]
pub struct CustomerNote {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub admin_user_id: Uuid,
    pub content: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, serde::Serialize, FromRow)]
pub struct CustomerTag {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub tag: String,
    pub admin_user_id: Uuid,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, serde::Serialize, FromRow)]
pub struct CommunicationEntry {
    pub id: Uuid,
    pub customer_id: Uuid,
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub comm_type: String,
    pub subject: Option<String>,
    pub details: Option<serde_json::Value>,
    pub admin_user_id: Option<Uuid>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CommunicationQuery {
    pub r#type: Option<String>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

// ── Notes ─────────────────────────────────────────────────

/// POST /v1/admin/users/:id/notes — Add a note to customer.
pub async fn admin_add_note(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateNoteRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if req.content.trim().is_empty() {
        return Err(AppError::BadRequest(
            "Note content cannot be empty".into(),
        ));
    }

    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM customers WHERE id = $1)")
            .bind(id)
            .fetch_one(&pool)
            .await?;
    if !exists {
        return Err(AppError::NotFound);
    }

    let note = sqlx::query_as::<_, CustomerNote>(
        "INSERT INTO customer_notes (customer_id, admin_user_id, content) VALUES ($1, $2, $3) RETURNING id, customer_id, admin_user_id, content, created_at"
    )
    .bind(id)
    .bind(customer.id)
    .bind(req.content.trim())
    .fetch_one(&pool)
    .await?;

    let _ = log_communication(
        &pool,
        id,
        "note",
        Some("Admin note added"),
        Some(serde_json::json!({ "note_id": note.id, "preview": &note.content[..note.content.len().min(100)] })),
        customer.id,
    )
    .await;

    Ok(Json(serde_json::json!({
        "note": note,
        "message": "Note added"
    })))
}

/// GET /v1/admin/users/:id/notes — List customer notes.
pub async fn admin_list_notes(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let notes = sqlx::query_as::<_, CustomerNote>(
        "SELECT id, customer_id, admin_user_id, content, created_at FROM customer_notes WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "notes": notes,
        "total": notes.len()
    })))
}

// ── Tags ──────────────────────────────────────────────────

/// POST /v1/admin/users/:id/tags — Add tag to customer.
pub async fn admin_add_tag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateTagRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let tag = req.tag.trim().to_lowercase();
    if tag.is_empty() {
        return Err(AppError::BadRequest("Tag cannot be empty".into()));
    }
    if tag.len() > 50 {
        return Err(AppError::BadRequest("Tag too long (max 50 chars)".into()));
    }

    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM customers WHERE id = $1)")
            .bind(id)
            .fetch_one(&pool)
            .await?;
    if !exists {
        return Err(AppError::NotFound);
    }

    let result = sqlx::query(
        "INSERT INTO customer_tags (customer_id, tag, admin_user_id) VALUES ($1, $2, $3) ON CONFLICT (customer_id, tag) DO NOTHING"
    )
    .bind(id)
    .bind(&tag)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() > 0 {
        let _ = log_communication(
            &pool,
            id,
            "tag_added",
            Some(&format!("Tag: {}", tag)),
            Some(serde_json::json!({ "tag": tag })),
            customer.id,
        )
        .await;
    }

    Ok(Json(serde_json::json!({
        "tag": tag,
        "added": result.rows_affected() > 0,
        "message": if result.rows_affected() > 0 { "Tag added" } else { "Tag already exists" }
    })))
}

/// DELETE /v1/admin/users/:id/tags/:tag — Remove tag from customer.
pub async fn admin_remove_tag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((id, tag)): Path<(Uuid, String)>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let tag_lower = tag.trim().to_lowercase();
    let result =
        sqlx::query("DELETE FROM customer_tags WHERE customer_id = $1 AND tag = $2")
            .bind(id)
            .bind(&tag_lower)
            .execute(&pool)
            .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    let _ = log_communication(
        &pool,
        id,
        "tag_removed",
        Some(&format!("Tag: {}", tag_lower)),
        Some(serde_json::json!({ "tag": tag_lower })),
        customer.id,
    )
    .await;

    Ok(Json(serde_json::json!({
        "tag": tag_lower,
        "removed": true,
        "message": "Tag removed"
    })))
}

/// GET /v1/admin/users/:id/tags — List customer tags.
pub async fn admin_list_tags(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let tags = sqlx::query_as::<_, CustomerTag>(
        "SELECT id, customer_id, tag, admin_user_id, created_at FROM customer_tags WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "tags": tags,
        "total": tags.len()
    })))
}

// ── Communications ────────────────────────────────────────

/// GET /v1/admin/users/:id/communications — List communication history.
pub async fn admin_list_communications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<CommunicationQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let (_where_clause, query_builder_count, query_builder_data) =
        if let Some(ref comm_type) = params.r#type {
            (
                "WHERE customer_id = $1 AND type = $2".to_string(),
                sqlx::query_scalar::<_, i64>(
                    "SELECT COUNT(*) FROM communication_history WHERE customer_id = $1 AND type = $2",
                )
                .bind(id)
                .bind(comm_type.clone()),
                sqlx::query_as::<_, CommunicationEntry>(
                    "SELECT id, customer_id, type, subject, details, admin_user_id, created_at FROM communication_history WHERE customer_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
                )
                .bind(id)
                .bind(comm_type.clone()),
            )
        } else {
            (
                "WHERE customer_id = $1".to_string(),
                sqlx::query_scalar::<_, i64>(
                    "SELECT COUNT(*) FROM communication_history WHERE customer_id = $1",
                )
                .bind(id),
                sqlx::query_as::<_, CommunicationEntry>(
                    "SELECT id, customer_id, type, subject, details, admin_user_id, created_at FROM communication_history WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
                )
                .bind(id),
            )
        };

    let total: i64 = query_builder_count.fetch_one(&pool).await?;
    let entries = query_builder_data
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "communications": entries,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_create_note_request_deserialization() {
        let json = r#"{"content": "This customer wants to upgrade"}"#;
        let req: CreateNoteRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.content, "This customer wants to upgrade");
    }

    #[test]
    fn test_create_tag_request_deserialization() {
        let json = r#"{"tag": "vip"}"#;
        let req: CreateTagRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.tag, "vip");
    }

    #[test]
    fn test_communication_query_defaults() {
        let json = r#"{}"#;
        let params: CommunicationQuery = serde_json::from_str(json).unwrap();
        assert!(params.r#type.is_none());
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
    }

    #[test]
    fn test_customer_note_serialization() {
        let note = CustomerNote {
            id: Uuid::nil(),
            customer_id: Uuid::nil(),
            admin_user_id: Uuid::nil(),
            content: "Test note".to_string(),
            created_at: Utc.timestamp_opt(1700000000, 0).unwrap(),
        };
        let json = serde_json::to_value(&note).unwrap();
        assert_eq!(json["content"], "Test note");
    }

    #[test]
    fn test_customer_tag_serialization() {
        let tag = CustomerTag {
            id: Uuid::nil(),
            customer_id: Uuid::nil(),
            tag: "vip".to_string(),
            admin_user_id: Uuid::nil(),
            created_at: Utc.timestamp_opt(1700000000, 0).unwrap(),
        };
        let json = serde_json::to_value(&tag).unwrap();
        assert_eq!(json["tag"], "vip");
    }

    #[test]
    fn test_communication_entry_serialization() {
        let entry = CommunicationEntry {
            id: Uuid::nil(),
            customer_id: Uuid::nil(),
            comm_type: "email".to_string(),
            subject: Some("Welcome".to_string()),
            details: Some(serde_json::json!({ "key": "value" })),
            admin_user_id: Some(Uuid::nil()),
            created_at: Utc.timestamp_opt(1700000000, 0).unwrap(),
        };
        let json = serde_json::to_value(&entry).unwrap();
        assert_eq!(json["type"], "email");
        assert_eq!(json["subject"], "Welcome");
    }

    use chrono::Utc;
}

    #[test]
    fn test_communication_query_with_type() {
        let json = r#"{"type": "email", "page": 2, "per_page": 25}"#;
        let params: CommunicationQuery = serde_json::from_str(json).unwrap();
        assert_eq!(params.r#type.as_deref(), Some("email"));
        assert_eq!(params.page, Some(2));
        assert_eq!(params.per_page, Some(25));
    }

    #[test]
    fn test_create_note_request_empty_rejected() {
        let json = r#"{"content": ""}"#;
        let req: CreateNoteRequest = serde_json::from_str(json).unwrap();
        assert!(req.content.is_empty());
    }
