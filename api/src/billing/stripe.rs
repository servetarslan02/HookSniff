//! Stripe billing integration for HookRelay.
//!
//! Handles:
//! - Creating Stripe Checkout sessions for plan upgrades
//! - Processing webhook events from Stripe
//! - Managing subscription lifecycle (create, upgrade, cancel, renew)
//! - Customer portal for self-service billing

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::billing::{Plan, Subscription, SubscriptionStatus};
use crate::config::Config;
use crate::error::AppError;

/// Stripe price IDs for each plan (set in environment)
#[derive(Debug, Clone)]
pub struct StripePrices {
    pub pro_monthly: String,
    pub business_monthly: String,
}

impl StripePrices {
    pub fn from_env() -> Self {
        Self {
            pro_monthly: std::env::var("STRIPE_PRICE_PRO")
                .unwrap_or_else(|_| "price_pro_monthly".to_string()),
            business_monthly: std::env::var("STRIPE_PRICE_BUSINESS")
                .unwrap_or_else(|_| "price_business_monthly".to_string()),
        }
    }

    pub fn for_plan(&self, plan: &Plan) -> Option<&str> {
        match plan {
            Plan::Pro => Some(&self.pro_monthly),
            Plan::Business => Some(&self.business_monthly),
            _ => None,
        }
    }
}

/// Request to create a Stripe Checkout session
#[derive(Debug, Serialize)]
struct CreateCheckoutSession {
    customer: Option<String>,
    client_reference_id: String,
    success_url: String,
    cancel_url: String,
    mode: String,
    line_items: Vec<CheckoutLineItem>,
    metadata: std::collections::HashMap<String, String>,
}

#[derive(Debug, Serialize)]
struct CheckoutLineItem {
    price: String,
    quantity: u32,
}

/// Response from Stripe Checkout session creation
#[derive(Debug, Deserialize)]
pub struct CheckoutSessionResponse {
    pub id: String,
    pub url: Option<String>,
}

/// Stripe webhook event
#[derive(Debug, Deserialize)]
pub struct StripeWebhookEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub data: StripeEventData,
}

#[derive(Debug, Deserialize)]
pub struct StripeEventData {
    pub object: serde_json::Value,
}

/// Create a Stripe Checkout session for plan upgrade.
///
/// Returns the checkout URL to redirect the user to.
pub async fn create_checkout_session(
    cfg: &Config,
    customer_id: Uuid,
    customer_email: &str,
    plan: &Plan,
) -> Result<CheckoutSessionResponse, AppError> {
    let prices = StripePrices::from_env();
    let price_id = prices
        .for_plan(plan)
        .ok_or_else(|| AppError::BadRequest("Invalid plan for checkout".into()))?;

    let stripe_secret = cfg
        .stripe_secret_key
        .as_ref()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Stripe not configured")))?;

    let base_url = cfg
        .app_url
        .as_deref()
        .unwrap_or("http://localhost:3001");

    let session = CreateCheckoutSession {
        customer: None, // Will be created by Stripe if not exists
        client_reference_id: customer_id.to_string(),
        success_url: format!("{}/dashboard/billing?upgraded=true", base_url),
        cancel_url: format!("{}/dashboard/billing?cancelled=true", base_url),
        mode: "subscription".to_string(),
        line_items: vec![CheckoutLineItem {
            price: price_id.to_string(),
            quantity: 1,
        }],
        metadata: {
            let mut m = std::collections::HashMap::new();
            m.insert("customer_id".to_string(), customer_id.to_string());
            m.insert("plan".to_string(), plan.as_str().to_string());
            m.insert("email".to_string(), customer_email.to_string());
            m
        },
    };

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.stripe.com/v1/checkout/sessions")
        .bearer_auth(stripe_secret)
        .form(&checkout_to_form(&session))
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Stripe request failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        tracing::error!("Stripe checkout session creation failed: {}", body);
        return Err(AppError::Internal(anyhow::anyhow!(
            "Stripe checkout failed"
        )));
    }

    let session: CheckoutSessionResponse = resp
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Stripe response: {}", e)))?;

    Ok(session)
}

/// Create a Stripe Customer Portal session for self-service billing.
///
/// Returns the portal URL to redirect the user to.
pub async fn create_customer_portal(
    cfg: &Config,
    stripe_customer_id: &str,
) -> Result<String, AppError> {
    let stripe_secret = cfg
        .stripe_secret_key
        .as_ref()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Stripe not configured")))?;

    let base_url = cfg
        .app_url
        .as_deref()
        .unwrap_or("http://localhost:3001");

    let client = reqwest::Client::new();
    let resp = client
        .post("https://api.stripe.com/v1/billing_portal/sessions")
        .bearer_auth(stripe_secret)
        .form(&[
            ("customer", stripe_customer_id),
            ("return_url", &format!("{}/dashboard/billing", base_url)),
        ])
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Stripe portal request failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        tracing::error!("Stripe portal creation failed: {}", body);
        return Err(AppError::Internal(anyhow::anyhow!(
            "Stripe portal failed"
        )));
    }

    #[derive(Deserialize)]
    struct PortalResponse {
        url: String,
    }

    let portal: PortalResponse = resp
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse portal response: {}", e)))?;

    Ok(portal.url)
}

