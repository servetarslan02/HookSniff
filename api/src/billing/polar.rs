//! Polar.sh billing integration for HookSniff.
//!
//! Polar.sh is a Merchant of Record (MoR) that handles:
//! - Payment processing (credit card, Apple Pay, Google Pay)
//! - Global sales tax compliance
//! - Invoicing and receipts
//! - Chargeback protection
//!
//! Environment variables:
//!   POLAR_ACCESS_TOKEN — Polar.sh API access token (Bearer token)
//!   POLAR_WEBHOOK_SECRET — Webhook secret for signature verification
//!   POLAR_PRODUCT_PRO — Product ID for Pro plan
//!   POLAR_PRODUCT_BUSINESS — Product ID for Business plan
//!   POLAR_ENV — "sandbox" or "production" (default: production)

use async_trait::async_trait;
use hmac::{Hmac, KeyInit, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::billing::provider::{CheckoutResult, PaymentProviderImpl, WebhookResult};
use crate::billing::Plan;
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// Polar.sh API configuration.
#[derive(Debug, Clone)]
pub struct PolarConfig {
    pub access_token: String,
    pub webhook_secret: String,
    pub product_startup: String,
    pub product_pro: String,
    pub product_business: String,
    pub product_startup_yearly: String,
    pub product_pro_yearly: String,
    pub product_business_yearly: String,
    pub base_url: String,
}

impl PolarConfig {
    pub fn from_env() -> Option<Self> {
        let access_token = std::env::var("POLAR_ACCESS_TOKEN").ok()?;
        let webhook_secret = std::env::var("POLAR_WEBHOOK_SECRET").ok()?;

        let is_sandbox = std::env::var("POLAR_ENV")
            .map(|v| v == "sandbox")
            .unwrap_or(false);

        let base_url = if is_sandbox {
            "https://sandbox-api.polar.sh".to_string()
        } else {
            "https://api.polar.sh".to_string()
        };

        Some(Self {
            access_token,
            webhook_secret,
            product_startup: std::env::var("POLAR_PRODUCT_STARTUP")
                .unwrap_or_else(|_| "c6e90bf0-4e5d-44cb-8eeb-4aafa8591ebf".to_string()),
            product_pro: std::env::var("POLAR_PRODUCT_PRO")
                .unwrap_or_else(|_| "ec5826ad-4a01-4146-b2d0-3b99eaf150a5".to_string()),
            product_business: std::env::var("POLAR_PRODUCT_BUSINESS")
                .unwrap_or_else(|_| "e5b7d88a-7606-4963-a070-4102ca6405e2".to_string()),
            product_startup_yearly: std::env::var("POLAR_PRODUCT_STARTUP_YEARLY")
                .unwrap_or_else(|_| "ac15aa41-e1fa-468d-9ae7-b2bc271d9715".to_string()),
            product_pro_yearly: std::env::var("POLAR_PRODUCT_PRO_YEARLY")
                .unwrap_or_else(|_| "ffa27799-49f4-42d9-9cfa-2b4d3502642f".to_string()),
            product_business_yearly: std::env::var("POLAR_PRODUCT_BUSINESS_YEARLY")
                .unwrap_or_else(|_| "3accbb69-37eb-4128-b09f-04cf191e4147".to_string()),
            base_url,
        })
    }

    fn product_id_for_plan(&self, plan: &Plan, yearly: bool) -> Option<&str> {
        if yearly {
            match plan {
                Plan::Startup => Some(&self.product_startup_yearly),
                Plan::Pro => Some(&self.product_pro_yearly),
                Plan::Enterprise => Some(&self.product_business_yearly),
                _ => None,
            }
        } else {
            match plan {
                Plan::Startup => Some(&self.product_startup),
                Plan::Pro => Some(&self.product_pro),
                Plan::Enterprise => Some(&self.product_business),
                _ => None,
            }
        }
    }

    /// Check if a product ID is a yearly subscription.
    fn is_yearly_product(&self, product_id: &str) -> bool {
        product_id == self.product_startup_yearly
            || product_id == self.product_pro_yearly
            || product_id == self.product_business_yearly
    }

    /// Auto-apply discount ID for Startup plan (first month free).
    /// Created in Polar Dashboard: 100% off, Once, Startup product only.
    /// Set POLAR_STARTUP_TRIAL_DISCOUNT_ID env var with the discount ID from Polar.
    fn startup_trial_discount_id(&self) -> Option<String> {
        std::env::var("POLAR_STARTUP_TRIAL_DISCOUNT_ID").ok().filter(|s| !s.is_empty())
    }

}

// ── Polar.sh API types ────────────────────────────────────────

/// Request to create a checkout session.
///
/// Polar.sh API v1 requires `products` (array) instead of `product_id`.
#[derive(Debug, Serialize)]
struct CreateCheckoutRequest {
    /// Product IDs to include in the checkout (Polar v1 API format).
    products: Vec<String>,
    /// External customer ID (our customer UUID).
    #[serde(skip_serializing_if = "Option::is_none")]
    external_customer_id: Option<String>,
    /// Customer email (pre-fills checkout form).
    #[serde(skip_serializing_if = "Option::is_none")]
    customer_email: Option<String>,
    /// Success redirect URL.
    #[serde(skip_serializing_if = "Option::is_none")]
    success_url: Option<String>,
    /// Checkout locale.
    #[serde(skip_serializing_if = "Option::is_none")]
    locale: Option<String>,
    /// Discount code to apply.
    #[serde(skip_serializing_if = "Option::is_none")]
    discount_code: Option<String>,
    /// Discount ID to auto-apply (no code needed).
    #[serde(skip_serializing_if = "Option::is_none")]
    discount_id: Option<String>,
    /// Metadata for the checkout.
    #[serde(skip_serializing_if = "Option::is_none")]
    metadata: Option<std::collections::HashMap<String, String>>,
}

/// Response from checkout session creation.
#[derive(Debug, Deserialize)]
pub struct CheckoutSession {
    pub id: String,
    pub url: String,
    #[serde(default)]
    pub customer_id: Option<String>,
    #[serde(default)]
    pub external_customer_id: Option<String>,
}

/// Polar.sh webhook event.
///
/// Polar signs webhooks with HMAC-SHA256.
/// Header: `polar-signature: t=<timestamp>,v1=<signature>`
#[derive(Debug, Deserialize)]
pub struct PolarWebhookEvent {
    /// HS-021: Event ID for idempotency
    #[serde(default)]
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub event_type: String,
    pub data: serde_json::Value,
}

/// Request to create a customer portal session.
#[derive(Debug, Serialize)]
struct CreateCustomerSessionRequest {
    /// External customer ID (our customer UUID).
    external_customer_id: String,
    /// Return URL when user exits the portal.
    #[serde(skip_serializing_if = "Option::is_none")]
    return_url: Option<String>,
}

/// Response from customer session creation.
#[derive(Debug, Deserialize)]
struct CustomerSessionResponse {
    /// Session token for accessing the customer portal.
    #[serde(default)]
    token: Option<String>,
    /// Direct customer portal URL (if provided by Polar).
    #[serde(default)]
    customer_portal_url: Option<String>,
    #[serde(default)]
    _id: Option<String>,
}

/// Polar.sh subscription object (from webhook data).
#[derive(Debug, Deserialize)]
struct PolarSubscription {
    #[serde(default)]
    id: Option<String>,
    #[serde(default)]
    customer_id: Option<String>,
    #[serde(default)]
    external_customer_id: Option<String>,
    #[serde(default)]
    product_id: Option<String>,
    #[serde(default)]
    status: Option<String>,
}

// ── Polar.sh implementation ───────────────────────────────────

pub struct PolarProvider {
    config: PolarConfig,
    client: reqwest::Client,
}

impl PolarProvider {
    pub fn new(config: PolarConfig) -> Self {
        Self {
            config,
            client: crate::http_client::get_client().clone(),
        }
    }

    /// Look up a discount ID by code via the Polar API.
    /// Returns Some(discount_id) if found, None if not found.
    async fn lookup_discount_id(&self, code: &str) -> Result<Option<String>, AppError> {
        let resp = self
            .client
            .get(format!("{}/v1/discounts/", self.config.base_url))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar discount lookup failed: {}", e)))?;

        if !resp.status().is_success() {
            return Ok(None);
        }

        #[derive(serde::Deserialize)]
        struct DiscountItem {
            id: String,
            code: Option<String>,
        }
        #[derive(serde::Deserialize)]
        struct DiscountsResponse {
            items: Vec<DiscountItem>,
        }

        let data: DiscountsResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Polar discounts: {}", e))
        })?;

        let code_upper = code.to_uppercase();
        for item in data.items {
            if let Some(ref c) = item.code {
                if c.to_uppercase() == code_upper {
                    return Ok(Some(item.id));
                }
            }
        }

        Ok(None)
    }

    /// Determine plan from Polar product ID.
    fn determine_plan(&self, product_id: &str) -> Plan {
        if product_id == self.config.product_business || product_id == self.config.product_business_yearly {
            Plan::Enterprise
        } else if product_id == self.config.product_pro || product_id == self.config.product_pro_yearly {
            Plan::Pro
        } else if product_id == self.config.product_startup || product_id == self.config.product_startup_yearly {
            Plan::Startup
        } else {
            Plan::Developer
        }
    }

    /// Verify Polar.sh webhook signature.
    ///
    /// Polar signs webhooks with HMAC-SHA256.
    /// Header format: `t=<timestamp>,v1=<hex_signature>`
    fn verify_signature(
        body: &str,
        signature_header: &str,
        webhook_secret: &str,
    ) -> Result<(), AppError> {
        // Reject if webhook secret is not configured
        if webhook_secret.is_empty() {
            tracing::error!(
                "Polar webhook secret is empty — rejecting webhook to prevent billing manipulation"
            );
            return Err(AppError::Internal(anyhow::anyhow!(
                "Billing webhook secret not configured"
            )));
        }

        let mut timestamp: Option<i64> = None;
        let mut v1_sig: Option<&str> = None;

        for part in signature_header.split(',') {
            let Some((key, value)) = part.split_once('=') else {
                continue;
            };
            match key.trim() {
                "t" => {
                    timestamp = Some(value.trim().parse::<i64>().map_err(|_| {
                        // HS-038l: Generic message — don't reveal signature format
                        AppError::BadRequest("Invalid webhook signature".into())
                    })?);
                }
                "v1" if v1_sig.is_none() => {
                    v1_sig = Some(value.trim());
                }
                _ => {}
            }
        }

        let ts =
            timestamp.ok_or_else(|| AppError::BadRequest("Invalid webhook signature".into()))?;
        let sig = v1_sig.ok_or_else(|| AppError::BadRequest("Invalid webhook signature".into()))?;

        // Check timestamp freshness (5 minutes)
        let now = chrono::Utc::now().timestamp();
        let age = (now - ts).abs();
        if age > 300 {
            return Err(AppError::BadRequest("Webhook signature expired".into()));
        }

        // Compute HMAC-SHA256
        let signed_payload = format!("{}.{}", ts, body);
        let mut mac = HmacSha256::new_from_slice(webhook_secret.as_bytes())
            .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
        mac.update(signed_payload.as_bytes());

        let expected = hex::decode(sig)
            .map_err(|_| AppError::BadRequest("Invalid webhook signature".into()))?;

        mac.verify_slice(&expected)
            .map_err(|_| AppError::Unauthorized)?;

        Ok(())
    }
}

