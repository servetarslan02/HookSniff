use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Customer {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub api_key_hash: String,
    pub api_key_prefix: String,
    pub plan: String,
    /// Database column is BIGINT (migration 046) — use i64 to match
    pub webhook_limit: i64,
    /// Database column is BIGINT (migration 011) — use i64 to match
    pub webhook_count: i64,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing)]
    pub password_hash: Option<String>,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    /// Payment provider: "stripe", "polar", or "iyzico"
    #[serde(default = "default_payment_provider")]
    pub payment_provider: String,
    /// Polar.sh customer ID
    #[serde(default)]
    pub polar_customer_id: Option<String>,
    /// Polar.sh subscription ID
    #[serde(default)]
    pub polar_subscription_id: Option<String>,
    /// iyzico customer ID
    #[serde(default)]
    pub iyzico_customer_id: Option<String>,
    /// iyzico subscription ID
    #[serde(default)]
    pub iyzico_subscription_id: Option<String>,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub is_active: bool,
    #[serde(default)]
    pub is_admin: bool,
    /// RBAC role: "admin", "support", "viewer", "member"
    #[serde(default = "default_role")]
    pub role: String,
    pub updated_at: DateTime<Utc>,
    #[serde(default)]
    pub email_verified: bool,
    #[serde(skip_serializing)]
    pub totp_secret: Option<String>,
    #[serde(default)]
    pub totp_enabled: bool,
    /// Whether the subscription should cancel at the end of the current billing period.
    #[serde(default)]
    pub cancel_at_period_end: bool,
    /// Timestamp when payment last failed (for grace period tracking).
    #[serde(default)]
    pub payment_failed_at: Option<DateTime<Utc>>,
    /// Whether overage is allowed (never-blocked mode). Default: true.
    #[serde(default = "default_true")]
    pub allow_overage: bool,
    /// Whether to send email notifications for overage. Default: true.
    #[serde(default = "default_true")]
    pub overage_email_notification: bool,
    /// Card last 4 digits (from payment provider)
    #[serde(default)]
    pub card_last4: Option<String>,
    /// Card brand (visa, mastercard, amex, etc.)
    #[serde(default)]
    pub card_brand: Option<String>,
    /// Card expiry month (1-12)
    #[serde(default)]
    pub card_exp_month: Option<i16>,
    /// Card expiry year (e.g. 2027)
    #[serde(default)]
    pub card_exp_year: Option<i16>,
    /// When card info was last updated
    #[serde(default)]
    pub card_updated_at: Option<DateTime<Utc>>,
    /// When subscription was paused (NULL = not paused)
    #[serde(default)]
    pub paused_at: Option<DateTime<Utc>>,
    /// Pause expiration date (auto-downgrade after this)
    #[serde(default)]
    pub paused_until: Option<DateTime<Utc>>,
    /// Plan preserved during pause (for resume)
    #[serde(default)]
    pub pause_plan: Option<String>,
    /// Whether the customer has already used the Startup first-month-free trial.
    #[serde(default)]
    pub has_used_startup_trial: bool,
}

fn default_payment_provider() -> String {
    "polar".to_string()
}

fn default_true() -> bool {
    true
}

fn default_role() -> String {
    "member".to_string()
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateCustomerRequest {
    pub email: String,
    pub password: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateProfileRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

// ── Password Reset ──────────────────────────────────────────
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub new_password: String,
}

// ── Email Verification ─────────────────────────────────────
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ResendVerificationRequest {
    pub email: String,
}

// ── Refresh Token ───────────────────────────────────────────
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

// ── Two-Factor Auth (TOTP) ─────────────────────────────────
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Enable2faRequest {
    pub password: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Confirm2faRequest {
    pub code: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Disable2faRequest {
    pub password: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Verify2faRequest {
    pub temp_token: String,
    pub code: String,
    /// Optional backup code (8-char alphanumeric). If provided, used instead of TOTP code.
    #[serde(default)]
    pub backup_code: Option<String>,
}

// ── Push Notifications (Device Tokens) ─────────────────────
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RegisterDeviceRequest {
    pub token: String,
    pub platform: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DeviceTokenResponse {
    pub id: Uuid,
    pub token: String,
    pub platform: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct CustomerResponse {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub api_key: Option<String>, // Only returned on creation
    pub plan: String,
    pub webhook_limit: i64,
    pub webhook_count: i64,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub customer: CustomerResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
}

/// Response when 2FA is required (partial auth — no full token yet).
#[derive(Debug, Serialize)]
pub struct TwoFactorRequiredResponse {
    pub requires_2fa: bool,
    pub temp_token: String,
    pub message: String,
}

impl Customer {
    pub fn to_response(self, api_key: Option<String>) -> CustomerResponse {
        CustomerResponse {
            id: self.id,
            email: self.email,
            name: self.name,
            api_key,
            plan: self.plan,
            webhook_limit: self.webhook_limit,
            webhook_count: self.webhook_count,
            is_admin: self.is_admin,
            created_at: self.created_at,
        }
    }
}

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
        assert!(
            !json.contains("totp_secret"),
            "totp_secret field should be omitted"
        );
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
        assert_eq!(c.payment_provider, "stripe"); // default
        assert!(!c.is_active); // default false
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
        assert_eq!(default_payment_provider(), "stripe");
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
        // refresh_token is None, should not appear due to skip_serializing_if
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
