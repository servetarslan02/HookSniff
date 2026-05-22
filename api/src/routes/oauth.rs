//! OAuth2 Social Login API
//!
//! Provides OAuth2 login via Google and GitHub.
//!
//! ## Endpoints
//!
//! - `GET /oauth/google` — Redirect to Google OAuth
//! - `GET /oauth/google/callback` — Google OAuth callback
//! - `GET /oauth/github` — Redirect to GitHub OAuth
//! - `GET /oauth/github/callback` — GitHub OAuth callback
//! - `GET /oauth/providers` — List available OAuth providers
//!
//! ## PKCE (Proof Key for Code Exchange) — IMPLEMENTED
//!
//! Both Google and GitHub OAuth flows now use PKCE for defense-in-depth:
//!
//! 1. `code_verifier` (64 char random string) generated on login
//! 2. `code_challenge = BASE64URL(SHA256(code_verifier))` sent to IdP
//! 3. `code_verifier` stored in HttpOnly cookie (`hr_oauth_pkce`)
//! 4. `code_verifier` sent in token exchange POST body
//!
//! This protects against authorization code interception attacks.
//!
//! ## Configuration
//!
//! Set these environment variables:
//!
//! - `GOOGLE_CLIENT_ID` — Google OAuth client ID
//! - `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
//! - `GITHUB_CLIENT_ID` — GitHub OAuth client ID
//! - `GITHUB_CLIENT_SECRET` — GitHub OAuth client secret
//! - `OAUTH_REDIRECT_BASE` — Base URL for OAuth callbacks (e.g. https://hooksniff-api.run.app)

use axum::{
    extract::{Extension, Query},
    http::HeaderMap,
    response::Redirect,
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::error::ErrorCode;
use crate::error::AppError;
use crate::middleware::{
    create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key,
};
use crate::models::customer::Customer;

/// OAuth state cookie name (short-lived, CSRF protection)
const OAUTH_STATE_COOKIE: &str = "hr_oauth_state";
/// OAuth PKCE code_verifier cookie name
const OAUTH_PKCE_COOKIE: &str = "hr_oauth_pkce";
/// OAuth state cookie max age (5 minutes)
const OAUTH_STATE_MAX_AGE: i64 = 300;

/// Generate a PKCE code_verifier (43-128 chars, [A-Z][a-z][0-9]-._~)
fn generate_pkce_verifier() -> String {
    use rand::RngExt;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let mut rng = rand::rng();
    (0..64)
        .map(|_| CHARSET[rng.random_range(0..CHARSET.len())] as char)
        .collect()
}

/// Compute PKCE code_challenge = BASE64URL(SHA256(code_verifier))
fn compute_pkce_challenge(verifier: &str) -> String {
    use sha2::Digest;
    let hash = sha2::Sha256::digest(verifier.as_bytes());
    base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, &hash)
}

pub fn router() -> Router {
    Router::new()
        .route("/providers", get(list_providers))
        .route("/google", get(google_login))
        .route("/google/callback", get(google_callback))
        .route("/github", get(github_login))
        .route("/github/callback", get(github_callback))
}

