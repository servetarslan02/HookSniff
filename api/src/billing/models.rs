//! Billing data models.
//!
//! Usage tracking, subscription status, and invoice records.

use serde::{Deserialize, Serialize};

use super::Plan;

/// Usage tracking per customer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub customer_id: String,
    pub plan: Plan,
    pub webhooks_today: u64,
    pub api_calls_today: u64,
    pub endpoints_count: u32,
    pub period_start: String, // ISO 8601 date
    pub period_end: String,
}

impl Usage {
    /// Check if the customer has exceeded their daily webhook limit
    pub fn is_webhook_limit_exceeded(&self) -> bool {
        self.webhooks_today >= self.plan.max_webhooks_per_day()
    }

    /// Check if the customer has exceeded their endpoint limit
    pub fn is_endpoint_limit_exceeded(&self) -> bool {
        self.endpoints_count >= self.plan.max_endpoints()
    }

    /// Get remaining webhook deliveries for today
    pub fn remaining_webhooks(&self) -> u64 {
        self.plan
            .max_webhooks_per_day()
            .saturating_sub(self.webhooks_today)
    }

    /// Get remaining endpoints
    pub fn remaining_endpoints(&self) -> u32 {
        self.plan
            .max_endpoints()
            .saturating_sub(self.endpoints_count)
    }
}

/// Subscription status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subscription {
    pub customer_id: String,
    pub plan: Plan,
    pub status: SubscriptionStatus,
    pub stripe_subscription_id: Option<String>,
    pub polar_subscription_id: Option<String>,
    pub iyzico_subscription_id: Option<String>,
    pub payment_provider: String,
    pub current_period_start: String,
    pub current_period_end: String,
    pub cancel_at_period_end: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SubscriptionStatus {
    Active,
    Trialing,
    PastDue,
    Canceled,
    Unpaid,
}

/// Invoice record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invoice {
    pub id: String,
    pub customer_id: String,
    pub amount_cents: u64,
    pub currency: String,
    pub status: InvoiceStatus,
    pub period_start: String,
    pub period_end: String,
    pub paid_at: Option<String>,
    pub stripe_invoice_id: Option<String>,
    pub polar_invoice_id: Option<String>,
    pub iyzico_invoice_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InvoiceStatus {
    Draft,
    Open,
    Paid,
    Void,
    Uncollectible,
    Refunded,
}
