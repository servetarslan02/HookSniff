use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub fn compute_hmac(secret: &str, payload: &str) -> String {
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

pub fn verify_hmac(secret: &str, payload: &str, expected_signature: &str) -> bool {
    let computed = compute_hmac(secret, payload);
    computed == expected_signature
}

/// Verify signature against both current and old signing secrets.
/// Returns true if either matches.
pub fn verify_with_rotation(
    current_secret: &str,
    old_secret: Option<&str>,
    payload: &str,
    expected_signature: &str,
    secret_rotated_at: Option<chrono::DateTime<chrono::Utc>>,
) -> bool {
    // Check current secret first
    if verify_hmac(current_secret, payload, expected_signature) {
        return true;
    }

    // Check old secret if rotation was recent (within 24h)
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

        // Current secret works
        assert!(verify_with_rotation(
            current,
            Some(old),
            payload,
            &sig_current,
            Some(chrono::Utc::now()),
        ));

        // Old secret works within 24h
        assert!(verify_with_rotation(
            current,
            Some(old),
            payload,
            &sig_old,
            Some(chrono::Utc::now()),
        ));

        // Old secret doesn't work after 24h
        assert!(!verify_with_rotation(
            current,
            Some(old),
            payload,
            &sig_old,
            Some(chrono::Utc::now() - chrono::Duration::hours(25)),
        ));

        // No old secret
        assert!(!verify_with_rotation(
            current,
            None,
            payload,
            &sig_old,
            None,
        ));
    }
}
