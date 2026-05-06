//! Paddle billing integration for HookRelay.
//!
//! Paddle acts as Merchant of Record (MoR):
//! - Handles payment processing, tax compliance, and invoicing
//! - Customers pay through Paddle's hosted checkout
//! - Webhook events notify us of subscription changes
//!
//! Environment variables:
//!   PADDLE_API_KEY        — Paddle API key (auth_code or vendor_key)
//!   PADDLE_WEBHOOK_SECRET — Public key for webhook signature verification
//!   PADDLE_PRICE_PRO      — Paddle price ID for Pro plan
//!   PADDLE_PRICE_BUSINESS — Paddle price ID for Business plan
//!   PADDLE_ENV            — "sandbox" or "production" (default: production)

use async_trait::async_trait;
use base64::Engine;
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::billing::Plan;
use crate::billing::provider::{CheckoutResult, PaymentProviderImpl, WebhookResult};
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// Paddle API configuration.
#[derive(Debug, Clone)]
pub struct PaddleConfig {
    pub api_key: String,
    pub webhook_secret: String,
    pub price_pro: String,
    pub price_business: String,
    pub base_url: String, // sandbox or production API URL
}

impl PaddleConfig {
    pub fn from_env() -> Option<Self> {
        let api_key = std::env::var("PADDLE_API_KEY").ok()?;
        let webhook_secret = std::env::var("PADDLE_WEBHOOK_SECRET").ok()?;

        let is_sandbox = std::env::var("PADDLE_ENV")
            .map(|v| v == "sandbox")
            .unwrap_or(false);

        let base_url = if is_sandbox {
            "https://sandbox-api.paddle.com".to_string()
        } else {
            "https://api.paddle.com".to_string()
        };

        Some(Self {
            api_key,
            webhook_secret,
            price_pro: std::env::var("PADDLE_PRICE_PRO")
                .unwrap_or_else(|_| "price_pro_monthly".to_string()),
            price_business: std::env::var("PADDLE_PRICE_BUSINESS")
                .unwrap_or_else(|_| "price_business_monthly".to_string()),
            base_url,
        })
    }

    fn price_id_for_plan(&self, plan: &Plan) -> Option<&str> {
        match plan {
            Plan::Pro => Some(&self.price_pro),
            Plan::Business => Some(&self.price_business),
            _ => None,
        }
    }
}

// ── Paddle API types ──────────────────────────────────────────

#[derive(Debug, Serialize)]
struct CreateTransactionRequest {
    items: Vec<TransactionItem>,
    customer_id: Option<String>,
    custom_data: std::collections::HashMap<String, String>,
}

#[derive(Debug, Serialize)]
struct TransactionItem {
    price_id: String,
    quantity: u32,
}

#[derive(Debug, Deserialize)]
struct TransactionResponse {
    data: TransactionData,
}

#[derive(Debug, Deserialize)]
struct TransactionData {
    id: String,
    checkout: Option<CheckoutUrl>,
}

#[derive(Debug, Deserialize)]
struct CheckoutUrl {
    url: String,
}

/// Paddle webhook event (Paddle Billing v2 format).
#[derive(Debug, Deserialize)]
pub struct PaddleWebhookEvent {
    #[serde(rename = "event_type")]
    pub event_type: String,
    pub data: serde_json::Value,
    #[serde(default)]
    pub notification_id: Option<String>,
}

/// Paddle webhook signature header format:
/// `ts=<timestamp>;h1=<hmac_hex>`
#[derive(Debug)]
struct PaddleSignature {
    timestamp: i64,
    hmac_hex: String,
}

// ── Paddle implementation ─────────────────────────────────────

pub struct PaddleProvider {
    config: PaddleConfig,
    client: reqwest::Client,
}

impl PaddleProvider {
    pub fn new(config: PaddleConfig) -> Self {
        Self {
            config,
            client: reqwest::Client::new(),
        }
    }

    fn price_id_for_plan(&self, plan: &Plan) -> Option<&str> {
        self.config.price_id_for_plan(plan)
    }

