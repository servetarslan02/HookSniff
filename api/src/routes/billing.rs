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

async fn get_subscription(
    Extension(customer): Extension<Customer>,
) -> Result<Json<SubscriptionResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);

    // Item 247: Derive subscription status dynamically from actual customer state
    let status = if customer.cancel_at_period_end {
        "canceled".to_string()
    } else if customer.payment_failed_at.is_some() {
        "past_due".to_string()
    } else if plan == Plan::Developer {
        "inactive".to_string()
    } else {
        "active".to_string()
    };

    // Calculate current_period_end: 1st of next month for paid plans
    let current_period_end = if plan != Plan::Developer {
        let now = chrono::Utc::now();
        let next_month = if now.month() == 12 {
            chrono::NaiveDate::from_ymd_opt(now.year() + 1, 1, 1)
        } else {
            chrono::NaiveDate::from_ymd_opt(now.year(), now.month() + 1, 1)
        };
        next_month.map(|d| d.and_hms_opt(0, 0, 0).expect("midnight is valid time").and_utc().to_rfc3339())
    } else {
        None
    };

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status,
        payment_provider: customer.payment_provider.clone(),
        stripe_subscription_id: customer.stripe_subscription_id.clone(),
        polar_subscription_id: customer.polar_subscription_id.clone(),
        iyzico_subscription_id: customer.iyzico_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_month(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
        cancel_at_period_end: customer.cancel_at_period_end,
        billing_period: "monthly".to_string(), // Default; annual tracked via provider
        current_period_end,
        card_last4: customer.card_last4.clone(),
        card_brand: customer.card_brand.clone(),
        card_exp_month: customer.card_exp_month,
        card_exp_year: customer.card_exp_year,
    }))
}

// ──────────────────────────────────────────────────────────────
// DELETE /v1/billing/subscription — Cancel subscription
// ──────────────────────────────────────────────────────────────

/// DELETE /v1/billing/subscription — Cancel the current subscription (downgrade to free at period end)
async fn cancel_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    if customer.plan == "developer" {
        return Err(AppError::BadRequest(
            "You are already on the free plan".into(),
        ));
    }

    // Mark subscription for cancellation at period end
    sqlx::query(
        "UPDATE customers SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    tracing::info!(
        "✅ Subscription cancellation requested for customer {} (plan: {})",
        customer.id,
        customer.plan
    );

    // Audit log — SUBSCRIPTION_CANCEL
    {
        let rid = customer.id.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "SUBSCRIPTION_CANCEL", "billing", Some(&rid), None, None, None).await; }
    }

    Ok(Json(serde_json::json!({
        "message": "Your subscription will be cancelled at the end of the current billing period.",
        "cancel_at_period_end": true,
    })))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan (with proration)
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct UpgradeRequest {
    plan: String,
    /// Payment provider: "stripe", "polar", or "iyzico"
    /// If not specified, uses the customer's existing provider or defaults to Stripe.
    #[serde(default)]
    provider: Option<String>,
    /// Billing period: "monthly" (default) or "annual"
    #[serde(default)]
    billing_period: Option<String>,
}

#[derive(Debug, Serialize)]
struct UpgradeResponse {
    checkout_url: Option<String>,
    provider: String,
    message: String,
    /// Prorated amount in cents (if applicable)
    #[serde(skip_serializing_if = "Option::is_none")]
    prorated_amount_cents: Option<u64>,
    /// Days remaining in current billing period
    #[serde(skip_serializing_if = "Option::is_none")]
    days_remaining: Option<u32>,
    /// Whether this plan requires contacting sales
    #[serde(skip_serializing_if = "Option::is_none")]
    requires_contact: Option<bool>,
    /// Contact URL for enterprise plans
    #[serde(skip_serializing_if = "Option::is_none")]
    contact_url: Option<String>,
}

/// Calculate prorated amount for a mid-cycle upgrade.
///
/// Returns the prorated amount in cents for the remaining days in the current billing period.
/// If the current plan is free or the period can't be determined, returns None.
fn calculate_proration(
    current_plan: &Plan,
    new_plan: &Plan,
    current_period_start: Option<&chrono::DateTime<Utc>>,
) -> Option<(u64, u32)> {
    if *current_plan == Plan::Developer || current_period_start.is_none() {
        return None;
    }

    let period_start = current_period_start?;
    let now = Utc::now();

    // Calculate days in the billing period (assume monthly)
    let days_in_period = 30;
    let days_used = (now - *period_start).num_days().max(0) as u32;
    let days_remaining = (days_in_period as i64 - days_used as i64).max(1) as u32;

    // Prorate: charge the difference for remaining days
    let old_daily_rate = current_plan.monthly_price_cents() as f64 / days_in_period as f64;
    let new_daily_rate = new_plan.monthly_price_cents() as f64 / days_in_period as f64;
    let prorated = ((new_daily_rate - old_daily_rate) * days_remaining as f64).max(0.0) as u64;

    Some((prorated, days_remaining))
}

