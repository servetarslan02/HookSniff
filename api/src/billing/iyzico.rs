//! iyzico billing integration for HookSniff.
//!
//! iyzico is a Turkish payment provider with:
//! - 3D Secure credit/debit card payments
//! - Turkish Lira (TRY) support
//! - Local bank settlement
//! - PCI-DSS compliant
//!
//! Environment variables:
//!   IYZICO_API_KEY      — iyzico API key
//!   IYZICO_SECRET_KEY   — iyzico secret key
//!   IYZICO_BASE_URL     — API base URL (sandbox or production)
//!   IYZICO_PRICE_PRO    — Pro plan price in kuruş (e.g., 14900 = ₺149.00)
//!   IYZICO_PRICE_BUSINESS — Business plan price in kuruş

use async_trait::async_trait;
use base64::Engine;
use hmac::{Hmac, KeyInit, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use uuid::Uuid;

use crate::billing::provider::{CheckoutResult, PaymentProviderImpl, WebhookResult};
use crate::billing::Plan;
use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

/// iyzico API configuration.
#[derive(Debug, Clone)]
pub struct IyzicoConfig {
    pub api_key: String,
    pub secret_key: String,
    pub base_url: String,
    pub price_pro_kurus: i64, // Price in kuruş (₺1 = 100 kuruş)
    pub price_business_kurus: i64,
}

impl IyzicoConfig {
    pub fn from_env() -> Option<Self> {
        let api_key = std::env::var("IYZICO_API_KEY").ok()?;
        let secret_key = std::env::var("IYZICO_SECRET_KEY").ok()?;

        let is_sandbox = std::env::var("IYZICO_ENV")
            .map(|v| v == "sandbox")
            .unwrap_or(false);

        let base_url = if is_sandbox {
            "https://sandbox-api.iyzipay.com".to_string()
        } else {
            "https://api.iyzipay.com".to_string()
        };

        Some(Self {
            api_key,
            secret_key,
            base_url,
            price_pro_kurus: std::env::var("IYZICO_PRICE_PRO")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(14900), // ₺149.00
            price_business_kurus: std::env::var("IYZICO_PRICE_BUSINESS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(44900), // ₺449.00
        })
    }

    fn price_for_plan(&self, plan: &Plan) -> Option<i64> {
        match plan {
            Plan::Pro => Some(self.price_pro_kurus),
            Plan::Enterprise => Some(self.price_business_kurus),
            _ => None,
        }
    }
}

// ── iyzico API types ──────────────────────────────────────────

/// iyzico authentication uses HMAC-SHA256 over a random string + URI + body.
#[derive(Debug, Serialize)]
struct IyzicoAuth {
    #[serde(rename = "apiKey")]
    api_key: String,
    #[serde(rename = "randomKey")]
    random_key: String,
    signature: String,
    #[serde(rename = "conversationId")]
    conversation_id: String,
}

/// Create a 3D Secure payment initialization request.
#[derive(Debug, Serialize)]
struct CreatePaymentRequest {
    #[serde(rename = "locale")]
    locale: String,
    #[serde(rename = "conversationId")]
    conversation_id: String,
    #[serde(rename = "price")]
    price: String,
    #[serde(rename = "paidPrice")]
    paid_price: String,
    #[serde(rename = "currency")]
    currency: String,
    #[serde(rename = "basketId")]
    basket_id: String,
    #[serde(rename = "paymentGroup")]
    payment_group: String,
    #[serde(rename = "paymentCard")]
    payment_card: PaymentCard,
    #[serde(rename = "buyer")]
    buyer: BuyerInfo,
    #[serde(rename = "shippingAddress")]
    shipping_address: AddressInfo,
    #[serde(rename = "billingAddress")]
    billing_address: AddressInfo,
    #[serde(rename = "basketItems")]
    basket_items: Vec<BasketItem>,
    #[serde(rename = "callbackUrl")]
    callback_url: String,
    #[serde(flatten)]
    auth: IyzicoAuth,
}

#[derive(Debug, Serialize)]
struct PaymentCard {
    #[serde(rename = "cardHolderName")]
    card_holder_name: String,
    #[serde(rename = "cardNumber")]
    card_number: String,
    #[serde(rename = "expireMonth")]
    expire_month: String,
    #[serde(rename = "expireYear")]
    expire_year: String,
    #[serde(rename = "cvc")]
    cvc: String,
    #[serde(rename = "registerCard")]
    register_card: u8,
}

#[derive(Debug, Serialize)]
struct BuyerInfo {
    id: String,
    name: String,
    surname: String,
    email: String,
    #[serde(rename = "identityNumber")]
    identity_number: String,
    #[serde(rename = "registrationAddress")]
    registration_address: String,
    ip: String,
    city: String,
    country: String,
}

#[derive(Debug, Serialize)]
struct AddressInfo {
    #[serde(rename = "contactName")]
    contact_name: String,
    city: String,
    country: String,
    address: String,
}

#[derive(Debug, Serialize)]
struct BasketItem {
    id: String,
    name: String,
    #[serde(rename = "category1")]
    category1: String,
    #[serde(rename = "itemType")]
    item_type: String,
    price: String,
}

/// iyzico payment initialization response.
#[derive(Debug, Deserialize)]
struct PaymentInitResponse {
    status: String,
    #[serde(rename = "errorMessage")]
    error_message: Option<String>,
    #[serde(rename = "threeDSHtmlContent")]
    _three_ds_html: Option<String>,
    #[serde(rename = "paymentId")]
    payment_id: Option<String>,
    #[serde(rename = "conversationId")]
    _conversation_id: Option<String>,
}

/// iyzico webhook notification.
#[derive(Debug, Deserialize)]
pub struct IyzicoWebhookNotification {
    #[serde(rename = "iyziEventTime")]
    pub event_time: i64,
    #[serde(rename = "iyziEventType")]
    pub event_type: String,
    #[serde(rename = "paymentId")]
    pub payment_id: String,
    #[serde(rename = "paymentConversationId")]
    pub conversation_id: Option<String>,
    #[serde(rename = "status")]
    pub status: String,
}

// ── iyzico implementation ─────────────────────────────────────

pub struct IyzicoProvider {
    config: IyzicoConfig,
    client: reqwest::Client,
}

impl IyzicoProvider {
    pub fn new(config: IyzicoConfig) -> Self {
        Self {
            config,
            client: crate::http_client::get_client().clone(),
        }
    }

    /// Generate iyzico HMAC-SHA256 authentication signature.
    ///
    /// iyzico signature = HMAC-SHA256(secret_key, random_string + uri + body)
    fn generate_auth(&self, uri: &str, body: &str) -> IyzicoAuth {
        use rand::RngExt;

        let random_string: String = rand::rng()
            .sample_iter(&rand::distr::Alphanumeric)
            .take(8)
            .map(char::from)
            .collect();

        let signature_payload = format!("{}{}{}", random_string, uri, body);

        let mut mac =
            HmacSha256::new_from_slice(self.config.secret_key.as_bytes()).expect("HMAC key error");
        mac.update(signature_payload.as_bytes());
        let signature =
            base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());

        IyzicoAuth {
            api_key: self.config.api_key.clone(),
            random_key: random_string,
            signature,
            conversation_id: Uuid::new_v4().to_string(),
        }
    }

    /// Verify iyzico webhook signature.
    ///
    /// iyzico signs: `random_string + uri + body`
    /// The random string is provided in the `x-iyzi-rnd` header.
    fn verify_webhook_signature(
        &self,
        body: &str,
        headers: &axum::http::HeaderMap,
    ) -> Result<(), AppError> {
        // Reject if webhook secret is not configured
        if self.config.secret_key.is_empty() {
            tracing::error!("iyzico webhook secret is empty — rejecting webhook to prevent billing manipulation");
            return Err(AppError::Internal(anyhow::anyhow!(
                "Billing webhook secret not configured"
            )));
        }

        let signature = headers
            .get("x-iyzi-signature")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if signature.is_empty() {
            return Err(AppError::BadRequest("Missing iyzico signature".into()));
        }

        // iyzico sends the random string in x-iyzi-rnd header
        let random_string = headers
            .get("x-iyzi-rnd")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        // iyzico webhook signature: base64(HMAC-SHA256(secret, random + uri + body))
        let uri = "/v1/billing/webhook/iyzico";
        let payload = format!("{}{}{}", random_string, uri, body);
        let mut mac = HmacSha256::new_from_slice(self.config.secret_key.as_bytes())
            .map_err(|_| AppError::Internal(anyhow::anyhow!("HMAC key error")))?;
        mac.update(payload.as_bytes());
        let expected =
            base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());

        if signature != expected {
            tracing::warn!(
                "iyzico webhook signature mismatch (rnd_len={}, uri={})",
                random_string.len(),
                uri
            );
            return Err(AppError::Unauthorized);
        }

        Ok(())
    }
}

