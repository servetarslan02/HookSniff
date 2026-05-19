use axum::extract::Extension;
use axum::http::{HeaderMap, HeaderValue};
use axum::response::IntoResponse;
use axum::routing::{get, post, put};
use axum::{Json, Router};
use chrono::{Duration, Utc};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::auth::jwt;
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
const TOKEN_MAX_AGE: i64 = 86400;
const REFRESH_TOKEN_MAX_AGE: i64 = 2592000;
const RESET_RATE_LIMIT: u32 = 5;
const VERIFY_EMAIL_RATE_LIMIT: u32 = 10;
const REFRESH_RATE_LIMIT: u32 = 30;

/// Full SELECT for Customer — used by auth and auth_2fa modules.
pub(crate) const CUSTOMER_SELECT: &str = "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at FROM customers";

// ════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════

fn validate_password_strength(password: &str) -> Result<(), AppError> {
    if password.len() < 8 {
        return Err(AppError::BadRequest("Password must be at least 8 characters".into()));
    }
    if password.len() > 128 {
        return Err(AppError::BadRequest("Password must be at most 128 characters".into()));
    }
    if !password.chars().any(|c| c.is_ascii_uppercase()) {
        return Err(AppError::BadRequest("Password must contain at least one uppercase letter".into()));
    }
    if !password.chars().any(|c| c.is_ascii_lowercase()) {
        return Err(AppError::BadRequest("Password must contain at least one lowercase letter".into()));
    }
    if !password.chars().any(|c| c.is_ascii_digit()) {
        return Err(AppError::BadRequest("Password must contain at least one digit".into()));
    }
    Ok(())
}

pub(crate) fn auth_response_with_cookie(body: AuthResponse) -> (HeaderMap, Json<serde_json::Value>) {
    let mut headers = HeaderMap::new();
    let access_cookie = create_auth_cookie(&body.token, TOKEN_MAX_AGE);
    headers.insert("set-cookie", HeaderValue::from_str(&access_cookie).unwrap_or_else(|_| HeaderValue::from_static("")));

    if let Some(ref refresh) = body.refresh_token {
        let refresh_cookie = create_refresh_token_cookie(refresh, REFRESH_TOKEN_MAX_AGE);
        headers.append("set-cookie", HeaderValue::from_str(&refresh_cookie).unwrap_or_else(|_| HeaderValue::from_static("")));
    }

    let response_body = serde_json::json!({ "token": body.token, "customer": body.customer });
    (headers, Json(response_body))
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
pub(crate) async fn send_audit_log(pool: &PgPool, customer_id: Uuid, action: &str, headers: &HeaderMap) {
    let rid = customer_id.to_string();
    let ip = extract_client_ip(headers);
    let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
    let _ = crate::audit::log_action(pool, customer_id, action, "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
}

/// Send email via job queue with fallback to direct send.
/// `send_direct` is called as fallback when job queue is unavailable or enqueue fails.
pub(crate) async fn send_email_with_fallback<F>(
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

// ── Registration ────────────────────────────────────────────

async fn register(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Extension(email_provider): Extension<crate::email::EmailProvider>,
    Extension(job_queue): Extension<Option<crate::jobs::job_queue::JobQueue>>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    headers: HeaderMap,
    Json(req): Json<CreateCustomerRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("register:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, REGISTER_RATE_LIMIT).await;
    if !rl_result.allowed { return Err(AppError::RateLimitExceeded); }

    if let Err(e) = crate::validation::validate_email(&req.email) {
        return Err(AppError::BadRequest(e));
    }

    let password = req.password.ok_or_else(|| AppError::BadRequest("Password is required".into()))?;
    validate_password_strength(&password)?;

    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..24].to_string();
    let password_hash = jwt::hash_password_async(password.clone()).await?;

    let existing: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM customers WHERE email = $1")
        .bind(&req.email).fetch_optional(&pool).await?;

    if existing.is_some() {
        tracing::info!("Registration attempt for existing email: {}", req.email);
        return Ok((HeaderMap::new(), Json(serde_json::json!({
            "message": "If this email is available, a verification email has been sent.",
        }))));
    }

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash, name, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *",
    )
    .bind(&req.email).bind(&api_key_hash).bind(&api_key_prefix).bind(&password_hash).bind(&req.name)
    .fetch_one(&pool).await?;

    tracing::info!("✅ New customer registered: {}", req.email);
    send_audit_log(&pool, customer.id, "REGISTER", &headers).await;

    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::UserCreated {
            user_id: customer.id, email: customer.email.clone(), plan: customer.plan.clone(),
        }).await {
            tracing::warn!("Failed to publish UserCreated event: {:?}", e);
        }
    }

    let lang = crate::email::Language::from_accept_language(
        headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
    );
    let to = req.email.clone();
    let name = req.name.clone();
    let ep = email_provider.clone();
    send_email_with_fallback(job_queue.as_ref(), &email_provider, &to,
        crate::jobs::job_queue::EmailTemplate::Welcome { name: name.clone() }, lang,
        move |ep, to, lang| {
            tokio::spawn(async move {
                if let Err(e) = ep.send_welcome_email(&to, name.as_deref(), lang).await {
                    tracing::warn!("Failed to send welcome email to {}: {:?}", to, e);
                }
            });
        },
    );

    send_verification_email_for_customer(&pool, &cfg, &email_provider, job_queue.as_ref(), customer.id, &req.email, lang).await;

    Ok((HeaderMap::new(), Json(serde_json::json!({
        "message": "If this email is available, a verification email has been sent.",
    }))))
}

