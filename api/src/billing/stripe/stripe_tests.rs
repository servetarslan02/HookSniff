//! Tests for Stripe billing integration.

#[cfg(test)]
mod stripe_tests {
    use crate::billing::stripe::*;
    use base64::Engine;
    use hmac::{Hmac, Mac};
    use sha2::Sha256;

    type HmacSha256 = Hmac<Sha256>;

    /// Helper: compute a valid Stripe-style webhook signature for testing.
    fn make_signature(payload: &str, secret: &str, timestamp: i64) -> String {
        let key_b64 = secret.strip_prefix("whsec_").unwrap_or(secret);
        let key = base64::engine::general_purpose::STANDARD
            .decode(key_b64)
            .unwrap();

        let signed_payload = format!("{}.{}", timestamp, payload);
        let mut mac = HmacSha256::new_from_slice(&key).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig = hex::encode(mac.finalize().into_bytes());
        format!("t={},v1={}", timestamp, sig)
    }

    #[test]
    fn test_parse_stripe_signature_valid() {
        let header = "t=1234567890,v1=abcdef1234567890";
        let (ts, sig) = parse_stripe_signature(header).unwrap();
        assert_eq!(ts, 1234567890);
        assert_eq!(sig, "abcdef1234567890");
    }

    #[test]
    fn test_parse_stripe_signature_multiple_v1() {
        let header = "t=999,v1=first_sig,v1=second_sig";
        let (ts, sig) = parse_stripe_signature(header).unwrap();
        assert_eq!(ts, 999);
        assert_eq!(sig, "first_sig");
    }

    #[test]
    fn test_parse_stripe_signature_missing_timestamp() {
        let header = "v1=abcdef";
        assert!(parse_stripe_signature(header).is_err());
    }

    #[test]
    fn test_parse_stripe_signature_missing_v1() {
        let header = "t=1234567890";
        assert!(parse_stripe_signature(header).is_err());
    }

    #[test]
    fn test_verify_signature_valid() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_123","type":"checkout.session.completed"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret, now);

        assert!(verify_webhook_signature(payload, &header, secret, 300).is_ok());
    }

    #[test]
    fn test_verify_signature_tampered_payload() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_123","type":"checkout.session.completed"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret, now);

        let tampered = r#"{"id":"evt_123","type":"payment_intent.succeeded"}"#;
        assert!(verify_webhook_signature(tampered, &header, secret, 300).is_err());
    }

    #[test]
    fn test_verify_signature_wrong_secret() {
        let secret_a = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let secret_b = "whsec_ZGlmZmVyZW50X3NlY3JldF9mb3JfdGVzdGluZ19wdXJwb3Nlcw==";
        let payload = r#"{"id":"evt_456"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret_a, now);

        assert!(verify_webhook_signature(payload, &header, secret_b, 300).is_err());
    }

    #[test]
    fn test_verify_signature_expired_timestamp() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_789"}"#;
        let old_ts = chrono::Utc::now().timestamp() - 600;
        let header = make_signature(payload, secret, old_ts);

        assert!(verify_webhook_signature(payload, &header, secret, 300).is_err());
    }

    #[test]
    fn test_verify_signature_future_timestamp() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_future"}"#;
        let future_ts = chrono::Utc::now().timestamp() + 600;
        let header = make_signature(payload, secret, future_ts);

        assert!(verify_webhook_signature(payload, &header, secret, 300).is_err());
    }

    #[test]
    fn test_verify_signature_malformed_header() {
        let secret = "whsec_test";
        assert!(verify_webhook_signature("{}", "garbage", secret, 300).is_err());
        assert!(verify_webhook_signature("{}", "", secret, 300).is_err());
    }
}
