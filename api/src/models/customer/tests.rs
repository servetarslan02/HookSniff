#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    fn make_customer() -> Customer {
        Customer {
            id: Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap(),
            email: "test@example.com".to_string(),
            api_key_hash: "hashed_key".to_string(),
            api_key_prefix: "hr_".to_string(),
            plan: "pro".to_string(),
            webhook_limit: 1000,
            webhook_count: 42,
            created_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
            password_hash: Some("hashed_pw".to_string()),
            stripe_customer_id: Some("cus_123".to_string()),
            stripe_subscription_id: Some("sub_456".to_string()),
            payment_provider: "stripe".to_string(),
            polar_customer_id: None,
            polar_subscription_id: None,
            iyzico_customer_id: None,
            iyzico_subscription_id: None,
            name: Some("Test User".to_string()),
            is_active: true,
            is_admin: false,
            updated_at: Utc.with_ymd_and_hms(2024, 6, 1, 12, 0, 0).unwrap(),
            email_verified: true,
            totp_secret: Some("SECRET123".to_string()),
            totp_enabled: false,
            cancel_at_period_end: false,
            payment_failed_at: None,
            current_period_end: None,
            allow_overage: false,
            overage_email_notification: false,
            role: "user".to_string(),
            card_last4: Some("4242".to_string()),
            card_brand: Some("visa".to_string()),
            card_exp_month: Some(12),
            card_exp_year: Some(2027),
            card_updated_at: None,
            paused_at: None,
            paused_until: None,
            pause_plan: None,
            has_used_startup_trial: false,
            billing_interval: None,
            avatar_url: None,
        }
    }

    #[test]
    fn test_customer_construction() {
        let c = make_customer();
        assert_eq!(c.email, "test@example.com");
        assert_eq!(c.plan, "pro");
        assert_eq!(c.webhook_limit, 1000);
        assert_eq!(c.webhook_count, 42);
        assert!(c.is_active);
        assert!(!c.is_admin);
        assert!(c.email_verified);
        assert!(!c.totp_enabled);
    }

    #[test]
    fn test_customer_optional_fields() {
        let mut c = make_customer();
        c.password_hash = None;
        c.stripe_customer_id = None;
        c.stripe_subscription_id = None;
        c.polar_customer_id = None;
        c.polar_subscription_id = None;
        c.iyzico_customer_id = None;
        c.iyzico_subscription_id = None;
        c.name = None;
        c.totp_secret = None;
        assert!(c.password_hash.is_none());
        assert!(c.stripe_customer_id.is_none());
        assert!(c.name.is_none());
    }

    #[test]
    fn test_customer_serialization_roundtrip() {
        let c = make_customer();
        let json = serde_json::to_string(&c).unwrap();
        let deserialized: Customer = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, c.id);
        assert_eq!(deserialized.email, c.email);
        assert_eq!(deserialized.plan, c.plan);
        assert_eq!(deserialized.payment_provider, "stripe");
    }

    #[test]
    fn test_customer_totp_secret_skipped_in_serialization() {
        let c = make_customer();
        let json = serde_json::to_string(&c).unwrap();
        assert!(!json.contains("SECRET123"), "totp_secret should be skipped");
        assert!(!json.contains("totp_secret"), "totp_secret field should be omitted");
    }

    #[test]
    fn test_customer_deserialization_with_missing_optional_fields() {
        let json = r#"{
            "id": "11111111-1111-1111-1111-111111111111",
            "email": "a@b.com",
            "api_key_hash": "h",
            "api_key_prefix": "hr_",
            "plan": "developer",
            "webhook_limit": 10,
            "webhook_count": 0,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }"#;
        let c: Customer = serde_json::from_str(json).unwrap();
        assert_eq!(c.payment_provider, "stripe");
        assert!(!c.is_active);
        assert!(!c.is_admin);
        assert!(!c.email_verified);
        assert!(!c.totp_enabled);
        assert!(c.name.is_none());
        assert!(c.password_hash.is_none());
        assert!(!c.cancel_at_period_end);
        assert!(c.payment_failed_at.is_none());
    }

    #[test]
    fn test_customer_payment_provider_override() {
        let json = r#"{
            "id": "11111111-1111-1111-1111-111111111111",
            "email": "a@b.com",
            "api_key_hash": "h",
            "api_key_prefix": "hr_",
            "plan": "developer",
            "webhook_limit": 10,
            "webhook_count": 0,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "payment_provider": "polar"
        }"#;
        let c: Customer = serde_json::from_str(json).unwrap();
        assert_eq!(c.payment_provider, "polar");
    }

    #[test]
    fn test_default_payment_provider() {
        assert_eq!(default_payment_provider(), "polar");
    }

    #[test]
    fn test_customer_to_response_with_api_key() {
        let c = make_customer();
        let resp = c.to_response(Some("sk_live_abc123".to_string()));
        assert_eq!(resp.email, "test@example.com");
        assert_eq!(resp.plan, "pro");
        assert_eq!(resp.webhook_limit, 1000);
        assert_eq!(resp.webhook_count, 42);
        assert!(!resp.is_admin);
        assert_eq!(resp.api_key, Some("sk_live_abc123".to_string()));
    }

    #[test]
    fn test_customer_to_response_without_api_key() {
        let c = make_customer();
        let resp = c.to_response(None);
        assert!(resp.api_key.is_none());
        assert_eq!(resp.name, Some("Test User".to_string()));
    }

    #[test]
    fn test_customer_response_serialization() {
        let c = make_customer();
        let resp = c.to_response(None);
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json.is_object());
        assert_eq!(json["email"], "test@example.com");
        assert_eq!(json["plan"], "pro");
    }

    #[test]
    fn test_create_customer_request_deserialization() {
        let json = r#"{"email":"new@test.com","password":"secret","name":"New"}"#;
        let req: CreateCustomerRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "new@test.com");
        assert_eq!(req.password, Some("secret".to_string()));
        assert_eq!(req.name, Some("New".to_string()));
    }

    #[test]
    fn test_create_customer_request_no_optional() {
        let json = r#"{"email":"new@test.com"}"#;
        let req: CreateCustomerRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "new@test.com");
        assert!(req.password.is_none());
        assert!(req.name.is_none());
    }

    #[test]
    fn test_login_request_deserialization() {
        let json = r#"{"email":"a@b.com","password":"pw"}"#;
        let req: LoginRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "a@b.com");
        assert_eq!(req.password, "pw");
    }

    #[test]
    fn test_update_profile_request_deserialization() {
        let json = r#"{"name":"New Name"}"#;
        let req: UpdateProfileRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "New Name");
    }

    #[test]
    fn test_change_password_request_deserialization() {
        let json = r#"{"current_password":"old","new_password":"new"}"#;
        let req: ChangePasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.current_password, "old");
        assert_eq!(req.new_password, "new");
    }

    #[test]
    fn test_forgot_password_request_deserialization() {
        let json = r#"{"email":"reset@test.com"}"#;
        let req: ForgotPasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "reset@test.com");
    }

    #[test]
    fn test_reset_password_request_deserialization() {
        let json = r#"{"token":"abc","new_password":"xyz"}"#;
        let req: ResetPasswordRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "abc");
        assert_eq!(req.new_password, "xyz");
    }

    #[test]
    fn test_verify_email_request_deserialization() {
        let json = r#"{"token":"verify_token"}"#;
        let req: VerifyEmailRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "verify_token");
    }

    #[test]
    fn test_resend_verification_request_deserialization() {
        let json = r#"{"email":"user@test.com"}"#;
        let req: ResendVerificationRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "user@test.com");
    }

    #[test]
    fn test_refresh_token_request_deserialization() {
        let json = r#"{"refresh_token":"rt_abc123"}"#;
        let req: RefreshTokenRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.refresh_token, "rt_abc123");
    }

    #[test]
    fn test_enable_2fa_request_deserialization() {
        let json = r#"{"password":"mypassword"}"#;
        let req: Enable2faRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.password, "mypassword");
    }

    #[test]
    fn test_confirm_2fa_request_deserialization() {
        let json = r#"{"code":"123456"}"#;
        let req: Confirm2faRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.code, "123456");
    }

    #[test]
    fn test_disable_2fa_request_deserialization() {
        let json = r#"{"password":"mypassword"}"#;
        let req: Disable2faRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.password, "mypassword");
    }

    #[test]
    fn test_verify_2fa_request_deserialization() {
        let json = r#"{"temp_token":"tmp_123","code":"654321"}"#;
        let req: Verify2faRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.temp_token, "tmp_123");
        assert_eq!(req.code, "654321");
    }

    #[test]
    fn test_register_device_request_deserialization() {
        let json = r#"{"token":"device_token_abc","platform":"ios"}"#;
        let req: RegisterDeviceRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "device_token_abc");
        assert_eq!(req.platform, Some("ios".to_string()));
    }

    #[test]
    fn test_register_device_request_no_platform() {
        let json = r#"{"token":"tok"}"#;
        let req: RegisterDeviceRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "tok");
        assert!(req.platform.is_none());
    }

    #[test]
    fn test_device_token_response_serialization() {
        let resp = DeviceTokenResponse {
            id: Uuid::new_v4(),
            token: "device_tok".to_string(),
            platform: "android".to_string(),
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["token"], "device_tok");
        assert_eq!(json["platform"], "android");
    }

    #[test]
    fn test_auth_response_serialization() {
        let resp = AuthResponse {
            token: "jwt_abc".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: None,
                api_key: None,
                plan: "developer".to_string(),
                webhook_limit: 10,
                webhook_count: 0,
                is_admin: false,
                created_at: Utc::now(),
            },
            refresh_token: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["token"], "jwt_abc");
        assert!(json.get("refresh_token").is_none() || json["refresh_token"].is_null());
    }

    #[test]
    fn test_auth_response_with_refresh_token() {
        let resp = AuthResponse {
            token: "jwt".to_string(),
            customer: CustomerResponse {
                id: Uuid::new_v4(),
                email: "x@y.com".to_string(),
                name: None,
                api_key: None,
                plan: "developer".to_string(),
                webhook_limit: 10,
                webhook_count: 0,
                is_admin: false,
                created_at: Utc::now(),
            },
            refresh_token: Some("rt_xyz".to_string()),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["refresh_token"], "rt_xyz");
    }

    #[test]
    fn test_two_factor_required_response_serialization() {
        let resp = TwoFactorRequiredResponse {
            requires_2fa: true,
            temp_token: "tmp".to_string(),
            message: "Enter your 2FA code".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["requires_2fa"].as_bool().unwrap());
        assert_eq!(json["temp_token"], "tmp");
        assert_eq!(json["message"], "Enter your 2FA code");
    }

    #[test]
    fn test_customer_empty_email() {
        let mut c = make_customer();
        c.email = "".to_string();
        let json = serde_json::to_string(&c).unwrap();
        let deserialized: Customer = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.email, "");
    }

    #[test]
    fn test_customer_max_webhook_values() {
        let mut c = make_customer();
        c.webhook_limit = i64::MAX;
        c.webhook_count = i64::MAX;
        let json = serde_json::to_string(&c).unwrap();
        let deserialized: Customer = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.webhook_limit, i64::MAX);
        assert_eq!(deserialized.webhook_count, i64::MAX);
    }

    #[test]
    fn test_customer_clone() {
        let c = make_customer();
        let cloned = c.clone();
        assert_eq!(cloned.id, c.id);
        assert_eq!(cloned.email, c.email);
    }

    #[test]
    fn test_customer_all_payment_providers() {
        for provider in &["stripe", "polar", "iyzico"] {
            let json = format!(
                r#"{{
                    "id": "11111111-1111-1111-1111-111111111111",
                    "email": "a@b.com",
                    "api_key_hash": "h",
                    "api_key_prefix": "hr_",
                    "plan": "developer",
                    "webhook_limit": 10,
                    "webhook_count": 0,
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-01T00:00:00Z",
                    "payment_provider": "{}"
                }}"#,
                provider
            );
            let c: Customer = serde_json::from_str(&json).unwrap();
            assert_eq!(c.payment_provider, *provider);
        }
    }
}