// ── Login ───────────────────────────────────────────────────

async fn login(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = extract_client_ip(&headers);
    let user_agent = headers.get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let rl_key = format!("login:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, LOGIN_RATE_LIMIT).await;
    if !rl_result.allowed {
        tracing::warn!("⚠️ Login rate limit exceeded for IP: {}", client_ip);
        return Err(AppError::RateLimitExceeded);
    }

    // ── Security: Suspicious user agent detection ──
    if let Some(detected) = crate::security_monitor::detect_suspicious_user_agent(user_agent) {
        let _ = crate::security_monitor::log_security_event(
            &pool, &detected.event_type, detected.severity.as_str(),
            None, Some(&req.email), Some(&client_ip), Some(user_agent), detected.details,
        ).await;
        if detected.should_block {
            return Err(AppError::BadRequest("Request blocked".into()));
        }
    }

    // ── Security: Brute force detection ──
    if let Some(detected) = crate::security_monitor::detect_brute_force(&pool, &req.email, &client_ip).await.unwrap_or(None) {
        let _ = crate::security_monitor::log_security_event(
            &pool, &detected.event_type, detected.severity.as_str(),
            None, Some(&req.email), Some(&client_ip), Some(user_agent), detected.details.clone(),
        ).await;
        if detected.should_block {
            tracing::warn!("🔒 Login blocked — brute force detected: {} from {}", req.email, client_ip);
            return Err(AppError::BadRequest("Too many failed attempts. Please try again later.".into()));
        }
    }

    // HS-038f: Timing attack mitigation — always verify password
    let customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE email = $1", CUSTOMER_SELECT))
        .bind(&req.email).fetch_optional(&pool).await?;

    static DUMMY_HASH: once_cell::sync::Lazy<String> = once_cell::sync::Lazy::new(|| {
        jwt::hash_password("dummy_password_for_timing_mitigation_2026")
            .unwrap_or_else(|_| "$argon2id$v=19$m=19456,t=2,p=1$c2FsdHNhbHRzYWx0$8KnGm7PqjUWh8vK7XpZ3J9vQZJ6wR8dLf5bNcVxWmYo".to_string())
    });

    let password_ok = match &customer {
        None => { let _ = jwt::verify_password_async(req.password.clone(), DUMMY_HASH.clone()).await; false }
        Some(c) => match c.password_hash.as_ref() {
            Some(hash) => jwt::verify_password_async(req.password.clone(), hash.clone()).await.unwrap_or(false),
            None => { let _ = jwt::verify_password_async(req.password.clone(), DUMMY_HASH.clone()).await; false }
        },
    };

    let customer = customer.ok_or(AppError::BadRequest("Invalid email or password".into()))?;
    if !customer.is_active {
        // Record disabled account login attempt
        let _ = crate::security_monitor::record_login_attempt(
            &pool, &req.email, &client_ip, Some(user_agent), false, Some("account_disabled"),
        ).await;
        let _ = crate::security_monitor::log_security_event(
            &pool, crate::security_monitor::event_types::DISABLED_ACCOUNT_LOGIN,
            "medium", Some(customer.id), Some(&req.email), Some(&client_ip), Some(user_agent),
            serde_json::json!({"reason": "Disabled account login attempt"}),
        ).await;
        return Err(AppError::BadRequest("Account is disabled. Contact support.".into()));
    }
    if !password_ok {
        // Record failed login attempt
        let _ = crate::security_monitor::record_login_attempt(
            &pool, &req.email, &client_ip, Some(user_agent), false, Some("wrong_password"),
        ).await;
        return Err(AppError::BadRequest("Invalid email or password".into()));
    }

    // Record successful login attempt
    let _ = crate::security_monitor::record_login_attempt(
        &pool, &req.email, &client_ip, Some(user_agent), true, None,
    ).await;

    // Email verification check — block login if email is not verified
    if !customer.email_verified {
        return Err(AppError::BadRequest("Please verify your email address before logging in. Check your inbox for the verification link.".into()));
    }

    // SSO enforcement check — block password login if SSO is required
    // Check both customer-scoped (legacy) and team-scoped configs
    let sso_config = sqlx::query_as::<_, (bool, Option<bool>)>(
        "SELECT enabled, admin_bypass FROM sso_configs WHERE customer_id = $1 AND enabled = true LIMIT 1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    // If no customer-scoped config, check team-scoped
    let sso_config = if sso_config.is_none() {
        sqlx::query_as::<_, (bool, Option<bool>)>(
            "SELECT s.enabled, s.admin_bypass FROM sso_configs s
             INNER JOIN team_members tm ON tm.team_id = s.team_id
             WHERE tm.customer_id = $1 AND s.enabled = true AND s.team_id IS NOT NULL
             LIMIT 1"
        )
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
    } else {
        sso_config
    };

    if let Some((sso_enabled, admin_bypass)) = sso_config {
        if sso_enabled {
            let bypass = admin_bypass.unwrap_or(true);

            // Safety: if this is the ONLY admin in the system, always allow
            // to prevent total lockout
            let admin_count: (i64,) = sqlx::query_as(
                "SELECT COUNT(*) FROM customers WHERE is_admin = true AND is_active = true"
            )
            .fetch_one(&pool)
            .await
            .unwrap_or((1,));

            let is_last_admin = customer.is_admin && admin_count.0 <= 1;

            if is_last_admin {
                // Last admin can always log in (prevent lockout)
                tracing::info!("🔓 SSO bypass for last admin: {}", req.email);
            } else if bypass && customer.is_admin {
                // Admin bypass enabled → admin can log in
                tracing::info!("🔓 SSO admin bypass for: {}", req.email);
            } else {
                // Everyone else must use SSO
                tracing::warn!("🔒 SSO login blocked for {}: SSO enforced", req.email);
                return Err(AppError::BadRequest(
                    "SSO is required for this account. Please use Single Sign-On to log in.".into()
                ));
            }
        }
    }

    // 2FA check
    if customer.totp_enabled {
        let temp_token = jwt::generate_token_with_duration(
            customer.id, &customer.email, &customer.plan, &cfg.jwt_secret, Duration::minutes(5), customer.is_admin,
        )?;
        let mut headers = HeaderMap::new();
        headers.insert("set-cookie", HeaderValue::from_static("hooksniff_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"));
        return Ok((headers, Json(serde_json::json!(TwoFactorRequiredResponse {
            requires_2fa: true, temp_token,
            message: "Two-factor authentication required. Please provide your TOTP code.".into(),
        }))));
    }

    let token = jwt::generate_access_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret, customer.is_admin)?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ Customer logged in: {}", req.email);
    send_audit_log(&pool, customer.id, "LOGIN", &headers).await;

    Ok(auth_response_with_cookie(AuthResponse {
        token, customer: customer.to_response(None), refresh_token: Some(refresh_token_value),
    }))
}

// ── Password Reset ──────────────────────────────────────────

async fn forgot_password(
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
        );

        tracing::info!("📧 Password reset email sent to: {}", email);
    }

    Ok(Json(serde_json::json!({"message": "If the email exists, a reset link has been sent."})))
}

