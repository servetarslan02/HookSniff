use axum::extract::{Extension, Path, Query};
use axum::routing::{get, put};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/users", get(list_users))
        .route("/users/:id", get(get_user_detail))
        .route("/users/:id/plan", put(change_plan))
        .route("/users/:id/status", put(change_status))
        .route("/stats", get(system_stats))
        .route("/revenue", get(revenue_by_month))
}

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub search: Option<String>,
    pub plan: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedUsers {
    pub users: Vec<UserSummary>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct UserSummary {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    #[sqlx(rename = "is_active")]
    #[serde(rename = "status", serialize_with = "serialize_status")]
    is_active: bool,
    pub is_admin: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

fn serialize_status<S: serde::Serializer>(is_active: &bool, s: S) -> Result<S::Ok, S::Error> {
    s.serialize_str(if *is_active { "active" } else { "banned" })
}

#[derive(Debug, Serialize)]
pub struct UserDetailResponse {
    pub user: UserSummary,
    pub endpoints: Vec<EndpointSummary>,
    pub recent_deliveries: Vec<DeliverySummary>,
    pub usage_stats: UsageStats,
}

#[derive(Debug, Serialize)]
pub struct UsageStats {
    pub total_deliveries: i64,
    pub success_rate: f64,
    pub endpoints_count: i64,
}

#[derive(Debug, Serialize)]
pub struct UserDetail {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub is_active: bool,
    pub is_admin: bool,
    pub webhook_limit: i32,
    pub webhook_count: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub endpoints: Vec<EndpointSummary>,
    pub recent_deliveries: Vec<DeliverySummary>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct EndpointSummary {
    pub id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DeliverySummary {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub status: String,
    pub event_type: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct PlanRequest {
    pub plan: String,
}

#[derive(Debug, Deserialize)]
pub struct StatusRequest {
    pub is_active: bool,
}

#[derive(Debug, Serialize)]
pub struct SystemStats {
    pub total_users: i64,
    pub total_deliveries: i64,
    pub total_revenue: f64,
    pub active_users_today: i64,
    pub users_by_plan: Vec<PlanCount>,
    pub recent_signups: Vec<RecentSignup>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct PlanCount {
    pub plan: String,
    pub count: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct RecentSignup {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct RevenueRow {
    pub month: String,
    pub revenue: f64,
}

/// Admin middleware — call this as a layer on admin routes, or check inline.
/// Returns 403 if the customer is not an admin.
fn require_admin(customer: &Customer) -> Result<(), AppError> {
    if !customer.is_admin {
        return Err(AppError::Forbidden("Admin access required".into()));
    }
    Ok(())
}

/// GET /v1/admin/users — List all customers with pagination and filters
async fn list_users(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<PaginatedUsers>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    // Build dynamic WHERE clauses
    let mut conditions: Vec<String> = Vec::new();
    let mut bind_idx = 1;

    if params.search.is_some() {
        conditions.push(format!("(email ILIKE ${0} OR name ILIKE ${0})", bind_idx));
        bind_idx += 1;
    }
    if params.plan.is_some() {
        conditions.push(format!("plan = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.status.is_some() {
        conditions.push(format!("is_active = ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let base_query = format!(
        "SELECT id, email, name, plan, is_active, is_admin, created_at FROM customers {} ORDER BY created_at DESC",
        where_clause
    );
    let count_query = format!("SELECT COUNT(*) FROM customers {}", where_clause);

    // Bind parameters to both queries
    let mut users_query = sqlx::query_as::<_, UserSummary>(&base_query);
    let mut count_query = sqlx::query_as::<_, (i64,)>(&count_query);

    let search_pattern = params.search.as_ref().map(|s| {
        let escaped = s
            .replace('\\', "\\\\")
            .replace('%', "\\%")
            .replace('_', "\\_");
        format!("%{}%", escaped)
    });
    if let Some(ref pattern) = search_pattern {
        users_query = users_query.bind(pattern);
        count_query = count_query.bind(pattern);
    }
    if let Some(ref plan) = params.plan {
        users_query = users_query.bind(plan);
        count_query = count_query.bind(plan);
    }
    if let Some(ref status) = params.status {
        let is_active = status == "active";
        users_query = users_query.bind(is_active);
        count_query = count_query.bind(is_active);
    }

    let users = users_query
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

    let total = count_query.fetch_one(&pool).await?.0;

    Ok(Json(PaginatedUsers {
        users,
        total,
        page,
        per_page,
    }))
}

/// GET /v1/admin/users/:id — Get customer detail with endpoints and recent deliveries
async fn get_user_detail(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<UserDetailResponse>, AppError> {
    require_admin(&customer)?;

    let user = sqlx::query_as::<_, UserSummary>(
        "SELECT id, email, name, plan, is_active, is_admin, created_at FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let endpoints = sqlx::query_as::<_, EndpointSummary>(
        "SELECT id, url, description, is_active FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let recent_deliveries = sqlx::query_as::<_, DeliverySummary>(
        "SELECT id, endpoint_id, status, event_type, created_at \
         FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    // Usage stats
    let total_deliveries: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let successful: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'delivered'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let endpoints_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let success_rate = if total_deliveries.0 > 0 {
        (successful.0 as f64 / total_deliveries.0 as f64) * 100.0
    } else {
        0.0
    };

    Ok(Json(UserDetailResponse {
        user,
        endpoints,
        recent_deliveries,
        usage_stats: UsageStats {
            total_deliveries: total_deliveries.0,
            success_rate,
            endpoints_count: endpoints_count.0,
        },
    }))
}

/// PUT /v1/admin/users/:id/plan — Change user's plan
async fn change_plan(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<PlanRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let valid_plans = ["free", "pro", "business"];
    if !valid_plans.contains(&req.plan.as_str()) {
        return Err(AppError::BadRequest(format!(
            "Invalid plan '{}'. Must be one of: {}",
            req.plan,
            valid_plans.join(", ")
        )));
    }

    // Set webhook limits based on plan
    let limit = match req.plan.as_str() {
        "pro" => 50_000,
        "business" => 500_000,
        _ => 10_000,
    };

    // Only reset webhook_count on upgrade (not downgrade) to prevent exceeding new limit
    let current_plan: Option<(String,)> =
        sqlx::query_as("SELECT plan FROM customers WHERE id = $1")
            .bind(id)
            .fetch_optional(&pool)
            .await?;

    let should_reset = if let Some(ref old_plan) = current_plan {
        let old_limit = match old_plan.0.as_str() {
            "pro" => 50_000,
            "business" => 500_000,
            _ => 10_000,
        };
        limit > old_limit // Reset only on upgrade
    } else {
        true
    };

    let result = if should_reset {
        sqlx::query(
            "UPDATE customers SET plan = $1, webhook_limit = $2, webhook_count = 0 WHERE id = $3",
        )
        .bind(&req.plan)
        .bind(limit)
        .bind(id)
        .execute(&pool)
        .await?
    } else {
        // On downgrade, cap webhook_count to new limit
        sqlx::query(
            "UPDATE customers SET plan = $1, webhook_limit = $2, webhook_count = LEAST(webhook_count, $2) WHERE id = $3",
        )
        .bind(&req.plan)
        .bind(limit)
        .bind(id)
        .execute(&pool)
        .await?
    };

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✅ Admin changed plan for user {} to {}", id, req.plan);

    Ok(Json(serde_json::json!({
        "message": format!("Plan updated to {}", req.plan),
        "plan": req.plan,
        "webhook_limit": limit,
    })))
}

/// PUT /v1/admin/users/:id/status — Ban/activate user
async fn change_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<StatusRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    // Prevent self-deactivation
    if id == customer.id && !req.is_active {
        return Err(AppError::BadRequest(
            "Cannot deactivate your own account".into(),
        ));
    }

    let result = sqlx::query("UPDATE customers SET is_active = $1 WHERE id = $2")
        .bind(req.is_active)
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    let status = if req.is_active {
        "activated"
    } else {
        "deactivated"
    };
    tracing::info!("✅ Admin {} user {}", status, id);

    Ok(Json(serde_json::json!({
        "message": format!("User {}", status),
        "is_active": req.is_active,
    })))
}

/// GET /v1/admin/stats — System-wide stats
async fn system_stats(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<SystemStats>, AppError> {
    require_admin(&customer)?;

    let total_users: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM customers")
        .fetch_one(&pool)
        .await?;

    let total_deliveries: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries")
        .fetch_one(&pool)
        .await?;

    // Revenue: assume $0 for free, $49 for pro, $149 for business (monthly)
    let revenue: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(SUM(
            CASE plan
                WHEN 'pro' THEN 49.0
                WHEN 'business' THEN 149.0
                ELSE 0.0
            END
        ), 0.0) as revenue FROM customers WHERE is_active = TRUE"#,
    )
    .fetch_one(&pool)
    .await?;

    // Active users today (users with at least one delivery today)
    let active_today: (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT customer_id) FROM deliveries WHERE created_at >= CURRENT_DATE",
    )
    .fetch_one(&pool)
    .await?;

    // Users grouped by plan
    let users_by_plan = sqlx::query_as::<_, PlanCount>(
        "SELECT plan, COUNT(*) as count FROM customers GROUP BY plan ORDER BY count DESC",
    )
    .fetch_all(&pool)
    .await?;

    // Recent signups (last 10)
    let recent_signups = sqlx::query_as::<_, RecentSignup>(
        "SELECT id, email, name, plan, created_at FROM customers ORDER BY created_at DESC LIMIT 10",
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(SystemStats {
        total_users: total_users.0,
        total_deliveries: total_deliveries.0,
        total_revenue: revenue.0.unwrap_or(0.0),
        active_users_today: active_today.0,
        users_by_plan,
        recent_signups,
    }))
}

/// GET /v1/admin/revenue — Revenue by month (last 12 months)
async fn revenue_by_month(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<RevenueRow>>, AppError> {
    require_admin(&customer)?;

    let rows = sqlx::query_as::<_, RevenueRow>(
        r#"SELECT
            TO_CHAR(month_series, 'YYYY-MM') as month,
            COALESCE(
                (SELECT SUM(
                    CASE plan
                        WHEN 'pro' THEN 49.0
                        WHEN 'business' THEN 149.0
                        ELSE 0.0
                    END
                )
                FROM customers
                WHERE is_active = TRUE
                  AND created_at <= month_series + INTERVAL '1 month'),
                0.0
            ) as revenue
        FROM generate_series(
            DATE_TRUNC('month', NOW() - INTERVAL '11 months'),
            DATE_TRUNC('month', NOW()),
            INTERVAL '1 month'
        ) as month_series
        ORDER BY month_series"#,
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}
