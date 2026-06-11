//! Registration and login handlers.

use axum::response::IntoResponse;
use axum::extract::Extension;
use axum::http::HeaderMap;
use axum::Json;
use chrono::Duration;
use sqlx::PgPool;
use uuid::Uuid;
use crate::db;

use crate::auth::jwt;
use crate::config::Config;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::{
    AuthResponse, CreateCustomerRequest, Customer, LoginRequest, TwoFactorRequiredResponse,
};

use super::{
    CUSTOMER_SELECT, REGISTER_RATE_LIMIT, LOGIN_RATE_LIMIT,
    validate_password_strength, auth_response_with_cookie, extract_client_ip,
    send_audit_log,
};
use super::helpers::create_refresh_token;
// send_verification_email_for_customer — temporarily unused (email disabled)

// ── Registration ────────────────────────────────────────────

pub async fn register(
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

    let password = req.password.ok_or_else(|| AppError::coded(ErrorCode::PasswordRequired))?;
    validate_password_strength(&password)?;

    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..24].to_string();
    let password_hash = jwt::hash_password_async(password.clone()).await?;

    let existing: Option<(Uuid,)> = db::timed_query("auth_register_check", async {
        sqlx::query_as("SELECT id FROM customers WHERE email = $1")
            .bind(&req.email).fetch_optional(&pool).await
    }).await?;

    if existing.is_some() {
        tracing::info!("Registration attempt for existing email: {}", req.email);
        return Ok((HeaderMap::new(), Json(serde_json::json!({
            "message": "If this email is available, a verification email has been sent.",
        }))));
    }

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, password_hash, name, is_active, email_verified) VALUES ($1, $2, $3, $4, $5, true, true) RETURNING *",
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

    // TODO: Email sending temporarily disabled — re-enable when email provider is fixed
    // let lang = crate::email::Language::from_accept_language(
    //     headers.get("accept-language").and_then(|v| v.to_str().ok()).unwrap_or("en")
    // );
    // let to = req.email.clone();
    // let name = req.name.clone();
    // let _ep = email_provider.clone();
    // send_email_with_fallback(job_queue.as_ref(), &email_provider, &to,
    //     crate::jobs::job_queue::EmailTemplate::Welcome { name: name.clone() }, lang,
    //     move |ep, to, lang| {
    //         tokio::spawn(async move {
    //             if let Err(e) = ep.send_welcome_email(&to, name.as_deref(), lang).await {
    //                 tracing::warn!("Failed to send welcome email to {}: {:?}", to, e);
    //             }
    //         });
    //     },
    // ).await;
    //
    // send_verification_email_for_customer(&pool, &cfg, &email_provider, job_queue.as_ref(), customer.id, &req.email, lang).await;
    tracing::info!("📧 Email sending disabled — skipping welcome & verification emails for {}", req.email);

    // Auto-login after registration — generate token
    let token = jwt::generate_access_token(customer.id, &customer.email, &customer.plan, &cfg.jwt_secret, customer.is_admin)?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    Ok(auth_response_with_cookie(AuthResponse {
        token, customer: customer.to_response(Some(api_key)), refresh_token: Some(refresh_token_value),
    }))
}

// ── Login ───────────────────────────────────────────────────

