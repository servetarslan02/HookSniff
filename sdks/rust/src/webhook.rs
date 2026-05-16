//! HookSniff Webhook Signature Verification
//!
//! Verifies incoming webhook signatures using HMAC-SHA256.
//! Compatible with Standard Webhooks format (whsec_ prefix secrets).

use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::collections::HashMap;

type HmacSha256 = Hmac<Sha256>;

const TIMESTAMP_TOLERANCE_SECONDS: u64 = 5 * 60; // 5 minutes

/// Error returned when webhook verification fails.
#[derive(Debug)]
pub struct WebhookVerificationError(pub String);

impl std::fmt::Display for WebhookVerificationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "WebhookVerificationError: {}", self.0)
    }
}

impl std::error::Error for WebhookVerificationError {}

/// Decode a whsec_ prefixed secret to raw bytes.
fn decode_secret(secret: &str) -> Vec<u8> {
    let raw = if secret.starts_with("whsec_") {
        &secret[6..]
    } else {
        secret
    };

    // Try base64 decode first
    if let Ok(bytes) = BASE64.decode(raw) {
        bytes
    } else {
        raw.as_bytes().to_vec()
    }
}

/// Build the signed content string per Standard Webhooks spec:
/// `{msgId}.{timestamp}.{body}`
fn build_signed_content(msg_id: &str, timestamp: &str, body: &str) -> String {
    format!("{}.{}.{}", msg_id, timestamp, body)
}

/// Compute HMAC-SHA256 signature and return in Standard Webhooks format.
pub fn sign(secret: &[u8], msg_id: &str, timestamp: u64, body: &str) -> String {
    let content = build_signed_content(msg_id, &timestamp.to_string(), body);
    let mut mac = HmacSha256::new_from_slice(secret).expect("HMAC accepts any key length");
    mac.update(content.as_bytes());
    let result = mac.finalize().into_bytes();
    format!("v1,{}", BASE64.encode(result))
}

/// Verify a webhook payload against its signature headers.
///
/// `headers` should contain keys like `webhook-id`, `webhook-timestamp`, `webhook-signature`
/// (or `svix-id`, `svix-timestamp`, `svix-signature`).
///
/// Returns the payload as-is on success, or an error on failure.
pub fn verify_signature(
    secret: &str,
    payload: &str,
    headers: &HashMap<String, String>,
) -> Result<(), WebhookVerificationError> {
    // Normalize headers to lowercase
    let normalized: HashMap<String, String> = headers
        .iter()
        .map(|(k, v)| (k.to_lowercase(), v.clone()))
        .collect();

    let msg_id = normalized
        .get("svix-id")
        .or_else(|| normalized.get("webhook-id"))
        .ok_or_else(|| WebhookVerificationError("Missing webhook-id header".to_string()))?;

    let timestamp_str = normalized
        .get("svix-timestamp")
        .or_else(|| normalized.get("webhook-timestamp"))
        .ok_or_else(|| WebhookVerificationError("Missing webhook-timestamp header".to_string()))?;

    let signature = normalized
        .get("svix-signature")
        .or_else(|| normalized.get("webhook-signature"))
        .ok_or_else(|| WebhookVerificationError("Missing webhook-signature header".to_string()))?;

    // Validate timestamp
    let timestamp: u64 = timestamp_str
        .parse()
        .map_err(|_| WebhookVerificationError("Invalid webhook-timestamp header".to_string()))?;

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("system clock is after UNIX epoch")
        .as_secs();

    if now.abs_diff(timestamp) > TIMESTAMP_TOLERANCE_SECONDS {
        return Err(WebhookVerificationError(format!(
            "Webhook timestamp is too old or too new (tolerance: {}s)",
            TIMESTAMP_TOLERANCE_SECONDS
        )));
    }

    // Compute expected signature
    let secret_bytes = decode_secret(secret);
    let expected = sign(&secret_bytes, msg_id, timestamp, payload);

    // Timing-safe comparison across all provided signatures (space-separated per Standard Webhooks)
    let expected_parts: Vec<&str> = expected.splitn(2, ',').collect();
    let expected_sig = if expected_parts.len() > 1 {
        expected_parts[1]
    } else {
        expected_parts[0]
    };

    for sig_part in signature.split(' ') {
        let sig_part = sig_part.trim();
        if sig_part.is_empty() {
            continue;
        }
        // Each signature must be in format "v1,<base64>"
        if !sig_part.starts_with("v1,") {
            continue;
        }
        let sig_value = &sig_part[3..];

        if timing_safe_eq(expected_sig.as_bytes(), sig_value.as_bytes()) {
            return Ok(());
        }
    }

    Err(WebhookVerificationError("Invalid webhook signature".to_string()))
}