/// OAuth callback query parameters
#[derive(Debug, Deserialize)]
pub struct OAuthCallback {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

/// GET /oauth/providers — List available OAuth providers
async fn list_providers() -> Json<serde_json::Value> {
    let google_available = std::env::var("GOOGLE_CLIENT_ID").is_ok();
    let github_available = std::env::var("GITHUB_CLIENT_ID").is_ok();

    Json(serde_json::json!({
        "providers": [
            {
                "name": "google",
                "available": google_available,
                "url": "/v1/oauth/google",
                "icon": "https://developers.google.com/identity/images/g-logo.png",
            },
            {
                "name": "github",
                "available": github_available,
                "url": "/v1/oauth/github",
                "icon": "https://github.githubassets.com/favicons/favicon.svg",
            },
        ]
    }))
}

/// GET /oauth/google — Redirect to Google OAuth consent screen
async fn google_login(
    Extension(_cfg): Extension<Config>,
) -> Result<impl axum::response::IntoResponse, AppError> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GoogleOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string());

    let redirect_uri = format!("{}/v1/oauth/google/callback", redirect_base);
    let state = uuid::Uuid::new_v4().to_string();

    // PKCE: generate code_verifier and code_challenge
    let pkce_verifier = generate_pkce_verifier();
    let pkce_challenge = compute_pkce_challenge(&pkce_verifier);

    let url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile&state={}&access_type=offline&code_challenge={}&code_challenge_method=S256",
        client_id,
        urlencoding::encode(&redirect_uri),
        state,
        pkce_challenge
    );

    // Save state + PKCE verifier in short-lived cookies
    let state_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_STATE_COOKIE, state, OAUTH_STATE_MAX_AGE
    );
    let pkce_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_PKCE_COOKIE, pkce_verifier, OAUTH_STATE_MAX_AGE
    );
    let mut headers = HeaderMap::new();
    headers.insert(
        "set-cookie",
        axum::http::HeaderValue::from_str(&state_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&pkce_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.insert(
        "location",
        axum::http::HeaderValue::from_str(&url)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")),
    );
    Ok((headers, Redirect::temporary(&url)))
}

/// GET /oauth/google/callback — Handle Google OAuth callback
async fn google_callback(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Query(params): Query<OAuthCallback>,
    req: axum::extract::Request,
) -> Result<impl axum::response::IntoResponse, AppError> {
    if let Some(_error) = params.error {
        let url = "/login?error=oauth_denied";
        return Ok((HeaderMap::new(), Redirect::temporary(url)));
    }

    let code = params
        .code
        .ok_or_else(|| AppError::coded(ErrorCode::OidcMissingCode))?;

    // Verify CSRF state parameter
    let expected_state = params
        .state
        .ok_or_else(|| AppError::coded(ErrorCode::OidcMissingState))?;
    verify_oauth_state(&req, &expected_state)?;

    // Extract PKCE code_verifier from cookie
    let pkce_verifier = extract_pkce_verifier(&req);

    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GoogleOauthNotConfigured))?;

    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
        .map_err(|_| AppError::coded(ErrorCode::GoogleOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string());
    let redirect_uri = format!("{}/v1/oauth/google/callback", redirect_base);

    // Exchange code for token (with PKCE verifier if available)
    let token_response =
        exchange_google_code(&code, &client_id, &client_secret, &redirect_uri, pkce_verifier.as_deref()).await?;

    // Get user info
    let user_info = get_google_user_info(&token_response.access_token).await?;

    // Find or create customer
    let customer =
        find_or_create_oauth_customer(&pool, &user_info.email, &user_info.name, "google", user_info.picture.as_deref()).await?;

    // Generate JWT (access + refresh)
    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    // Set HttpOnly auth + refresh cookies and redirect
    let app_url = cfg
        .app_url
        .as_deref()
        .unwrap_or("https://hooksniff.vercel.app");
    let auth_cookie = create_auth_cookie(&token, 900);
    let refresh_cookie = create_refresh_token_cookie(&refresh_token_value, 30 * 86400);
    let state_clear = clear_oauth_state_cookie();
    let pkce_clear = clear_pkce_cookie();

    let mut headers = HeaderMap::new();
    headers.insert(
        "set-cookie",
        axum::http::HeaderValue::from_str(&auth_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&refresh_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&state_clear)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&pkce_clear)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );

    let redirect_url = format!("{}/auth/callback?token={}&refresh={}", app_url, urlencoding::encode(&token), urlencoding::encode(&refresh_token_value));
    headers.insert(
        "location",
        axum::http::HeaderValue::from_str(&redirect_url)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")),
    );
    Ok((headers, axum::response::Redirect::temporary(&redirect_url)))
}

