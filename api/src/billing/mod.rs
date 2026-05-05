pub mod stripe;

use serde::{Deserialize, Serialize};

/// Subscription plan definitions with limits
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Plan {
    Free,
    Pro,
    Business,
    Enterprise,
}

impl Plan {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "pro" => Plan::Pro,
            "business" => Plan::Business,
            "enterprise" => Plan::Enterprise,
            _ => Plan::Free,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Plan::Free => "free",
            Plan::Pro => "pro",
            Plan::Business => "business",
            Plan::Enterprise => "enterprise",
        }
    }

    /// Max webhook deliveries per day
    pub fn max_webhooks_per_day(&self) -> u64 {
        match self {
            Plan::Free => 1_000,
            Plan::Pro => 50_000,
            Plan::Business => 500_000,
            Plan::Enterprise => u64::MAX,
        }
    }

    /// Max API requests per minute
    pub fn max_requests_per_minute(&self) -> u32 {
        match self {
            Plan::Free => 100,
            Plan::Pro => 1_000,
            Plan::Business => 10_000,
            Plan::Enterprise => u32::MAX,
        }
    }

    /// Max endpoints
    pub fn max_endpoints(&self) -> u32 {
        match self {
            Plan::Free => 5,
            Plan::Pro => 50,
            Plan::Business => 500,
            Plan::Enterprise => u32::MAX,
        }
    }

    /// Max payload size in bytes
    pub fn max_payload_bytes(&self) -> usize {
        match self {
            Plan::Free => 256 * 1024,        // 256 KB
            Plan::Pro => 1024 * 1024,         // 1 MB
            Plan::Business => 5 * 1024 * 1024, // 5 MB
            Plan::Enterprise => 10 * 1024 * 1024, // 10 MB
        }
    }

    /// Retention days for delivery logs
    pub fn retention_days(&self) -> i64 {
        match self {
            Plan::Free => 7,
            Plan::Pro => 30,
            Plan::Business => 90,
            Plan::Enterprise => 365,
        }
    }

    /// Monthly price in cents (USD)
    pub fn monthly_price_cents(&self) -> u64 {
        match self {
            Plan::Free => 0,
            Plan::Pro => 4900,       // $49/mo
            Plan::Business => 14900, // $149/mo
            Plan::Enterprise => 0,   // Custom pricing
        }
    }
}

/// Usage tracking per customer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub customer_id: String,
    pub plan: Plan,
    pub webhooks_today: u64,
    pub api_calls_today: u64,
    pub endpoints_count: u32,
    pub period_start: String,  // ISO 8601 date
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
        self.plan.max_webhooks_per_day().saturating_sub(self.webhooks_today)
    }

    /// Get remaining endpoints
    pub fn remaining_endpoints(&self) -> u32 {
        self.plan.max_endpoints().saturating_sub(self.endpoints_count)
    }
}

/// Subscription status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subscription {
    pub customer_id: String,
    pub plan: Plan,
    pub status: SubscriptionStatus,
    pub stripe_subscription_id: Option<String>,
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InvoiceStatus {
    Draft,
    Open,
    Paid,
    Void,
    Uncollectible,
}
