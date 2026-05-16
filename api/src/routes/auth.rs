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
    AuthResponse, ChangePasswordRequest, Confirm2faRequest, CreateCustomerRequest, Customer,
    CustomerResponse, Disable2faRequest, Enable2faRequest, ForgotPasswordRequest, LoginRequest,
    RefreshTokenRequest, ResendVerificationRequest, ResetPasswordRequest,
    TwoFactorRequiredResponse, UpdateProfileRequest, Verify2faRequest, VerifyEmailRequest,
};

/// Maximum login attempts per IP per 15-minute window.
const LOGIN_RATE_LIMIT: u32 = 10;

/// Validate password strength:
/// - Minimum 8 characters
/// - At least 1 uppercase letter
/// - At least 1 lowercase letter
/// - At least 1 digit
fn validate_password_strength(password: &str) -> Result<(), AppError> {
    if password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }
    if !password.chars().any(|c| c.is_ascii_uppercase()) {
        return Err(AppError::BadRequest(
            "Password must contain at least one uppercase letter".into(),
        ));
    }
    if !password.chars().any(|c| c.is_ascii_lowercase()) {
        return Err(AppError::BadRequest(
            "Password must contain at least one lowercase letter".into(),
        ));
    }
    if !password.chars().any(|c| c.is_ascii_digit()) {
        return Err(AppError::BadRequest(
            "Password must contain at least one digit".into(),
        ));
    }
    Ok(())
}

/// Maximum registration attempts per IP per hour.
const REGISTER_RATE_LIMIT: u32 = 5;

/// JWT token max age in seconds (24 hours).
const TOKEN_MAX_AGE: i64 = 86400;

/// Refresh token max age in seconds (30 days).
const REFRESH_TOKEN_MAX_AGE: i64 = 2592000;

/// Create an auth response with HttpOnly cookies set for both access and refresh tokens.
/// Refresh token is also set as HttpOnly cookie (not exposed in response body).
fn auth_response_with_cookie(body: AuthResponse) -> (HeaderMap, Json<serde_json::Value>) {
    let mut headers = HeaderMap::new();

    // Set access token cookie
    let access_cookie = create_auth_cookie(&body.token, TOKEN_MAX_AGE);
    headers.insert(
        "set-cookie",
        HeaderValue::from_str(&access_cookie).unwrap_or_else(|_| HeaderValue::from_static("")),
    );

    // Set refresh token cookie (if present)
    if let Some(ref refresh) = body.refresh_token {
        let refresh_cookie = create_refresh_token_cookie(refresh, REFRESH_TOKEN_MAX_AGE);
        headers.append(
            "set-cookie",
            HeaderValue::from_str(&refresh_cookie).unwrap_or_else(|_| HeaderValue::from_static("")),
        );
    }

    // Return response without refresh_token in body (it's in HttpOnly cookie now)
    let response_body = serde_json::json!({
        "token": body.token,
        "customer": body.customer,
    });

    (headers, Json(response_body))
}

/// Maximum password reset attempts per IP per hour.
const RESET_RATE_LIMIT: u32 = 5;

/// Extract client IP from request headers (handles reverse proxies).
fn extract_client_ip(headers: &HeaderMap) -> String {
    // Prefer X-Real-IP (set by trusted reverse proxy like Cloudflare/Nginx)
    if let Some(real_ip) = headers.get("x-real-ip").and_then(|v| v.to_str().ok()) {
        let ip = real_ip.trim();
        if !ip.is_empty() && ip != "unknown" {
            return ip.to_string();
        }
    }
    // Fallback: take LAST entry from X-Forwarded-For (first is client, rest are proxies)
    // In production behind Cloudflare/GCP LB, the last trusted entry is most reliable
    headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next_back())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty() && s != "unknown")
        .unwrap_or_else(|| "unknown".to_string())
}

