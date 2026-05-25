//! GDPR data export, account deletion, and email change handlers.

use axum::extract::Extension;
use axum::http::HeaderMap;
use axum::Json;
use chrono::Utc;
use serde::Deserialize;
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::auth::jwt;
use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{extract_client_ip, send_email_with_fallback};
use super::helpers::generate_email_change_code;

// ── GDPR ────────────────────────────────────────────────────

pub async fn export_data(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let endpoints: Vec<serde_json::Value> = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE customer_id = $1 ORDER BY created_at",
    )
    .bind(customer.id).fetch_all(&pool).await?
    .into_iter().map(|e| serde_json::to_value(e).unwrap_or_default()).collect();

    let deliveries: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, endpoint_id, event, status, attempt_count, response_status, created_at FROM deliveries WHERE customer_id = $1 AND created_at > NOW() - INTERVAL '90 days' ORDER BY created_at DESC LIMIT 10000",
    )
    .bind(customer.id).fetch_all(&pool).await?
    .into_iter().map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"), "endpoint_id": row.get::<Uuid, _>("endpoint_id"),
        "event": row.get::<Option<String>, _>("event"), "status": row.get::<String, _>("status"),
        "attempt_count": row.get::<i32, _>("attempt_count"),
        "response_status": row.get::<Option<i32>, _>("response_status"),
        "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
    })).collect();

    let api_keys: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, name, api_key_prefix, is_active, created_at FROM api_keys WHERE customer_id = $1",
    )
    .bind(customer.id).fetch_all(&pool).await?
    .into_iter().map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"), "name": row.get::<Option<String>, _>("name"),
        "prefix": row.get::<String, _>("api_key_prefix"), "is_active": row.get::<bool, _>("is_active"),
        "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
    })).collect();

    tracing::info!("📦 Data export requested by customer {}", customer.id);
    Ok(Json(serde_json::json!({
        "export_date": Utc::now().to_rfc3339(),
        "account": { "id": customer.id, "email": customer.email, "name": customer.name, "plan": customer.plan, "email_verified": customer.email_verified, "created_at": customer.created_at },
        "endpoints": endpoints, "deliveries": deliveries, "api_keys": api_keys,
    })))
}

pub async fn delete_account(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let password = req.get("password").and_then(|v| v.as_str())
        .ok_or_else(|| AppError::coded(ErrorCode::PasswordRequired))?;
    let hash = customer.password_hash.as_ref().ok_or(AppError::coded(ErrorCode::PasswordNotSet))?;
    if !jwt::verify_password_async(password.to_string(), hash.clone()).await? {
        return Err(AppError::BadRequest("Invalid password".into()));
    }

    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM delivery_attempts WHERE delivery_id IN (SELECT id FROM deliveries WHERE customer_id = $1)")
        .bind(customer.id).execute(&mut *tx).await?;

    let tables = [
        "deliveries", "endpoints", "api_keys", "refresh_tokens",
        "password_reset_tokens", "email_verification_tokens", "notifications",
        "installed_agents", "payment_transactions", "invoices", "audit_log",
        "sso_configs", "custom_domains", "portal_configs", "device_tokens",
        "applications", "environments", "environment_variables",
        "notification_preferences", "customer_consents", "tfa_backup_codes",
        "background_tasks", "idempotency_keys", "dead_letters",
        "delivery_events", "daily_event_usage",
        "team_members", "sso_login_attempts", "domain_verifications",
        "connector_configs", "integrations", "inbound_configs",
        "event_schemas", "fanout_rules",
        "operational_webhook_deliveries", "operational_webhook_endpoints",
        "alert_rules", "stream_channels", "stream_subscriptions",
        "message_cursors", "ws_subscriptions",
        "agents", "agent_routes", "agent_events", "agent_audit_log",
        "ai_agent_configs", "ai_agent_executions",
        "token_revocation_events",
    ];
    for table in tables {
        sqlx::query(&format!("DELETE FROM {} WHERE customer_id = $1", table))
            .bind(customer.id).execute(&mut *tx).await?;
    }
    sqlx::query("DELETE FROM customers WHERE id = $1")
        .bind(customer.id).execute(&mut *tx).await?;
    tx.commit().await?;

    tracing::info!("🗑️ Account deleted for customer {} ({})", customer.id, customer.email);
    Ok(Json(serde_json::json!({"message": "Account and all associated data have been permanently deleted.", "deleted_at": Utc::now().to_rfc3339()})))
}

// ── Email Change ────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RequestEmailChangeRequest {
    pub new_email: String,
}

#[derive(Debug, Deserialize)]
pub struct ConfirmEmailChangeRequest {
    pub code: String,
}

