use hooksniff::webhook::{self, WebhookVerificationError};
use std::collections::HashMap;

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn make_secret() -> &'static str {
    "whsec_dGVzdHNlY3JldGtleWZvcmhvb2tzbmlmZg=="
}

fn make_raw_secret() -> Vec<u8> {
    let raw = make_secret().strip_prefix("whsec_").unwrap_or(make_secret());
    base64::Engine::decode(&base64::engine::general_purpose::STANDARD, raw)
        .unwrap_or(raw.as_bytes().to_vec())
}

fn make_headers(msg_id: &str, timestamp: &str, sig: &str) -> HashMap<String, String> {
    let mut h = HashMap::new();
    h.insert("webhook-id".to_string(), msg_id.to_string());
    h.insert("webhook-timestamp".to_string(), timestamp.to_string());
    h.insert("webhook-signature".to_string(), sig.to_string());
    h
}

#[test]
fn test_verify_valid_signature() {
    let secret = make_secret();
    let payload = r#"{"event":"order.created","data":{"order_id":"12345"}}"#;
    let msg_id = "msg_test_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);
    assert!(webhook::verify_signature(secret, payload, &headers).is_ok());
}

#[test]
fn test_verify_invalid_signature() {
    let secret = make_secret();
    let payload = r#"{"event":"test"}"#;
    let msg_id = "msg_test_002";
    let ts = current_timestamp();
    let headers = make_headers(msg_id, &ts.to_string(), "v1,invalidsignature");
    assert!(webhook::verify_signature(secret, payload, &headers).is_err());
}

#[test]
fn test_verify_expired_timestamp() {
    let secret = make_secret();
    let payload = r#"{"event":"test"}"#;
    let msg_id = "msg_test_003";
    let ts = current_timestamp() - 600;
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);
    assert!(webhook::verify_signature(secret, payload, &headers).is_err());
}

#[test]
fn test_verify_missing_headers() {
    let secret = make_secret();
    let empty: HashMap<String, String> = HashMap::new();
    assert!(webhook::verify_signature(secret, "{}", &empty).is_err());
}

#[test]
fn test_verify_svix_headers() {
    let secret = make_secret();
    let payload = r#"{"event":"test"}"#;
    let msg_id = "msg_svix_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);

    let mut headers = HashMap::new();
    headers.insert("svix-id".to_string(), msg_id.to_string());
    headers.insert("svix-timestamp".to_string(), ts.to_string());
    headers.insert("svix-signature".to_string(), sig);
    assert!(webhook::verify_signature(secret, payload, &headers).is_ok());
}

#[test]
fn test_verify_multiple_signatures() {
    let secret = make_secret();
    let payload = r#"{"multi": true}"#;
    let msg_id = "msg_multi_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let multi_sig = format!("v1,fakesig,{}", sig);
    let headers = make_headers(msg_id, &ts.to_string(), &multi_sig);
    assert!(webhook::verify_signature(secret, payload, &headers).is_ok());
}

#[test]
fn test_sign_produces_v1_prefix() {
    let secret = make_raw_secret();
    let sig = webhook::sign(&secret, "msg_123", 1700000000, "{}");
    assert!(sig.starts_with("v1,"));
}

#[test]
fn test_verify_tampered_payload() {
    let secret = make_secret();
    let payload = r#"{"test": true}"#;
    let msg_id = "msg_tamper_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);
    assert!(webhook::verify_signature(secret, r#"{"test": false}"#, &headers).is_err());
}
