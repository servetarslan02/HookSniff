pub mod idempotency;
pub mod webhook_verify;

use axum::{extract::Request, http::header::AUTHORIZATION, middleware::Next, response::Response};
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use uuid::Uuid;

const AUTH_COOKIE_NAME: &str = "hooksniff_token";
const REFRESH_COOKIE_NAME: &str = "hooksniff_refresh";
const AUTH_CACHE_TTL: Duration = Duration::from_secs(30);

use crate::error::AppError;
use crate::models::customer::Customer;

/// Simple in-memory cache for auth lookups (prefix → (customer, expiry))
struct AuthCache {
    entries: HashMap<String, (Customer, Instant)>,
}

impl AuthCache {
    fn new() -> Self {
        Self {
            entries: HashMap::new(),
        }
    }

    fn get(&self, prefix: &str) -> Option<Customer> {
        self.entries.get(prefix).and_then(|(customer, expiry)| {
            if Instant::now() < *expiry {
                Some(customer.clone())
            } else {
                None
            }
        })
    }

    fn insert(&mut self, prefix: String, customer: Customer) {
        self.entries
            .insert(prefix, (customer, Instant::now() + AUTH_CACHE_TTL));
    }

    #[allow(dead_code)] // Cache eviction utility; will be called by periodic cleanup task
    fn cleanup(&mut self) {
        self.entries
            .retain(|_, (_, expiry)| Instant::now() < *expiry);
    }
}

static AUTH_CACHE: once_cell::sync::Lazy<Mutex<AuthCache>> =
    once_cell::sync::Lazy::new(|| Mutex::new(AuthCache::new()));

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
        // API key authentication — check cache first, then DB
        let prefix = token[..15.min(token.len())].to_string();

        // HS-038i: Check cache WITHOUT holding lock across .await
        let cached = {
            let cache = AUTH_CACHE.lock().unwrap();
            cache.get(&prefix)
        };

        if let Some(c) = cached {
            c
        } else {
            // Cache miss — query DB (no lock held during async operations)
            let candidates =
                sqlx::query_as::<_, Customer>("SELECT * FROM customers WHERE api_key_prefix = $1")
                    .bind(&prefix)
                    .fetch_all(&*pool)
                    .await?;

            // Also check api_keys table for additional keys
            let api_key_candidates: Vec<(String,)> = sqlx::query_as(
                "SELECT api_key_hash FROM api_keys WHERE api_key_prefix = $1 AND is_active = true",
            )
            .bind(&prefix)
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
                        let owner: Option<Customer> = sqlx::query_as(
                            "SELECT c.* FROM customers c INNER JOIN api_keys ak ON ak.customer_id = c.id WHERE ak.api_key_prefix = $1 AND ak.api_key_hash = $2"
                        )
                        .bind(&prefix)
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

            let customer = found.ok_or(AppError::Unauthorized)?;

            // Cache the result (lock acquired only for insert, not held across .await)
            if let Ok(mut cache) = AUTH_CACHE.lock() {
                cache.insert(prefix, customer.clone());
            }

            customer
        }
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
    use argon2::password_hash::rand_core::OsRng;
    use argon2::password_hash::SaltString;
    use argon2::{Argon2, PasswordHasher};
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
    use rand::TryRng;
    let mut bytes = [0u8; 32];
    rand::rngs::SysRng
        .try_fill_bytes(&mut bytes)
        .expect("SysRng fill failed");
    format!("hr_live_{}", hex::encode(bytes))
}