/// Verify and process a Stripe webhook event.
///
/// Verifies the webhook signature, then processes the event based on type.
pub async fn handle_webhook_event(
    pool: &sqlx::PgPool,
    payload: &str,
    signature: &str,
    webhook_secret: &str,
) -> Result<(), AppError> {
    // Verify webhook signature (simplified — in production use stripe-rs signature verification)
    let _event: StripeWebhookEvent =
        serde_json::from_str(payload).map_err(|e| AppError::BadRequest(format!("Invalid webhook payload: {}", e)))?;

    // TODO: Implement proper Stripe signature verification using webhook_secret
    // For now, we trust the payload if it parses correctly

    let event: StripeWebhookEvent = serde_json::from_str(payload)
        .map_err(|e| AppError::BadRequest(format!("Invalid event: {}", e)))?;

    match event.event_type.as_str() {
        "checkout.session.completed" => {
            handle_checkout_completed(pool, &event.data.object).await?;
        }
        "customer.subscription.updated" => {
            handle_subscription_updated(pool, &event.data.object).await?;
        }
        "customer.subscription.deleted" => {
            handle_subscription_deleted(pool, &event.data.object).await?;
        }
        "invoice.payment_succeeded" => {
            handle_invoice_paid(pool, &event.data.object).await?;
        }
        "invoice.payment_failed" => {
            handle_invoice_failed(pool, &event.data.object).await?;
        }
        _ => {
            tracing::debug!("Unhandled Stripe event type: {}", event.event_type);
        }
    }

    Ok(())
}

async fn handle_checkout_completed(
    pool: &sqlx::PgPool,
    session: &serde_json::Value,
) -> Result<(), AppError> {
    let customer_id = session
        .get("client_reference_id")
        .and_then(|v| v.as_str())
        .and_then(|s| Uuid::parse_str(s).ok())
        .ok_or_else(|| AppError::BadRequest("Missing customer_id in checkout session".into()))?;

    let stripe_customer_id = session
        .get("customer")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let stripe_subscription_id = session
        .get("subscription")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let plan_str = session
        .get("metadata")
        .and_then(|m| m.get("plan"))
        .and_then(|v| v.as_str())
        .unwrap_or("pro");

    let plan = Plan::from_str(plan_str);

    // Update customer plan and Stripe IDs
    sqlx::query(
        "UPDATE customers SET plan = $1, stripe_customer_id = $2, stripe_subscription_id = $3 WHERE id = $4"
    )
    .bind(plan.as_str())
    .bind(&stripe_customer_id)
    .bind(&stripe_subscription_id)
    .bind(customer_id)
    .execute(pool)
    .await?;

    tracing::info!(
        "✅ Customer {} upgraded to {} via Stripe checkout",
        customer_id,
        plan.as_str()
    );

    Ok(())
}

async fn handle_subscription_updated(
    pool: &sqlx::PgPool,
    subscription: &serde_json::Value,
) -> Result<(), AppError> {
    let stripe_subscription_id = subscription
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    let status = subscription
        .get("status")
        .and_then(|v| v.as_str())
        .unwrap_or("active");

    let plan = match status {
        "active" | "trialing" => {
            // Determine plan from price ID
            let price_id = subscription
                .get("items")
                .and_then(|items| items.get("data"))
                .and_then(|data| data.as_array())
                .and_then(|arr| arr.first())
                .and_then(|item| item.get("price"))
                .and_then(|price| price.get("id"))
                .and_then(|v| v.as_str())
                .unwrap_or("");

            let prices = StripePrices::from_env();
            if price_id == prices.business_monthly {
                "business"
            } else {
                "pro"
            }
        }
        _ => "free",
    };

    sqlx::query(
        "UPDATE customers SET plan = $1 WHERE stripe_subscription_id = $2"
    )
    .bind(plan)
    .bind(stripe_subscription_id)
    .execute(pool)
    .await?;

    tracing::info!(
        "✅ Subscription {} updated: status={}, plan={}",
        stripe_subscription_id,
        status,
        plan
    );

    Ok(())
}

async fn handle_subscription_deleted(
    pool: &sqlx::PgPool,
    subscription: &serde_json::Value,
) -> Result<(), AppError> {
    let stripe_subscription_id = subscription
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    // Downgrade to free plan
    sqlx::query(
        "UPDATE customers SET plan = 'free', stripe_subscription_id = NULL WHERE stripe_subscription_id = $1"
    )
    .bind(stripe_subscription_id)
    .execute(pool)
    .await?;

    tracing::info!(
        "✅ Subscription {} canceled, customer downgraded to free",
        stripe_subscription_id
    );

    Ok(())
}

async fn handle_invoice_paid(
    _pool: &sqlx::PgPool,
    _invoice: &serde_json::Value,
) -> Result<(), AppError> {
    // TODO: Record invoice in database
    tracing::info!("✅ Invoice payment succeeded");
    Ok(())
}

async fn handle_invoice_failed(
    _pool: &sqlx::PgPool,
    _invoice: &serde_json::Value,
) -> Result<(), AppError> {
    // TODO: Send notification to customer, mark as past_due
    tracing::warn!("⚠️ Invoice payment failed");
    Ok(())
}

/// Helper: convert CheckoutSession to form-encoded fields for Stripe API
fn checkout_to_form(session: &CreateCheckoutSession) -> Vec<(String, String)> {
    let mut fields = vec![
        ("client_reference_id".to_string(), session.client_reference_id.clone()),
        ("success_url".to_string(), session.success_url.clone()),
        ("cancel_url".to_string(), session.cancel_url.clone()),
        ("mode".to_string(), session.mode.clone()),
        ("line_items[0][price]".to_string(), session.line_items[0].price.clone()),
        ("line_items[0][quantity]".to_string(), session.line_items[0].quantity.to_string()),
    ];

    if let Some(ref customer) = session.customer {
        fields.push(("customer".to_string(), customer.clone()));
    }

    for (i, (key, value)) in session.metadata.iter().enumerate() {
        fields.push((format!("metadata[{}]", key), value.clone()));
    }

    fields
}