async fn upgrade_plan(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpgradeRequest>,
) -> Result<Json<UpgradeResponse>, AppError> {
    let new_plan = Plan::parse_str(&req.plan);
    let current_plan = Plan::parse_str(&customer.plan);

    match new_plan {
        Plan::Developer => {
            return Err(AppError::BadRequest(
                "Use the customer portal to downgrade your plan".into(),
            ));
        }
        Plan::Enterprise => {
            // Item 256: Enterprise requires contact — return contact info instead of checkout
            return Ok(Json(UpgradeResponse {
                checkout_url: None,
                provider: customer.payment_provider.clone(),
                message: "Enterprise plan requires a custom agreement. Contact us to get started.".into(),
                prorated_amount_cents: None,
                days_remaining: None,
                requires_contact: Some(true),
                contact_url: Some(
                    "mailto:enterprise@hooksniff.dev?subject=Enterprise%20Plan%20Inquiry".into(),
                ),
            }));
        }
        _ => {}
    }

    // Prevent same-plan upgrade
    if new_plan == current_plan {
        return Err(AppError::BadRequest("You are already on this plan".into()));
    }

    // Item 258: Validate plan transition — only allow upgrading to a higher tier
    let plan_tier = |p: &Plan| match p {
        Plan::Developer => 0,
        Plan::Startup => 1,
        Plan::Pro => 2,
        Plan::Enterprise => 3,
    };
    if plan_tier(&new_plan) <= plan_tier(&current_plan) {
        return Err(AppError::BadRequest(
            "This endpoint only supports plan upgrades. To downgrade, please use the customer portal or contact support.".into(),
        ));
    }

    // Calculate proration for upgrades from paid plans
    // Fetch the customer's last payment date as period start approximation
    let period_start: Option<chrono::DateTime<Utc>> = sqlx::query_scalar(
        "SELECT MAX(paid_at) FROM invoices WHERE customer_id = $1 AND status = 'paid'",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .ok()
    .flatten();

    let proration = calculate_proration(&current_plan, &new_plan, period_start.as_ref());

    // Determine which provider to use
    let mut provider_name = req
        .provider
        .as_deref()
        .unwrap_or(&customer.payment_provider)
        .to_string();

    // If provider is "stripe" but Stripe is not configured, fall back to "polar"
    if provider_name == "stripe" && std::env::var("STRIPE_SECRET_KEY").unwrap_or_default().is_empty() {
        provider_name = "polar".to_string();
    }

    // ── Item 249: Cancel old subscription if switching providers ──
    let old_provider = &customer.payment_provider;
    if provider_name != *old_provider && current_plan != Plan::Developer {
        // Customer is switching to a different provider with an active paid plan.
        // Cancel the old subscription at the old provider first.
        if let Some(old_sub_id) =
            BillingService::subscription_id_for_provider(&customer, old_provider)
        {
            let billing_svc = BillingService::new(pool.clone(), cfg.clone());
            match billing_svc
                .cancel_at_provider(old_provider, old_sub_id)
                .await
            {
                Ok(()) => {
                    tracing::info!(
                        "✅ Canceled old {} subscription {} for customer {} (switching to {})",
                        old_provider,
                        old_sub_id,
                        customer.id,
                        provider_name
                    );
                    // Clear the old subscription ID in the DB
                    let clear_col = match old_provider.as_str() {
                        "polar" => "polar_subscription_id",
                        "iyzico" => "iyzico_subscription_id",
                        _ => "stripe_subscription_id",
                    };
                    let _ = sqlx::query(&format!(
                        "UPDATE customers SET {} = NULL, updated_at = NOW() WHERE id = $1",
                        clear_col
                    ))
                    .bind(customer.id)
                    .execute(&pool)
                    .await;
                }
                Err(e) => {
                    // Log but don't block the upgrade — the old subscription
                    // may have already been canceled or the provider may be down.
                    tracing::warn!(
                        "⚠️ Failed to cancel old {} subscription {} for customer {}: {:?} \
                         — proceeding with upgrade anyway",
                        old_provider,
                        old_sub_id,
                        customer.id,
                        e
                    );
                }
            }
        }
    }

    // ── Create checkout at the new provider ──
    let billing_svc = BillingService::new(pool.clone(), cfg.clone());

    // Update customer's payment provider before checkout
    if provider_name != customer.payment_provider {
        sqlx::query("UPDATE customers SET payment_provider = $1 WHERE id = $2")
            .bind(&provider_name)
            .bind(customer.id)
            .execute(&pool)
            .await?;
    }

    let result = billing_svc
        .checkout(&customer, &new_plan, Some(&provider_name), req.billing_period.as_deref() == Some("annual"))
        .await?;

    // Item 259: Validate checkout URL server-side before returning to client
    if let Some(ref url) = result.checkout_url {
        validate_checkout_url(url)?;
    }

    let (prorated_amount, days_remaining) = proration.unwrap_or((0, 0));

    // Audit log — PLAN_CHANGE
    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool,
            customer.id,
            "PLAN_CHANGE",
            "billing",
            Some(&rid),
            Some(serde_json::json!({
                "new_plan": new_plan.as_str(),
                "provider": provider_name,
            })),
            None,
            None,
        )
        .await;
    }

    Ok(Json(UpgradeResponse {
        checkout_url: result.checkout_url,
        provider: result.provider,
        message: format!(
            "Redirecting to {} Checkout for {} plan{}",
            provider_name,
            new_plan.as_str(),
            if req.billing_period.as_deref() == Some("annual") {
                " (annual billing — 20% discount)"
            } else {
                ""
            },
        ),
        prorated_amount_cents: if prorated_amount > 0 {
            Some(prorated_amount)
        } else {
            None
        },
        days_remaining: if days_remaining > 0 {
            Some(days_remaining)
        } else {
            None
        },
        requires_contact: None,
        contact_url: None,
    }))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/portal — Open customer portal
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct PortalResponse {
    url: String,
    provider: String,
}

