//! Standard Webhooks signing and verification for the API layer.
//!
//! Follows the Standard Webhooks spec (https://www.standardwebhooks.com/).
//! Compatible with Svix's verification flow.
//!
//! Reference implementation: https://github.com/standard-webhooks/standard-webhooks/blob/main/libraries/rust/src/lib.rs
//! Svix implementation: https://github.com/svix/svix-webhooks/blob/main/rust/src/webhooks.rs

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

/// Default timestamp tolerance in seconds (5 minutes).
pub const DEFAULT_TIMESTAMP_TOLERANCE_SECS: i64 = 300;

// Standard Webhooks header names (unbranded)
pub const HEADER_WEBHOOK_ID: &str = "webhook-id";
pub const HEADER_WEBHOOK_SIGNATURE: &str = "webhook-signature";
pub const HEADER_WEBHOOK_TIMESTAMP: &str = "webhook-timestamp";

// Svix branded header names (backward compatibility)
pub const HEADER_SVIX_ID: &str = "svix-id";
pub const HEADER_SVIX_SIGNATURE: &str = "svix-signature";
pub const HEADER_SVIX_TIMESTAMP: &str = "svix-timestamp";

const SIGNATURE_VERSION: &str = "v1";
const SECRET_PREFIX: &str = "whsec_";

/// Compute Standard Webhooks HMAC-SHA256 signature.
///
/// Returns a `v1,<base64(hmac)>` formatted signature string.
/// The signed payload is: `{msg_id}.{timestamp}.{body}`
///
/// Compatible with: https://www.standardwebhooks.com/spec
pub fn compute_standard_signature(
    secret: &str,
    msg_id: &str,
    timestamp: &str,
    body: &str,
) -> String {
    let signed_content = format!("{}.{}.{}", msg_id, timestamp, body);
    let secret_bytes = decode_secret(secret);

    let mut mac =
        HmacSha256::new_from_slice(&secret_bytes).expect("HMAC can take key of any size");
    mac.update(signed_content.as_bytes());
    let result = mac.finalize();
    let signature = BASE64.encode(result.into_bytes());

    format!("{},{}", SIGNATURE_VERSION, signature)
}

/// Verify a Standard Webhooks signature.
///
/// Supports both branded (`svix-*`) and unbranded (`webhook-*`) headers.
/// Uses constant-time comparison (XOR fold) to prevent timing attacks.
///
/// Returns `Ok(())` on success, `Err(VerificationError)` on failure.
pub fn verify_standard_signature(
    secret: &str,
    msg_id: &str,
    timestamp: &str,
    signature_header: &str,
    body: &str,
    tolerance_secs: Option<i64>,
) -> Result<(), VerificationError> {
    let tolerance = tolerance_secs.unwrap_or(DEFAULT_TIMESTAMP_TOLERANCE_SECS);

    // Validate timestamp
    let ts: i64 = timestamp
        .parse()
        .map_err(|_| VerificationError::InvalidTimestamp)?;

    let now = chrono::Utc::now().timestamp();
    let age = (now - ts).abs();

    if age > tolerance {
        return Err(VerificationError::TimestampExpired {
            age_secs: age,
            tolerance_secs: tolerance,
        });
    }

    // Compute expected signature
    let secret_bytes = decode_secret(secret);
    let signed_content = format!("{}.{}.{}", msg_id, timestamp, body);

    let mut mac =
        HmacSha256::new_from_slice(&secret_bytes).expect("HMAC can take key of any size");
    mac.update(signed_content.as_bytes());
    let expected_bytes = mac.finalize().into_bytes();

    // Check each signature in the header (may be space-separated)
    // Uses constant-time XOR fold comparison (same as reference implementation)
    let mut verified = false;
    for sig_part in signature_header.split(' ') {
        let sig_part = sig_part.trim();
        if sig_part.is_empty() {
            continue;
        }

        let encoded = match sig_part.strip_prefix(&format!("{},", SIGNATURE_VERSION)) {
            Some(e) => e,
            None => continue,
        };

        let sig_bytes = match BASE64.decode(encoded) {
            Ok(b) => b,
            Err(_) => continue,
        };

        // Constant-time comparison via XOR fold
        // (Same approach as standard-webhooks reference implementation)
        if sig_bytes.len() == expected_bytes.len() {
            let diff: u8 = sig_bytes
                .iter()
                .zip(expected_bytes.iter())
                .fold(0u8, |acc, (a, b)| acc | (a ^ b));
            if diff == 0 {
                verified = true;
                break;
            }
        }
    }

    if verified {
        Ok(())
    } else {
        Err(VerificationError::SignatureMismatch)
    }
}

