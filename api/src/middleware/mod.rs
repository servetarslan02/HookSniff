pub mod idempotency;
pub mod webhook_verify;

use axum::{extract::Request, http::header::{HeaderValue, AUTHORIZATION}, middleware::Next, response::Response};
use sqlx::PgPool;
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::routes::auth::CUSTOMER_SELECT;

const AUTH_COOKIE_NAME: &str = "hooksniff_token";
const REFRESH_COOKIE_NAME: &str = "hooksniff_refresh";
const AUTH_CACHE_TTL: Duration = Duration::from_secs(30);
/// Maximum number of cached auth entries to prevent unbounded memory growth
const AUTH_CACHE_MAX_ENTRIES: usize = 10_000;

use crate::error::AppError;
use crate::models::customer::Customer;

/// Simple in-memory cache for auth lookups (prefix → (customer, expiry))
/// Uses tokio::sync::Mutex to safely hold across .await points.
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
        // Evict expired entries before inserting to bound memory usage
        if self.entries.len() >= AUTH_CACHE_MAX_ENTRIES {
            self.cleanup();
        }
        // If still at capacity after cleanup, evict oldest entry
        if self.entries.len() >= AUTH_CACHE_MAX_ENTRIES {
            if let Some(oldest_key) = self
                .entries
                .iter()
                .min_by_key(|(_, (_, expiry))| *expiry)
                .map(|(k, _)| k.clone())
            {
                self.entries.remove(&oldest_key);
            }
        }
        self.entries
            .insert(prefix, (customer, Instant::now() + AUTH_CACHE_TTL));
    }

    /// Remove all expired entries from the cache
    fn cleanup(&mut self) {
        self.entries
            .retain(|_, (_, expiry)| Instant::now() < *expiry);
    }
}

/// Global auth cache — uses tokio::sync::Mutex for safe async access.
static AUTH_CACHE: once_cell::sync::Lazy<Mutex<AuthCache>> =
    once_cell::sync::Lazy::new(|| Mutex::new(AuthCache::new()));

/// Start a background task that periodically cleans up expired auth cache entries.
/// Call this once from main.rs during server startup.
pub fn start_auth_cache_cleanup() {
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(60)).await;
            let mut cache = AUTH_CACHE.lock().await;
            let before = cache.entries.len();
            cache.cleanup();
            let after = cache.entries.len();
            if before != after {
                tracing::debug!(
                    "Auth cache cleanup: removed {} expired entries ({} remaining)",
                    before - after,
                    after
                );
            }
        }
    });
}

/// Indicates whether the current request was made with a test API key (hr_test_*).
/// Handlers can check this to mark deliveries as test and skip real delivery.
#[derive(Debug, Clone, Copy)]
pub struct IsTestKey(pub bool);

/// Indicates the request was authenticated via a service token (organization-level).
/// Contains the team_id so handlers can scope resources to that organization.
#[derive(Debug, Clone)]
pub struct ServiceTokenScope {
    pub team_id: Uuid,
}

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
/// Extract token from request: first try Authorization header, then try cookie, then try query param (for WebSocket).
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
    // Try query parameter (for WebSocket connections — browser can't set WS headers)
    if let Some(query) = req.uri().query() {
        for pair in query.split('&') {
            if let Some(value) = pair.strip_prefix("token=") {
                let decoded = urlencoding::decode(value).unwrap_or_default();
                if !decoded.is_empty() {
                    return Some(decoded.to_string());
                }
            }
        }
    }
    None
}

