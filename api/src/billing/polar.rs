//! Polar.sh billing integration for HookRelay.
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
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::billing::Plan;
use crate::billing::provider::{CheckoutResult, PaymentProviderImpl, WebhookResult};
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// Polar.sh API configuration.
#[derive(Debug, Clone)]
pub struct PolarConfig {
    pub access_token: String,
    pub webhook_secret: String,
    pub product_pro: String,
    pub product_business: String,
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
            product_pro: std::env::var("POLAR_PRODUCT_PRO")
                .unwrap_or_else(|_| "79fee3f9-04a2-46c1-804e-8ca7542b8119".to_string()),
            product_business: std::env::var("POLAR_PRODUCT_BUSINESS")
                .unwrap_or_else(|_| "e5b7d88a-7606-4963-a070-4102ca6405e2".to_string()),
            base_url,
        })
    }

    fn product_id_for_plan(&self, plan: &Plan) -> Option<&str> {
        match plan {
            Plan::Pro => Some(&self.product_pro),
            Plan::Business => Some(&self.product_business),
            _ => None,
        }
    }
}

// ── Polar.sh API types ────────────────────────────────────────

/// Request to create a checkout session.
#[derive(Debug, Serialize)]
struct CreateCheckoutRequest {
    /// Product IDs to include in the checkout.
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
    #[serde(rename = "type")]
    pub event_type: String,
    pub data: serde_json::Value,
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
            client: reqwest::Client::new(),
        }
    }

    /// Determine plan from Polar product ID.
    fn determine_plan(&self, product_id: &str) -> Plan {
        if product_id == self.config.product_business {
            Plan::Business
        } else if product_id == self.config.product_pro {
            Plan::Pro
        } else {
            Plan::Free
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
        let mut timestamp: Option<i64> = None;
        let mut v1_sig: Option<&str> = None;

        for part in signature_header.split(',') {
            let Some((key, value)) = part.split_once('=') else {
                continue;
            };
            match key.trim() {
                "t" => {
                    timestamp = Some(
                        value
                            .trim()
                            .parse::<i64>()
                            .map_err(|_| AppError::BadRequest("Invalid Polar signature timestamp".into()))?,
                    );
                }
                "v1" => {
                    if v1_sig.is_none() {
                        v1_sig = Some(value.trim());
                    }
                }
                _ => {}
            }
        }

        let ts = timestamp
            .ok_or_else(|| AppError::BadRequest("Missing t in Polar signature".into()))?;
        let sig = v1_sig
            .ok_or_else(|| AppError::BadRequest("Missing v1 in Polar signature".into()))?;

        // Check timestamp freshness (5 minutes)
        let now = chrono::Utc::now().timestamp();
        let age = (now - ts).abs();
        if age > 300 {
            return Err(AppError::BadRequest("Polar webhook timestamp too old".into()));
        }

        // Compute HMAC-SHA256
        let signed_payload = format!("{}.{}", ts, body);
        let mut mac = HmacSha256::new_from_slice(webhook_secret.as_bytes())
            .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
        mac.update(signed_payload.as_bytes());

        let expected = hex::decode(sig)
            .map_err(|_| AppError::BadRequest("Invalid Polar signature hex".into()))?;

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
    ) -> Result<CheckoutResult, AppError> {
        let product_id = self
            .config
            .product_id_for_plan(plan)
            .ok_or_else(|| AppError::BadRequest("Invalid plan for Polar checkout".into()))?;

        let mut metadata = std::collections::HashMap::new();
        metadata.insert("customer_id".to_string(), customer_id.to_string());
        metadata.insert("plan".to_string(), plan.as_str().to_string());

        let req_body = CreateCheckoutRequest {
            products: vec![product_id.to_string()],
            external_customer_id: Some(customer_id.to_string()),
            customer_email: Some(customer_email.to_string()),
            success_url: Some(format!("{}/dashboard/billing?upgraded=true", app_url)),
            locale: Some("en".to_string()),
            metadata: Some(metadata),
        };

        let resp = self
            .client
            .post(format!("{}/v1/checkouts/", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
            .header("Content-Type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar request failed: {}", e)))?;

        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Polar checkout creation failed: {}", body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Polar checkout failed"
            )));
        }

        let session: CheckoutSession = resp
            .json()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Polar response: {}", e)))?;

        Ok(CheckoutResult {
            checkout_url: session.url,
            session_id: session.id,
        })
    }

    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
    ) -> Result<WebhookResult, AppError> {
        // Verify signature
        let sig_header = headers
            .get("polar-signature")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if sig_header.is_empty() {
            return Err(AppError::BadRequest("Missing Polar signature header".into()));
        }

        Self::verify_signature(body, sig_header, &self.config.webhook_secret)?;

        // Parse event
        let event: PolarWebhookEvent = serde_json::from_str(body)
            .map_err(|e| AppError::BadRequest(format!("Invalid Polar event: {}", e)))?;

        tracing::info!("Polar webhook: {}", event.event_type);

        match event.event_type.as_str() {
            "subscription.created" => {
                let sub: PolarSubscription = serde_json::from_value(event.data.clone())
                    .map_err(|e| AppError::BadRequest(format!("Invalid subscription data: {}", e)))?;

                let customer_id = sub
                    .external_customer_id
                    .as_deref()
                    .or(sub.customer_id.as_deref())
                    .and_then(|s| Uuid::parse_str(s).ok())
                    .ok_or_else(|| AppError::BadRequest("Missing customer_id in Polar event".into()))?;

                let plan = sub
                    .product_id
                    .as_deref()
                    .map(|pid| self.determine_plan(pid))
                    .unwrap_or(Plan::Pro);

                Ok(WebhookResult::SubscriptionCreated {
                    customer_id,
                    plan,
                    provider_customer_id: sub.customer_id.clone(),
                    provider_subscription_id: sub.id.clone(),
                })
            }
            "subscription.updated" => {
                let sub: PolarSubscription = serde_json::from_value(event.data.clone())
                    .map_err(|e| AppError::BadRequest(format!("Invalid subscription data: {}", e)))?;

                let sub_id = sub.id.unwrap_or_default();
                let status = sub.status.unwrap_or_else(|| "active".to_string());
                let plan = sub
                    .product_id
                    .as_deref()
                    .map(|pid| self.determine_plan(pid))
                    .unwrap_or(Plan::Free);

                Ok(WebhookResult::SubscriptionUpdated {
                    provider_subscription_id: sub_id,
                    plan,
                    status,
                })
            }
            "subscription.canceled" | "subscription.revoked" => {
                let sub: PolarSubscription = serde_json::from_value(event.data.clone())
                    .map_err(|e| AppError::BadRequest(format!("Invalid subscription data: {}", e)))?;

                Ok(WebhookResult::SubscriptionCanceled {
                    provider_subscription_id: sub.id.unwrap_or_default(),
                })
            }
            "order.created" => {
                // Payment succeeded
                let order = &event.data;
                let tx_id = order
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                let amount = order
                    .get("amount")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0) as u64;

                let currency = order
                    .get("currency")
                    .and_then(|v| v.as_str())
                    .unwrap_or("USD")
                    .to_string();

                Ok(WebhookResult::PaymentSucceeded {
                    provider_tx_id: tx_id,
                    amount_cents: amount,
                    currency,
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
        _polar_customer_id: &str,
        app_url: &str,
    ) -> Result<String, AppError> {
        // Polar.sh has a built-in customer portal.
        // We redirect to our own billing page which links to Polar's portal.
        Ok(format!("{}/dashboard/billing", app_url))
    }

    async fn cancel_subscription(
        &self,
        polar_subscription_id: &str,
    ) -> Result<(), AppError> {
        let resp = self
            .client
            .delete(format!(
                "{}/v1/subscriptions/{}",
                self.config.base_url, polar_subscription_id
            ))
            .header("Authorization", format!("Bearer {}", self.config.access_token))
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
