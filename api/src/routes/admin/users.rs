//! Admin user management — list, detail, plan change, status, impersonate, analytics, resources.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;

use super::{
    require_admin, require_admin_write, DeliverySummary, EndpointSummary, PaginatedUsers,
    PaginationParams, PlanRequest, SendEmailRequest, StatusRequest, UsageStats, UserDetailResponse,
    UserSummary,
};

/// Detailed user info (used in tests, not directly in handlers).
#[derive(Debug, serde::Serialize)]
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

/// GET /v1/admin/users — List all customers with pagination and filters.
pub async fn list_users(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<PaginatedUsers>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 200);
    let offset = (page - 1) * per_page;

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
        let _ = bind_idx;
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let allowed_sort_fields = ["email", "name", "plan", "status", "created_at"];
    let sort_field = params.sort_field.as_deref().unwrap_or("created_at");
    let sort_field = if allowed_sort_fields.contains(&sort_field) {
        if sort_field == "status" {
            "is_active"
        } else {
            sort_field
        }
    } else {
        "created_at"
    };
    let sort_dir = match params.sort_dir.as_deref() {
        Some("asc") => "ASC",
        _ => "DESC",
    };

    let base_query = format!(
        "SELECT id, email, name, plan, COALESCE(role, 'member') as role, is_active, is_admin, created_at FROM customers {} ORDER BY {} {}",
        where_clause, sort_field, sort_dir
    );
    let count_query = format!("SELECT COUNT(*) FROM customers {}", where_clause);

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

/// GET /v1/admin/users/:id — Get customer detail with endpoints and recent deliveries.
pub async fn get_user_detail(
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

/// PUT /v1/admin/users/:id/plan — Change user's plan.
pub async fn change_plan(
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

    let limit: i64 = match req.plan.as_str() {
        "startup" => 30_000,
        "pro" => 100_000,
        "enterprise" => i64::MAX,
        _ => 100,
    };

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
            _ => 100,
        };
        limit > old_limit
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

    let _ = super::customers::log_communication(
        &pool,
        id,
        "plan_change",
        Some(&format!("Plan changed to {}", req.plan)),
        Some(serde_json::json!({ "new_plan": req.plan, "webhook_limit": limit })),
        customer.id,
    )
    .await;

    Ok(Json(serde_json::json!({
        "message": format!("Plan updated to {}", req.plan),
        "plan": req.plan,
        "webhook_limit": limit,
    })))
}

/// GET /v1/admin/users/:id/plan-history — Get plan change history for a user.
pub async fn user_plan_history(
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
    .bind(id.to_string())
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

/// POST /v1/admin/users/:id/send-email — Send email to a user.
pub async fn send_user_email(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(email): Extension<crate::email::EmailProvider>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Path(id): Path<Uuid>,
    Json(req): Json<SendEmailRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if !email.is_configured() {
        return Err(AppError::BadRequest(
            "Email provider not configured. Set RESEND_API_KEY or GCP_SA_JSON environment variable."
                .into(),
        ));
    }

    let rl_key = format!("admin_email:{}", customer.id);
    if !rate_limiter.check(&rl_key, 20).await {
        return Err(AppError::RateLimitExceeded);
    }

    if req.subject.trim().is_empty() {
        return Err(AppError::BadRequest("Email subject cannot be empty".into()));
    }
    if req.subject.len() > 500 {
        return Err(AppError::BadRequest(
            "Email subject too long (max 500 chars)".into(),
        ));
    }
    if req.body.len() > 100_000 {
        return Err(AppError::BadRequest(
            "Email body too long (max 100KB)".into(),
        ));
    }

    let user: Option<(String, Option<String>)> =
        sqlx::query_as("SELECT email, name FROM customers WHERE id = $1")
            .bind(id)
            .fetch_optional(&pool)
            .await?;

    let (email_addr, _name) = user.ok_or(AppError::NotFound)?;

    email
        .send_contact_email(&email_addr, &req.subject, &req.body)
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to send email: {}", e)))?;

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

    let _ = super::customers::log_communication(
        &pool,
        id,
        "email",
        Some(&req.subject),
        Some(serde_json::json!({ "subject": req.subject, "body_preview": req.body.chars().take(200).collect::<String>() })),
        customer.id,
    )
    .await;

    Ok(Json(serde_json::json!({ "message": "Email sent" })))
}

/// PUT /v1/admin/users/:id/status — Ban/activate user.
pub async fn change_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<StatusRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

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
    tracing::info!("✅ Admin {} user {} (reason: {:?})", status, id, req.reason);

    let details = serde_json::json!({
        "is_active": req.is_active,
        "reason": req.reason,
    });
    let _ = super::customers::log_communication(
        &pool,
        id,
        if req.is_active { "activated" } else { "ban" },
        Some(&format!(
            "User {}{}",
            status,
            req.reason
                .as_deref()
                .map(|r| format!(": {}", r))
                .unwrap_or_default()
        )),
        Some(details),
        customer.id,
    )
    .await;

    Ok(Json(serde_json::json!({
        "message": format!("User {}", status),
        "is_active": req.is_active,
    })))
}

