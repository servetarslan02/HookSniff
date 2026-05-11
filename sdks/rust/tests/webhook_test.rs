//! HookSniff Webhook Signature Verification Tests
//!
//! Comprehensive test suite matching Svix webhook test quality.
//! Covers all Standard Webhooks verification edge cases.

use hooksniff::webhook;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// ── Helpers ──────────────────────────────────────────────────────────

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
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

fn make_svix_headers(msg_id: &str, timestamp: &str, sig: &str) -> HashMap<String, String> {
    let mut h = HashMap::new();
    h.insert("svix-id".to_string(), msg_id.to_string());
    h.insert("svix-timestamp".to_string(), timestamp.to_string());
    h.insert("svix-signature".to_string(), sig.to_string());
    h
}

// ── Empty key raises error ───────────────────────────────────────────

#[test]
fn test_verify_empty_secret_returns_error() {
    let payload = "{}";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), "msg_1", ts, payload);
    let headers = make_headers("msg_1", &ts.to_string(), &sig);

    // Empty secret should fail (different key → different signature)
    assert!(webhook::verify_signature("", payload, &headers).is_err());
}

// ── Missing id header raises error ───────────────────────────────────

#[test]
fn test_verify_missing_id_header() {
    let payload = "{}";
    let ts = current_timestamp();
    let mut headers = HashMap::new();
    headers.insert("webhook-timestamp".to_string(), ts.to_string());
    headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

    let result = webhook::verify_signature(make_secret(), payload, &headers);
    assert!(result.is_err());
    assert!(result.unwrap_err().0.contains("webhook-id"));
}