    /// Parse Paddle webhook signature header.
    ///
    /// Format: `ts=<unix_timestamp>;h1=<hmac_hex>`
    fn parse_signature(header: &str) -> Result<PaddleSignature, AppError> {
        let mut timestamp: Option<i64> = None;
        let mut hmac_hex: Option<String> = None;

        for part in header.split(';') {
            let Some((key, value)) = part.split_once('=') else {
                continue;
            };
            match key.trim() {
                "ts" => {
                    timestamp = Some(
                        value
                            .trim()
                            .parse::<i64>()
                            .map_err(|_| AppError::BadRequest("Invalid Paddle signature timestamp".into()))?,
                    );
                }
                "h1" => {
                    hmac_hex = Some(value.trim().to_string());
                }
                _ => {}
            }
        }

        let ts = timestamp
            .ok_or_else(|| AppError::BadRequest("Missing ts in Paddle signature".into()))?;
        let h1 = hmac_hex
            .ok_or_else(|| AppError::BadRequest("Missing h1 in Paddle signature".into()))?;

        Ok(PaddleSignature {
            timestamp: ts,
            hmac_hex: h1,
        })
    }

    /// Verify Paddle webhook signature using HMAC-SHA256.
    ///
    /// Paddle signs: `<timestamp>:<raw_body>`
    fn verify_signature(
        body: &str,
        signature_header: &str,
        webhook_secret: &str,
    ) -> Result<(), AppError> {
        let sig = Self::parse_signature(signature_header)?;

        // Check timestamp freshness (5 minutes)
        let now = chrono::Utc::now().timestamp();
        let age = (now - sig.timestamp).abs();
        if age > 300 {
            return Err(AppError::BadRequest("Paddle webhook timestamp too old".into()));
        }

        // Compute HMAC-SHA256
        let signed_payload = format!("{}:{}", sig.timestamp, body);
        let mut mac = HmacSha256::new_from_slice(webhook_secret.as_bytes())
            .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
        mac.update(signed_payload.as_bytes());

        let expected = hex::decode(&sig.hmac_hex)
            .map_err(|_| AppError::BadRequest("Invalid Paddle signature hex".into()))?;

        mac.verify_slice(&expected)
            .map_err(|_| AppError::Unauthorized)?;

        Ok(())
    }

    /// Map Paddle subscription status to a plan.
    fn determine_plan_from_prices(&self, price_id: &str) -> Plan {
        if price_id == self.config.price_business {
            Plan::Business
        } else if price_id == self.config.price_pro {
            Plan::Pro
        } else {
            Plan::Free
        }
    }
}

