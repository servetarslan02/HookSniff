pub mod handlers;

use handlers::*;

// Re-export for external modules (auth_2fa, oauth, inbound, middleware)
pub use handlers::create_refresh_token;
use axum::http::{HeaderMap, HeaderValue};
use axum::response::IntoResponse;
use axum::routing::{get, post, put};
use axum::{Json, Router};
use chrono::{Duration, Utc};
use serde::Deserialize;
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::auth::jwt;
use crate::error::ErrorCode;
use crate::config::Config;
use crate::error::AppError;
use crate::middleware::{
    clear_auth_cookie, clear_refresh_token_cookie, create_auth_cookie, create_refresh_token_cookie,
    generate_api_key, hash_api_key,
};
use crate::models::customer::{
    AuthResponse, ChangePasswordRequest, CreateCustomerRequest, Customer, CustomerResponse,
    ForgotPasswordRequest, LoginRequest, RefreshTokenRequest, ResendVerificationRequest,
    ResetPasswordRequest, TwoFactorRequiredResponse, UpdateProfileRequest, VerifyEmailRequest,
};

// ════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════

const LOGIN_RATE_LIMIT: u32 = 10;
const REGISTER_RATE_LIMIT: u32 = 5;
/// HS-039: Access token lifetime — 15 minutes (short-lived for security).
/// Proactive refresh on the frontend renews it at ~12 min while the user is active.
/// Idle timeout (1 hour) handles logout for inactive users.
const TOKEN_MAX_AGE: i64 = 3600;   // 1 hour (matches JWT expiry)
const REFRESH_TOKEN_MAX_AGE: i64 = 7776000;  // 90 days
const RESET_RATE_LIMIT: u32 = 5;
const VERIFY_EMAIL_RATE_LIMIT: u32 = 10;
const REFRESH_RATE_LIMIT: u32 = 30;

/// Full SELECT for Customer — used by auth and auth_2fa modules.
pub(crate) const CUSTOMER_SELECT: &str = "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial, avatar_url FROM customers";

// ════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════

fn validate_password_strength(password: &str) -> Result<(), AppError> {
    if password.len() < 8 {
        return Err(AppError::coded(ErrorCode::PasswordTooShort));
    }
    if password.len() > 128 {
        return Err(AppError::coded(ErrorCode::PasswordTooLong));
    }
    if !password.chars().any(|c| c.is_ascii_uppercase()) {
        return Err(AppError::coded(ErrorCode::PasswordNeedsUppercase));
    }
    if !password.chars().any(|c| c.is_ascii_lowercase()) {
        return Err(AppError::coded(ErrorCode::PasswordNeedsLowercase));
    }
    if !password.chars().any(|c| c.is_ascii_digit()) {
        return Err(AppError::coded(ErrorCode::PasswordNeedsDigit));
    }
    Ok(())
}

pub fn auth_response_with_cookie(body: AuthResponse) -> (HeaderMap, Json<serde_json::Value>) {
    let mut headers = HeaderMap::new();
    let access_cookie = create_auth_cookie(&body.token, TOKEN_MAX_AGE);
    headers.insert("set-cookie", HeaderValue::from_str(&access_cookie).unwrap_or_else(|_| HeaderValue::from_static("")));

    if let Some(ref refresh) = body.refresh_token {
        let refresh_cookie = create_refresh_token_cookie(refresh, REFRESH_TOKEN_MAX_AGE);
        headers.append("set-cookie", HeaderValue::from_str(&refresh_cookie).unwrap_or_else(|_| HeaderValue::from_static("")));
    }

    // Include refresh_token in body so frontend can store it in localStorage as fallback
    // (Vercel proxy doesn't forward Set-Cookie from upstream API)
    let mut response = serde_json::json!({ "token": body.token, "customer": body.customer });
    if let Some(ref rt) = body.refresh_token {
        response["refresh_token"] = serde_json::json!(rt);
    }
    (headers, Json(response))
}

pub fn extract_client_ip(headers: &HeaderMap) -> String {
    if let Some(real_ip) = headers.get("x-real-ip").and_then(|v| v.to_str().ok()) {
        let ip = real_ip.trim();
        if !ip.is_empty() && ip != "unknown" { return ip.to_string(); }
    }
    headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next_back())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty() && s != "unknown")
        .unwrap_or_else(|| "unknown".to_string())
}

/// Log an audit action, extracting IP and user-agent from headers. Errors are silently ignored.
pub async fn send_audit_log(pool: &PgPool, customer_id: Uuid, action: &str, headers: &HeaderMap) {
    let rid = customer_id.to_string();
    let ip = extract_client_ip(headers);
    let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
    let _ = crate::audit::log_action(pool, customer_id, action, "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
}

/// Send email via job queue with fallback to direct send.
/// `send_direct` is called as fallback when job queue is unavailable or enqueue fails.
pub async fn send_email_with_fallback<F>(
    job_queue: Option<&crate::jobs::job_queue::JobQueue>,
    email_provider: &crate::email::EmailProvider,
    to: &str,
    template: crate::jobs::job_queue::EmailTemplate,
    lang: crate::email::Language,
    send_direct: F,
) where
    F: FnOnce(crate::email::EmailProvider, String, crate::email::Language) + Send + 'static,
{
    let lang_str = if lang == crate::email::Language::Tr { "tr" } else { "en" };
    let to_owned = to.to_string();

    if let Some(queue) = job_queue {
        let job = crate::jobs::job_queue::Job::Email {
            to: to_owned.clone(),
            template,
            language: lang_str.to_string(),
        };
        if let Err(e) = queue.enqueue(&job).await {
            tracing::warn!("Failed to enqueue email for {}: {:?}", to_owned, e);
            send_direct(email_provider.clone(), to_owned, lang);
        }
    } else {
        send_direct(email_provider.clone(), to_owned, lang);
    }
}

// ════════════════════════════════════════════════════════
// Router
// ════════════════════════════════════════════════════════

pub fn router() -> Router {
    let public = Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
        .route("/verify-email", post(verify_email))
        .route("/resend-verification", post(resend_verification))
        .route("/refresh", post(refresh_token))
        .route("/2fa/verify", post(super::auth_2fa::verify_2fa_login));

    let protected = Router::new()
        .route("/me", get(get_me))
        .route("/profile", put(update_profile))
        .route("/password", put(change_password))
        .route("/logout", post(logout))
        .route("/2fa/enable", post(super::auth_2fa::enable_2fa))
        .route("/2fa/confirm", post(super::auth_2fa::confirm_2fa))
        .route("/2fa/disable", post(super::auth_2fa::disable_2fa))
        .route("/2fa/status", get(super::auth_2fa::two_factor_status))
        .route("/revoke-token", post(revoke_current_token))
        .route("/revoke-all-tokens", post(revoke_all_tokens))
        .route("/consent", get(get_consent).post(update_consent))
        .route("/request-email-change", post(request_email_change))
        .route("/confirm-email-change", post(confirm_email_change))
        .route("/export", get(export_data))
        .route("/account", axum::routing::delete(delete_account))
        .layer(axum::middleware::from_fn(crate::middleware::auth_middleware));

    public.merge(protected)
}

