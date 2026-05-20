use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CouponCode {
    pub id: Uuid,
    pub code: String,
    /// "polar" or "internal"
    #[serde(rename = "type")]
    pub coupon_type: String,
    /// "percentage" or "free_month"
    pub discount_type: String,
    /// Percentage (0-100) or number of free months
    pub discount_value: i32,
    /// Target plan (NULL = all plans)
    pub target_plan: Option<String>,
    /// Polar discount ID (only for polar type)
    pub polar_discount_id: Option<String>,
    pub max_redemptions: Option<i32>,
    pub redemption_count: i32,
    pub expires_at: Option<DateTime<Utc>>,
    pub is_active: bool,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateCouponRequest {
    pub code: String,
    /// "polar" or "internal"
    #[serde(rename = "type")]
    pub coupon_type: String,
    /// "percentage" or "free_month"
    pub discount_type: String,
    /// Percentage (0-100) or number of free months
    pub discount_value: i32,
    /// Target plan (optional, NULL = all plans)
    pub target_plan: Option<String>,
    /// Max redemptions (optional, NULL = unlimited)
    pub max_redemptions: Option<i32>,
    /// Expiration date (optional)
    pub expires_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateCouponRequest {
    pub code: Option<String>,
    /// "polar" or "internal"
    #[serde(rename = "type")]
    pub coupon_type: Option<String>,
    /// "percentage" or "free_month"
    pub discount_type: Option<String>,
    /// Percentage (0-100) or number of free months
    pub discount_value: Option<i32>,
    /// Target plan (optional, NULL = all plans)
    pub target_plan: Option<String>,
    pub is_active: Option<bool>,
    pub max_redemptions: Option<i32>,
    pub expires_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CouponValidationResult {
    pub valid: bool,
    pub coupon_id: Option<Uuid>,
    pub code: Option<String>,
    pub discount_type: Option<String>,
    pub discount_value: Option<i32>,
    pub target_plan: Option<String>,
    pub message: String,
}