pub async fn request_email_change(
    Extension(pool): Extension<PgPool>,
    Extension(_cfg): Extension<crate::config::Config>,
    Extension(customer): Extension<Customer>,
    Extension(email_provider): Extension<crate::email::EmailProvider>,
    Extension(job_queue): Extension<Option<crate::jobs::job_queue::JobQueue>>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<RequestEmailChangeRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let rl_key = format!("email_change:{}", customer.id);
    let rl_result = rate_limiter.check_with_window(&rl_key, 3, 900).await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    if let Err(e) = crate::validation::validate_email(&req.new_email) {
        return Err(AppError::BadRequest(e));
    }

    let new_email = req.new_email.to_lowercase();

    if new_email == customer.email.to_lowercase() {
        return Err(AppError::coded(ErrorCode::SameEmail));
    }

    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM customers WHERE LOWER(email) = LOWER($1) AND id != $2"
    )
    .bind(&new_email).bind(customer.id).fetch_optional(&pool).await?;
    if existing.is_some() {
        return Err(AppError::coded(ErrorCode::EmailInUse));
    }

    sqlx::query("DELETE FROM email_change_codes WHERE customer_id = $1")
        .bind(customer.id).execute(&pool).await?;

    let code = generate_email_change_code();
    let code_hash = jwt::hash_token(&code);
    let expires_at = Utc::now() + chrono::Duration::minutes(15);

    sqlx::query(
        "INSERT INTO email_change_codes (customer_id, new_email, code_hash, expires_at) VALUES ($1, $2, $3, $4)"
    )
    .bind(customer.id).bind(&new_email).bind(&code_hash).bind(expires_at)
    .execute(&pool).await?;

    let lang = crate::email::Language::from_accept_language(
        headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
    );
    let email_clone = new_email.clone();
    let code_clone = code.clone();
    send_email_with_fallback(job_queue.as_ref(), &email_provider, &new_email,
        crate::jobs::job_queue::EmailTemplate::Verification {
            verify_url: format!("Your HookSniff email change code: {}", code_clone),
        }, lang,
        move |ep, to, lang| {
            tokio::spawn(async move {
                if let Err(e) = ep.send_verification_email(&to, &format!("Your verification code is: {}", code_clone), lang).await {
                    tracing::warn!("Failed to send email change code to {}: {:?}", to, e);
                }
            });
        },
    ).await;

    tracing::info!("📧 Email change code sent for customer {} to {}", customer.id, &email_clone);
    Ok(Json(serde_json::json!({
        "message": "A verification code has been sent to your new email address.",
        "expires_in_minutes": 15
    })))
}

pub async fn confirm_email_change(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Json(req): Json<ConfirmEmailChangeRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let rl_key = format!("email_change_confirm:{}", customer.id);
    let rl_result = rate_limiter.check_with_window(&rl_key, 5, 300).await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    if req.code.len() != 6 || !req.code.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::coded(ErrorCode::InvalidCodeFormat));
    }

    let row: Option<(Uuid, String, String, chrono::DateTime<chrono::Utc>, i32)> = sqlx::query_as(
        "SELECT id, new_email, code_hash, expires_at, attempts FROM email_change_codes WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1"
    )
    .bind(customer.id).fetch_optional(&pool).await?;

    let (code_id, new_email, code_hash, expires_at, attempts) = match row {
        Some(r) => r,
        None => return Err(AppError::BadRequest("No pending email change. Please request a new code.".into())),
    };

    if attempts >= 5 {
        sqlx::query("DELETE FROM email_change_codes WHERE id = $1").bind(code_id).execute(&pool).await?;
        return Err(AppError::coded(ErrorCode::TooMany2faAttempts));
    }

    if Utc::now() > expires_at {
        sqlx::query("DELETE FROM email_change_codes WHERE id = $1").bind(code_id).execute(&pool).await?;
        return Err(AppError::coded(ErrorCode::CodeExpired));
    }

    sqlx::query("UPDATE email_change_codes SET attempts = attempts + 1 WHERE id = $1")
        .bind(code_id).execute(&pool).await?;

    let input_hash = jwt::hash_token(&req.code);
    if input_hash != code_hash {
        return Err(AppError::coded(ErrorCode::Invalid2faCode));
    }

    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM customers WHERE LOWER(email) = LOWER($1) AND id != $2"
    )
    .bind(&new_email).bind(customer.id).fetch_optional(&pool).await?;
    if existing.is_some() {
        sqlx::query("DELETE FROM email_change_codes WHERE id = $1").bind(code_id).execute(&pool).await?;
        return Err(AppError::coded(ErrorCode::EmailUnavailable));
    }

    sqlx::query("UPDATE customers SET email = $1, email_verified = true, updated_at = NOW() WHERE id = $2")
        .bind(&new_email).bind(customer.id).execute(&pool).await?;

    sqlx::query("DELETE FROM email_change_codes WHERE id = $1")
        .bind(code_id).execute(&pool).await?;

    tracing::info!("✅ Email changed for customer {} to {}", customer.id, &new_email);

    crate::notifications::helpers::email_changed(&pool, customer.id, &new_email).await;

    Ok(Json(serde_json::json!({
        "message": "Email address has been changed successfully.",
        "new_email": new_email
    })))
}
