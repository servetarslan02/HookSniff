// TODO (Item 288): Refactor billing into a cleaner abstraction layer.
//   Current state: Each provider (Stripe, Polar, Iyzico) has its own module
//   with inconsistent error handling and response types.
//   Refactoring goals:
//   1. Define a unified BillingProvider trait with consistent error types
//   2. Standardize webhook event handling across providers
//   3. Create a single BillingService that routes to the correct provider
//   4. Extract provider-specific logic behind the trait boundary

pub mod iyzico;
pub mod polar;
pub mod provider;
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
    pub fn parse_str(s: &str) -> Self {
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

    /// Max webhook deliveries per month
    pub fn max_webhooks_per_month(&self) -> u64 {
        match self {
            Plan::Free => 10_000,
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
            Plan::Free => 256 * 1024,             // 256 KB
            Plan::Pro => 1024 * 1024,             // 1 MB
            Plan::Business => 5 * 1024 * 1024,    // 5 MB
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

    /// Monthly price in cents (USD) — used for Stripe and Polar.sh
    pub fn monthly_price_cents(&self) -> u64 {
        match self {
            Plan::Free => 0,
            Plan::Pro => 4900,      // $49/mo
            Plan::Business => 9900, // $99/mo
            Plan::Enterprise => 0,  // Custom pricing
        }
    }

    /// Monthly price in kuruş (TRY) — used for iyzico
    pub fn monthly_price_kurus(&self) -> i64 {
        match self {
            Plan::Free => 0,
            Plan::Pro => 99900,      // ₺999.00 (TR'ye özel, $49'dan ucuz)
            Plan::Business => 199900, // ₺1,999.00 (TR'ye özel, $99'dan ucuz)
            Plan::Enterprise => 0,
        }
    }
}

/// Resolve the active payment provider for a given provider name.
///
/// Returns the appropriate provider implementation, or falls back to Stripe.
pub fn resolve_provider(provider_name: &str) -> Option<Box<dyn provider::PaymentProviderImpl>> {
    match provider_name.to_lowercase().as_str() {
        "polar" => {
            let config = polar::PolarConfig::from_env()?;
            Some(Box::new(polar::PolarProvider::new(config)))
        }
        "iyzico" => {
            let config = iyzico::IyzicoConfig::from_env()?;
            Some(Box::new(iyzico::IyzicoProvider::new(config)))
        }
        _ => {
            // Stripe is always available (already in config)
            None // Caller should use the existing Stripe logic
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
    pub period_start: String, // ISO 8601 date
    pub period_end: String,
}

impl Usage {
    /// Check if the customer has exceeded their daily webhook limit
    pub fn is_webhook_limit_exceeded(&self) -> bool {
        self.webhooks_today >= self.plan.max_webhooks_per_month()
    }

    /// Check if the customer has exceeded their endpoint limit
    pub fn is_endpoint_limit_exceeded(&self) -> bool {
        self.endpoints_count >= self.plan.max_endpoints()
    }

    /// Get remaining webhook deliveries for today
    pub fn remaining_webhooks(&self) -> u64 {
        self.plan
            .max_webhooks_per_month()
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
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── Plan::parse_str ────────────────────────────────────────

    #[test]
    fn parse_str_pro() {
        assert_eq!(Plan::parse_str("pro"), Plan::Pro);
        assert_eq!(Plan::parse_str("Pro"), Plan::Pro);
        assert_eq!(Plan::parse_str("PRO"), Plan::Pro);
    }

    #[test]
    fn parse_str_business() {
        assert_eq!(Plan::parse_str("business"), Plan::Business);
        assert_eq!(Plan::parse_str("Business"), Plan::Business);
        assert_eq!(Plan::parse_str("BUSINESS"), Plan::Business);
    }

    #[test]
    fn parse_str_enterprise() {
        assert_eq!(Plan::parse_str("enterprise"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("Enterprise"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("ENTERPRISE"), Plan::Enterprise);
    }

    #[test]
    fn parse_str_free_default() {
        assert_eq!(Plan::parse_str("free"), Plan::Free);
        assert_eq!(Plan::parse_str("Free"), Plan::Free);
        assert_eq!(Plan::parse_str(""), Plan::Free);
        assert_eq!(Plan::parse_str("unknown"), Plan::Free);
        assert_eq!(Plan::parse_str("random_string"), Plan::Free);
    }

    // ── Plan::as_str ───────────────────────────────────────────

    #[test]
    fn as_str_all_variants() {
        assert_eq!(Plan::Free.as_str(), "free");
        assert_eq!(Plan::Pro.as_str(), "pro");
        assert_eq!(Plan::Business.as_str(), "business");
        assert_eq!(Plan::Enterprise.as_str(), "enterprise");
    }

    // ── Roundtrip parse_str ↔ as_str ───────────────────────────

    #[test]
    fn parse_str_as_str_roundtrip() {
        for variant in &[Plan::Free, Plan::Pro, Plan::Business, Plan::Enterprise] {
            let s = variant.as_str();
            assert_eq!(Plan::parse_str(s), *variant);
        }
    }

    // ── max_webhooks_per_month ─────────────────────────────────

    #[test]
    fn max_webhooks_per_month_free() {
        assert_eq!(Plan::Free.max_webhooks_per_month(), 10_000);
    }

    #[test]
    fn max_webhooks_per_month_pro() {
        assert_eq!(Plan::Pro.max_webhooks_per_month(), 50_000);
    }

    #[test]
    fn max_webhooks_per_month_business() {
        assert_eq!(Plan::Business.max_webhooks_per_month(), 500_000);
    }

    #[test]
    fn max_webhooks_per_month_enterprise() {
        assert_eq!(Plan::Enterprise.max_webhooks_per_month(), u64::MAX);
    }

    // ── max_requests_per_minute ────────────────────────────────

    #[test]
    fn max_requests_per_minute_all() {
        assert_eq!(Plan::Free.max_requests_per_minute(), 100);
        assert_eq!(Plan::Pro.max_requests_per_minute(), 1_000);
        assert_eq!(Plan::Business.max_requests_per_minute(), 10_000);
        assert_eq!(Plan::Enterprise.max_requests_per_minute(), u32::MAX);
    }

    // ── max_endpoints ──────────────────────────────────────────

    #[test]
    fn max_endpoints_all() {
        assert_eq!(Plan::Free.max_endpoints(), 5);
        assert_eq!(Plan::Pro.max_endpoints(), 50);
        assert_eq!(Plan::Business.max_endpoints(), 500);
        assert_eq!(Plan::Enterprise.max_endpoints(), u32::MAX);
    }

    // ── max_payload_bytes ──────────────────────────────────────

    #[test]
    fn max_payload_bytes_all() {
        assert_eq!(Plan::Free.max_payload_bytes(), 256 * 1024);
        assert_eq!(Plan::Pro.max_payload_bytes(), 1024 * 1024);
        assert_eq!(Plan::Business.max_payload_bytes(), 5 * 1024 * 1024);
        assert_eq!(Plan::Enterprise.max_payload_bytes(), 10 * 1024 * 1024);
    }

    // ── retention_days ─────────────────────────────────────────

    #[test]
    fn retention_days_all() {
        assert_eq!(Plan::Free.retention_days(), 7);
        assert_eq!(Plan::Pro.retention_days(), 30);
        assert_eq!(Plan::Business.retention_days(), 90);
        assert_eq!(Plan::Enterprise.retention_days(), 365);
    }

    // ── monthly_price_cents ────────────────────────────────────

    #[test]
    fn monthly_price_cents_all() {
        assert_eq!(Plan::Free.monthly_price_cents(), 0);
        assert_eq!(Plan::Pro.monthly_price_cents(), 4900);
        assert_eq!(Plan::Business.monthly_price_cents(), 9900);
        assert_eq!(Plan::Enterprise.monthly_price_cents(), 0);
    }

    // ── monthly_price_kurus ────────────────────────────────────

    #[test]
    fn monthly_price_kurus_all() {
        assert_eq!(Plan::Free.monthly_price_kurus(), 0);
        assert_eq!(Plan::Pro.monthly_price_kurus(), 99900);
        assert_eq!(Plan::Business.monthly_price_kurus(), 199900);
        assert_eq!(Plan::Enterprise.monthly_price_kurus(), 0);
    }

    // ── Plan ordering (higher tiers have higher limits) ────────

    #[test]
    fn higher_tiers_have_higher_limits() {
        assert!(Plan::Free.max_requests_per_minute() < Plan::Pro.max_requests_per_minute());
        assert!(Plan::Pro.max_requests_per_minute() < Plan::Business.max_requests_per_minute());
        assert!(
            Plan::Business.max_requests_per_minute() < Plan::Enterprise.max_requests_per_minute()
        );

        assert!(Plan::Free.max_endpoints() < Plan::Pro.max_endpoints());
        assert!(Plan::Pro.max_endpoints() < Plan::Business.max_endpoints());
        assert!(Plan::Business.max_endpoints() < Plan::Enterprise.max_endpoints());

        assert!(Plan::Free.max_webhooks_per_month() < Plan::Pro.max_webhooks_per_month());
        assert!(Plan::Pro.max_webhooks_per_month() < Plan::Business.max_webhooks_per_month());
        assert!(
            Plan::Business.max_webhooks_per_month() < Plan::Enterprise.max_webhooks_per_month()
        );
    }

    // ── Usage ──────────────────────────────────────────────────

    fn make_usage(plan: Plan, webhooks_today: u64, endpoints_count: u32) -> Usage {
        Usage {
            customer_id: "test-customer".to_string(),
            plan,
            webhooks_today,
            api_calls_today: 0,
            endpoints_count,
            period_start: "2025-01-01".to_string(),
            period_end: "2025-01-31".to_string(),
        }
    }

    #[test]
    fn usage_webhook_limit_not_exceeded() {
        let usage = make_usage(Plan::Free, 5000, 2);
        assert!(!usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_webhook_limit_exceeded_at_boundary() {
        let usage = make_usage(Plan::Free, 10_000, 2);
        assert!(usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_webhook_limit_exceeded_over() {
        let usage = make_usage(Plan::Free, 15_000, 2);
        assert!(usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_not_exceeded() {
        let usage = make_usage(Plan::Free, 0, 3);
        assert!(!usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_exceeded_at_boundary() {
        let usage = make_usage(Plan::Free, 0, 5);
        assert!(usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_exceeded_over() {
        let usage = make_usage(Plan::Free, 0, 10);
        assert!(usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_remaining_webhooks_normal() {
        let usage = make_usage(Plan::Pro, 20_000, 0);
        assert_eq!(usage.remaining_webhooks(), 30_000);
    }

    #[test]
    fn usage_remaining_webhooks_saturates_at_zero() {
        let usage = make_usage(Plan::Free, 20_000, 0);
        assert_eq!(usage.remaining_webhooks(), 0);
    }

    #[test]
    fn usage_remaining_endpoints_normal() {
        let usage = make_usage(Plan::Pro, 0, 10);
        assert_eq!(usage.remaining_endpoints(), 40);
    }

    #[test]
    fn usage_remaining_endpoints_saturates_at_zero() {
        let usage = make_usage(Plan::Free, 0, 100);
        assert_eq!(usage.remaining_endpoints(), 0);
    }

    // ── SubscriptionStatus ─────────────────────────────────────

    #[test]
    fn subscription_status_serde() {
        let s = serde_json::to_string(&SubscriptionStatus::Active).unwrap();
        assert_eq!(s, "\"active\"");
        let s = serde_json::to_string(&SubscriptionStatus::Canceled).unwrap();
        assert_eq!(s, "\"canceled\"");
    }

    #[test]
    fn invoice_status_serde() {
        let s = serde_json::to_string(&InvoiceStatus::Paid).unwrap();
        assert_eq!(s, "\"paid\"");
        let s = serde_json::to_string(&InvoiceStatus::Draft).unwrap();
        assert_eq!(s, "\"draft\"");
    }

    // ── Plan serde ─────────────────────────────────────────────

    #[test]
    fn plan_serde_roundtrip() {
        for variant in &[Plan::Free, Plan::Pro, Plan::Business, Plan::Enterprise] {
            let json = serde_json::to_string(variant).unwrap();
            let deserialized: Plan = serde_json::from_str(&json).unwrap();
            assert_eq!(*variant, deserialized);
        }
    }

    #[test]
    fn plan_deserialize_from_json() {
        assert_eq!(
            serde_json::from_str::<Plan>("\"free\"").unwrap(),
            Plan::Free
        );
        assert_eq!(serde_json::from_str::<Plan>("\"pro\"").unwrap(), Plan::Pro);
        assert_eq!(
            serde_json::from_str::<Plan>("\"business\"").unwrap(),
            Plan::Business
        );
        assert_eq!(
            serde_json::from_str::<Plan>("\"enterprise\"").unwrap(),
            Plan::Enterprise
        );
    }
}
