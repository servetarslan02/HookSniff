use axum::extract::{Extension, Path};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::billing::{Plan, Subscription, SubscriptionStatus};
use crate::billing::stripe;
use crate::billing::provider::{PaymentProvider, PaymentProviderImpl};
use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/subscription", get(get_subscription))
        .route("/upgrade", post(upgrade_plan))
        .route("/portal", post(open_portal))
        .route("/usage", get(get_usage))
        .route("/webhook", post(handle_stripe_webhook))
        .route("/webhook/polar", post(handle_polar_webhook))
        .route("/webhook/iyzico", post(handle_iyzico_webhook))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/subscription — Current plan
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
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
    let plan = Plan::from_str(&customer.plan);

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status: "active".to_string(),
        payment_provider: customer.payment_provider.clone(),
        stripe_subscription_id: customer.stripe_subscription_id.clone(),
        polar_subscription_id: customer.polar_subscription_id.clone(),
        iyzico_subscription_id: customer.iyzico_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_day(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
    }))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan
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
}

async fn upgrade_plan(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpgradeRequest>,
) -> Result<Json<UpgradeResponse>, AppError> {
    let new_plan = Plan::from_str(&req.plan);

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

    // Determine which provider to use
    let provider_name = req
        .provider
        .as_deref()
        .unwrap_or(&customer.payment_provider);

    let provider_enum = PaymentProvider::from_str(provider_name);

    match provider_enum {
        PaymentProvider::Polar | PaymentProvider::Iyzico => {
            // Use Polar.sh or iyzico via the provider trait
            let provider_impl = crate::billing::resolve_provider(provider_name)
                .ok_or_else(|| AppError::Internal(anyhow::anyhow!(
                    "Payment provider '{}' not configured", provider_name
                )))?;

            let base_url = cfg.app_url.as_deref().unwrap_or("http://localhost:3001");

            let result = provider_impl
                .create_checkout(customer.id, &customer.email, &new_plan, base_url)
                .await?;

            // Update customer's payment provider
            sqlx::query(
                "UPDATE customers SET payment_provider = $1 WHERE id = $2"
            )
            .bind(provider_name)
            .bind(customer.id)
            .execute(&pool)
            .await?;

            Ok(Json(UpgradeResponse {
                checkout_url: Some(result.checkout_url),
                provider: provider_name.to_string(),
                message: format!(
                    "Redirecting to {} Checkout for {} plan",
                    provider_name,
                    new_plan.as_str(),
                ),
            }))
        }
        PaymentProvider::Stripe => {
            // Use existing Stripe integration
            let session = stripe::create_checkout_session(
                &cfg,
                customer.id,
                &customer.email,
                &new_plan,
            )
            .await?;

            Ok(Json(UpgradeResponse {
                checkout_url: session.url,
                provider: "stripe".to_string(),
                message: format!(
                    "Redirecting to Stripe Checkout for {} plan (${}/mo)",
                    new_plan.as_str(),
                    new_plan.monthly_price_cents() as f64 / 100.0
                ),
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

    match PaymentProvider::from_str(provider_name) {
        PaymentProvider::Polar | PaymentProvider::Iyzico => {
            let provider_impl = crate::billing::resolve_provider(provider_name)
                .ok_or_else(|| AppError::Internal(anyhow::anyhow!(
                    "Payment provider '{}' not configured", provider_name
                )))?;

            // Get the provider-specific customer ID
            let provider_customer_id = match provider_name {
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
            let stripe_customer_id = customer
                .stripe_customer_id
                .as_ref()
                .ok_or_else(|| AppError::BadRequest("No Stripe customer found. Upgrade your plan first.".into()))?;

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
    let plan = Plan::from_str(&customer.plan);

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
            limit: plan.max_webhooks_per_day(),
            remaining: plan.max_webhooks_per_day().saturating_sub(customer.webhook_count as u64),
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
// Webhook handlers for each provider
// ──────────────────────────────────────────────────────────────

/// POST /v1/billing/webhook — Stripe webhook handler
async fn handle_stripe_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    let signature = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let webhook_secret = cfg
        .stripe_webhook_secret
        .as_deref()
        .unwrap_or("");

    if webhook_secret.is_empty() {
        tracing::warn!("Stripe webhook secret not configured, skipping verification");
    }

    stripe::handle_webhook_event(&pool, &body, signature, webhook_secret).await?;

    Ok(StatusCode::OK)
}

/// POST /v1/billing/webhook/polar — Polar.sh webhook handler
async fn handle_polar_webhook(
    Extension(pool): Extension<PgPool>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
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
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
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
    use crate::billing::provider::WebhookResult;

    match result {
        WebhookResult::SubscriptionCreated {
            customer_id,
            plan,
            provider_customer_id,
            provider_subscription_id,
        } => {
            let update_query = match provider {
                "polar" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1, payment_provider = $2, \
                         polar_customer_id = $3, polar_subscription_id = $4 WHERE id = $5"
                    )
                    .bind(plan.as_str())
                    .bind(provider)
                    .bind(provider_customer_id)
                    .bind(provider_subscription_id)
                    .bind(customer_id)
                }
                "iyzico" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1, payment_provider = $2, \
                         iyzico_customer_id = $3, iyzico_subscription_id = $4 WHERE id = $5"
                    )
                    .bind(plan.as_str())
                    .bind(provider)
                    .bind(provider_customer_id)
                    .bind(provider_subscription_id)
                    .bind(customer_id)
                }
                _ => return Ok(()),
            };

            update_query.execute(pool).await?;

            // Log transaction
            sqlx::query(
                "INSERT INTO payment_transactions \
                 (customer_id, provider, status, plan, currency) \
                 VALUES ($1, $2, 'completed', $3, $4)"
            )
            .bind(customer_id)
            .bind(provider)
            .bind(plan.as_str())
            .bind(if provider == "iyzico" { "TRY" } else { "USD" })
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
            let query = match provider {
                "polar" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1 WHERE polar_subscription_id = $2"
                    )
                    .bind(plan.as_str())
                    .bind(provider_subscription_id)
                }
                "iyzico" => {
                    sqlx::query(
                        "UPDATE customers SET plan = $1 WHERE iyzico_subscription_id = $2"
                    )
                    .bind(plan.as_str())
                    .bind(provider_subscription_id)
                }
                _ => return Ok(()),
            };

            query.execute(pool).await?;

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
            let query = match provider {
                "polar" => {
                    sqlx::query(
                        "UPDATE customers SET plan = 'free', polar_subscription_id = NULL \
                         WHERE polar_subscription_id = $1"
                    )
                    .bind(provider_subscription_id)
                }
                "iyzico" => {
                    sqlx::query(
                        "UPDATE customers SET plan = 'free', iyzico_subscription_id = NULL \
                         WHERE iyzico_subscription_id = $1"
                    )
                    .bind(provider_subscription_id)
                }
                _ => return Ok(()),
            };

            query.execute(pool).await?;

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
            sqlx::query(
                "INSERT INTO payment_transactions \
                 (customer_id, provider, provider_tx_id, amount_cents, currency, status) \
                 VALUES ((SELECT id FROM customers WHERE polar_subscription_id IS NOT NULL \
                          OR iyzico_subscription_id IS NOT NULL LIMIT 1), \
                         $1, $2, $3, $4, 'completed')"
            )
            .bind(provider)
            .bind(provider_tx_id)
            .bind(*amount_cents as i64)
            .bind(currency)
            .execute(pool)
            .await?;

            tracing::info!(
                "✅ {} payment succeeded: {} ({} {})",
                provider,
                provider_tx_id,
                *amount_cents as f64 / 100.0,
                currency
            );
        }
        WebhookResult::PaymentFailed { provider_tx_id } => {
            tracing::warn!("⚠️ {} payment failed: {}", provider, provider_tx_id);
        }
        WebhookResult::Ignored => {}
    }

    Ok(())
}