/// GET /oauth/github — Redirect to GitHub OAuth consent screen
async fn github_login() -> Result<impl axum::response::IntoResponse, AppError> {
    let client_id = std::env::var("GITHUB_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GithubOauthNotConfigured))?;

    let redirect_base = std::env::var("OAUTH_REDIRECT_BASE")
        .unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string());
    let redirect_uri = format!("{}/v1/oauth/github/callback", redirect_base);
    let state = uuid::Uuid::new_v4().to_string();

    // PKCE: generate code_verifier and code_challenge
    let pkce_verifier = generate_pkce_verifier();
    let pkce_challenge = compute_pkce_challenge(&pkce_verifier);

    let url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope=user:email&state={}&code_challenge={}&code_challenge_method=S256",
        client_id,
        urlencoding::encode(&redirect_uri),
        state,
        pkce_challenge
    );

    // Save state + PKCE verifier in short-lived cookies
    let state_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_STATE_COOKIE, state, OAUTH_STATE_MAX_AGE
    );
    let pkce_cookie = format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        OAUTH_PKCE_COOKIE, pkce_verifier, OAUTH_STATE_MAX_AGE
    );
    let mut headers = HeaderMap::new();
    headers.insert(
        "set-cookie",
        axum::http::HeaderValue::from_str(&state_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&pkce_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.insert(
        "location",
        axum::http::HeaderValue::from_str(&url)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")),
    );
    Ok((headers, Redirect::temporary(&url)))
}

/// GET /oauth/github/callback — Handle GitHub OAuth callback
async fn github_callback(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Query(params): Query<OAuthCallback>,
    req: axum::extract::Request,
) -> Result<impl axum::response::IntoResponse, AppError> {
    if let Some(_error) = params.error {
        let url = "/login?error=oauth_denied";
        return Ok((HeaderMap::new(), Redirect::temporary(url)));
    }

    let code = params
        .code
        .ok_or_else(|| AppError::coded(ErrorCode::OidcMissingCode))?;

    // Verify CSRF state parameter
    let expected_state = params
        .state
        .ok_or_else(|| AppError::coded(ErrorCode::OidcMissingState))?;
    verify_oauth_state(&req, &expected_state)?;

    // Extract PKCE code_verifier from cookie
    let pkce_verifier = extract_pkce_verifier(&req);

    let client_id = std::env::var("GITHUB_CLIENT_ID")
        .map_err(|_| AppError::coded(ErrorCode::GithubOauthNotConfigured))?;

    let client_secret = std::env::var("GITHUB_CLIENT_SECRET")
        .map_err(|_| AppError::coded(ErrorCode::GithubOauthNotConfigured))?;

    // Exchange code for token (with PKCE verifier if available)
    let access_token = exchange_github_code(&code, &client_id, &client_secret, pkce_verifier.as_deref()).await?;

    // Get user info
    let user_info = get_github_user_info(&access_token).await?;

    // Find or create customer
    let customer =
        find_or_create_oauth_customer(&pool, &user_info.email, &user_info.name, "github", user_info.avatar_url.as_deref()).await?;

    // Generate JWT (access + refresh)
    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;
    let refresh_token_value = create_refresh_token(&pool, customer.id).await?;

    // Set HttpOnly auth + refresh cookies and redirect
    let app_url = cfg
        .app_url
        .as_deref()
        .unwrap_or("https://hooksniff.vercel.app");
    let auth_cookie = create_auth_cookie(&token, 900);
    let refresh_cookie = create_refresh_token_cookie(&refresh_token_value, 30 * 86400);
    let state_clear = clear_oauth_state_cookie();
    let pkce_clear = clear_pkce_cookie();

    let mut headers = HeaderMap::new();
    headers.insert(
        "set-cookie",
        axum::http::HeaderValue::from_str(&auth_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&refresh_cookie)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&state_clear)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );
    headers.append(
        "set-cookie",
        axum::http::HeaderValue::from_str(&pkce_clear)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("")),
    );

    let redirect_url = format!("{}/auth/callback?token={}&refresh={}", app_url, urlencoding::encode(&token), urlencoding::encode(&refresh_token_value));
    headers.insert(
        "location",
        axum::http::HeaderValue::from_str(&redirect_url)
            .unwrap_or_else(|_| axum::http::HeaderValue::from_static("/")),
    );
    Ok((headers, axum::response::Redirect::temporary(&redirect_url)))
}

// ── OAuth helpers ────────────────────────────────────────────

use crate::auth::jwt;

