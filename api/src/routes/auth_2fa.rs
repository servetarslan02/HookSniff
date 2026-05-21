use axum::extract::Extension;
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::Json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::{
    AuthResponse, Confirm2faRequest, Customer, Disable2faRequest,
    TwoFactorRequiredResponse, Verify2faRequest,
};
use crate::routes::auth::{auth_response_with_cookie, extract_client_ip, send_audit_log};

/// Maximum 2FA verification attempts per IP per 5 minutes.
const VERIFY_2FA_RATE_LIMIT: u32 = 5;

// ── 2FA Verify During Login ─────────────────────────────────

pub async fn verify_2fa_login(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Json(req): Json<Verify2faRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = extract_client_ip(&headers);
    let rl_key = format!("verify_2fa:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_window(&rl_key, VERIFY_2FA_RATE_LIMIT, 300)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    let claims = jwt::verify_token(&req.temp_token, &cfg.jwt_secret)?;

    let customer = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", crate::routes::auth::CUSTOMER_SELECT))
        .bind(claims.sub)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    if !customer.totp_enabled {
        return Err(AppError::Unauthorized);
    }

    let auth_ok = if let Some(ref backup_code) = req.backup_code {
        verify_backup_code(&pool, customer.id, backup_code).await?
    } else {
        let secret = customer
            .totp_secret
            .as_ref()
            .ok_or(AppError::Internal(anyhow::anyhow!("TOTP secret missing")))?;
        verify_totp_code(secret, &req.code)
    };

    if !auth_ok {
        return Err(AppError::Unauthorized);
    }

    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let refresh_token_value = crate::routes::auth::create_refresh_token(&pool, customer.id).await?;

    tracing::info!("✅ 2FA verified for customer: {}", customer.email);
    send_audit_log(&pool, customer.id, "LOGIN", &headers).await;

    Ok(auth_response_with_cookie(AuthResponse {
        token,
        customer: customer.to_response(None),
        refresh_token: Some(refresh_token_value),
    }))
}

// ── 2FA Setup & Management ──────────────────────────────────

pub async fn enable_2fa(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    if customer.totp_enabled {
        return Err(AppError::BadRequest("2FA is already enabled".into()));
    }

    let secret = generate_totp_secret();
    // Account label = "HookSniff" (not "HookSniff:email") — shows as just "HookSniff" in authenticator
    let otpauth_url = format!(
        "otpauth://totp/HookSniff?secret={}&issuer=HookSniff&digits=6&period=30",
        secret
    );

    sqlx::query("UPDATE customers SET totp_secret = $1, updated_at = NOW() WHERE id = $2")
        .bind(&secret)
        .bind(customer.id)
        .execute(&pool)
        .await?;

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

pub async fn confirm_2fa(
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

    let backup_codes = generate_backup_codes(8);
    let mut backup_code_hashes: Vec<String> = Vec::with_capacity(backup_codes.len());
    for code in &backup_codes {
        let hash = jwt::hash_password_async(code.clone()).await?;
        backup_code_hashes.push(hash);
    }

    sqlx::query("DELETE FROM tfa_backup_codes WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    for hash in &backup_code_hashes {
        sqlx::query("INSERT INTO tfa_backup_codes (customer_id, code_hash) VALUES ($1, $2)")
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
    send_audit_log(&pool, customer.id, "2FA_ENABLE", &headers).await;

    // HS-039: Notify user of 2FA enablement
    crate::notifications::helpers::two_factor_enabled(&pool, customer.id).await;

    Ok(Json(serde_json::json!({
        "message": "Two-factor authentication has been enabled.",
        "backup_codes": backup_codes,
        "warning": "Store these backup codes in a safe place. They will only be shown once."
    })))
}

pub async fn disable_2fa(
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

    sqlx::query("DELETE FROM tfa_backup_codes WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ 2FA disabled for customer {}", customer.id);
    send_audit_log(&pool, customer.id, "2FA_DISABLE", &headers).await;

    // HS-039: Notify user of 2FA disablement
    crate::notifications::helpers::two_factor_disabled(&pool, customer.id).await;

    Ok(Json(
        serde_json::json!({"message": "Two-factor authentication has been disabled."}),
    ))
}

pub async fn two_factor_status(
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

// ── TOTP Helpers ────────────────────────────────────────────

pub fn generate_totp_secret() -> String {
    use rand::TryRng;
    let mut bytes = [0u8; 20];
    rand::rngs::SysRng
        .try_fill_bytes(&mut bytes)
        .expect("SysRng fill failed");
    base32::encode(base32::Alphabet::Rfc4648 { padding: false }, &bytes)
}

pub fn generate_backup_codes(count: usize) -> Vec<String> {
    use rand::TryRng;
    const CHARSET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

pub async fn verify_backup_code(
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
            sqlx::query("UPDATE tfa_backup_codes SET used = true WHERE id = $1")
                .bind(row_id)
                .execute(pool)
                .await?;
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn verify_totp_code(secret_b32: &str, code: &str) -> bool {
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
