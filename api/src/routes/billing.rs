use axum::extract::{Extension, Path};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::billing::{Plan, Subscription, SubscriptionStatus};
use crate::billing::stripe;
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
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/subscription — Current plan
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct SubscriptionResponse {
    plan: String,
    status: String,
    stripe_subscription_id: Option<String>,
    webhook_limit: u64,
    endpoint_limit: u32,
    retention_days: i64,
    monthly_price_cents: u64,
}

async fn get_subscription(
    Extension(customer): Extension<Customer>,
) -> Result<Json<SubscriptionResponse>, AppError> {
    let plan = Plan::from_str(&customer.plan);

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status: "active".to_string(),
        stripe_subscription_id: customer.stripe_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_day(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
    }))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan via Stripe Checkout
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct UpgradeRequest {
    plan: String,
}

#[derive(Debug, Serialize)]
struct UpgradeResponse {
    checkout_url: Option<String>,
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
            // Downgrade — handled via Stripe portal or subscription cancellation
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

    // Create Stripe Checkout session
    let session = stripe::create_checkout_session(
        &cfg,
        customer.id,
        &customer.email,
        &new_plan,
    )
    .await?;

    Ok(Json(UpgradeResponse {
        checkout_url: session.url,
        message: format!(
            "Redirecting to Stripe Checkout for {} plan (${}/mo)",
            new_plan.as_str(),
            new_plan.monthly_price_cents() as f64 / 100.0
        ),
    }))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/portal — Open Stripe Customer Portal
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct PortalResponse {
    url: String,
}

async fn open_portal(
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PortalResponse>, AppError> {
    let stripe_customer_id = customer
        .stripe_customer_id
        .as_ref()
        .ok_or_else(|| AppError::BadRequest("No Stripe customer found. Upgrade your plan first.".into()))?;

    let url = stripe::create_customer_portal(&cfg, stripe_customer_id).await?;

    Ok(Json(PortalResponse { url }))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/usage — Current usage
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct UsageResponse {
    plan: String,
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
// POST /v1/billing/webhook — Stripe webhook handler
// ──────────────────────────────────────────────────────────────

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
