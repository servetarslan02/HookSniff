use super::super::*;
use serde::{Deserialize, Serialize};

// ──────────────────────────────────────────────────────────────
// Shared types for subscription handlers
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub(crate) struct PauseRequest {
    /// Duration in days to pause (default: 30, max: 90)
    #[serde(default = "default_pause_days")]
    pub(crate) days: i32,
}

fn default_pause_days() -> i32 {
    30
}

#[derive(Debug, Deserialize)]
pub(crate) struct UpgradeRequest {
    pub(crate) plan: String,
    /// Payment provider: "stripe", "polar", or "iyzico"
    #[serde(default)]
    pub(crate) provider: Option<String>,
    /// Billing period: "monthly" (default) or "annual"
    #[serde(default)]
    pub(crate) billing_period: Option<String>,
    /// Discount/coupon code to apply at checkout.
    #[serde(default)]
    pub(crate) discount_code: Option<String>,
}

#[derive(Debug, Serialize)]
pub(crate) struct UpgradeResponse {
    pub(crate) checkout_url: Option<String>,
    pub(crate) provider: String,
    pub(crate) message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) prorated_amount_cents: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) days_remaining: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) requires_contact: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) contact_url: Option<String>,
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/subscription — Get current subscription
// ──────────────────────────────────────────────────────────────

pub async fn get_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<SubscriptionResponse>, AppError> {
    crate::routes::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let plan = Plan::parse_str(&customer.plan);

    let status = if customer.paused_at.is_some() {
        "paused".to_string()
    } else if customer.cancel_at_period_end {
        "canceled".to_string()
    } else if customer.payment_failed_at.is_some() {
        "past_due".to_string()
    } else if plan == Plan::Developer {
        "inactive".to_string()
    } else {
        "active".to_string()
    };

    let current_period_end = customer.current_period_end
        .map(|d| d.to_rfc3339());

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status,
        payment_provider: customer.payment_provider.clone(),
        stripe_subscription_id: customer.stripe_subscription_id.clone(),
        polar_subscription_id: customer.polar_subscription_id.clone(),
        iyzico_subscription_id: customer.iyzico_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_day(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
        cancel_at_period_end: customer.cancel_at_period_end,
        billing_period: customer.billing_interval.clone().unwrap_or_else(|| "month".to_string()),
        current_period_end,
        card_last4: customer.card_last4.clone(),
        card_brand: customer.card_brand.clone(),
        card_exp_month: customer.card_exp_month,
        card_exp_year: customer.card_exp_year,
        paused_at: customer.paused_at.map(|d| d.to_rfc3339()),
        paused_until: customer.paused_until.map(|d| d.to_rfc3339()),
        pause_plan: customer.pause_plan.clone(),
        has_used_startup_trial: customer.has_used_startup_trial,
    }))
}
