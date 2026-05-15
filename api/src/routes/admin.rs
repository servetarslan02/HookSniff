use axum::extract::{Extension, Path, Query};
use axum::http::{HeaderMap, HeaderValue};
use axum::response::IntoResponse;
use axum::routing::{get, post, put};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/users", get(list_users))
        .route("/users/export", get(export_users_csv))
        .route("/users/{id}", get(get_user_detail))
        .route("/users/{id}/plan", put(change_plan))
        .route("/users/{id}/plan-history", get(user_plan_history))
        .route("/users/{id}/send-email", post(send_user_email))
        .route("/users/{id}/status", put(change_status))
        .route("/users/{id}/impersonate", post(impersonate_user))
        .route("/users/{id}/analytics", get(user_analytics))
        .route("/users/{id}/endpoints", get(admin_user_endpoints))
        .route("/users/{id}/webhooks", get(admin_user_webhooks))
        .route("/users/{id}/api-keys", get(admin_user_api_keys))
        .route("/users/{id}/applications", get(admin_user_applications))
        .route("/users/{id}/usage", get(admin_user_usage))
        .route("/users/{id}/test-webhook", post(admin_user_test_webhook))
        .route("/users/{id}/webhooks/{delivery_id}/replay", post(admin_user_replay_delivery))
        .route("/stats", get(system_stats))
        .route("/revenue", get(revenue_by_month))
        .route("/revenue/export", get(export_revenue_csv))
        .route("/churn", get(churn_report))
        .route("/audit-logs", get(admin_audit_logs))
        .route("/deliveries/{id}/replay", post(replay_delivery))
        .route("/test-webhook", post(test_webhook))
        .route("/sdk-update", post(notify_sdk_update))
        .route("/settings", get(get_settings).put(update_settings))
        .route("/alerts", get(list_all_alerts).post(create_platform_alert))
        .route("/alerts/{id}", put(update_alert_admin).delete(delete_alert_admin))
        .route("/feature-flags", get(list_feature_flags).post(create_feature_flag))
        .route("/feature-flags/{id}", put(update_feature_flag).delete(delete_feature_flag))
        .route("/deploy-info", get(deploy_info))
        // ── Aşama 2: System Monitoring ──
        .route("/deliveries/failed", get(admin_failed_deliveries))
        .route("/deliveries/dead-letters", get(admin_dead_letters))
        .route("/queue/status", get(admin_queue_status))
        .route("/rate-limit-violations", get(admin_rate_limit_violations))
        .route("/api-latency", get(admin_api_latency))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PaginationParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub search: Option<String>,
    pub plan: Option<String>,
    pub status: Option<String>,
    /// Filter users created after this date (ISO 8601, e.g. "2024-01-01")
    pub created_after: Option<String>,
    /// Filter users created before this date (ISO 8601, e.g. "2024-12-31")
    pub created_before: Option<String>,
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
    #[serde(default = "default_role_summary")]
    pub role: String,
    #[sqlx(rename = "is_active")]
    #[serde(rename = "status", serialize_with = "serialize_status")]
    is_active: bool,
    pub is_admin: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[allow(dead_code)]
fn default_role_summary() -> String { "member".to_string() }

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
    pub webhook_limit: i64,
    pub webhook_count: i64,
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
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DeliverySummary {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub status: String,
    #[serde(alias = "event")]
    #[serde(rename = "event")]
    pub event_type: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub attempt_count: i32,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PlanRequest {
    pub plan: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct StatusRequest {
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SendEmailRequest {
    pub subject: String,
    pub body: String,
}

#[derive(Debug, Serialize)]
pub struct SystemStats {
    pub total_users: i64,
    pub total_deliveries: i64,
    pub total_revenue: f64,
    pub active_users_today: i64,
    pub total_endpoints: i64,
    pub active_endpoints: i64,
    pub users_by_plan: Vec<PlanCount>,
    pub recent_signups: Vec<RecentSignup>,
    /// Yesterday's values for trend comparison
    pub trends: StatsTrends,
}

#[derive(Debug, Serialize)]
pub struct StatsTrends {
    pub total_users_yesterday: i64,
    pub total_deliveries_yesterday: i64,
    pub revenue_yesterday: f64,
    pub active_users_yesterday: i64,
    /// Number of deliveries currently being processed (active webhooks)
    pub active_webhooks: i64,
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

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct RevenueByPlan {
    pub plan: String,
    pub revenue: f64,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct RevenueResponse {
    pub monthly_revenue: Vec<RevenueRow>,
    pub revenue_by_plan: Vec<RevenueByPlan>,
    pub mrr: f64,
    pub churn_rate: f64,
    /// Percentage change in MRR compared to last month (e.g. 5.0 means +5%)
    pub mrr_trend: f64,
    /// Item 252: Lifetime actual collected revenue from paid invoices (USD)
    pub collected_revenue: f64,
}

/// Admin middleware — call this as a layer on admin routes, or check inline.
/// Returns 403 if the customer is not an admin.
fn require_admin(customer: &Customer) -> Result<(), AppError> {
    if !customer.is_admin && !matches!(customer.role.as_str(), "admin" | "support") {
        return Err(AppError::Forbidden("Admin access required".into()));
    }
    Ok(())
}

/// Require admin role (not support) for write operations
fn require_admin_write(customer: &Customer) -> Result<(), AppError> {
    if !customer.is_admin && customer.role != "admin" {
        return Err(AppError::Forbidden("Admin write access required".into()));
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
    let per_page = params.per_page.unwrap_or(20).clamp(1, 200);
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
    if params.created_after.is_some() {
        conditions.push(format!("created_at >= ${}", bind_idx));
        bind_idx += 1;
    }
    if params.created_before.is_some() {
        conditions.push(format!("created_at <= ${}", bind_idx));
        bind_idx += 1;
        let _ = bind_idx; // suppress unused assignment warning
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let base_query = format!(
        "SELECT id, email, name, plan, COALESCE(role, 'member') as role, is_active, is_admin, created_at FROM customers {} ORDER BY created_at DESC",
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
    if let Some(ref created_after) = params.created_after {
        users_query = users_query.bind(created_after);
        count_query = count_query.bind(created_after);
    }
    if let Some(ref created_before) = params.created_before {
        users_query = users_query.bind(created_before);
        count_query = count_query.bind(created_before);
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
        "SELECT id, email, name, plan, COALESCE(role, 'member') as role, is_active, is_admin, created_at FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let endpoints = sqlx::query_as::<_, EndpointSummary>(
        "SELECT id, url, description, is_active, created_at FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 500",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let recent_deliveries = sqlx::query_as::<_, DeliverySummary>(
        "SELECT id, endpoint_id, status, event_type, created_at, attempt_count \
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
    require_admin_write(&customer)?;

    let valid_plans = ["developer", "startup", "pro", "enterprise"];
    if !valid_plans.contains(&req.plan.as_str()) {
        return Err(AppError::BadRequest("Invalid plan".into()));
    }

    // Set webhook limits based on plan
    let limit: i64 = match req.plan.as_str() {
        "startup" => 30_000,
        "pro" => 100_000,
        "enterprise" => i64::MAX,
        _ => 10_000, // developer
    };

    // Only reset webhook_count on upgrade (not downgrade) to prevent exceeding new limit
    let current_plan: Option<(String,)> =
        sqlx::query_as("SELECT plan FROM customers WHERE id = $1")
            .bind(id)
            .fetch_optional(&pool)
            .await?;

    let should_reset = if let Some(ref old_plan) = current_plan {
        let old_limit: i64 = match old_plan.0.as_str() {
            "startup" => 30_000,
            "pro" => 100_000,
            "enterprise" => i64::MAX,
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

    // Log plan change to audit
    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "plan.changed",
        "customer",
        Some(&id.to_string()),
        Some(serde_json::json!({
            "new_plan": req.plan,
            "webhook_limit": limit,
            "admin_email": customer.email,
        })),
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({
        "message": format!("Plan updated to {}", req.plan),
        "plan": req.plan,
        "webhook_limit": limit,
    })))
}

/// GET /v1/admin/users/:id/plan-history — Get plan change history for a user
async fn user_plan_history(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let rows = sqlx::query_as::<_, (String, Option<serde_json::Value>, chrono::DateTime<chrono::Utc>)>(
        r#"SELECT action, details, created_at FROM audit_log
           WHERE resource_type = 'customer' AND resource_id = $1 AND action = 'plan.changed'
           ORDER BY created_at DESC LIMIT 50"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let history: Vec<serde_json::Value> = rows
        .iter()
        .map(|(action, details, at)| {
            serde_json::json!({
                "action": action,
                "details": details,
                "created_at": at.to_rfc3339(),
            })
        })
        .collect();

    Ok(Json(serde_json::json!({ "history": history })))
}

/// POST /v1/admin/users/:id/send-email — Send email to a user
async fn send_user_email(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<SendEmailRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    // Get target user
    let user: Option<(String, Option<String>)> =
        sqlx::query_as("SELECT email, name FROM customers WHERE id = $1")
            .bind(id)
            .fetch_optional(&pool)
            .await?;

    let (email, _name) = user.ok_or(AppError::NotFound)?;

    // Get settings for Resend config
    let settings = fetch_platform_settings(&pool).await;

    let api_key = settings.resend_api_key.as_ref()
        .ok_or_else(|| AppError::BadRequest("Resend API key not configured".into()))?;
    let sender = settings.email_sender.as_deref().unwrap_or("noreply@resend.dev");

    // Send via Resend API
    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "from": sender,
            "to": [email],
            "subject": req.subject,
            "text": req.body,
        }))
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to send email: {}", e)))?;

    if !resp.status().is_success() {
        let err_text = resp.text().await.unwrap_or_default();
        return Err(AppError::BadRequest(format!("Email send failed: {}", err_text)));
    }

    // Log to audit
    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "email.sent",
        "customer",
        Some(&id.to_string()),
        Some(serde_json::json!({ "subject": req.subject, "admin_email": customer.email })),
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({ "message": "Email sent" })))
}

/// PUT /v1/admin/users/:id/status — Ban/activate user
async fn change_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<StatusRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

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

    // Item 252: Use actual invoice amounts for revenue, not plan price estimates.
    // Sum all paid invoices (actual collected revenue).
    let revenue: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as revenue \
         FROM invoices WHERE status = 'paid'",
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

    // Yesterday's trends
    let users_yesterday: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM customers WHERE created_at < CURRENT_DATE",
    )
    .fetch_one(&pool)
    .await?;

    let deliveries_yesterday: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE created_at < CURRENT_DATE",
    )
    .fetch_one(&pool)
    .await?;

    // Item 252: Revenue yesterday — sum of invoices paid before today
    let revenue_yesterday: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as revenue \
         FROM invoices WHERE status = 'paid' AND paid_at < CURRENT_DATE",
    )
    .fetch_one(&pool)
    .await?;

    let active_yesterday: (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT customer_id) FROM deliveries WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE",
    )
    .fetch_one(&pool)
    .await?;

    let active_webhooks: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE status = 'pending'",
    )
    .fetch_one(&pool)
    .await?;

    // Endpoint counts (from the endpoints table)
    let total_endpoints: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoints")
        .fetch_one(&pool)
        .await?;

    let active_endpoints: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE is_active = TRUE")
            .fetch_one(&pool)
            .await?;

    Ok(Json(SystemStats {
        total_users: total_users.0,
        total_deliveries: total_deliveries.0,
        total_revenue: revenue.0.unwrap_or(0.0),
        active_users_today: active_today.0,
        total_endpoints: total_endpoints.0,
        active_endpoints: active_endpoints.0,
        users_by_plan,
        recent_signups,
        trends: StatsTrends {
            total_users_yesterday: users_yesterday.0,
            total_deliveries_yesterday: deliveries_yesterday.0,
            revenue_yesterday: revenue_yesterday.0.unwrap_or(0.0),
            active_users_yesterday: active_yesterday.0,
            active_webhooks: active_webhooks.0,
        },
    }))
}

