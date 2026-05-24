//! Tests for inbound webhook routes.

use super::*;
use axum::http::HeaderValue;
use uuid::Uuid;

// ── Provider enum ───────────────────────────────────────

#[test]
fn test_provider_parse_str() {
    assert_eq!(Provider::parse_str("stripe"), Provider::Stripe);
    assert_eq!(Provider::parse_str("STRIPE"), Provider::Stripe);
    assert_eq!(Provider::parse_str("Stripe"), Provider::Stripe);
    assert_eq!(Provider::parse_str("github"), Provider::GitHub);
    assert_eq!(Provider::parse_str("GitHub"), Provider::GitHub);
    assert_eq!(Provider::parse_str("shopify"), Provider::Shopify);
    assert_eq!(Provider::parse_str("SHOPIFY"), Provider::Shopify);
    assert_eq!(Provider::parse_str("slack"), Provider::Slack);
    assert_eq!(Provider::parse_str("SLACK"), Provider::Slack);
    assert_eq!(Provider::parse_str("twilio"), Provider::Twilio);
    assert_eq!(Provider::parse_str("TWILIO"), Provider::Twilio);
    assert_eq!(Provider::parse_str("discord"), Provider::Discord);
    assert_eq!(Provider::parse_str("DISCORD"), Provider::Discord);
    assert_eq!(Provider::parse_str("linear"), Provider::Linear);
    assert_eq!(Provider::parse_str("LINEAR"), Provider::Linear);
    assert_eq!(Provider::parse_str("notion"), Provider::Notion);
    assert_eq!(Provider::parse_str("NOTION"), Provider::Notion);
    assert_eq!(Provider::parse_str("unknown"), Provider::Generic);
    assert_eq!(Provider::parse_str(""), Provider::Generic);
    assert_eq!(Provider::parse_str("random"), Provider::Generic);
}

#[test]
fn test_provider_display() {
    assert_eq!(Provider::Stripe.to_string(), "stripe");
    assert_eq!(Provider::GitHub.to_string(), "github");
    assert_eq!(Provider::Shopify.to_string(), "shopify");
    assert_eq!(Provider::Slack.to_string(), "slack");
    assert_eq!(Provider::Twilio.to_string(), "twilio");
    assert_eq!(Provider::Discord.to_string(), "discord");
    assert_eq!(Provider::Linear.to_string(), "linear");
    assert_eq!(Provider::Notion.to_string(), "notion");
    assert_eq!(Provider::Generic.to_string(), "generic");
}

#[test]
fn test_provider_serialization_roundtrip() {
    let providers = vec![
        Provider::Stripe,
        Provider::GitHub,
        Provider::Shopify,
        Provider::Slack,
        Provider::Twilio,
        Provider::Discord,
        Provider::Linear,
        Provider::Notion,
        Provider::Generic,
    ];
    for p in providers {
        let json = serde_json::to_string(&p).unwrap();
        let deserialized: Provider = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, p);
    }
}

