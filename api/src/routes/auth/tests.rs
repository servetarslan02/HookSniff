//! Tests for auth routes.

use super::*;
use axum::http::HeaderValue;
use uuid::Uuid;

#[test]
fn test_constants_values() {
    assert_eq!(LOGIN_RATE_LIMIT, 10);
    assert_eq!(REGISTER_RATE_LIMIT, 5);
    assert_eq!(TOKEN_MAX_AGE, 3600);
    assert_eq!(REFRESH_TOKEN_MAX_AGE, 7776000);
    assert_eq!(RESET_RATE_LIMIT, 5);
    assert_eq!(VERIFY_EMAIL_RATE_LIMIT, 10);
    assert_eq!(REFRESH_RATE_LIMIT, 30);
}

#[test]
fn test_extract_client_ip_from_x_forwarded_for() {
    let mut headers = HeaderMap::new();
    headers.insert("x-forwarded-for", HeaderValue::from_static("1.2.3.4, 5.6.7.8"));
    assert_eq!(extract_client_ip(&headers), "5.6.7.8");
}

#[test]
fn test_extract_client_ip_from_x_real_ip() {
    let mut headers = HeaderMap::new();
    headers.insert("x-real-ip", HeaderValue::from_static("10.0.0.1"));
    assert_eq!(extract_client_ip(&headers), "10.0.0.1");
}

#[test]
fn test_extract_client_ip_unknown_when_empty() {
    let headers = HeaderMap::new();
    assert_eq!(extract_client_ip(&headers), "unknown");
}

#[test]
fn test_extract_client_ip_prefers_real_ip() {
    let mut headers = HeaderMap::new();
    headers.insert("x-forwarded-for", HeaderValue::from_static("1.1.1.1"));
    headers.insert("x-real-ip", HeaderValue::from_static("2.2.2.2"));
    assert_eq!(extract_client_ip(&headers), "2.2.2.2");
}

#[test]
fn test_auth_response_with_cookie_sets_access_token() {
    let body = AuthResponse {
        token: "test_jwt".to_string(),
        customer: CustomerResponse {
            id: Uuid::new_v4(),
            email: "a@b.com".to_string(),
            name: None,
            api_key: None,
            plan: "developer".to_string(),
            webhook_limit: 10,
            webhook_count: 0,
            is_admin: false,
            created_at: chrono::Utc::now(),
        },
        refresh_token: None,
    };
    let (headers, json) = auth_response_with_cookie(body);
    assert!(headers.contains_key("set-cookie"));
    let cookie = headers.get("set-cookie").unwrap().to_str().unwrap();
    assert!(cookie.contains("hooksniff_token=test_jwt"));
    assert!(cookie.contains("Max-Age=3600"));
    assert_eq!(json["token"], "test_jwt");
}

#[test]
fn test_auth_response_body_excludes_refresh_token() {
    let body = AuthResponse {
        token: "jwt".to_string(),
        customer: CustomerResponse {
            id: Uuid::new_v4(),
            email: "a@b.com".to_string(),
            name: None,
            api_key: None,
            plan: "developer".to_string(),
            webhook_limit: 10,
            webhook_count: 0,
            is_admin: false,
            created_at: chrono::Utc::now(),
        },
        refresh_token: Some("secret_refresh".to_string()),
    };
    let (_, json) = auth_response_with_cookie(body);
    assert!(
        json.get("refresh_token").is_none(),
        "refresh_token should not be in response body"
    );
}

#[test]
fn test_auth_router_construction() {
    let _router = router();
}
