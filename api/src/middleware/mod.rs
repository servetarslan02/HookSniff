pub mod idempotency;
pub mod webhook_verify;

use axum::{extract::Request, http::header::AUTHORIZATION, middleware::Next, response::Response};
use sqlx::PgPool;
use uuid::Uuid;

const AUTH_COOKIE_NAME: &str = "hooksniff_token";
const REFRESH_COOKIE_NAME: &str = "hooksniff_refresh";

use crate::error::AppError;
use crate::models::customer::Customer;

/// Indicates whether the current request was made with a test API key (hr_test_*).
/// Handlers can check this to mark deliveries as test and skip real delivery.
#[derive(Debug, Clone, Copy)]
pub struct IsTestKey(pub bool);

/// Middleware that assigns a unique request ID to every request and adds it to tracing context
pub async fn request_id_middleware(mut req: Request, next: Next) -> Response {
    let request_id = req
        .headers()
        .get("X-Request-ID")
        .and_then(|v| v.to_str().ok().map(|s| s.to_string()))
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    // Insert request ID into extensions for downstream handlers
    req.extensions_mut().insert(request_id.clone());

    // Add request ID to tracing span
    let span = tracing::info_span!("request", request_id = %request_id);
    let _guard = span.enter();

    let mut response = next.run(req).await;

    // Add request ID to response headers
    response.headers_mut().insert(
        "X-Request-ID",
        request_id.parse().expect("valid header value"),
    );

    response
}

/// Authenticate requests via API key (hr_live_* or hr_test_*) or JWT token.
///
/// Supports two authentication methods:
/// 1. API key: `Authorization: Bearer hr_live_...` or `hr_test_...` — looks up `api_key_hash` in customers table
/// 2. JWT token: `Authorization: Bearer eyJ...` — verifies JWT and loads customer by `sub` claim
///
/// Test keys (hr_test_*) are marked and can be checked downstream to skip real delivery.
/// Extract token from request: first try Authorization header, then try cookie.
/// Skips non-token Authorization values (e.g. "Bearer cookie" from frontend cookie mode).
fn extract_token(req: &Request) -> Option<String> {
    // Try Authorization header first — but only if it looks like a real token
    if let Some(auth_header) = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
    {
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            let token = token.trim();
            // Skip placeholder values like "cookie", "null", "undefined"
            if !token.is_empty() && token != "cookie" && token != "null" && token != "undefined" {
                return Some(token.to_string());
            }
        }
    }
    // Try cookie (HttpOnly auth cookie)
    if let Some(cookie_header) = req.headers().get("cookie").and_then(|v| v.to_str().ok()) {
        for cookie in cookie_header.split(';') {
            let cookie = cookie.trim();
            if let Some(value) = cookie.strip_prefix(&format!("{}=", AUTH_COOKIE_NAME)) {
                if !value.is_empty() {
                    return Some(value.to_string());
                }
            }
        }
    }
    None
}

pub async fn auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    cfg: axum::extract::Extension<crate::config::Config>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(&req).ok_or(AppError::Unauthorized)?;

    let is_test = token.starts_with("hr_test_");
    let customer = if token.starts_with("hr_live_") || token.starts_with("hr_test_") {
        // API key authentication — lookup by prefix, then verify full key against Argon2 hash
        let prefix = &token[..15.min(token.len())];
        let candidates =
            sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE api_key_prefix = $1")
                .bind(prefix)
                .fetch_all(&*pool)
                .await?;

        // Also check api_keys table for additional keys
        let api_key_candidates: Vec<(String,)> = sqlx::query_as(
            "SELECT api_key_hash FROM api_keys WHERE api_key_prefix = $1 AND is_active = true",
        )
        .bind(prefix)
        .fetch_all(&*pool)
        .await?;

        // Try customers table first (legacy primary key)
        let mut found: Option<Customer> = None;
        for c in &candidates {
            if verify_api_key(&token, &c.api_key_hash) {
                found = Some(c.clone());
                break;
            }
        }

        // If not found in customers, try api_keys table
        if found.is_none() {
            for (hash,) in &api_key_candidates {
                if verify_api_key(&token, hash) {
                    // Found in api_keys — load the owning customer
                    // We need the customer_id from the api_keys table
                    let owner: Option<Customer> = sqlx::query_as(
                        "SELECT c.* FROM customers c INNER JOIN api_keys ak ON ak.customer_id = c.id WHERE ak.api_key_prefix = $1 AND ak.api_key_hash = $2"
                    )
                    .bind(prefix)
                    .bind(hash)
                    .fetch_optional(&*pool)
                    .await?;
                    if let Some(c) = owner {
                        found = Some(c);
                    }
                    break;
                }
            }
        }

        found.ok_or(AppError::Unauthorized)?
    } else {
        // JWT token authentication
        let claims = crate::auth::jwt::verify_token(&token, &cfg.jwt_secret)?;
        sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE id = $1")
            .bind(claims.sub)
            .fetch_optional(&*pool)
            .await?
            .ok_or(AppError::Unauthorized)?
    };

    req.extensions_mut().insert(customer);
    req.extensions_mut().insert(IsTestKey(is_test));
    Ok(next.run(req).await)
}

