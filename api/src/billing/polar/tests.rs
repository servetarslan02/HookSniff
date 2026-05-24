    use super::*;

fn test_config() -> PolarConfig {
        PolarConfig {
            access_token: "test_token".to_string(),
            webhook_secret: "test_webhook_secret".to_string(),
            product_startup: "prod_startup_789".to_string(),
            product_pro: "prod_pro_123".to_string(),
            product_business: "prod_biz_456".to_string(),
            product_pro_yearly: "prod_pro_yearly_123".to_string(),
            product_business_yearly: "prod_biz_yearly_456".to_string(),
            product_startup_yearly: "prod_startup_yearly_789".to_string(),
            base_url: "https://sandbox-api.polar.sh".to_string(),
        }
    }

    // ── PolarConfig::product_id_for_plan ───────────────────────

    #[test]
    fn product_id_for_plan_pro() {
        let config = test_config();
        assert_eq!(config.product_id_for_plan(&Plan::Pro, false), Some("prod_pro_123"));
    }

    #[test]
    fn product_id_for_plan_business() {
        let config = test_config();
        assert_eq!(
            config.product_id_for_plan(&Plan::Enterprise, false),
            Some("prod_biz_456")
        );
    }

    #[test]
    fn product_id_for_plan_free_returns_none() {
        let config = test_config();
        assert_eq!(config.product_id_for_plan(&Plan::Developer, false), None);
    }

    #[test]
    fn product_id_for_plan_enterprise_returns_business_product() {
        let config = test_config();
        assert_eq!(config.product_id_for_plan(&Plan::Enterprise, false), Some("prod_biz_456"));
    }

    // ── PolarProvider::determine_plan ──────────────────────────

    #[test]
    fn determine_plan_business_product() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan("prod_biz_456"), Plan::Enterprise);
    }

    #[test]
    fn determine_plan_pro_product() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan("prod_pro_123"), Plan::Pro);
    }

    #[test]
    fn determine_plan_unknown_product_returns_free() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan("unknown_product"), Plan::Developer);
    }

    #[test]
    fn determine_plan_empty_string_returns_free() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan(""), Plan::Developer);
    }

    // ── PolarProvider::verify_signature ────────────────────────

    #[test]
    fn verify_signature_valid() {
        let secret = "whsec_test123";
        let body = r#"{"type":"subscription.created","data":{}}"#;
        let ts = chrono::Utc::now().timestamp();
        let signed_payload = format!("{}.{}", ts, body);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig_hex = hex::encode(mac.finalize().into_bytes());

        let header = format!("t={},v1={}", ts, sig_hex);
        assert!(PolarProvider::verify_signature(body, &header, secret).is_ok());
    }

    #[test]
    fn verify_signature_invalid_secret() {
        let secret = "whsec_correct";
        let wrong_secret = "whsec_wrong";
        let body = r#"{"type":"test"}"#;
        let ts = chrono::Utc::now().timestamp();
        let signed_payload = format!("{}.{}", ts, body);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig_hex = hex::encode(mac.finalize().into_bytes());

        let header = format!("t={},v1={}", ts, sig_hex);
        let result = PolarProvider::verify_signature(body, &header, wrong_secret);
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_expired_timestamp() {
        let secret = "whsec_test";
        let body = r#"{"type":"test"}"#;
        let ts = chrono::Utc::now().timestamp() - 600; // 10 minutes ago
        let signed_payload = format!("{}.{}", ts, body);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig_hex = hex::encode(mac.finalize().into_bytes());

        let header = format!("t={},v1={}", ts, sig_hex);
        let result = PolarProvider::verify_signature(body, &header, secret);
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_missing_t() {
        let result = PolarProvider::verify_signature("body", "v1=abc123", "secret");
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_missing_v1() {
        let result = PolarProvider::verify_signature(
            "body",
            &format!("t={}", chrono::Utc::now().timestamp()),
            "secret",
        );
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_invalid_hex() {
        let ts = chrono::Utc::now().timestamp();
        let header = format!("t={},v1=not_valid_hex!!!", ts);
        let result = PolarProvider::verify_signature("body", &header, "secret");
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_invalid_timestamp() {
        let result = PolarProvider::verify_signature("body", "t=notanumber,v1=abc", "secret");
        assert!(result.is_err());
    }

    // ── PolarProvider::create_customer_portal ──────────────────

    #[tokio::test]
    async fn create_customer_portal_falls_back_without_network() {
        let provider = PolarProvider::new(test_config());
        // This will fail because we're not actually connecting to Polar,
        // but the implementation falls back to our billing page.
        let url = provider
            .create_customer_portal("cust_123", "https://app.hooksniff.com")
            .await
            .unwrap();
        assert_eq!(url, "https://app.hooksniff.com/dashboard/billing");
    }

    // ── PolarProvider::cancel_subscription (network fail) ──────

    #[tokio::test]
    async fn cancel_subscription_fails_without_network() {
        let provider = PolarProvider::new(test_config());
        // This will fail because we're not actually connecting to Polar
        let result = provider.cancel_subscription("sub_123").await;
        assert!(result.is_err());
    }

    // ── PolarWebhookEvent deserialization ──────────────────────

    #[test]
    fn deserialize_polar_webhook_event() {
        let json =
            r#"{"type":"subscription.created","data":{"id":"sub_1","customer_id":"cust_1"}}"#;
        let event: PolarWebhookEvent = serde_json::from_str(json).unwrap();
        assert_eq!(event.event_type, "subscription.created");
        assert_eq!(event.data["id"], "sub_1");
    }

    // ── PolarSubscription deserialization ──────────────────────

    #[test]
    fn deserialize_polar_subscription_with_all_fields() {
        let json = r#"{"id":"sub_1","customer_id":"cust_1","external_customer_id":"ext_1","product_id":"prod_1","status":"active","interval":"month","cancel_at_period_end":false,"current_period_end":"2026-06-21T00:00:00Z"}"#;
        let sub: PolarSubscription = serde_json::from_str(json).unwrap();
        assert_eq!(sub.id.as_deref(), Some("sub_1"));
        assert_eq!(sub.customer_id.as_deref(), Some("cust_1"));
        assert_eq!(sub.external_customer_id.as_deref(), Some("ext_1"));
        assert_eq!(sub.product_id.as_deref(), Some("prod_1"));
        assert_eq!(sub.status.as_deref(), Some("active"));
        assert_eq!(sub.interval.as_deref(), Some("month"));
        assert_eq!(sub.cancel_at_period_end, Some(false));
        assert!(sub.current_period_end.is_some());
    }

    #[test]
    fn deserialize_polar_subscription_with_missing_fields() {
        let json = r#"{}"#;
        let sub: PolarSubscription = serde_json::from_str(json).unwrap();
        assert!(sub.id.is_none());
        assert!(sub.customer_id.is_none());
        assert!(sub.external_customer_id.is_none());
        assert!(sub.product_id.is_none());
        assert!(sub.status.is_none());
    }

    // ── CheckoutSession deserialization ────────────────────────

    #[test]
    fn deserialize_checkout_session() {
        let json = r#"{"id":"sess_001","url":"https://polar.sh/checkout/sess_001","customer_id":"cust_1","external_customer_id":"ext_1"}"#;
        let session: CheckoutSession = serde_json::from_str(json).unwrap();
        assert_eq!(session.id, "sess_001");
        assert_eq!(session.url, "https://polar.sh/checkout/sess_001");
        assert_eq!(session.customer_id.as_deref(), Some("cust_1"));
    }

    #[test]
    fn deserialize_checkout_session_minimal() {
        let json = r#"{"id":"sess_002","url":"https://polar.sh/checkout/sess_002"}"#;
        let session: CheckoutSession = serde_json::from_str(json).unwrap();
        assert_eq!(session.id, "sess_002");
        assert!(session.customer_id.is_none());
        assert!(session.external_customer_id.is_none());
    }