/// Timing-safe byte comparison.
fn timing_safe_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut result = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        result |= x ^ y;
    }
    result == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn make_headers(msg_id: &str, timestamp: &str, sig: &str) -> HashMap<String, String> {
        let mut h = HashMap::new();
        h.insert("webhook-id".to_string(), msg_id.to_string());
        h.insert("webhook-timestamp".to_string(), timestamp.to_string());
        h.insert("webhook-signature".to_string(), sig.to_string());
        h
    }

    fn make_secret() -> &'static str {
        "whsec_dGVzdHNlY3JldGtleWZvcmhvb2tzbmlmZg=="
    }

    fn make_raw_secret() -> Vec<u8> {
        decode_secret(make_secret())
    }

    #[test]
    fn test_decode_secret_with_prefix() {
        let s = decode_secret("whsec_dGVzdHNlY3JldA==");
        assert!(!s.is_empty());
    }

    #[test]
    fn test_decode_secret_without_prefix() {
        let s = decode_secret("dGVzdHNlY3JldA==");
        assert!(!s.is_empty());
    }

    #[test]
    fn test_sign_produces_v1_prefix() {
        let secret = make_raw_secret();
        let sig = sign(&secret, "msg_123", 1700000000, "{}");
        assert!(sig.starts_with("v1,"));
    }

    #[test]
    fn test_verify_valid_signature() {
        let secret = make_secret();
        let payload = r#"{"test": true}"#;
        let msg_id = "msg_test_001";
        let ts = current_timestamp();
        let sig = sign(&make_raw_secret(), msg_id, ts, payload);
        let headers = make_headers(msg_id, &ts.to_string(), &sig);

        assert!(verify_signature(secret, payload, &headers).is_ok());
    }

    #[test]
    fn test_verify_invalid_signature() {
        let secret = make_secret();
        let payload = r#"{"test": true}"#;
        let msg_id = "msg_test_002";
        let ts = current_timestamp();
        let headers = make_headers(msg_id, &ts.to_string(), "v1,invalidsignature");

        assert!(verify_signature(secret, payload, &headers).is_err());
    }

    #[test]
    fn test_verify_expired_timestamp() {
        let secret = make_secret();
        let payload = r#"{"test": true}"#;
        let msg_id = "msg_test_003";
        let ts = current_timestamp() - 600; // 10 minutes ago
        let sig = sign(&make_raw_secret(), msg_id, ts, payload);
        let headers = make_headers(msg_id, &ts.to_string(), &sig);

        assert!(verify_signature(secret, payload, &headers).is_err());
    }

    #[test]
    fn test_verify_missing_id_header() {
        let secret = make_secret();
        let payload = "{}";
        let ts = current_timestamp();
        let mut headers = HashMap::new();
        headers.insert("webhook-timestamp".to_string(), ts.to_string());
        headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

        assert!(verify_signature(secret, payload, &headers).is_err());
    }

    #[test]
    fn test_verify_missing_timestamp_header() {
        let secret = make_secret();
        let payload = "{}";
        let mut headers = HashMap::new();
        headers.insert("webhook-id".to_string(), "msg_1".to_string());
        headers.insert("webhook-signature".to_string(), "v1,sig".to_string());

        assert!(verify_signature(secret, payload, &headers).is_err());
    }

    #[test]
    fn test_verify_missing_signature_header() {
        let secret = make_secret();
        let payload = "{}";
        let ts = current_timestamp();
        let mut headers = HashMap::new();
        headers.insert("webhook-id".to_string(), "msg_1".to_string());
        headers.insert("webhook-timestamp".to_string(), ts.to_string());

        assert!(verify_signature(secret, payload, &headers).is_err());
    }

    #[test]
    fn test_verify_svix_headers() {
        let secret = make_secret();
        let payload = r#"{"event":"test"}"#;
        let msg_id = "msg_svix_001";
        let ts = current_timestamp();
        let sig = sign(&make_raw_secret(), msg_id, ts, payload);

        let mut headers = HashMap::new();
        headers.insert("svix-id".to_string(), msg_id.to_string());
        headers.insert("svix-timestamp".to_string(), ts.to_string());
        headers.insert("svix-signature".to_string(), sig);

        assert!(verify_signature(secret, payload, &headers).is_ok());
    }

    #[test]
    fn test_verify_multiple_signatures() {
        let secret = make_secret();
        let payload = r#"{"multi": true}"#;
        let msg_id = "msg_multi_001";
        let ts = current_timestamp();
        let sig = sign(&make_raw_secret(), msg_id, ts, payload);
        let multi_sig = format!("v1,fakesig {}", sig);

        let headers = make_headers(msg_id, &ts.to_string(), &multi_sig);
        assert!(verify_signature(secret, payload, &headers).is_ok());
    }

    #[test]
    fn test_verify_tampered_payload() {
        let secret = make_secret();
        let payload = r#"{"test": true}"#;
        let msg_id = "msg_tamper_001";
        let ts = current_timestamp();
        let sig = sign(&make_raw_secret(), msg_id, ts, payload);
        let headers = make_headers(msg_id, &ts.to_string(), &sig);

        // Verify with different payload
        assert!(verify_signature(secret, r#"{"test": false}"#, &headers).is_err());
    }

    #[test]
    fn test_timing_safe_eq_equal() {
        assert!(timing_safe_eq(b"hello", b"hello"));
    }

    #[test]
    fn test_timing_safe_eq_not_equal() {
        assert!(!timing_safe_eq(b"hello", b"world"));
    }

    #[test]
    fn test_timing_safe_eq_different_lengths() {
        assert!(!timing_safe_eq(b"short", b"longer string"));
    }
}
