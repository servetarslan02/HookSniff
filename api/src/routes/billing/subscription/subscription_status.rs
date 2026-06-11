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

    // If user is a team member, use the team owner's plan and limits
    let (effective_plan, effective_owner) = resolve_effective_plan(&pool, &customer).await;
    let plan = effective_plan;

    // Use owner's fields for billing details if user is a team member
    let billing_customer = if let Some(owner_id) = effective_owner {
        sqlx::query_as::<_, Customer>(&format!("{} WHERE id = $1", crate::routes::auth::CUSTOMER_SELECT))
            .bind(owner_id)
            .fetch_optional(&*pool)
            .await?
            .unwrap_or(customer.clone())
    } else {
        customer.clone()
    };

    let status = if billing_customer.paused_at.is_some() {
        "paused".to_string()
    } else if billing_customer.cancel_at_period_end {
        "canceled".to_string()
    } else if billing_customer.payment_failed_at.is_some() {
        "past_due".to_string()
    } else if plan == Plan::Developer {
        "inactive".to_string()
    } else {
        "active".to_string()
    };

    let current_period_end = billing_customer.current_period_end
        .map(|d| d.to_rfc3339());

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status,
        payment_provider: billing_customer.payment_provider.clone(),
        stripe_subscription_id: billing_customer.stripe_subscription_id.clone(),
        polar_subscription_id: billing_customer.polar_subscription_id.clone(),
        iyzico_subscription_id: billing_customer.iyzico_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_day(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
        cancel_at_period_end: billing_customer.cancel_at_period_end,
        billing_period: billing_customer.billing_interval.clone().unwrap_or_else(|| "month".to_string()),
        current_period_end,
        card_last4: billing_customer.card_last4.clone(),
        card_brand: billing_customer.card_brand.clone(),
        card_exp_month: billing_customer.card_exp_month,
        card_exp_year: billing_customer.card_exp_year,
        paused_at: billing_customer.paused_at.map(|d| d.to_rfc3339()),
        paused_until: billing_customer.paused_until.map(|d| d.to_rfc3339()),
        pause_plan: billing_customer.pause_plan.clone(),
        has_used_startup_trial: billing_customer.has_used_startup_trial,
    }))
}

/// Resolve the effective plan for a customer.
/// If the customer is a team member, returns the team owner's plan.
/// If not a team member, returns the customer's own plan.
async fn resolve_effective_plan(
    pool: &sqlx::PgPool,
    customer: &Customer,
) -> (Plan, Option<uuid::Uuid>) {
    use uuid::Uuid;

    // Find any team where this user is a member
    let team: Option<(Uuid,)> = sqlx::query_as(
        "SELECT t.owner_id FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.customer_id = $1 LIMIT 1"
    )
    .bind(customer.id)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten();

    if let Some((owner_id,)) = team {
        // Get owner's plan
        let owner_plan: Option<(String,)> = sqlx::query_as(
            "SELECT plan FROM customers WHERE id = $1"
        )
        .bind(owner_id)
        .fetch_optional(pool)
        .await
        .ok()
        .flatten();

        if let Some((plan_str,)) = owner_plan {
            return (Plan::parse_str(&plan_str), Some(owner_id));
        }
    }

    (Plan::parse_str(&customer.plan), None)
}
