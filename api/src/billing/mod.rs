// Item 288: BillingService abstraction layer.
//   Each provider (Stripe, Polar, Iyzico) has its own module with a unified
//   PaymentProviderImpl trait. BillingService wraps provider resolution so
//   route handlers don't need to match on provider names themselves.

pub mod billing_tests;
pub mod iyzico;
pub mod models;
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
            Plan::Enterprise => 14900, // $149/mo
        }
    }

    /// Monthly price in kuruş (TRY) — used for iyzico
    pub fn monthly_price_kurus(&self) -> i64 {
        match self {
            Plan::Developer => 0,
            Plan::Startup => 59900,   // ₺599.00
            Plan::Pro => 99900,       // ₺999.00
            Plan::Enterprise => 299900, // ₺2,999.00
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

    /// Cancel at period end — customer keeps access until billing period ends.
    pub async fn cancel_customer_subscription_at_period_end(
        &self,
        customer: &Customer,
    ) -> Result<(), AppError> {
        let (provider_name, subscription_id) =
            Self::resolve_subscription_ids(customer)?;

        if let Some(ref sub_id) = subscription_id {
            let provider_enum = provider::PaymentProvider::parse_str(&provider_name);
            match provider_enum {
                provider::PaymentProvider::Polar | provider::PaymentProvider::Iyzico => {
                    let provider_impl =
                        resolve_provider(&provider_name).ok_or_else(|| {
                            AppError::Internal(anyhow::anyhow!(
                                "Payment provider '{}' not configured",
                                provider_name
                            ))
                        })?;
                    provider_impl
                        .cancel_subscription_at_period_end(sub_id)
                        .await?;
                }
                provider::PaymentProvider::Stripe => {
                    // Stripe supports cancel_at_period_end via update
                    self.cancel_at_provider(&provider_name, sub_id).await?;
                }
            }
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

                // For Polar, use the HookSniff customer UUID as external_customer_id
                // (Polar's API expects the external system's ID, not Polar's internal customer ID)
                let portal_id = if provider_name == "polar" {
                    customer.id.to_string()
                } else {
                    customer_id.to_string()
                };

                let url = provider_impl
                    .create_customer_portal(&portal_id, base_url)
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