/// GET /v1/admin/revenue — Full revenue response with monthly, by-plan, MRR, and churn
async fn revenue_by_month(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<RevenueResponse>, AppError> {
    require_admin(&customer)?;

    // Item 252: Use actual invoice data instead of plan price estimates.
    // 1. Monthly revenue (last 12 months) from actual paid invoices
    let monthly_revenue = sqlx::query_as::<_, RevenueRow>(
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
        FROM generate_series(0, 11) as n
        ORDER BY month"#,
    )
    .fetch_all(&pool)
    .await?;

    // 2. Revenue by plan from actual paid invoices (last 12 months)
    let revenue_by_plan = sqlx::query_as::<_, RevenueByPlan>(
        r#"SELECT
            plan,
            COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as revenue,
            COUNT(*) as count
        FROM invoices
        WHERE status = 'paid'
          AND paid_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
        GROUP BY plan
        ORDER BY revenue DESC"#,
    )
    .fetch_all(&pool)
    .await?;

    // 3. MRR: sum of paid invoices in the current month
    let mrr: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as mrr \
         FROM invoices \
         WHERE status = 'paid' \
           AND paid_at >= DATE_TRUNC('month', NOW())",
    )
    .fetch_one(&pool)
    .await?;

    // 4. Actual collected revenue: sum of all paid invoices (lifetime)
    //    Exposed via the mrr field combined with monthly_revenue for full picture.

    // 5. Churn rate: % of customers who became inactive in last 30 days
    let total_customers: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM customers")
        .fetch_one(&pool)
        .await?;

    let churned: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM customers WHERE is_active = FALSE AND updated_at >= NOW() - INTERVAL '30 days'",
    )
    .fetch_one(&pool)
    .await?;

    let churn_rate = if total_customers.0 > 0 {
        (churned.0 as f64 / total_customers.0 as f64) * 100.0
    } else {
        0.0
    };

    // 6. MRR trend: compare current month to previous month
    let mrr_trend = if monthly_revenue.len() >= 2 {
        let current = monthly_revenue.last().map(|r| r.revenue).unwrap_or(0.0);
        let previous = monthly_revenue[monthly_revenue.len() - 2].revenue;
        if previous > 0.0 {
            ((current - previous) / previous) * 100.0
        } else if current > 0.0 {
            100.0
        } else {
            0.0
        }
    } else {
        0.0
    };

    // 7. Item 252: Lifetime collected revenue from all paid invoices
    let collected_revenue: (Option<f64>,) = sqlx::query_as(
        "SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) \
         FROM invoices WHERE status = 'paid'",
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(RevenueResponse {
        monthly_revenue,
        revenue_by_plan,
        mrr: mrr.0.unwrap_or(0.0),
        churn_rate,
        mrr_trend,
        collected_revenue: collected_revenue.0.unwrap_or(0.0),
    }))
}

// ─────────────────────────────────────────────────────────
// Delivery Replay
// ─────────────────────────────────────────────────────────

/// POST /v1/admin/deliveries/:id/replay — Replay a delivery
async fn replay_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    // Find the original delivery
    let original = sqlx::query_as::<_, (Uuid, Uuid, serde_json::Value, Option<String>, i32)>(
        "SELECT id, endpoint_id, payload, event_type, replay_count FROM deliveries WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (orig_id, endpoint_id, payload, event_type, replay_count) = original;

    // Create a new delivery with the same payload, reset status
    let new_delivery = sqlx::query_as::<_, (Uuid,)>(
        r#"INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count, is_test)
           VALUES ($1, $2, $3, $4, 'pending', 3, $5, FALSE)
           RETURNING id"#,
    )
    .bind(endpoint_id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&event_type)
    .bind(replay_count + 1)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "🔁 Admin replayed delivery {} → new delivery {}",
        orig_id,
        new_delivery.0
    );

    Ok(Json(serde_json::json!({
        "message": "Delivery replayed successfully",
        "original_id": orig_id,
        "new_delivery_id": new_delivery.0,
    })))
}

// ─────────────────────────────────────────────────────────
// CSV Export: Users
// ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExportUsersParams {
    pub format: Option<String>,
    pub plan: Option<String>,
    pub status: Option<String>,
}