/// HS-261: Check if a JWT has been revoked via blacklist or per-customer revocation.
async fn check_token_revocation(
    pool: &PgPool,
    claims: &crate::auth::jwt::Claims,
) -> Result<(), AppError> {
    // Check individual token blacklist (by jti)
    if let Some(ref jti) = claims.jti {
        let revoked: (bool,) = sqlx::query_as(
            "SELECT EXISTS(SELECT 1 FROM revoked_tokens WHERE jti = $1)",
        )
        .bind(jti)
        .fetch_one(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if revoked.0 {
            return Err(AppError::Unauthorized);
        }
    }

    // Check per-customer revocation (revoke-all-tokens)
    // If the token was issued before the customer's revocation event, reject it
    if let Some(iat) = claims.iat {
        let revoked_before: Option<(chrono::DateTime<chrono::Utc>,)> = sqlx::query_as(
            "SELECT revoked_at FROM token_revocation_events WHERE customer_id = $1",
        )
        .bind(claims.sub)
        .fetch_optional(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if let Some((revoked_at,)) = revoked_before {
            if (iat as i64) < revoked_at.timestamp() {
                return Err(AppError::Unauthorized);
            }
        }
    }

    Ok(())
}

pub async fn auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    cfg: axum::extract::Extension<crate::config::Config>,
    cache: axum::extract::Extension<Option<crate::cache::CacheLayer>>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(&req).ok_or(AppError::Unauthorized)?;
    let cache = cache.0;

    let is_test = token.starts_with("hr_test_");
    let mut service_token_team: Option<Uuid> = None;
    let customer = if token.starts_with("hr_live_") || token.starts_with("hr_test_") {
        // API key authentication — check Redis cache, then in-memory cache, then DB
        let prefix = token[..24.min(token.len())].to_string();

        // 1. Try Redis cache first (shared across instances)
        let redis_cached: Option<Customer> = if let Some(ref c) = cache {
            c.get("apikey", &prefix).await
        } else {
            None
        };
        if let Some(c) = redis_cached {
            c
        } else {
        // 2. Try in-memory cache (fast, per-instance)
        let mem_cached = {
            let cache = AUTH_CACHE.lock().await;
            cache.get(&prefix)
        };

        if let Some(c) = mem_cached {
            // Also populate Redis for other instances
            if let Some(ref c2) = cache {
                c2.set("apikey", &prefix, &c).await;
            }
            c
        } else {
            // Cache miss — query DB (no lock held during async operations)
            let candidates =
                sqlx::query_as::<_, Customer>(&format!("{} WHERE api_key_prefix = $1", CUSTOMER_SELECT))
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

            // If not found in api_keys, try service_tokens (organization-level tokens)
            if found.is_none() {
                let st_candidates: Vec<(String,)> = sqlx::query_as(
                    "SELECT token_hash FROM service_tokens WHERE token_prefix = $1 AND is_active = true",
                )
                .bind(&prefix)
                .fetch_all(&*pool)
                .await?;

                for (hash,) in &st_candidates {
                    if verify_api_key(&token, hash) {
                        // Service token auth: resolve the team owner as the customer + team_id
                        // First get the team_id from the service token
                        let team_id_opt: Option<Uuid> = sqlx::query_scalar(
                            "SELECT t.id FROM teams t \
                             INNER JOIN service_tokens st ON st.team_id = t.id \
                             WHERE st.token_prefix = $1 AND st.token_hash = $2"
                        )
                        .bind(&prefix)
                        .bind(hash)
                        .fetch_optional(&*pool)
                        .await?;

                        if let Some(team_id) = team_id_opt {
                            // Then fetch the team owner as customer
                            let customer = sqlx::query_as::<_, Customer>(
                                &format!("{} c INNER JOIN teams t ON t.owner_id = c.id WHERE t.id = $1", CUSTOMER_SELECT)
                            )
                            .bind(team_id)
                            .fetch_optional(&*pool)
                            .await?;

                            if let Some(c) = customer {
                                found = Some(c);
                                service_token_team = Some(team_id);
                                // Update last_used_at
                                let _ = sqlx::query(
                                    "UPDATE service_tokens SET last_used_at = NOW() WHERE token_prefix = $1 AND token_hash = $2"
                                )
                                .bind(&prefix)
                                .bind(hash)
                                .execute(&*pool)
                                .await;
                            }
                        }
                        break;
                    }
                }
            }

            let customer = found.ok_or(AppError::Unauthorized)?;

            // Cache the result in both Redis (shared) and in-memory (fast)
            if let Some(ref c) = cache {
                c.set("apikey", &prefix, &customer).await;
            }
            {
                let mut mem_cache = AUTH_CACHE.lock().await;
                mem_cache.insert(prefix, customer.clone());
            }

            customer
        }
        }
    } else {
        // JWT token authentication
        let claims = crate::auth::jwt::verify_token(&token, &cfg.jwt_secret)?;

        // HS-261: Check if token has been revoked (individual or all-tokens-for-customer)
        check_token_revocation(&pool, &claims).await?;

        sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
            .bind(claims.sub)
            .fetch_optional(&*pool)
            .await?
            .ok_or(AppError::Unauthorized)?
    };

    req.extensions_mut().insert(customer);
    req.extensions_mut().insert(IsTestKey(is_test));
    if let Some(team_id) = service_token_team {
        req.extensions_mut().insert(ServiceTokenScope { team_id });
    }
    Ok(next.run(req).await)
}

/// JWT-based auth middleware for dashboard routes
pub async fn jwt_auth_middleware(
    pool: axum::extract::Extension<PgPool>,
    cfg: axum::extract::Extension<crate::config::Config>,
    cache: axum::extract::Extension<Option<crate::cache::CacheLayer>>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = extract_token(&req).ok_or(AppError::Unauthorized)?;
    let cache = cache.0;

    let claims = crate::auth::jwt::verify_token(&token, &cfg.jwt_secret)?;

    // HS-261: Check if token has been revoked
    check_token_revocation(&pool, &claims).await?;

    // Try Redis cache for JWT customer lookup (keyed by user ID)
    let user_id_str = claims.sub.to_string();
    let redis_cached: Option<Customer> = if let Some(ref c) = cache {
        c.get("jwt_user", &user_id_str).await
    } else {
        None
    };
    let customer = if let Some(c) = redis_cached {
        c
    } else {
        let c = sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", CUSTOMER_SELECT))
            .bind(claims.sub)
            .fetch_optional(&*pool)
            .await?
            .ok_or(AppError::Unauthorized)?;
        if let Some(ref c2) = cache {
            c2.set("jwt_user", &user_id_str, &c).await;
        }
        c
    };

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
/// HttpOnly, Secure, SameSite=Lax for CSRF protection.
pub fn create_auth_cookie(token: &str, max_age_secs: i64) -> String {
    format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        AUTH_COOKIE_NAME, token, max_age_secs
    )
}

/// Create a Set-Cookie header value to clear the auth cookie.
pub fn clear_auth_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        AUTH_COOKIE_NAME
    )
}