pub async fn login(
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
            let _ = sqlx::query(
                "INSERT INTO ip_blocklist (ip_address, reason, auto_blocked, is_active, expires_at)
                 VALUES ($1, $2, true, true, NOW() + INTERVAL '24 hours')
                 ON CONFLICT (ip_address) DO UPDATE SET is_active = true, expires_at = NOW() + INTERVAL '24 hours', updated_at = NOW()"
            )
            .bind(&client_ip)
            .bind(format!("Auto-blocked: suspicious user agent"))
            .execute(&pool)
            .await;
            return Err(AppError::coded(ErrorCode::RequestBlocked));
        }
    }

    // ── Security: Brute force detection ──
    if let Some(detected) = crate::security_monitor::detect_brute_force(&pool, &req.email, &client_ip).await.unwrap_or(None) {
        let _ = crate::security_monitor::log_security_event(
            &pool, &detected.event_type, detected.severity.as_str(),
            None, Some(&req.email), Some(&client_ip), Some(user_agent), detected.details.clone(),
        ).await;
        if detected.should_block {
            // Don't auto-block admin IPs — they might be testing or have forgotten their password
            let is_admin = sqlx::query_scalar::<_, bool>("SELECT COALESCE(is_admin, false) FROM customers WHERE email = $1")
                .bind(&req.email).fetch_optional(&pool).await.unwrap_or(None).unwrap_or(false);
            if !is_admin {
                tracing::warn!("🔒 Login blocked — brute force detected: {} from {}", req.email, client_ip);
                let _ = sqlx::query(
                    "INSERT INTO ip_blocklist (ip_address, reason, auto_blocked, is_active, expires_at)
                     VALUES ($1, $2, true, true, NOW() + INTERVAL '24 hours')
                     ON CONFLICT (ip_address) DO UPDATE SET is_active = true, expires_at = NOW() + INTERVAL '24 hours', updated_at = NOW()"
                )
                .bind(&client_ip)
                .bind(format!("Auto-blocked: {} ({})", detected.event_type, req.email))
                .execute(&pool)
                .await;
                return Err(AppError::coded(ErrorCode::TooManyAttempts));
            } else {
                tracing::warn!("⚠️ Brute force detected for admin {} from {} — NOT blocking IP", req.email, client_ip);
            }
        }
    }

    // HS-038f: Timing attack mitigation — always verify password
    let customer = db::timed_query("auth_login_lookup", async {
        sqlx::query_as::<_, Customer>(&format!("{} WHERE email = $1", CUSTOMER_SELECT))
            .bind(&req.email).fetch_optional(&pool).await
    }).await?;

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

    let customer = customer.ok_or(AppError::coded(ErrorCode::InvalidCredentials))?;
    if !customer.is_active {
        let _ = crate::security_monitor::record_login_attempt(
            &pool, &req.email, &client_ip, Some(user_agent), false, Some("account_disabled"),
        ).await;
        // Record in Redis for fast threat detection
        crate::security::threat_detector::record_failed_login(&client_ip).await;
        let _ = crate::security_monitor::log_security_event(
            &pool, crate::security_monitor::event_types::DISABLED_ACCOUNT_LOGIN,
            "medium", Some(customer.id), Some(&req.email), Some(&client_ip), Some(user_agent),
            serde_json::json!({"reason": "Disabled account login attempt"}),
        ).await;
        return Err(AppError::coded(ErrorCode::AccountDisabled));
    }
    if !password_ok {
        let _ = crate::security_monitor::record_login_attempt(
            &pool, &req.email, &client_ip, Some(user_agent), false, Some("wrong_password"),
        ).await;
        // Record in Redis for fast threat detection
        crate::security::threat_detector::record_failed_login(&client_ip).await;
        return Err(AppError::coded(ErrorCode::InvalidCredentials));
    }

    let _ = crate::security_monitor::record_login_attempt(
        &pool, &req.email, &client_ip, Some(user_agent), true, None,
    ).await;

    // Notify about new device login (best-effort)
    let _ = crate::notifications::helpers::new_device_login(
        &pool, customer.id, &client_ip, user_agent
    ).await;

    // TODO: Email verification check — re-enable when email provider (Resend/Gmail) is configured
    // SSO users are auto-verified via domain_verified flag; password users need email verification
    // if !customer.email_verified {
    //     return Err(AppError::coded(ErrorCode::EmailNotVerified));
    // }

    // SSO enforcement check — only for users who have SSO attributes
    let has_sso_attributes = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM sso_user_attributes WHERE customer_id = $1)"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .unwrap_or(false);

    if has_sso_attributes {
        tracing::info!("🔒 SSO user {} — redirecting to SSO login", req.email);
        return Ok((HeaderMap::new(), Json(serde_json::json!({
            "requires_sso": true,
            "email": req.email,
            "message": "SSO required for this account."
        }))));
    }

    // 2FA check
    if customer.totp_enabled {
        let temp_token = jwt::generate_token_with_duration(
            customer.id, &customer.email, &customer.plan, &cfg.jwt_secret, Duration::minutes(5), customer.is_admin,
        )?;
        let mut headers = HeaderMap::new();
        headers.insert("set-cookie", axum::http::HeaderValue::from_static("hooksniff_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"));
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