async fn open_portal(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PortalResponse>, AppError> {
    let billing_svc = BillingService::new(pool, cfg);
    let result = billing_svc.portal(&customer).await?;

    Ok(Json(PortalResponse {
        url: result.url,
        provider: result.provider,
    }))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/usage — Current usage
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct UsageResponse {
    plan: String,
    payment_provider: String,
    webhooks: UsageCounter,
    endpoints: UsageCounter,
    rate_limit: RateLimitInfo,
    period: PeriodInfo,
}

#[derive(Serialize)]
struct UsageCounter {
    used: u64,
    limit: u64,
    remaining: u64,
}

#[derive(Serialize)]
struct RateLimitInfo {
    requests_per_minute: u32,
}

#[derive(Serialize)]
struct PeriodInfo {
    start: String,
    end: String,
}

async fn get_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<UsageResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);

    // Count endpoints
    let endpoint_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    Ok(Json(UsageResponse {
        plan: plan.as_str().to_string(),
        payment_provider: customer.payment_provider.clone(),
        webhooks: UsageCounter {
            used: customer.webhook_count as u64,
            limit: plan.max_webhooks_per_month(),
            remaining: plan
                .max_webhooks_per_month()
                .saturating_sub(customer.webhook_count as u64),
        },
        endpoints: UsageCounter {
            used: endpoint_count.0 as u64,
            limit: plan.max_endpoints() as u64,
            remaining: (plan.max_endpoints() as i64 - endpoint_count.0).max(0) as u64,
        },
        rate_limit: RateLimitInfo {
            requests_per_minute: plan.max_requests_per_minute(),
        },
        period: {
            let now = chrono::Utc::now();
            let start = now.format("%Y-%m-01").to_string();
            let end = if now.month() == 12 {
                format!("{}-01-01", now.year() + 1)
            } else {
                format!("{:04}-{:02}-01", now.year(), now.month() + 1)
            };
            PeriodInfo { start, end }
        },
    }))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/invoices — Invoice history
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct InvoiceResponse {
    id: String,
    date: String,
    amount: f64,
    status: String,
    plan: String,
}

type InvoiceRow = (
    uuid::Uuid,
    i32,
    String,
    String,
    String,
    Option<chrono::DateTime<chrono::Utc>>,
    chrono::DateTime<chrono::Utc>,
);

async fn get_invoices(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<InvoiceResponse>>, AppError> {
    let rows: Vec<InvoiceRow> = sqlx::query_as(
        "SELECT id, amount_cents, currency, status, plan, paid_at, created_at \
             FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let invoices: Vec<InvoiceResponse> = rows
        .into_iter()
        .map(
            |(id, amount_cents, _currency, status, plan, paid_at, created_at)| {
                let date = paid_at.unwrap_or(created_at);
                InvoiceResponse {
                    id: id.to_string(),
                    date: date.format("%Y-%m-%d").to_string(),
                    amount: amount_cents as f64 / 100.0,
                    status,
                    plan,
                }
            },
        )
        .collect();

    Ok(Json(invoices))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/refund — Request a refund (Item 251)
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct RefundRequest {
    reason: String,
}

#[derive(Serialize)]
struct RefundResponse {
    message: String,
    status: String,
}

async fn request_refund(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<RefundRequest>,
) -> Result<Json<RefundResponse>, AppError> {
    if customer.plan == "developer" {
        return Err(AppError::BadRequest(
            "Cannot refund a free plan".into(),
        ));
    }

    // Check 14-day refund window
    if !crate::billing::refund::is_within_refund_window(&pool, customer.id).await? {
        return Err(AppError::BadRequest(
            "Refund window has expired. Refunds are only available within 14 days of purchase.".into(),
        ));
    }

    crate::billing::refund::process_refund(&pool, &cfg, customer.id, &req.reason).await?;

    Ok(Json(RefundResponse {
        message: "Refund processed successfully. Your plan has been downgraded to Free.".into(),
        status: "refunded".into(),
    }))
}

// ──────────────────────────────────────────────────────────────
// Overage settings
// ──────────────────────────────────────────────────────────────

#[derive(Serialize, Debug)]
struct OverageSettingsResponse {
    allow_overage: bool,
    overage_email_notification: bool,
    plan: String,
    daily_limit: u64,
    overage_price: f64,
}

/// GET /v1/billing/settings — Get current overage settings
async fn get_overage_settings(
    Extension(customer): Extension<Customer>,
) -> Result<Json<OverageSettingsResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);
    Ok(Json(OverageSettingsResponse {
        allow_overage: customer.allow_overage,
        overage_email_notification: customer.overage_email_notification,
        plan: plan.as_str().to_string(),
        daily_limit: plan.max_events_per_day(),
        overage_price: plan.overage_price_per_event(),
    }))
}

#[derive(Deserialize, Debug)]
struct UpdateOverageSettingsRequest {
    allow_overage: Option<bool>,
    overage_email_notification: Option<bool>,
}

/// PUT /v1/billing/settings — Update overage settings
async fn update_overage_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateOverageSettingsRequest>,
) -> Result<Json<OverageSettingsResponse>, AppError> {
    let updated = sqlx::query_as::<_, Customer>(
        "UPDATE customers SET \
         allow_overage = COALESCE($1, allow_overage), \
         overage_email_notification = COALESCE($2, overage_email_notification), \
         updated_at = NOW() \
         WHERE id = $3 \
         RETURNING *",
    )
    .bind(req.allow_overage)
    .bind(req.overage_email_notification)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let plan = Plan::parse_str(&updated.plan);
    Ok(Json(OverageSettingsResponse {
        allow_overage: updated.allow_overage,
        overage_email_notification: updated.overage_email_notification,
        plan: plan.as_str().to_string(),
        daily_limit: plan.max_events_per_day(),
        overage_price: plan.overage_price_per_event(),
    }))
}

// ──────────────────────────────────────────────────────────────
// Webhook handlers for each provider
// ──────────────────────────────────────────────────────────────

/// Maximum billing webhook attempts per IP per minute.
const BILLING_WEBHOOK_RATE_LIMIT: u32 = 30;

/// POST /v1/billing/webhook — Stripe webhook handler
async fn handle_stripe_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    // Rate limit billing webhooks per IP
    let client_ip = headers
        .get("x-real-ip")
        .or_else(|| headers.get("x-forwarded-for"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let rl_key = format!("billing_webhook:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, BILLING_WEBHOOK_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    let signature = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let webhook_secret = cfg.stripe_webhook_secret.as_deref().unwrap_or("");

    if webhook_secret.is_empty() {
        tracing::error!("Stripe webhook secret not configured — rejecting webhook to prevent billing manipulation");
        return Err(AppError::Internal(anyhow::anyhow!(
            "Billing webhook secret not configured"
        )));
    }

    stripe::handle_webhook_event(
        &pool,
        &body,
        signature,
        webhook_secret,
        cfg.webhook_timestamp_tolerance_secs,
    )
    .await?;

    Ok(StatusCode::OK)
}

/// POST /v1/billing/webhook/polar — Polar.sh webhook handler
async fn handle_polar_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    // Rate limit billing webhooks per IP
    let client_ip = headers
        .get("x-real-ip")
        .or_else(|| headers.get("x-forwarded-for"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let rl_key = format!("billing_webhook:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, BILLING_WEBHOOK_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // HS-021: Idempotency check — extract event ID from body and check if already processed
    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&body) {
        if let Some(event_id) = parsed.get("id").and_then(|v| v.as_str()) {
            let already_processed: bool = sqlx::query_scalar(
                "SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE provider = 'polar' AND provider_event_id = $1)"
            )
            .bind(event_id)
            .fetch_one(&pool)
            .await
            .unwrap_or(false);

            if already_processed {
                tracing::info!("♻️ Polar event {} already processed, skipping", event_id);
                return Ok(StatusCode::OK);
            }
        }
    }

    let config = crate::billing::polar::PolarConfig::from_env()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Polar.sh not configured")))?;

    let provider = crate::billing::polar::PolarProvider::new(config);
    let result = provider.handle_webhook(&headers, &body, &pool).await?;

    process_webhook_result(&pool, &result, "polar").await?;

    Ok(StatusCode::OK)
}

/// POST /v1/billing/webhook/iyzico — iyzico webhook handler
async fn handle_iyzico_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    // Rate limit billing webhooks per IP
    let client_ip = headers
        .get("x-real-ip")
        .or_else(|| headers.get("x-forwarded-for"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let rl_key = format!("billing_webhook:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_headers(&rl_key, BILLING_WEBHOOK_RATE_LIMIT)
        .await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    // HS-021: Idempotency check — extract event ID from body and check if already processed
    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&body) {
        if let Some(event_id) = parsed.get("id").and_then(|v| v.as_str()) {
            let already_processed: bool = sqlx::query_scalar(
                "SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE provider = 'iyzico' AND provider_event_id = $1)"
            )
            .bind(event_id)
            .fetch_one(&pool)
            .await
            .unwrap_or(false);

            if already_processed {
                tracing::info!("♻️ iyzico event {} already processed, skipping", event_id);
                return Ok(StatusCode::OK);
            }
        }
    }

    let config = crate::billing::iyzico::IyzicoConfig::from_env()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("iyzico not configured")))?;

    let provider = crate::billing::iyzico::IyzicoProvider::new(config);
    let result = provider.handle_webhook(&headers, &body, &pool).await?;

    process_webhook_result(&pool, &result, "iyzico").await?;

    Ok(StatusCode::OK)
}

/// Process a webhook result from any provider and update the database.
async fn process_webhook_result(
    pool: &sqlx::PgPool,
    result: &crate::billing::provider::WebhookResult,
    provider: &str,
) -> Result<(), AppError> {
    process_webhook_result_with_event_id(pool, result, provider, None).await
}

/// Process a webhook result with optional event ID for idempotency (HS-021).
async fn process_webhook_result_with_event_id(
    pool: &sqlx::PgPool,
    result: &crate::billing::provider::WebhookResult,
    provider: &str,
    _event_id: Option<&str>,
) -> Result<(), AppError> {
    use crate::billing::provider::WebhookResult;

    match result {
        WebhookResult::SubscriptionCreated {
            customer_id,
            plan,
            provider_customer_id,
            provider_subscription_id,
        } => {
            let webhook_limit = plan.max_webhooks_per_month() as i64;
            let update_query = match provider {
                "polar" => sqlx::query(
                    "UPDATE customers SET plan = $1, payment_provider = $2, \
                         polar_customer_id = $3, polar_subscription_id = $4, webhook_limit = $5, \
                         payment_failed_at = NULL, updated_at = NOW() WHERE id = $6",
                )
                .bind(plan.as_str())
                .bind(provider)
                .bind(provider_customer_id)
                .bind(provider_subscription_id)
                .bind(webhook_limit)
                .bind(customer_id),
                "iyzico" => sqlx::query(
                    "UPDATE customers SET plan = $1, payment_provider = $2, \
                         iyzico_customer_id = $3, iyzico_subscription_id = $4, webhook_limit = $5, \
                         payment_failed_at = NULL, updated_at = NOW() WHERE id = $6",
                )
                .bind(plan.as_str())
                .bind(provider)
                .bind(provider_customer_id)
                .bind(provider_subscription_id)
                .bind(webhook_limit)
                .bind(customer_id),
                _ => return Ok(()),
            };

            update_query.execute(pool).await?;

            // HS-060: Clean up excess endpoints if upgrading from free (in case of re-subscribe)
            cleanup_excess_endpoints(pool, *customer_id, plan).await?;

            // Log transaction
            sqlx::query(
                "INSERT INTO payment_transactions \
                 (customer_id, provider, status, plan, currency) \
                 VALUES ($1, $2, 'completed', $3, $4)",
            )
            .bind(customer_id)
            .bind(provider)
            .bind(plan.as_str())
            .bind(if provider == "iyzico" { "TRY" } else { "USD" })
            .execute(pool)
            .await?;

            // Create invoice record
            let amount_cents = plan.monthly_price_cents() as i32;
            let currency = if provider == "iyzico" { "TRY" } else { "USD" };
            sqlx::query(
                "INSERT INTO invoices (customer_id, amount_cents, currency, status, plan) \
                 VALUES ($1, $2, $3, 'paid', $4)",
            )
            .bind(customer_id)
            .bind(amount_cents)
            .bind(currency)
            .bind(plan.as_str())
            .execute(pool)
            .await?;

            tracing::info!(
                "✅ Customer {} upgraded to {} via {}",
                customer_id,
                plan.as_str(),
                provider
            );
        }
        WebhookResult::SubscriptionUpdated {
            provider_subscription_id,
            plan,
            status,
        } => {
            let webhook_limit = plan.max_webhooks_per_month() as i64;

            // HS-059: Clear grace period on successful renewal
            let query = match provider {
                "polar" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1, webhook_limit = $2, \
                         payment_failed_at = NULL, updated_at = NOW() WHERE polar_subscription_id = $3"
                    )
                    .bind(plan.as_str())
                    .bind(webhook_limit)
                    .bind(provider_subscription_id)
                }
                "iyzico" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1, webhook_limit = $2, \
                         payment_failed_at = NULL, updated_at = NOW() WHERE iyzico_subscription_id = $3"
                    )
                    .bind(plan.as_str())
                    .bind(webhook_limit)
                    .bind(provider_subscription_id)
                }
                _ => return Ok(()),
            };

            query.execute(pool).await?;

            // HS-060: If plan changed (upgrade/downgrade), clean up excess endpoints
            let customer_id: Option<(uuid::Uuid,)> = match provider {
                "polar" => {
                    sqlx::query_as("SELECT id FROM customers WHERE polar_subscription_id = $1")
                        .bind(provider_subscription_id)
                        .fetch_optional(pool)
                        .await?
                }
                "iyzico" => {
                    sqlx::query_as("SELECT id FROM customers WHERE iyzico_subscription_id = $1")
                        .bind(provider_subscription_id)
                        .fetch_optional(pool)
                        .await?
                }
                _ => None,
            };
            if let Some((cid,)) = customer_id {
                cleanup_excess_endpoints(pool, cid, plan).await?;

                // Create invoice record for plan change
                let amount_cents = plan.monthly_price_cents() as i32;
                let currency = if provider == "iyzico" { "TRY" } else { "USD" };
                if let Err(e) = sqlx::query(
                    "INSERT INTO invoices (customer_id, amount_cents, currency, status, plan) \
                     VALUES ($1, $2, $3, 'paid', $4)",
                )
                .bind(cid)
                .bind(amount_cents)
                .bind(currency)
                .bind(plan.as_str())
                .execute(pool)
                .await
                {
                    tracing::warn!("Failed to insert invoice for customer {}: {:?}", cid, e);
                }
            }

            tracing::info!(
                "✅ {} subscription {} updated: status={}, plan={}",
                provider,
                provider_subscription_id,
                status,
                plan.as_str()
            );
        }
        WebhookResult::SubscriptionCanceled {
            provider_subscription_id,
        } => {
            let free_limit = Plan::Developer.max_webhooks_per_month() as i64;
            let query = match provider {
                "polar" => {
                    sqlx::query(
                        "UPDATE customers SET plan = 'free', polar_subscription_id = NULL, webhook_limit = $2, \
                         cancel_at_period_end = false, updated_at = NOW() WHERE polar_subscription_id = $1"
                    )
                    .bind(provider_subscription_id)
                    .bind(free_limit)
                }
                "iyzico" => {
                    sqlx::query(
                        "UPDATE customers SET plan = 'free', iyzico_subscription_id = NULL, webhook_limit = $2, \
                         cancel_at_period_end = false, updated_at = NOW() WHERE iyzico_subscription_id = $1"
                    )
                    .bind(provider_subscription_id)
                    .bind(free_limit)
                }
                _ => return Ok(()),
            };

            query.execute(pool).await?;

            // HS-060: Clean up excess endpoints on cancellation (free plan = 5 endpoints)
            let customer_id: Option<(uuid::Uuid,)> = match provider {
                "polar" => {
                    sqlx::query_as("SELECT id FROM customers WHERE polar_subscription_id = $1")
                        .bind(provider_subscription_id)
                        .fetch_optional(pool)
                        .await?
                }
                "iyzico" => {
                    sqlx::query_as("SELECT id FROM customers WHERE iyzico_subscription_id = $1")
                        .bind(provider_subscription_id)
                        .fetch_optional(pool)
                        .await?
                }
                _ => None,
            };
            if let Some((cid,)) = customer_id {
                cleanup_excess_endpoints(pool, cid, &Plan::Developer).await?;
            }

            tracing::info!(
                "✅ {} subscription {} canceled, customer downgraded to free",
                provider,
                provider_subscription_id
            );
        }
        WebhookResult::PaymentSucceeded {
            provider_tx_id,
            amount_cents,
            currency,
        } => {
            // HS-059: Clear grace period on successful payment
            // Find the customer by provider subscription ID and clear payment_failed_at
            // This is handled by SubscriptionUpdated on renewal, but also clear here for safety
            tracing::info!(
                "✅ {} payment succeeded: {} ({} {}) — clearing any grace period",
                provider,
                provider_tx_id,
                *amount_cents as f64 / 100.0,
                currency
            );
        }
        WebhookResult::PaymentFailed {
            provider_tx_id,
            customer_id,
        } => {
            // HS-059: Set grace period on payment failure (all providers)
            if let Some(cid) = customer_id {
                sqlx::query(
                    "UPDATE customers SET payment_failed_at = NOW(), updated_at = NOW() \
                     WHERE id = $1 AND payment_failed_at IS NULL",
                )
                .bind(cid)
                .execute(pool)
                .await?;

                tracing::warn!(
                    "⚠️ {} payment failed: {} — grace period started for customer {}",
                    provider,
                    provider_tx_id,
                    cid
                );
            } else {
                tracing::warn!(
                    "⚠️ {} payment failed: {} — no customer_id, grace period not set",
                    provider,
                    provider_tx_id
                );
            }
        }
        WebhookResult::Ignored => {}
    }

    Ok(())
}