#[test]
fn test_provider_deserialization_lowercase() {
    let p: Provider = serde_json::from_str(r#""stripe""#).unwrap();
    assert_eq!(p, Provider::Stripe);
    let p: Provider = serde_json::from_str(r#""github""#).unwrap();
    assert_eq!(p, Provider::GitHub);
    let p: Provider = serde_json::from_str(r#""shopify""#).unwrap();
    assert_eq!(p, Provider::Shopify);
    let p: Provider = serde_json::from_str(r#""slack""#).unwrap();
    assert_eq!(p, Provider::Slack);
    let p: Provider = serde_json::from_str(r#""twilio""#).unwrap();
    assert_eq!(p, Provider::Twilio);
    let p: Provider = serde_json::from_str(r#""discord""#).unwrap();
    assert_eq!(p, Provider::Discord);
    let p: Provider = serde_json::from_str(r#""linear""#).unwrap();
    assert_eq!(p, Provider::Linear);
    let p: Provider = serde_json::from_str(r#""notion""#).unwrap();
    assert_eq!(p, Provider::Notion);
    let p: Provider = serde_json::from_str(r#""generic""#).unwrap();
    assert_eq!(p, Provider::Generic);
}

#[test]
fn test_provider_partial_eq() {
    assert_eq!(Provider::Stripe, Provider::Stripe);
    assert_ne!(Provider::Stripe, Provider::GitHub);
    assert_ne!(Provider::Generic, Provider::Shopify);
}

#[test]
fn test_provider_clone() {
    let p = Provider::Stripe;
    let cloned = p.clone();
    assert_eq!(p, cloned);
}

#[test]
fn test_provider_debug() {
    let _ = format!("{:?}", Provider::GitHub);
}

// ── Provider::extract_event_type ────────────────────────

#[test]
fn test_extract_event_type_stripe() {
    let body = r#"{"type":"checkout.session.completed","data":{}}"#;
    let event = Provider::Stripe.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("checkout.session.completed".to_string()));
}

#[test]
fn test_extract_event_type_github_always_none() {
    let body = r#"{"action":"opened"}"#;
    let event = Provider::GitHub.extract_event_type(body.as_bytes());
    assert!(event.is_none());
}

#[test]
fn test_extract_event_type_shopify_topic() {
    let body = r#"{"topic":"orders/create"}"#;
    let event = Provider::Shopify.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("orders/create".to_string()));
}

#[test]
fn test_extract_event_type_shopify_event() {
    let body = r#"{"event":"orders/create"}"#;
    let event = Provider::Shopify.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("orders/create".to_string()));
}

#[test]
fn test_extract_event_type_generic() {
    let body = r#"{"event":"custom.event"}"#;
    let event = Provider::Generic.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("custom.event".to_string()));
}

#[test]
fn test_extract_event_type_generic_no_event() {
    let body = r#"{"data":"something"}"#;
    let event = Provider::Generic.extract_event_type(body.as_bytes());
    assert!(event.is_none());
}

#[test]
fn test_extract_event_type_invalid_json() {
    let body = b"not json";
    let event = Provider::Stripe.extract_event_type(body);
    assert!(event.is_none());
}

// ── New provider extract_event_type ─────────────────────

#[test]
fn test_extract_event_type_slack_event_type() {
    let body = r#"{"type":"event_callback","event":{"type":"message"}}"#;
    let event = Provider::Slack.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("message".to_string()));
}

#[test]
fn test_extract_event_type_slack_fallback_type() {
    let body = r#"{"type":"url_verification"}"#;
    let event = Provider::Slack.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("url_verification".to_string()));
}

#[test]
fn test_extract_event_type_twilio_sms() {
    let body = r#"{"SmsStatus":"delivered","MessageSid":"SM123"}"#;
    let event = Provider::Twilio.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("delivered".to_string()));
}

#[test]
fn test_extract_event_type_twilio_call() {
    let body = r#"{"CallStatus":"completed","CallSid":"CA123"}"#;
    let event = Provider::Twilio.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("completed".to_string()));
}

#[test]
fn test_extract_event_type_discord() {
    let body = r#"{"t":"MESSAGE_CREATE","d":{"content":"hello"}}"#;
    let event = Provider::Discord.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("MESSAGE_CREATE".to_string()));
}

#[test]
fn test_extract_event_type_linear_type() {
    let body = r#"{"type":"Issue","action":"create"}"#;
    let event = Provider::Linear.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("Issue".to_string()));
}

#[test]
fn test_extract_event_type_linear_action_fallback() {
    let body = r#"{"action":"update"}"#;
    let event = Provider::Linear.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("update".to_string()));
}

#[test]
fn test_extract_event_type_notion() {
    let body = r#"{"type":"page.created"}"#;
    let event = Provider::Notion.extract_event_type(body.as_bytes());
    assert_eq!(event, Some("page.created".to_string()));
}

// ── Slack signature verification ────────────────────────

#[test]
fn test_verify_slack_missing_header() {
    let headers = HeaderMap::new();
    let result = verify_slack("secret", &headers, b"body");
    assert!(result.is_err());
}

#[test]
fn test_verify_slack_valid_signature() {
    let secret = "slack_secret";
    let body = b"payload";
    let timestamp = "1234567890";
    let payload = format!("v0:{}:{}", timestamp, String::from_utf8_lossy(body));
    let sig = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-slack-signature",
        HeaderValue::from_str(&format!("v0={}", sig)).unwrap(),
    );
    headers.insert(
        "x-slack-request-timestamp",
        HeaderValue::from_str(timestamp).unwrap(),
    );
    let result = verify_slack(secret, &headers, body);
    assert!(result.is_ok());
}

#[test]
fn test_verify_slack_signature_mismatch() {
    let mut headers = HeaderMap::new();
    headers.insert("x-slack-signature", HeaderValue::from_static("v0=wrong"));
    headers.insert(
        "x-slack-request-timestamp",
        HeaderValue::from_static("123"),
    );
    let result = verify_slack("secret", &headers, b"body");
    assert!(result.is_err());
}

// ── Linear signature verification ───────────────────────

#[test]
fn test_verify_linear_missing_header() {
    let headers = HeaderMap::new();
    let result = verify_linear("secret", &headers, b"body");
    assert!(result.is_err());
}