/// POST /v1/admin/users/:id/impersonate — Generate a short-lived JWT for the target user.
pub async fn impersonate_user(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(config): Extension<Config>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if id == customer.id {
        return Err(AppError::BadRequest("Cannot impersonate yourself".into()));
    }

    let target = sqlx::query_as::<_, (Uuid, String, String, bool)>(
        "SELECT id, email, plan, is_active FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (target_id, target_email, target_plan, is_active) = target;

    if !is_active {
        return Err(AppError::BadRequest(
            "Cannot impersonate an inactive user".into(),
        ));
    }

    let token = jwt::generate_access_token(
        target_id,
        &target_email,
        &target_plan,
        &config.jwt_secret,
        false,
    )?;

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

    let _ = super::customers::log_communication(
        &pool,
        id,
        "impersonate",
        Some("Admin impersonated user"),
        Some(
            serde_json::json!({ "admin_email": customer.email, "target_email": target_email }),
        ),
        customer.id,
    )
    .await;

    Ok(Json(serde_json::json!({
        "token": token,
        "user_id": target_id,
        "email": target_email,
        "expires_in": 900,
    })))
}

// ── User Analytics ──────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnalyticsParams {
    pub days: Option<i64>,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
pub struct DailyDeliveryCount {
    pub date: String,
    pub total: i64,
    pub success: i64,
    pub failed: i64,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
pub struct EventTypeCount {
    #[serde(rename = "event")]
    pub event_type: Option<String>,
    pub count: i64,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
pub struct EndpointHealth {
    pub endpoint_id: Uuid,
    pub url: String,
    pub total: i64,
    pub success: i64,
    pub failed: i64,
    pub success_rate: f64,
    pub avg_latency_ms: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct UserAnalytics {
    pub daily_deliveries: Vec<DailyDeliveryCount>,
    #[serde(rename = "top_events")]
    pub top_event_types: Vec<EventTypeCount>,
    pub endpoint_health: Vec<EndpointHealth>,
}

/// GET /v1/admin/users/:id/analytics — Get user analytics for last N days.
pub async fn user_analytics(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<AnalyticsParams>,
) -> Result<Json<UserAnalytics>, AppError> {
    require_admin(&customer)?;

    let days = params.days.unwrap_or(30).clamp(1, 365);

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

    let top_event_types = sqlx::query_as::<_, EventTypeCount>(
        r#"SELECT event_type, COUNT(*) as count
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

// ── User Resources (endpoints, webhooks, api-keys, applications, usage) ──

/// GET /v1/admin/users/:id/endpoints — List user's endpoints with delivery stats.
pub async fn admin_user_endpoints(
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

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserWebhooksQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
    pub event_type: Option<String>,
    pub since: Option<String>,
}

/// GET /v1/admin/users/:id/webhooks — List user's deliveries with filters.
pub async fn admin_user_webhooks(
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
    let _ = bind_idx;

    let count_sql = format!("SELECT COUNT(*) FROM deliveries d {}", where_clause);
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql).bind(id);
    if let Some(ref s) = params.status {
        count_q = count_q.bind(s);
    }
    if let Some(ref e) = params.event_type {
        count_q = count_q.bind(e);
    }
    if let Some(ref s) = params.since {
        count_q = count_q.bind(s);
    }
    let total = count_q.fetch_one(&pool).await?;

    let data_sql = format!(
        r#"SELECT d.id, d.endpoint_id, d.status, d.event_type, d.created_at, d.attempt_count,
                  d.response_status, d.response_body,
                  (SELECT da.error_message FROM delivery_attempts da
                   WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message
           FROM deliveries d {} ORDER BY d.created_at DESC LIMIT ${} OFFSET ${}"#,
        where_clause, bind_idx, bind_idx + 1
    );

    let mut data_q = sqlx::query_as::<_, (Uuid, Uuid, String, Option<String>, chrono::DateTime<chrono::Utc>, i32, Option<i32>, Option<String>, Option<String>)>(&data_sql).bind(id);
    if let Some(ref s) = params.status {
        data_q = data_q.bind(s);
    }
    if let Some(ref e) = params.event_type {
        data_q = data_q.bind(e);
    }
    if let Some(ref s) = params.since {
        data_q = data_q.bind(s);
    }
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

/// GET /v1/admin/users/:id/api-keys — List user's API keys.
pub async fn admin_user_api_keys(
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

/// GET /v1/admin/users/:id/applications — List user's applications.
pub async fn admin_user_applications(
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

/// GET /v1/admin/users/:id/usage — Detailed usage statistics.
pub async fn admin_user_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let total: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let success: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'delivered'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let failed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'failed'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let pending: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'pending'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let endpoints: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let active_endpoints: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let last_30d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '30 days'",
    ).bind(id).fetch_one(&pool).await?;

    let last_7d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '7 days'",
    ).bind(id).fetch_one(&pool).await?;

    let top_events = sqlx::query_as::<_, (Option<String>, i64)>(
        r#"SELECT event_type, COUNT(*) as count FROM deliveries
           WHERE customer_id = $1 GROUP BY event_type ORDER BY count DESC LIMIT 10"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let success_rate = if total.0 > 0 {
        (success.0 as f64 / total.0 as f64) * 100.0
    } else {
        0.0
    };

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

/// POST /v1/admin/users/:id/test-webhook — Send test webhook to a user's endpoint.
pub async fn admin_user_test_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<super::delivery::TestWebhookRequest>,
) -> Result<Json<super::delivery::TestWebhookResponse>, AppError> {
    require_admin_write(&customer)?;

    if !req.endpoint_url.starts_with("http://") && !req.endpoint_url.starts_with("https://") {
        return Err(AppError::BadRequest(
            "URL must start with http:// or https://".into(),
        ));
    }

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
    let response_body = response
        .text()
        .await
        .unwrap_or_else(|_| "<unreadable>".to_string());
    let response_body = if response_body.len() > 4096 {
        format!("{}...[truncated]", &response_body[..4096])
    } else {
        response_body
    };

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "ADMIN_TEST_WEBHOOK",
        "customer",
        Some(&id.to_string()),
        Some(serde_json::json!({ "target_url": req.endpoint_url })),
        None,
        None,
    )
    .await;

    Ok(Json(super::delivery::TestWebhookResponse {
        status_code,
        response_body,
        duration_ms,
    }))
}

/// POST /v1/admin/users/:id/webhooks/:delivery_id/replay — Replay a specific user's delivery.
pub async fn admin_user_replay_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((user_id, delivery_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

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

    tracing::info!(
        "🔁 Admin replayed delivery {} for user {} → new delivery {}",
        orig_id,
        user_id,
        new_delivery.0
    );

    Ok(Json(serde_json::json!({
        "message": "Delivery replayed successfully",
        "original_id": orig_id,
        "new_delivery_id": new_delivery.0,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};

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
}