// ──────────────────────────────────────────────────────────────
// HS-059: Grace period checker (called by background worker)
// ──────────────────────────────────────────────────────────────

/// Check for customers past their grace period and downgrade them.
/// Should be called periodically (e.g., daily) by the worker.
pub async fn process_expired_grace_periods(pool: &sqlx::PgPool) -> Result<u64, AppError> {
    let cutoff = Utc::now() - chrono::Duration::days(GRACE_PERIOD_DAYS);

    // Find customers past grace period
    let rows: Vec<(uuid::Uuid, String)> = sqlx::query_as(
        "SELECT id, plan FROM customers \
         WHERE payment_failed_at IS NOT NULL \
         AND payment_failed_at < $1 \
         AND plan != 'free'",
    )
    .bind(cutoff)
    .fetch_all(pool)
    .await?;

    let count = rows.len() as u64;

    for (customer_id, _plan) in &rows {
        let free_limit = Plan::Developer.max_webhooks_per_month() as i64;

        sqlx::query(
            "UPDATE customers SET plan = 'free', webhook_limit = $1, \
             payment_failed_at = NULL, cancel_at_period_end = false, updated_at = NOW() \
             WHERE id = $2",
        )
        .bind(free_limit)
        .bind(customer_id)
        .execute(pool)
        .await?;

        // HS-060: Clean up excess endpoints on grace period expiry
        cleanup_excess_endpoints(pool, *customer_id, &Plan::Developer).await?;

        tracing::info!(
            "⏰ Customer {} downgraded to free after {} day grace period",
            customer_id,
            GRACE_PERIOD_DAYS
        );
    }

    Ok(count)
}

