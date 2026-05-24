//! Stripe billing integration for HookSniff.
//!
//! Handles:
//! - Creating Stripe Checkout sessions for plan upgrades
//! - Processing webhook events from Stripe
//! - Managing subscription lifecycle (create, upgrade, cancel, renew)
//! - Customer portal for self-service billing

pub mod stripe_handlers;
pub mod stripe_tests;

// Re-export webhook handler for backward compatibility
pub use stripe_handlers::handle_webhook_event;

use base64::Engine;
use hmac::{Hmac, KeyInit, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::billing::Plan;
use crate::config::Config;
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

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
            Plan::Enterprise => Some(&self.business_monthly),
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
    /// HS-021: Stripe event ID for idempotency (e.g., "evt_abc123")
    pub id: String,
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

    let base_url = cfg.app_url.as_deref().unwrap_or("http://localhost:3001");

    let session = CreateCheckoutSession {
        customer: None,
        client_reference_id: customer_id.to_string(),
        success_url: format!("{}/account?upgraded=true", base_url),
        cancel_url: format!("{}/account?cancelled=true", base_url),
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

    let client = crate::http_client::get_client().clone();
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

    let session: CheckoutSessionResponse = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse Stripe response: {}", e))
    })?;

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

    let base_url = cfg.app_url.as_deref().unwrap_or("http://localhost:3001");

    let client = crate::http_client::get_client().clone();
    let resp = client
        .post("https://api.stripe.com/v1/billing_portal/sessions")
        .bearer_auth(stripe_secret)
        .form(&[
            ("customer", stripe_customer_id),
            ("return_url", &format!("{}/account", base_url)),
        ])
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Stripe portal request failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        tracing::error!("Stripe portal creation failed: {}", body);
        return Err(AppError::Internal(anyhow::anyhow!("Stripe portal failed")));
    }

    #[derive(Deserialize)]
    struct PortalResponse {
        url: String,
    }

    let portal: PortalResponse = resp.json().await.map_err(|e| {
        AppError::Internal(anyhow::anyhow!("Failed to parse portal response: {}", e))
    })?;

    Ok(portal.url)
}

/// Cancel a Stripe subscription immediately.
pub async fn cancel_subscription(
    cfg: &Config,
    stripe_subscription_id: &str,
) -> Result<(), AppError> {
    let stripe_secret = cfg
        .stripe_secret_key
        .as_ref()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Stripe not configured")))?;

    let client = crate::http_client::get_client().clone();
    let resp = client
        .delete(&format!(
            "https://api.stripe.com/v1/subscriptions/{}",
            stripe_subscription_id
        ))
        .bearer_auth(stripe_secret)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Stripe cancel failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        tracing::error!("Stripe subscription cancellation failed: {}", body);
        return Err(AppError::Internal(anyhow::anyhow!(
            "Failed to cancel Stripe subscription"
        )));
    }

    Ok(())
}

// ── Helpers (pub for stripe_handlers and stripe_tests) ─────────

/// Convert CheckoutSession to form-encoded fields for Stripe API
fn checkout_to_form(session: &CreateCheckoutSession) -> Vec<(String, String)> {
    let mut form = vec![
        ("client_reference_id".to_string(), session.client_reference_id.clone()),
        ("success_url".to_string(), session.success_url.clone()),
        ("cancel_url".to_string(), session.cancel_url.clone()),
        ("mode".to_string(), session.mode.clone()),
        ("line_items[0][price]".to_string(), session.line_items[0].price.clone()),
        ("line_items[0][quantity]".to_string(), session.line_items[0].quantity.to_string()),
    ];

    if let Some(ref customer) = session.customer {
        form.push(("customer".to_string(), customer.clone()));
    }

    for (key, value) in &session.metadata {
        form.push((format!("metadata[{}]", key), value.clone()));
    }

    form
}