pub fn router() -> Router {
    let public = Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
        .route("/verify-email", post(verify_email))
        .route("/resend-verification", post(resend_verification))
        .route("/refresh", post(refresh_token))
        .route("/2fa/verify", post(verify_2fa_login));

    let protected = Router::new()
        .route("/me", get(get_me))
        .route("/profile", put(update_profile))
        .route("/password", put(change_password))
        .route("/logout", post(logout))
        .route("/2fa/enable", post(enable_2fa))
        .route("/2fa/confirm", post(confirm_2fa))
        .route("/2fa/disable", post(disable_2fa))
        .route("/2fa/status", get(two_factor_status))
        // HS-261: Token revocation endpoints
        .route("/revoke-token", post(revoke_current_token))
        .route("/revoke-all-tokens", post(revoke_all_tokens))
        .route("/consent", get(get_consent).post(update_consent))
        // GDPR endpoints
        .route("/export", get(export_data))
        .route("/account", axum::routing::delete(delete_account))
        .layer(axum::middleware::from_fn(
            crate::middleware::auth_middleware,
        ));

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
    // Rate limit: 5 registrations per IP per hour
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("register:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, REGISTER_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // Validate email
    if let Err(e) = crate::validation::validate_email(&req.email) {
        return Err(AppError::BadRequest(e));
    }

    // Password is required
    let password = req
        .password
        .ok_or_else(|| AppError::BadRequest("Password is required".into()))?;

    validate_password_strength(&password)?;

    // Generate API key
    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..24].to_string();

    // Hash password (CPU-intensive, offloaded to thread pool)
    let password_hash = jwt::hash_password_async(password.clone()).await?;

    // Check if email already exists (after hashing to normalize timing)
    let existing: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM customers WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&pool)
        .await?;

    if existing.is_some() {
        // HS-038h: Prevent email enumeration.
        // Password already hashed above → timing normalized.
        // Return same response as success to prevent body-based enumeration.
        tracing::info!("Registration attempt for existing email: {}", req.email);
        return Ok((
            HeaderMap::new(),
            Json(serde_json::json!({
                "message": "If this email is available, a verification email has been sent.",
            })),
        ));
    }

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash, name, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *",
    )
    .bind(&req.email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(&password_hash)
    .bind(&req.name)
    .fetch_one(&pool)
    .await?;

    tracing::info!("✅ New customer registered: {}", req.email);

    // Audit log — REGISTER
    {
        let rid = customer.id.to_string();
        let ip = extract_client_ip(&headers);
        let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "REGISTER", "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
    }

    // Publish UserCreated event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::UserCreated {
            user_id: customer.id,
            email: customer.email.clone(),
            plan: customer.plan.clone(),
        }).await {
            tracing::warn!("Failed to publish UserCreated event: {:?}", e);
        }
    }

    // Send welcome email + verification email via job queue (survives restarts)
    {
        let lang = crate::email::Language::from_accept_language(
            headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
        );
        let lang_str = if lang == crate::email::Language::Tr { "tr" } else { "en" };
        let to = req.email.clone();
        let name = req.name.clone();
        if let Some(ref queue) = job_queue {
            let job = crate::jobs::job_queue::Job::Email {
                to: to.clone(),
                template: crate::jobs::job_queue::EmailTemplate::Welcome { name: name.clone() },
                language: lang_str.to_string(),
            };
            if let Err(e) = queue.enqueue(&job).await {
                tracing::warn!("Failed to enqueue welcome email for {}: {:?}", to, e);
                // Fallback to direct send
                let ep = email_provider.clone();
                tokio::spawn(async move {
                    if let Err(e) = ep.send_welcome_email(&to, name.as_deref(), lang).await {
                        tracing::warn!("Failed to send welcome email to {}: {:?}", to, e);
                    }
                });
            }
        } else {
            let ep = email_provider.clone();
            tokio::spawn(async move {
                if let Err(e) = ep.send_welcome_email(&to, name.as_deref(), lang).await {
                    tracing::warn!("Failed to send welcome email to {}: {:?}", to, e);
                }
            });
        }
    }

    // Auto-send verification email
    let lang = crate::email::Language::from_accept_language(
        headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
    );
    send_verification_email_for_customer(&pool, &cfg, &email_provider, job_queue.as_ref(), customer.id, &req.email, lang)
        .await;

    // HS-038h: Return same generic message for all registrations.
    // User must log in after verifying email to get tokens.
    // This prevents email enumeration via response body.
    Ok((
        HeaderMap::new(),
        Json(serde_json::json!({
            "message": "If this email is available, a verification email has been sent.",
        })),
    ))
}

// ── Login ───────────────────────────────────────────────────