async fn reset_password(
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

    let (token_id, customer_id) = record.ok_or(AppError::BadRequest("Invalid or expired reset token".into()))?;

    sqlx::query("UPDATE password_reset_tokens SET used = true WHERE id = $1")
        .bind(token_id).execute(&pool).await?;

    let new_hash = jwt::hash_password_async(req.new_password.clone()).await?;
    sqlx::query("UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash).bind(customer_id).execute(&pool).await?;

    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer_id).execute(&pool).await?;

    tracing::info!("✅ Password reset completed for customer {}", customer_id);
    Ok(Json(serde_json::json!({"message": "Password has been reset successfully."})))
}

// ── Email Verification ──────────────────────────────────────

async fn verify_email(
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

    let (token_id, customer_id) = record.ok_or(AppError::BadRequest("Invalid or expired verification token".into()))?;

    sqlx::query("UPDATE email_verification_tokens SET used = true WHERE id = $1")
        .bind(token_id).execute(&pool).await?;
    sqlx::query("UPDATE customers SET email_verified = true, updated_at = NOW() WHERE id = $1")
        .bind(customer_id).execute(&pool).await?;

    tracing::info!("✅ Email verified for customer {}", customer_id);
    Ok(Json(serde_json::json!({"message": "Email verified successfully."})))
}

