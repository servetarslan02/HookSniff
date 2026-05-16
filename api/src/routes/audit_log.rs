//! Audit Log API
//!
//! Tracks user actions for compliance and security monitoring.
//!
//! ## Endpoints
//!
//! - `GET /audit-log` — List audit log entries (paginated, filterable)
//! - `GET /audit-log/:id` — Get single audit entry
//!
//! ## Action Categories
//!
//! - `auth` — Login, logout, password change, 2FA
//! - `endpoint` — Create, update, delete endpoints
//! - `webhook` — Send, replay webhooks
//! - `team` — Invite, remove members
//! - `settings` — Update settings, billing
//! - `api_key` — Create, revoke API keys

use axum::{
    extract::{Extension, Path, Query},
    routing::get,
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_audit_entries))
        .route("/{id}", get(get_audit_entry))
}

/// Query parameters for listing audit log entries
#[derive(Debug, Deserialize)]
pub struct AuditLogQuery {
    pub action: Option<String>,
    pub resource_type: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub page: Option<i64>,
}

/// Audit log entry response
#[derive(Debug, Serialize)]
pub struct AuditEntry {
    pub id: Uuid,
    pub action: String,
    pub resource_type: String,
    pub resource_id: Option<String>,
    pub details: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
    pub timestamp: DateTime<Utc>,
    pub actor: String,
    pub actor_email: String,
}

/// Paginated audit log response
#[derive(Debug, Serialize)]
pub struct AuditLogResponse {
    pub entries: Vec<AuditEntry>,
    pub total: i64,
    pub limit: i64,
    pub offset: i64,
    pub has_more: bool,
}

/// GET /audit-log — List audit log entries for the authenticated customer
async fn list_audit_entries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<AuditLogQuery>,
) -> Result<Json<AuditLogResponse>, AppError> {
    let limit = query.limit.unwrap_or(50).min(200);
    // Support both page (1-indexed) and offset (0-indexed)
    let offset = if let Some(page) = query.page {
        (page.max(1) - 1) * limit
    } else {
        query.offset.unwrap_or(0)
    };

    // Build dynamic query
    let mut where_clauses = vec!["customer_id = $1".to_string()];
    let mut param_index = 2;

    if query.action.is_some() {
        where_clauses.push(format!("action = ${}", param_index));
        param_index += 1;
    }
    if query.resource_type.is_some() {
        where_clauses.push(format!("resource_type = ${}", param_index));
        param_index += 1;
    }

    let where_sql = where_clauses.join(" AND ");

    // Count total
    let count_sql = format!("SELECT COUNT(*) FROM audit_log WHERE {}", where_sql);
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql).bind(customer.id);
    if let Some(ref action) = query.action {
        count_query = count_query.bind(action);
    }
    if let Some(ref resource_type) = query.resource_type {
        count_query = count_query.bind(resource_type);
    }
    let total = count_query.fetch_one(&pool).await?;

    // Fetch entries with customer info
    // NOTE: where_sql already uses unqualified column names; the `a.` alias
    // is applied here so we must NOT also prefix in the replace() chain.
    let data_sql =
        format!(
        "SELECT a.id, a.action, a.resource_type, a.resource_id, a.details, a.ip_address, a.user_agent, a.created_at,
                COALESCE(c.name, 'Unknown') as actor, COALESCE(c.email, 'unknown') as actor_email
         FROM audit_log a LEFT JOIN customers c ON c.id = a.customer_id
         WHERE {} ORDER BY a.created_at DESC LIMIT ${} OFFSET ${}",
        where_sql.replace("customer_id", "a.customer_id").replace("action = ", "a.action = ").replace("resource_type = ", "a.resource_type = "), param_index, param_index + 1
    );
    let mut data_query = sqlx::query_as::<
        _,
        (
            Uuid,
            String,
            String,
            Option<String>,
            Option<serde_json::Value>,
            Option<String>,
            Option<String>,
            DateTime<Utc>,
            String,
            String,
        ),
    >(&data_sql)
    .bind(customer.id);
    if let Some(ref action) = query.action {
        data_query = data_query.bind(action);
    }
    if let Some(ref resource_type) = query.resource_type {
        data_query = data_query.bind(resource_type);
    }
    data_query = data_query.bind(limit).bind(offset);

    let rows = data_query.fetch_all(&pool).await?;

    let entries = rows
        .into_iter()
        .map(
            |(
                id,
                action,
                resource_type,
                resource_id,
                details,
                ip_address,
                user_agent,
                created_at,
                actor,
                actor_email,
            )| {
                AuditEntry {
                    id,
                    action,
                    resource_type,
                    resource_id,
                    details,
                    ip_address,
                    user_agent,
                    timestamp: created_at,
                    actor,
                    actor_email,
                    created_at,
                }
            },
        )
        .collect();

    Ok(Json(AuditLogResponse {
        entries,
        total,
        limit,
        offset,
        has_more: offset + limit < total,
    }))
}

