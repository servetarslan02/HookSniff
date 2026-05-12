//! Standard Webhooks signing and verification.
//!
//! Follows the Standard Webhooks spec (https://www.standardwebhooks.com/).
//! Compatible with Svix's verification flow.
//!
//! Used by both API (inbound verification) and Worker (outbound signing).

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use hmac::{Hmac, KeyInit, Mac};
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

/// Verification errors.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum VerificationError {
    #[error("Invalid webhook timestamp")]
    InvalidTimestamp,
    #[error("Webhook timestamp expired: age {age_secs}s exceeds tolerance {tolerance_secs}s")]
    TimestampExpired { age_secs: i64, tolerance_secs: i64 },
    #[error("Webhook signature mismatch")]
    SignatureMismatch,
}

/// Decode a Standard Webhooks secret.
///
/// Secrets may have a `whsec_` prefix. The remainder is base64-encoded.
/// If decoding fails, returns the raw bytes (for backward compat with plain secrets).
///
/// Item 345: Logs a warning when falling back to raw bytes, as this may indicate
/// a misconfigured secret. In production, all secrets should be `whsec_` + base64.
pub fn decode_secret(secret: &str) -> Vec<u8> {
    let stripped = secret.strip_prefix(SECRET_PREFIX).unwrap_or(secret);
    match BASE64.decode(stripped) {
        Ok(bytes) => bytes,
        Err(_) => {
            // Item 345: Warn on fallback — likely a misconfigured or legacy secret.
            // Don't log the actual secret value (security).
            tracing::warn!(
                "Secret decoding: base64 decode failed, falling back to raw bytes. \
                 Ensure secrets use 'whsec_' + base64 format. \
                 (secret length: {} chars)",
                secret.len()
            );
            secret.as_bytes().to_vec()
        }
    }
}

/// Compute Standard Webhooks HMAC-SHA256 signature.
///
/// Returns a `v1,<base64(hmac)>` formatted signature string.
/// The signed payload is: `{msg_id}.{timestamp}.{body}`
pub fn compute_standard_signature(
    secret: &str,
    msg_id: &str,
    timestamp: &str,
    body: &str,
) -> String {
    let signed_content = format!("{}.{}.{}", msg_id, timestamp, body);
    let secret_bytes = decode_secret(secret);

    let mut mac = HmacSha256::new_from_slice(&secret_bytes).expect("HMAC can take key of any size");
    mac.update(signed_content.as_bytes());
    let result = mac.finalize();
    let signature = BASE64.encode(result.into_bytes());

    format!("{},{}", SIGNATURE_VERSION, signature)
}

/// Verify a Standard Webhooks signature.
///
/// Supports both branded (`svix-*`) and unbranded (`webhook-*`) headers.
/// Uses constant-time comparison to prevent timing attacks.
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

    // Check each signature in the header (may have multiple, space-separated)
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

        // Constant-time comparison using XOR fold
        if sig_bytes.len() == expected_bytes.len() {
            let mut diff = 0u8;
            for (a, b) in sig_bytes.iter().zip(expected_bytes.iter()) {
                diff |= a ^ b;
            }
            if diff == 0 {
                return Ok(());
            }
        }
    }

    Err(VerificationError::SignatureMismatch)
}

