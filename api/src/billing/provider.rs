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
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Self {
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
    },
    /// Subscription updated (plan change, renewal).
    SubscriptionUpdated {
        provider_subscription_id: String,
        plan: Plan,
        status: String,
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
    PaymentFailed { provider_tx_id: String },
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
    ) -> Result<CheckoutResult, AppError>;

    /// Process a webhook event from the provider.
    ///
    /// `headers` contains the HTTP headers from the webhook request.
    /// `body` is the raw request body.
    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
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
