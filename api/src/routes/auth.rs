use axum::extract::Extension;
use axum::http::HeaderMap;
use axum::routing::{get, post, put};
use axum::{Json, Router};
use chrono::{Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::{
    AuthResponse, ChangePasswordRequest, Confirm2faRequest, CreateCustomerRequest, Customer,
    CustomerResponse, Disable2faRequest, Enable2faRequest, ForgotPasswordRequest, LoginRequest,
    RefreshTokenRequest, RegisterDeviceRequest, ResendVerificationRequest, ResetPasswordRequest,
    TwoFactorRequiredResponse, UpdateProfileRequest, Verify2faRequest, VerifyEmailRequest,
};

/// Maximum login attempts per IP per 15-minute window.
const LOGIN_RATE_LIMIT: u32 = 10;
const LOGIN_RATE_WINDOW_SECS: u64 = 15 * 60;

/// Maximum registration attempts per IP per hour.
const REGISTER_RATE_LIMIT: u32 = 5;
const REGISTER_RATE_WINDOW_SECS: u64 = 60 * 60;

/// Maximum password reset attempts per IP per hour.
const RESET_RATE_LIMIT: u32 = 5;
const RESET_RATE_WINDOW_SECS: u64 = 60 * 60;

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
        .route("/2fa/enable", post(enable_2fa))
        .route("/2fa/confirm", post(confirm_2fa))
        .route("/2fa/disable", post(disable_2fa))
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
) -> Result<Json<AuthResponse>, AppError> {
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

    Ok(Json(AuthResponse {
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
) -> Result<Json<serde_json::Value>, AppError> {
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
        return Ok(Json(serde_json::json!(TwoFactorRequiredResponse {
            requires_2fa: true,
            temp_token,
            message: "Two-factor authentication required. Please provide your TOTP code.".into(),
        })));
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

    Ok(Json(serde_json::json!(AuthResponse {
        token,
        customer: customer.to_response(None),
        refresh_token: Some(refresh_token_value),
    })))
}

// ── 2FA Verify During Login ─────────────────────────────────

async fn verify_2fa_login(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Json(req): Json<Verify2faRequest>,
) -> Result<Json<AuthResponse>, AppError> {
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

    Ok(Json(AuthResponse {
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
                if let Err(e) = email_client.send_password_reset_email(&to, &reset_url).await {
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
    Json(req): Json<RefreshTokenRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let token_hash = jwt::hash_token(&req.refresh_token);

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

    Ok(Json(AuthResponse {
        token: new_access,
        customer: customer.to_response(None),
        refresh_token: Some(new_refresh),
    }))
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
    sqlx::query(
        "UPDATE customers SET totp_secret = $1, updated_at = NOW() WHERE id = $2",
    )
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
    let secret = customer
        .totp_secret
        .as_ref()
        .ok_or(AppError::BadRequest("2FA setup not initiated. Call /2fa/enable first.".into()))?;

    if !verify_totp_code(secret, &req.code) {
        return Err(AppError::BadRequest("Invalid TOTP code".into()));
    }

    sqlx::query(
        "UPDATE customers SET totp_enabled = true, updated_at = NOW() WHERE id = $1",
    )
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
    let secret_bytes = match base32::decode(base32::Alphabet::Rfc4648 { padding: false }, secret_b32) {
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
