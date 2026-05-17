//! Admin audit log viewer.

use axum::extract::{Extension, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::require_admin;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminAuditLogQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub action: Option<String>,
    pub admin_id: Option<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct AdminAuditLogResponse {
    pub entries: Vec<AdminAuditEntry>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, Serialize)]
pub struct AdminAuditEntry {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub customer_email: Option<String>,
    pub action: String,
    pub resource_type: String,
    pub resource_id: Option<String>,
    pub details: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    #[serde(skip_serializing)]
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// GET /v1/admin/audit-logs — Admin-only audit log (all users).
pub async fn admin_audit_logs(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<AdminAuditLogQuery>,
) -> Result<Json<AdminAuditLogResponse>, AppError> {
    require_admin(&customer)?;

    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let mut conditions: Vec<String> = Vec::new();
    let mut bind_idx = 1;

    if query.action.is_some() {
        conditions.push(format!("a.action = ${}", bind_idx));
        bind_idx += 1;
    }
    if query.admin_id.is_some() {
        conditions.push(format!("a.customer_id = ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_sql = format!("SELECT COUNT(*) FROM audit_log a {}", where_clause);
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql);
    if let Some(ref action) = query.action {
        count_q = count_q.bind(action);
    }
    if let Some(ref admin_id) = query.admin_id {
        count_q = count_q.bind(admin_id);
    }
    let total = count_q.fetch_one(&pool).await?;

    let data_sql = format!(
        "SELECT a.id, a.customer_id, c.email, a.action, a.resource_type, a.resource_id, a.details, a.ip_address, a.created_at \
         FROM audit_log a LEFT JOIN customers c ON c.id = a.customer_id {} ORDER BY a.created_at DESC LIMIT ${} OFFSET ${}",
        where_clause, bind_idx, bind_idx + 1
    );

    let mut data_q = sqlx::query_as::<
        _,
        (
            Uuid,
            Uuid,
            Option<String>,
            String,
            String,
            Option<String>,
            Option<serde_json::Value>,
            Option<String>,
            DateTime<Utc>,
        ),
    >(&data_sql);

    if let Some(ref action) = query.action {
        data_q = data_q.bind(action);
    }
    if let Some(ref admin_id) = query.admin_id {
        data_q = data_q.bind(admin_id);
    }
    data_q = data_q.bind(per_page).bind(offset);

    let rows = data_q.fetch_all(&pool).await?;

    let entries = rows
        .into_iter()
        .map(
            |(id, customer_id, customer_email, action, resource_type, resource_id, details, ip_address, created_at)| {
                AdminAuditEntry {
                    id,
                    customer_id,
                    customer_email,
                    action,
                    resource_type,
                    resource_id,
                    details,
                    ip_address,
                    user_agent: None,
                    created_at,
                }
            },
        )
        .collect();

    Ok(Json(AdminAuditLogResponse {
        entries,
        total,
        page,
        per_page,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_admin_audit_entry_serialization() {
        let entry = AdminAuditEntry {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            customer_email: Some("admin@example.com".to_string()),
            action: "LOGIN".to_string(),
            resource_type: "auth".to_string(),
            resource_id: None,
            details: None,
            ip_address: Some("1.2.3.4".to_string()),
            user_agent: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&entry).unwrap();
        assert_eq!(json["action"], "LOGIN");
        assert!(json.get("customer_id").is_some());
    }
}
