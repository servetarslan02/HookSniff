use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Customer {
    pub id: Uuid,
    pub email: String,
    pub api_key_hash: String,
    pub api_key_prefix: String,
    pub plan: String,
    pub webhook_limit: i32,
    pub webhook_count: i32,
    pub created_at: DateTime<Utc>,
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
    pub updated_at: DateTime<Utc>,
    #[serde(default)]
    pub email_verified: bool,
    #[serde(skip_serializing)]
    pub totp_secret: Option<String>,
    #[serde(default)]
    pub totp_enabled: bool,
}

fn default_payment_provider() -> String {
    "stripe".to_string()
}

#[derive(Debug, Deserialize)]
pub struct CreateCustomerRequest {
    pub email: String,
    pub password: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub name: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

// ── Password Reset ──────────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub new_password: String,
}

// ── Email Verification ─────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct VerifyEmailRequest {
    pub token: String,
}

#[derive(Debug, Deserialize)]
pub struct ResendVerificationRequest {
    pub email: String,
}

// ── Refresh Token ───────────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

// ── Two-Factor Auth (TOTP) ─────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct Enable2faRequest {
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct Confirm2faRequest {
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct Disable2faRequest {
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct Verify2faRequest {
    pub temp_token: String,
    pub code: String,
}

// ── Push Notifications (Device Tokens) ─────────────────────
#[derive(Debug, Deserialize)]
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
    pub webhook_limit: i32,
    pub webhook_count: i32,
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
