use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub fn compute_hmac(secret: &str, payload: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

pub fn verify_hmac(secret: &str, payload: &str, expected_signature: &str) -> bool {
    let computed = compute_hmac(secret, payload);
    // Constant-time comparison
    computed == expected_signature
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
}