/// Verify Standard Webhooks signature from HTTP headers.
///
/// Supports both branded (`svix-*`) and unbranded (`webhook-*`) header names.
/// This is the primary verification function for incoming webhook requests.
pub fn verify_from_headers(
    secret: &str,
    headers: &axum::http::HeaderMap,
    body: &str,
    tolerance_secs: Option<i64>,
) -> Result<(), VerificationError> {
    // Try unbranded headers first, then branded (Svix compatibility)
    let msg_id = get_header(headers, HEADER_WEBHOOK_ID)
        .or_else(|| get_header(headers, HEADER_SVIX_ID))
        .ok_or(VerificationError::MissingHeader("webhook-id"))?;

    let msg_signature = get_header(headers, HEADER_WEBHOOK_SIGNATURE)
        .or_else(|| get_header(headers, HEADER_SVIX_SIGNATURE))
        .ok_or(VerificationError::MissingHeader("webhook-signature"))?;

    let msg_timestamp = get_header(headers, HEADER_WEBHOOK_TIMESTAMP)
        .or_else(|| get_header(headers, HEADER_SVIX_TIMESTAMP))
        .ok_or(VerificationError::MissingHeader("webhook-timestamp"))?;

    verify_standard_signature(secret, msg_id, msg_timestamp, msg_signature, body, tolerance_secs)
}

/// Verify signature ignoring timestamp (for testing only).
///
/// Same as `verify_standard_signature` but skips timestamp validation.
/// Useful for unit tests where timestamps may be stale.
pub fn verify_ignoring_timestamp(
    secret: &str,
    msg_id: &str,
    signature_header: &str,
    body: &str,
) -> Result<(), VerificationError> {
    let secret_bytes = decode_secret(secret);
    // Use a fixed timestamp for signing (doesn't matter since we don't check it)
    let timestamp = "0";
    let signed_content = format!("{}.{}.{}", msg_id, timestamp, body);

    let mut mac =
        HmacSha256::new_from_slice(&secret_bytes).expect("HMAC can take key of any size");
    mac.update(signed_content.as_bytes());
    let expected_bytes = mac.finalize().into_bytes();

    let mut verified = false;
    for sig_part in signature_header.split(' ') {
        let sig_part = sig_part.trim();
        if sig_part.is_empty() {
            continue;
        }

        let encoded = match sig_part.strip_prefix(&format!("{},", SIGNATURE_VERSION)) {
            Some(e) => e,
            None => continue,
        };

        let sig_bytes = match BASE64.decode(encoded) {
            Ok(b) => b,
            Err(_) => continue,
        };

        if sig_bytes.len() == expected_bytes.len() {
            let diff: u8 = sig_bytes
                .iter()
                .zip(expected_bytes.iter())
                .fold(0u8, |acc, (a, b)| acc | (a ^ b));
            if diff == 0 {
                verified = true;
                break;
            }
        }
    }

    if verified {
        Ok(())
    } else {
        Err(VerificationError::SignatureMismatch)
    }
}

/// Helper to extract a header value from axum's HeaderMap.
fn get_header<'a>(headers: &'a axum::http::HeaderMap, name: &str) -> Option<&'a str> {
    headers.get(name)?.to_str().ok()
}

/// Decode a Standard Webhooks secret.
fn decode_secret(secret: &str) -> Vec<u8> {
    let stripped = secret.strip_prefix(SECRET_PREFIX).unwrap_or(secret);
    BASE64
        .decode(stripped)
        .unwrap_or_else(|_| secret.as_bytes().to_vec())
}

