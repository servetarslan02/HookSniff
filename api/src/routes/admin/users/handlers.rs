use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::UserDetail;
use crate::routes::admin::{PaginationParams, PaginatedUsers, UserDetailResponse, PlanRequest, SendEmailRequest, StatusRequest, UserSummary, EndpointSummary, DeliverySummary, UsageStats, require_admin, require_admin_write};

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

    let _ = crate::routes::admin::customers::log_communication(
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
        return Err(AppError::coded(ErrorCode::EmailSubjectRequired));
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

    let _ = crate::routes::admin::customers::log_communication(
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
    let _ = crate::routes::admin::customers::log_communication(
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
        return Err(AppError::coded(ErrorCode::CannotImpersonateSelf));
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

    let _ = crate::routes::admin::customers::log_communication(
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