/// Extract PKCE code_verifier from cookie.
fn extract_pkce_verifier(req: &axum::extract::Request) -> Option<String> {
    let cookie_header = req.headers().get("cookie").and_then(|v| v.to_str().ok()).unwrap_or("");
    cookie_header
        .split(';')
        .map(|c| c.trim())
        .find(|c| c.starts_with(&format!("{}=", OAUTH_PKCE_COOKIE)))
        .and_then(|c| c.split('=').nth(1))
        .map(|v| v.to_string())
}

/// Verify the OAuth state parameter matches the cookie (CSRF protection).
fn verify_oauth_state(req: &axum::extract::Request, expected_state: &str) -> Result<(), AppError> {
    let cookie_header = req
        .headers()
        .get("cookie")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let state_from_cookie = cookie_header
        .split(';')
        .map(|c| c.trim())
        .find(|c| c.starts_with(&format!("{}=", OAUTH_STATE_COOKIE)))
        .and_then(|c| c.split('=').nth(1));

    match state_from_cookie {
        Some(cookie_state) if constant_time_eq(cookie_state, expected_state) => Ok(()),
        _ => {
            tracing::warn!(
                "OAuth state mismatch: expected={}, cookie={:?}",
                expected_state,
                state_from_cookie
            );
            Err(AppError::BadRequest(
                "Invalid OAuth state — possible CSRF attack. Please try again.".into(),
            ))
        }
    }
}

/// Clear the OAuth state and PKCE cookies after successful verification.
fn clear_oauth_state_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        OAUTH_STATE_COOKIE
    )
}

fn clear_pkce_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        OAUTH_PKCE_COOKIE
    )
}

/// Create a refresh token in the database (same logic as auth.rs).
async fn create_refresh_token(pool: &PgPool, customer_id: Uuid) -> Result<String, AppError> {
    use chrono::{Duration, Utc};
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

struct GoogleTokenResponse {
    access_token: String,
}

struct GoogleUserInfo {
    email: String,
    name: Option<String>,
    picture: Option<String>,
}

struct GitHubUserInfo {
    email: String,
    name: Option<String>,
    avatar_url: Option<String>,
}

async fn exchange_google_code(
    code: &str,
    client_id: &str,
    client_secret: &str,
    redirect_uri: &str,
    code_verifier: Option<&str>,
) -> Result<GoogleTokenResponse, AppError> {
    let client = crate::http_client::get_client().clone();

    let mut params = vec![
        ("code", code.to_string()),
        ("client_id", client_id.to_string()),
        ("client_secret", client_secret.to_string()),
        ("redirect_uri", redirect_uri.to_string()),
        ("grant_type", "authorization_code".to_string()),
    ];
    if let Some(verifier) = code_verifier {
        params.push(("code_verifier", verifier.to_string()));
    }

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Google token exchange failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!(
            "Google token exchange failed: {}",
            body
        )));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse Google response: {}", e))
    })?;

    let access_token = json["access_token"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No access_token in Google response")))?
        .to_string();

    Ok(GoogleTokenResponse { access_token })
}

async fn get_google_user_info(access_token: &str) -> Result<GoogleUserInfo, AppError> {
    let client = crate::http_client::get_client().clone();

    let resp = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Google userinfo failed: {}", e)))?;

    if !resp.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "Google userinfo request failed"
        )));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse Google userinfo: {}", e))
    })?;

    let email = json["email"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No email in Google userinfo")))?
        .to_string();

    let name = json["name"].as_str().map(|s| s.to_string());
    let picture = json["picture"].as_str().map(|s| s.to_string());

    Ok(GoogleUserInfo { email, name, picture })
}

async fn exchange_github_code(
    code: &str,
    client_id: &str,
    client_secret: &str,
    code_verifier: Option<&str>,
) -> Result<String, AppError> {
    let client = crate::http_client::get_client().clone();

    let mut params = vec![
        ("code", code.to_string()),
        ("client_id", client_id.to_string()),
        ("client_secret", client_secret.to_string()),
    ];
    if let Some(verifier) = code_verifier {
        params.push(("code_verifier", verifier.to_string()));
    }

    let resp = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&params)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("GitHub token exchange failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!(
            "GitHub token exchange failed: {}",
            body
        )));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse GitHub response: {}", e))
    })?;

    if let Some(error) = json["error"].as_str() {
        let desc = json["error_description"].as_str().unwrap_or("unknown");
        return Err(AppError::Internal(anyhow::anyhow!(
            "GitHub OAuth error: {} - {}",
            error,
            desc
        )));
    }

    json["access_token"]
        .as_str()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No access_token in GitHub response")))
        .map(|s| s.to_string())
}

