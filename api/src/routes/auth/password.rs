//! Password reset and change handlers.

use axum::extract::Extension;
use axum::http::HeaderMap;
use axum::Json;
use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::{AppError, ErrorCode};
use crate::models::customer::{
    ChangePasswordRequest, Customer, ForgotPasswordRequest, ResetPasswordRequest,
};

use super::{
    RESET_RATE_LIMIT,
    validate_password_strength, extract_client_ip, send_audit_log, send_email_with_fallback,
};

// ── Password Reset ──────────────────────────────────────────

pub async fn forgot_password(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Extension(email_provider): Extension<crate::email::EmailProvider>,
    Extension(job_queue): Extension<Option<crate::jobs::job_queue::JobQueue>>,
    headers: HeaderMap,
    Json(req): Json<ForgotPasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("forgot_pwd:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, RESET_RATE_LIMIT).await;
    if !rl_result.allowed { return Err(AppError::RateLimitExceeded); }

    let customer: Option<(Uuid, String)> =
        sqlx::query_as("SELECT id, email FROM customers WHERE email = $1")
            .bind(&req.email).fetch_optional(&pool).await?;

    if let Some((customer_id, email)) = customer {
        let token = jwt::generate_random_token();
        let token_hash = jwt::hash_token(&token);
        let expires_at = Utc::now() + Duration::hours(1);

        sqlx::query("INSERT INTO password_reset_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)")
            .bind(customer_id).bind(&token_hash).bind(expires_at).execute(&pool).await?;

        let reset_url = format!("{}/reset-password?token={}", cfg.email_base_url, token);
        let lang = crate::email::Language::from_accept_language(
            headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
        );
        let reset_url_clone = reset_url.clone();
        send_email_with_fallback(job_queue.as_ref(), &email_provider, &email,
            crate::jobs::job_queue::EmailTemplate::PasswordReset { reset_url: reset_url.clone() }, lang,
            move |ep, to, lang| {
                tokio::spawn(async move {
                    if let Err(e) = ep.send_password_reset_email(&to, &reset_url_clone, lang).await {
                        tracing::warn!("Failed to send password reset email to {}: {:?}", to, e);
                    }
                });
            },
        ).await;

 tracing::info!(" Password reset email sent to: {}", email);
    }

    Ok(Json(serde_json::json!({"message": "If the email exists, a reset link has been sent."})))
}

pub async fn reset_password(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<ResetPasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("reset_pwd:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, RESET_RATE_LIMIT).await;
    if !rl_result.allowed { return Err(AppError::RateLimitExceeded); }

    validate_password_strength(&req.new_password)?;
    let token_hash = jwt::hash_token(&req.token);

    let record: Option<(Uuid, Uuid)> = sqlx::query_as(
        "SELECT id, customer_id FROM password_reset_tokens WHERE token_hash = $1 AND used = false AND expires_at > NOW()",
    )
    .bind(&token_hash).fetch_optional(&pool).await?;

    let (token_id, customer_id) = record.ok_or(AppError::coded(ErrorCode::InvalidResetToken))?;

    sqlx::query("UPDATE password_reset_tokens SET used = true WHERE id = $1")
        .bind(token_id).execute(&pool).await?;

    let new_hash = jwt::hash_password_async(req.new_password.clone()).await?;
    sqlx::query("UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash).bind(customer_id).execute(&pool).await?;

    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer_id).execute(&pool).await?;

 tracing::info!(" Password reset completed for customer {}", customer_id);
    Ok(Json(serde_json::json!({"message": "Password has been reset successfully."})))
}

// ── Change Password ─────────────────────────────────────────

pub async fn change_password(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    validate_password_strength(&req.new_password)?;
    let hash = customer.password_hash.as_ref().ok_or(AppError::coded(ErrorCode::PasswordLoginNotSetup))?;
    if !jwt::verify_password_async(req.current_password.clone(), hash.clone()).await? {
        return Err(AppError::coded(ErrorCode::WrongPassword));
    }

    let new_hash = jwt::hash_password_async(req.new_password.clone()).await?;
    sqlx::query("UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash).bind(customer.id).execute(&pool).await?;

    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer.id).execute(&pool).await?;
    let _ = jwt::revoke_all_tokens_for_customer(&pool, customer.id).await;

 tracing::info!(" Password changed for customer {}", customer.id);
    send_audit_log(&pool, customer.id, "PASSWORD_CHANGE", &headers).await;

    crate::notifications::helpers::password_changed(&pool, customer.id).await;

    Ok(Json(serde_json::json!({"message": "Password updated successfully"})))
}