/// Row type for audit log queries (id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
type AuditLogRow = (
    Uuid,
    String,
    String,
    Option<String>,
    Option<serde_json::Value>,
    Option<String>,
    Option<String>,
    DateTime<Utc>,
    String,
    String,
);

/// GET /audit-log/:id — Get a single audit log entry
async fn get_audit_entry(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(entry_id): Path<Uuid>,
) -> Result<Json<AuditEntry>, AppError> {
    let row: Option<AuditLogRow> = sqlx::query_as(
        "SELECT a.id, a.action, a.resource_type, a.resource_id, a.details, a.ip_address, a.user_agent, a.created_at,
                COALESCE(c.name, 'Unknown') as actor, COALESCE(c.email, 'unknown') as actor_email
         FROM audit_log a LEFT JOIN customers c ON c.id = a.customer_id
         WHERE a.id = $1 AND a.customer_id = $2",
    )
    .bind(entry_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let (id, action, resource_type, resource_id, details, ip_address, user_agent, created_at, actor, actor_email) =
        row.ok_or(AppError::NotFound)?;

    Ok(Json(AuditEntry {
        id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        timestamp: created_at,
        actor,
        actor_email,
        created_at,
    }))
}

// ── Helper: Insert audit log entry ──────────────────────────

// Re-export from the top-level audit module (canonical location).
pub use crate::audit::log_action;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audit_log_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_audit_log_query_defaults() {
        let q = AuditLogQuery {
            action: None,
            resource_type: None,
            limit: None,
            offset: None,
            page: None,
        };
        assert!(q.action.is_none());
        assert_eq!(q.limit.unwrap_or(50), 50);
        assert_eq!(q.offset.unwrap_or(0), 0);
    }

    #[test]
    fn test_audit_entry_serialization() {
        let entry = AuditEntry {
            id: Uuid::new_v4(),
            action: "endpoint.created".to_string(),
            resource_type: "endpoint".to_string(),
            resource_id: Some("ep_123".to_string()),
            details: Some(serde_json::json!({"name": "test"})),
            ip_address: Some("1.2.3.4".to_string()),
            user_agent: Some("Mozilla/5.0".to_string()),
            created_at: Utc::now(),
            timestamp: Utc::now(),
            actor: "Test User".to_string(),
            actor_email: "test@example.com".to_string(),
        };
        let json = serde_json::to_value(&entry).unwrap();
        assert_eq!(json["action"], "endpoint.created");
        assert_eq!(json["resource_type"], "endpoint");
        assert_eq!(json["actor"], "Test User");
        assert_eq!(json["actor_email"], "test@example.com");
    }

    #[test]
    fn test_audit_log_response_serialization() {
        let resp = AuditLogResponse {
            entries: vec![],
            total: 0,
            limit: 50,
            offset: 0,
            has_more: false,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["limit"], 50);
        assert_eq!(json["has_more"], false);
    }
}