async fn login(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Rate limit: 10 login attempts per IP per 15 minutes
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("login:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, LOGIN_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        tracing::warn!("⚠️ Login rate limit exceeded for IP: {}", client_ip);
        return Err(AppError::RateLimitExceeded);
    }

    // ── HS-038f: Timing attack mitigation ──
    // Always perform password hash verification to prevent timing-based user enumeration.
    // If user not found or inactive, hash against a dummy Argon2 hash (constant-time compare).
    let customer = sqlx::query_as::<_, Customer>("SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification FROM customers WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&pool)
        .await?;

    // HS-038f: Lazy-initialized valid Argon2id hash for timing attack mitigation.
    // Must be a real hash so `verify_password` performs actual Argon2 computation
    // (not a fast reject from invalid PHC format).
    static DUMMY_HASH: once_cell::sync::Lazy<String> = once_cell::sync::Lazy::new(|| {
        jwt::hash_password("dummy_password_for_timing_mitigation_2026")
            .unwrap_or_else(|_| "$argon2id$v=19$m=19456,t=2,p=1$c2FsdHNhbHRzYWx0$8KnGm7PqjUWh8vK7XpZ3J9vQZJ6wR8dLf5bNcVxWmYo".to_string())
    });

    // Always verify password (against real hash or dummy) to normalize timing.
    // Use async wrapper to avoid blocking the tokio runtime with CPU-intensive Argon2.
    let password_ok = match &customer {
        None => {
            let _ = jwt::verify_password_async(req.password.clone(), DUMMY_HASH.clone()).await;
            false
        }
        Some(c) => match c.password_hash.as_ref() {
            Some(hash) => jwt::verify_password_async(req.password.clone(), hash.clone()).await.unwrap_or(false),
            None => {
                let _ = jwt::verify_password_async(req.password.clone(), DUMMY_HASH.clone()).await;
                false
            }
        },
    };

    // Now check existence and status — timing is already normalized.
    let customer = customer.ok_or(AppError::Unauthorized)?;

    if !customer.is_active {
        return Err(AppError::Unauthorized);
    }

    if !password_ok {
        return Err(AppError::Unauthorized);
    }

    // If 2FA is enabled, return partial response requiring TOTP code
    if customer.totp_enabled {
        let temp_token = jwt::generate_token_with_duration(
            customer.id,
            &customer.email,
            &customer.plan,
            &cfg.jwt_secret,
            Duration::minutes(5),
            customer.is_admin,
        )?;
        let mut headers = HeaderMap::new();
        // Clear any existing auth cookies for partial 2FA response
        headers.insert(
            "set-cookie",
            HeaderValue::from_static(
                "hooksniff_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
            ),
        );
        return Ok((
            headers,
            Json(serde_json::json!(TwoFactorRequiredResponse {
                requires_2fa: true,
                temp_token,
                message: "Two-factor authentication required. Please provide your TOTP code."
                    .into(),
            })),
        ));
    }

    // Generate short-lived access token + refresh token
    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ Customer logged in: {}", req.email);

    // Audit log — LOGIN
    {
        let rid = customer.id.to_string();
        let ip = extract_client_ip(&headers);
        let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "LOGIN", "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
    }

    Ok(auth_response_with_cookie(AuthResponse {
        token,
        customer: customer.to_response(None),
        refresh_token: Some(refresh_token_value),
    }))
}

// ── 2FA Verify During Login ─────────────────────────────────

async fn verify_2fa_login(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<Verify2faRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Rate limit: 5 TOTP attempts per IP per 5 minutes
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("verify_2fa:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_window(&rl_key, VERIFY_2FA_RATE_LIMIT, 300)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // Verify the temp token
    let claims = jwt::verify_token(&req.temp_token, &cfg.jwt_secret)?;

    let customer = sqlx::query_as::<_, Customer>("SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification FROM customers WHERE id = $1")
        .bind(claims.sub)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if !customer.totp_enabled {
        // HS-038f: Don't reveal 2FA status — treat as auth failure
        return Err(AppError::Unauthorized);
    }

    // Determine authentication method: backup code or TOTP
    let auth_ok = if let Some(ref backup_code) = req.backup_code {
        // Try backup code authentication
        verify_backup_code(&pool, customer.id, backup_code).await?
    } else {
        // TOTP authentication
        let secret = customer
            .totp_secret
            .as_ref()
            .ok_or(AppError::Internal(anyhow::anyhow!("TOTP secret missing")))?;
        verify_totp_code(secret, &req.code)
    };

    if !auth_ok {
        // HS-038f: Don't reveal TOTP/backup validation failure — same as other auth failures
        return Err(AppError::Unauthorized);
    }

    // Generate short-lived access token + refresh token
    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ 2FA verified for customer: {}", customer.email);

    // Audit log — LOGIN (2FA path)
    {
        let rid = customer.id.to_string();
        let ip = extract_client_ip(&headers);
        let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "LOGIN", "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
    }

    Ok(auth_response_with_cookie(AuthResponse {
        token,
        customer: customer.to_response(None),
        refresh_token: Some(refresh_token_value),
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
    // Rate limit
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("forgot_pwd:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, RESET_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // Always return success to prevent email enumeration
    let customer: Option<(Uuid, String)> =
        sqlx::query_as("SELECT id, email FROM customers WHERE email = $1")
            .bind(&req.email)
            .fetch_optional(&pool)
            .await?;

    if let Some((customer_id, email)) = customer {
        let token = jwt::generate_random_token();
        let token_hash = jwt::hash_token(&token);
        let expires_at = Utc::now() + Duration::hours(1);

        sqlx::query(
            "INSERT INTO password_reset_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        )
        .bind(customer_id)
        .bind(&token_hash)
        .bind(expires_at)
        .execute(&pool)
        .await?;

        let reset_url = format!("{}/reset-password?token={}", cfg.email_base_url, token);
        let lang = crate::email::Language::from_accept_language(
            headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
        );
        let lang_str = if lang == crate::email::Language::Tr { "tr" } else { "en" };

        {
            let to = email.clone();
            if let Some(ref queue) = job_queue {
                let job = crate::jobs::job_queue::Job::Email {
                    to: to.clone(),
                    template: crate::jobs::job_queue::EmailTemplate::PasswordReset {
                        reset_url: reset_url.clone(),
                    },
                    language: lang_str.to_string(),
                };
                if let Err(e) = queue.enqueue(&job).await {
                    tracing::warn!("Failed to enqueue password reset email for {}: {:?}", to, e);
                    // Fallback
                    let ep = email_provider.clone();
                    tokio::spawn(async move {
                        if let Err(e) = ep.send_password_reset_email(&to, &reset_url, lang).await {
                            tracing::warn!("Failed to send password reset email to {}: {:?}", to, e);
                        }
                    });
                }
            } else {
                let ep = email_provider.clone();
                tokio::spawn(async move {
                    if let Err(e) = ep.send_password_reset_email(&to, &reset_url, lang).await {
                        tracing::warn!("Failed to send password reset email to {}: {:?}", to, e);
                    }
                });
            }
        }

        tracing::info!("📧 Password reset email sent to: {}", email);
    }

    Ok(Json(
        serde_json::json!({"message": "If the email exists, a reset link has been sent."}),
    ))
}

async fn reset_password(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<ResetPasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Rate limit
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("reset_pwd:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, RESET_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    validate_password_strength(&req.new_password)?;

    let token_hash = jwt::hash_token(&req.token);

    // Find valid, unused, non-expired token
    let record: Option<(Uuid, Uuid,)> = sqlx::query_as(
        "SELECT id, customer_id FROM password_reset_tokens WHERE token_hash = $1 AND used = false AND expires_at > NOW()",
    )
    .bind(&token_hash)
    .fetch_optional(&pool)
    .await?;

    let (token_id, customer_id) = record.ok_or(AppError::BadRequest(
        "Invalid or expired reset token".into(),
    ))?;

    // Mark token as used
    sqlx::query("UPDATE password_reset_tokens SET used = true WHERE id = $1")
        .bind(token_id)
        .execute(&pool)
        .await?;

    // Update password (CPU-intensive, offloaded to thread pool)
    let new_hash = jwt::hash_password_async(req.new_password.clone()).await?;
    sqlx::query("UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(customer_id)
        .execute(&pool)
        .await?;

    // Revoke all refresh tokens for this customer
    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer_id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ Password reset completed for customer {}", customer_id);

    Ok(Json(
        serde_json::json!({"message": "Password has been reset successfully."}),
    ))
}

// ── Email Verification ──────────────────────────────────────

/// Maximum email verification attempts per IP per 15 minutes.
const VERIFY_EMAIL_RATE_LIMIT: u32 = 10;

/// Maximum 2FA verification attempts per IP per 5 minutes.
const VERIFY_2FA_RATE_LIMIT: u32 = 5;

/// Maximum refresh token attempts per IP per 15 minutes.
const REFRESH_RATE_LIMIT: u32 = 30;

async fn verify_email(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<VerifyEmailRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Rate limit: 10 verification attempts per IP per 15 minutes
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("verify_email:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_window(&rl_key, VERIFY_EMAIL_RATE_LIMIT, 900)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    let token_hash = jwt::hash_token(&req.token);

    let record: Option<(Uuid, Uuid,)> = sqlx::query_as(
        "SELECT id, customer_id FROM email_verification_tokens WHERE token_hash = $1 AND used = false AND expires_at > NOW()",
    )
    .bind(&token_hash)
    .fetch_optional(&pool)
    .await?;

    let (token_id, customer_id) = record.ok_or(AppError::BadRequest(
        "Invalid or expired verification token".into(),
    ))?;

    // Mark token as used
    sqlx::query("UPDATE email_verification_tokens SET used = true WHERE id = $1")
        .bind(token_id)
        .execute(&pool)
        .await?;

    // Set email verified
    sqlx::query("UPDATE customers SET email_verified = true, updated_at = NOW() WHERE id = $1")
        .bind(customer_id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ Email verified for customer {}", customer_id);

    Ok(Json(
        serde_json::json!({"message": "Email verified successfully."}),
    ))
}

async fn resend_verification(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Extension(email_provider): Extension<crate::email::EmailProvider>,
    Extension(job_queue): Extension<Option<crate::jobs::job_queue::JobQueue>>,
    headers: HeaderMap,
    // Body is optional — if not provided, email is extracted from auth cookie
    body: Option<Json<ResendVerificationRequest>>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Rate limit
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("resend_verify:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, RESET_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // Get email from body or from auth cookie (JWT token)
    let email = if let Some(Json(req)) = body {
        req.email
    } else {
        // Extract email from auth cookie
        let token = headers
            .get("cookie")
            .and_then(|v| v.to_str().ok())
            .and_then(|c| {
                c.split(';')
                    .find(|s| s.trim().starts_with("hooksniff_token="))
                    .map(|s| s.trim().strip_prefix("hooksniff_token=").unwrap_or("").to_string())
            })
            .ok_or(AppError::Unauthorized)?;
        let claims = crate::auth::jwt::verify_token(&token, &cfg.jwt_secret)?;
        claims.email
    };

    // Always return success to prevent enumeration
    let customer: Option<(Uuid, String, bool)> =
        sqlx::query_as("SELECT id, email, email_verified FROM customers WHERE email = $1")
            .bind(&email)
            .fetch_optional(&pool)
            .await?;

    if let Some((customer_id, email, verified)) = customer {
        if !verified {
            let lang = crate::email::Language::from_accept_language(
                headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
            );
            send_verification_email_for_customer(&pool, &cfg, &email_provider, job_queue.as_ref(), customer_id, &email, lang)
                .await;
        }
    }

    Ok(Json(
        serde_json::json!({"message": "If the account exists and is unverified, a new verification email has been sent."}),
    ))
}

// ── Refresh Token ───────────────────────────────────────────

async fn refresh_token(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    // Accept refresh token from either cookie or JSON body (cookie takes priority)
    body: Option<Json<RefreshTokenRequest>>,
) -> Result<impl IntoResponse, AppError> {
    // Rate limit: 30 refresh attempts per IP per 15 minutes
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("refresh:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_window(&rl_key, REFRESH_RATE_LIMIT, 900)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // Try cookie first, then fall back to body
    let refresh_token_value = headers
        .get("cookie")
        .and_then(|v| v.to_str().ok())
        .and_then(|cookies| {
            cookies.split(';').find_map(|c| {
                let c = c.trim();
                c.strip_prefix("hooksniff_refresh=").map(|s| s.to_string())
            })
        })
        .or_else(|| body.map(|b| b.refresh_token.clone()))
        .ok_or(AppError::BadRequest("Refresh token required".into()))?;

    let token_hash = jwt::hash_token(&refresh_token_value);

    // Find valid, non-revoked refresh token
    let record: Option<(Uuid, Uuid, chrono::DateTime<Utc>,)> = sqlx::query_as(
        "SELECT id, customer_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()",
    )
    .bind(&token_hash)
    .fetch_optional(&pool)
    .await?;

    let (token_id, customer_id, _expires_at) = record.ok_or(AppError::Unauthorized)?;

    let customer = sqlx::query_as::<_, Customer>("SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification FROM customers WHERE id = $1")
        .bind(customer_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if !customer.is_active {
        return Err(AppError::Unauthorized);
    }

    // Revoke the old refresh token
    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE id = $1")
        .bind(token_id)
        .execute(&pool)
        .await?;

    // Generate new access token + refresh token
    let new_access = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let new_refresh = create_refresh_token(&pool, customer.id).await?;

    Ok(auth_response_with_cookie(AuthResponse {
        token: new_access,
        customer: customer.to_response(None),
        refresh_token: Some(new_refresh),
    }))
}

// ── Logout ──────────────────────────────────────────────────

async fn logout(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
) -> impl IntoResponse {
    // HS-261: Revoke the current access token
    let token = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .unwrap_or("");

    if let Ok(claims) = jwt::verify_token(token, &cfg.jwt_secret) {
        if let Some(ref jti) = claims.jti {
            let _ = jwt::revoke_token(&pool, jti, claims.exp as i64).await;
        }
    }

    // Revoke refresh tokens for this customer
    let _ = sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await;

    let mut headers = HeaderMap::new();
    headers.insert(
        "set-cookie",
        HeaderValue::from_str(&clear_auth_cookie())
            .unwrap_or_else(|_| HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        HeaderValue::from_str(&clear_refresh_token_cookie())
            .unwrap_or_else(|_| HeaderValue::from_static("")),
    );
    (headers, Json(serde_json::json!({ "ok": true })))
}

// ── Token Revocation (HS-261) ────────────────────────────────

/// Revoke the current access token (by JTI).
/// The token will be rejected on subsequent requests.
async fn revoke_current_token(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    // Extract the token to get its JTI
    let token = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .unwrap_or("");

    let claims = jwt::verify_token(token, &cfg.jwt_secret)?;

    if let Some(ref jti) = claims.jti {
        jwt::revoke_token(&pool, jti, claims.exp as i64).await?;
        tracing::info!("🔑 Token revoked: jti={}", jti);
    }

    Ok(Json(serde_json::json!({
        "revoked": true,
        "message": "Token has been revoked."
    })))
}

/// Revoke ALL access tokens for the authenticated customer.
/// Useful for password changes or suspected account compromise.
async fn revoke_all_tokens(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    jwt::revoke_all_tokens_for_customer(&pool, customer.id).await?;
    tracing::info!("🔑 All tokens revoked for customer {}", customer.id);

    Ok(Json(serde_json::json!({
        "revoked": true,
        "message": "All access tokens have been revoked. You will need to log in again."
    })))
}

// ── Consent Endpoints ───────────────────────────────────────

/// GET /v1/auth/consent — Get user consent preferences
async fn get_consent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let consents: Option<(serde_json::Value,)> = sqlx::query_as(
        "SELECT consents FROM customer_consents WHERE customer_id = $1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let consents_map = match consents {
        Some(val) => val.0,
        None => serde_json::json!({}),
    };

    Ok(Json(serde_json::json!({ "consents": consents_map })))
}

/// POST /v1/auth/consent — Update a single consent preference
async fn update_consent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let key = req.get("key").and_then(|v| v.as_str()).ok_or(AppError::BadRequest("Missing 'key' field".into()))?;
    let value = req.get("value").and_then(|v| v.as_bool()).ok_or(AppError::BadRequest("Missing 'value' field".into()))?;

    // Upsert: merge into existing consents JSON
    sqlx::query(
        r#"INSERT INTO customer_consents (id, customer_id, consents, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (customer_id) DO UPDATE SET
             consents = customer_consents.consents || $3,
             updated_at = NOW()"#,
    )
    .bind(Uuid::new_v4())
    .bind(customer.id)
    .bind(serde_json::json!({ key: value }))
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "success": true })))
}

// ── 2FA Endpoints ───────────────────────────────────────────

async fn enable_2fa(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<Enable2faRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Verify password
    let hash = customer
        .password_hash
        .as_ref()
        .ok_or(AppError::BadRequest("Password not set".into()))?;

    if !jwt::verify_password_async(req.password.clone(), hash.clone()).await? {
        return Err(AppError::BadRequest("Invalid password".into()));
    }

    if customer.totp_enabled {
        return Err(AppError::BadRequest("2FA is already enabled".into()));
    }

    // Generate TOTP secret
    let secret = generate_totp_secret();
    let otpauth_url = format!(
        "otpauth://totp/HookSniff:{}?secret={}&issuer=HookSniff&digits=6&period=30",
        customer.email, secret
    );

    // Store the secret (not yet enabled — requires confirmation)
    sqlx::query("UPDATE customers SET totp_secret = $1, updated_at = NOW() WHERE id = $2")
        .bind(&secret)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    // Generate QR code URL via free API (no dependencies needed)
    let qr_code_url = format!(
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={}",
        urlencoding::encode(&otpauth_url)
    );

    Ok(Json(serde_json::json!({
        "secret": secret,
        "qr_code": qr_code_url,
        "otpauth_url": otpauth_url,
        "message": "Scan the QR code in your authenticator app, then confirm with a TOTP code."
    })))
}

async fn confirm_2fa(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
    Json(req): Json<Confirm2faRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let secret = customer.totp_secret.as_ref().ok_or(AppError::BadRequest(
        "2FA setup not initiated. Call /2fa/enable first.".into(),
    ))?;

    if !verify_totp_code(secret, &req.code) {
        return Err(AppError::BadRequest("Invalid TOTP code".into()));
    }

    // Generate 8 backup codes (8-char alphanumeric each)
    let backup_codes = generate_backup_codes(8);
    let mut backup_code_hashes: Vec<String> = Vec::with_capacity(backup_codes.len());
    for code in &backup_codes {
        let hash = jwt::hash_password_async(code.clone()).await?;
        backup_code_hashes.push(hash);
    }

    // Store hashed backup codes in DB (delete old ones first)
    sqlx::query("DELETE FROM tfa_backup_codes WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    for hash in &backup_code_hashes {
        sqlx::query(
            "INSERT INTO tfa_backup_codes (customer_id, code_hash) VALUES ($1, $2)",
        )
        .bind(customer.id)
        .bind(hash)
        .execute(&pool)
        .await?;
    }

    sqlx::query("UPDATE customers SET totp_enabled = true, updated_at = NOW() WHERE id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ 2FA enabled for customer {}", customer.id);

    // Audit log — 2FA_ENABLE
    {
        let rid = customer.id.to_string();
        let ip = extract_client_ip(&headers);
        let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "2FA_ENABLE", "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
    }

    Ok(Json(serde_json::json!({
        "message": "Two-factor authentication has been enabled.",
        "backup_codes": backup_codes,
        "warning": "Store these backup codes in a safe place. They will only be shown once."
    })))
}

async fn disable_2fa(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
    Json(req): Json<Disable2faRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if !customer.totp_enabled {
        return Err(AppError::BadRequest("2FA is not enabled".into()));
    }

    let hash = customer
        .password_hash
        .as_ref()
        .ok_or(AppError::BadRequest("Password not set".into()))?;

    if !jwt::verify_password_async(req.password.clone(), hash.clone()).await? {
        return Err(AppError::BadRequest("Invalid password".into()));
    }

    sqlx::query(
        "UPDATE customers SET totp_secret = NULL, totp_enabled = false, updated_at = NOW() WHERE id = $1",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    // Clean up backup codes
    sqlx::query("DELETE FROM tfa_backup_codes WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ 2FA disabled for customer {}", customer.id);

    // Audit log — 2FA_DISABLE
    {
        let rid = customer.id.to_string();
        let ip = extract_client_ip(&headers);
        let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "2FA_DISABLE", "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
    }

    Ok(Json(
        serde_json::json!({"message": "Two-factor authentication has been disabled."}),
    ))
}

/// GET /v1/auth/2fa/status — Return current 2FA status
async fn two_factor_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let last_used_at: Option<String> = sqlx::query_scalar(
        "SELECT to_char(created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') FROM tfa_backup_codes WHERE customer_id = $1 AND used = true ORDER BY created_at DESC LIMIT 1",
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .flatten();

    Ok(Json(serde_json::json!({
        "enabled": customer.totp_enabled,
        "last_used_at": last_used_at,
    })))
}

// ── Profile Endpoints ───────────────────────────────────────

/// GET /v1/auth/me — Return current user info
async fn get_me(
    Extension(customer): Extension<Customer>,
) -> Result<Json<CustomerResponse>, AppError> {
    Ok(Json(customer.to_response(None)))
}

/// PUT /v1/auth/profile — Update name and email
async fn update_profile(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<CustomerResponse>, AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name cannot be empty".into()));
    }
    if let Err(e) = crate::validation::validate_email(&req.email) {
        return Err(AppError::BadRequest(e));
    }

    // Check if new email is taken by another user
    if req.email != customer.email {
        let existing: Option<(Uuid,)> =
            sqlx::query_as("SELECT id FROM customers WHERE email = $1 AND id != $2")
                .bind(&req.email)
                .bind(customer.id)
                .fetch_optional(&pool)
                .await?;
        if existing.is_some() {
            // HS-038h: Don't reveal whether the email is registered
            return Err(AppError::BadRequest("Invalid email".into()));
        }
    }

    let updated = sqlx::query_as::<_, Customer>(
        "UPDATE customers SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    tracing::info!("✅ Profile updated for customer {}", customer.id);

    Ok(Json(updated.to_response(None)))
}

/// PUT /v1/auth/password — Change password
async fn change_password(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    headers: HeaderMap,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    validate_password_strength(&req.new_password)?;

    let hash = customer.password_hash.as_ref().ok_or(AppError::BadRequest(
        "Password login not set up for this account".into(),
    ))?;

    if !jwt::verify_password_async(req.current_password.clone(), hash.clone()).await? {
        return Err(AppError::BadRequest("Current password is incorrect".into()));
    }

    let new_hash = jwt::hash_password_async(req.new_password.clone()).await?;

    sqlx::query("UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    // Revoke all refresh tokens on password change
    sqlx::query("UPDATE refresh_tokens SET revoked = true WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    // HS-261: Revoke all access tokens on password change
    let _ = jwt::revoke_all_tokens_for_customer(&pool, customer.id).await;

    tracing::info!("✅ Password changed for customer {}", customer.id);

    // Audit log — PASSWORD_CHANGE
    {
        let rid = customer.id.to_string();
        let ip = extract_client_ip(&headers);
        let ua = headers.get("user-agent").and_then(|v| v.to_str().ok()).unwrap_or("unknown").to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "PASSWORD_CHANGE", "auth", Some(&rid), None, Some(&ip), Some(&ua)).await;
    }

    Ok(Json(
        serde_json::json!({"message": "Password updated successfully"}),
    ))
}

// ── GDPR Endpoints ──────────────────────────────────────────

/// GET /v1/auth/export — Export all user data (GDPR Article 15 — Right of Access)
async fn export_data(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Fetch user's endpoints
    let endpoints: Vec<serde_json::Value> = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE customer_id = $1 ORDER BY created_at",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|e| serde_json::to_value(e).unwrap_or_default())
    .collect();

    // Fetch recent deliveries (last 90 days)
    let deliveries: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, endpoint_id, event, status, attempt_count, response_status, created_at FROM deliveries WHERE customer_id = $1 AND created_at > NOW() - INTERVAL '90 days' ORDER BY created_at DESC LIMIT 10000",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| {
        serde_json::json!({
            "id": row.get::<Uuid, _>("id"),
            "endpoint_id": row.get::<Uuid, _>("endpoint_id"),
            "event": row.get::<Option<String>, _>("event"),
            "status": row.get::<String, _>("status"),
            "attempt_count": row.get::<i32, _>("attempt_count"),
            "response_status": row.get::<Option<i32>, _>("response_status"),
            "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
        })
    })
    .collect();

    // Fetch API keys (prefixes only, not hashes)
    let api_keys: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, name, api_key_prefix, is_active, created_at FROM api_keys WHERE customer_id = $1",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| {
        serde_json::json!({
            "id": row.get::<Uuid, _>("id"),
            "name": row.get::<Option<String>, _>("name"),
            "prefix": row.get::<String, _>("api_key_prefix"),
            "is_active": row.get::<bool, _>("is_active"),
            "created_at": row.get::<chrono::DateTime<Utc>, _>("created_at"),
        })
    })
    .collect();

    tracing::info!("📦 Data export requested by customer {}", customer.id);

    Ok(Json(serde_json::json!({
        "export_date": Utc::now().to_rfc3339(),
        "account": {
            "id": customer.id,
            "email": customer.email,
            "name": customer.name,
            "plan": customer.plan,
            "email_verified": customer.email_verified,
            "created_at": customer.created_at,
        },
        "endpoints": endpoints,
        "deliveries": deliveries,
        "api_keys": api_keys,
    })))
}

/// DELETE /v1/auth/account — Delete user account and all data (GDPR Article 17 — Right to Erasure)
async fn delete_account(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Require password confirmation for deletion
    let password = req
        .get("password")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("Password is required for account deletion".into()))?;

    let hash = customer
        .password_hash
        .as_ref()
        .ok_or(AppError::BadRequest("Password not set".into()))?;

    if !jwt::verify_password_async(password.to_string(), hash.clone()).await? {
        return Err(AppError::BadRequest("Invalid password".into()));
    }

    // Delete all user data in a transaction
    let mut tx = pool.begin().await?;

    // Delete in correct order (foreign keys)
    sqlx::query("DELETE FROM delivery_attempts WHERE delivery_id IN (SELECT id FROM deliveries WHERE customer_id = $1)")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM deliveries WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM endpoints WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM api_keys WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM refresh_tokens WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM password_reset_tokens WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM email_verification_tokens WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM notifications WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM devices WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    // Additional tables with customer_id (GDPR compliance)
    sqlx::query("DELETE FROM installed_agents WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM payment_transactions WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM invoices WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM audit_log WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM sso_configs WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM custom_domains WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM portal_configs WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    // Finally delete the customer
    sqlx::query("DELETE FROM customers WHERE id = $1")
        .bind(customer.id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    tracing::info!(
        "🗑️ Account deleted for customer {} ({})",
        customer.id,
        customer.email
    );

    Ok(Json(serde_json::json!({
        "message": "Account and all associated data have been permanently deleted.",
        "deleted_at": Utc::now().to_rfc3339(),
    })))
}

// ── Helpers ─────────────────────────────────────────────────

/// Create a refresh token and store its hash. Returns the raw token.
async fn create_refresh_token(pool: &PgPool, customer_id: Uuid) -> Result<String, AppError> {
    let token = jwt::generate_random_token();
    let token_hash = jwt::hash_token(&token);
    let expires_at = Utc::now() + Duration::days(30);

    sqlx::query(
        "INSERT INTO refresh_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    )
    .bind(customer_id)
    .bind(&token_hash)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(token)
}

/// Generate and send an email verification token for a customer.
async fn send_verification_email_for_customer(
    pool: &PgPool,
    cfg: &Config,
    email_provider: &crate::email::EmailProvider,
    job_queue: Option<&crate::jobs::job_queue::JobQueue>,
    customer_id: Uuid,
    email: &str,
    lang: crate::email::Language,
) {
    let token = jwt::generate_random_token();
    let token_hash = jwt::hash_token(&token);
    let expires_at = Utc::now() + Duration::hours(24);

    let insert_result = sqlx::query(
        "INSERT INTO email_verification_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    )
    .bind(customer_id)
    .bind(&token_hash)
    .bind(expires_at)
    .execute(pool)
    .await;

    if let Err(e) = insert_result {
        tracing::warn!("Failed to store verification token for {}: {:?}", email, e);
        return;
    }

    let verify_url = format!("{}/verify-email?token={}", cfg.email_base_url, token);
    let lang_str = if lang == crate::email::Language::Tr { "tr" } else { "en" };

    let to = email.to_string();
    if let Some(queue) = job_queue {
        let job = crate::jobs::job_queue::Job::Email {
            to: to.clone(),
            template: crate::jobs::job_queue::EmailTemplate::Verification {
                verify_url: verify_url.clone(),
            },
            language: lang_str.to_string(),
        };
        if let Err(e) = queue.enqueue(&job).await {
            tracing::warn!("Failed to enqueue verification email for {}: {:?}", to, e);
            // Fallback
            let ep = email_provider.clone();
            tokio::spawn(async move {
                if let Err(e) = ep.send_verification_email(&to, &verify_url, lang).await {
                    tracing::warn!("Failed to send verification email to {}: {:?}", to, e);
                }
            });
        }
    } else {
        let ep = email_provider.clone();
        tokio::spawn(async move {
            if let Err(e) = ep.send_verification_email(&to, &verify_url, lang).await {
                tracing::warn!("Failed to send verification email to {}: {:?}", to, e);
            }
        });
    }
}

/// Generate a TOTP secret (base32 encoded).
fn generate_totp_secret() -> String {
    use rand::TryRng;
    let mut bytes = [0u8; 20];
    rand::rngs::SysRng
        .try_fill_bytes(&mut bytes)
        .expect("SysRng fill failed");
    base32::encode(base32::Alphabet::Rfc4648 { padding: false }, &bytes)
}

/// Generate `count` backup codes, each 8 characters alphanumeric (uppercase + digits).
fn generate_backup_codes(count: usize) -> Vec<String> {
    use rand::TryRng;
    const CHARSET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
    let mut codes = Vec::with_capacity(count);
    for _ in 0..count {
        let mut bytes = [0u8; 8];
        rand::rngs::SysRng
            .try_fill_bytes(&mut bytes)
            .expect("SysRng fill failed");
        let code: String = bytes
            .iter()
            .map(|&b| CHARSET[(b as usize) % CHARSET.len()] as char)
            .collect();
        codes.push(code);
    }
    codes
}

/// Verify a backup code against stored hashes. Marks matched code as used.
async fn verify_backup_code(
    pool: &PgPool,
    customer_id: Uuid,
    backup_code: &str,
) -> Result<bool, AppError> {
    let rows: Vec<(Uuid, String)> = sqlx::query_as(
        "SELECT id, code_hash FROM tfa_backup_codes WHERE customer_id = $1 AND used = false",
    )
    .bind(customer_id)
    .fetch_all(pool)
    .await?;

    for (row_id, hash) in &rows {
        if jwt::verify_password_async(backup_code.to_string(), hash.clone())
            .await
            .unwrap_or(false)
        {
            // Mark as used
            sqlx::query("UPDATE tfa_backup_codes SET used = true WHERE id = $1")
                .bind(row_id)
                .execute(pool)
                .await?;
            return Ok(true);
        }
    }
    Ok(false)
}

/// Verify a TOTP code against a base32-encoded secret.
fn verify_totp_code(secret_b32: &str, code: &str) -> bool {
    use totp_rs::{Algorithm, TOTP};
    let secret_bytes =
        match base32::decode(base32::Alphabet::Rfc4648 { padding: false }, secret_b32) {
            Some(b) => b,
            None => return false,
        };
    let totp = match TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret_bytes,
        Some("HookSniff".to_string()),
        "user".to_string(),
    ) {
        Ok(t) => t,
        Err(_) => return false,
    };
    totp.check_current(code).unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    // ── Constants ───────────────────────────────────────────

    #[test]
    fn test_constants_values() {
        assert_eq!(LOGIN_RATE_LIMIT, 10);
        assert_eq!(REGISTER_RATE_LIMIT, 5);
        assert_eq!(TOKEN_MAX_AGE, 86400);
        assert_eq!(REFRESH_TOKEN_MAX_AGE, 2592000);
        assert_eq!(RESET_RATE_LIMIT, 5);
        assert_eq!(VERIFY_EMAIL_RATE_LIMIT, 10);
        assert_eq!(VERIFY_2FA_RATE_LIMIT, 5);
        assert_eq!(REFRESH_RATE_LIMIT, 30);
    }

    // ── extract_client_ip ───────────────────────────────────

    #[test]
    fn test_extract_client_ip_from_x_forwarded_for() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-forwarded-for",
            HeaderValue::from_static("1.2.3.4, 5.6.7.8"),
        );
        // Now takes LAST entry (most recent proxy)
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
    fn test_extract_client_ip_prefers_real_ip_over_forwarded_for() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("1.1.1.1"));
        headers.insert("x-real-ip", HeaderValue::from_static("2.2.2.2"));
        // X-Real-IP takes priority (set by trusted proxy)
        assert_eq!(extract_client_ip(&headers), "2.2.2.2");
    }

    #[test]
    fn test_extract_client_ip_single_forwarded_for() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("192.168.1.1"));
        assert_eq!(extract_client_ip(&headers), "192.168.1.1");
    }

    // ── auth_response_with_cookie ───────────────────────────

    #[test]
    fn test_auth_response_with_cookie_sets_access_token() {
        let body = AuthResponse {
            token: "test_jwt".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: None,
                api_key: None,
                plan: "developer".to_string(),
                webhook_limit: 10,
                webhook_count: 0,
                is_admin: false,
                created_at: chrono::Utc::now(),
            },
            refresh_token: None,
        };
        let (headers, json) = auth_response_with_cookie(body);
        assert!(headers.contains_key("set-cookie"));
        let cookie = headers.get("set-cookie").unwrap().to_str().unwrap();
        assert!(cookie.contains("hooksniff_token=test_jwt"));
        assert!(cookie.contains("Max-Age=86400"));
        assert_eq!(json["token"], "test_jwt");
        assert_eq!(json["customer"]["email"], "a@b.com");
    }

    #[test]
    fn test_auth_response_with_cookie_includes_refresh_token() {
        let body = AuthResponse {
            token: "jwt".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(),
                email: "x@y.com".to_string(),
                name: None,
                api_key: None,
                plan: "pro".to_string(),
                webhook_limit: 100,
                webhook_count: 0,
                is_admin: false,
                created_at: chrono::Utc::now(),
            },
            refresh_token: Some("refresh_abc".to_string()),
        };
        let (headers, _) = auth_response_with_cookie(body);
        let cookies: Vec<_> = headers.get_all("set-cookie").iter().collect();
        assert!(cookies.len() >= 2, "Should have access + refresh cookies");
        let has_refresh = cookies.iter().any(|c| {
            c.to_str()
                .unwrap_or("")
                .contains("hooksniff_refresh=refresh_abc")
        });
        assert!(has_refresh, "Should contain refresh token cookie");
    }

    #[test]
    fn test_auth_response_body_excludes_refresh_token() {
        let body = AuthResponse {
            token: "jwt".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: None,
                api_key: None,
                plan: "developer".to_string(),
                webhook_limit: 10,
                webhook_count: 0,
                is_admin: false,
                created_at: chrono::Utc::now(),
            },
            refresh_token: Some("secret_refresh".to_string()),
        };
        let (_, json) = auth_response_with_cookie(body);
        // refresh_token should NOT be in the JSON body
        assert!(
            json.get("refresh_token").is_none(),
            "refresh_token should not be in response body"
        );
    }

    // ── generate_totp_secret ────────────────────────────────

    #[test]
    fn test_generate_totp_secret_is_base32() {
        let secret = generate_totp_secret();
        assert!(!secret.is_empty());
        // Base32 alphabet: A-Z and 2-7
        assert!(
            secret
                .chars()
                .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit()),
            "TOTP secret should be base32 encoded"
        );
    }

    #[test]
    fn test_generate_totp_secret_unique() {
        let s1 = generate_totp_secret();
        let s2 = generate_totp_secret();
        assert_ne!(s1, s2, "Each generated secret should be unique");
    }

    // ── verify_totp_code ────────────────────────────────────

    #[test]
    fn test_verify_totp_code_invalid_base32_returns_false() {
        assert!(!verify_totp_code("NOT_VALID_BASE32!!!", "123456"));
    }

    #[test]
    fn test_verify_totp_code_empty_code_returns_false() {
        let secret = generate_totp_secret();
        assert!(!verify_totp_code(&secret, ""));
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_auth_router_construction() {
        let _router = router();
        // Should not panic; Router is constructed
    }
}