#[async_trait]
impl PaymentProviderImpl for PolarProvider {
    async fn create_checkout(
        &self,
        customer_id: Uuid,
        customer_email: &str,
        plan: &Plan,
        app_url: &str,
        yearly: bool,
        discount_code: Option<&str>,
        has_used_startup_trial: bool,
    ) -> Result<CheckoutResult, AppError> {
        let product_id = self
            .config
            .product_id_for_plan(plan, yearly)
            .ok_or_else(|| AppError::BadRequest("Invalid plan for Polar checkout".into()))?;

        let mut metadata = std::collections::HashMap::new();
        metadata.insert("customer_id".to_string(), customer_id.to_string());
        metadata.insert("plan".to_string(), plan.as_str().to_string());

        // Auto-apply Startup trial discount (first month free) ONLY for first-time buyers
        // Skip if customer already used the trial or provided their own code
        let auto_discount_id = if *plan == Plan::Startup && discount_code.is_none() && !has_used_startup_trial {
            self.config.startup_trial_discount_id()
        } else {
            None
        };

        // If user provided a discount code, look up its ID via Polar API
        // (discount_code only prefills the input; discount_id auto-applies)
        let resolved_discount_id = if let Some(code) = discount_code {
            match self.lookup_discount_id(code).await {
                Ok(Some(id)) => Some(id),
                Ok(None) => {
                    tracing::warn!("Discount code '{}' not found in Polar", code);
                    None
                }
                Err(e) => {
                    tracing::warn!("Failed to lookup discount code '{}': {}", code, e);
                    None
                }
            }
        } else {
            auto_discount_id
        };

        let req_body = CreateCheckoutRequest {
            products: vec![product_id.to_string()],
            external_customer_id: Some(customer_id.to_string()),
            customer_email: Some(customer_email.to_string()),
            success_url: Some(format!("{}/login?redirect=/account&upgraded=true", app_url)),
            locale: Some("en".to_string()),
            discount_code: None, // Don't use discount_code — it only prefills, doesn't apply
            discount_id: resolved_discount_id,
            metadata: Some(metadata),
        };

        let resp = self
            .client
            .post(format!("{}/v1/checkouts", self.config.base_url))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .header("Content-Type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar request failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Polar checkout creation failed ({}): {}", status, body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Polar checkout failed ({}): {}",
                status,
                if body.len() > 200 { &body[..200] } else { &body }
            )));
        }

        let session: CheckoutSession = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Polar response: {}", e))
        })?;

        Ok(CheckoutResult {
            checkout_url: session.url,
            session_id: session.id,
        })
    }

    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
        pool: &sqlx::PgPool,
    ) -> Result<WebhookResult, AppError> {
        // Verify signature — log failure but ALWAYS return 200 to prevent Polar auto-disable
        let sig_header = headers
            .get("polar-signature")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if sig_header.is_empty() {
            tracing::warn!("Polar webhook: missing signature header — ignoring");
            return Ok(WebhookResult::Ignored);
        }

        if let Err(e) = Self::verify_signature(body, sig_header, &self.config.webhook_secret) {
            tracing::warn!("Polar webhook: signature verification failed: {:?} — ignoring", e);
            return Ok(WebhookResult::Ignored);
        }

        // Parse event — NEVER return error to Polar (causes webhook auto-disable)
        let event: PolarWebhookEvent = match serde_json::from_str(body) {
            Ok(e) => e,
            Err(e) => {
                tracing::warn!("Invalid Polar webhook payload: {:?} — ignoring", e);
                return Ok(WebhookResult::Ignored);
            }
        };

        tracing::info!("Polar webhook: {}", event.event_type);

        match event.event_type.as_str() {
            "subscription.created" => {
                let sub: PolarSubscription = match serde_json::from_value(event.data.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::warn!("Invalid Polar subscription data: {:?} — ignoring", e);
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let customer_id = match sub
                    .external_customer_id
                    .as_deref()
                    .or(sub.customer_id.as_deref())
                    .and_then(|s| Uuid::parse_str(s).ok())
                {
                    Some(id) => id,
                    None => {
                        tracing::warn!("Missing/invalid customer_id in Polar subscription.created — ignoring");
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let product_id = match sub.product_id.as_deref() {
                    Some(id) => id,
                    None => {
                        tracing::warn!("Missing product_id in Polar subscription.created — ignoring");
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let plan = self.determine_plan(product_id);
                let interval = if self.config.is_yearly_product(product_id) { "year" } else { "month" };

                Ok(WebhookResult::SubscriptionCreated {
                    customer_id,
                    plan,
                    provider_customer_id: sub.customer_id.clone(),
                    provider_subscription_id: sub.id.clone(),
                    interval: interval.to_string(),
                    event_id: event.id.clone(),
                })
            }
            "subscription.updated" => {
                let sub: PolarSubscription = match serde_json::from_value(event.data.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::warn!("Invalid Polar subscription update data: {:?} — ignoring", e);
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let sub_id = sub.id.unwrap_or_default();
                let status = sub.status.unwrap_or_else(|| "active".to_string());

                // POL-03: Handle canceled/revoked status in subscription.updated
                // Polar may send status change via updated event instead of canceled event
                if status == "canceled" || status == "revoked" {
                    tracing::info!(
                        "Polar subscription {} canceled via updated event (status={})",
                        sub_id, status
                    );
                    return Ok(WebhookResult::SubscriptionCanceled {
                        provider_subscription_id: sub_id,
                        event_id: event.id.clone(),
                    });
                }

                // POL-08: Handle past_due status — treat as payment failure
                if status == "past_due" {
                    tracing::warn!(
                        "Polar subscription {} is past_due — marking as payment failed",
                        sub_id
                    );
                    // Find customer by subscription ID to trigger downgrade
                    let customer_id = sub
                        .external_customer_id
                        .as_deref()
                        .or(sub.customer_id.as_deref())
                        .and_then(|s| Uuid::parse_str(s).ok());

                    return Ok(WebhookResult::PaymentFailed {
                        provider_tx_id: sub_id.clone(),
                        customer_id,
                    });
                }

                let product_id = match sub.product_id.as_deref() {
                    Some(id) => id,
                    None => {
                        tracing::warn!("Missing product_id in Polar subscription.updated — ignoring");
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let plan = self.determine_plan(product_id);
                let interval = if self.config.is_yearly_product(product_id) { "year" } else { "month" };

                Ok(WebhookResult::SubscriptionUpdated {
                    provider_subscription_id: sub_id,
                    plan,
                    status,
                    interval: interval.to_string(),
                    event_id: event.id.clone(),
                })
            }
            "subscription.canceled" | "subscription.revoked" => {
                let sub: PolarSubscription = match serde_json::from_value(event.data.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::warn!("Invalid Polar subscription cancel data: {:?} — ignoring", e);
                        return Ok(WebhookResult::Ignored);
                    }
                };

                Ok(WebhookResult::SubscriptionCanceled {
                    provider_subscription_id: sub.id.unwrap_or_default(),
                    event_id: event.id.clone(),
                })
            }
            "order.created" | "order.completed" => {
                // Payment succeeded (order.created = legacy, order.completed = current Polar event)
                let order = &event.data;
                let tx_id = order
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                let amount = order.get("amount").and_then(|v| v.as_i64()).unwrap_or(0) as u64;

                let currency = order
                    .get("currency")
                    .and_then(|v| v.as_str())
                    .unwrap_or("USD")
                    .to_string();

                // Try to extract card details from Polar order data
                // Polar may include billing details in the order object
                let card_info = extract_polar_card_info(order);

                if let Some((brand, last4, exp_month, exp_year)) = card_info {
                    // Get customer_id from the order to save card info
                    let customer_id = order
                        .get("customer_id")
                        .or_else(|| order.get("external_customer_id"))
                        .and_then(|v| v.as_str())
                        .and_then(|s| Uuid::parse_str(s).ok());

                    if let Some(cid) = customer_id {
                        let _ = sqlx::query(
                            "UPDATE customers SET card_last4 = $1, card_brand = $2, card_exp_month = $3, card_exp_year = $4, card_updated_at = NOW() WHERE id = $5"
                        )
                        .bind(&last4)
                        .bind(&brand)
                        .bind(exp_month as i16)
                        .bind(exp_year as i16)
                        .bind(cid)
                        .execute(pool)
                        .await;

                        tracing::info!(
                            "💳 Saved Polar card details for customer {}: {} {}",
                            cid, brand, last4
                        );
                    }
                }

                Ok(WebhookResult::PaymentSucceeded {
                    provider_tx_id: tx_id,
                    amount_cents: amount,
                    currency,
                    customer_id: order
                        .get("customer_id")
                        .or_else(|| order.get("external_customer_id"))
                        .and_then(|v| v.as_str())
                        .and_then(|s| Uuid::parse_str(s).ok()),
                })
            }
            "order.refunded" => {
                tracing::info!("Polar order refunded");
                Ok(WebhookResult::Ignored)
            }
            _ => {
                tracing::debug!("Unhandled Polar event: {}", event.event_type);
                Ok(WebhookResult::Ignored)
            }
        }
    }

    async fn create_customer_portal(
        &self,
        polar_customer_id: &str,
        app_url: &str,
    ) -> Result<String, AppError> {
        // Create a customer portal session via Polar.sh API.
        // This generates a tokenized URL for the customer to manage their subscription.
        let req_body = CreateCustomerSessionRequest {
            external_customer_id: polar_customer_id.to_string(),
            return_url: Some(format!("{}/account", app_url)),
        };

        let resp = self
            .client
            .post(format!("{}/v1/customer-sessions/", self.config.base_url))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .header("Content-Type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!(
                    "Polar customer portal request failed: {}",
                    e
                ))
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            tracing::error!(
                "Polar customer portal creation failed ({}): {}",
                status,
                body
            );
            // Fall back to our own billing page if Polar portal fails
            return Ok(format!("{}/account", app_url));
        }

        let session: CustomerSessionResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to parse Polar customer session response: {}",
                e
            ))
        })?;

        // Prefer direct portal URL if Polar provides one
        if let Some(portal_url) = session.customer_portal_url {
            return Ok(portal_url);
        }

        // Construct portal URL from token
        if let Some(token) = session.token {
            let portal_base = if self.config.base_url.contains("sandbox") {
                "https://sandbox.polar.sh"
            } else {
                "https://polar.sh"
            };
            return Ok(format!("{}/customer-portal/{}", portal_base, token));
        }

        // Fallback to our billing page
        tracing::warn!("Polar customer session returned no token or portal URL");
        Ok(format!("{}/account", app_url))
    }

    async fn cancel_subscription(&self, polar_subscription_id: &str) -> Result<(), AppError> {
        let resp = self
            .client
            .delete(format!(
                "{}/v1/subscriptions/{}",
                self.config.base_url, polar_subscription_id
            ))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar cancel failed: {}", e)))?;

        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Polar subscription cancel failed: {}", body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Failed to cancel Polar subscription"
            )));
        }

        Ok(())
    }

}

