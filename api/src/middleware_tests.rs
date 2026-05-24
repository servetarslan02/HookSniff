//! Tests for middleware module.

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
    let key = "hr_live_same";
    let h1 = hash_api_key(key);
    let h2 = hash_api_key(key);
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