#[test]
fn test_verify_linear_valid_signature() {
    let secret = "linear_secret";
    let body = b"payload";
    let sig = compute_hmac_hex(secret.as_bytes(), body);

    let mut headers = HeaderMap::new();
    headers.insert("linear-signature", HeaderValue::from_str(&sig).unwrap());
    let result = verify_linear(secret, &headers, body);
    assert!(result.is_ok());
}

#[test]
fn test_verify_linear_signature_mismatch() {
    let mut headers = HeaderMap::new();
    headers.insert("linear-signature", HeaderValue::from_static("wrong_sig"));
    let result = verify_linear("secret", &headers, b"body");
    assert!(result.is_err());
}

// ── Notion signature verification ───────────────────────

#[test]
fn test_verify_notion_missing_header() {
    let headers = HeaderMap::new();
    let result = verify_notion("secret", &headers, b"body");
    assert!(result.is_err());
}

#[test]
fn test_verify_notion_valid_signature() {
    let secret = "notion_secret";
    let body = b"payload";
    let timestamp = "1234567890";
    let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
    let sig = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-notion-signature",
        HeaderValue::from_str(&format!("sha256={}", sig)).unwrap(),
    );
    headers.insert(
        "x-notion-timestamp",
        HeaderValue::from_str(timestamp).unwrap(),
    );
    let result = verify_notion(secret, &headers, body);
    assert!(result.is_ok());
}

#[test]
fn test_verify_notion_signature_mismatch() {
    let mut headers = HeaderMap::new();
    headers.insert("x-notion-signature", HeaderValue::from_static("sha256=wrong"));
    headers.insert("x-notion-timestamp", HeaderValue::from_static("123"));
    let result = verify_notion("secret", &headers, b"body");
    assert!(result.is_err());
}

// ── HMAC computation ────────────────────────────────────

#[test]
fn test_compute_hmac_hex_deterministic() {
    let h1 = compute_hmac_hex(b"secret", b"data");
    let h2 = compute_hmac_hex(b"secret", b"data");
    assert_eq!(h1, h2);
}

#[test]
fn test_compute_hmac_hex_different_keys() {
    let h1 = compute_hmac_hex(b"key1", b"data");
    let h2 = compute_hmac_hex(b"key2", b"data");
    assert_ne!(h1, h2);
}

#[test]
fn test_compute_hmac_hex_different_data() {
    let h1 = compute_hmac_hex(b"key", b"data1");
    let h2 = compute_hmac_hex(b"key", b"data2");
    assert_ne!(h1, h2);
}

#[test]
fn test_compute_hmac_raw_returns_bytes() {
    let raw = compute_hmac_raw(b"key", b"data");
    assert_eq!(raw.len(), 32); // SHA-256 = 32 bytes
}

#[test]
fn test_compute_hmac_hex_is_hex_string() {
    let hex = compute_hmac_hex(b"key", b"data");
    assert_eq!(hex.len(), 64); // 32 bytes * 2 hex chars
    assert!(hex.chars().all(|c| c.is_ascii_hexdigit()));
}

// ── GitHub signature verification ───────────────────────

#[test]
fn test_verify_github_missing_header() {
    let headers = HeaderMap::new();
    let result = verify_github("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Missing x-hub-signature-256 header");
}

#[test]
fn test_verify_github_invalid_format() {
    let mut headers = HeaderMap::new();
    headers.insert("x-hub-signature-256", HeaderValue::from_static("invalid"));
    let result = verify_github("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Invalid format");
}

#[test]
fn test_verify_github_signature_mismatch() {
    let mut headers = HeaderMap::new();
    headers.insert(
        "x-hub-signature-256",
        HeaderValue::from_static(
            "sha256=0000000000000000000000000000000000000000000000000000000000000000",
        ),
    );
    let result = verify_github("secret", &headers, b"body");
    assert!(result.is_err());
}

#[test]
fn test_verify_github_signature_valid() {
    let secret = "my_github_secret";
    let body = b"webhook payload";
    let expected = compute_hmac_hex(secret.as_bytes(), body);
    let header_value = format!("sha256={}", expected);

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-hub-signature-256",
        HeaderValue::from_str(&header_value).unwrap(),
    );
    let result = verify_github(secret, &headers, body);
    assert!(result.is_ok());
}

// ── Stripe signature verification ───────────────────────

#[test]
fn test_verify_stripe_missing_header() {
    let headers = HeaderMap::new();
    let result = verify_stripe("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Missing stripe-signature header");
}

#[test]
fn test_verify_stripe_invalid_format() {
    let mut headers = HeaderMap::new();
    headers.insert("stripe-signature", HeaderValue::from_static("invalid"));
    let result = verify_stripe("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Invalid stripe-signature format");
}

