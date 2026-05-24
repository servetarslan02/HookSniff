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

pub mod provider;
pub mod extras;

#[cfg(test)]
mod tests;

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
pub struct CreateCheckoutRequest {
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
pub struct CreateCustomerSessionRequest {
    /// External customer ID (our customer UUID).
    external_customer_id: String,
    /// Return URL when user exits the portal.
    #[serde(skip_serializing_if = "Option::is_none")]
    return_url: Option<String>,
}

/// Response from customer session creation.
#[derive(Debug, Deserialize)]
pub struct CustomerSessionResponse {
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
///
/// Fields align with Polar's Subscription schema:
/// https://docs.polar.sh/api-reference/subscriptions/get
#[derive(Debug, Deserialize)]
pub struct PolarSubscription {
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
    /// Billing interval: "month" or "year"
    #[serde(default)]
    interval: Option<String>,
    /// Whether the subscription is scheduled to cancel at period end.
    #[serde(default)]
    cancel_at_period_end: Option<bool>,
    /// Current billing period end (ISO 8601) — Polar sends this on renewals.
    #[serde(default)]
    current_period_end: Option<String>,
    /// Current billing period start (ISO 8601).
    #[serde(default)]
    #[allow(dead_code)]
    current_period_start: Option<String>,
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