/// Parse a Stripe `stripe-signature` header value.
///
/// Returns `(timestamp, v1_signature_hex)` on success.
pub(super) fn parse_stripe_signature(header: &str) -> Result<(i64, &str), AppError> {
    let mut timestamp = None;
    let mut signature = None;

    for part in header.split(',') {
        if let Some(ts) = part.strip_prefix("t=") {
            timestamp = ts.parse::<i64>().ok();
        } else if signature.is_none() {
            if let Some(sig) = part.strip_prefix("v1=") {
                signature = Some(sig);
            }
        }
    }

    let ts = timestamp.ok_or_else(|| {
        AppError::BadRequest("Missing timestamp in stripe-signature".into())
    })?;
    let sig = signature.ok_or_else(|| {
        AppError::BadRequest("Missing v1 signature in stripe-signature".into())
    })?;

    Ok((ts, sig))
}

/// Verify the Stripe webhook signature.
pub(super) fn verify_webhook_signature(
    payload: &str,
    header: &str,
    secret: &str,
    tolerance_secs: i64,
) -> Result<(), AppError> {
    let (timestamp, expected_sig) = parse_stripe_signature(header)?;

    let now = chrono::Utc::now().timestamp();
    let age = (now - timestamp).abs();
    if age > tolerance_secs {
        return Err(AppError::BadRequest(format!(
            "Webhook timestamp too old/new: {}s (tolerance: {}s)",
            age, tolerance_secs
        )));
    }

    let key_b64 = secret.strip_prefix("whsec_").unwrap_or(secret);
    let key = base64::engine::general_purpose::STANDARD
        .decode(key_b64)
        .map_err(|_| AppError::BadRequest("Invalid webhook secret format".into()))?;

    let signed_payload = format!("{}.{}", timestamp, payload);
    let mut mac = HmacSha256::new_from_slice(&key)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
    mac.update(signed_payload.as_bytes());
    let computed = hex::encode(mac.finalize().into_bytes());

    if computed != expected_sig {
        return Err(AppError::BadRequest("Invalid webhook signature".into()));
    }

    Ok(())
}

/// Extract card details from Stripe checkout/payment event data and save to customer.
pub(super) async fn extract_and_save_card(
    pool: &sqlx::PgPool,
    customer_id: Uuid,
    data: &serde_json::Value,
) {
    let card = find_card_in_json(data);

    if let Some((brand, last4, exp_month, exp_year)) = card {
        let _ = sqlx::query(
            "UPDATE customers SET card_last4 = $1, card_brand = $2, card_exp_month = $3, card_exp_year = $4, card_updated_at = NOW() WHERE id = $5"
        )
        .bind(&last4)
        .bind(&brand)
        .bind(exp_month as i16)
        .bind(exp_year as i16)
        .bind(customer_id)
        .execute(pool)
        .await;

        tracing::info!(
            "💳 Saved card details for customer {}: {} {} {}/{}",
            customer_id, brand, last4, exp_month, exp_year
        );
    }
}

/// Recursively search JSON for card details in Stripe event data.
fn find_card_in_json(data: &serde_json::Value) -> Option<(String, String, u32, u32)> {
    if let Some(card) = data.get("card").or_else(|| data.get("payment_method_details").and_then(|p| p.get("card"))) {
        let brand = card.get("brand").and_then(|v| v.as_str()).map(|s| s.to_string());
        let last4 = card.get("last4").and_then(|v| v.as_str()).map(|s| s.to_string());
        let exp_month = card.get("exp_month").and_then(|v| v.as_u64()).map(|v| v as u32);
        let exp_year = card.get("exp_year").and_then(|v| v.as_u64()).map(|v| v as u32);

        if let (Some(b), Some(l), Some(m), Some(y)) = (brand, last4, exp_month, exp_year) {
            return Some((b, l, m, y));
        }
    }

    if let Some(obj) = data.as_object() {
        for (_, v) in obj {
            if let Some(found) = find_card_in_json(v) {
                return Some(found);
            }
        }
    }
    if let Some(arr) = data.as_array() {
        for v in arr {
            if let Some(found) = find_card_in_json(v) {
                return Some(found);
            }
        }
    }

    None
}