/// Create a Set-Cookie header value for the refresh token.
/// HttpOnly, Secure, SameSite=Lax, 30-day expiry.
pub fn create_refresh_token_cookie(token: &str, max_age_secs: i64) -> String {
    format!(
        "{}={}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age={}",
        REFRESH_COOKIE_NAME, token, max_age_secs
    )
}

/// Create a Set-Cookie header value to clear the refresh token.
pub fn clear_refresh_token_cookie() -> String {
    format!(
        "{}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
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
        assert!(cookie.contains("SameSite=Lax"));
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

    // ── request_timeout_middleware ─────────────────────────────

    #[tokio::test]
    async fn test_timeout_middleware_fast_response() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        let app = Router::new()
            .route("/fast", get(|| async { "ok" }))
            .layer(middleware::from_fn(request_timeout_middleware));

        let request = Request::builder().uri("/fast").body(Body::empty()).unwrap();
        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }

    #[tokio::test]
    async fn test_timeout_middleware_slow_response() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        // Temporarily set a very short timeout
        std::env::set_var("REQUEST_TIMEOUT_SECS", "1");

        let app = Router::new()
            .route(
                "/slow",
                get(|| async {
                    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                    "too late"
                }),
            )
            .layer(middleware::from_fn(request_timeout_middleware));

        let request = Request::builder().uri("/slow").body(Body::empty()).unwrap();
        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), axum::http::StatusCode::REQUEST_TIMEOUT);

        // Reset
        std::env::remove_var("REQUEST_TIMEOUT_SECS");
    }

    // ── security_headers_middleware ────────────────────────────

    #[tokio::test]
    async fn test_security_headers_present() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        let app = Router::new()
            .route("/test", get(|| async { "ok" }))
            .layer(middleware::from_fn(security_headers_middleware));

        let request = Request::builder().uri("/test").body(Body::empty()).unwrap();
        let response = app.oneshot(request).await.unwrap();
        let headers = response.headers();

        assert_eq!(headers.get("x-content-type-options").unwrap(), "nosniff");
        assert_eq!(headers.get("x-frame-options").unwrap(), "DENY");
        assert!(headers.get("strict-transport-security").is_some());
        assert!(headers.get("referrer-policy").is_some());
        assert!(headers.get("vary").is_some());
    }

    #[tokio::test]
    async fn test_cache_control_health_endpoint() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        let app = Router::new()
            .route("/health", get(|| async { "ok" }))
            .layer(middleware::from_fn(security_headers_middleware));

        let request = Request::builder().uri("/health").body(Body::empty()).unwrap();
        let response = app.oneshot(request).await.unwrap();
        let cache = response.headers().get("cache-control").unwrap().to_str().unwrap();
        assert!(cache.contains("public"));
        assert!(cache.contains("max-age=10"));
    }

    #[tokio::test]
    async fn test_cache_control_auth_endpoint() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        let app = Router::new()
            .route("/v1/auth/login", get(|| async { "ok" }))
            .layer(middleware::from_fn(security_headers_middleware));

        let request = Request::builder().uri("/v1/auth/login").body(Body::empty()).unwrap();
        let response = app.oneshot(request).await.unwrap();
        let cache = response.headers().get("cache-control").unwrap().to_str().unwrap();
        assert!(cache.contains("no-store"));
        assert!(response.headers().get("pragma").is_some());
    }
}