/// GET /v1/admin/users/export — Export users as CSV
async fn export_users_csv(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ExportUsersParams>,
) -> Result<impl IntoResponse, AppError> {
    require_admin(&customer)?;

    let format = params.format.unwrap_or_else(|| "csv".to_string());
    if format != "csv" {
        return Err(AppError::BadRequest("Only format=csv is supported".into()));
    }

    // Build query with optional filters
    let mut conditions: Vec<String> = Vec::new();
    let mut bind_idx = 1;

    if params.plan.is_some() {
        conditions.push(format!("plan = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.status.is_some() {
        conditions.push(format!("is_active = ${}", bind_idx));
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

    let rows = query.fetch_all(&pool).await?;

    // Build CSV manually
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
    headers.insert("Content-Type", HeaderValue::from_static("text/csv; charset=utf-8"));
    headers.insert(
        "Content-Disposition",
        HeaderValue::from_static("attachment; filename=\"users_export.csv\""),
    );

    Ok((headers, csv))
}

// ─────────────────────────────────────────────────────────
// CSV Export: Revenue
// ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExportRevenueParams {
    pub format: Option<String>,
    pub months: Option<i64>,
}

/// GET /v1/admin/revenue/export — Export revenue as CSV
async fn export_revenue_csv(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ExportRevenueParams>,
) -> Result<impl IntoResponse, AppError> {
    require_admin(&customer)?;

    let format = params.format.unwrap_or_else(|| "csv".to_string());
    if format != "csv" {
        return Err(AppError::BadRequest("Only format=csv is supported".into()));
    }

    let months = params.months.unwrap_or(12).clamp(1, 60);

    // Item 252: Use actual invoice data for revenue export
    let all_rows = sqlx::query_as::<_, RevenueRow>(
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
        FROM generate_series(0, 11) as n
        ORDER BY month"#,
    )
    .fetch_all(&pool)
    .await?;

    // Trim to requested number of months
    let skip = if all_rows.len() > months as usize {
        all_rows.len() - months as usize
    } else {
        0
    };
    let rows: Vec<RevenueRow> = all_rows.into_iter().skip(skip).collect();

    let mut csv = String::from("month,revenue\n");
    for row in &rows {
        csv.push_str(&format!("{},{:.2}\n", row.month, row.revenue));
    }

    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", HeaderValue::from_static("text/csv; charset=utf-8"));
    headers.insert(
        "Content-Disposition",
        HeaderValue::from_static("attachment; filename=\"revenue_export.csv\""),
    );

    Ok((headers, csv))
}

// ─────────────────────────────────────────────────────────
// Impersonate User
// ─────────────────────────────────────────────────────────

/// POST /v1/admin/users/:id/impersonate — Generate a short-lived JWT for the target user
async fn impersonate_user(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(config): Extension<Config>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    // Prevent self-impersonation
    if id == customer.id {
        return Err(AppError::BadRequest("Cannot impersonate yourself".into()));
    }

    // Look up the target user
    let target = sqlx::query_as::<_, (Uuid, String, String, bool)>(
        "SELECT id, email, plan, is_active FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (target_id, target_email, target_plan, is_active) = target;

    if !is_active {
        return Err(AppError::BadRequest("Cannot impersonate an inactive user".into()));
    }

    // Generate a short-lived JWT (15 min) for the target user
    let token = jwt::generate_access_token(
        target_id,
        &target_email,
        &target_plan,
        &config.jwt_secret,
        false, // not admin
    )?;

    // Log to audit_log
    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "IMPERSONATE",
        "user",
        Some(&id.to_string()),
        Some(serde_json::json!({
            "target_email": target_email,
            "admin_id": customer.id,
        })),
        None,
        None,
    )
    .await;

    tracing::warn!(
        "⚠️ Admin {} impersonating user {} ({})",
        customer.email,
        target_id,
        target_email
    );

    Ok(Json(serde_json::json!({
        "token": token,
        "user_id": target_id,
        "email": target_email,
        "expires_in": 900,
    })))
}

// ─────────────────────────────────────────────────────────
// User Analytics
// ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsParams {
    pub days: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DailyDeliveryCount {
    pub date: String,
    pub total: i64,
    pub success: i64,
    pub failed: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct EventTypeCount {
    #[serde(rename = "event")]
    pub event_type: Option<String>,
    pub count: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct EndpointHealth {
    pub endpoint_id: Uuid,
    pub url: String,
    pub total: i64,
    pub success: i64,
    pub failed: i64,
    pub success_rate: f64,
    pub avg_latency_ms: f64,
}

#[derive(Debug, Serialize)]
pub struct UserAnalytics {
    pub daily_deliveries: Vec<DailyDeliveryCount>,
    #[serde(rename = "top_events")]
    pub top_event_types: Vec<EventTypeCount>,
    pub endpoint_health: Vec<EndpointHealth>,
}

/// GET /v1/admin/users/:id/analytics — Get user analytics for last N days
async fn user_analytics(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<AnalyticsParams>,
) -> Result<Json<UserAnalytics>, AppError> {
    require_admin(&customer)?;

    let days = params.days.unwrap_or(30).clamp(1, 365);

    // Daily delivery counts
    let daily_deliveries = sqlx::query_as::<_, DailyDeliveryCount>(
        r#"SELECT
            TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'delivered') as success,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM deliveries
        WHERE customer_id = $1
          AND created_at >= NOW() - INTERVAL '1 day' * $2::int
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)"#,
    )
    .bind(id)
    .bind(days)
    .fetch_all(&pool)
    .await?;

    // Top event types
    let top_event_types = sqlx::query_as::<_, EventTypeCount>(
        r#"SELECT
            event_type,
            COUNT(*) as count
        FROM deliveries
        WHERE customer_id = $1
          AND created_at >= NOW() - INTERVAL '1 day' * $2::int
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 10"#,
    )
    .bind(id)
    .bind(days)
    .fetch_all(&pool)
    .await?;

    // Endpoint health
    let endpoint_health = sqlx::query_as::<_, EndpointHealth>(
        r#"SELECT
            e.id as endpoint_id,
            e.url,
            COUNT(d.id) as total,
            COUNT(d.id) FILTER (WHERE d.status = 'delivered') as success,
            COUNT(d.id) FILTER (WHERE d.status = 'failed') as failed,
            CASE WHEN COUNT(d.id) > 0
                THEN ROUND(COUNT(d.id) FILTER (WHERE d.status = 'delivered')::numeric / COUNT(d.id) * 100, 1)
                ELSE 0.0
            END as success_rate,
            COALESCE(ROUND(AVG(da.duration_ms)::numeric, 0), 0.0) as avg_latency_ms
        FROM endpoints e
        LEFT JOIN deliveries d ON d.endpoint_id = e.id
          AND d.created_at >= NOW() - INTERVAL '1 day' * $2::int
        LEFT JOIN delivery_attempts da ON da.delivery_id = d.id
        WHERE e.customer_id = $1
        GROUP BY e.id, e.url
        ORDER BY total DESC"#,
    )
    .bind(id)
    .bind(days)
    .fetch_all(&pool)
    .await?;

    Ok(Json(UserAnalytics {
        daily_deliveries,
        top_event_types,
        endpoint_health,
    }))
}

// ─────────────────────────────────────────────────────────
// Test Webhook
// ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TestWebhookRequest {
    pub endpoint_url: String,
    pub event_type: Option<String>,
    pub payload: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct TestWebhookResponse {
    pub status_code: u16,
    pub response_body: String,
    pub duration_ms: u64,
}

/// POST /v1/admin/test-webhook — Send a test HTTP POST to a URL
async fn test_webhook(
    Extension(customer): Extension<Customer>,
    Json(req): Json<TestWebhookRequest>,
) -> Result<Json<TestWebhookResponse>, AppError> {
    require_admin_write(&customer)?;

    // Validate URL scheme
    if !req.endpoint_url.starts_with("http://") && !req.endpoint_url.starts_with("https://") {
        return Err(AppError::BadRequest(
            "URL must start with http:// or https://".into(),
        ));
    }

    // SSRF protection — block private/internal IPs
    if let Err(e) = crate::ssrf::validate_url(&req.endpoint_url) {
        tracing::warn!("SSRF blocked on test-webhook: {} — {:?}", req.endpoint_url, e);
        return Err(AppError::BadRequest(format!("URL not allowed: {}", e)));
    }

    let client = reqwest::Client::new();
    let start = std::time::Instant::now();

    let mut request = client
        .post(&req.endpoint_url)
        .header("Content-Type", "application/json");

    if let Some(ref event_type) = req.event_type {
        request = request.header("X-HookSniff-Event", event_type.as_str());
    }

    let response = request
        .json(&req.payload)
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Request failed: {}", e)))?;

    let duration_ms = start.elapsed().as_millis() as u64;
    let status_code = response.status().as_u16();
    let response_body = response
        .text()
        .await
        .unwrap_or_else(|_| "<unreadable>".to_string());

    // Truncate response body to 4KB
    let response_body = if response_body.len() > 4096 {
        format!("{}...[truncated]", &response_body[..4096])
    } else {
        response_body
    };

    Ok(Json(TestWebhookResponse {
        status_code,
        response_body,
        duration_ms,
    }))
}

// ─────────────────────────────────────────────────────────
// Churn Report
// ─────────────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ChurnedUser {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub amount: f64,
    pub churn_date: DateTime<Utc>,
}

/// GET /v1/admin/churn — List users who became inactive in last 30 days
async fn churn_report(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let settings = fetch_platform_settings(&pool).await;

    let churned = sqlx::query_as::<_, ChurnedUser>(
        &format!(
            r#"SELECT
            id,
            email,
            name,
            plan,
            CASE plan
                WHEN 'pro' THEN {pro}
                WHEN 'enterprise' THEN {biz}
                ELSE 0.0
            END as amount,
            updated_at as churn_date
        FROM customers
        WHERE is_active = FALSE
          AND updated_at >= NOW() - INTERVAL '30 days'
        ORDER BY updated_at DESC
        LIMIT 1000"#,
            pro = settings.plan_price_pro,
            biz = settings.plan_price_business,
        ),
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "users": churned })))
}

// ─────────────────────────────────────────────────────────
// Admin Audit Logs
// ─────────────────────────────────────────────────────────

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
    pub action: String,
    pub resource_type: String,
    pub resource_id: Option<String>,
    pub details: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// GET /v1/admin/audit-logs — Admin-only audit log (all users)
