#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> IyzicoConfig {
        IyzicoConfig {
            api_key: "test_api_key".to_string(),
            secret_key: "test_secret_key".to_string(),
            base_url: "https://sandbox-api.iyzipay.com".to_string(),
            price_pro_kurus: 14900,
            price_business_kurus: 44900,
        }
    }

    // ── IyzicoConfig::price_for_plan ───────────────────────────

    #[test]
    fn price_for_plan_pro() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Pro), Some(14900));
    }

    #[test]
    fn price_for_plan_business() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Enterprise), Some(44900));
    }

    #[test]
    fn price_for_plan_free_returns_none() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Developer), None);
    }

    #[test]
    fn price_for_plan_enterprise_returns_business_price() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Enterprise), Some(44900));
    }

    // ── IyzicoProvider::generate_auth ──────────────────────────

    #[test]
    fn generate_auth_produces_valid_signature() {
        let provider = IyzicoProvider::new(test_config());
        let auth = provider.generate_auth("/test/uri", "test_body");

        assert_eq!(auth.api_key, "test_api_key");
        assert!(!auth.random_key.is_empty());
        assert!(!auth.signature.is_empty());
        assert!(!auth.conversation_id.is_empty());

        // Verify the signature is valid base64
        let decoded = base64::engine::general_purpose::STANDARD.decode(&auth.signature);
        assert!(decoded.is_ok());
    }

    #[test]
    fn generate_auth_random_key_is_alphanumeric() {
        let provider = IyzicoProvider::new(test_config());
        let auth = provider.generate_auth("/uri", "body");
        assert!(auth.random_key.chars().all(|c| c.is_ascii_alphanumeric()));
    }

    #[test]
    fn generate_auth_random_key_length() {
        let provider = IyzicoProvider::new(test_config());
        let auth = provider.generate_auth("/uri", "body");
        assert_eq!(auth.random_key.len(), 8);
    }

    #[test]
    fn generate_auth_signature_is_hmac_of_payload() {
        let provider = IyzicoProvider::new(test_config());
        let uri = "/payment/test";
        let body = "test_body";
        let auth = provider.generate_auth(uri, body);

        // Manually verify the HMAC
        let payload = format!("{}{}{}", auth.random_key, uri, body);
        let mut mac = HmacSha256::new_from_slice(b"test_secret_key").unwrap();
        mac.update(payload.as_bytes());
        let expected =
            base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());

        assert_eq!(auth.signature, expected);
    }

    // ── IyzicoProvider::verify_webhook_signature ───────────────

    #[test]
    fn verify_webhook_signature_valid() {
        let config = test_config();
        let provider = IyzicoProvider::new(config);

        let random_string = "abcdefgh";
        let body = r#"{"iyziEventType":"CARD_PAYMENT_SUCCESS","paymentId":"pay_1"}"#;
        let uri = "/v1/billing/webhook/iyzico";
        let payload = format!("{}{}{}", random_string, uri, body);

        let mut mac = HmacSha256::new_from_slice(b"test_secret_key").unwrap();
        mac.update(payload.as_bytes());
        let expected_sig =
            base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());

        let mut headers = axum::http::HeaderMap::new();
        headers.insert("x-iyzi-rnd", random_string.parse().unwrap());
        headers.insert("x-iyzi-signature", expected_sig.parse().unwrap());

        assert!(provider.verify_webhook_signature(body, &headers).is_ok());
    }

    #[test]
    fn verify_webhook_signature_missing_signature_header() {
        let provider = IyzicoProvider::new(test_config());
        let headers = axum::http::HeaderMap::new();
        let result = provider.verify_webhook_signature("body", &headers);
        assert!(result.is_err());
    }

    #[test]
    fn verify_webhook_signature_mismatch() {
        let provider = IyzicoProvider::new(test_config());
        let mut headers = axum::http::HeaderMap::new();
        headers.insert("x-iyzi-rnd", "abcdefgh".parse().unwrap());
        headers.insert("x-iyzi-signature", "wrong_signature".parse().unwrap());
        let result = provider.verify_webhook_signature("body", &headers);
        assert!(result.is_err());
    }

    // ── IyzicoProvider::create_customer_portal ─────────────────

    #[tokio::test]
    async fn create_customer_portal_returns_error() {
        let provider = IyzicoProvider::new(test_config());
        let result = provider
            .create_customer_portal("cust_123", "https://app.hooksniff.com")
            .await;
        assert!(result.is_err());
    }

    // ── IyzicoProvider::cancel_subscription ────────────────────

    #[tokio::test]
    async fn cancel_subscription_succeeds() {
        let provider = IyzicoProvider::new(test_config());
        // iyzico cancel is handled server-side, always returns Ok
        assert!(provider.cancel_subscription("sub_123").await.is_ok());
    }

    // ── IyzicoWebhookNotification deserialization ──────────────

    #[test]
    fn deserialize_iyzico_webhook_notification() {
        let json = r#"{
            "iyziEventTime": 1234567890,
            "iyziEventType": "CARD_PAYMENT_SUCCESS",
            "paymentId": "pay_001",
            "paymentConversationId": "conv_001",
            "status": "success"
        }"#;
        let notification: IyzicoWebhookNotification = serde_json::from_str(json).unwrap();
        assert_eq!(notification.event_time, 1234567890);
        assert_eq!(notification.event_type, "CARD_PAYMENT_SUCCESS");
        assert_eq!(notification.payment_id, "pay_001");
        assert_eq!(notification.conversation_id.as_deref(), Some("conv_001"));
        assert_eq!(notification.status, "success");
    }

    #[test]
    fn deserialize_iyzico_webhook_notification_minimal() {
        let json = r#"{
            "iyziEventTime": 0,
            "iyziEventType": "UNKNOWN",
            "paymentId": "pay_x",
            "status": "failure"
        }"#;
        let notification: IyzicoWebhookNotification = serde_json::from_str(json).unwrap();
        assert!(notification.conversation_id.is_none());
    }
}
