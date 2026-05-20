use axum::Extension;
use sqlx::PgPool;
use serde_json::json;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::require_admin;

/// GET /v1/admin/dashboard — Aggregated admin dashboard stats.
pub async fn admin_dashboard(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<axum::Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let total_users: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM customers")
        .fetch_one(&pool)
        .await?;

    let active_today: (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT customer_id) FROM audit_log WHERE created_at > NOW() - INTERVAL '24 hours'"
    )
    .fetch_one(&pool)
    .await?;

    let total_deliveries: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries")
        .fetch_one(&pool)
        .await?;

    let total_revenue: (Option<String>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount)::TEXT, '0') FROM payment_transactions WHERE status = 'succeeded'"
    )
    .fetch_one(&pool)
    .await?;

    let users_by_plan = sqlx::query_as::<_, (String, i64)>(
        "SELECT plan, COUNT(*) FROM customers GROUP BY plan ORDER BY COUNT(*) DESC"
    )
    .fetch_all(&pool)
    .await?;

    let plan_map: serde_json::Value = users_by_plan
        .into_iter()
        .map(|(plan, count)| (plan, json!(count)))
        .collect();

    Ok(axum::Json(json!({
        "total_users": total_users.0,
        "active_users_today": active_today.0,
        "total_deliveries": total_deliveries.0,
        "total_revenue": total_revenue.0.unwrap_or_else(|| "0".to_string()),
        "users_by_plan": plan_map,
    })))
}
