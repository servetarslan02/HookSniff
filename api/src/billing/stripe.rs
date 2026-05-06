//! Stripe billing integration for HookRelay.
//!
//! Handles:
//! - Creating Stripe Checkout sessions for plan upgrades
//! - Processing webhook events from Stripe
//! - Managing subscription lifecycle (create, upgrade, cancel, renew)
//! - Customer portal for self-service billing

use base64::Engine;
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::billing::{Plan, Subscription, SubscriptionStatus};
use crate::config::Config;
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// Maximum age of a webhook event before it's rejected (5 minutes).
const WEBHOOK_TIMESTAMP_TOLERANCE_SECS: i64 = 300;

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
/// Verifies the webhook signature using HMAC-SHA256, then processes the event.
pub async fn handle_webhook_event(
    pool: &sqlx::PgPool,
    payload: &str,
    signature: &str,
    webhook_secret: &str,
) -> Result<(), AppError> {
    // Step 1: Verify the Stripe webhook signature
    verify_webhook_signature(payload, signature, webhook_secret)?;

    // Step 2: Parse and process the event
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
                timestamp = Some(
                    value
                        .parse::<i64>()
                        .map_err(|_| AppError::BadRequest("Invalid timestamp in signature header".into()))?,
                );
            }
            "v1" => {
                // Accept the first v1 signature we see
                if v1_sig.is_none() {
                    v1_sig = Some(value);
                }
            }
            _ => {} // Ignore unknown fields (future-proofing)
        }
    }

    let ts = timestamp.ok_or_else(|| AppError::BadRequest("Missing timestamp in signature header".into()))?;
    let sig = v1_sig.ok_or_else(|| AppError::BadRequest("Missing v1 signature in header".into()))?;

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
) -> Result<(), AppError> {
    // 1. Parse the signature header
    let (timestamp, expected_sig_hex) = parse_stripe_signature(signature_header)?;

    // 2. Check timestamp freshness (replay protection)
    let now = chrono::Utc::now().timestamp();
    let age = (now - timestamp).abs();
    if age > WEBHOOK_TIMESTAMP_TOLERANCE_SECS {
        tracing::warn!(
            "Stripe webhook timestamp too old: {}s (max {}s)",
            age,
            WEBHOOK_TIMESTAMP_TOLERANCE_SECS
        );
        return Err(AppError::BadRequest("Webhook timestamp too old".into()));
    }

    // 3. Extract the signing key (strip `whsec_` prefix, base64-decode)
    let key_b64 = webhook_secret
        .strip_prefix("whsec_")
        .unwrap_or(webhook_secret);
    let key = base64::engine::general_purpose::STANDARD
        .decode(key_b64)
        .map_err(|_| AppError::BadRequest("Invalid webhook secret format".into()))?;

    // 4. Compute HMAC-SHA256 over "{timestamp}.{payload}"
    let signed_payload = format!("{}.{}", timestamp, payload);
    let mut mac = HmacSha256::new_from_slice(&key)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
    mac.update(signed_payload.as_bytes());

    // 5. Decode the expected signature from hex and verify (constant-time)
    let expected_sig = hex::decode(expected_sig_hex)
        .map_err(|_| AppError::BadRequest("Invalid signature hex encoding".into()))?;

    mac.verify_slice(&expected_sig)
        .map_err(|_| AppError::Unauthorized)?;

    tracing::debug!("Stripe webhook signature verified (ts={})", timestamp);
    Ok(())
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
        let secret = "whsec_test_secret_base64_encoded_key_here_32b!";
        let payload = r#"{"id":"evt_123","type":"checkout.session.completed"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret, now);

        assert!(verify_webhook_signature(payload, &header, secret).is_ok());
    }

    #[test]
    fn test_verify_signature_tampered_payload() {
        let secret = "whsec_test_secret_base64_encoded_key_here_32b!";
        let payload = r#"{"id":"evt_123","type":"checkout.session.completed"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret, now);

        let tampered = r#"{"id":"evt_123","type":"payment_intent.succeeded"}"#;
        assert!(verify_webhook_signature(tampered, &header, secret).is_err());
    }

    #[test]
    fn test_verify_signature_wrong_secret() {
        let secret_a = "whsec_test_secret_base64_encoded_key_here_32b!";
        let secret_b = "whsec_different_secret_for_testing_purposes__!!";
        let payload = r#"{"id":"evt_456"}"#;
        let now = chrono::Utc::now().timestamp();
        let header = make_signature(payload, secret_a, now);

        assert!(verify_webhook_signature(payload, &header, secret_b).is_err());
    }

    #[test]
    fn test_verify_signature_expired_timestamp() {
        let secret = "whsec_test_secret_base64_encoded_key_here_32b!";
        let payload = r#"{"id":"evt_789"}"#;
        // 10 minutes ago — beyond 5-minute tolerance
        let old_ts = chrono::Utc::now().timestamp() - 600;
        let header = make_signature(payload, secret, old_ts);

        assert!(verify_webhook_signature(payload, &header, secret).is_err());
    }

    #[test]
    fn test_verify_signature_future_timestamp() {
        let secret = "whsec_test_secret_base64_encoded_key_here_32b!";
        let payload = r#"{"id":"evt_future"}"#;
        // 10 minutes in the future — beyond tolerance
        let future_ts = chrono::Utc::now().timestamp() + 600;
        let header = make_signature(payload, secret, future_ts);

        assert!(verify_webhook_signature(payload, &header, secret).is_err());
    }

    #[test]
    fn test_verify_signature_malformed_header() {
        let secret = "whsec_test";
        assert!(verify_webhook_signature("{}", "garbage", secret).is_err());
        assert!(verify_webhook_signature("{}", "", secret).is_err());
    }
}