#[test]
fn test_verify_stripe_valid_signature() {
    let secret = "whsec_test123";
    let body = b"stripe payload";
    let timestamp = "1234567890";
    let payload = format!("{}.{}", timestamp, String::from_utf8_lossy(body));
    let sig = compute_hmac_hex(secret.as_bytes(), payload.as_bytes());
    let header_value = format!("t={},v1={}", timestamp, sig);

    let mut headers = HeaderMap::new();
    headers.insert(
        "stripe-signature",
        HeaderValue::from_str(&header_value).unwrap(),
    );
    let result = verify_stripe(secret, &headers, body);
    assert!(result.is_ok());
}

#[test]
fn test_verify_stripe_signature_mismatch() {
    let mut headers = HeaderMap::new();
    headers.insert(
        "stripe-signature",
        HeaderValue::from_static("t=123,v1=wrong"),
    );
    let result = verify_stripe("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Stripe signature mismatch");
}

// ── Shopify signature verification ──────────────────────

#[test]
fn test_verify_shopify_missing_header() {
    let headers = HeaderMap::new();
    let result = verify_shopify("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err(),
        "Missing x-shopify-hmac-sha256 header"
    );
}

#[test]
fn test_verify_shopify_signature_mismatch() {
    let mut headers = HeaderMap::new();
    headers.insert(
        "x-shopify-hmac-sha256",
        HeaderValue::from_static("dGVzdA=="),
    );
    let result = verify_shopify("secret", &headers, b"body");
    assert!(result.is_err());
}

// ── Generic signature verification ──────────────────────

#[test]
fn test_verify_generic_no_header_no_secret() {
    let headers = HeaderMap::new();
    let result = verify_generic("", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err(),
        "No secret configured — cannot verify webhook authenticity"
    );
}

#[test]
fn test_verify_generic_no_header_with_secret() {
    let headers = HeaderMap::new();
    let result = verify_generic("secret", &headers, b"body");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "No signature header found");
}

#[test]
fn test_verify_generic_valid_signature() {
    let secret = "generic_secret";
    let body = b"payload";
    let sig = compute_hmac_hex(secret.as_bytes(), body);
    let header_value = format!("sha256={}", sig);

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-hooksniff-signature",
        HeaderValue::from_str(&header_value).unwrap(),
    );
    let result = verify_generic(secret, &headers, body);
    assert!(result.is_ok());
}

#[test]
fn test_verify_generic_x_signature_256_header() {
    let secret = "generic_secret";
    let body = b"payload";
    let sig = compute_hmac_hex(secret.as_bytes(), body);

    let mut headers = HeaderMap::new();
    headers.insert(
        "x-hooksniff-signature",
        HeaderValue::from_str(&sig).unwrap(),
    );
    let result = verify_generic(secret, &headers, body);
    assert!(result.is_ok());
}

// ── Provider::verify_signature ──────────────────────────

#[test]
fn test_provider_verify_signature_delegates_correctly() {
    let headers = HeaderMap::new();
    let result = Provider::GitHub.verify_signature("secret", &headers, b"body");
    assert!(result.is_err());
}

// ── InboundConfig ───────────────────────────────────────

#[test]
fn test_inbound_config_serialization_roundtrip() {
    let config = InboundConfig {
        id: Uuid::new_v4(),
        customer_id: Uuid::new_v4(),
        provider: "stripe".to_string(),
        secret: "whsec_abc".to_string(),
        endpoint_id: Some(Uuid::new_v4()),
        enabled: true,
        created_at: chrono::Utc::now(),
    };
    let json = serde_json::to_string(&config).unwrap();
    let deserialized: InboundConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(deserialized.provider, "stripe");
    assert!(deserialized.enabled);
}

#[test]
fn test_inbound_config_none_endpoint() {
    let config = InboundConfig {
        id: Uuid::new_v4(),
        customer_id: Uuid::new_v4(),
        provider: "github".to_string(),
        secret: "secret".to_string(),
        endpoint_id: None,
        enabled: false,
        created_at: chrono::Utc::now(),
    };
    let json = serde_json::to_value(&config).unwrap();
    assert!(json["endpoint_id"].is_null());
    assert!(!json["enabled"].as_bool().unwrap());
}

// ── INBOUND_MIGRATION_SQL ───────────────────────────────

#[test]
fn test_inbound_migration_sql_not_empty() {
    assert!(!INBOUND_MIGRATION_SQL.is_empty());
    assert!(INBOUND_MIGRATION_SQL.contains("inbound_configs"));
    assert!(INBOUND_MIGRATION_SQL.contains("CREATE TABLE"));
}

// ── Router construction ─────────────────────────────────

#[test]
fn test_inbound_router_construction() {
    let _router = router();
}