impl PolarProvider {
    /// Update a Polar product's price via API.
    pub async fn update_product_price(
        &self,
        product_id: &str,
        price_cents: u64,
        currency: &str,
    ) -> Result<(), String> {
        if product_id.is_empty() {
            return Err("Product ID not configured".into());
        }

        let body = serde_json::json!({
            "prices": [{
                "price_type": "fixed",
                "price_amount": price_cents,
                "currency": currency.to_uppercase(),
            }]
        });

        let resp = self
            .client
            .patch(format!("{}/v1/products/{}", self.config.base_url, product_id))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Polar request failed: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("Polar API error ({}): {}", status, body));
        }

        Ok(())
    }

    /// Sync all plan prices to Polar (monthly + yearly).
    /// Called from admin settings update.
    pub async fn sync_prices_to_polar(
        &self,
        startup_price: f64,
        pro_price: f64,
        enterprise_price: f64,
    ) -> Vec<(String, Result<(), String>)> {
        let yearly_multiplier = 12.0 * 0.8; // 20% annual discount
        let plans = [
            // Monthly products
            ("startup_monthly", &self.config.product_startup, startup_price),
            ("pro_monthly", &self.config.product_pro, pro_price),
            ("enterprise_monthly", &self.config.product_business, enterprise_price),
            // Yearly products
            ("startup_yearly", &self.config.product_startup_yearly, (startup_price * yearly_multiplier).round()),
            ("pro_yearly", &self.config.product_pro_yearly, (pro_price * yearly_multiplier).round()),
            ("enterprise_yearly", &self.config.product_business_yearly, (enterprise_price * yearly_multiplier).round()),
        ];

        let mut results = Vec::new();
        for (name, product_id, price) in plans {
            if product_id.is_empty() {
                results.push((name.to_string(), Err("Product ID not configured".into())));
                continue;
            }
            let cents = (price * 100.0).round() as u64;
            let result = self.update_product_price(product_id, cents, "USD").await;
            results.push((name.to_string(), result));
        }
        results
    }
}

