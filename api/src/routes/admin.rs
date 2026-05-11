use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post, put};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/users", get(list_users))
        .route("/users/{id}", get(get_user_detail))
        .route("/users/{id}/plan", put(change_plan))
        .route("/users/{id}/status", put(change_status))
        .route("/stats", get(system_stats))
        .route("/revenue", get(revenue_by_month))
        .route("/sdk-update", post(notify_sdk_update))
        .route("/settings", get(get_settings).put(update_settings))
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
        let _ = bind_idx; // suppress unused assignment warning
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
        "SELECT id, url, description, is_active FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 500",
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
        return Err(AppError::BadRequest("Invalid plan".into()));
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

    // Revenue: assume $0 for free, $29 for pro, $99 for business (monthly)
    let revenue: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(SUM(
            CASE plan
                WHEN 'pro' THEN 29.0
                WHEN 'business' THEN 99.0
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
                        WHEN 'pro' THEN 29.0
                        WHEN 'business' THEN 99.0
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

// ─────────────────────────────────────────────────────────
// SDK Update Notifications
// ─────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct SdkUpdateRequest {
    pub updates: Vec<SdkUpdateItem>,
}

#[derive(Debug, Deserialize)]
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
    require_admin(&customer)?;

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
}

impl Default for PlatformSettings {
    fn default() -> Self {
        Self {
            default_plan: "free".into(),
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
        }
    }
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
    require_admin(&customer)?;

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
            plan: "free".to_string(),
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
        };
        let json = serde_json::to_value(&ep).unwrap();
        assert_eq!(json["url"], "https://example.com/webhook");
        assert!(json["is_active"].as_bool().unwrap());
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
        };
        let json = serde_json::to_value(&d).unwrap();
        assert_eq!(json["status"], "delivered");
        assert_eq!(json["event_type"], "order.created");
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
            users_by_plan: vec![],
            recent_signups: vec![],
        };
        let json = serde_json::to_value(&stats).unwrap();
        assert_eq!(json["total_users"], 500);
        assert_eq!(json["total_revenue"], 25000.0);
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
            plan: "free".to_string(),
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&signup).unwrap();
        assert_eq!(json["email"], "new@user.com");
        assert_eq!(json["plan"], "free");
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

    // ── UserDetailResponse ──────────────────────────────────

    #[test]
    fn test_user_detail_response_serialization() {
        let resp = UserDetailResponse {
            user: UserSummary {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: None,
                plan: "free".to_string(),
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
            plan: "business".to_string(),
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

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_admin_router_construction() {
        let _router = router();
    }
}
