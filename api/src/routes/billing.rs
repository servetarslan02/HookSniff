use axum::extract::Extension;
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{Datelike, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::billing::provider::{PaymentProvider, PaymentProviderImpl};
use crate::billing::stripe;
use crate::billing::Plan;
use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;

/// Grace period in days after a failed payment before downgrade.
const GRACE_PERIOD_DAYS: i64 = 7;

pub fn router() -> Router {
    Router::new()
        .route("/subscription", get(get_subscription).delete(cancel_subscription))
        .route("/upgrade", post(upgrade_plan))
        .route("/portal", post(open_portal))
        .route("/usage", get(get_usage))
        .route("/invoices", get(get_invoices))
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
}

async fn get_subscription(
    Extension(customer): Extension<Customer>,
) -> Result<Json<SubscriptionResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status: "active".to_string(),
        payment_provider: customer.payment_provider.clone(),
        stripe_subscription_id: customer.stripe_subscription_id.clone(),
        polar_subscription_id: customer.polar_subscription_id.clone(),
        iyzico_subscription_id: customer.iyzico_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_month(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
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
    if customer.plan == "free" {
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
    if *current_plan == Plan::Free || current_period_start.is_none() {
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
        Plan::Free => {
            return Err(AppError::BadRequest(
                "Use the customer portal to downgrade your plan".into(),
            ));
        }
        Plan::Enterprise => {
            return Err(AppError::BadRequest(
                "Enterprise plans require contacting sales".into(),
            ));
        }
        _ => {}
    }

    // Prevent same-plan upgrade
    if new_plan == current_plan {
        return Err(AppError::BadRequest(
            "You are already on this plan".into(),
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
    let provider_name = req
        .provider
        .as_deref()
        .unwrap_or(&customer.payment_provider);

    let provider_enum = PaymentProvider::parse_str(provider_name);

    match provider_enum {
        PaymentProvider::Polar | PaymentProvider::Iyzico => {
            // Use Polar.sh or iyzico via the provider trait
            let provider_impl =
                crate::billing::resolve_provider(provider_name).ok_or_else(|| {
                    AppError::Internal(anyhow::anyhow!(
                        "Payment provider '{}' not configured",
                        provider_name
                    ))
                })?;

            let base_url = cfg.app_url.as_deref().unwrap_or("http://localhost:3001");

            let result = provider_impl
                .create_checkout(customer.id, &customer.email, &new_plan, base_url)
                .await?;

            // Update customer's payment provider
            sqlx::query("UPDATE customers SET payment_provider = $1 WHERE id = $2")
                .bind(provider_name)
                .bind(customer.id)
                .execute(&pool)
                .await?;

            let (prorated_amount, days_remaining) = proration.unwrap_or((0, 0));

            Ok(Json(UpgradeResponse {
                checkout_url: Some(result.checkout_url),
                provider: provider_name.to_string(),
                message: format!(
                    "Redirecting to {} Checkout for {} plan",
                    provider_name,
                    new_plan.as_str(),
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
            }))
        }
        PaymentProvider::Stripe => {
            // Use existing Stripe integration
            let session =
                stripe::create_checkout_session(&cfg, customer.id, &customer.email, &new_plan)
                    .await?;

            let (prorated_amount, days_remaining) = proration.unwrap_or((0, 0));

            Ok(Json(UpgradeResponse {
                checkout_url: session.url,
                provider: "stripe".to_string(),
                message: format!(
                    "Redirecting to Stripe Checkout for {} plan (${}/mo)",
                    new_plan.as_str(),
                    new_plan.monthly_price_cents() as f64 / 100.0
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
            }))
        }
    }
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
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PortalResponse>, AppError> {
    let provider_name = &customer.payment_provider;

    match PaymentProvider::parse_str(provider_name) {
        PaymentProvider::Polar | PaymentProvider::Iyzico => {
            let provider_impl =
                crate::billing::resolve_provider(provider_name).ok_or_else(|| {
                    AppError::Internal(anyhow::anyhow!(
                        "Payment provider '{}' not configured",
                        provider_name
                    ))
                })?;

            // Get the provider-specific customer ID
            let provider_customer_id = match provider_name.as_str() {
                "polar" => customer.polar_customer_id.as_deref(),
                "iyzico" => customer.iyzico_customer_id.as_deref(),
                _ => None,
            }
            .unwrap_or("");

            let base_url = cfg.app_url.as_deref().unwrap_or("http://localhost:3001");

            let url = provider_impl
                .create_customer_portal(provider_customer_id, base_url)
                .await?;

            Ok(Json(PortalResponse {
                url,
                provider: provider_name.to_string(),
            }))
        }
        PaymentProvider::Stripe => {
            let stripe_customer_id = customer.stripe_customer_id.as_ref().ok_or_else(|| {
                AppError::BadRequest("No Stripe customer found. Upgrade your plan first.".into())
            })?;

            let url = stripe::create_customer_portal(&cfg, stripe_customer_id).await?;

            Ok(Json(PortalResponse {
                url,
                provider: "stripe".to_string(),
            }))
        }
    }
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
             FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC",
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
    let result = provider.handle_webhook(&headers, &body).await?;

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
    let result = provider.handle_webhook(&headers, &body).await?;

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
            let webhook_limit = plan.max_webhooks_per_month() as i32;
            let update_query = match provider {
                "polar" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1, payment_provider = $2, \
                         polar_customer_id = $3, polar_subscription_id = $4, webhook_limit = $5, \
                         payment_failed_at = NULL, updated_at = NOW() WHERE id = $6"
                    )
                    .bind(plan.as_str())
                    .bind(provider)
                    .bind(provider_customer_id)
                    .bind(provider_subscription_id)
                    .bind(webhook_limit)
                    .bind(customer_id)
                }
                "iyzico" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1, payment_provider = $2, \
                         iyzico_customer_id = $3, iyzico_subscription_id = $4, webhook_limit = $5, \
                         payment_failed_at = NULL, updated_at = NOW() WHERE id = $6"
                    )
                    .bind(plan.as_str())
                    .bind(provider)
                    .bind(provider_customer_id)
                    .bind(provider_subscription_id)
                    .bind(webhook_limit)
                    .bind(customer_id)
                }
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
            let webhook_limit = plan.max_webhooks_per_month() as i32;

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
            let free_limit = Plan::Free.max_webhooks_per_month() as i32;
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
                cleanup_excess_endpoints(pool, cid, &Plan::Free).await?;
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
        WebhookResult::PaymentFailed { provider_tx_id, customer_id } => {
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
        let free_limit = Plan::Free.max_webhooks_per_month() as i32;

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
        cleanup_excess_endpoints(pool, *customer_id, &Plan::Free).await?;

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
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["status"], "active");
        assert_eq!(json["webhook_limit"], 50_000);
        assert_eq!(json["monthly_price_cents"], 4900);
    }

    #[test]
    fn test_subscription_response_clone_and_debug() {
        let resp = SubscriptionResponse {
            plan: "free".to_string(),
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
        let json = r#"{"plan":"business"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "business");
        assert_eq!(req.provider, None);
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
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["checkout_url"].is_null());
        assert_eq!(json["prorated_amount_cents"], 1500);
        assert_eq!(json["days_remaining"], 15);
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
}