async fn resend_verification(
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

async fn refresh_token(
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
        .ok_or(AppError::BadRequest("Refresh token required".into()))?;

    let token_hash = jwt::hash_token(&refresh_token_value);
    let record: Option<(Uuid, Uuid, chrono::DateTime<Utc>)> = sqlx::query_as(
        "SELECT id, customer_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()",
    )
    .bind(&token_hash).fetch_optional(&pool).await?;

    let (token_id, customer_id, _) = record.ok_or(AppError::Unauthorized)?;

    let customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
        .bind(customer_id).fetch_optional(&pool).await?.ok_or(AppError::Unauthorized)?;

    if !customer.is_active { return Err(AppError::Unauthorized); }

    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE id = $1")
        .bind(token_id).execute(&pool).await?;

    let new_access = jwt::generate_access_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret, customer.is_admin)?;
    let new_refresh = create_refresh_token(&pool, customer.id).await?;

    Ok(auth_response_with_cookie(AuthResponse {
        token: new_access, customer: customer.to_response(None), refresh_token: Some(new_refresh),
    }))
}

// ── Logout ──────────────────────────────────────────────────

async fn logout(
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

async fn revoke_current_token(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let token = headers.get("authorization").and_then(|v| v.to_str().ok()).and_then(|v| v.strip_prefix("Bearer ")).unwrap_or("");
    let claims = jwt::verify_token(token, &cfg.jwt_secret)?;
    if let Some(ref jti) = claims.jti {
        jwt::revoke_token(&pool, jti, claims.exp as i64).await?;
        tracing::info!("🔑 Token revoked: jti={}", jti);
    }
    Ok(Json(serde_json::json!({"revoked": true, "message": "Token has been revoked."})))
}

async fn revoke_all_tokens(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    jwt::revoke_all_tokens_for_customer(&pool, customer.id).await?;
    tracing::info!("🔑 All tokens revoked for customer {}", customer.id);
    Ok(Json(serde_json::json!({"revoked": true, "message": "All access tokens have been revoked."})))
}

// ── Consent ─────────────────────────────────────────────────

async fn get_consent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let consents: Option<(serde_json::Value,)> = sqlx::query_as("SELECT consents FROM customer_consents WHERE customer_id = $1")
        .bind(customer.id).fetch_optional(&pool).await?;
    Ok(Json(serde_json::json!({ "consents": consents.map(|v| v.0).unwrap_or_else(|| serde_json::json!({})) })))
}

async fn update_consent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let key = req.get("key").and_then(|v| v.as_str()).ok_or(AppError::BadRequest("Missing 'key' field".into()))?;
    let value = req.get("value").and_then(|v| v.as_bool()).ok_or(AppError::BadRequest("Missing 'value' field".into()))?;

    sqlx::query(
        r#"INSERT INTO customer_consents (id, customer_id, consents, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (customer_id) DO UPDATE SET consents = customer_consents.consents || $3, updated_at = NOW()"#,
    )
    .bind(Uuid::new_v4()).bind(customer.id).bind(serde_json::json!({ key: value }))
    .execute(&pool).await?;

    Ok(Json(serde_json::json!({ "success": true })))
}

// ── Profile ─────────────────────────────────────────────────

async fn get_me(Extension(customer): Extension<Customer>) -> Result<Json<CustomerResponse>, AppError> {
    Ok(Json(customer.to_response(None)))
}

