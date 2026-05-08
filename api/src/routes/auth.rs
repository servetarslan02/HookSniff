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
    headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| {
            headers
                .get("x-real-ip")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("unknown")
                .to_string()
        })
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
    if !req.email.contains('@') {
        return Err(AppError::BadRequest("Invalid email".into()));
    }

    // Password is required
    let password = req
        .password
        .ok_or_else(|| AppError::BadRequest("Password is required".into()))?;

    if password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }

    // Check if email exists
    let existing: Option<(Uuid,)> = sqlx::query_as("SELECT id FROM customers WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&pool)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Email already registered".into()));
    }

    // Generate API key
    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

    // Hash password
    let password_hash = jwt::hash_password(&password)?;

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

    // Generate short-lived access token + refresh token
    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ New customer registered: {}", req.email);

    // Send welcome email + verification email (fire-and-forget)
    if let Some(email_client) = crate::email::GCloudEmailClient::from_config(&cfg) {
        let to = req.email.clone();
        let name = req.name.clone();
        tokio::spawn(async move {
            if let Err(e) = email_client.send_welcome_email(&to, name.as_deref()).await {
                tracing::warn!("Failed to send welcome email to {}: {:?}", to, e);
            }
        });
    }

    // Auto-send verification email
    send_verification_email_for_customer(&pool, &cfg, customer.id, &req.email).await;

    Ok(auth_response_with_cookie(AuthResponse {
        token,
        customer: customer.to_response(Some(api_key)),
        refresh_token: Some(refresh_token_value),
    }))
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

    let customer = sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    // Check if user is active
    if !customer.is_active {
        return Err(AppError::Forbidden("Account has been deactivated".into()));
    }

    // Verify password
    let hash = customer.password_hash.as_ref().ok_or(AppError::BadRequest(
        "Password login not set up for this account. Use API key auth.".into(),
    ))?;

    if !jwt::verify_password(&req.password, hash)? {
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
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ Customer logged in: {}", req.email);

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
    Json(req): Json<Verify2faRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Verify the temp token
    let claims = jwt::verify_token(&req.temp_token, &cfg.jwt_secret)?;

    let customer = sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE id = $1")
        .bind(claims.sub)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if !customer.totp_enabled {
        return Err(AppError::BadRequest("2FA is not enabled".into()));
    }

    let secret = customer
        .totp_secret
        .as_ref()
        .ok_or(AppError::Internal(anyhow::anyhow!("TOTP secret missing")))?;

    if !verify_totp_code(secret, &req.code) {
        return Err(AppError::BadRequest("Invalid TOTP code".into()));
    }

    // Generate short-lived access token + refresh token
    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ 2FA verified for customer: {}", customer.email);

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

        if let Some(email_client) = crate::email::GCloudEmailClient::from_config(&cfg) {
            let to = email.clone();
            tokio::spawn(async move {
                if let Err(e) = email_client
                    .send_password_reset_email(&to, &reset_url)
                    .await
                {
                    tracing::warn!("Failed to send password reset email to {}: {:?}", to, e);
                }
            });
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

    if req.new_password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }

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

    // Update password
    let new_hash = jwt::hash_password(&req.new_password)?;
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

async fn verify_email(
    Extension(pool): Extension<PgPool>,
    Json(req): Json<VerifyEmailRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
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
    headers: HeaderMap,
    Json(req): Json<ResendVerificationRequest>,
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

    // Always return success to prevent enumeration
    let customer: Option<(Uuid, String, bool)> =
        sqlx::query_as("SELECT id, email, email_verified FROM customers WHERE email = $1")
            .bind(&req.email)
            .fetch_optional(&pool)
            .await?;

    if let Some((customer_id, email, verified)) = customer {
        if !verified {
            send_verification_email_for_customer(&pool, &cfg, customer_id, &email).await;
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
    headers: HeaderMap,
    // Accept refresh token from either cookie or JSON body (cookie takes priority)
    body: Option<Json<RefreshTokenRequest>>,
) -> Result<impl IntoResponse, AppError> {
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

    let customer = sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE id = $1")
        .bind(customer_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if !customer.is_active {
        return Err(AppError::Forbidden("Account has been deactivated".into()));
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
    )?;
    let new_refresh = create_refresh_token(&pool, customer.id).await?;

    Ok(auth_response_with_cookie(AuthResponse {
        token: new_access,
        customer: customer.to_response(None),
        refresh_token: Some(new_refresh),
    }))
}

// ── Logout ──────────────────────────────────────────────────

async fn logout() -> impl IntoResponse {
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

    if !jwt::verify_password(&req.password, hash)? {
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

    Ok(Json(serde_json::json!({
        "secret": secret,
        "otpauth_url": otpauth_url,
        "message": "Scan the QR code in your authenticator app, then confirm with a TOTP code."
    })))
}

async fn confirm_2fa(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<Confirm2faRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let secret = customer.totp_secret.as_ref().ok_or(AppError::BadRequest(
        "2FA setup not initiated. Call /2fa/enable first.".into(),
    ))?;

    if !verify_totp_code(secret, &req.code) {
        return Err(AppError::BadRequest("Invalid TOTP code".into()));
    }

    sqlx::query("UPDATE customers SET totp_enabled = true, updated_at = NOW() WHERE id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ 2FA enabled for customer {}", customer.id);

    Ok(Json(
        serde_json::json!({"message": "Two-factor authentication has been enabled."}),
    ))
}

async fn disable_2fa(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<Disable2faRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if !customer.totp_enabled {
        return Err(AppError::BadRequest("2FA is not enabled".into()));
    }

    let hash = customer
        .password_hash
        .as_ref()
        .ok_or(AppError::BadRequest("Password not set".into()))?;

    if !jwt::verify_password(&req.password, hash)? {
        return Err(AppError::BadRequest("Invalid password".into()));
    }

    sqlx::query(
        "UPDATE customers SET totp_secret = NULL, totp_enabled = false, updated_at = NOW() WHERE id = $1",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    tracing::info!("✅ 2FA disabled for customer {}", customer.id);

    Ok(Json(
        serde_json::json!({"message": "Two-factor authentication has been disabled."}),
    ))
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
    if !req.email.contains('@') {
        return Err(AppError::BadRequest("Invalid email".into()));
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
            return Err(AppError::BadRequest("Email already in use".into()));
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
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if req.new_password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }

    let hash = customer.password_hash.as_ref().ok_or(AppError::BadRequest(
        "Password login not set up for this account".into(),
    ))?;

    if !jwt::verify_password(&req.current_password, hash)? {
        return Err(AppError::BadRequest("Current password is incorrect".into()));
    }

    let new_hash = jwt::hash_password(&req.new_password)?;

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

    tracing::info!("✅ Password changed for customer {}", customer.id);

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
        "SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at",
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

    if !jwt::verify_password(password, hash)? {
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
    customer_id: Uuid,
    email: &str,
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

    if let Some(email_client) = crate::email::GCloudEmailClient::from_config(cfg) {
        let to = email.to_string();
        tokio::spawn(async move {
            if let Err(e) = email_client.send_verification_email(&to, &verify_url).await {
                tracing::warn!("Failed to send verification email to {}: {:?}", to, e);
            }
        });
    }
}

/// Generate a TOTP secret (base32 encoded).
fn generate_totp_secret() -> String {
    use rand::RngCore;
    let mut bytes = [0u8; 20];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    base32::encode(base32::Alphabet::Rfc4648 { padding: false }, &bytes)
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
