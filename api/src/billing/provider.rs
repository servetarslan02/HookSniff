//! Payment provider abstraction layer.
//!
//! Provides a unified interface for all payment providers (Stripe, Polar.sh, iyzico).
//! Each provider implements the `PaymentProvider` trait.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::AppError;

/// Which payment provider the customer uses.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum PaymentProvider {
    Stripe,
    Polar,
    Iyzico,
}

impl PaymentProvider {
    pub fn parse_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "polar" => Self::Polar,
            "iyzico" => Self::Iyzico,
            _ => Self::Stripe,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Stripe => "stripe",
            Self::Polar => "polar",
            Self::Iyzico => "iyzico",
        }
    }
}

/// Result of creating a checkout session.
#[derive(Debug, Serialize)]
pub struct CheckoutResult {
    /// URL to redirect the customer to for payment.
    pub checkout_url: String,
    /// Provider-specific session/transaction ID.
    pub session_id: String,
}

/// Result of processing a webhook event.
#[derive(Debug)]
pub enum WebhookResult {
    /// Customer upgraded to a plan.
    SubscriptionCreated {
        customer_id: Uuid,
        plan: Plan,
        provider_customer_id: Option<String>,
        provider_subscription_id: Option<String>,
        /// Billing interval: "month" or "year"
        interval: String,
    },
    /// Subscription updated (plan change, renewal).
    SubscriptionUpdated {
        provider_subscription_id: String,
        plan: Plan,
        status: String,
        /// Billing interval: "month" or "year"
        interval: String,
    },
    /// Subscription canceled.
    SubscriptionCanceled { provider_subscription_id: String },
    /// Payment succeeded.
    PaymentSucceeded {
        provider_tx_id: String,
        amount_cents: u64,
        currency: String,
    },
    /// Payment failed.
    PaymentFailed {
        provider_tx_id: String,
        customer_id: Option<Uuid>,
    },
    /// Event acknowledged but no action needed.
    Ignored,
}

/// Unified payment provider trait.
///
/// All payment providers (Stripe, Polar.sh, iyzico) implement this trait
/// so the billing routes can work with any provider uniformly.
#[async_trait]
pub trait PaymentProviderImpl: Send + Sync {
    /// Create a checkout session for upgrading to a plan.
    async fn create_checkout(
        &self,
        customer_id: Uuid,
        customer_email: &str,
        plan: &Plan,
        app_url: &str,
        yearly: bool,
    ) -> Result<CheckoutResult, AppError>;