async fn admin_audit_logs(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<AdminAuditLogQuery>,
) -> Result<Json<AdminAuditLogResponse>, AppError> {
    require_admin(&customer)?;

    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    // Build dynamic WHERE
    let mut conditions: Vec<String> = Vec::new();
    let mut bind_idx = 1;

    if query.action.is_some() {
        conditions.push(format!("action = ${}", bind_idx));
        bind_idx += 1;
    }
    if query.admin_id.is_some() {
        conditions.push(format!("customer_id = ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    // Count
    let count_sql = format!("SELECT COUNT(*) FROM audit_log {}", where_clause);
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql);
    if let Some(ref action) = query.action {
        count_q = count_q.bind(action);
    }
    if let Some(ref admin_id) = query.admin_id {
        count_q = count_q.bind(admin_id);
    }
    let total = count_q.fetch_one(&pool).await?;

    // Data
    let data_sql = format!(
        "SELECT id, customer_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at \
         FROM audit_log {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
        where_clause, bind_idx, bind_idx + 1
    );

    let mut data_q = sqlx::query_as::<
        _,
        (
            Uuid,
            Uuid,
            String,
            String,
            Option<String>,
            Option<serde_json::Value>,
            Option<String>,
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
            |(id, customer_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)| {
                AdminAuditEntry {
                    id,
                    customer_id,
                    action,
                    resource_type,
                    resource_id,
                    details,
                    ip_address,
                    user_agent,
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

// ─────────────────────────────────────────────────────────
// Feature Flags
// ─────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
struct FeatureFlag {
    id: Uuid,
    name: String,
    description: Option<String>,
    is_enabled: bool,
    rollout_percentage: i32,
    enabled_for_plans: serde_json::Value,
    created_by: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
struct CreateFeatureFlagRequest {
    name: String,
    description: Option<String>,
    is_enabled: Option<bool>,
    rollout_percentage: Option<i32>,
    enabled_for_plans: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct UpdateFeatureFlagRequest {
    name: Option<String>,
    description: Option<String>,
    is_enabled: Option<bool>,
    rollout_percentage: Option<i32>,
    enabled_for_plans: Option<Vec<String>>,
}

async fn list_feature_flags(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<impl IntoResponse, AppError> {
    require_admin(&customer)?;

    let flags = sqlx::query_as::<_, FeatureFlag>(
        "SELECT id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at
         FROM feature_flags ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    let _ = crate::audit::log_action(&pool, customer.id, "FEATURE_FLAG_LIST", "feature_flag", None, None, None, None).await;

    Ok(Json(serde_json::json!({ "flags": flags })))
}

async fn create_feature_flag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(body): Json<CreateFeatureFlagRequest>,
) -> Result<impl IntoResponse, AppError> {
    require_admin_write(&customer)?;

    let plans_json = serde_json::to_value(body.enabled_for_plans.unwrap_or_default())?;

    let flag = sqlx::query_as::<_, FeatureFlag>(
        "INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at"
    )
    .bind(&body.name)
    .bind(&body.description)
    .bind(body.is_enabled.unwrap_or(false))
    .bind(body.rollout_percentage.unwrap_or(0))
    .bind(&plans_json)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let _ = crate::audit::log_action(&pool, customer.id, "FEATURE_FLAG_CREATE", "feature_flag", Some(&flag.id.to_string()), None, None, None).await;

    Ok(Json(serde_json::json!(flag)))
}

async fn update_feature_flag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateFeatureFlagRequest>,
) -> Result<impl IntoResponse, AppError> {
    require_admin_write(&customer)?;

    // Fetch current flag first, then update individual fields
    let current = sqlx::query_as::<_, FeatureFlag>(
        "SELECT id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at FROM feature_flags WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let new_name = body.name.as_deref().unwrap_or(&current.name);
    let new_desc: Option<String> = body.description.or_else(|| current.description.clone());
    let new_enabled = body.is_enabled.unwrap_or(current.is_enabled);
    let new_pct = body.rollout_percentage.unwrap_or(current.rollout_percentage);
    let new_plans = if let Some(ref plans) = body.enabled_for_plans {
        serde_json::to_value(plans)?
    } else {
        current.enabled_for_plans.clone()
    };

    let flag = sqlx::query_as::<_, FeatureFlag>(
        "UPDATE feature_flags SET name = $1, description = $2, is_enabled = $3, rollout_percentage = $4, enabled_for_plans = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at"
    )
    .bind(new_name)
    .bind(new_desc)
    .bind(new_enabled)
    .bind(new_pct)
    .bind(&new_plans)
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let details = serde_json::json!({
        "is_enabled": body.is_enabled,
        "rollout_percentage": body.rollout_percentage,
    });
    let _ = crate::audit::log_action(&pool, customer.id, "FEATURE_FLAG_UPDATE", "feature_flag", Some(&id.to_string()), Some(details), None, None).await;

    Ok(Json(serde_json::json!(flag)))
}

async fn delete_feature_flag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    require_admin_write(&customer)?;

    sqlx::query("DELETE FROM feature_flags WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    let _ = crate::audit::log_action(&pool, customer.id, "FEATURE_FLAG_DELETE", "feature_flag", Some(&id.to_string()), None, None, None).await;

    Ok(Json(serde_json::json!({ "success": true })))
}

// ─────────────────────────────────────────────────────────
// Deploy Info
// ─────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct DeployInfo {
    pub version: String,
    pub git_commit: Option<String>,
    pub build_time: Option<String>,
    pub environment: String,
}

/// GET /v1/admin/deploy-info — Returns current deployment version and metadata
async fn deploy_info(
    Extension(customer): Extension<Customer>,
) -> Result<Json<DeployInfo>, AppError> {
    require_admin(&customer)?;

    Ok(Json(DeployInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        git_commit: std::env::var("GIT_SHA").ok().or_else(|| {
            std::env::var("VERCEL_GIT_COMMIT_SHA")
                .ok()
                .or_else(|| std::env::var("CLOUD_BUILD_COMMIT").ok())
        }),
        build_time: std::env::var("BUILD_TIME").ok(),
        environment: std::env::var("ENVIRONMENT")
            .unwrap_or_else(|_| "production".to_string()),
    }))
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/// Escape a string for CSV (wrap in quotes if it contains comma, quote, or newline)
fn escape_csv(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

// ─────────────────────────────────────────────────────────
// SDK Update Notifications
// ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SdkUpdateRequest {
    pub updates: Vec<SdkUpdateItem>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SdkUpdateItem {
    pub sdk: String,
    pub local_version: String,
    pub published_version: String,
}

/// POST /v1/admin/sdk-update — Create SDK update notifications for all admin users.
/// Called by the automated SDK version checker (cron job).
async fn notify_sdk_update(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<SdkUpdateRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if req.updates.is_empty() {
        return Ok(Json(
            serde_json::json!({ "message": "No updates to notify" }),
        ));
    }

    // Build notification title and message
    let title = format!("🚀 {} SDK güncellemesi mevcut", req.updates.len());
    let details: Vec<String> = req
        .updates
        .iter()
        .map(|u| format!("• {} {} → {}", u.sdk, u.local_version, u.published_version))
        .collect();
    let message = format!(
        "Aşağıdaki SDK'lar için yeni versiyon yayınlandı:\n{}\n\nGüncellemek için \"güncelle\" yazın.",
        details.join("\n")
    );

    // Find all admin users
    let admins: Vec<(Uuid,)> =
        sqlx::query_as("SELECT id FROM customers WHERE is_admin = TRUE AND is_active = TRUE")
            .fetch_all(&pool)
            .await?;

    let mut count = 0;
    for (admin_id,) in &admins {
        sqlx::query(
            r#"INSERT INTO notifications (customer_id, type, title, message, is_read, link)
               VALUES ($1, 'system', $2, $3, FALSE, '/admin')"#,
        )
        .bind(admin_id)
        .bind(&title)
        .bind(&message)
        .execute(&pool)
        .await?;
        count += 1;
    }

    tracing::info!("📢 SDK update notification sent to {} admins", count);

    Ok(Json(serde_json::json!({
        "message": format!("Notification sent to {} admin(s)", count),
        "title": title,
        "updates_count": req.updates.len(),
    })))
}



// ─────────────────────────────────────────────────────────
// Platform Settings
// ─────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(deny_unknown_fields)]
pub struct PlatformSettings {
    pub default_plan: String,
    pub max_endpoints_free: i32,
    pub max_endpoints_pro: i32,
    pub max_webhooks_free: i32,
    pub max_webhooks_pro: i32,
    pub rate_limit_free: i32,
    pub rate_limit_pro: i32,
    pub retry_max_attempts: i32,
    pub retention_days_free: i32,
    pub retention_days_pro: i32,
    pub maintenance_mode: bool,
    pub signup_enabled: bool,
    /// Monthly price for Pro plan (e.g. 29.0)
    #[serde(default = "default_price_pro")]
    pub plan_price_pro: f64,
    /// Monthly price for Enterprise plan (e.g. 99.0)
    #[serde(default = "default_price_business")]
    pub plan_price_business: f64,
    /// Resend API key for sending emails
    #[serde(default)]
    pub resend_api_key: Option<String>,
    /// Sender email address (e.g. "noreply@hooksniff.dev")
    #[serde(default)]
    pub email_sender: Option<String>,
    /// Default webhook signing secret
    #[serde(default)]
    pub webhook_secret: Option<String>,
    /// Backup retention days
    #[serde(default = "default_backup_retention")]
    pub backup_retention_days: i32,
    /// Global API rate limit (requests per minute)
    #[serde(default = "default_global_rate_limit")]
    pub global_rate_limit: i32,
    /// Allowed CORS origins (comma-separated)
    #[serde(default)]
    pub cors_origins: Option<String>,
}

fn default_price_pro() -> f64 { 29.0 }
fn default_price_business() -> f64 { 99.0 }
fn default_backup_retention() -> i32 { 30 }
fn default_global_rate_limit() -> i32 { 1000 }

impl Default for PlatformSettings {
    fn default() -> Self {
        Self {
            default_plan: "developer".into(),
            max_endpoints_free: 5,
            max_endpoints_pro: 50,
            max_webhooks_free: 1000,
            max_webhooks_pro: 50000,
            rate_limit_free: 100,
            rate_limit_pro: 1000,
            retry_max_attempts: 3,
            retention_days_free: 7,
            retention_days_pro: 30,
            maintenance_mode: false,
            signup_enabled: true,
            plan_price_pro: 29.0,
            plan_price_business: 99.0,
            resend_api_key: None,
            email_sender: None,
            webhook_secret: None,
            backup_retention_days: 30,
            global_rate_limit: 1000,
            cors_origins: None,
        }
    }
}

/// Fetch platform settings from DB, falling back to defaults
async fn fetch_platform_settings(pool: &PgPool) -> PlatformSettings {
    let row: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(pool)
            .await
            .ok()
            .flatten();

    if let Some((value,)) = row {
        if let Ok(settings) = serde_json::from_value::<PlatformSettings>(value) {
            return settings;
        }
    }
    PlatformSettings::default()
}

/// GET /v1/admin/settings — Get platform settings
async fn get_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PlatformSettings>, AppError> {
    require_admin(&customer)?;

    let row: Option<(serde_json::Value,)> =
        sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
            .fetch_optional(&pool)
            .await?;

    if let Some((value,)) = row {
        if let Ok(settings) = serde_json::from_value::<PlatformSettings>(value) {
            return Ok(Json(settings));
        }
    }

    Ok(Json(PlatformSettings::default()))
}

/// PUT /v1/admin/settings — Update platform settings
async fn update_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(settings): Json<PlatformSettings>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let value = serde_json::to_value(&settings)
        .map_err(|e| AppError::BadRequest(format!("Invalid settings: {}", e)))?;

    sqlx::query(
        r#"INSERT INTO platform_settings (key, value, updated_at)
           VALUES ('main', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()"#,
    )
    .bind(value)
    .execute(&pool)
    .await?;

    tracing::info!("✅ Admin updated platform settings");

    Ok(Json(serde_json::json!({
        "message": "Settings updated",
    })))
}

// ── Admin Alert Management ──────────────────────────────────

#[derive(Debug, Serialize)]
pub struct AdminAlertRule {
    pub id: Uuid,
    pub customer_id: Option<Uuid>,
    pub customer_email: Option<String>,
    pub name: String,
    pub condition: String,
    pub threshold: i32,
    pub channels: Vec<String>,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminCreateAlertRequest {
    pub customer_id: Option<Uuid>,
    pub name: String,
    pub condition: String,
    pub threshold: i32,
    pub channels: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminUpdateAlertRequest {
    pub name: Option<String>,
    pub condition: Option<String>,
    pub threshold: Option<i32>,
    pub channels: Option<Vec<String>>,
    pub is_active: Option<bool>,
}

async fn list_all_alerts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<AdminAlertRule>>, AppError> {
    let alerts = sqlx::query_as::<_, (Uuid, Option<Uuid>, Option<String>, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        r#"SELECT ar.id, ar.customer_id, c.email, ar.name, ar.condition, ar.threshold, ar.channels, ar.is_active, ar.created_at
           FROM alert_rules ar
           LEFT JOIN customers c ON ar.customer_id = c.id
           WHERE ar.customer_id = $1
           ORDER BY ar.created_at DESC
           LIMIT 200"#
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(
        alerts
            .into_iter()
            .map(|(id, cid, email, name, condition, threshold, channels, active, created)| {
                let channel_list: Vec<String> = channels
                    .as_array()
                    .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                    .unwrap_or_default();
                AdminAlertRule {
                    id,
                    customer_id: cid,
                    customer_email: email,
                    name,
                    condition,
                    threshold,
                    channels: channel_list,
                    is_active: active,
                    created_at: created.to_rfc3339(),
                }
            })
            .collect(),
    ))
}

async fn create_platform_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<AdminCreateAlertRequest>,
) -> Result<Json<AdminAlertRule>, AppError> {
    require_admin_write(&customer)?;
    let valid_conditions = ["failure_rate", "latency", "consecutive_failures"];
    if !valid_conditions.contains(&req.condition.as_str()) {
        return Err(AppError::BadRequest("Invalid alert condition".into()));
    }
    if req.threshold <= 0 {
        return Err(AppError::BadRequest("Threshold must be positive".into()));
    }
    let valid_channels = ["slack", "email", "webhook"];
    for ch in &req.channels {
        if !valid_channels.contains(&ch.as_str()) {
            return Err(AppError::BadRequest("Invalid notification channel".into()));
        }
    }

    let channels_json = serde_json::json!(req.channels);
    // Use admin's own customer_id (or explicitly provided one)
    let target_customer_id = req.customer_id.unwrap_or(customer.id);

    let alert = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "INSERT INTO alert_rules (customer_id, name, condition, threshold, channels, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, customer_id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(target_customer_id)
    .bind(&req.name)
    .bind(&req.condition)
    .bind(req.threshold)
    .bind(&channels_json)
    .fetch_one(&pool)
    .await?;

    tracing::info!("🔔 Admin created alert rule: {}", req.name);

    Ok(Json(AdminAlertRule {
        id: alert.0,
        customer_id: alert.1,
        customer_email: None,
        name: alert.2,
        condition: alert.3,
        threshold: alert.4,
        channels: req.channels,
        is_active: alert.6,
        created_at: alert.7.to_rfc3339(),
    }))
}

async fn update_alert_admin(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<AdminUpdateAlertRequest>,
) -> Result<Json<AdminAlertRule>, AppError> {
    require_admin_write(&customer)?;
    if let Some(ref cond) = req.condition {
        let valid_conditions = ["failure_rate", "latency", "consecutive_failures"];
        if !valid_conditions.contains(&cond.as_str()) {
            return Err(AppError::BadRequest("Invalid alert condition".into()));
        }
    }
    if let Some(thresh) = req.threshold {
        if thresh <= 0 {
            return Err(AppError::BadRequest("Threshold must be positive".into()));
        }
    }
    if let Some(ref channels) = req.channels {
        let valid_channels = ["slack", "email", "webhook"];
        for ch in channels {
            if !valid_channels.contains(&ch.as_str()) {
                return Err(AppError::BadRequest("Invalid notification channel".into()));
            }
        }
    }

    let alert = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "UPDATE alert_rules SET
            name = COALESCE($1, name),
            condition = COALESCE($2, condition),
            threshold = COALESCE($3, threshold),
            channels = COALESCE($4, channels),
            is_active = COALESCE($5, is_active),
            updated_at = NOW()
         WHERE id = $6 AND customer_id = $7
         RETURNING id, customer_id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(req.name.as_deref())
    .bind(req.condition.as_deref())
    .bind(req.threshold)
    .bind(req.channels.as_ref().map(|c| serde_json::json!(c)))
    .bind(req.is_active)
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let channels: Vec<String> = alert
        .5
        .as_array()
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_default();

    Ok(Json(AdminAlertRule {
        id: alert.0,
        customer_id: alert.1,
        customer_email: None,
        name: alert.2,
        condition: alert.3,
        threshold: alert.4,
        channels,
        is_active: alert.6,
        created_at: alert.7.to_rfc3339(),
    }))
}

async fn delete_alert_admin(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;
    let result = sqlx::query("DELETE FROM alert_rules WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}


// ─────────────────────────────────────────────────────────
// Aşama 1: Kullanıcı Kaynakları — Yeni Endpoint'ler
// ─────────────────────────────────────────────────────────

/// GET /v1/admin/users/:id/endpoints — List user's endpoints with delivery stats
async fn admin_user_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let endpoints = sqlx::query_as::<_, (Uuid, String, Option<String>, bool, chrono::DateTime<chrono::Utc>, Option<i64>, Option<chrono::DateTime<chrono::Utc>>)>(
        r#"SELECT e.id, e.url, e.description, e.is_active, e.created_at,
                  COUNT(d.id) as total_deliveries,
                  MAX(d.created_at) as last_delivery_at
           FROM endpoints e
           LEFT JOIN deliveries d ON d.endpoint_id = e.id
           WHERE e.customer_id = $1
           GROUP BY e.id, e.url, e.description, e.is_active, e.created_at
           ORDER BY e.created_at DESC"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let result: Vec<serde_json::Value> = endpoints
        .into_iter()
        .map(|(eid, url, desc, active, created, total, last)| {
            serde_json::json!({
                "id": eid,
                "url": url,
                "description": desc,
                "is_active": active,
                "created_at": created,
                "total_deliveries": total.unwrap_or(0),
                "last_delivery_at": last,
            })
        })
        .collect();

    Ok(Json(serde_json::json!({ "endpoints": result })))
}

/// Query params for user webhooks list
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserWebhooksQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
    pub event_type: Option<String>,
    pub since: Option<String>,
}

/// GET /v1/admin/users/:id/webhooks — List user's deliveries with filters
async fn admin_user_webhooks(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<UserWebhooksQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let mut conditions = vec!["d.customer_id = $1".to_string()];
    let mut bind_idx = 2;

    if params.status.is_some() {
        conditions.push(format!("d.status = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.event_type.is_some() {
        conditions.push(format!("d.event_type = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.since.is_some() {
        conditions.push(format!("d.created_at >= ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = format!("WHERE {}", conditions.join(" AND "));
    let _ = bind_idx; // suppress warning

    // Count query
    let count_sql = format!("SELECT COUNT(*) FROM deliveries d {}", where_clause);
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql).bind(id);
    if let Some(ref s) = params.status { count_q = count_q.bind(s); }
    if let Some(ref e) = params.event_type { count_q = count_q.bind(e); }
    if let Some(ref s) = params.since { count_q = count_q.bind(s); }
    let total = count_q.fetch_one(&pool).await?;

    // Data query
    let data_sql = format!(
        r#"SELECT d.id, d.endpoint_id, d.status, d.event_type, d.created_at, d.attempt_count,
                  d.response_status, d.response_body,
                  (SELECT da.error_message FROM delivery_attempts da
                   WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message
           FROM deliveries d {} ORDER BY d.created_at DESC LIMIT ${} OFFSET ${}"#,
        where_clause, bind_idx, bind_idx + 1
    );

    let mut data_q = sqlx::query_as::<_, (Uuid, Uuid, String, Option<String>, chrono::DateTime<chrono::Utc>, i32, Option<i32>, Option<String>, Option<String>)>(&data_sql).bind(id);
    if let Some(ref s) = params.status { data_q = data_q.bind(s); }
    if let Some(ref e) = params.event_type { data_q = data_q.bind(e); }
    if let Some(ref s) = params.since { data_q = data_q.bind(s); }
    data_q = data_q.bind(per_page).bind(offset);

    let rows = data_q.fetch_all(&pool).await?;

    let webhooks: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|(did, eid, status, event, created, attempts, resp_status, resp_body, error)| {
            serde_json::json!({
                "id": did,
                "endpoint_id": eid,
                "status": status,
                "event": event,
                "created_at": created,
                "attempt_count": attempts,
                "response_status": resp_status,
                "response_body": resp_body,
                "error_message": error,
            })
        })
        .collect();

    Ok(Json(serde_json::json!({
        "webhooks": webhooks,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

/// GET /v1/admin/users/:id/api-keys — List user's API keys (from customers table)
async fn admin_user_api_keys(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let user = sqlx::query_as::<_, (String, chrono::DateTime<chrono::Utc>)>(
        "SELECT api_key_prefix, created_at FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "api_keys": [{
            "prefix": user.0,
            "name": "Default API Key",
            "created_at": user.1,
            "is_active": true,
        }]
    })))
}

/// GET /v1/admin/users/:id/applications — List user's applications
async fn admin_user_applications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let apps = sqlx::query_as::<_, (Uuid, String, Option<String>, chrono::DateTime<chrono::Utc>, Option<i64>)>(
        r#"SELECT a.id, a.name, a.description, a.created_at,
                  (SELECT COUNT(*) FROM endpoints WHERE application_id = a.id) as endpoint_count
           FROM applications a
           WHERE a.customer_id = $1
           ORDER BY a.created_at DESC"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let result: Vec<serde_json::Value> = apps
        .into_iter()
        .map(|(aid, name, desc, created, ep_count)| {
            serde_json::json!({
                "id": aid,
                "name": name,
                "description": desc,
                "created_at": created,
                "endpoint_count": ep_count.unwrap_or(0),
            })
        })
        .collect();

    Ok(Json(serde_json::json!({ "applications": result })))
}

/// GET /v1/admin/users/:id/usage — Detailed usage statistics
async fn admin_user_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    // Total deliveries
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
        .bind(id).fetch_one(&pool).await?;

    // Successful
    let success: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'delivered'")
        .bind(id).fetch_one(&pool).await?;

    // Failed
    let failed: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'failed'")
        .bind(id).fetch_one(&pool).await?;

    // Pending
    let pending: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'pending'")
        .bind(id).fetch_one(&pool).await?;

    // Endpoints
    let endpoints: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
        .bind(id).fetch_one(&pool).await?;

    // Active endpoints
    let active_endpoints: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true")
        .bind(id).fetch_one(&pool).await?;

    // Last 30 days deliveries
    let last_30d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '30 days'"
    ).bind(id).fetch_one(&pool).await?;

    // Last 7 days deliveries
    let last_7d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '7 days'"
    ).bind(id).fetch_one(&pool).await?;

    // Top events
    let top_events = sqlx::query_as::<_, (Option<String>, i64)>(
        r#"SELECT event_type, COUNT(*) as count FROM deliveries
           WHERE customer_id = $1 GROUP BY event_type ORDER BY count DESC LIMIT 10"#
    ).bind(id).fetch_all(&pool).await?;

    let success_rate = if total.0 > 0 {
        (success.0 as f64 / total.0 as f64) * 100.0
    } else { 0.0 };

    Ok(Json(serde_json::json!({
        "total_deliveries": total.0,
        "successful": success.0,
        "failed": failed.0,
        "pending": pending.0,
        "success_rate": (success_rate * 10.0).round() / 10.0,
        "endpoints_count": endpoints.0,
        "active_endpoints": active_endpoints.0,
        "last_30_days": last_30d.0,
        "last_7_days": last_7d.0,
        "top_events": top_events.into_iter().map(|(ev, cnt)| {
            serde_json::json!({ "event": ev, "count": cnt })
        }).collect::<Vec<_>>(),
    })))
}

/// POST /v1/admin/users/:id/test-webhook — Send test webhook to user's first active endpoint
async fn admin_user_test_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<TestWebhookRequest>,
) -> Result<Json<TestWebhookResponse>, AppError> {
    require_admin_write(&customer)?;

    // Validate URL
    if !req.endpoint_url.starts_with("http://") && !req.endpoint_url.starts_with("https://") {
        return Err(AppError::BadRequest("URL must start with http:// or https://".into()));
    }

    // SSRF protection
    if let Err(e) = crate::ssrf::validate_url(&req.endpoint_url) {
        return Err(AppError::BadRequest(format!("URL not allowed: {}", e)));
    }

    let client = reqwest::Client::new();
    let start = std::time::Instant::now();

    let mut request = client
        .post(&req.endpoint_url)
        .header("Content-Type", "application/json")
        .header("X-HookSniff-Admin", "true");

    if let Some(ref event_type) = req.event_type {
        request = request.header("X-HookSniff-Event", event_type.as_str());
    }

    let response = request
        .json(&req.payload)
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Request failed: {}", e)))?;

    let duration_ms = start.elapsed().as_millis() as u64;
    let status_code = response.status().as_u16();
    let response_body = response.text().await.unwrap_or_else(|_| "<unreadable>".to_string());
    let response_body = if response_body.len() > 4096 {
        format!("{}...[truncated]", &response_body[..4096])
    } else { response_body };

    // Log to audit
    let _ = crate::audit::log_action(
        &pool, customer.id, "admin.test_webhook", "customer",
        Some(&id.to_string()),
        Some(serde_json::json!({ "target_url": req.endpoint_url, "admin_email": customer.email })),
        None, None,
    ).await;

    Ok(Json(TestWebhookResponse { status_code, response_body, duration_ms }))
}

/// POST /v1/admin/users/:id/webhooks/:delivery_id/replay — Replay a specific user's delivery
async fn admin_user_replay_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((user_id, delivery_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    // Find the original delivery, verify it belongs to the user
    let original = sqlx::query_as::<_, (Uuid, Uuid, serde_json::Value, Option<String>, i32)>(
        "SELECT id, endpoint_id, payload, event_type, replay_count FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(delivery_id)
    .bind(user_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (orig_id, endpoint_id, payload, event_type, replay_count) = original;

    let new_delivery = sqlx::query_as::<_, (Uuid,)>(
        r#"INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count, is_test)
           VALUES ($1, $2, $3, $4, 'pending', 3, $5, FALSE)
           RETURNING id"#,
    )
    .bind(endpoint_id)
    .bind(user_id)
    .bind(&payload)
    .bind(&event_type)
    .bind(replay_count + 1)
    .fetch_one(&pool)
    .await?;

    tracing::info!("🔁 Admin replayed delivery {} for user {} → new delivery {}", orig_id, user_id, new_delivery.0);

    Ok(Json(serde_json::json!({
        "message": "Delivery replayed successfully",
        "original_id": orig_id,
        "new_delivery_id": new_delivery.0,
    })))
}

// ═══════════════════════════════════════════════════════════════
// Aşama 2: System Monitoring Endpoints
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Deserialize)]
pub struct FailedDeliveriesParams {
    pub limit: Option<i64>,
    pub since: Option<String>,
    pub user_id: Option<Uuid>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct FailedDeliveryRow {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub endpoint_id: Uuid,
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub response_body: Option<String>,
    pub created_at: DateTime<Utc>,
    pub error_message: Option<String>,
    pub customer_email: Option<String>,
    pub endpoint_url: Option<String>,
}

/// GET /v1/admin/deliveries/failed — All users' failed deliveries
async fn admin_failed_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<FailedDeliveriesParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let limit = params.limit.unwrap_or(50).min(200);
    let since = params.since.as_deref().unwrap_or("24h");
    let interval = match since {
        "1h" => "1 hour",
        "24h" => "24 hours",
        "7d" => "7 days",
        "30d" => "30 days",
        _ => "24 hours",
    };

    let rows = if let Some(uid) = params.user_id {
        sqlx::query_as::<_, FailedDeliveryRow>(&format!(
            r#"SELECT d.id, d.customer_id, d.endpoint_id, d.event_type, d.status,
                d.attempt_count, d.response_status, d.response_body, d.created_at,
                (SELECT da.error_message FROM delivery_attempts da
                 WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message,
                c.email as customer_email,
                e.url as endpoint_url
            FROM deliveries d
            LEFT JOIN customers c ON c.id = d.customer_id
            LEFT JOIN endpoints e ON e.id = d.endpoint_id
            WHERE d.status = 'failed'
              AND d.customer_id = $1
              AND d.created_at >= NOW() - INTERVAL '{}'
            ORDER BY d.created_at DESC LIMIT $2"#, interval
        ))
        .bind(uid)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, FailedDeliveryRow>(&format!(
            r#"SELECT d.id, d.customer_id, d.endpoint_id, d.event_type, d.status,
                d.attempt_count, d.response_status, d.response_body, d.created_at,
                (SELECT da.error_message FROM delivery_attempts da
                 WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message,
                c.email as customer_email,
                e.url as endpoint_url
            FROM deliveries d
            LEFT JOIN customers c ON c.id = d.customer_id
            LEFT JOIN endpoints e ON e.id = d.endpoint_id
            WHERE d.status = 'failed'
              AND d.created_at >= NOW() - INTERVAL '{}'
            ORDER BY d.created_at DESC LIMIT $1"#, interval
        ))
        .bind(limit)
        .fetch_all(&pool)
        .await?
    };

    Ok(Json(serde_json::json!({
        "deliveries": rows,
        "count": rows.len(),
    })))
}

#[derive(Debug, Deserialize)]
pub struct DeadLetterParams {
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DeadLetterRow {
    pub id: Uuid,
    pub delivery_id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub payload: serde_json::Value,
    pub reason: Option<String>,
    pub attempts: i32,
    pub created_at: DateTime<Utc>,
    pub customer_email: Option<String>,
    pub endpoint_url: Option<String>,
}

/// GET /v1/admin/deliveries/dead-letters — Permanently failed deliveries
async fn admin_dead_letters(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<DeadLetterParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let limit = params.limit.unwrap_or(50).min(200);

    let rows = sqlx::query_as::<_, DeadLetterRow>(
        r#"SELECT dl.id, dl.delivery_id, dl.endpoint_id, dl.customer_id,
            dl.payload, dl.reason, dl.attempts, dl.created_at,
            c.email as customer_email,
            e.url as endpoint_url
        FROM dead_letters dl
        LEFT JOIN customers c ON c.id = dl.customer_id
        LEFT JOIN endpoints e ON e.id = dl.endpoint_id
        ORDER BY dl.created_at DESC LIMIT $1"#
    )
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "dead_letters": rows,
        "count": rows.len(),
    })))
}

#[derive(Debug, Serialize)]
pub struct QueueStatus {
    pub pending: i64,
    pub processing: i64,
    pub failed: i64,
    pub total: i64,
    pub oldest_pending_at: Option<DateTime<Utc>>,
    pub failed_last_hour: i64,
}

/// GET /v1/admin/queue/status — Webhook queue depth
async fn admin_queue_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<QueueStatus>, AppError> {
    require_admin(&customer)?;

    let pending: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'pending'"
    ).fetch_one(&pool).await?;

    let processing: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'processing'"
    ).fetch_one(&pool).await?;

    let failed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'failed'"
    ).fetch_one(&pool).await?;

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM webhook_queue"
    ).fetch_one(&pool).await?;

    let oldest: (Option<DateTime<Utc>>,) = sqlx::query_as(
        "SELECT MIN(created_at) FROM webhook_queue WHERE status = 'pending'"
    ).fetch_one(&pool).await?;

    let failed_1h: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM webhook_queue WHERE status = 'failed' AND updated_at >= NOW() - INTERVAL '1 hour'"
    ).fetch_one(&pool).await?;

    Ok(Json(QueueStatus {
        pending: pending.0,
        processing: processing.0,
        failed: failed.0,
        total: total.0,
        oldest_pending_at: oldest.0,
        failed_last_hour: failed_1h.0,
    }))
}

#[derive(Debug, Deserialize)]
pub struct RateLimitViolationParams {
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct RateLimitViolationRow {
    pub id: Uuid,
    pub customer_id: Option<Uuid>,
    pub endpoint_id: Option<Uuid>,
    pub ip: Option<String>,
    pub requests_count: i32,
    pub limit_per_window: i32,
    pub window_seconds: i32,
    pub created_at: DateTime<Utc>,
    pub customer_email: Option<String>,
}

/// GET /v1/admin/rate-limit-violations — Recent rate limit violations
async fn admin_rate_limit_violations(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<RateLimitViolationParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let limit = params.limit.unwrap_or(50).min(200);

    let rows = sqlx::query_as::<_, RateLimitViolationRow>(
        r#"SELECT rv.id, rv.customer_id, rv.endpoint_id, rv.ip,
            rv.requests_count, rv.limit_per_window, rv.window_seconds, rv.created_at,
            c.email as customer_email
        FROM rate_limit_violations rv
        LEFT JOIN customers c ON c.id = rv.customer_id
        ORDER BY rv.created_at DESC LIMIT $1"#
    )
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "violations": rows,
        "count": rows.len(),
    })))
}

#[derive(Debug, Deserialize)]
pub struct LatencyParams {
    pub period: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct EndpointLatencyRow {
    pub endpoint_id: Uuid,
    pub url: String,
    pub total_deliveries: i64,
    pub avg_latency_ms: Option<f64>,
    pub p95_latency_ms: Option<f64>,
    pub failed_count: i64,
    pub error_rate: f64,
}

/// GET /v1/admin/api-latency — Endpoint-based response time
async fn admin_api_latency(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<LatencyParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let period = params.period.as_deref().unwrap_or("24h");
    let interval = match period {
        "1h" => "1 hour",
        "24h" => "24 hours",
        "7d" => "7 days",
        _ => "24 hours",
    };

    let rows = sqlx::query_as::<_, EndpointLatencyRow>(&format!(
        r#"SELECT
            e.id as endpoint_id,
            e.url,
            COUNT(DISTINCT d.id) as total_deliveries,
            AVG(da.duration_ms) as avg_latency_ms,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY da.duration_ms) as p95_latency_ms,
            COUNT(CASE WHEN d.status = 'failed' THEN 1 END) as failed_count,
            CASE WHEN COUNT(DISTINCT d.id) > 0
                THEN ROUND(COUNT(CASE WHEN d.status = 'failed' THEN 1 END)::numeric / COUNT(DISTINCT d.id) * 100, 1)
                ELSE 0
            END as error_rate
        FROM endpoints e
        LEFT JOIN deliveries d ON d.endpoint_id = e.id
            AND d.created_at >= NOW() - INTERVAL '{}'
        LEFT JOIN delivery_attempts da ON da.delivery_id = d.id
        GROUP BY e.id, e.url
        HAVING COUNT(DISTINCT d.id) > 0
        ORDER BY avg_latency_ms DESC NULLS LAST
        LIMIT 50"#, interval
    ))
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "endpoints": rows,
        "period": period,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};

    // ── PaginationParams ────────────────────────────────────

    #[test]
    fn test_pagination_params_all_none() {
        let json = r#"{}"#;
        let params: PaginationParams = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
        assert!(params.search.is_none());
        assert!(params.plan.is_none());
        assert!(params.status.is_none());
    }

    #[test]
    fn test_pagination_params_all_some() {
        let json = r#"{"page":2,"per_page":50,"search":"test","plan":"pro","status":"active"}"#;
        let params: PaginationParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.page, Some(2));
        assert_eq!(params.per_page, Some(50));
        assert_eq!(params.search, Some("test".to_string()));
        assert_eq!(params.plan, Some("pro".to_string()));
        assert_eq!(params.status, Some("active".to_string()));
    }

    // ── PlanRequest ─────────────────────────────────────────

    #[test]
    fn test_plan_request_deserialization() {
        let json = r#"{"plan":"pro"}"#;
        let req: PlanRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "pro");
    }

    // ── StatusRequest ───────────────────────────────────────

    #[test]
    fn test_status_request_deserialization() {
        let json_true = r#"{"is_active":true}"#;
        let req: StatusRequest = serde_json::from_str(json_true).unwrap();
        assert!(req.is_active);

        let json_false = r#"{"is_active":false}"#;
        let req: StatusRequest = serde_json::from_str(json_false).unwrap();
        assert!(!req.is_active);
    }

    // ── SdkUpdateRequest / SdkUpdateItem ────────────────────

    #[test]
    fn test_sdk_update_request_deserialization() {
        let json = r#"{
            "updates": [
                {"sdk": "python", "local_version": "1.0.0", "published_version": "1.1.0"},
                {"sdk": "node", "local_version": "2.0.0", "published_version": "2.1.0"}
            ]
        }"#;
        let req: SdkUpdateRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.updates.len(), 2);
        assert_eq!(req.updates[0].sdk, "python");
        assert_eq!(req.updates[0].local_version, "1.0.0");
        assert_eq!(req.updates[0].published_version, "1.1.0");
        assert_eq!(req.updates[1].sdk, "node");
    }

    #[test]
    fn test_sdk_update_item_deserialization() {
        let json = r#"{"sdk":"rust","local_version":"0.1.0","published_version":"0.2.0"}"#;
        let item: SdkUpdateItem = serde_json::from_str(json).unwrap();
        assert_eq!(item.sdk, "rust");
    }

    #[test]
    fn test_sdk_update_request_empty() {
        let json = r#"{"updates":[]}"#;
        let req: SdkUpdateRequest = serde_json::from_str(json).unwrap();
        assert!(req.updates.is_empty());
    }

    // ── UserSummary ─────────────────────────────────────────

    #[test]
    fn test_user_summary_serialization() {
        let user = UserSummary {
            id: Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap(),
            email: "test@example.com".to_string(),
            name: Some("Test User".to_string()),
            plan: "pro".to_string(),
            role: "member".to_string(),
            is_active: true,
            is_admin: false,
            created_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
        };
        let json = serde_json::to_value(&user).unwrap();
        assert_eq!(json["email"], "test@example.com");
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["status"], "active");
        assert!(!json["is_admin"].as_bool().unwrap());
    }

    #[test]
    fn test_user_summary_banned_status() {
        let user = UserSummary {
            id: Uuid::new_v4(),
            email: "banned@x.com".to_string(),
            name: None,
            plan: "developer".to_string(),
            role: "member".to_string(),
            is_active: false,
            is_admin: false,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&user).unwrap();
        assert_eq!(json["status"], "banned");
    }

    // ── PaginatedUsers ──────────────────────────────────────

    #[test]
    fn test_paginated_users_serialization() {
        let resp = PaginatedUsers {
            users: vec![],
            total: 0,
            page: 1,
            per_page: 20,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["page"], 1);
        assert_eq!(json["per_page"], 20);
        assert!(json["users"].as_array().unwrap().is_empty());
    }

    // ── EndpointSummary ─────────────────────────────────────

    #[test]
    fn test_endpoint_summary_serialization() {
        let ep = EndpointSummary {
            id: Uuid::new_v4(),
            url: "https://example.com/webhook".to_string(),
            description: Some("Main endpoint".to_string()),
            is_active: true,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&ep).unwrap();
        assert_eq!(json["url"], "https://example.com/webhook");
        assert!(json["is_active"].as_bool().unwrap());
        assert!(json.get("created_at").is_some());
    }

    // ── DeliverySummary ─────────────────────────────────────

    #[test]
    fn test_delivery_summary_serialization() {
        let d = DeliverySummary {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            status: "delivered".to_string(),
            event_type: Some("order.created".to_string()),
            created_at: Utc::now(),
            attempt_count: 1,
        };
        let json = serde_json::to_value(&d).unwrap();
        assert_eq!(json["status"], "delivered");
        assert_eq!(json["event"], "order.created");
        assert_eq!(json["attempt_count"], 1);
    }

    #[test]
    fn test_delivery_summary_event_alias() {
        let d = DeliverySummary {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            status: "pending".to_string(),
            event_type: Some("user.signup".to_string()),
            created_at: Utc::now(),
            attempt_count: 0,
        };
        let json = serde_json::to_value(&d).unwrap();
        // Field is renamed to "event" via serde(rename)
        let json_str = json.to_string();
        let from_json: serde_json::Value = serde_json::from_str(&json_str).unwrap();
        assert_eq!(from_json["event"], "user.signup");
    }

    // ── UsageStats ──────────────────────────────────────────

    #[test]
    fn test_usage_stats_serialization() {
        let stats = UsageStats {
            total_deliveries: 1000,
            success_rate: 98.5,
            endpoints_count: 5,
        };
        let json = serde_json::to_value(&stats).unwrap();
        assert_eq!(json["total_deliveries"], 1000);
        assert_eq!(json["success_rate"], 98.5);
        assert_eq!(json["endpoints_count"], 5);
    }

    // ── SystemStats ─────────────────────────────────────────

    #[test]
    fn test_system_stats_serialization() {
        let stats = SystemStats {
            total_users: 500,
            total_deliveries: 10000,
            total_revenue: 25000.0,
            active_users_today: 50,
            total_endpoints: 200,
            active_endpoints: 180,
            users_by_plan: vec![],
            recent_signups: vec![],
            trends: StatsTrends {
                total_users_yesterday: 490,
                total_deliveries_yesterday: 9800,
                revenue_yesterday: 24000.0,
                active_users_yesterday: 45,
                active_webhooks: 12,
            },
        };
        let json = serde_json::to_value(&stats).unwrap();
        assert_eq!(json["total_users"], 500);
        assert_eq!(json["total_revenue"], 25000.0);
        assert_eq!(json["total_endpoints"], 200);
        assert_eq!(json["active_endpoints"], 180);
        assert_eq!(json["trends"]["active_webhooks"], 12);
    }

    // ── PlanCount ───────────────────────────────────────────

    #[test]
    fn test_plan_count_serialization() {
        let pc = PlanCount {
            plan: "pro".to_string(),
            count: 42,
        };
        let json = serde_json::to_value(&pc).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["count"], 42);
    }

    // ── RecentSignup ────────────────────────────────────────

    #[test]
    fn test_recent_signup_serialization() {
        let signup = RecentSignup {
            id: Uuid::new_v4(),
            email: "new@user.com".to_string(),
            name: Some("New User".to_string()),
            plan: "developer".to_string(),
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&signup).unwrap();
        assert_eq!(json["email"], "new@user.com");
        assert_eq!(json["plan"], "developer");
    }

    // ── RevenueRow ──────────────────────────────────────────

    #[test]
    fn test_revenue_row_serialization() {
        let row = RevenueRow {
            month: "2024-01".to_string(),
            revenue: 5000.0,
        };
        let json = serde_json::to_value(&row).unwrap();
        assert_eq!(json["month"], "2024-01");
        assert_eq!(json["revenue"], 5000.0);
    }

    // ── RevenueResponse ─────────────────────────────────────

    #[test]
    fn test_revenue_response_serialization() {
        let resp = RevenueResponse {
            monthly_revenue: vec![
                RevenueRow { month: "2024-01".to_string(), revenue: 1000.0 },
                RevenueRow { month: "2024-02".to_string(), revenue: 1500.0 },
            ],
            revenue_by_plan: vec![
                RevenueByPlan { plan: "pro".to_string(), revenue: 290.0, count: 10 },
                RevenueByPlan { plan: "enterprise".to_string(), revenue: 990.0, count: 10 },
            ],
            mrr: 1280.0,
            churn_rate: 2.5,
            mrr_trend: 5.0,
            collected_revenue: 2500.0,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json.get("monthly_revenue").is_some());
        assert!(json.get("revenue_by_plan").is_some());
        assert_eq!(json["mrr"], 1280.0);
        assert_eq!(json["churn_rate"], 2.5);
        assert_eq!(json["mrr_trend"], 5.0);
        assert_eq!(json["collected_revenue"], 2500.0);
        assert_eq!(json["monthly_revenue"].as_array().unwrap().len(), 2);
        assert_eq!(json["revenue_by_plan"].as_array().unwrap().len(), 2);
    }

    // ── RevenueByPlan ───────────────────────────────────────

    #[test]
    fn test_revenue_by_plan_serialization() {
        let rbp = RevenueByPlan {
            plan: "pro".to_string(),
            revenue: 580.0,
            count: 20,
        };
        let json = serde_json::to_value(&rbp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["revenue"], 580.0);
        assert_eq!(json["count"], 20);
    }

    // ── UserDetailResponse ──────────────────────────────────

    #[test]
    fn test_user_detail_response_serialization() {
        let resp = UserDetailResponse {
            user: UserSummary {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: None,
                plan: "developer".to_string(),
                role: "member".to_string(),
                is_active: true,
                is_admin: false,
                created_at: Utc::now(),
            },
            endpoints: vec![],
            recent_deliveries: vec![],
            usage_stats: UsageStats {
                total_deliveries: 0,
                success_rate: 100.0,
                endpoints_count: 0,
            },
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json.get("user").is_some());
        assert!(json.get("usage_stats").is_some());
    }

    // ── UserDetail ──────────────────────────────────────────

    #[test]
    fn test_user_detail_serialization() {
        let detail = UserDetail {
            id: Uuid::new_v4(),
            email: "admin@x.com".to_string(),
            name: Some("Admin".to_string()),
            plan: "enterprise".to_string(),
            is_active: true,
            is_admin: true,
            webhook_limit: 500_000,
            webhook_count: 1234,
            created_at: Utc::now(),
            endpoints: vec![],
            recent_deliveries: vec![],
        };
        let json = serde_json::to_value(&detail).unwrap();
        assert_eq!(json["webhook_limit"], 500_000);
        assert_eq!(json["webhook_count"], 1234);
    }

    // ── ChurnedUser ─────────────────────────────────────────

    #[test]
    fn test_churned_user_serialization() {
        let user = ChurnedUser {
            id: Uuid::new_v4(),
            email: "churned@x.com".to_string(),
            name: None,
            plan: "pro".to_string(),
            amount: 29.0,
            churn_date: Utc::now(),
        };
        let json = serde_json::to_value(&user).unwrap();
        assert_eq!(json["email"], "churned@x.com");
        assert_eq!(json["amount"], 29.0);
    }

    // ── TestWebhookResponse ─────────────────────────────────

    #[test]
    fn test_test_webhook_response_serialization() {
        let resp = TestWebhookResponse {
            status_code: 200,
            response_body: "OK".to_string(),
            duration_ms: 42,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["status_code"], 200);
        assert_eq!(json["response_body"], "OK");
        assert_eq!(json["duration_ms"], 42);
    }

    // ── UserAnalytics ───────────────────────────────────────

    #[test]
    fn test_user_analytics_serialization() {
        let analytics = UserAnalytics {
            daily_deliveries: vec![],
            top_event_types: vec![],
            endpoint_health: vec![],
        };
        let json = serde_json::to_value(&analytics).unwrap();
        assert!(json.get("daily_deliveries").is_some());
        assert!(json.get("top_events").is_some());
        assert!(json.get("endpoint_health").is_some());
    }

    // ── AdminAuditEntry ─────────────────────────────────────

    #[test]
    fn test_admin_audit_entry_serialization() {
        let entry = AdminAuditEntry {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
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

    // ── CSV Export Params ───────────────────────────────────

    #[test]
    fn test_export_users_params_defaults() {
        let params = ExportUsersParams {
            format: None,
            plan: None,
            status: None,
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

    // ── Escape CSV ──────────────────────────────────────────

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

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_admin_router_construction() {
        let _router = router();
    }

    // ── Aşama 2: System Monitoring ──────────────────────────

    #[test]
    fn test_failed_deliveries_params_defaults() {
        let params = FailedDeliveriesParams {
            limit: None,
            since: None,
            user_id: None,
        };
        assert!(params.limit.is_none());
        assert!(params.since.is_none());
        assert!(params.user_id.is_none());
    }

    #[test]
    fn test_dead_letter_params_defaults() {
        let params = DeadLetterParams { limit: None };
        assert!(params.limit.is_none());
    }

    #[test]
    fn test_rate_limit_violation_params_defaults() {
        let params = RateLimitViolationParams { limit: None };
        assert!(params.limit.is_none());
    }

    #[test]
    fn test_latency_params_defaults() {
        let params = LatencyParams { period: None };
        assert!(params.period.is_none());
    }

    #[test]
    fn test_queue_status_serialization() {
        let qs = QueueStatus {
            pending: 10,
            processing: 3,
            failed: 1,
            total: 14,
            oldest_pending_at: None,
            failed_last_hour: 0,
        };
        let json = serde_json::to_value(&qs).unwrap();
        assert_eq!(json["pending"], 10);
        assert_eq!(json["processing"], 3);
        assert_eq!(json["failed"], 1);
        assert_eq!(json["total"], 14);
    }
}