#[async_trait]
impl PaymentProviderImpl for PaddleProvider {
    async fn create_checkout(
        &self,
        customer_id: Uuid,
        customer_email: &str,
        plan: &Plan,
        app_url: &str,
    ) -> Result<CheckoutResult, AppError> {
        let price_id = self
            .price_id_for_plan(plan)
            .ok_or_else(|| AppError::BadRequest("Invalid plan for Paddle checkout".into()))?;

        // Paddle Billing: create a transaction, get checkout URL
        let mut custom_data = std::collections::HashMap::new();
        custom_data.insert("customer_id".to_string(), customer_id.to_string());
        custom_data.insert("plan".to_string(), plan.as_str().to_string());
        custom_data.insert("email".to_string(), customer_email.to_string());

        let req_body = CreateTransactionRequest {
            items: vec![TransactionItem {
                price_id: price_id.to_string(),
                quantity: 1,
            }],
            custom_data,
        };

        let resp = self
            .client
            .post(format!("{}/transactions", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Paddle request failed: {}", e)))?;

        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Paddle transaction creation failed: {}", body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Paddle checkout failed"
            )));
        }

        let tx: TransactionResponse = resp
            .json()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Paddle response: {}", e)))?;

        let checkout_url = tx
            .data
            .checkout
            .as_ref()
            .map(|c| c.url.clone())
            .unwrap_or_else(|| {
                format!(
                    "{}{}",
                    if self.config.base_url.contains("sandbox") {
                        "https://sandbox-checkout.paddle.com"
                    } else {
                        "https://checkout.paddle.com"
                    },
                    tx.data.id
                )
            });

        Ok(CheckoutResult {
            checkout_url,
            session_id: tx.data.id,
        })
    }

    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
    ) -> Result<WebhookResult, AppError> {
        // Verify signature
        let sig_header = headers
            .get("paddle-signature")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if sig_header.is_empty() {
            return Err(AppError::BadRequest("Missing Paddle signature header".into()));
        }

        Self::verify_signature(body, sig_header, &self.config.webhook_secret)?;

        // Parse event
        let event: PaddleWebhookEvent = serde_json::from_str(body)
            .map_err(|e| AppError::BadRequest(format!("Invalid Paddle event: {}", e)))?;

        tracing::info!("Paddle webhook: {}", event.event_type);

        match event.event_type.as_str() {
            "subscription.created" => {
                let sub = &event.data;
                let customer_id = sub
                    .get("custom_data")
                    .and_then(|c| c.get("customer_id"))
                    .and_then(|v| v.as_str())
                    .and_then(|s| Uuid::parse_str(s).ok());

                let plan_str = sub
                    .get("custom_data")
                    .and_then(|c| c.get("plan"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("pro");

                let paddle_sub_id = sub
                    .get("id")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                let paddle_customer_id = sub
                    .get("customer_id")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                Ok(WebhookResult::SubscriptionCreated {
                    customer_id: customer_id
                        .ok_or_else(|| AppError::BadRequest("Missing customer_id in Paddle event".into()))?,
                    plan: Plan::from_str(plan_str),
                    provider_customer_id: paddle_customer_id,
                    provider_subscription_id: paddle_sub_id,
                })
            }
            "subscription.updated" => {
                let sub = &event.data;
                let paddle_sub_id = sub
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                let status = sub
                    .get("status")
                    .and_then(|v| v.as_str())
                    .unwrap_or("active");

                // Determine plan from items
                let price_id = sub
                    .get("items")
                    .and_then(|items| items.as_array())
                    .and_then(|arr| arr.first())
                    .and_then(|item| item.get("price_id"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("");

                let plan = self.determine_plan_from_prices(price_id);

                Ok(WebhookResult::SubscriptionUpdated {
                    provider_subscription_id: paddle_sub_id,
                    plan,
                    status: status.to_string(),
                })
            }
            "subscription.canceled" | "subscription.paused" => {
                let sub_id = event
                    .data
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                Ok(WebhookResult::SubscriptionCanceled {
                    provider_subscription_id: sub_id,
                })
            }
            "transaction.completed" => {
                let tx = &event.data;
                let tx_id = tx
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                let amount = tx
                    .get("details")
                    .and_then(|d| d.get("totals"))
                    .and_then(|t| t.get("total"))
                    .and_then(|v| v.as_str())
                    .and_then(|s| s.parse::<f64>().ok())
                    .map(|f| (f * 100.0) as u64)
                    .unwrap_or(0);

                let currency = tx
                    .get("currency_code")
                    .and_then(|v| v.as_str())
                    .unwrap_or("USD")
                    .to_string();

                Ok(WebhookResult::PaymentSucceeded {
                    provider_tx_id: tx_id,
                    amount_cents: amount,
                    currency,
                })
            }
            "transaction.payment_failed" => {
                let tx_id = event
                    .data
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                Ok(WebhookResult::PaymentFailed {
                    provider_tx_id: tx_id,
                })
            }
            _ => {
                tracing::debug!("Unhandled Paddle event: {}", event.event_type);
                Ok(WebhookResult::Ignored)
            }
        }
    }

    async fn create_customer_portal(
        &self,
        paddle_customer_id: &str,
        _app_url: &str,
    ) -> Result<String, AppError> {
        // Paddle doesn't have a direct portal API like Stripe.
        // We generate a portal link using Paddle's built-in portal.
        let portal_url = if self.config.base_url.contains("sandbox") {
            format!(
                "https://sandbox-customer-portal.paddle.com/customer/{}",
                paddle_customer_id
            )
        } else {
            format!(
                "https://customer-portal.paddle.com/customer/{}",
                paddle_customer_id
            )
        };

        Ok(portal_url)
    }

    async fn cancel_subscription(
        &self,
        paddle_subscription_id: &str,
    ) -> Result<(), AppError> {
        let resp = self
            .client
            .post(format!(
                "{}/subscriptions/{}/cancel",
                self.config.base_url, paddle_subscription_id
            ))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "effective_from": "next_billing_period"
            }))
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Paddle cancel failed: {}", e)))?;

        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Paddle subscription cancel failed: {}", body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Failed to cancel Paddle subscription"
            )));
        }

        Ok(())
    }
}
