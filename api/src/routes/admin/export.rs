//! CSV export for users and revenue.

use axum::extract::{Extension, Query};
use axum::http::{HeaderMap, HeaderValue};
use axum::response::IntoResponse;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::Customer;

use super::{require_admin, stats::RevenueRow};

// ── Users CSV Export ──────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExportUsersParams {
    pub format: Option<String>,
    pub plan: Option<String>,
    pub status: Option<String>,
    pub created_after: Option<String>,
}

/// GET /v1/admin/users/export — Export users as CSV.
pub async fn export_users_csv(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ExportUsersParams>,
) -> Result<impl IntoResponse, AppError> {
    require_admin(&customer)?;

    let format = params.format.unwrap_or_else(|| "csv".to_string());
    if format != "csv" {
        return Err(AppError::coded(ErrorCode::CsvOnly));
    }

    let mut conditions: Vec<String> = Vec::new();
    let mut bind_idx = 1;

    if params.plan.is_some() {
        conditions.push(format!("plan = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.status.is_some() {
        conditions.push(format!("is_active = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.created_after.is_some() {
        conditions.push(format!("created_at >= ${}", bind_idx));
        let _ = bind_idx;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let query_str = format!(
        "SELECT id, email, name, plan, is_active, created_at FROM customers {} ORDER BY created_at DESC LIMIT 10000",
        where_clause
    );

    let mut query = sqlx::query_as::<_, (Uuid, String, Option<String>, String, bool, DateTime<Utc>)>(
        &query_str,
    );

    if let Some(ref plan) = params.plan {
        query = query.bind(plan);
    }
    if let Some(ref status) = params.status {
        let is_active = status == "active";
        query = query.bind(is_active);
    }
    if let Some(ref created_after) = params.created_after {
        if let Ok(date) = chrono::NaiveDate::parse_from_str(created_after, "%Y-%m-%d") {
            let datetime = date.and_hms_opt(0, 0, 0).unwrap_or_default();
            query = query.bind(datetime);
        }
    }

    let rows = query.fetch_all(&pool).await?;

    let mut csv = String::from("id,email,name,plan,status,created_at\n");
    for (id, email, name, plan, is_active, created_at) in &rows {
        let status = if *is_active { "active" } else { "banned" };
        let name_escaped = name.as_deref().unwrap_or("");
        csv.push_str(&format!(
            "{},{},{},{},{},{}\n",
            id,
            escape_csv(email),
            escape_csv(name_escaped),
            escape_csv(plan),
            status,
            created_at.to_rfc3339()
        ));
    }

    let mut headers = HeaderMap::new();
    headers.insert(
        "Content-Type",
        HeaderValue::from_static("text/csv; charset=utf-8"),
    );
    headers.insert(
        "Content-Disposition",
        HeaderValue::from_static("attachment; filename=\"users_export.csv\""),
    );

    Ok((headers, csv))
}

// ── Revenue CSV Export ────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExportRevenueParams {
    pub format: Option<String>,
    pub months: Option<i64>,
}

/// GET /v1/admin/revenue/export — Export revenue as CSV.
pub async fn export_revenue_csv(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ExportRevenueParams>,
) -> Result<impl IntoResponse, AppError> {
    require_admin(&customer)?;

    let format = params.format.unwrap_or_else(|| "csv".to_string());
    if format != "csv" {
        return Err(AppError::coded(ErrorCode::CsvOnly));
    }

    let months = params.months.unwrap_or(12).clamp(1, 60);

    let rows = sqlx::query_as::<_, RevenueRow>(
        r#"SELECT
            TO_CHAR(DATE_TRUNC('month', NOW()) - (n || ' months')::interval, 'YYYY-MM') as month,
            COALESCE(
                (SELECT SUM(amount_cents::double precision / 100.0)
                 FROM invoices
                 WHERE status = 'paid'
                   AND paid_at >= DATE_TRUNC('month', NOW()) - (n || ' months')::interval
                   AND paid_at < DATE_TRUNC('month', NOW()) - ((n - 1) || ' months')::interval),
                0.0
            ) as revenue
        FROM generate_series(0, $1 - 1) as n
        ORDER BY month"#,
    )
    .bind(months)
    .fetch_all(&pool)
    .await?;

    let mut csv = String::from("month,revenue\n");
    for row in &rows {
        csv.push_str(&format!("{},{:.2}\n", row.month, row.revenue));
    }

    let mut headers = HeaderMap::new();
    headers.insert(
        "Content-Type",
        HeaderValue::from_static("text/csv; charset=utf-8"),
    );
    headers.insert(
        "Content-Disposition",
        HeaderValue::from_static("attachment; filename=\"revenue_export.csv\""),
    );

    Ok((headers, csv))
}

// ── Helpers ───────────────────────────────────────────────

/// Escape a string for CSV (wrap in quotes if it contains comma, quote, or newline).
fn escape_csv(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_users_params_defaults() {
        let params = ExportUsersParams {
            format: None,
            plan: None,
            status: None,
            created_after: None,
        };
        assert!(params.format.is_none());
        assert!(params.plan.is_none());
    }

    #[test]
    fn test_export_revenue_params_defaults() {
        let params = ExportRevenueParams {
            format: None,
            months: None,
        };
        assert!(params.format.is_none());
        assert!(params.months.is_none());
    }

    #[test]
    fn test_escape_csv_simple() {
        assert_eq!(escape_csv("hello"), "hello");
    }

    #[test]
    fn test_escape_csv_with_comma() {
        assert_eq!(escape_csv("hello, world"), "\"hello, world\"");
    }

    #[test]
    fn test_escape_csv_with_quote() {
        assert_eq!(escape_csv("say \"hi\""), "\"say \"\"hi\"\"\"");
    }
}
