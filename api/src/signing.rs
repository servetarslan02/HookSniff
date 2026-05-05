//! Standard Webhooks signing and verification for the API layer.
//!
//! Follows the Standard Webhooks spec (https://www.standardwebhooks.com/).

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

/// Default timestamp tolerance in seconds (5 minutes).
pub const DEFAULT_TIMESTAMP_TOLERANCE_SECS: i64 = 300;

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

    let mut mac =
        HmacSha256::new_from_slice(&secret_bytes).expect("HMAC can take key of any size");
    mac.update(signed_content.as_bytes());
    let result = mac.finalize();
    let signature = BASE64.encode(result.into_bytes());

    format!("v1,{}", signature)
}

/// Verify a Standard Webhooks signature.
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
    let mut verified = false;
    for sig_part in signature_header.split(' ') {
        let sig_part = sig_part.trim();
        if sig_part.is_empty() {
            continue;
        }

        let encoded = match sig_part.strip_prefix("v1,") {
            Some(e) => e,
            None => continue,
        };

        let sig_bytes = match BASE64.decode(encoded) {
            Ok(b) => b,
            Err(_) => continue,
        };

        if sig_bytes.len() == expected_bytes.len() {
            use hmac::digest::CtOutput;
            let expected = CtOutput::new(
                hmac::digest::Output::<HmacSha256>::clone_from_slice(&expected_bytes),
            );
            let actual = CtOutput::new(
                hmac::digest::Output::<HmacSha256>::clone_from_slice(&sig_bytes),
            );
            if actual == expected {
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

/// Decode a Standard Webhooks secret.
fn decode_secret(secret: &str) -> Vec<u8> {
    let stripped = secret.strip_prefix("whsec_").unwrap_or(secret);
    BASE64
        .decode(stripped)
        .unwrap_or_else(|_| secret.as_bytes().to_vec())
}

/// Compute legacy HMAC-SHA256 signature (hex-encoded).
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
}