/// Generate a test-mode API key (hr_test_*).
/// Test keys deliver to a mock endpoint instead of real URLs.
pub fn generate_test_api_key() -> String {
    use rand::TryRng;
    let mut bytes = [0u8; 32];
    rand::rngs::SysRng
        .try_fill_bytes(&mut bytes)
        .expect("SysRng fill failed");
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

    // ── generate_api_key ──────────────────────────────────────

    #[test]
    fn test_api_key_generation() {
        let key = generate_api_key();
        assert!(key.starts_with("hr_live_"));
    }

    #[test]
    fn test_api_key_unique() {
        let k1 = generate_api_key();
        let k2 = generate_api_key();
        assert_ne!(k1, k2);
    }

    #[test]
    fn test_api_key_length() {
        let key = generate_api_key();
        // hr_live_ (8) + 48 hex chars = 56
        assert!(key.len() >= 50);
    }

    // ── generate_test_api_key ─────────────────────────────────

    #[test]
    fn test_test_api_key_generation() {
        let key = generate_test_api_key();
        assert!(key.starts_with("hr_test_"));
    }

    #[test]
    fn test_test_api_key_unique() {
        let k1 = generate_test_api_key();
        let k2 = generate_test_api_key();
        assert_ne!(k1, k2);
    }

    // ── hash_api_key / verify_api_key ─────────────────────────

    #[test]
    fn test_api_key_hashing_and_verification() {
        let key = "hr_live_test123";
        let hash = hash_api_key(key);
        assert!(verify_api_key(key, &hash));
        assert!(!verify_api_key("hr_live_wrong", &hash));
    }

    #[test]
    fn test_api_key_hash_deterministic() {
        // Argon2 uses random salts, so hashes are NOT deterministic
        let key = "hr_live_same";
        let h1 = hash_api_key(key);
        let h2 = hash_api_key(key);
        // Both should still verify against the original key
        assert!(verify_api_key(key, &h1));
        assert!(verify_api_key(key, &h2));
    }

    #[test]
    fn test_api_key_different_keys_different_hashes() {
        let h1 = hash_api_key("hr_live_aaa");
        let h2 = hash_api_key("hr_live_bbb");
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_api_key_empty_key() {
        let hash = hash_api_key("");
        assert!(verify_api_key("", &hash));
        assert!(!verify_api_key("not-empty", &hash));
    }

    #[test]
    fn test_api_key_verify_wrong_hash_format() {
        assert!(!verify_api_key("key", "not-a-valid-hash"));
    }

    // ── cookie functions ──────────────────────────────────────

    #[test]
    fn test_create_auth_cookie_contains_token() {
        let cookie = create_auth_cookie("my-token", 3600);
        assert!(cookie.contains("my-token"));
        assert!(cookie.contains("hooksniff_token"));
        assert!(cookie.contains("HttpOnly"));
    }

    #[test]
    fn test_create_auth_cookie_max_age() {
        let cookie = create_auth_cookie("tok", 7200);
        assert!(cookie.contains("Max-Age=7200"));
    }

    #[test]
    fn test_clear_auth_cookie() {
        let cookie = clear_auth_cookie();
        assert!(cookie.contains("hooksniff_token"));
        assert!(cookie.contains("Max-Age=0"));
    }

    #[test]
    fn test_create_refresh_token_cookie() {
        let cookie = create_refresh_token_cookie("refresh-tok", 86400);
        assert!(cookie.contains("refresh-tok"));
        assert!(cookie.contains("hooksniff_refresh"));
        assert!(cookie.contains("HttpOnly"));
    }

    #[test]
    fn test_clear_refresh_token_cookie() {
        let cookie = clear_refresh_token_cookie();
        assert!(cookie.contains("hooksniff_refresh"));
        assert!(cookie.contains("Max-Age=0"));
    }

    #[test]
    fn test_auth_cookie_is_secure() {
        let cookie = create_auth_cookie("tok", 3600);
        assert!(cookie.contains("Secure"));
        assert!(cookie.contains("SameSite"));
    }

    // ── IsTestKey ─────────────────────────────────────────────

    #[test]
    fn test_is_test_key_true() {
        let key = IsTestKey(true);
        assert!(key.0);
    }

    #[test]
    fn test_is_test_key_false() {
        let key = IsTestKey(false);
        assert!(!key.0);
    }

    // ── extract_refresh_token ─────────────────────────────────

    #[test]
    fn test_extract_refresh_token_none_when_no_cookie() {
        let req = axum::extract::Request::builder()
            .uri("/")
            .body(axum::body::Body::empty())
            .unwrap();
        assert!(extract_refresh_token(&req).is_none());
    }

    // ── Cookie name constants ─────────────────────────────────

    #[test]
    fn test_auth_cookie_name() {
        assert_eq!(AUTH_COOKIE_NAME, "hooksniff_token");
    }

    #[test]
    fn test_refresh_cookie_name() {
        assert_eq!(REFRESH_COOKIE_NAME, "hooksniff_refresh");
    }

    // ── Cookie format edge cases ──────────────────────────────

    #[test]
    fn test_create_auth_cookie_zero_max_age() {
        let cookie = create_auth_cookie("tok", 0);
        assert!(cookie.contains("Max-Age=0"));
    }

    #[test]
    fn test_create_refresh_token_cookie_format() {
        let cookie = create_refresh_token_cookie("rt_abc", 2592000);
        assert!(cookie.starts_with("hooksniff_refresh=rt_abc"));
        assert!(cookie.contains("Max-Age=2592000"));
        assert!(cookie.contains("Secure"));
        assert!(cookie.contains("SameSite=None"));
        assert!(cookie.contains("Path=/"));
    }

    #[test]
    fn test_clear_auth_cookie_format() {
        let cookie = clear_auth_cookie();
        assert!(cookie.starts_with("hooksniff_token="));
        assert!(cookie.contains("Max-Age=0"));
        assert!(cookie.contains("HttpOnly"));
        assert!(cookie.contains("Secure"));
    }

    #[test]
    fn test_clear_refresh_token_cookie_format() {
        let cookie = clear_refresh_token_cookie();
        assert!(cookie.starts_with("hooksniff_refresh="));
        assert!(cookie.contains("Max-Age=0"));
    }

    // ── IsTestKey debug ──────────────────────────────────────

    #[test]
    fn test_is_test_key_debug() {
        let key = IsTestKey(true);
        let debug = format!("{:?}", key);
        assert!(debug.contains("IsTestKey"));
    }

    #[test]
    fn test_is_test_key_clone() {
        let key = IsTestKey(true);
        let cloned = key;
        assert!(cloned.0);
    }
}