/// Request metrics middleware — records latency, status code, and method for every request.
///
/// Feeds into the global Metrics counters and logs slow requests (>5s).
pub async fn request_metrics_middleware(request: Request, next: Next) -> Response {
    let method = request.method().clone();
    let path = request.uri().path().to_string();
    let start = std::time::Instant::now();

    let response = next.run(request).await;

    let duration = start.elapsed();
    let status = response.status().as_u16();

    // Record API request in global metrics
    if let Some(m) = crate::telemetry::metrics() {
        m.record_api_request();
    }

    // Log slow requests
    if duration.as_secs() >= 5 {
        tracing::warn!(
            method = %method,
            path = %path,
            status = status,
            duration_ms = duration.as_millis(),
            "⚠️ Slow request"
        );
    }

    // Log 5xx errors at error level
    if status >= 500 {
        tracing::error!(
            method = %method,
            path = %path,
            status = status,
            duration_ms = duration.as_millis(),
            "Server error"
        );
    }

    response
}

/// Request timeout middleware — aborts requests that take too long.
///
/// Cloud Run has a 30s request timeout. We use 25s to return a proper
/// JSON error before the infrastructure kills the connection.
///
/// Only applies to request processing time, not response streaming.
pub async fn request_timeout_middleware(request: Request, next: Next) -> Response {
    let timeout_secs = std::env::var("REQUEST_TIMEOUT_SECS")
        .ok()
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(25);

    match tokio::time::timeout(
        std::time::Duration::from_secs(timeout_secs),
        next.run(request),
    )
    .await
    {
        Ok(response) => response,
        Err(_) => {
            tracing::warn!("Request timed out after {timeout_secs}s");
            use axum::response::IntoResponse;
            let body = serde_json::json!({
                "error": "request_timeout",
                "message": format!("Request timed out after {timeout_secs} seconds")
            });
            (
                axum::http::StatusCode::REQUEST_TIMEOUT,
                [("content-type", "application/json")],
                axum::body::Body::from(serde_json::to_string(&body).unwrap_or_default()),
            )
                .into_response()
        }
    }
}