async fn update_profile(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<CustomerResponse>, AppError> {
    if req.name.trim().is_empty() { return Err(AppError::BadRequest("Name cannot be empty".into())); }

    let updated = sqlx::query_as::<_, Customer>("UPDATE customers SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *")
        .bind(&req.name).bind(customer.id).fetch_one(&pool).await?;

    tracing::info!("✅ Profile updated for customer {}", customer.id);
    Ok(Json(updated.to_response(None)))
}

async fn change_password(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    validate_password_strength(&req.new_password)?;
    let hash = customer.password_hash.as_ref().ok_or(AppError::BadRequest("Password login not set up".into()))?;
    if !jwt::verify_password_async(req.current_password.clone(), hash.clone()).await? {
        return Err(AppError::BadRequest("Current password is incorrect".into()));
    }

    let new_hash = jwt::hash_password_async(req.new_password.clone()).await?;
    sqlx::query("UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash).bind(customer.id).execute(&pool).await?;

    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer.id).execute(&pool).await?;
    let _ = jwt::revoke_all_tokens_for_customer(&pool, customer.id).await;

    tracing::info!("✅ Password changed for customer {}", customer.id);
    send_audit_log(&pool, customer.id, "PASSWORD_CHANGE", &headers).await;

    Ok(Json(serde_json::json!({"message": "Password updated successfully"})))
}

// ── GDPR ────────────────────────────────────────────────────

async fn export_data(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let endpoints: Vec<serde_json::Value> = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at",
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

async fn delete_account(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let password = req.get("password").and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("Password is required for account deletion".into()))?;
    let hash = customer.password_hash.as_ref().ok_or(AppError::BadRequest("Password not set".into()))?;
    if !jwt::verify_password_async(password.to_string(), hash.clone()).await? {
        return Err(AppError::BadRequest("Invalid password".into()));
    }

    let mut tx = pool.begin().await?;

    // delivery_attempts has delivery_id, not customer_id
    sqlx::query("DELETE FROM delivery_attempts WHERE delivery_id IN (SELECT id FROM deliveries WHERE customer_id = $1)")
        .bind(customer.id).execute(&mut *tx).await?;

    let tables = [
        // Core
        "deliveries", "endpoints", "api_keys", "refresh_tokens",
        "password_reset_tokens", "email_verification_tokens", "notifications",
        "installed_agents", "payment_transactions", "invoices", "audit_log",
        "sso_configs", "custom_domains", "portal_configs", "device_tokens",
        // User data
        "applications", "environments", "environment_variables",
        "notification_preferences", "customer_consents", "tfa_backup_codes",
        "background_tasks", "idempotency_keys", "dead_letters",
        "delivery_events", "daily_event_usage",
        // Organization
        "team_members", "sso_login_attempts", "domain_verifications",
        // Connectors & integrations
        "connector_configs", "integrations", "inbound_configs",
        "event_schemas", "fanout_rules",
        // Operational
        "operational_webhook_deliveries", "operational_webhook_endpoints",
        "alert_rules", "stream_channels", "stream_subscriptions",
        "message_cursors", "ws_subscriptions",
        // Agents
        "agents", "agent_routes", "agent_events", "agent_audit_log",
        "ai_agent_configs", "ai_agent_executions",
        // Token management
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

// ── Internal Helpers ────────────────────────────────────────

pub(crate) async fn create_refresh_token(pool: &PgPool, customer_id: Uuid) -> Result<String, AppError> {
    let token = jwt::generate_random_token();
    let token_hash = jwt::hash_token(&token);
    let expires_at = Utc::now() + Duration::days(30);
    sqlx::query("INSERT INTO refresh_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)")
        .bind(customer_id).bind(&token_hash).bind(expires_at).execute(pool).await?;
    Ok(token)
}

async fn send_verification_email_for_customer(
    pool: &PgPool, cfg: &Config, email_provider: &crate::email::EmailProvider,
    job_queue: Option<&crate::jobs::job_queue::JobQueue>, customer_id: Uuid, email: &str, lang: crate::email::Language,
) {
    let token = jwt::generate_random_token();
    let token_hash = jwt::hash_token(&token);
    let expires_at = Utc::now() + Duration::hours(24);

    if let Err(e) = sqlx::query("INSERT INTO email_verification_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)")
        .bind(customer_id).bind(&token_hash).bind(expires_at).execute(pool).await {
        tracing::warn!("Failed to store verification token for {}: {:?}", email, e);
        return;
    }

    let verify_url = format!("{}/verify-email?token={}", cfg.email_base_url, token);
    let verify_url_clone = verify_url.clone();
    send_email_with_fallback(job_queue, email_provider, email,
        crate::jobs::job_queue::EmailTemplate::Verification { verify_url }, lang,
        move |ep, to, lang| {
            tokio::spawn(async move {
                if let Err(e) = ep.send_verification_email(&to, &verify_url_clone, lang).await {
                    tracing::warn!("Failed to send verification email to {}: {:?}", to, e);
                }
            });
        },
    );
}

// ════════════════════════════════════════════════════════
// Tests
// ── Email Change ────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct RequestEmailChangeRequest {
    new_email: String,
}

#[derive(Debug, Deserialize)]
struct ConfirmEmailChangeRequest {
    code: String,
}

async fn request_email_change(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Extension(email_provider): Extension<crate::email::EmailProvider>,
    Extension(job_queue): Extension<Option<crate::jobs::job_queue::JobQueue>>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<RequestEmailChangeRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Rate limit: 3 requests per 15 minutes per user
    let rl_key = format!("email_change:{}", customer.id);
    let rl_result = rate_limiter.check_with_window(&rl_key, 3, 900).await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    if let Err(e) = crate::validation::validate_email(&req.new_email) {
        return Err(AppError::BadRequest(e));
    }

    let new_email = req.new_email.to_lowercase();

    // Can't change to same email
    if new_email == customer.email.to_lowercase() {
        return Err(AppError::BadRequest("This is already your current email".into()));
    }

    // Check if email is in use
    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM customers WHERE LOWER(email) = LOWER($1) AND id != $2"
    )
    .bind(&new_email).bind(customer.id).fetch_optional(&pool).await?;
    if existing.is_some() {
        return Err(AppError::BadRequest("This email is already in use".into()));
    }

    // Delete old codes for this user
    sqlx::query("DELETE FROM email_change_codes WHERE customer_id = $1")
        .bind(customer.id).execute(&pool).await?;

    // Generate 6-digit code
    let code = generate_email_change_code();
    let code_hash = jwt::hash_token(&code);
    let expires_at = Utc::now() + chrono::Duration::minutes(15);

    sqlx::query(
        "INSERT INTO email_change_codes (customer_id, new_email, code_hash, expires_at) VALUES ($1, $2, $3, $4)"
    )
    .bind(customer.id).bind(&new_email).bind(&code_hash).bind(expires_at)
    .execute(&pool).await?;

    // Send code to new email
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
                // Use a simple text email for the code
                if let Err(e) = ep.send_verification_email(&to, &format!("Your verification code is: {}", code_clone), lang).await {
                    tracing::warn!("Failed to send email change code to {}: {:?}", to, e);
                }
            });
        },
    );

    tracing::info!("📧 Email change code sent for customer {} to {}", customer.id, &email_clone);
    Ok(Json(serde_json::json!({
        "message": "A verification code has been sent to your new email address.",
        "expires_in_minutes": 15
    })))
}