/// Compute legacy HMAC-SHA256 signature (hex-encoded, for backward compat).
pub fn compute_hmac(secret: &str, payload: &str) -> String {
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

/// Verify legacy HMAC-SHA256 signature.
pub fn verify_hmac(secret: &str, payload: &str, expected_signature: &str) -> bool {
    let expected_bytes = match hex::decode(expected_signature) {
        Ok(b) => b,
        Err(_) => return false,
    };

    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let computed_bytes = mac.finalize().into_bytes();

    if expected_bytes.len() != computed_bytes.len() {
        return false;
    }

    // Constant-time comparison
    let mut diff = 0u8;
    for (a, b) in expected_bytes.iter().zip(computed_bytes.iter()) {
        diff |= a ^ b;
    }
    diff == 0
}

/// Verify signature with rotation support.
///
/// Tries current secret first, then old secret if rotation was recent.
pub fn verify_with_rotation(
    current_secret: &str,
    old_secret: Option<&str>,
    payload: &str,
    expected_signature: &str,
    secret_rotated_at: Option<chrono::DateTime<chrono::Utc>>,
) -> bool {
    if verify_hmac(current_secret, payload, expected_signature) {
        return true;
    }

    if let (Some(old), Some(rotated_at)) = (old_secret, secret_rotated_at) {
        let twenty_four_hours_ago = chrono::Utc::now() - chrono::Duration::hours(24);
        if rotated_at > twenty_four_hours_ago {
            return verify_hmac(old, payload, expected_signature);
        }
    }

    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_standard_signature_format() {
        let sig = compute_standard_signature("whsec_test123", "msg_123", "1234567890", "{}");
        assert!(sig.starts_with("v1,"));
        let encoded = &sig[3..];
        assert!(BASE64.decode(encoded).is_ok());
    }

    #[test]
    fn test_verify_standard_signature_valid() {
        let secret = "whsec_test123";
        let msg_id = "msg_test_001";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"order.created"}"#;

        let sig = compute_standard_signature(secret, msg_id, timestamp, body);
        assert!(verify_standard_signature(secret, msg_id, timestamp, &sig, body, None).is_ok());
    }

    #[test]
    fn test_verify_standard_signature_expired() {
        let secret = "whsec_test123";
        let msg_id = "msg_test_002";
        let old_timestamp = (chrono::Utc::now().timestamp() - 600).to_string();
        let body = r#"{"event":"order.created"}"#;

        let sig = compute_standard_signature(secret, msg_id, &old_timestamp, body);
        let result = verify_standard_signature(secret, msg_id, &old_timestamp, &sig, body, None);
        assert!(matches!(
            result,
            Err(VerificationError::TimestampExpired { .. })
        ));
    }

    #[test]
    fn test_verify_standard_signature_wrong_secret() {
        let msg_id = "msg_test_003";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"order.created"}"#;

        let sig = compute_standard_signature("whsec_correct", msg_id, timestamp, body);
        let result = verify_standard_signature("whsec_wrong", msg_id, timestamp, &sig, body, None);
        assert_eq!(result, Err(VerificationError::SignatureMismatch));
    }

    #[test]
    fn test_verify_standard_signature_multiple_sigs() {
        let secret = "whsec_test123";
        let msg_id = "msg_test_004";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"test"}"#;

        let valid_sig = compute_standard_signature(secret, msg_id, timestamp, body);
        let header = format!("v1,invalidbase64 {}", valid_sig);
        assert!(verify_standard_signature(secret, msg_id, timestamp, &header, body, None).is_ok());
    }

    #[test]
    fn test_hmac_consistency() {
        let secret = "whsec_test123";
        let payload = r#"{"event":"test"}"#;
        let sig1 = compute_hmac(secret, payload);
        let sig2 = compute_hmac(secret, payload);
        assert_eq!(sig1, sig2);
    }

    #[test]
    fn test_hmac_verify() {
        let secret = "whsec_test123";
        let payload = r#"{"event":"test"}"#;
        let sig = compute_hmac(secret, payload);
        assert!(verify_hmac(secret, payload, &sig));
        assert!(!verify_hmac(secret, payload, "wrong_sig"));
    }

    #[test]
    fn test_different_secrets_different_sigs() {
        let payload = r#"{"event":"test"}"#;
        let sig1 = compute_hmac("secret1", payload);
        let sig2 = compute_hmac("secret2", payload);
        assert_ne!(sig1, sig2);
    }

    #[test]
    fn test_verify_with_rotation() {
        let current = "whsec_current";
        let old = "whsec_old";
        let payload = r#"{"event":"test"}"#;
        let sig_current = compute_hmac(current, payload);
        let sig_old = compute_hmac(old, payload);

        assert!(verify_with_rotation(
            current,
            Some(old),
            payload,
            &sig_current,
            Some(chrono::Utc::now()),
        ));

        assert!(verify_with_rotation(
            current,
            Some(old),
            payload,
            &sig_old,
            Some(chrono::Utc::now()),
        ));

        assert!(!verify_with_rotation(
            current,
            Some(old),
            payload,
            &sig_old,
            Some(chrono::Utc::now() - chrono::Duration::hours(25)),
        ));

        assert!(!verify_with_rotation(current, None, payload, &sig_old, None,));
    }

    #[test]
    fn test_decode_secret_with_prefix() {
        let raw = b"test123";
        let encoded = BASE64.encode(raw);
        let secret = format!("whsec_{}", encoded);
        let decoded = decode_secret(&secret);
        assert_eq!(decoded, raw);
    }

    #[test]
    fn test_decode_secret_plain_fallback() {
        let decoded = decode_secret("plain_secret");
        assert_eq!(decoded, b"plain_secret");
    }
}
