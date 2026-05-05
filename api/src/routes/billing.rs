use axum::{extract::Extension, http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::billing::{Invoice, InvoiceStatus, Plan, Subscription, SubscriptionStatus, Usage};
use crate::db::DbPool;

/// Create the billing router
pub fn router() -> Router {
    Router::new()
        .route("/subscription", get(get_subscription).put(upgrade_plan))
        .route("/usage", get(get_usage))
        .route("/invoices", get(list_invoices))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/subscription — Current plan
// ──────────────────────────────────────────────────────────────

async fn get_subscription(
    Extension(_pool): Extension<DbPool>,
    // In production, extract customer_id from auth middleware
) -> impl IntoResponse {
    // TODO: Query subscription from database
    // Placeholder response
    let subscription = Subscription {
        customer_id: "cust_placeholder".to_string(),
        plan: Plan::Free,
        status: SubscriptionStatus::Active,
        stripe_subscription_id: None,
        current_period_start: "2025-01-01T00:00:00Z".to_string(),
        current_period_end: "2025-02-01T00:00:00Z".to_string(),
        cancel_at_period_end: false,
    };
    (StatusCode::OK, Json(subscription))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct UpgradeRequest {
    plan: String,
    /// Optional Stripe payment method ID
    payment_method_id: Option<String>,
}

#[derive(Debug, Serialize)]
struct UpgradeResponse {
    success: bool,
    plan: String,
    message: String,
    /// URL to Stripe Checkout session (if applicable)
    checkout_url: Option<String>,
}

async fn upgrade_plan(
    Json(body): Json<UpgradeRequest>,
    Extension(_pool): Extension<DbPool>,
) -> impl IntoResponse {
    let new_plan = Plan::from_str(&body.plan);

    // TODO: Integrate with Stripe
    // 1. Create or retrieve Stripe customer
    // 2. Create Stripe Checkout session or update subscription
    // 3. Update plan in database
    // 4. Return checkout URL or confirmation

    let response = UpgradeResponse {
        success: true,
        plan: new_plan.as_str().to_string(),
        message: format!(
            "Plan upgrade to {} initiated. Monthly price: ${:.2}",
            new_plan.as_str(),
            new_plan.monthly_price_cents() as f64 / 100.0
        ),
        checkout_url: None, // Will be populated with Stripe Checkout URL
    };

    (StatusCode::OK, Json(response))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/usage — Current usage
// ──────────────────────────────────────────────────────────────

async fn get_usage(
    Extension(_pool): Extension<DbPool>,
) -> impl IntoResponse {
    // TODO: Query usage counters from database
    let usage = Usage {
        customer_id: "cust_placeholder".to_string(),
        plan: Plan::Free,
        webhooks_today: 0,
        api_calls_today: 0,
        endpoints_count: 0,
        period_start: "2025-01-01".to_string(),
        period_end: "2025-02-01".to_string(),
    };

    let response = serde_json::json!({
        "plan": usage.plan.as_str(),
        "usage": {
            "webhooks": {
                "used": usage.webhooks_today,
                "limit": usage.plan.max_webhooks_per_day(),
                "remaining": usage.remaining_webhooks(),
            },
            "endpoints": {
                "used": usage.endpoints_count,
                "limit": usage.plan.max_endpoints(),
                "remaining": usage.remaining_endpoints(),
            },
            "rate_limit": {
                "requests_per_minute": usage.plan.max_requests_per_minute(),
            },
        },
        "period": {
            "start": usage.period_start,
            "end": usage.period_end,
        }
    });

    (StatusCode::OK, Json(response))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/invoices — Invoice history
// ──────────────────────────────────────────────────────────────

async fn list_invoices(
    Extension(_pool): Extension<DbPool>,
) -> impl IntoResponse {
    // TODO: Query invoices from database
    let invoices: Vec<Invoice> = vec![];

    let response = serde_json::json!({
        "data": invoices,
        "has_more": false,
    });

    (StatusCode::OK, Json(response))
}
