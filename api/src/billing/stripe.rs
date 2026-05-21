//! Stripe billing integration for HookSniff.
//!
//! Handles:
//! - Creating Stripe Checkout sessions for plan upgrades
//! - Processing webhook events from Stripe
//! - Managing subscription lifecycle (create, upgrade, cancel, renew)
//! - Customer portal for self-service billing

use base64::Engine;
use hmac::{Hmac, KeyInit, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::billing::Plan;
use crate::config::Config;
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// Default maximum age of a webhook event before it's rejected (5 minutes).
/// Overridden by config.webhook_timestamp_tolerance_secs when available.
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
        customer: None, // Will be created by Stripe if not exists
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
///
/// Calls the Stripe API to cancel the subscription by ID.
pub async fn cancel_subscription(
    cfg: &Config,
    stripe_subscription_id: &str,
) -> Result<(), AppError> {
    let stripe_secret = cfg
        .stripe_secret_key
        .as_ref()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Stripe not configured")))?;

    let client = crate::http_client::get_client().clone();
    let url = format!(
        "https://api.stripe.com/v1/subscriptions/{}",
        stripe_subscription_id
    );

    let resp = client
        .delete(&url)
        .bearer_auth(stripe_secret)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Stripe cancel request failed: {}", e)))?;

    if !resp.status().is_success() {
        let body = resp.text().await.unwrap_or_default();
        tracing::error!(
            "Stripe subscription cancellation failed for {}: {}",
            stripe_subscription_id,
            body
        );
        return Err(AppError::Internal(anyhow::anyhow!(
            "Stripe subscription cancellation failed"
        )));
    }

    tracing::info!(
        "✅ Stripe subscription {} canceled",
        stripe_subscription_id
    );

    Ok(())
}

/// Verify and process a Stripe webhook event.
///
/// Verifies the webhook signature using HMAC-SHA256, then processes the event.
pub async fn handle_webhook_event(
    pool: &sqlx::PgPool,
    payload: &str,
    signature: &str,
    webhook_secret: &str,
    tolerance_secs: i64,
) -> Result<(), AppError> {
    // Step 1: Verify the Stripe webhook signature
    verify_webhook_signature(payload, signature, webhook_secret, tolerance_secs)?;

    // Step 2: Parse and process the event
    let event: StripeWebhookEvent = serde_json::from_str(payload).map_err(|e| {
        tracing::warn!("Invalid Stripe webhook payload: {:?}", e);
        AppError::BadRequest("Invalid webhook payload".into())
    })?;

    // HS-021: Idempotency check — skip already-processed events
    let already_processed: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE provider_tx_id = $1)",
    )
    .bind(&event.id)
    .fetch_one(pool)
    .await
    .unwrap_or(false);

    if already_processed {
        tracing::info!("♻️ Stripe event {} already processed, skipping", event.id);
        return Ok(());
    }

    tracing::info!(
        "📦 Processing Stripe event {} ({})",
        event.id,
        event.event_type
    );

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
        "charge.dispute.created" => {
            // Item 251: Handle chargeback — suspend account
            handle_chargeback_created(pool, &event.data.object).await?;
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

    let plan = Plan::parse_str(plan_str);

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

    // Extract card details from checkout session (if available in expanded webhook)
    extract_and_save_card(pool, customer_id, session).await;

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
                "enterprise"
            } else {
                "pro"
            }
        }
        _ => "developer",
    };

    sqlx::query("UPDATE customers SET plan = $1 WHERE stripe_subscription_id = $2")
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
    let free_limit = crate::billing::Plan::Developer.max_webhooks_per_day() as i64;
    sqlx::query(
        "UPDATE customers SET plan = 'free', webhook_limit = $1, stripe_subscription_id = NULL, cancel_at_period_end = false, updated_at = NOW() WHERE stripe_subscription_id = $2"
    )
    .bind(free_limit)
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
    pool: &sqlx::PgPool,
    invoice: &serde_json::Value,
) -> Result<(), AppError> {
    let provider_invoice_id = invoice
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string();

    let stripe_customer_id = invoice
        .get("customer")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    let amount_cents = invoice
        .get("amount_paid")
        .and_then(|v| v.as_i64())
        .or_else(|| invoice.get("amount_due").and_then(|v| v.as_i64()))
        .unwrap_or(0) as i32;

    let currency = invoice
        .get("currency")
        .and_then(|v| v.as_str())
        .unwrap_or("usd")
        .to_string();

    // Determine plan from line items or metadata
    let plan = invoice
        .get("lines")
        .and_then(|lines| lines.get("data"))
        .and_then(|data| data.as_array())
        .and_then(|arr| arr.first())
        .and_then(|item| item.get("price"))
        .and_then(|price| price.get("id"))
        .and_then(|v| v.as_str())
        .map(|price_id| {
            let prices = StripePrices::from_env();
            if price_id == prices.business_monthly {
                "enterprise".to_string()
            } else {
                "pro".to_string()
            }
        })
        .unwrap_or_else(|| "pro".to_string());

    let paid_at = invoice
        .get("status_transitions")
        .and_then(|st| st.get("paid_at"))
        .and_then(|v| v.as_i64())
        .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0));

    // Look up internal customer_id from stripe_customer_id
    let customer_row: Option<(uuid::Uuid,)> =
        sqlx::query_as("SELECT id FROM customers WHERE stripe_customer_id = $1")
            .bind(stripe_customer_id)
            .fetch_optional(pool)
            .await?;

    if let Some((customer_id,)) = customer_row {
        sqlx::query(
            "INSERT INTO invoices (customer_id, amount_cents, currency, plan, status, provider, provider_invoice_id, paid_at) \
             VALUES ($1, $2, $3, $4, 'paid', 'stripe', $5, $6)",
        )
        .bind(customer_id)
        .bind(amount_cents)
        .bind(&currency)
        .bind(&plan)
        .bind(&provider_invoice_id)
        .bind(paid_at)
        .execute(pool)
        .await?;

        // HS-059: Clear grace period on successful payment
        sqlx::query(
            "UPDATE customers SET payment_failed_at = NULL, updated_at = NOW() \
             WHERE id = $1 AND payment_failed_at IS NOT NULL",
        )
        .bind(customer_id)
        .execute(pool)
        .await?;

        tracing::info!(
            "✅ Invoice recorded: {} (${} {}) — grace period cleared",
            provider_invoice_id,
            amount_cents as f64 / 100.0,
            currency
        );
    } else {
        tracing::warn!(
            "⚠️ Invoice {} paid but no customer found for stripe_customer_id={}",
            provider_invoice_id,
            stripe_customer_id
        );
    }

    Ok(())
}

