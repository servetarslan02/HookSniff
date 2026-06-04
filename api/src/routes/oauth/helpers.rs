use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::Customer;

/// OAuth state cookie name (short-lived, CSRF protection)
pub(crate) const OAUTH_STATE_COOKIE: &str = "hr_oauth_state";
/// OAuth PKCE code_verifier cookie name
pub(crate) const OAUTH_PKCE_COOKIE: &str = "hr_oauth_pkce";
/// OAuth state cookie max age (5 minutes)
pub(crate) const OAUTH_STATE_MAX_AGE: i64 = 300;

/// OAuth callback query parameters
#[derive(Debug, Deserialize)]
pub struct OAuthCallback {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

/// Generate a PKCE code_verifier (43-128 chars, [A-Z][a-z][0-9]-._~)
pub fn generate_pkce_verifier() -> String {
    use rand::RngExt;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let mut rng = rand::rng();
    (0..64)
        .map(|_| CHARSET[rng.random_range(0..CHARSET.len())] as char)
        .collect()
}

/// Compute PKCE code_challenge = BASE64URL(SHA256(code_verifier))
pub fn compute_pkce_challenge(verifier: &str) -> String {
    use sha2::Digest;
    let hash = sha2::Sha256::digest(verifier.as_bytes());
    base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, &hash)
}

/// Extract PKCE code_verifier from cookie.
pub fn extract_pkce_verifier(req: &axum::extract::Request) -> Option<String> {
    let cookie_header = req.headers().get("cookie").and_then(|v| v.to_str().ok()).unwrap_or("");
    cookie_header
        .split(';')
        .map(|c| c.trim())
        .find(|c| c.starts_with(&format!("{}=", OAUTH_PKCE_COOKIE)))
        .and_then(|c| c.split('=').nth(1))
        .map(|v| v.to_string())
}

/// Verify the OAuth state parameter matches the cookie (CSRF protection).
pub fn verify_oauth_state(req: &axum::extract::Request, expected_state: &str) -> Result<(), AppError> {
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

/// Clear the OAuth state cookie after successful verification.
pub fn clear_oauth_state_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        OAUTH_STATE_COOKIE
    )
}

pub fn clear_pkce_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        OAUTH_PKCE_COOKIE
    )
}

/// Create a refresh token in the database.
pub async fn create_refresh_token(pool: &PgPool, customer_id: Uuid) -> Result<String, AppError> {
    use chrono::{Duration, Utc};
    let token = crate::auth::jwt::generate_random_token();
    let token_hash = crate::auth::jwt::hash_token(&token);
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

/// Find existing customer by email or create a new one via OAuth
pub async fn find_or_create_oauth_customer(
    pool: &PgPool,
    email: &str,
    name: &Option<String>,
    provider: &str,
    avatar_url: Option<&str>,
) -> Result<Customer, AppError> {
    let existing = sqlx::query_as::<_, Customer>(&format!("{} WHERE email = $1", crate::routes::auth::CUSTOMER_SELECT))
        .bind(email)
        .fetch_optional(pool)
        .await?;

    if let Some(mut customer) = existing {
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
pub fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.bytes().zip(b.bytes()) {
        diff |= x ^ y;
    }
    diff == 0
}

/// GET /oauth/providers — List available OAuth providers
pub async fn list_providers() -> Json<serde_json::Value> {
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

#[cfg(test)]
mod tests {
    use super::*;

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