async fn confirm_email_change(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Json(req): Json<ConfirmEmailChangeRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Rate limit: 5 attempts per 5 minutes
    let rl_key = format!("email_change_confirm:{}", customer.id);
    let rl_result = rate_limiter.check_with_window(&rl_key, 5, 300).await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    if req.code.len() != 6 || !req.code.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::BadRequest("Invalid code format".into()));
    }

    // Get the latest code for this user
    let row: Option<(Uuid, String, String, chrono::DateTime<chrono::Utc>, i32)> = sqlx::query_as(
        "SELECT id, new_email, code_hash, expires_at, attempts FROM email_change_codes WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1"
    )
    .bind(customer.id).fetch_optional(&pool).await?;

    let (code_id, new_email, code_hash, expires_at, attempts) = match row {
        Some(r) => r,
        None => return Err(AppError::BadRequest("No pending email change. Please request a new code.".into())),
    };

    // Check attempts (max 5)
    if attempts >= 5 {
        sqlx::query("DELETE FROM email_change_codes WHERE id = $1").bind(code_id).execute(&pool).await?;
        return Err(AppError::BadRequest("Too many attempts. Please request a new code.".into()));
    }

    // Check expiry
    if Utc::now() > expires_at {
        sqlx::query("DELETE FROM email_change_codes WHERE id = $1").bind(code_id).execute(&pool).await?;
        return Err(AppError::BadRequest("Code has expired. Please request a new one.".into()));
    }

    // Increment attempts
    sqlx::query("UPDATE email_change_codes SET attempts = attempts + 1 WHERE id = $1")
        .bind(code_id).execute(&pool).await?;

    // Verify code (constant-time comparison via hash)
    let input_hash = jwt::hash_token(&req.code);
    if input_hash != code_hash {
        return Err(AppError::BadRequest("Invalid code. Try again.".into()));
    }

    // Check email still available
    let existing: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM customers WHERE LOWER(email) = LOWER($1) AND id != $2"
    )
    .bind(&new_email).bind(customer.id).fetch_optional(&pool).await?;
    if existing.is_some() {
        sqlx::query("DELETE FROM email_change_codes WHERE id = $1").bind(code_id).execute(&pool).await?;
        return Err(AppError::BadRequest("This email is no longer available.".into()));
    }

    // Update email
    sqlx::query("UPDATE customers SET email = $1, email_verified = true, updated_at = NOW() WHERE id = $2")
        .bind(&new_email).bind(customer.id).execute(&pool).await?;

    // Delete the code
    sqlx::query("DELETE FROM email_change_codes WHERE id = $1")
        .bind(code_id).execute(&pool).await?;

    tracing::info!("✅ Email changed for customer {} to {}", customer.id, &new_email);
    Ok(Json(serde_json::json!({
        "message": "Email address has been changed successfully.",
        "new_email": new_email
    })))
}