/// JWT-based auth middleware for dashboard routes
pub async fn jwt_auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    cfg: axum::extract::Extension<crate::config::Config>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(&req).ok_or(AppError::Unauthorized)?;

    let claims = crate::auth::jwt::verify_token(&token, &cfg.jwt_secret)?;

    let customer = sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE id = $1")
        .bind(claims.sub)
        .fetch_optional(&*pool)
        .await?
        .ok_or(AppError::Unauthorized)?;

    req.extensions_mut().insert(customer);
    Ok(next.run(req).await)
}

/// Admin-only middleware — must be layered AFTER auth_middleware.
/// Checks that the authenticated customer has `is_admin: true`.
pub async fn admin_middleware(req: Request, next: Next) -> Result<Response, AppError> {
    let customer = req
        .extensions()
        .get::<Customer>()
        .ok_or(AppError::Unauthorized)?;

    if !customer.is_admin {
        return Err(AppError::Forbidden("Admin access required".into()));
    }

    Ok(next.run(req).await)
}

/// Hash an API key using Argon2id with a random salt.
/// The salt is embedded in the returned hash string (PHC format).
pub fn hash_api_key(key: &str) -> String {
    use argon2::password_hash::SaltString;
    use argon2::{Argon2, PasswordHasher};
    use rand::rngs::OsRng;
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(key.as_bytes(), &salt)
        .expect("Argon2 hashing failed")
        .to_string()
}

/// Verify an API key against a stored Argon2id hash.
pub fn verify_api_key(key: &str, hash: &str) -> bool {
    use argon2::password_hash::PasswordHash;
    use argon2::{Argon2, PasswordVerifier};
    let parsed_hash = match PasswordHash::new(hash) {
        Ok(h) => h,
        Err(_) => return false,
    };
    Argon2::default()
        .verify_password(key.as_bytes(), &parsed_hash)
        .is_ok()
}

pub fn generate_api_key() -> String {
    use rand::RngCore;
    let mut bytes = [0u8; 32];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    format!("hr_live_{}", hex::encode(bytes))
}

/// Generate a test-mode API key (hr_test_*).
/// Test keys deliver to a mock endpoint instead of real URLs.
pub fn generate_test_api_key() -> String {
    use rand::RngCore;
    let mut bytes = [0u8; 32];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    format!("hr_test_{}", hex::encode(bytes))
}

/// Create a Set-Cookie header value for the auth token.
/// HttpOnly, Secure, SameSite=None for cross-origin support.
pub fn create_auth_cookie(token: &str, max_age_secs: i64) -> String {
    format!(
        "{}={}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age={}",
        AUTH_COOKIE_NAME, token, max_age_secs
    )
}

/// Create a Set-Cookie header value to clear the auth cookie.
pub fn clear_auth_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
        AUTH_COOKIE_NAME
    )
}

/// Create a Set-Cookie header value for the refresh token.
/// HttpOnly, Secure, SameSite=None, 30-day expiry.
pub fn create_refresh_token_cookie(token: &str, max_age_secs: i64) -> String {
    format!(
        "{}={}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age={}",
        REFRESH_COOKIE_NAME, token, max_age_secs
    )
}

/// Create a Set-Cookie header value to clear the refresh token cookie.
pub fn clear_refresh_token_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
        REFRESH_COOKIE_NAME
    )
}

/// Extract refresh token from cookie header.
pub fn extract_refresh_token(req: &axum::extract::Request) -> Option<String> {
    if let Some(cookie_header) = req.headers().get("cookie").and_then(|v| v.to_str().ok()) {
        for cookie in cookie_header.split(';') {
            let cookie = cookie.trim();
            if let Some(value) = cookie.strip_prefix(&format!("{}=", REFRESH_COOKIE_NAME)) {
                return Some(value.to_string());
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_key_generation() {
        let key = generate_api_key();
        assert!(key.starts_with("hr_live_"));
    }

    #[test]
    fn test_test_api_key_generation() {
        let key = generate_test_api_key();
        assert!(key.starts_with("hr_test_"));
    }

    #[test]
    fn test_api_key_hashing_and_verification() {
        let key = "hr_live_test123";
        let hash = hash_api_key(key);
        assert!(verify_api_key(key, &hash));
        assert!(!verify_api_key("hr_live_wrong", &hash));
    }
}