/// Extract card details from Polar.sh order data.
///
/// Polar may include payment method info in various locations within the order object.
/// Tries multiple paths to find card brand, last4, and expiry.
fn extract_polar_card_info(data: &serde_json::Value) -> Option<(String, String, u32, u32)> {
    // Polar might include card info in billing_details, payment_method, or nested objects
    let paths = [
        ("billing_details", "card"),
        ("payment_method", "card"),
        ("payment_method_details", "card"),
        ("charge", "payment_method_details"),
    ];

    for (outer, inner) in paths {
        if let Some(card) = data.get(outer).and_then(|o| o.get(inner)) {
            let brand = card.get("brand").and_then(|v| v.as_str());
            let last4 = card.get("last4").and_then(|v| v.as_str());
            let exp_month = card.get("exp_month").and_then(|v| v.as_u64());
            let exp_year = card.get("exp_year").and_then(|v| v.as_u64());

            if let (Some(b), Some(l), Some(m), Some(y)) = (brand, last4, exp_month, exp_year) {
                return Some((b.to_string(), l.to_string(), m as u32, y as u32));
            }
        }
    }

    // Also try direct "card" object at root level
    if let Some(card) = data.get("card") {
        let brand = card.get("brand").and_then(|v| v.as_str());
        let last4 = card.get("last4").and_then(|v| v.as_str());
        let exp_month = card.get("exp_month").and_then(|v| v.as_u64());
        let exp_year = card.get("exp_year").and_then(|v| v.as_u64());

        if let (Some(b), Some(l), Some(m), Some(y)) = (brand, last4, exp_month, exp_year) {
            return Some((b.to_string(), l.to_string(), m as u32, y as u32));
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> PolarConfig {
        PolarConfig {
            access_token: "test_token".to_string(),
            webhook_secret: "test_webhook_secret".to_string(),
            product_startup: "prod_startup_789".to_string(),
            product_pro: "prod_pro_123".to_string(),
            product_business: "prod_biz_456".to_string(),
            product_pro_yearly: "prod_pro_yearly_123".to_string(),
            product_business_yearly: "prod_biz_yearly_456".to_string(),
            product_startup_yearly: "prod_startup_yearly_789".to_string(),
            base_url: "https://sandbox-api.polar.sh".to_string(),
        }
    }

    // ── PolarConfig::product_id_for_plan ───────────────────────

    #[test]
    fn product_id_for_plan_pro() {
        let config = test_config();
        assert_eq!(config.product_id_for_plan(&Plan::Pro, false), Some("prod_pro_123"));
    }

    #[test]
    fn product_id_for_plan_business() {
        let config = test_config();
        assert_eq!(
            config.product_id_for_plan(&Plan::Enterprise, false),
            Some("prod_biz_456")
        );
    }

    #[test]
    fn product_id_for_plan_free_returns_none() {
        let config = test_config();
        assert_eq!(config.product_id_for_plan(&Plan::Developer, false), None);
    }

    #[test]
    fn product_id_for_plan_enterprise_returns_business_product() {
        let config = test_config();
        assert_eq!(config.product_id_for_plan(&Plan::Enterprise, false), Some("prod_biz_456"));
    }

    // ── PolarProvider::determine_plan ──────────────────────────

    #[test]
    fn determine_plan_business_product() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan("prod_biz_456"), Plan::Enterprise);
    }

    #[test]
    fn determine_plan_pro_product() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan("prod_pro_123"), Plan::Pro);
    }

    #[test]
    fn determine_plan_unknown_product_returns_free() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan("unknown_product"), Plan::Developer);
    }

    #[test]
    fn determine_plan_empty_string_returns_free() {
        let provider = PolarProvider::new(test_config());
        assert_eq!(provider.determine_plan(""), Plan::Developer);
    }

    // ── PolarProvider::verify_signature ────────────────────────

    #[test]
    fn verify_signature_valid() {
        let secret = "whsec_test123";
        let body = r#"{"type":"subscription.created","data":{}}"#;
        let ts = chrono::Utc::now().timestamp();
        let signed_payload = format!("{}.{}", ts, body);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig_hex = hex::encode(mac.finalize().into_bytes());

        let header = format!("t={},v1={}", ts, sig_hex);
        assert!(PolarProvider::verify_signature(body, &header, secret).is_ok());
    }

    #[test]
    fn verify_signature_invalid_secret() {
        let secret = "whsec_correct";
        let wrong_secret = "whsec_wrong";
        let body = r#"{"type":"test"}"#;
        let ts = chrono::Utc::now().timestamp();
        let signed_payload = format!("{}.{}", ts, body);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig_hex = hex::encode(mac.finalize().into_bytes());

        let header = format!("t={},v1={}", ts, sig_hex);
        let result = PolarProvider::verify_signature(body, &header, wrong_secret);
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_expired_timestamp() {
        let secret = "whsec_test";
        let body = r#"{"type":"test"}"#;
        let ts = chrono::Utc::now().timestamp() - 600; // 10 minutes ago
        let signed_payload = format!("{}.{}", ts, body);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let sig_hex = hex::encode(mac.finalize().into_bytes());

        let header = format!("t={},v1={}", ts, sig_hex);
        let result = PolarProvider::verify_signature(body, &header, secret);
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_missing_t() {
        let result = PolarProvider::verify_signature("body", "v1=abc123", "secret");
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_missing_v1() {
        let result = PolarProvider::verify_signature(
            "body",
            &format!("t={}", chrono::Utc::now().timestamp()),
            "secret",
        );
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_invalid_hex() {
        let ts = chrono::Utc::now().timestamp();
        let header = format!("t={},v1=not_valid_hex!!!", ts);
        let result = PolarProvider::verify_signature("body", &header, "secret");
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_invalid_timestamp() {
        let result = PolarProvider::verify_signature("body", "t=notanumber,v1=abc", "secret");
        assert!(result.is_err());
    }

    // ── PolarProvider::create_customer_portal ──────────────────

    #[tokio::test]
    async fn create_customer_portal_falls_back_without_network() {
        let provider = PolarProvider::new(test_config());
        // This will fail because we're not actually connecting to Polar,
        // but the implementation falls back to our billing page.
        let url = provider
            .create_customer_portal("cust_123", "https://app.hooksniff.com")
            .await
            .unwrap();
        assert_eq!(url, "https://app.hooksniff.com/account");
    }

    // ── PolarProvider::cancel_subscription (network fail) ──────

    #[tokio::test]
    async fn cancel_subscription_fails_without_network() {
        let provider = PolarProvider::new(test_config());
        // This will fail because we're not actually connecting to Polar
        let result = provider.cancel_subscription("sub_123").await;
        assert!(result.is_err());
    }

    // ── PolarWebhookEvent deserialization ──────────────────────

    #[test]
    fn deserialize_polar_webhook_event() {
        let json =
            r#"{"type":"subscription.created","data":{"id":"sub_1","customer_id":"cust_1"}}"#;
        let event: PolarWebhookEvent = serde_json::from_str(json).unwrap();
        assert_eq!(event.event_type, "subscription.created");
        assert_eq!(event.data["id"], "sub_1");
    }

    // ── PolarSubscription deserialization ──────────────────────

    #[test]
    fn deserialize_polar_subscription_with_all_fields() {
        let json = r#"{"id":"sub_1","customer_id":"cust_1","external_customer_id":"ext_1","product_id":"prod_1","status":"active"}"#;
        let sub: PolarSubscription = serde_json::from_str(json).unwrap();
        assert_eq!(sub.id.as_deref(), Some("sub_1"));
        assert_eq!(sub.customer_id.as_deref(), Some("cust_1"));
        assert_eq!(sub.external_customer_id.as_deref(), Some("ext_1"));
        assert_eq!(sub.product_id.as_deref(), Some("prod_1"));
        assert_eq!(sub.status.as_deref(), Some("active"));
    }

    #[test]
    fn deserialize_polar_subscription_with_missing_fields() {
        let json = r#"{}"#;
        let sub: PolarSubscription = serde_json::from_str(json).unwrap();
        assert!(sub.id.is_none());
        assert!(sub.customer_id.is_none());
        assert!(sub.external_customer_id.is_none());
        assert!(sub.product_id.is_none());
        assert!(sub.status.is_none());
    }

    // ── CheckoutSession deserialization ────────────────────────

    #[test]
    fn deserialize_checkout_session() {
        let json = r#"{"id":"sess_001","url":"https://polar.sh/checkout/sess_001","customer_id":"cust_1","external_customer_id":"ext_1"}"#;
        let session: CheckoutSession = serde_json::from_str(json).unwrap();
        assert_eq!(session.id, "sess_001");
        assert_eq!(session.url, "https://polar.sh/checkout/sess_001");
        assert_eq!(session.customer_id.as_deref(), Some("cust_1"));
    }

    #[test]
    fn deserialize_checkout_session_minimal() {
        let json = r#"{"id":"sess_002","url":"https://polar.sh/checkout/sess_002"}"#;
        let session: CheckoutSession = serde_json::from_str(json).unwrap();
        assert_eq!(session.id, "sess_002");
        assert!(session.customer_id.is_none());
        assert!(session.external_customer_id.is_none());
    }
}