fn generate_email_change_code() -> String {
    use rand::RngExt;
    let mut rng = rand::rng();
    let code: u32 = rng.random_range(100_000u32..999_999u32);
    code.to_string()
}

// ════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    #[test]
    fn test_constants_values() {
        assert_eq!(LOGIN_RATE_LIMIT, 10);
        assert_eq!(REGISTER_RATE_LIMIT, 5);
        assert_eq!(TOKEN_MAX_AGE, 86400);
        assert_eq!(REFRESH_TOKEN_MAX_AGE, 2592000);
        assert_eq!(RESET_RATE_LIMIT, 5);
        assert_eq!(VERIFY_EMAIL_RATE_LIMIT, 10);
        assert_eq!(REFRESH_RATE_LIMIT, 30);
    }

    #[test]
    fn test_extract_client_ip_from_x_forwarded_for() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("1.2.3.4, 5.6.7.8"));
        assert_eq!(extract_client_ip(&headers), "5.6.7.8");
    }

    #[test]
    fn test_extract_client_ip_from_x_real_ip() {
        let mut headers = HeaderMap::new();
        headers.insert("x-real-ip", HeaderValue::from_static("10.0.0.1"));
        assert_eq!(extract_client_ip(&headers), "10.0.0.1");
    }

    #[test]
    fn test_extract_client_ip_unknown_when_empty() {
        let headers = HeaderMap::new();
        assert_eq!(extract_client_ip(&headers), "unknown");
    }

    #[test]
    fn test_extract_client_ip_prefers_real_ip() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("1.1.1.1"));
        headers.insert("x-real-ip", HeaderValue::from_static("2.2.2.2"));
        assert_eq!(extract_client_ip(&headers), "2.2.2.2");
    }

    #[test]
    fn test_auth_response_with_cookie_sets_access_token() {
        let body = AuthResponse {
            token: "test_jwt".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(), email: "a@b.com".to_string(), name: None, api_key: None,
                plan: "developer".to_string(), webhook_limit: 10, webhook_count: 0,
                is_admin: false, created_at: chrono::Utc::now(),
            },
            refresh_token: None,
        };
        let (headers, json) = auth_response_with_cookie(body);
        assert!(headers.contains_key("set-cookie"));
        let cookie = headers.get("set-cookie").unwrap().to_str().unwrap();
        assert!(cookie.contains("hooksniff_token=test_jwt"));
        assert!(cookie.contains("Max-Age=86400"));
        assert_eq!(json["token"], "test_jwt");
    }

    #[test]
    fn test_auth_response_body_excludes_refresh_token() {
        let body = AuthResponse {
            token: "jwt".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(), email: "a@b.com".to_string(), name: None, api_key: None,
                plan: "developer".to_string(), webhook_limit: 10, webhook_count: 0,
                is_admin: false, created_at: chrono::Utc::now(),
            },
            refresh_token: Some("secret_refresh".to_string()),
        };
        let (_, json) = auth_response_with_cookie(body);
        assert!(json.get("refresh_token").is_none(), "refresh_token should not be in response body");
    }

    #[test]
    fn test_auth_router_construction() {
        let _router = router();
    }
}