async fn handle_invoice_failed(
    pool: &sqlx::PgPool,
    invoice: &serde_json::Value,
) -> Result<(), AppError> {
    let provider_invoice_id = invoice
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    let stripe_customer_id = invoice
        .get("customer")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    let amount_cents = invoice
        .get("amount_due")
        .and_then(|v| v.as_i64())
        .unwrap_or(0) as i32;

    let currency = invoice
        .get("currency")
        .and_then(|v| v.as_str())
        .unwrap_or("usd")
        .to_string();

    // Look up internal customer_id
    let customer_row: Option<(uuid::Uuid,)> =
        sqlx::query_as("SELECT id FROM customers WHERE stripe_customer_id = $1")
            .bind(stripe_customer_id)
            .fetch_optional(pool)
            .await?;

    if let Some((customer_id,)) = customer_row {
        // Record the failed invoice
        sqlx::query(
            "INSERT INTO invoices (customer_id, amount_cents, currency, plan, status, provider, provider_invoice_id) \
             VALUES ($1, $2, $3, (SELECT plan FROM customers WHERE id = $1), 'failed', 'stripe', $4)",
        )
        .bind(customer_id)
        .bind(amount_cents)
        .bind(&currency)
        .bind(provider_invoice_id)
        .execute(pool)
        .await?;

        // HS-059: Set grace period start on payment failure
        sqlx::query(
            "UPDATE customers SET payment_failed_at = NOW(), updated_at = NOW() \
             WHERE id = $1 AND payment_failed_at IS NULL",
        )
        .bind(customer_id)
        .execute(pool)
        .await?;

        tracing::warn!(
            "⚠️ Invoice payment failed for customer {} — grace period started",
            customer_id
        );
    }

    tracing::warn!("⚠️ Invoice payment failed: {}", provider_invoice_id);
    Ok(())
}

