//! Email verification, token refresh, logout, and token revocation handlers.

use axum::http::{HeaderMap, HeaderValue};
use axum::response::IntoResponse;
use axum::extract::Extension;
use axum::Json;
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{
    clear_auth_cookie, clear_refresh_token_cookie,
};
use crate::models::customer::{
    AuthResponse, Customer, RefreshTokenRequest, ResendVerificationRequest, VerifyEmailRequest,
};

use super::{
    VERIFY_EMAIL_RATE_LIMIT, REFRESH_RATE_LIMIT, RESET_RATE_LIMIT,
    auth_response_with_cookie, extract_client_ip,
};
use super::helpers::{create_refresh_token, send_verification_email_for_customer};

// ── Email Verification ──────────────────────────────────────

pub async fn verify_email(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<VerifyEmailRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("verify_email:{}", client_ip);
    let rl_result = rate_limiter.check_with_window(&rl_key, VERIFY_EMAIL_RATE_LIMIT, 900).await;
    if !rl_result.allowed { return Err(AppError::RateLimitExceeded); }

    let token_hash = jwt::hash_token(&req.token);
    let record: Option<(Uuid, Uuid)> = sqlx::query_as(
        "SELECT id, customer_id FROM email_verification_tokens WHERE token_hash = $1 AND used = false AND expires_at > NOW()",
    )
    .bind(&token_hash).fetch_optional(&pool).await?;

    let (token_id, customer_id) = record.ok_or(AppError::coded(ErrorCode::InvalidVerificationToken))?;

    sqlx::query("UPDATE email_verification_tokens SET used = true WHERE id = $1")
        .bind(token_id).execute(&pool).await?;
    sqlx::query("UPDATE customers SET email_verified = true, updated_at = NOW() WHERE id = $1")
        .bind(customer_id).execute(&pool).await?;

 tracing::info!(" Email verified for customer {}", customer_id);
    Ok(Json(serde_json::json!({"message": "Email verified successfully."})))
}

pub async fn resend_verification(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Extension(email_provider): Extension<crate::email::EmailProvider>,
    Extension(job_queue): Extension<Option<crate::jobs::job_queue::JobQueue>>,
    headers: HeaderMap,
    body: Option<Json<ResendVerificationRequest>>,
) -> Result<Json<serde_json::Value>, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("resend_verify:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, RESET_RATE_LIMIT).await;
    if !rl_result.allowed { return Err(AppError::RateLimitExceeded); }

    let email = if let Some(Json(req)) = body {
        req.email
    } else {
        let token = headers.get("cookie").and_then(|v| v.to_str().ok())
            .and_then(|c| c.split(';').find(|s| s.trim().starts_with("hooksniff_token="))
                .map(|s| s.trim().strip_prefix("hooksniff_token=").unwrap_or("").to_string()))
            .ok_or(AppError::Unauthorized)?;
        let claims = crate::auth::jwt::verify_token(&token, &cfg.jwt_secret)?;
        claims.email
    };

    let customer: Option<(Uuid, String, bool)> =
        sqlx::query_as("SELECT id, email, email_verified FROM customers WHERE email = $1")
            .bind(&email).fetch_optional(&pool).await?;

    if let Some((customer_id, email, verified)) = customer {
        if !verified {
            let lang = crate::email::Language::from_accept_language(
                headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
            );
            send_verification_email_for_customer(&pool, &cfg, &email_provider, job_queue.as_ref(), customer_id, &email, lang).await;
        }
    }

    Ok(Json(serde_json::json!({"message": "If the account exists and is unverified, a new verification email has been sent."})))
}

// ── Refresh Token ───────────────────────────────────────────

pub async fn refresh_token(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    body: Option<Json<RefreshTokenRequest>>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("refresh:{}", client_ip);
    let rl_result = rate_limiter.check_with_window(&rl_key, REFRESH_RATE_LIMIT, 900).await;
    if !rl_result.allowed { return Err(AppError::RateLimitExceeded); }

    let refresh_token_value = headers.get("cookie").and_then(|v| v.to_str().ok())
        .and_then(|cookies| cookies.split(';').find_map(|c| {
            c.trim().strip_prefix("hooksniff_refresh=").map(|s| s.to_string())
        }))
        .or_else(|| body.map(|b| b.refresh_token.clone()))
        .ok_or(AppError::coded(ErrorCode::RefreshTokenRequired))?;

    let token_hash = jwt::hash_token(&refresh_token_value);
    let record: Option<(Uuid, Uuid, chrono::DateTime<Utc>)> = sqlx::query_as(
        "SELECT id, customer_id, expires_at FROM refresh_tokens \
         WHERE token_hash = $1 AND expires_at > NOW() \
         AND (revoked = false OR revoked_at > NOW() - INTERVAL '5 minutes')",
    )
    .bind(&token_hash).fetch_optional(&pool).await?;

    let (token_id, customer_id, _) = record.ok_or(AppError::Unauthorized)?;

    let customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", super::CUSTOMER_SELECT))
        .bind(customer_id).fetch_optional(&pool).await?.ok_or(AppError::Unauthorized)?;

    if !customer.is_active { return Err(AppError::Unauthorized); }

    sqlx::query("UPDATE refresh_tokens SET revoked = true, revoked_at = NOW() WHERE id = $1")
        .bind(token_id).execute(&pool).await?;

    let new_access = jwt::generate_access_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret, customer.is_admin)?;
    let new_refresh = create_refresh_token(&pool, customer.id).await?;

    Ok(auth_response_with_cookie(AuthResponse {
        token: new_access, customer: customer.to_response(None), refresh_token: Some(new_refresh),
    }))
}

// ── Logout ──────────────────────────────────────────────────

pub async fn logout(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let token = headers.get("authorization").and_then(|v| v.to_str().ok()).and_then(|v| v.strip_prefix("Bearer ")).unwrap_or("");
    if let Ok(claims) = jwt::verify_token(token, &cfg.jwt_secret) {
        if let Some(ref jti) = claims.jti {
            let _ = jwt::revoke_token(&pool, jti, claims.exp as i64).await;
        }
    }
    let _ = sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer.id).execute(&pool).await;

    let mut headers = HeaderMap::new();
    headers.insert("set-cookie", HeaderValue::from_str(&clear_auth_cookie()).unwrap_or_else(|_| HeaderValue::from_static("")));
    headers.append("set-cookie", HeaderValue::from_str(&clear_refresh_token_cookie()).unwrap_or_else(|_| HeaderValue::from_static("")));
    (headers, Json(serde_json::json!({ "ok": true })))
}

// ── Token Revocation ────────────────────────────────────────

pub async fn revoke_current_token(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let token = headers.get("authorization").and_then(|v| v.to_str().ok()).and_then(|v| v.strip_prefix("Bearer ")).unwrap_or("");
    let claims = jwt::verify_token(token, &cfg.jwt_secret)?;
    if let Some(ref jti) = claims.jti {
        jwt::revoke_token(&pool, jti, claims.exp as i64).await?;
 tracing::info!(" Token revoked: jti={}", jti);
    }
    Ok(Json(serde_json::json!({"revoked": true, "message": "Token has been revoked."})))
}

pub async fn revoke_all_tokens(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    jwt::revoke_all_tokens_for_customer(&pool, customer.id).await?;
 tracing::info!(" All tokens revoked for customer {}", customer.id);
    Ok(Json(serde_json::json!({"revoked": true, "message": "All access tokens have been revoked."})))
}