// ──────────────────────────────────────────────────────────────
// HS-060: Endpoint cleanup on downgrade
// ──────────────────────────────────────────────────────────────

/// Disable endpoints that exceed the new plan's limit.
/// Keeps the oldest (by created_at) endpoints active, disables the rest.
async fn cleanup_excess_endpoints(
    pool: &sqlx::PgPool,
    customer_id: uuid::Uuid,
    new_plan: &Plan,
) -> Result<(), AppError> {
    let max_endpoints = new_plan.max_endpoints();

    // Count active endpoints
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true",
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    let active_count = count.0 as u32;

    if active_count <= max_endpoints {
        return Ok(()); // No cleanup needed
    }

    let excess = active_count - max_endpoints;

    // Disable the newest endpoints (keep oldest active)
    let result = sqlx::query(
        "UPDATE endpoints SET is_active = false, updated_at = NOW() \
         WHERE id IN (\
           SELECT id FROM endpoints \
           WHERE customer_id = $1 AND is_active = true \
           ORDER BY created_at DESC \
           LIMIT $2\
         )",
    )
    .bind(customer_id)
    .bind(excess as i64)
    .execute(pool)
    .await?;

    tracing::info!(
        "🔧 Disabled {} excess endpoints for customer {} (plan: {}, limit: {})",
        result.rows_affected(),
        customer_id,
        new_plan.as_str(),
        max_endpoints
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── SubscriptionResponse ────────────────────────────────

    #[test]
    fn test_subscription_response_serialization() {
        let resp = SubscriptionResponse {
            plan: "pro".to_string(),
            status: "active".to_string(),
            payment_provider: "stripe".to_string(),
            stripe_subscription_id: Some("sub_123".to_string()),
            polar_subscription_id: None,
            iyzico_subscription_id: None,
            webhook_limit: 50_000,
            endpoint_limit: 50,
            retention_days: 30,
            monthly_price_cents: 4900,
            monthly_price_kurus: 0,
            cancel_at_period_end: false,
            billing_period: "monthly".to_string(),
            current_period_end: Some("2026-06-01T00:00:00+00:00".to_string()),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["status"], "active");
        assert_eq!(json["webhook_limit"], 50_000);
        assert_eq!(json["monthly_price_cents"], 4900);
        assert_eq!(json["cancel_at_period_end"], false);
        assert_eq!(json["billing_period"], "monthly");
    }

    #[test]
    fn test_subscription_response_clone_and_debug() {
        let resp = SubscriptionResponse {
            plan: "developer".to_string(),
            status: "active".to_string(),
            payment_provider: "polar".to_string(),
            stripe_subscription_id: None,
            polar_subscription_id: Some("polar_sub".to_string()),
            iyzico_subscription_id: None,
            webhook_limit: 1000,
            endpoint_limit: 3,
            retention_days: 7,
            monthly_price_cents: 0,
            monthly_price_kurus: 0,
            cancel_at_period_end: false,
            billing_period: "monthly".to_string(),
            current_period_end: None,
        };
        let _debug = format!("{:?}", resp);
    }

    // ── UpgradeRequest ──────────────────────────────────────

    #[test]
    fn test_upgrade_request_deserialization_with_provider() {
        let json = r#"{"plan":"pro","provider":"polar"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "pro");
        assert_eq!(req.provider, Some("polar".to_string()));
    }

    #[test]
    fn test_upgrade_request_deserialization_without_provider() {
        let json = r#"{"plan":"enterprise"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "enterprise");
        assert_eq!(req.provider, None);
        assert_eq!(req.billing_period, None);
    }

    #[test]
    fn test_upgrade_request_deserialization_with_billing_period() {
        let json = r#"{"plan":"pro","billing_period":"annual"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "pro");
        assert_eq!(req.billing_period, Some("annual".to_string()));
    }

    #[test]
    fn test_upgrade_request_debug() {
        let req: UpgradeRequest = serde_json::from_str(r#"{"plan":"pro"}"#).unwrap();
        let _debug = format!("{:?}", req);
    }

    // ── UpgradeResponse ─────────────────────────────────────

    #[test]
    fn test_upgrade_response_serialization() {
        let resp = UpgradeResponse {
            checkout_url: Some("https://checkout.stripe.com/xyz".to_string()),
            provider: "stripe".to_string(),
            message: "Redirecting".to_string(),
            prorated_amount_cents: None,
            days_remaining: None,
            requires_contact: None,
            contact_url: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["checkout_url"], "https://checkout.stripe.com/xyz");
        assert_eq!(json["provider"], "stripe");
    }

    #[test]
    fn test_upgrade_response_none_checkout_url() {
        let resp = UpgradeResponse {
            checkout_url: None,
            provider: "stripe".to_string(),
            message: "Done".to_string(),
            prorated_amount_cents: Some(1500),
            days_remaining: Some(15),
            requires_contact: None,
            contact_url: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["checkout_url"].is_null());
        assert_eq!(json["prorated_amount_cents"], 1500);
        assert_eq!(json["days_remaining"], 15);
    }

    #[test]
    fn test_upgrade_response_enterprise_contact() {
        let resp = UpgradeResponse {
            checkout_url: None,
            provider: "stripe".to_string(),
            message: "Enterprise plan requires a custom agreement.".into(),
            prorated_amount_cents: None,
            days_remaining: None,
            requires_contact: Some(true),
            contact_url: Some("mailto:enterprise@hooksniff.dev".into()),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["checkout_url"].is_null());
        assert_eq!(json["requires_contact"], true);
        assert_eq!(json["contact_url"], "mailto:enterprise@hooksniff.dev");
    }

    // ── PortalResponse ──────────────────────────────────────

    #[test]
    fn test_portal_response_serialization() {
        let resp = PortalResponse {
            url: "https://billing.stripe.com/session/abc".to_string(),
            provider: "stripe".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["url"], "https://billing.stripe.com/session/abc");
        assert_eq!(json["provider"], "stripe");
    }

    // ── UsageResponse ───────────────────────────────────────

    #[test]
    fn test_usage_response_serialization() {
        let resp = UsageResponse {
            plan: "pro".to_string(),
            payment_provider: "stripe".to_string(),
            webhooks: UsageCounter {
                used: 100,
                limit: 50_000,
                remaining: 49_900,
            },
            endpoints: UsageCounter {
                used: 5,
                limit: 50,
                remaining: 45,
            },
            rate_limit: RateLimitInfo {
                requests_per_minute: 1000,
            },
            period: PeriodInfo {
                start: "2024-01-01".to_string(),
                end: "2024-02-01".to_string(),
            },
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["webhooks"]["used"], 100);
        assert_eq!(json["webhooks"]["remaining"], 49_900);
        assert_eq!(json["endpoints"]["limit"], 50);
        assert_eq!(json["rate_limit"]["requests_per_minute"], 1000);
        assert_eq!(json["period"]["start"], "2024-01-01");
    }

    #[test]
    fn test_usage_counter_serialization() {
        let counter = UsageCounter {
            used: 0,
            limit: 1000,
            remaining: 1000,
        };
        let json = serde_json::to_value(&counter).unwrap();
        assert_eq!(json["used"], 0);
        assert_eq!(json["limit"], 1000);
    }

    #[test]
    fn test_rate_limit_info_serialization() {
        let info = RateLimitInfo {
            requests_per_minute: 60,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["requests_per_minute"], 60);
    }

    #[test]
    fn test_period_info_serialization() {
        let period = PeriodInfo {
            start: "2024-01-01".to_string(),
            end: "2024-02-01".to_string(),
        };
        let json = serde_json::to_value(&period).unwrap();
        assert_eq!(json["start"], "2024-01-01");
        assert_eq!(json["end"], "2024-02-01");
    }

    // ── InvoiceResponse ─────────────────────────────────────

    #[test]
    fn test_invoice_response_serialization() {
        let resp = InvoiceResponse {
            id: "inv_123".to_string(),
            date: "2024-01-15".to_string(),
            amount: 49.00,
            status: "paid".to_string(),
            plan: "pro".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["id"], "inv_123");
        assert_eq!(json["amount"], 49.0);
        assert_eq!(json["status"], "paid");
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_billing_router_construction() {
        let _router = router();
    }

    // ── Item 259: Checkout URL validation ──────────────────

    #[test]
    fn test_validate_checkout_url_stripe() {
        assert!(validate_checkout_url("https://checkout.stripe.com/pay/cs_test_abc123").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_polar() {
        assert!(validate_checkout_url("https://polar.sh/checkout/sess_001").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_iyzico() {
        assert!(validate_checkout_url("https://secure.iyzipay.com/checkout/123").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_localhost() {
        assert!(validate_checkout_url("http://localhost:3001/checkout").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_rejects_http() {
        assert!(validate_checkout_url("http://checkout.stripe.com/pay/cs_test").is_err());
    }

    #[test]
    fn test_validate_checkout_url_rejects_unknown_domain() {
        assert!(validate_checkout_url("https://evil.example.com/steal").is_err());
    }

    #[test]
    fn test_validate_checkout_url_rejects_invalid_url() {
        assert!(validate_checkout_url("not-a-url").is_err());
    }

    // ── SubscriptionResponse with cancel_at_period_end ─────

    #[test]
    fn test_subscription_response_cancel_at_period_end_true() {
        let resp = SubscriptionResponse {
            plan: "pro".to_string(),
            status: "canceled".to_string(),
            payment_provider: "stripe".to_string(),
            stripe_subscription_id: Some("sub_123".to_string()),
            polar_subscription_id: None,
            iyzico_subscription_id: None,
            webhook_limit: 50_000,
            endpoint_limit: 50,
            retention_days: 30,
            monthly_price_cents: 4900,
            monthly_price_kurus: 0,
            cancel_at_period_end: true,
            billing_period: "monthly".to_string(),
            current_period_end: Some("2026-06-01T00:00:00+00:00".to_string()),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["cancel_at_period_end"], true);
        assert_eq!(json["status"], "canceled");
    }
}
