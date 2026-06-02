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
    /// When the current billing period ends (set by payment provider webhook).
    #[serde(default)]
    pub current_period_end: Option<DateTime<Utc>>,
    /// Whether overage is allowed (never-blocked mode). Default: true.
    #[serde(default = "default_true")]
    pub allow_overage: bool,
    /// Whether to send email notifications for overage. Default: true.
    #[serde(default = "default_true")]
    pub overage_email_notification: bool,
    /// When customer accepted overage terms (legal requirement for metered billing)
    #[serde(default)]
    pub overage_terms_accepted_at: Option<DateTime<Utc>>,
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
    /// Billing interval: "month" or "year"
    #[serde(default)]
    pub billing_interval: Option<String>,
    /// Profile picture URL (from Google/GitHub OAuth)
    #[serde(default)]
    pub avatar_url: Option<String>,
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
    pub avatar_url: Option<String>,
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
            avatar_url: self.avatar_url,
        }
    }
}


mod tests;