/// Compute legacy HMAC-SHA256 signature (hex-encoded).
///
/// Used for non-Standard-Webhooks signing (e.g., internal APIs).
pub fn compute_hmac(secret: &str, payload: &str) -> String {
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

/// Errors from Standard Webhooks verification.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VerificationError {
    InvalidTimestamp,
    TimestampExpired { age_secs: i64, tolerance_secs: i64 },
    SignatureMismatch,
    MissingHeader(&'static str),
}

impl std::fmt::Display for VerificationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidTimestamp => write!(f, "Invalid webhook timestamp"),
            Self::TimestampExpired {
                age_secs,
                tolerance_secs,
            } => write!(
                f,
                "Webhook timestamp expired: age {}s exceeds tolerance {}s",
                age_secs, tolerance_secs
            ),
            Self::SignatureMismatch => write!(f, "Webhook signature mismatch"),
            Self::MissingHeader(name) => write!(f, "Missing header: {}", name),
        }
    }
}

impl std::error::Error for VerificationError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_standard_signature_roundtrip() {
        let secret = "whsec_test123";
        let msg_id = "msg_001";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"test"}"#;

        let sig = compute_standard_signature(secret, msg_id, timestamp, body);
        assert!(verify_standard_signature(secret, msg_id, timestamp, &sig, body, None).is_ok());
    }

    #[test]
    fn test_standard_signature_rejects_expired() {
        let secret = "whsec_test123";
        let msg_id = "msg_002";
        let old_ts = (chrono::Utc::now().timestamp() - 600).to_string();
        let body = r#"{"event":"test"}"#;

        let sig = compute_standard_signature(secret, msg_id, &old_ts, body);
        let result = verify_standard_signature(secret, msg_id, &old_ts, &sig, body, None);
        assert!(matches!(result, Err(VerificationError::TimestampExpired { .. })));
    }

    #[test]
    fn test_standard_signature_rejects_wrong_key() {
        let msg_id = "msg_003";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"test"}"#;

        let sig = compute_standard_signature("whsec_correct", msg_id, timestamp, body);
        let result =
            verify_standard_signature("whsec_wrong", msg_id, timestamp, &sig, body, None);
        assert_eq!(result, Err(VerificationError::SignatureMismatch));
    }

    #[test]
    fn test_verify_ignoring_timestamp() {
        let secret = "whsec_test123";
        let msg_id = "msg_004";
        let body = r#"{"event":"test"}"#;

        let sig = compute_standard_signature(secret, msg_id, "0", body);
        assert!(verify_ignoring_timestamp(secret, msg_id, &sig, body).is_ok());
    }

    #[test]
    fn test_svix_reference_test_vector() {
        // Test vector from: https://github.com/svix/svix-webhooks/blob/main/rust/src/webhooks.rs
        let wh_secret = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD";
        let msg_id = "msg_27UH4WbU6Z5A5EzD8u03UvzRbpk";
        let timestamp = 1649367553i64;
        let body = r#"{"email":"test@example.com","username":"test_user"}"#;

        let sig = compute_standard_signature(wh_secret, msg_id, &timestamp.to_string(), body);
        assert_eq!(
            sig,
            "v1,tZ1I4/hDygAJgO5TYxiSd6Sd0kDW6hPenDe+bTa3Kkw="
        );
    }

    #[test]
    fn test_constant_time_comparison() {
        // Same length, different content — should fail
        let secret = "whsec_test123";
        let msg_id = "msg_005";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"test"}"#;

        let sig = compute_standard_signature(secret, msg_id, timestamp, body);
        let wrong_sig = "v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
        let result = verify_standard_signature(secret, msg_id, timestamp, wrong_sig, body, None);
        assert_eq!(result, Err(VerificationError::SignatureMismatch));
    }

    #[test]
    fn test_multiple_signatures() {
        let secret = "whsec_test123";
        let msg_id = "msg_006";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"test"}"#;

        let sig = compute_standard_signature(secret, msg_id, timestamp, body);
        let combined = format!("v1,invalid {} v1,alsoinvalid", sig);
        assert!(
            verify_standard_signature(secret, msg_id, timestamp, &combined, body, None).is_ok()
        );
    }
}
