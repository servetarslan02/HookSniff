#[cfg(test)]
mod tests {
    use hooksniff::error::Error;
    use hooksniff::webhook::Webhook;

    fn sign(secret: &str, msg_id: &str, timestamp: i64, payload: &str) -> String {
        use base64::Engine;
        use hmac::{Hmac, Mac};
        use sha2::Sha256;

        let decoded = base64::engine::general_purpose::STANDARD
            .decode(secret.strip_prefix("whsec_").unwrap_or(secret))
            .unwrap();
        let to_sign = format!("{}.{}.{}", msg_id, timestamp, payload);
        let mut mac = Hmac::<Sha256>::new_from_slice(&decoded).unwrap();
        mac.update(to_sign.as_bytes());
        let sig = base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());
        format!("v1,{}", sig)
    }

    #[test]
    fn test_webhook_verify_valid() {
        let secret = "whsec_dGVzdA==";
        let msg_id = "msg_test123";
        let timestamp = chrono::Utc::now().timestamp();
        let payload = r#"{"event":"test"}"#;

        let sig = sign(secret, msg_id, timestamp, payload);
        let headers = vec![
            ("webhook-id".to_string(), msg_id.to_string()),
            ("webhook-timestamp".to_string(), timestamp.to_string()),
            ("webhook-signature".to_string(), sig),
        ];

        let wh = Webhook::new(secret).unwrap();
        let result = wh.verify(payload.as_bytes(), &headers).unwrap();
        assert_eq!(result["event"], "test");
    }

    #[test]
    fn test_webhook_reject_invalid_signature() {
        let secret = "whsec_dGVzdA==";
        let msg_id = "msg_test123";
        let timestamp = chrono::Utc::now().timestamp();
        let payload = r#"{"event":"test"}"#;

        let headers = vec![
            ("webhook-id".to_string(), msg_id.to_string()),
            ("webhook-timestamp".to_string(), timestamp.to_string()),
            ("webhook-signature".to_string(), "v1,invalid".to_string()),
        ];

        let wh = Webhook::new(secret).unwrap();
        let result = wh.verify(payload.as_bytes(), &headers);
        assert!(result.is_err());
    }

    #[test]
    fn test_webhook_svix_branded_headers() {
        let secret = "whsec_dGVzdA==";
        let msg_id = "msg_test123";
        let timestamp = chrono::Utc::now().timestamp();
        let payload = r#"{"event":"test"}"#;

        let sig = sign(secret, msg_id, timestamp, payload);
        let headers = vec![
            ("svix-id".to_string(), msg_id.to_string()),
            ("svix-timestamp".to_string(), timestamp.to_string()),
            ("svix-signature".to_string(), sig),
        ];

        let wh = Webhook::new(secret).unwrap();
        let result = wh.verify(payload.as_bytes(), &headers).unwrap();
        assert_eq!(result["event"], "test");
    }

    #[test]
    fn test_error_types() {
        assert!(Error::BadRequest(hooksniff::error::HttpErrorContent {
            status: http02::StatusCode::BAD_REQUEST,
            payload: None,
        })
        .is_client_error());

        assert!(Error::InternalServerError(hooksniff::error::HttpErrorContent {
            status: http02::StatusCode::INTERNAL_SERVER_ERROR,
            payload: None,
        })
        .is_server_error());

        assert!(Error::RateLimited {
            content: hooksniff::error::HttpErrorContent {
                status: http02::StatusCode::TOO_MANY_REQUESTS,
                payload: None,
            },
            retry_after: Some(30),
        }
        .is_rate_limit());
    }
}