    /// Process a webhook event from the provider.
    ///
    /// `headers` contains the HTTP headers from the webhook request.
    /// `body` is the raw request body.
    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
        pool: &sqlx::PgPool,
    ) -> Result<WebhookResult, AppError>;

    /// Open a customer portal for managing subscription.
    async fn create_customer_portal(
        &self,
        provider_customer_id: &str,
        app_url: &str,
    ) -> Result<String, AppError>;

    /// Cancel a subscription.
    async fn cancel_subscription(&self, provider_subscription_id: &str) -> Result<(), AppError>;
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── PaymentProvider::parse_str ─────────────────────────────

    #[test]
    fn parse_str_polar() {
        assert_eq!(PaymentProvider::parse_str("polar"), PaymentProvider::Polar);
        assert_eq!(PaymentProvider::parse_str("Polar"), PaymentProvider::Polar);
        assert_eq!(PaymentProvider::parse_str("POLAR"), PaymentProvider::Polar);
    }

    #[test]
    fn parse_str_iyzico() {
        assert_eq!(
            PaymentProvider::parse_str("iyzico"),
            PaymentProvider::Iyzico
        );
        assert_eq!(
            PaymentProvider::parse_str("Iyzico"),
            PaymentProvider::Iyzico
        );
        assert_eq!(
            PaymentProvider::parse_str("IYZICO"),
            PaymentProvider::Iyzico
        );
    }

    #[test]
    fn parse_str_stripe_default() {
        assert_eq!(
            PaymentProvider::parse_str("stripe"),
            PaymentProvider::Stripe
        );
        assert_eq!(
            PaymentProvider::parse_str("Stripe"),
            PaymentProvider::Stripe
        );
        assert_eq!(PaymentProvider::parse_str(""), PaymentProvider::Stripe);
        assert_eq!(
            PaymentProvider::parse_str("unknown"),
            PaymentProvider::Stripe
        );
    }

    // ── PaymentProvider::as_str ────────────────────────────────

    #[test]
    fn as_str_all_variants() {
        assert_eq!(PaymentProvider::Stripe.as_str(), "stripe");
        assert_eq!(PaymentProvider::Polar.as_str(), "polar");
        assert_eq!(PaymentProvider::Iyzico.as_str(), "iyzico");
    }

    // ── Roundtrip ──────────────────────────────────────────────

    #[test]
    fn parse_str_as_str_roundtrip() {
        for v in &[
            PaymentProvider::Stripe,
            PaymentProvider::Polar,
            PaymentProvider::Iyzico,
        ] {
            assert_eq!(PaymentProvider::parse_str(v.as_str()), *v);
        }
    }

    // ── PaymentProvider serde ──────────────────────────────────

    #[test]
    fn payment_provider_serde_roundtrip() {
        for v in &[
            PaymentProvider::Stripe,
            PaymentProvider::Polar,
            PaymentProvider::Iyzico,
        ] {
            let json = serde_json::to_string(v).unwrap();
            let deserialized: PaymentProvider = serde_json::from_str(&json).unwrap();
            assert_eq!(*v, deserialized);
        }
    }

    // ── CheckoutResult ─────────────────────────────────────────

    #[test]
    fn checkout_result_debug() {
        let result = CheckoutResult {
            checkout_url: "https://example.com/checkout".to_string(),
            session_id: "sess_123".to_string(),
        };
        let debug = format!("{:?}", result);
        assert!(debug.contains("checkout_url"));
        assert!(debug.contains("session_id"));
    }

    // ── WebhookResult variants ─────────────────────────────────

    #[test]
    fn webhook_result_subscription_created() {
        let customer_id = Uuid::new_v4();
        let result = WebhookResult::SubscriptionCreated {
            customer_id,
            plan: Plan::Pro,
            provider_customer_id: Some("cust_123".to_string()),
            provider_subscription_id: Some("sub_456".to_string()),
            interval: "month".to_string(),
        };
        match result {
            WebhookResult::SubscriptionCreated {
                customer_id: cid,
                plan,
                provider_customer_id,
                provider_subscription_id,
                interval,
            } => {
                assert_eq!(cid, customer_id);
                assert_eq!(plan, Plan::Pro);
                assert_eq!(provider_customer_id.as_deref(), Some("cust_123"));
                assert_eq!(provider_subscription_id.as_deref(), Some("sub_456"));
                assert_eq!(interval, "month");
            }
            _ => panic!("Expected SubscriptionCreated"),
        }
    }

    #[test]
    fn webhook_result_subscription_created_yearly() {
        let customer_id = Uuid::new_v4();
        let result = WebhookResult::SubscriptionCreated {
            customer_id,
            plan: Plan::Pro,
            provider_customer_id: Some("cust_123".to_string()),
            provider_subscription_id: Some("sub_456".to_string()),
            interval: "year".to_string(),
        };
        match result {
            WebhookResult::SubscriptionCreated { interval, .. } => {
                assert_eq!(interval, "year");
            }
            _ => panic!("Expected SubscriptionCreated"),
        }
    }

    #[test]
    fn webhook_result_subscription_created_with_none_fields() {
        let result = WebhookResult::SubscriptionCreated {
            customer_id: Uuid::new_v4(),
            plan: Plan::Developer,
            provider_customer_id: None,
            provider_subscription_id: None,
            interval: "month".to_string(),
        };
        match result {
            WebhookResult::SubscriptionCreated {
                provider_customer_id,
                provider_subscription_id,
                ..
            } => {
                assert!(provider_customer_id.is_none());
                assert!(provider_subscription_id.is_none());
            }
            _ => panic!("Expected SubscriptionCreated"),
        }
    }

    #[test]
    fn webhook_result_subscription_updated() {
        let result = WebhookResult::SubscriptionUpdated {
            provider_subscription_id: "sub_789".to_string(),
            plan: Plan::Enterprise,
            status: "active".to_string(),
            interval: "month".to_string(),
        };
        match result {
            WebhookResult::SubscriptionUpdated {
                provider_subscription_id,
                plan,
                status,
                interval,
            } => {
                assert_eq!(provider_subscription_id, "sub_789");
                assert_eq!(plan, Plan::Enterprise);
                assert_eq!(status, "active");
                assert_eq!(interval, "month");
            }
            _ => panic!("Expected SubscriptionUpdated"),
        }
    }

    #[test]
    fn webhook_result_subscription_canceled() {
        let result = WebhookResult::SubscriptionCanceled {
            provider_subscription_id: "sub_cancel".to_string(),
        };
        match result {
            WebhookResult::SubscriptionCanceled {
                provider_subscription_id,
            } => {
                assert_eq!(provider_subscription_id, "sub_cancel");
            }
            _ => panic!("Expected SubscriptionCanceled"),
        }
    }

    #[test]
    fn webhook_result_payment_succeeded() {
        let result = WebhookResult::PaymentSucceeded {
            provider_tx_id: "tx_001".to_string(),
            amount_cents: 4900,
            currency: "USD".to_string(),
        };
        match result {
            WebhookResult::PaymentSucceeded {
                provider_tx_id,
                amount_cents,
                currency,
            } => {
                assert_eq!(provider_tx_id, "tx_001");
                assert_eq!(amount_cents, 4900);
                assert_eq!(currency, "USD");
            }
            _ => panic!("Expected PaymentSucceeded"),
        }
    }

    #[test]
    fn webhook_result_payment_failed() {
        let result = WebhookResult::PaymentFailed {
            provider_tx_id: "tx_fail".to_string(),
            customer_id: None,
        };
        match result {
            WebhookResult::PaymentFailed {
                provider_tx_id,
                customer_id,
            } => {
                assert_eq!(provider_tx_id, "tx_fail");
                assert!(customer_id.is_none());
            }
            _ => panic!("Expected PaymentFailed"),
        }
    }

    #[test]
    fn webhook_result_ignored() {
        let result = WebhookResult::Ignored;
        match result {
            WebhookResult::Ignored => {}
            _ => panic!("Expected Ignored"),
        }
    }
}