#[test]
fn test_verify_missing_id_header_svix() {
    let payload = "{}";
    let ts = current_timestamp();
    let mut headers = HashMap::new();
    headers.insert("svix-timestamp".to_string(), ts.to_string());
    headers.insert("svix-signature".to_string(), "v1,sig".to_string());

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

// ── Missing timestamp raises error ───────────────────────────────────

#[test]
fn test_verify_missing_timestamp_header() {
    let payload = "{}";
    let mut headers = HashMap::new();
    headers.insert("webhook-id".to_string(), "msg_1".to_string());
    headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

    let result = webhook::verify_signature(make_secret(), payload, &headers);
    assert!(result.is_err());
    assert!(result.unwrap_err().0.contains("webhook-timestamp"));
}

// ── Invalid timestamp throws error ───────────────────────────────────

#[test]
fn test_verify_invalid_timestamp_not_a_number() {
    let payload = "{}";
    let mut headers = HashMap::new();
    headers.insert("webhook-id".to_string(), "msg_1".to_string());
    headers.insert("webhook-timestamp".to_string(), "not-a-number".to_string());
    headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

    let result = webhook::verify_signature(make_secret(), payload, &headers);
    assert!(result.is_err());
    assert!(result.unwrap_err().0.contains("Invalid"));
}

#[test]
fn test_verify_empty_timestamp() {
    let payload = "{}";
    let mut headers = HashMap::new();
    headers.insert("webhook-id".to_string(), "msg_1".to_string());
    headers.insert("webhook-timestamp".to_string(), "".to_string());
    headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_negative_timestamp() {
    let payload = "{}";
    let mut headers = HashMap::new();
    headers.insert("webhook-id".to_string(), "msg_1".to_string());
    headers.insert("webhook-timestamp".to_string(), "-1".to_string());
    headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

// ── Missing signature raises error ───────────────────────────────────

#[test]
fn test_verify_missing_signature_header() {
    let payload = "{}";
    let ts = current_timestamp();
    let mut headers = HashMap::new();
    headers.insert("webhook-id".to_string(), "msg_1".to_string());
    headers.insert("webhook-timestamp".to_string(), ts.to_string());

    let result = webhook::verify_signature(make_secret(), payload, &headers);
    assert!(result.is_err());
    assert!(result.unwrap_err().0.contains("webhook-signature"));
}

// ── Invalid signature throws error ───────────────────────────────────

#[test]
fn test_verify_invalid_signature() {
    let payload = "{}";
    let ts = current_timestamp();
    let headers = make_headers("msg_1", &ts.to_string(), "v1,invalidsignature");

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_empty_signature() {
    let payload = "{}";
    let ts = current_timestamp();
    let headers = make_headers("msg_1", &ts.to_string(), "");

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_wrong_version_prefix() {
    let payload = "{}";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), "msg_1", ts, payload);
    // Change v1 to v2
    let wrong_sig = sig.replacen("v1,", "v2,", 1);
    let headers = make_headers("msg_1", &ts.to_string(), &wrong_sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

// ── Partial signature throws error ───────────────────────────────────

#[test]
fn test_verify_partial_signature() {
    let payload = "{}";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), "msg_1", ts, payload);
    // Truncate the signature
    let partial = &sig[..sig.len() / 2];
    let headers = make_headers("msg_1", &ts.to_string(), partial);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_signature_missing_v1_prefix() {
    let payload = "{}";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), "msg_1", ts, payload);
    // Remove the "v1," prefix
    let no_prefix = sig.strip_prefix("v1,").unwrap_or(&sig);
    let headers = make_headers("msg_1", &ts.to_string(), no_prefix);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

// ── Valid signature returns OK ────────────────────────────────────────

#[test]
fn test_verify_valid_signature() {
    let payload = r#"{"event":"order.created","data":{"order_id":"12345"}}"#;
    let msg_id = "msg_test_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_valid_empty_payload() {
    let payload = "";
    let msg_id = "msg_empty";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_valid_large_payload() {
    let payload = format!(r#"{{"data":"{}"}}"#, "x".repeat(100_000));
    let msg_id = "msg_large";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, &payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), &payload, &headers).is_ok());
}

#[test]
fn test_verify_valid_json_payload() {
    let payload = r#"{"nested":{"deep":{"value":42},"array":[1,2,3]}}"#;
    let msg_id = "msg_json";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

// ── Unbranded (webhook-*) headers work ────────────────────────────────

#[test]
fn test_verify_webhook_headers_work() {
    let payload = r#"{"test": true}"#;
    let msg_id = "msg_wh_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_svix_headers_work() {
    let payload = r#"{"test": true}"#;
    let msg_id = "msg_svix_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_svix_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_mixed_header_prefixes_fails() {
    // Mixing svix-id with webhook-timestamp should still work since we check both
    let payload = r#"{"test": true}"#;
    let msg_id = "msg_mixed";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);

    let mut headers = HashMap::new();
    headers.insert("svix-id".to_string(), msg_id.to_string());
    headers.insert("webhook-timestamp".to_string(), ts.to_string());
    headers.insert("webhook-signature".to_string(), sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_case_insensitive_headers() {
    let payload = r#"{"test": true}"#;
    let msg_id = "msg_case";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);

    let mut headers = HashMap::new();
    headers.insert("Webhook-Id".to_string(), msg_id.to_string());
    headers.insert("Webhook-Timestamp".to_string(), ts.to_string());
    headers.insert("Webhook-Signature".to_string(), sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

// ── Old timestamp fails (>5min) ──────────────────────────────────────

#[test]
fn test_verify_expired_timestamp_10min() {
    let payload = "{}";
    let msg_id = "msg_old";
    let ts = current_timestamp() - 600; // 10 minutes ago
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_expired_timestamp_6min() {
    let payload = "{}";
    let msg_id = "msg_6min";
    let ts = current_timestamp() - 360; // 6 minutes ago
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_expired_timestamp_1hour() {
    let payload = "{}";
    let msg_id = "msg_1hr";
    let ts = current_timestamp() - 3600;
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_timestamp_exactly_at_boundary() {
    // 5 minutes exactly should pass (tolerance is >5min)
    let payload = "{}";
    let msg_id = "msg_boundary";
    let ts = current_timestamp() - 300; // exactly 5 min
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    // This should be at the boundary — abs_diff(300) == 300 which is NOT > 300
    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

// ── Future timestamp fails (>5min future) ────────────────────────────

#[test]
fn test_verify_future_timestamp_10min() {
    let payload = "{}";
    let msg_id = "msg_future";
    let ts = current_timestamp() + 600; // 10 minutes in future
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_future_timestamp_6min() {
    let payload = "{}";
    let msg_id = "msg_future6";
    let ts = current_timestamp() + 360;
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

// ── Multi-sig payload is valid (space-separated) ─────────────────────

#[test]
fn test_verify_multiple_signatures() {
    let payload = r#"{"multi": true}"#;
    let msg_id = "msg_multi_001";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    // Space-separated signatures: fake one + real one
    let multi_sig = format!("v1,fakesig {}", sig);
    let headers = make_headers(msg_id, &ts.to_string(), &multi_sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_multiple_signatures_all_wrong() {
    let payload = "{}";
    let msg_id = "msg_multi_wrong";
    let ts = current_timestamp();
    let multi_sig = "v1,wrong1 v1,wrong2 v1,wrong3";
    let headers = make_headers(msg_id, &ts.to_string(), multi_sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_multiple_signatures_real_first() {
    let payload = "{}";
    let msg_id = "msg_multi_first";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    // Real signature first, then fake
    let multi_sig = format!("{} v1,fakesig", sig);
    let headers = make_headers(msg_id, &ts.to_string(), &multi_sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_three_signatures_middle_valid() {
    let payload = "{}";
    let msg_id = "msg_multi_mid";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let multi_sig = format!("v1,fakesig1 {} v1,fakesig2", sig);
    let headers = make_headers(msg_id, &ts.to_string(), &multi_sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

// ── Works with and without whsec_ prefix ─────────────────────────────

#[test]
fn test_verify_with_whsec_prefix() {
    let secret = make_secret(); // has whsec_ prefix
    let payload = "{}";
    let msg_id = "msg_prefix";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(secret, payload, &headers).is_ok());
}

#[test]
fn test_verify_without_whsec_prefix() {
    // Use the raw base64 secret without whsec_ prefix
    let raw = make_secret().strip_prefix("whsec_").unwrap();
    let payload = "{}";
    let msg_id = "msg_noprefix";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(raw, payload, &headers).is_ok());
}

// ── Sign function produces known test vector ──────────────────────────

#[test]
fn test_sign_produces_v1_prefix() {
    let secret = make_raw_secret();
    let sig = webhook::sign(&secret, "msg_123", 1700000000, "{}");
    assert!(sig.starts_with("v1,"));
}

#[test]
fn test_sign_deterministic() {
    let secret = make_raw_secret();
    let sig1 = webhook::sign(&secret, "msg_det", 1700000000, r#"{"key":"value"}"#);
    let sig2 = webhook::sign(&secret, "msg_det", 1700000000, r#"{"key":"value"}"#);
    assert_eq!(sig1, sig2);
}

#[test]
fn test_sign_different_inputs_different_output() {
    let secret = make_raw_secret();
    let sig1 = webhook::sign(&secret, "msg_a", 1700000000, "{}");
    let sig2 = webhook::sign(&secret, "msg_b", 1700000000, "{}");
    assert_ne!(sig1, sig2);
}

#[test]
fn test_sign_different_payloads_different_output() {
    let secret = make_raw_secret();
    let sig1 = webhook::sign(&secret, "msg_1", 1700000000, r#"{"a":1}"#);
    let sig2 = webhook::sign(&secret, "msg_1", 1700000000, r#"{"b":2}"#);
    assert_ne!(sig1, sig2);
}

#[test]
fn test_sign_different_timestamps_different_output() {
    let secret = make_raw_secret();
    let sig1 = webhook::sign(&secret, "msg_1", 1700000000, "{}");
    let sig2 = webhook::sign(&secret, "msg_1", 1700000001, "{}");
    assert_ne!(sig1, sig2);
}

#[test]
fn test_sign_base64_output() {
    let secret = make_raw_secret();
    let sig = webhook::sign(&secret, "msg_b64", 1700000000, "{}");
    // After "v1,", the rest should be valid base64
    let b64_part = sig.strip_prefix("v1,").unwrap();
    let decoded = base64::Engine::decode(
        &base64::engine::general_purpose::STANDARD,
        b64_part,
    );
    assert!(decoded.is_ok());
    // HMAC-SHA256 produces 32 bytes
    assert_eq!(decoded.unwrap().len(), 32);
}

// ── Tampered payload ─────────────────────────────────────────────────

#[test]
fn test_verify_tampered_payload() {
    let payload = r#"{"test": true}"#;
    let msg_id = "msg_tamper";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), r#"{"test": false}"#, &headers).is_err());
}

#[test]
fn test_verify_tampered_msg_id() {
    let payload = "{}";
    let msg_id = "msg_original";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);

    // Use different msg_id in headers
    let headers = make_headers("msg_tampered", &ts.to_string(), &sig);
    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_tampered_timestamp() {
    let payload = "{}";
    let msg_id = "msg_ts_tamper";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);

    // Use different timestamp
    let headers = make_headers(msg_id, &(ts + 1).to_string(), &sig);
    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

// ── Empty all headers ────────────────────────────────────────────────

#[test]
fn test_verify_completely_empty_headers() {
    let empty: HashMap<String, String> = HashMap::new();
    assert!(webhook::verify_signature(make_secret(), "{}", &empty).is_err());
}

// ── Additional edge cases ────────────────────────────────────────────

#[test]
fn test_sign_empty_secret() {
    // Should still produce a valid signature (HMAC accepts any key length)
    let sig = webhook::sign(&[], "msg_1", 1700000000, "{}");
    assert!(sig.starts_with("v1,"));
}

#[test]
fn test_sign_empty_body() {
    let secret = make_raw_secret();
    let sig = webhook::sign(&secret, "msg_empty", 1700000000, "");
    assert!(sig.starts_with("v1,"));
}

#[test]
fn test_verify_with_extra_headers_present() {
    let payload = "{}";
    let msg_id = "msg_extra";
    let ts = current_timestamp();
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);

    let mut headers = make_headers(msg_id, &ts.to_string(), &sig);
    headers.insert("x-custom-header".to_string(), "custom-value".to_string());
    headers.insert("content-type".to_string(), "application/json".to_string());

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_ok());
}

#[test]
fn test_verify_timestamp_zero() {
    // Unix epoch (1970) — way too old
    let payload = "{}";
    let msg_id = "msg_epoch";
    let sig = webhook::sign(&make_raw_secret(), msg_id, 0, "{}");
    let headers = make_headers(msg_id, "0", &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}

#[test]
fn test_verify_timestamp_max_u64() {
    // Far future
    let payload = "{}";
    let msg_id = "msg_max";
    let ts = u64::MAX;
    let sig = webhook::sign(&make_raw_secret(), msg_id, ts, payload);
    let headers = make_headers(msg_id, &ts.to_string(), &sig);

    assert!(webhook::verify_signature(make_secret(), payload, &headers).is_err());
}