async fn get_github_user_info(access_token: &str) -> Result<GitHubUserInfo, AppError> {
    let client = crate::http_client::get_client().clone();

    // First try to get email from /user
    let resp = client
        .get("https://api.github.com/user")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", "HookSniff")
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("GitHub user info failed: {}", e)))?;

    if !resp.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "GitHub user info request failed"
        )));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse GitHub user info: {}", e))
    })?;

    let mut email = json["email"].as_str().map(|s| s.to_string());
    let name = json["name"].as_str().map(|s| s.to_string());
    let avatar_url = json["avatar_url"].as_str().map(|s| s.to_string());

    // If email is null, try /user/emails
    if email.is_none() {
        let emails_resp = client
            .get("https://api.github.com/user/emails")
            .header("Authorization", format!("Bearer {}", access_token))
            .header("User-Agent", "HookSniff")
            .send()
            .await;

        if let Ok(resp) = emails_resp {
            if let Ok(emails) = resp.json::<serde_json::Value>().await {
                if let Some(arr) = emails.as_array() {
                    // Find primary email
                    for e in arr {
                        if e["primary"].as_bool().unwrap_or(false) {
                            email = e["email"].as_str().map(|s| s.to_string());
                            break;
                        }
                    }
                    // Fallback to first verified email
                    if email.is_none() {
                        for e in arr {
                            if e["verified"].as_bool().unwrap_or(false) {
                                email = e["email"].as_str().map(|s| s.to_string());
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    let email = email.ok_or_else(|| {
        AppError::BadRequest(
            "Could not get email from GitHub. Make sure your email is public or grant email permission.".into(),
        )
    })?;

    Ok(GitHubUserInfo { email, name, avatar_url })
}

/// Find existing customer by email or create a new one via OAuth
async fn find_or_create_oauth_customer(
    pool: &PgPool,
    email: &str,
    name: &Option<String>,
    provider: &str,
    avatar_url: Option<&str>,
) -> Result<Customer, AppError> {
    // Try to find existing customer
    let existing = sqlx::query_as::<_, Customer>(&format!("{} WHERE email = $1", crate::routes::auth::CUSTOMER_SELECT))
        .bind(email)
        .fetch_optional(pool)
        .await?;

    if let Some(mut customer) = existing {
        // Update avatar if we got one and customer doesn't have one yet
        if avatar_url.is_some() && customer.avatar_url.is_none() {
            sqlx::query("UPDATE customers SET avatar_url = $1 WHERE id = $2")
                .bind(avatar_url)
                .bind(customer.id)
                .execute(pool)
                .await?;
            customer.avatar_url = avatar_url.map(|s| s.to_string());
        }
        tracing::info!("✅ OAuth login ({}): {}", provider, email);
        return Ok(customer);
    }

    // Create new customer
    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, name, is_active, email_verified, avatar_url)
         VALUES ($1, $2, $3, $4, true, true, $5)
         RETURNING *"
    )
    .bind(email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(name)
    .bind(avatar_url)
    .fetch_one(pool)
    .await?;

    tracing::info!("✅ New OAuth customer created ({}): {}", provider, email);

    Ok(customer)
}

/// Constant-time string comparison to prevent timing attacks.
fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.bytes().zip(b.bytes()) {
        diff |= x ^ y;
    }
    diff == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_oauth_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_oauth_callback_query() {
        let json = r#"{"code":"abc123","state":"xyz"}"#;
        let params: OAuthCallback = serde_json::from_str(json).unwrap();
        assert_eq!(params.code.unwrap(), "abc123");
        assert_eq!(params.state.unwrap(), "xyz");
    }

    #[test]
    fn test_oauth_callback_error() {
        let json = r#"{"error":"access_denied"}"#;
        let params: OAuthCallback = serde_json::from_str(json).unwrap();
        assert_eq!(params.error.unwrap(), "access_denied");
        assert!(params.code.is_none());
    }
}