/// Item 251: Handle Stripe chargeback (charge.dispute.created).
///
/// When a chargeback is received, we:
/// 1. Find the customer by the disputed charge's customer ID
/// 2. Downgrade them to free plan
/// 3. Clear subscription IDs
/// 4. Mark payment_failed_at for audit trail
async fn handle_chargeback_created(
    pool: &sqlx::PgPool,
    dispute: &serde_json::Value,
) -> Result<(), AppError> {
    // The dispute object contains a "charge" field which references the original charge.
    // We need to find the customer from the charge or from the subscription.
    let charge_id = dispute
        .get("charge")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    // The payment_intent or customer might be available in the dispute
    let stripe_customer_id = dispute
        .get("customer")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    if !stripe_customer_id.is_empty() {
        let customer_row: Option<(uuid::Uuid,)> =
            sqlx::query_as("SELECT id FROM customers WHERE stripe_customer_id = $1")
                .bind(stripe_customer_id)
                .fetch_optional(pool)
                .await?;

        if let Some((customer_id,)) = customer_row {
            // Downgrade to free and clear subscription
            let free_limit = crate::billing::Plan::Developer.max_webhooks_per_day() as i32;
            sqlx::query(
                "UPDATE customers SET \
                 plan = 'free', webhook_limit = $1, \
                 stripe_subscription_id = NULL, \
                 cancel_at_period_end = false, payment_failed_at = NOW(), \
                 updated_at = NOW() \
                 WHERE id = $2",
            )
            .bind(free_limit)
            .bind(customer_id)
            .execute(pool)
            .await?;

            // Mark invoice as refunded
            sqlx::query(
                "UPDATE invoices SET status = 'refunded' \
                 WHERE id = (\
                   SELECT id FROM invoices \
                   WHERE customer_id = $1 AND status = 'paid' \
                   ORDER BY created_at DESC LIMIT 1\
                 )",
            )
            .bind(customer_id)
            .execute(pool)
            .await?;

            tracing::warn!(
                "🚨 Chargeback received for Stripe customer {} (charge: {}) — customer {} suspended",
                stripe_customer_id,
                charge_id,
                customer_id
            );
        } else {
            tracing::warn!(
                "🚨 Chargeback received for unknown Stripe customer {} (charge: {})",
                stripe_customer_id,
                charge_id
            );
        }
    } else {
        tracing::warn!(
            "🚨 Chargeback received but no customer ID in dispute (charge: {})",
            charge_id
        );
    }

    Ok(())
}

/// Helper: convert CheckoutSession to form-encoded fields for Stripe API
fn checkout_to_form(session: &CreateCheckoutSession) -> Vec<(String, String)> {
    let mut fields = vec![
        (
            "client_reference_id".to_string(),
            session.client_reference_id.clone(),
        ),
        ("success_url".to_string(), session.success_url.clone()),
        ("cancel_url".to_string(), session.cancel_url.clone()),
        ("mode".to_string(), session.mode.clone()),
        (
            "line_items[0][price]".to_string(),
            session.line_items[0].price.clone(),
        ),
        (
            "line_items[0][quantity]".to_string(),
            session.line_items[0].quantity.to_string(),
        ),
    ];

    if let Some(ref customer) = session.customer {
        fields.push(("customer".to_string(), customer.clone()));
    }

    for (key, value) in session.metadata.iter() {
        fields.push((format!("metadata[{}]", key), value.clone()));
    }

    fields
}

