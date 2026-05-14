//! Standard Webhooks signing and verification for the API layer.
//!
//! Re-exports core signing functions from `hooksniff_common::signing` and adds
//! API-specific helpers (header extraction, WebhookVerifier wrapper).

// Re-export core signing functions from shared crate
pub use hooksniff_common::signing::{
    compute_hmac, compute_standard_signature, decode_secret, verify_hmac, verify_standard_signature,
    verify_with_rotation, HEADER_SVIX_ID, HEADER_SVIX_SIGNATURE, HEADER_SVIX_TIMESTAMP,
    HEADER_WEBHOOK_ID, HEADER_WEBHOOK_SIGNATURE, HEADER_WEBHOOK_TIMESTAMP,
    DEFAULT_TIMESTAMP_TOLERANCE_SECS,
};

/// Errors from Standard Webhooks verification.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VerificationError {
    InvalidTimestamp,
    TimestampExpired { age_secs: i64, tolerance_secs: i64 },
    SignatureMismatch,
    MissingHeader(&'static str),
}

impl From<hooksniff_common::signing::VerificationError> for VerificationError {
    fn from(e: hooksniff_common::signing::VerificationError) -> Self {
        match e {
            hooksniff_common::signing::VerificationError::InvalidTimestamp => Self::InvalidTimestamp,
            hooksniff_common::signing::VerificationError::TimestampExpired { age_secs, tolerance_secs } => {
                Self::TimestampExpired { age_secs, tolerance_secs }
            }
            hooksniff_common::signing::VerificationError::SignatureMismatch => Self::SignatureMismatch,
        }
    }
}

impl std::fmt::Display for VerificationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidTimestamp => write!(f, "Invalid webhook timestamp"),
            Self::TimestampExpired { age_secs, tolerance_secs } => write!(
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

/// Verify Standard Webhooks signature from HTTP headers.
///
/// Supports both branded (`svix-*`) and unbranded (`webhook-*`) header names.
pub fn verify_from_headers(
    secret: &str,
    headers: &axum::http::HeaderMap,
    body: &str,
    tolerance_secs: Option<i64>,
) -> Result<(), VerificationError> {
    let msg_id = get_header(headers, HEADER_WEBHOOK_ID)
        .or_else(|| get_header(headers, HEADER_SVIX_ID))
        .ok_or(VerificationError::MissingHeader("X-HookSniff-ID"))?;

    let msg_signature = get_header(headers, HEADER_WEBHOOK_SIGNATURE)
        .or_else(|| get_header(headers, HEADER_SVIX_SIGNATURE))
        .ok_or(VerificationError::MissingHeader("X-HookSniff-Signature"))?;

    let msg_timestamp = get_header(headers, HEADER_WEBHOOK_TIMESTAMP)
        .or_else(|| get_header(headers, HEADER_SVIX_TIMESTAMP))
        .ok_or(VerificationError::MissingHeader("X-HookSniff-Timestamp"))?;

    verify_standard_signature(secret, msg_id, msg_timestamp, msg_signature, body, tolerance_secs)
        .map_err(VerificationError::from)
}

/// Verify signature ignoring timestamp (for testing only).
pub fn verify_ignoring_timestamp(
    secret: &str,
    msg_id: &str,
    signature_header: &str,
    body: &str,
) -> Result<(), VerificationError> {
    // Use a fixed timestamp since we don't check it
    let sig = compute_standard_signature(secret, msg_id, "0", body);
    // Compare signatures
    let expected_prefix = "v1,";
    let expected_body = &sig[expected_prefix.len()..];

    for sig_part in signature_header.split(' ') {
        let sig_part = sig_part.trim();
        if let Some(encoded) = sig_part.strip_prefix(expected_prefix) {
            if encoded == expected_body {
                return Ok(());
            }
        }
    }

    Err(VerificationError::SignatureMismatch)
}

/// Helper to extract a header value from axum's HeaderMap.
fn get_header<'a>(headers: &'a axum::http::HeaderMap, name: &str) -> Option<&'a str> {
    headers.get(name)?.to_str().ok()
}

/// Webhook verifier — wraps secret for repeated verification.
pub struct WebhookVerifier {
    secret: String,
}

impl WebhookVerifier {
    pub fn new(secret: impl Into<String>) -> Self {
        Self { secret: secret.into() }
    }

    pub fn verify(
        &self,
        msg_id: &str,
        timestamp: &str,
        signature_header: &str,
        body: &str,
        tolerance_secs: Option<i64>,
    ) -> Result<(), VerificationError> {
        verify_standard_signature(&self.secret, msg_id, timestamp, signature_header, body, tolerance_secs)
            .map_err(VerificationError::from)
    }

    pub fn sign(&self, msg_id: &str, timestamp: &str, body: &str) -> String {
        compute_standard_signature(&self.secret, msg_id, timestamp, body)
    }
}

impl std::fmt::Debug for WebhookVerifier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("WebhookVerifier { secret: [REDACTED] }")
    }
}

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
        assert!(matches!(result, Err(_)));
    }

    #[test]
    fn test_svix_reference_test_vector() {
        let wh_secret = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD";
        let msg_id = "msg_27UH4WbU6Z5A5EzD8u03UvzRbpk";
        let timestamp = 1649367553i64;
        let body = r#"{"email":"test@example.com","username":"test_user"}"#;

        let sig = compute_standard_signature(wh_secret, msg_id, &timestamp.to_string(), body);
        assert_eq!(sig, "v1,tZ1I4/hDygAJgO5TYxiSd6Sd0kDW6hPenDe+bTa3Kkw=");
    }

    #[test]
    fn test_webhook_verifier_roundtrip() {
        let verifier = WebhookVerifier::new("whsec_test123");
        let msg_id = "msg_v01";
        let timestamp = &chrono::Utc::now().timestamp().to_string();
        let body = r#"{"event":"test"}"#;

        let sig = verifier.sign(msg_id, timestamp, body);
        assert!(verifier.verify(msg_id, timestamp, &sig, body, None).is_ok());
    }

    #[test]
    fn test_webhook_verifier_debug_redaction() {
        let verifier = WebhookVerifier::new("whsec_super_secret_key");
        let debug = format!("{:?}", verifier);
        assert!(debug.contains("REDACTED"));
        assert!(!debug.contains("super_secret"));
    }
}