#[async_trait]
impl PaymentProviderImpl for IyzicoProvider {
    async fn create_checkout(
        &self,
        customer_id: Uuid,
        customer_email: &str,
        plan: &Plan,
        app_url: &str,
        _yearly: bool,
        _discount_code: Option<&str>,
    ) -> Result<CheckoutResult, AppError> {
        let price_kurus = self
            .config
            .price_for_plan(plan)
            .ok_or_else(|| AppError::BadRequest("Invalid plan for iyzico checkout".into()))?;

        let price_str = format!("{:.2}", price_kurus as f64 / 100.0);
        let uri = "/payment/iyzipos/checkoutform/initialize/auth/ecompose";

        let callback_url = format!("{}/dashboard/billing?iyzico_callback=true", app_url);

        let req_body = CreatePaymentRequest {
            locale: "tr".to_string(),
            conversation_id: customer_id.to_string(),
            price: price_str.clone(),
            paid_price: price_str.clone(),
            currency: "TRY".to_string(),
            basket_id: format!("hooksniff-{}-{}", customer_id, plan.as_str()),
            payment_group: "SUBSCRIPTION".to_string(),
            payment_card: PaymentCard {
                card_holder_name: "".to_string(),
                card_number: "".to_string(),
                expire_month: "".to_string(),
                expire_year: "".to_string(),
                cvc: "".to_string(),
                register_card: 0,
            },
            buyer: BuyerInfo {
                id: customer_id.to_string(),
                name: "Customer".to_string(),
                surname: "".to_string(),
                email: customer_email.to_string(),
                identity_number: "11111111111".to_string(),
                registration_address: "N/A".to_string(),
                ip: "0.0.0.0".to_string(),
                city: "Istanbul".to_string(),
                country: "Turkey".to_string(),
            },
            shipping_address: AddressInfo {
                contact_name: "Customer".to_string(),
                city: "Istanbul".to_string(),
                country: "Turkey".to_string(),
                address: "N/A".to_string(),
            },
            billing_address: AddressInfo {
                contact_name: "Customer".to_string(),
                city: "Istanbul".to_string(),
                country: "Turkey".to_string(),
                address: "N/A".to_string(),
            },
            basket_items: vec![BasketItem {
                id: format!("plan-{}", plan.as_str()),
                name: format!("HookSniff {} Plan", plan.as_str().to_uppercase()),
                category1: "Software".to_string(),
                item_type: "VIRTUAL".to_string(),
                price: price_str,
            }],
            callback_url,
            auth: self.generate_auth(uri, ""),
        };

        let body_json = serde_json::to_string(&req_body)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("JSON serialize error: {}", e)))?;

        let resp = self
            .client
            .post(format!("{}{}", self.config.base_url, uri))
            .header("Content-Type", "application/json")
            .body(body_json)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("iyzico request failed: {}", e)))?;

        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("iyzico checkout init failed: {}", body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "iyzico checkout failed"
            )));
        }

        let init_resp: PaymentInitResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse iyzico response: {}", e))
        })?;

        if init_resp.status != "success" {
            return Err(AppError::Internal(anyhow::anyhow!(
                "iyzico error: {}",
                init_resp.error_message.unwrap_or_default()
            )));
        }

        // iyzico returns a 3D Secure HTML page that the customer must complete
        // For now, we return the payment ID. The frontend will handle 3DS redirect.
        let checkout_url = format!(
            "{}/dashboard/billing/iyzico-3ds?paymentId={}",
            app_url,
            init_resp.payment_id.as_deref().unwrap_or("pending")
        );

        Ok(CheckoutResult {
            checkout_url,
            session_id: init_resp.payment_id.unwrap_or_default(),
        })
    }

    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
        _pool: &sqlx::PgPool,
    ) -> Result<WebhookResult, AppError> {
        self.verify_webhook_signature(body, headers)?;

        let notification: IyzicoWebhookNotification = serde_json::from_str(body).map_err(|e| {
            // HS-038l: Log details internally, return generic message to client
            tracing::warn!("Invalid iyzico webhook payload: {:?}", e);
            AppError::BadRequest("Invalid webhook payload".into())
        })?;

        tracing::info!(
            "iyzico webhook: event={}, payment={}",
            notification.event_type,
            notification.payment_id
        );

        match notification.event_type.as_str() {
            "BKM_POS_PAYMENT_SUCCESS" | "CARD_PAYMENT_SUCCESS" => {
                Ok(WebhookResult::PaymentSucceeded {
                    provider_tx_id: notification.payment_id,
                    amount_cents: 0, // Amount needs to be looked up from the payment
                    currency: "TRY".to_string(),
                })
            }
            "BKM_POS_PAYMENT_FAILURE" | "CARD_PAYMENT_FAILURE" => {
                Ok(WebhookResult::PaymentFailed {
                    provider_tx_id: notification.payment_id,
                    customer_id: None, // Will be resolved by process_webhook_result
                })
            }
            _ => {
                tracing::debug!("Unhandled iyzico event: {}", notification.event_type);
                Ok(WebhookResult::Ignored)
            }
        }
    }

    async fn create_customer_portal(
        &self,
        _iyzico_customer_id: &str,
        _app_url: &str,
    ) -> Result<String, AppError> {
        // HS-038l: Don't reveal provider implementation details
        Err(AppError::BadRequest(
            "Customer portal is not available for your payment provider. Please manage your subscription from the dashboard.".into()
        ))
    }

    async fn cancel_subscription(&self, _iyzico_subscription_id: &str) -> Result<(), AppError> {
        // iyzico doesn't have native subscriptions.
        // We handle cancellation on our side by marking the subscription as canceled.
        tracing::info!("iyzico subscription canceled (handled server-side)");
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> IyzicoConfig {
        IyzicoConfig {
            api_key: "test_api_key".to_string(),
            secret_key: "test_secret_key".to_string(),
            base_url: "https://sandbox-api.iyzipay.com".to_string(),
            price_pro_kurus: 14900,
            price_business_kurus: 44900,
        }
    }

    // ── IyzicoConfig::price_for_plan ───────────────────────────

    #[test]
    fn price_for_plan_pro() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Pro), Some(14900));
    }

    #[test]
    fn price_for_plan_business() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Enterprise), Some(44900));
    }

    #[test]
    fn price_for_plan_free_returns_none() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Developer), None);
    }

    #[test]
    fn price_for_plan_enterprise_returns_business_price() {
        let config = test_config();
        assert_eq!(config.price_for_plan(&Plan::Enterprise), Some(44900));
    }

    // ── IyzicoProvider::generate_auth ──────────────────────────

    #[test]
    fn generate_auth_produces_valid_signature() {
        let provider = IyzicoProvider::new(test_config());
        let auth = provider.generate_auth("/test/uri", "test_body");

        assert_eq!(auth.api_key, "test_api_key");
        assert!(!auth.random_key.is_empty());
        assert!(!auth.signature.is_empty());
        assert!(!auth.conversation_id.is_empty());

        // Verify the signature is valid base64
        let decoded = base64::engine::general_purpose::STANDARD.decode(&auth.signature);
        assert!(decoded.is_ok());
    }

    #[test]
    fn generate_auth_random_key_is_alphanumeric() {
        let provider = IyzicoProvider::new(test_config());
        let auth = provider.generate_auth("/uri", "body");
        assert!(auth.random_key.chars().all(|c| c.is_ascii_alphanumeric()));
    }

    #[test]
    fn generate_auth_random_key_length() {
        let provider = IyzicoProvider::new(test_config());
        let auth = provider.generate_auth("/uri", "body");
        assert_eq!(auth.random_key.len(), 8);
    }

    #[test]
    fn generate_auth_signature_is_hmac_of_payload() {
        let provider = IyzicoProvider::new(test_config());
        let uri = "/payment/test";
        let body = "test_body";
        let auth = provider.generate_auth(uri, body);

        // Manually verify the HMAC
        let payload = format!("{}{}{}", auth.random_key, uri, body);
        let mut mac = HmacSha256::new_from_slice(b"test_secret_key").unwrap();
        mac.update(payload.as_bytes());
        let expected =
            base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());

        assert_eq!(auth.signature, expected);
    }

    // ── IyzicoProvider::verify_webhook_signature ───────────────

    #[test]
    fn verify_webhook_signature_valid() {
        let config = test_config();
        let provider = IyzicoProvider::new(config);

        let random_string = "abcdefgh";
        let body = r#"{"iyziEventType":"CARD_PAYMENT_SUCCESS","paymentId":"pay_1"}"#;
        let uri = "/v1/billing/webhook/iyzico";
        let payload = format!("{}{}{}", random_string, uri, body);

        let mut mac = HmacSha256::new_from_slice(b"test_secret_key").unwrap();
        mac.update(payload.as_bytes());
        let expected_sig =
            base64::engine::general_purpose::STANDARD.encode(mac.finalize().into_bytes());

        let mut headers = axum::http::HeaderMap::new();
        headers.insert("x-iyzi-rnd", random_string.parse().unwrap());
        headers.insert("x-iyzi-signature", expected_sig.parse().unwrap());

        assert!(provider.verify_webhook_signature(body, &headers).is_ok());
    }

    #[test]
    fn verify_webhook_signature_missing_signature_header() {
        let provider = IyzicoProvider::new(test_config());
        let headers = axum::http::HeaderMap::new();
        let result = provider.verify_webhook_signature("body", &headers);
        assert!(result.is_err());
    }

    #[test]
    fn verify_webhook_signature_mismatch() {
        let provider = IyzicoProvider::new(test_config());
        let mut headers = axum::http::HeaderMap::new();
        headers.insert("x-iyzi-rnd", "abcdefgh".parse().unwrap());
        headers.insert("x-iyzi-signature", "wrong_signature".parse().unwrap());
        let result = provider.verify_webhook_signature("body", &headers);
        assert!(result.is_err());
    }

    // ── IyzicoProvider::create_customer_portal ─────────────────

    #[tokio::test]
    async fn create_customer_portal_returns_error() {
        let provider = IyzicoProvider::new(test_config());
        let result = provider
            .create_customer_portal("cust_123", "https://app.hooksniff.com")
            .await;
        assert!(result.is_err());
    }

    // ── IyzicoProvider::cancel_subscription ────────────────────

    #[tokio::test]
    async fn cancel_subscription_succeeds() {
        let provider = IyzicoProvider::new(test_config());
        // iyzico cancel is handled server-side, always returns Ok
        assert!(provider.cancel_subscription("sub_123").await.is_ok());
    }

    // ── IyzicoWebhookNotification deserialization ──────────────

    #[test]
    fn deserialize_iyzico_webhook_notification() {
        let json = r#"{
            "iyziEventTime": 1234567890,
            "iyziEventType": "CARD_PAYMENT_SUCCESS",
            "paymentId": "pay_001",
            "paymentConversationId": "conv_001",
            "status": "success"
        }"#;
        let notification: IyzicoWebhookNotification = serde_json::from_str(json).unwrap();
        assert_eq!(notification.event_time, 1234567890);
        assert_eq!(notification.event_type, "CARD_PAYMENT_SUCCESS");
        assert_eq!(notification.payment_id, "pay_001");
        assert_eq!(notification.conversation_id.as_deref(), Some("conv_001"));
        assert_eq!(notification.status, "success");
    }

    #[test]
    fn deserialize_iyzico_webhook_notification_minimal() {
        let json = r#"{
            "iyziEventTime": 0,
            "iyziEventType": "UNKNOWN",
            "paymentId": "pay_x",
            "status": "failure"
        }"#;
        let notification: IyzicoWebhookNotification = serde_json::from_str(json).unwrap();
        assert!(notification.conversation_id.is_none());
    }
}