/// Parse a Stripe `stripe-signature` header value.
///
/// Returns `(timestamp, v1_signature_hex)` on success.
///
/// Stripe signature header format:
///   `t=<unix_timestamp>,v1=<hex_signature>[,v1=<hex_signature>...]`
///
/// We accept the first `v1` element. Stripe may include multiple during key
/// rotation, but we only verify against the webhook secret we have.
fn parse_stripe_signature(header: &str) -> Result<(i64, &str), AppError> {
    let mut timestamp: Option<i64> = None;
    let mut v1_sig: Option<&str> = None;

    for part in header.split(',') {
        let Some((key, value)) = part.split_once('=') else {
            continue;
        };
        let key = key.trim();
        let value = value.trim();

        match key {
            "t" => {
                timestamp = Some(value.parse::<i64>().map_err(|_| {
                    AppError::BadRequest("Invalid webhook signature".into())
                })?);
            }
            "v1"
                // Accept the first v1 signature we see
                if v1_sig.is_none() => {
                    v1_sig = Some(value);
                }
            _ => {} // Ignore unknown fields (future-proofing)
        }
    }

    let ts = timestamp.ok_or_else(|| AppError::BadRequest("Invalid webhook signature".into()))?;
    let sig = v1_sig.ok_or_else(|| AppError::BadRequest("Invalid webhook signature".into()))?;

    Ok((ts, sig))
}

/// Verify the Stripe webhook signature.
///
/// Stripe signs webhooks by computing:
///   HMAC-SHA256(webhook_secret, "{timestamp}.{payload}")
///
/// The webhook secret starts with `whsec_`; the actual key is the base64-
/// encoded portion after the prefix.
///
/// Returns `Ok(())` if the signature is valid, `Err` otherwise.
fn verify_webhook_signature(
    payload: &str,
    signature_header: &str,
    webhook_secret: &str,
    tolerance_secs: i64,
) -> Result<(), AppError> {
    // Reject if webhook secret is not configured
    if webhook_secret.is_empty() {
        tracing::error!(
            "Stripe webhook secret is empty — rejecting webhook to prevent billing manipulation"
        );
        return Err(AppError::Internal(anyhow::anyhow!(
            "Billing webhook secret not configured"
        )));
    }

    // 1. Parse the signature header
    let (timestamp, expected_sig_hex) = parse_stripe_signature(signature_header)?;

    // 2. Check timestamp freshness (replay protection)
    let now = chrono::Utc::now().timestamp();
    let age = (now - timestamp).abs();
    if age > tolerance_secs {
        tracing::warn!(
            "Stripe webhook timestamp too old: {}s (max {}s)",
            age,
            tolerance_secs
        );
        return Err(AppError::BadRequest("Webhook signature expired".into()));
    }

    // 3. Extract the signing key (strip `whsec_` prefix, base64-decode)
    let key_b64 = webhook_secret
        .strip_prefix("whsec_")
        .unwrap_or(webhook_secret);
    let key = base64::engine::general_purpose::STANDARD
        .decode(key_b64)
        .map_err(|_| AppError::BadRequest("Invalid webhook signature".into()))?;

    // 4. Compute HMAC-SHA256 over "{timestamp}.{payload}"
    let signed_payload = format!("{}.{}", timestamp, payload);
    let mut mac = HmacSha256::new_from_slice(&key)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
    mac.update(signed_payload.as_bytes());

    // 5. Decode the expected signature from hex and verify (constant-time)
    let expected_sig = hex::decode(expected_sig_hex)
        .map_err(|_| AppError::BadRequest("Invalid webhook signature".into()))?;

    mac.verify_slice(&expected_sig)
        .map_err(|_| AppError::Unauthorized)?;

    tracing::debug!("Stripe webhook signature verified (ts={})", timestamp);
    Ok(())
}

