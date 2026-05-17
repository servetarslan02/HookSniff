use axum::extract::Extension;
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{Datelike, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::billing::provider::PaymentProviderImpl;
use crate::billing::stripe;
use crate::billing::{BillingService, Plan};
use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;


/// Grace period in days after a failed payment before downgrade.
const GRACE_PERIOD_DAYS: i64 = 7;

/// Item 259: Allowed checkout URL domains for server-side validation.
const ALLOWED_CHECKOUT_DOMAINS: &[&str] = &[
    "checkout.stripe.com",
    "polar.sh",
    "sandbox-api.polar.sh",
    "checkout.polar.sh",
    "iyzico.com",
    "sandbox-iyzico.com",
    "secure.iyzipay.com",
];

/// Item 259: Validate a checkout URL server-side before returning it to the client.
///
/// Checks that the URL:
/// - Is a valid HTTPS URL (or HTTP for localhost dev)
/// - Matches an allowed payment provider domain
fn validate_checkout_url(url: &str) -> Result<(), AppError> {
    let parsed = url::Url::parse(url).map_err(|_| {
        AppError::BadRequest("Invalid checkout URL format".into())
    })?;

    // Require HTTPS (except localhost for dev)
    let host = parsed.host_str().unwrap_or("");
    let is_localhost = host == "localhost" || host == "127.0.0.1" || host == "::1";
    if parsed.scheme() != "https" && !is_localhost {
        return Err(AppError::BadRequest(
            "Checkout URL must use HTTPS".into(),
        ));
    }

    // Validate domain matches a known payment provider
    if !is_localhost {
        let domain_allowed = ALLOWED_CHECKOUT_DOMAINS.iter().any(|domain| {
            host == *domain || host.ends_with(&format!(".{}", domain))
        });
        if !domain_allowed {
            tracing::warn!("Checkout URL domain not in allowlist: {}", host);
            return Err(AppError::BadRequest(
                "Checkout URL domain not allowed".into(),
            ));
        }
    }

    Ok(())
}


mod subscription;
mod portal;
mod webhooks;
mod grace;

pub use grace::process_expired_grace_periods;

pub fn router() -> Router {
    Router::new()
        .route(
            "/subscription",
            get(get_subscription).delete(cancel_subscription),
        )
        .route("/upgrade", post(upgrade_plan))
        .route("/portal", post(open_portal))
        .route("/usage", get(get_usage))
        .route("/invoices", get(get_invoices))
        .route("/refund", post(request_refund))
        .route("/settings", get(get_overage_settings).put(update_overage_settings))
        .route("/webhook", post(handle_stripe_webhook))
        .route("/webhook/polar", post(handle_polar_webhook))
        .route("/webhook/iyzico", post(handle_iyzico_webhook))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/subscription — Current plan
// ──────────────────────────────────────────────────────────────

#[derive(Serialize, Debug)]
struct SubscriptionResponse {
    plan: String,
    status: String,
    payment_provider: String,
    stripe_subscription_id: Option<String>,
    polar_subscription_id: Option<String>,
    iyzico_subscription_id: Option<String>,
    webhook_limit: u64,
    endpoint_limit: u32,
    retention_days: i64,
    monthly_price_cents: u64,
    monthly_price_kurus: i64,
    /// Whether the subscription will cancel at the end of the current billing period.
    cancel_at_period_end: bool,
    /// Billing period: "monthly" or "annual"
    billing_period: String,
    /// Current period end date (ISO 8601)
    current_period_end: Option<String>,
    /// Card last 4 digits
    card_last4: Option<String>,
    /// Card brand (visa, mastercard, amex, etc.)
    card_brand: Option<String>,
    /// Card expiry month (1-12)
    card_exp_month: Option<i16>,
    /// Card expiry year (e.g. 2027)
    card_exp_year: Option<i16>,
}
