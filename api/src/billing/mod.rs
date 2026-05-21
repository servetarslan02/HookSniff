// Item 288: BillingService abstraction layer.
//   Each provider (Stripe, Polar, Iyzico) has its own module with a unified
//   PaymentProviderImpl trait. BillingService wraps provider resolution so
//   route handlers don't need to match on provider names themselves.

pub mod iyzico;
pub mod polar;
pub mod provider;
pub mod refund;
pub mod stripe;

use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;

use serde::{Deserialize, Serialize};

/// Subscription plan definitions with limits
/// New plan structure: Developer ($0) / Startup ($29) / Pro ($49) / Enterprise (Custom)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Plan {
    /// Formerly "Free" — renamed to Developer but stored as "free" in DB
    #[serde(rename = "free", alias = "developer")]
    Developer,
    /// New plan — $29/mo
    Startup,
    /// $49/mo (was Pro at $49)
    Pro,
    /// Custom pricing (was Business)
    #[serde(alias = "business")]
    Enterprise,
}

impl Plan {
    pub fn parse_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "startup" => Plan::Startup,
            "pro" => Plan::Pro,
            // Backward compat: old "business" maps to Enterprise
            "enterprise" | "business" => Plan::Enterprise,
            // Backward compat: old "free" maps to Developer
            _ => Plan::Developer,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Plan::Developer => "free",
            Plan::Startup => "startup",
            Plan::Pro => "pro",
            Plan::Enterprise => "enterprise",
        }
    }

    /// Max applications per plan
    pub fn max_applications(&self) -> u32 {
        u32::MAX // unlimited — applications are just organizational groups
    }

    /// Max event types per plan
    pub fn max_event_types(&self) -> u32 {
        match self {
            Plan::Developer => 10,
            Plan::Startup => 50,
            Plan::Pro => u32::MAX,
            Plan::Enterprise => u32::MAX,
        }
    }

    /// Max team members per plan
    pub fn max_team_members(&self) -> u32 {
        match self {
            Plan::Developer => 1,
            Plan::Startup => 25,
            Plan::Pro => u32::MAX,
            Plan::Enterprise => u32::MAX,
        }
    }

    /// Max subscriptions per plan (webhook subscriptions / event routing rules)
    pub fn max_subscriptions(&self) -> u32 {
        match self {
            Plan::Developer => 10,
            Plan::Startup => 300,
            Plan::Pro => u32::MAX,
            Plan::Enterprise => u32::MAX,
        }
    }

    /// Max events per day
    pub fn max_events_per_day(&self) -> u64 {
        match self {
            Plan::Developer => 1_000,
            Plan::Startup => 30_000,
            Plan::Pro => 100_000,
            Plan::Enterprise => u64::MAX,
        }
    }

    /// Overage price per event in dollars (USD) — charged when daily limit exceeded
    pub fn overage_price_per_event(&self) -> f64 {
        match self {
            Plan::Developer => 0.0,     // blocked at limit
            Plan::Startup => 0.00003,   // $0.00003/event (0.003 cents)
            Plan::Pro => 0.000001,      // $0.000001/event (0.0001 cents)
            Plan::Enterprise => 0.0,    // custom
        }
    }

    /// Whether overage is allowed (never-blocked mode)
    pub fn allows_overage(&self) -> bool {
        match self {
            Plan::Developer => false, // blocked at limit
            Plan::Startup => true,
            Plan::Pro => true,
            Plan::Enterprise => true,
        }
    }

    /// Max webhook deliveries per day
    pub fn max_webhooks_per_day(&self) -> u64 {
        match self {
            Plan::Developer => 1_000,
            Plan::Startup => 30_000,
            Plan::Pro => 100_000,
            Plan::Enterprise => u64::MAX,
        }
    }

    /// Max API requests per minute
    pub fn max_requests_per_minute(&self) -> u32 {
        match self {
            Plan::Developer => 1_000,
            Plan::Startup => 1_000,
            Plan::Pro => 10_000,
            Plan::Enterprise => u32::MAX,
        }
    }

    /// Max endpoints (unlimited for all plans)
    pub fn max_endpoints(&self) -> u32 {
        u32::MAX
    }

    /// Max payload size in bytes
    pub fn max_payload_bytes(&self) -> usize {
        match self {
            Plan::Developer => 256 * 1024,          // 256 KB
            Plan::Startup => 1024 * 1024,           // 1 MB
            Plan::Pro => 5 * 1024 * 1024,           // 5 MB
            Plan::Enterprise => 10 * 1024 * 1024,   // 10 MB
        }
    }

    /// Retention days for delivery logs
    pub fn retention_days(&self) -> i64 {
        match self {
            Plan::Developer => 7,
            Plan::Startup => 14,
            Plan::Pro => 180,
            Plan::Enterprise => 365,
        }
    }

    /// Monthly price in cents (USD) — used for Stripe and Polar.sh
    pub fn monthly_price_cents(&self) -> u64 {
        match self {
            Plan::Developer => 0,
            Plan::Startup => 2900,    // $29/mo
            Plan::Pro => 4900,        // $49/mo
            Plan::Enterprise => 0,    // Custom pricing
        }
    }

    /// Monthly price in kuruş (TRY) — used for iyzico
    pub fn monthly_price_kurus(&self) -> i64 {
        match self {
            Plan::Developer => 0,
            Plan::Startup => 59900,   // ₺599.00
            Plan::Pro => 99900,       // ₺999.00
            Plan::Enterprise => 0,
        }
    }

    /// Annual price in cents (USD) — 20% discount vs monthly
    pub fn annual_price_cents(&self) -> u64 {
        (self.monthly_price_cents() * 12 * 80) / 100
    }

    /// Annual price in kuruş (TRY) — 20% discount vs monthly
    pub fn annual_price_kurus(&self) -> i64 {
        (self.monthly_price_kurus() * 12 * 80) / 100
    }

    /// Enterprise requires contact — no self-service checkout
    pub fn requires_contact(&self) -> bool {
        matches!(self, Plan::Enterprise)
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

// ──────────────────────────────────────────────────────────────
// Item 288: BillingService — unified billing abstraction
// ──────────────────────────────────────────────────────────────

/// Result of a checkout operation.
pub struct CheckoutOutcome {
    pub checkout_url: Option<String>,
    pub provider: String,
}

/// Result of a portal operation.
pub struct PortalOutcome {
    pub url: String,
    pub provider: String,
}

/// Unified billing service that routes operations to the correct payment provider.
///
/// Wraps provider resolution so route handlers don't need to match on provider
/// names themselves. Each method resolves the correct provider internally.
pub struct BillingService {
    cfg: Config,
}

impl BillingService {
    pub fn new(_pool: sqlx::PgPool, cfg: Config) -> Self {
        Self { cfg }
    }

    /// Create a checkout session for upgrading to a plan.
    ///
    /// If `provider_name` is None, uses the customer's existing payment provider.
    pub async fn checkout(
        &self,
        customer: &Customer,
        plan: &Plan,
        provider_name: Option<&str>,
        yearly: bool,
        discount_code: Option<&str>,
    ) -> Result<CheckoutOutcome, AppError> {
        let effective_provider = provider_name
            .unwrap_or(&customer.payment_provider);

        let provider_enum = provider::PaymentProvider::parse_str(effective_provider);

        match provider_enum {
            provider::PaymentProvider::Polar | provider::PaymentProvider::Iyzico => {
                let provider_impl =
                    resolve_provider(effective_provider).ok_or_else(|| {
                        AppError::Internal(anyhow::anyhow!(
                            "Payment provider '{}' not configured",
                            effective_provider
                        ))
                    })?;

                let base_url = self.cfg.app_url.as_deref().unwrap_or("http://localhost:3001");

                let result = provider_impl
                    .create_checkout(customer.id, &customer.email, plan, base_url, yearly, discount_code, customer.has_used_startup_trial)
                    .await?;

                Ok(CheckoutOutcome {
                    checkout_url: Some(result.checkout_url),
                    provider: effective_provider.to_string(),
                })
            }
            provider::PaymentProvider::Stripe => {
                let session = stripe::create_checkout_session(
                    &self.cfg,
                    customer.id,
                    &customer.email,
                    plan,
                )
                .await?;

                Ok(CheckoutOutcome {
                    checkout_url: session.url,
                    provider: "stripe".to_string(),
                })
            }
        }
    }

    /// Cancel a subscription at the payment provider.
    ///
    /// For Polar/iyzico, calls the provider's cancel_subscription API.
    /// For Stripe, cancels via the Stripe API.
    /// The `provider_subscription_id` is the provider-specific subscription ID.
    pub async fn cancel_at_provider(
        &self,
        provider_name: &str,
        provider_subscription_id: &str,
    ) -> Result<(), AppError> {
        let provider_enum = provider::PaymentProvider::parse_str(provider_name);

        match provider_enum {
            provider::PaymentProvider::Polar | provider::PaymentProvider::Iyzico => {
                let provider_impl =
                    resolve_provider(provider_name).ok_or_else(|| {
                        AppError::Internal(anyhow::anyhow!(
                            "Payment provider '{}' not configured",
                            provider_name
                        ))
                    })?;

                provider_impl
                    .cancel_subscription(provider_subscription_id)
                    .await?;
            }
            provider::PaymentProvider::Stripe => {
                stripe::cancel_subscription(&self.cfg, provider_subscription_id).await?;
            }
        }

        Ok(())
    }

    /// Cancel a customer's subscription, resolving the provider and subscription ID
    /// from the customer record automatically.
    pub async fn cancel_customer_subscription(
        &self,
        customer: &Customer,
    ) -> Result<(), AppError> {
        let (provider_name, subscription_id) =
            Self::resolve_subscription_ids(customer)?;

        if let Some(ref sub_id) = subscription_id {
            self.cancel_at_provider(&provider_name, sub_id).await?;
        }

        Ok(())
    }

    /// Open a customer portal for managing subscription.
    pub async fn portal(
        &self,
        customer: &Customer,
    ) -> Result<PortalOutcome, AppError> {
        let provider_name = &customer.payment_provider;
        let base_url = self.cfg.app_url.as_deref().unwrap_or("https://hooksniff.vercel.app");

        // If no payment provider configured, send them to billing page to upgrade
        if provider_name.is_empty() || provider_name == "none" {
            return Ok(PortalOutcome {
                url: format!("{}/dashboard/billing", base_url),
                provider: "none".to_string(),
            });
        }

        let provider_enum = provider::PaymentProvider::parse_str(provider_name);

        match provider_enum {
            provider::PaymentProvider::Polar | provider::PaymentProvider::Iyzico => {
                let provider_impl =
                    resolve_provider(provider_name).ok_or_else(|| {
                        AppError::Internal(anyhow::anyhow!(
                            "Payment provider '{}' not configured",
                            provider_name
                        ))
                    })?;

                let provider_customer_id = match provider_name.as_str() {
                    "polar" => customer.polar_customer_id.as_deref(),
                    "iyzico" => customer.iyzico_customer_id.as_deref(),
                    _ => None,
                };

                // If no customer ID from provider, fall back to billing page
                let customer_id = match provider_customer_id {
                    Some(id) if !id.is_empty() => id,
                    _ => {
                        tracing::warn!(
                            "No {} customer ID for customer {}, falling back to billing page",
                            provider_name, customer.id
                        );
                        return Ok(PortalOutcome {
                            url: format!("{}/dashboard/billing", base_url),
                            provider: provider_name.to_string(),
                        });
                    }
                };

                let url = provider_impl
                    .create_customer_portal(customer_id, base_url)
                    .await?;

                Ok(PortalOutcome {
                    url,
                    provider: provider_name.to_string(),
                })
            }
            provider::PaymentProvider::Stripe => {
                let stripe_customer_id = match customer.stripe_customer_id.as_ref() {
                    Some(id) if !id.is_empty() => id,
                    _ => {
                        return Ok(PortalOutcome {
                            url: format!("{}/account", base_url),
                            provider: "stripe".to_string(),
                        });
                    }
                };

                let url = stripe::create_customer_portal(&self.cfg, stripe_customer_id).await?;

                Ok(PortalOutcome {
                    url,
                    provider: "stripe".to_string(),
                })
            }
        }
    }

    /// Resolve the (provider_name, subscription_id) pair from a customer record.
    ///
    /// Returns (provider_name, Some(subscription_id)) if an active subscription exists,
    /// or (provider_name, None) if there is no subscription.
    fn resolve_subscription_ids(
        customer: &Customer,
    ) -> Result<(String, Option<String>), AppError> {
        let provider_name = &customer.payment_provider;

        let subscription_id = match provider_name.as_str() {
            "polar" => customer.polar_subscription_id.clone(),
            "iyzico" => customer.iyzico_subscription_id.clone(),
            _ => customer.stripe_subscription_id.clone(),
        };

        Ok((provider_name.clone(), subscription_id))
    }

    /// Get the subscription ID for a specific provider from the customer record.
    pub fn subscription_id_for_provider<'a>(
        customer: &'a Customer,
        provider_name: &str,
    ) -> Option<&'a str> {
        match provider_name {
            "polar" => customer.polar_subscription_id.as_deref(),
            "iyzico" => customer.iyzico_subscription_id.as_deref(),
            _ => customer.stripe_subscription_id.as_deref(),
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

#[cfg(test)]
mod tests {
    use super::*;

    // ── Plan::parse_str ────────────────────────────────────────

    #[test]
    fn parse_str_developer() {
        assert_eq!(Plan::parse_str("developer"), Plan::Developer);
        assert_eq!(Plan::parse_str("Developer"), Plan::Developer);
        assert_eq!(Plan::parse_str("DEVELOPER"), Plan::Developer);
        // Backward compat: old "free" maps to Developer
        assert_eq!(Plan::parse_str("free"), Plan::Developer);
        assert_eq!(Plan::parse_str("Free"), Plan::Developer);
    }

    #[test]
    fn parse_str_startup() {
        assert_eq!(Plan::parse_str("startup"), Plan::Startup);
        assert_eq!(Plan::parse_str("Startup"), Plan::Startup);
        assert_eq!(Plan::parse_str("STARTUP"), Plan::Startup);
    }

    #[test]
    fn parse_str_pro() {
        assert_eq!(Plan::parse_str("pro"), Plan::Pro);
        assert_eq!(Plan::parse_str("Pro"), Plan::Pro);
        assert_eq!(Plan::parse_str("PRO"), Plan::Pro);
    }

    #[test]
    fn parse_str_enterprise() {
        assert_eq!(Plan::parse_str("enterprise"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("Enterprise"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("ENTERPRISE"), Plan::Enterprise);
        // Backward compat: old "business" maps to Enterprise
        assert_eq!(Plan::parse_str("business"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("Business"), Plan::Enterprise);
    }

    #[test]
    fn parse_str_default_is_developer() {
        assert_eq!(Plan::parse_str(""), Plan::Developer);
        assert_eq!(Plan::parse_str("unknown"), Plan::Developer);
        assert_eq!(Plan::parse_str("random_string"), Plan::Developer);
    }

    // ── Plan::as_str ───────────────────────────────────────────

    #[test]
    fn as_str_all_variants() {
        assert_eq!(Plan::Developer.as_str(), "free");
        assert_eq!(Plan::Startup.as_str(), "startup");
        assert_eq!(Plan::Pro.as_str(), "pro");
        assert_eq!(Plan::Enterprise.as_str(), "enterprise");
    }

    // ── Roundtrip parse_str ↔ as_str ───────────────────────────

    #[test]
    fn parse_str_as_str_roundtrip() {
        for variant in &[Plan::Developer, Plan::Startup, Plan::Pro, Plan::Enterprise] {
            let s = variant.as_str();
            assert_eq!(Plan::parse_str(s), *variant);
        }
    }

    // ── max_applications ───────────────────────────────────────

    #[test]
    fn max_applications_all() {
        assert_eq!(Plan::Developer.max_applications(), u32::MAX);
        assert_eq!(Plan::Startup.max_applications(), u32::MAX);
        assert_eq!(Plan::Pro.max_applications(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_applications(), u32::MAX);
    }

    // ── max_event_types ────────────────────────────────────────

    #[test]
    fn max_event_types_all() {
        assert_eq!(Plan::Developer.max_event_types(), 10);
        assert_eq!(Plan::Startup.max_event_types(), 50);
        assert_eq!(Plan::Pro.max_event_types(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_event_types(), u32::MAX);
    }

    // ── max_team_members ───────────────────────────────────────

    #[test]
    fn max_team_members_all() {
        assert_eq!(Plan::Developer.max_team_members(), 1);
        assert_eq!(Plan::Startup.max_team_members(), 25);
        assert_eq!(Plan::Pro.max_team_members(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_team_members(), u32::MAX);
    }

    // ── max_subscriptions ──────────────────────────────────────

    #[test]
    fn max_subscriptions_all() {
        assert_eq!(Plan::Developer.max_subscriptions(), 10);
        assert_eq!(Plan::Startup.max_subscriptions(), 300);
        assert_eq!(Plan::Pro.max_subscriptions(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_subscriptions(), u32::MAX);
    }

    // ── max_events_per_day ─────────────────────────────────────

    #[test]
    fn max_events_per_day_all() {
        assert_eq!(Plan::Developer.max_events_per_day(), 1_000);
        assert_eq!(Plan::Startup.max_events_per_day(), 30_000);
        assert_eq!(Plan::Pro.max_events_per_day(), 100_000);
        assert_eq!(Plan::Enterprise.max_events_per_day(), u64::MAX);
    }

    // ── overage_price_per_event ──────────────────────────

    #[test]
    fn overage_price_all() {
        assert_eq!(Plan::Developer.overage_price_per_event(), 0.0);
        assert_eq!(Plan::Startup.overage_price_per_event(), 0.00003);
        assert_eq!(Plan::Pro.overage_price_per_event(), 0.000001);
        assert_eq!(Plan::Enterprise.overage_price_per_event(), 0.0);
    }

    // ── allows_overage ─────────────────────────────────────────

    #[test]
    fn allows_overage_all() {
        assert!(!Plan::Developer.allows_overage());
        assert!(Plan::Startup.allows_overage());
        assert!(Plan::Pro.allows_overage());
        assert!(Plan::Enterprise.allows_overage());
    }

    // ── max_webhooks_per_day ─────────────────────────────────

    #[test]
    fn max_webhooks_per_day_all() {
        assert_eq!(Plan::Developer.max_webhooks_per_day(), 1_000);
        assert_eq!(Plan::Startup.max_webhooks_per_day(), 30_000);
        assert_eq!(Plan::Pro.max_webhooks_per_day(), 100_000);
        assert_eq!(Plan::Enterprise.max_webhooks_per_day(), u64::MAX);
    }

    // ── max_requests_per_minute ────────────────────────────────

    #[test]
    fn max_requests_per_minute_all() {
        assert_eq!(Plan::Developer.max_requests_per_minute(), 1_000);
        assert_eq!(Plan::Startup.max_requests_per_minute(), 1_000);
        assert_eq!(Plan::Pro.max_requests_per_minute(), 10_000);
        assert_eq!(Plan::Enterprise.max_requests_per_minute(), u32::MAX);
    }

    // ── max_endpoints ──────────────────────────────────────────

    #[test]
    fn max_endpoints_all() {
        // All plans have unlimited endpoints
        assert_eq!(Plan::Developer.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Startup.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Pro.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_endpoints(), u32::MAX);
    }

    // ── max_payload_bytes ──────────────────────────────────────

    #[test]
    fn max_payload_bytes_all() {
        assert_eq!(Plan::Developer.max_payload_bytes(), 256 * 1024);
        assert_eq!(Plan::Startup.max_payload_bytes(), 1024 * 1024);
        assert_eq!(Plan::Pro.max_payload_bytes(), 5 * 1024 * 1024);
        assert_eq!(Plan::Enterprise.max_payload_bytes(), 10 * 1024 * 1024);
    }

    // ── retention_days ─────────────────────────────────────────

    #[test]
    fn retention_days_all() {
        assert_eq!(Plan::Developer.retention_days(), 7);
        assert_eq!(Plan::Startup.retention_days(), 14);
        assert_eq!(Plan::Pro.retention_days(), 180);
        assert_eq!(Plan::Enterprise.retention_days(), 365);
    }

    // ── monthly_price_cents ────────────────────────────────────

    #[test]
    fn monthly_price_cents_all() {
        assert_eq!(Plan::Developer.monthly_price_cents(), 0);
        assert_eq!(Plan::Startup.monthly_price_cents(), 2900);
        assert_eq!(Plan::Pro.monthly_price_cents(), 4900);
        assert_eq!(Plan::Enterprise.monthly_price_cents(), 0);
    }

    // ── monthly_price_kurus ────────────────────────────────────

    #[test]
    fn monthly_price_kurus_all() {
        assert_eq!(Plan::Developer.monthly_price_kurus(), 0);
        assert_eq!(Plan::Startup.monthly_price_kurus(), 59900);
        assert_eq!(Plan::Pro.monthly_price_kurus(), 99900);
        assert_eq!(Plan::Enterprise.monthly_price_kurus(), 0);
    }

    // ── annual_price_cents ────────────────────────────────────

    #[test]
    fn annual_price_cents_all() {
        // Startup: $29/mo * 12 * 0.80 = $278.40 → 27840 cents
        assert_eq!(Plan::Startup.annual_price_cents(), 27840);
        // Pro: $49/mo * 12 * 0.80 = $470.40 → 47040 cents
        assert_eq!(Plan::Pro.annual_price_cents(), 47040);
        assert_eq!(Plan::Developer.annual_price_cents(), 0);
        assert_eq!(Plan::Enterprise.annual_price_cents(), 0);
    }

    // ── annual_price_kurus ────────────────────────────────────

    #[test]
    fn annual_price_kurus_all() {
        // Startup: ₺599/mo * 12 * 0.80 = ₺5,750.40 → 575040 kuruş
        assert_eq!(Plan::Startup.annual_price_kurus(), 575040);
        // Pro: ₺999/mo * 12 * 0.80 = ₺9,590.40 → 959040 kuruş
        assert_eq!(Plan::Pro.annual_price_kurus(), 959040);
        assert_eq!(Plan::Developer.annual_price_kurus(), 0);
        assert_eq!(Plan::Enterprise.annual_price_kurus(), 0);
    }

    // ── requires_contact ──────────────────────────────────────

    #[test]
    fn requires_contact_enterprise_only() {
        assert!(!Plan::Developer.requires_contact());
        assert!(!Plan::Startup.requires_contact());
        assert!(!Plan::Pro.requires_contact());
        assert!(Plan::Enterprise.requires_contact());
    }

    // ── Plan ordering (higher tiers have higher limits) ────────

    #[test]
    fn higher_tiers_have_higher_limits() {
        // Developer and Startup share 1000 req/min, Pro is higher
        assert!(Plan::Startup.max_requests_per_minute() <= Plan::Pro.max_requests_per_minute());
        assert!(Plan::Pro.max_requests_per_minute() < Plan::Enterprise.max_requests_per_minute());

        // All plans have unlimited endpoints now
        assert_eq!(Plan::Developer.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_endpoints(), u32::MAX);

        assert!(Plan::Developer.max_webhooks_per_day() < Plan::Startup.max_webhooks_per_day());
        assert!(Plan::Startup.max_webhooks_per_day() < Plan::Pro.max_webhooks_per_day());
        assert!(Plan::Pro.max_webhooks_per_day() < Plan::Enterprise.max_webhooks_per_day());
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
        let usage = make_usage(Plan::Developer, 500, 2);
        assert!(!usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_webhook_limit_exceeded_at_boundary() {
        let usage = make_usage(Plan::Developer, 1_000, 2);
        assert!(usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_webhook_limit_exceeded_over() {
        let usage = make_usage(Plan::Developer, 1_500, 2);
        assert!(usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_not_exceeded() {
        // All plans have unlimited endpoints (u32::MAX)
        let usage = make_usage(Plan::Developer, 0, 3);
        assert!(!usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_always_unlimited() {
        // Even with many endpoints, limit is never exceeded (u32::MAX)
        let usage = make_usage(Plan::Developer, 0, 1000);
        assert!(!usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_remaining_webhooks_normal() {
        let usage = make_usage(Plan::Pro, 20_000, 0);
        assert_eq!(usage.remaining_webhooks(), 80_000);
    }

    #[test]
    fn usage_remaining_webhooks_saturates_at_zero() {
        let usage = make_usage(Plan::Developer, 20_000, 0);
        assert_eq!(usage.remaining_webhooks(), 0);
    }

    #[test]
    fn usage_remaining_endpoints_normal() {
        // All plans have u32::MAX endpoints
        let usage = make_usage(Plan::Pro, 0, 10);
        assert_eq!(usage.remaining_endpoints(), u32::MAX - 10);
    }

    #[test]
    fn usage_remaining_endpoints_saturates_at_zero() {
        // Can't exceed u32::MAX endpoints, so this would need u32::MAX+1 endpoints
        // which isn't possible with u32 type. Test with high value instead.
        let usage = make_usage(Plan::Developer, 0, u32::MAX);
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
        let s = serde_json::to_string(&InvoiceStatus::Refunded).unwrap();
        assert_eq!(s, "\"refunded\"");
    }

    // ── Plan serde ─────────────────────────────────────────────

    #[test]
    fn plan_serde_roundtrip() {
        for variant in &[Plan::Developer, Plan::Startup, Plan::Pro, Plan::Enterprise] {
            let json = serde_json::to_string(variant).unwrap();
            let deserialized: Plan = serde_json::from_str(&json).unwrap();
            assert_eq!(*variant, deserialized);
        }
    }

    #[test]
    fn plan_deserialize_from_json() {
        assert_eq!(
            serde_json::from_str::<Plan>("\"developer\"").unwrap(),
            Plan::Developer
        );
        assert_eq!(
            serde_json::from_str::<Plan>("\"startup\"").unwrap(),
            Plan::Startup
        );
        assert_eq!(serde_json::from_str::<Plan>("\"pro\"").unwrap(), Plan::Pro);
        assert_eq!(
            serde_json::from_str::<Plan>("\"enterprise\"").unwrap(),
            Plan::Enterprise
        );
        // Backward compat
        assert_eq!(
            serde_json::from_str::<Plan>("\"free\"").unwrap(),
            Plan::Developer
        );
        assert_eq!(
            serde_json::from_str::<Plan>("\"business\"").unwrap(),
            Plan::Enterprise
        );
    }
}