/// Extract card details from Stripe checkout/payment event data and save to customer.
///
/// Stripe sends card info in various nested locations depending on the event type.
/// This function tries multiple paths to find card brand, last4, and expiry.
async fn extract_and_save_card(
    pool: &sqlx::PgPool,
    customer_id: Uuid,
    data: &serde_json::Value,
) {
    // Try to find card details in the event data
    // Path 1: payment_intent → payment_method_details → card
    // Path 2: payment_intent → charges → data[0] → payment_method_details → card
    // Path 3: direct from session expanded fields
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
    // Look for "card" objects with brand/last4/exp_month/exp_year
    if let Some(card) = data.get("card").or_else(|| data.get("payment_method_details").and_then(|p| p.get("card"))) {
        let brand = card.get("brand").and_then(|v| v.as_str()).map(|s| s.to_string());
        let last4 = card.get("last4").and_then(|v| v.as_str()).map(|s| s.to_string());
        let exp_month = card.get("exp_month").and_then(|v| v.as_u64()).map(|v| v as u32);
        let exp_year = card.get("exp_year").and_then(|v| v.as_u64()).map(|v| v as u32);

        if let (Some(b), Some(l), Some(m), Some(y)) = (brand, last4, exp_month, exp_year) {
            return Some((b, l, m, y));
        }
    }

    // Recurse into objects and arrays
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

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: compute a valid Stripe-style webhook signature for testing.
    fn make_signature(payload: &str, secret: &str, timestamp: i64) -> String {
        // Stripe uses the raw secret bytes (after stripping whsec_ prefix and base64-decoding)
        let key_b64 = secret.strip_prefix("whsec_").unwrap_or(secret);
        let key = base64::engine::general_purpose::STANDARD
            .decode(key_b64)
            .unwrap();

        let signed_payload = format!("{}.{}", timestamp, payload);
        let mut mac = HmacSha256::new_from_slice(&key).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig = hex::encode(mac.finalize().into_bytes());
        format!("t={},v1={}", timestamp, sig)
    }

    #[test]
    fn test_parse_stripe_signature_valid() {
        let header = "t=1234567890,v1=abcdef1234567890";
        let (ts, sig) = parse_stripe_signature(header).unwrap();
        assert_eq!(ts, 1234567890);
        assert_eq!(sig, "abcdef1234567890");
    }

    #[test]
    fn test_parse_stripe_signature_multiple_v1() {
        // Stripe may include multiple v1 values during key rotation
        let header = "t=999,v1=first_sig,v1=second_sig";
        let (ts, sig) = parse_stripe_signature(header).unwrap();
        assert_eq!(ts, 999);
        assert_eq!(sig, "first_sig"); // First one wins
    }

    #[test]
    fn test_parse_stripe_signature_missing_timestamp() {
        let header = "v1=abcdef";
        assert!(parse_stripe_signature(header).is_err());
    }

    #[test]
    fn test_parse_stripe_signature_missing_v1() {
        let header = "t=1234567890";
        assert!(parse_stripe_signature(header).is_err());
    }

    #[test]
    fn test_verify_signature_valid() {
        // Use a proper base64-encoded 32-byte key
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_123","type":"checkout.session.completed"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret, now);

        assert!(verify_webhook_signature(payload, &header, secret, 300).is_ok());
    }

    #[test]
    fn test_verify_signature_tampered_payload() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_123","type":"checkout.session.completed"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret, now);

        let tampered = r#"{"id":"evt_123","type":"payment_intent.succeeded"}"#;
        assert!(verify_webhook_signature(tampered, &header, secret, 300).is_err());
    }

    #[test]
    fn test_verify_signature_wrong_secret() {
        let secret_a = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let secret_b = "whsec_ZGlmZmVyZW50X3NlY3JldF9mb3JfdGVzdGluZ19wdXJwb3Nlcw==";
        let payload = r#"{"id":"evt_456"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret_a, now);

        assert!(verify_webhook_signature(payload, &header, secret_b, 300).is_err());
    }

    #[test]
    fn test_verify_signature_expired_timestamp() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_789"}"#;
        // 10 minutes ago — beyond 5-minute tolerance
        let old_ts = chrono::Utc::now().timestamp() - 600;
        let header = make_signature(payload, secret, old_ts);

        assert!(verify_webhook_signature(payload, &header, secret, 300).is_err());
    }

    #[test]
    fn test_verify_signature_future_timestamp() {
        let secret = "whsec_dGVzdF9zZWNyZXRfYmFzZTY0X2tleV9oZXJlXzMyYg==";
        let payload = r#"{"id":"evt_future"}"#;
        // 10 minutes in the future — beyond tolerance
        let future_ts = chrono::Utc::now().timestamp() + 600;
        let header = make_signature(payload, secret, future_ts);

        assert!(verify_webhook_signature(payload, &header, secret, 300).is_err());
    }

    #[test]
    fn test_verify_signature_malformed_header() {
        let secret = "whsec_test";
        assert!(verify_webhook_signature("{}", "garbage", secret, 300).is_err());
        assert!(verify_webhook_signature("{}", "", secret, 300).is_err());
    }
}