/// Add standard security headers to all API responses.
///
/// Cache strategy:
/// - Health/metrics: public, 10s (CDN-friendly, short TTL)
/// - Docs/static: public, 1h (rarely changes)
/// - Authenticated API (`/v1/`): private, no-cache (always fresh)
/// - Everything else: no-store (sensitive)
pub async fn security_headers_middleware(request: Request, next: Next) -> Response {
    let path = request.uri().path().to_string();
    let method = request.method().clone();
    let mut response = next.run(request).await;

    // All header mutations in a scoped block to release borrow before ETag
    {
    let headers = response.headers_mut();

    // Security headers
    headers.insert("x-content-type-options", HeaderValue::from_static("nosniff"));
    headers.insert("x-frame-options", HeaderValue::from_static("DENY"));
    headers.insert(
        "strict-transport-security",
        HeaderValue::from_static("max-age=31536000; includeSubDomains"),
    );
    headers.insert(
        "referrer-policy",
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    headers.insert("x-xss-protection", HeaderValue::from_static("1; mode=block"));

    // Vary: Accept-Encoding for proper CDN caching of compressed responses
    headers.insert("vary", HeaderValue::from_static("Accept-Encoding, Authorization"));

    // Smart cache control per path category
    if path.starts_with("/health") || path.starts_with("/v1/status") || path.starts_with("/metrics")
    {
        // Health/metrics: public, short TTL (CDN can cache briefly)
        headers.insert(
            "cache-control",
            HeaderValue::from_static("public, max-age=10, stale-while-revalidate=5"),
        );
    } else if path.starts_with("/v1/docs") || path.starts_with("/swagger") {
        // API docs: public, longer TTL (changes rarely)
        headers.insert(
            "cache-control",
            HeaderValue::from_static("public, max-age=3600, stale-while-revalidate=60"),
        );
    } else if path.starts_with("/v1/auth") {
        // Auth endpoints: never cache (tokens, sessions)
        headers.insert(
            "cache-control",
            HeaderValue::from_static("no-store, no-cache, must-revalidate"),
        );
        // Prevent auth responses from being cached by CDN
        headers.insert("pragma", HeaderValue::from_static("no-cache"));
    } else if path.starts_with("/v1/") {
        // API endpoints: private, revalidate
        headers.insert(
            "cache-control",
            HeaderValue::from_static("private, no-cache, must-revalidate"),
        );
    } else {
        // Default: no-store
        headers.insert(
            "cache-control",
            HeaderValue::from_static("no-store, no-cache, must-revalidate"),
        );
    }
    } // end scoped headers borrow

    // ETag support for GET requests (conditional requests → 304 Not Modified)
    // Only for cacheable endpoints, skip for auth and mutation methods
    let should_etag = method == axum::http::Method::GET
        && (path.starts_with("/health")
            || path.starts_with("/v1/status")
            || path.starts_with("/v1/docs")
            || path.starts_with("/v1/outbound-ips"))
        && !response.headers().contains_key("etag");

    if should_etag {
        use sha2::{Sha256, Digest};
        // Take ownership of the body, replace with empty
        let original_body = std::mem::replace(response.body_mut(), axum::body::Body::empty());
        let body = axum::body::to_bytes(original_body, usize::MAX)
            .await
            .unwrap_or_default();
        let mut hasher = Sha256::new();
        hasher.update(&body);
        let hash = format!("W/\"{}\"", &hex::encode(hasher.finalize())[..16]);
        response.headers_mut().insert("etag", HeaderValue::try_from(&hash).expect("etag hash is valid header value"));

        // Restore the body
        *response.body_mut() = axum::body::Body::from(body);
    }

    response
}
