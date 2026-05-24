//! Stripe webhook event handlers.
//!
//! Handles the processing of individual Stripe webhook events:
//! - checkout.session.completed → activate subscription
//! - customer.subscription.updated → sync plan changes
//! - customer.subscription.deleted → downgrade to free
//! - invoice.paid → extend billing period
//! - invoice.payment_failed → mark payment failed
//! - charge.dispute.created → handle chargeback

use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::AppError;
use crate::models::customer::Customer;

use super::{extract_and_save_card, verify_webhook_signature, StripePrices, StripeWebhookEvent};

/// Verify and process a Stripe webhook event.
///
/// Verifies the webhook signature using HMAC-SHA256, then processes the event.
pub async fn handle_webhook_event(
    pool: &PgPool,
    payload: &str,
    signature_header: &str,
    webhook_secret: &str,
    tolerance_secs: i64,
) -> Result<(), AppError> {
    verify_webhook_signature(payload, signature_header, webhook_secret, tolerance_secs)?;

    let event: StripeWebhookEvent =
        serde_json::from_str(payload).map_err(|e| {
            AppError::BadRequest(format!("Invalid webhook payload: {}", e))
        })?;

    tracing::info!(
        "Processing Stripe webhook: {} (id: {})",
        event.event_type,
        event.id
    );

    // Idempotency: check if we already processed this event
    let already_processed = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM billing_events WHERE provider = 'stripe' AND provider_event_id = $1)"
    )
    .bind(&event.id)
    .fetch_one(pool)
    .await
    .unwrap_or(false);

    if already_processed {
        tracing::debug!("Stripe event {} already processed, skipping", event.id);
        return Ok(());
    }

    let result = match event.event_type.as_str() {
        "checkout.session.completed" => {
            handle_checkout_completed(pool, &event.data.object).await
        }
        "customer.subscription.updated" => {
            handle_subscription_updated(pool, &event.data.object).await
        }
        "customer.subscription.deleted" => {
            handle_subscription_deleted(pool, &event.data.object).await
        }
        "invoice.paid" => handle_invoice_paid(pool, &event.data.object).await,
        "invoice.payment_failed" => {
            handle_invoice_failed(pool, &event.data.object).await
        }
        "charge.dispute.created" => {
            handle_chargeback_created(pool, &event.data.object).await
        }
        _ => {
            tracing::debug!("Unhandled Stripe event type: {}", event.event_type);
            Ok(())
        }
    };

    // Record the event for idempotency (regardless of success/failure)
    let _ = sqlx::query(
        "INSERT INTO billing_events (provider, provider_event_id, event_type, processed_at) \
         VALUES ('stripe', $1, $2, NOW()) ON CONFLICT DO NOTHING"
    )
    .bind(&event.id)
    .bind(&event.event_type)
    .execute(pool)
    .await;

    result
}

// ── Event Handlers ───────────────────────────────────────────────

async fn handle_checkout_completed(
    pool: &PgPool,
    data: &serde_json::Value,
) -> Result<(), AppError> {
    let customer_id_str = data
        .get("client_reference_id")
        .and_then(|v| v.as_str())
        .or_else(|| {
            data.get("metadata")
                .and_then(|m| m.get("customer_id"))
                .and_then(|v| v.as_str())
        })
        .ok_or_else(|| AppError::BadRequest("Missing customer_id in checkout session".into()))?;

    let customer_id = Uuid::parse_str(customer_id_str)
        .map_err(|_| AppError::BadRequest("Invalid customer_id format".into()))?;

    let plan_str = data
        .get("metadata")
        .and_then(|m| m.get("plan"))
        .and_then(|v| v.as_str())
        .unwrap_or("pro");

    let plan = Plan::parse_str(plan_str);
    let stripe_subscription_id = data
        .get("subscription")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let stripe_customer_id = data
        .get("customer")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    // Update customer with new plan and Stripe IDs
    sqlx::query(
        "UPDATE customers SET \
         plan = $1, \
         stripe_subscription_id = COALESCE($2, stripe_subscription_id), \
         stripe_customer_id = COALESCE($3, stripe_customer_id), \
         payment_provider = 'stripe', \
         payment_failed_at = NULL, \
         updated_at = NOW() \
         WHERE id = $4"
    )
    .bind(plan.as_str())
    .bind(&stripe_subscription_id)
    .bind(&stripe_customer_id)
    .bind(customer_id)
    .execute(pool)
    .await?;

    tracing::info!(
        "✅ Stripe checkout completed: customer {} → plan {}",
        customer_id,
        plan.as_str()
    );

    // Extract and save card details if available
    extract_and_save_card(pool, customer_id, data).await;

    Ok(())
}

async fn handle_subscription_updated(
    pool: &PgPool,
    data: &serde_json::Value,
) -> Result<(), AppError> {
    let stripe_sub_id = data
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("Missing subscription id".into()))?;

    let status = data
        .get("status")
        .and_then(|v| v.as_str())
        .unwrap_or("active");

    let cancel_at_period_end = data
        .get("cancel_at_period_end")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    // Find customer by Stripe subscription ID
    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE stripe_subscription_id = $1"
    )
    .bind(stripe_sub_id)
    .fetch_optional(pool)
    .await?;

    if let Some(cust) = customer {
        // Determine plan from price ID
        let plan = extract_plan_from_subscription(data);

        sqlx::query(
            "UPDATE customers SET \
             plan = $1, \
             cancel_at_period_end = $2, \
             updated_at = NOW() \
             WHERE id = $3"
        )
        .bind(plan.as_str())
        .bind(cancel_at_period_end)
        .bind(cust.id)
        .execute(pool)
        .await?;

        tracing::info!(
            "🔄 Stripe subscription updated: customer {} → plan {}, cancel_at_period_end={}",
            cust.id,
            plan.as_str(),
            cancel_at_period_end
        );

        // Extract and save card details if available
        extract_and_save_card(pool, cust.id, data).await;
    } else {
        tracing::warn!(
            "Stripe subscription {} not found in database",
            stripe_sub_id
        );
    }

    Ok(())
}

async fn handle_subscription_deleted(
    pool: &PgPool,
    data: &serde_json::Value,
) -> Result<(), AppError> {
    let stripe_sub_id = data
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("Missing subscription id".into()))?;

    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE stripe_subscription_id = $1"
    )
    .bind(stripe_sub_id)
    .fetch_optional(pool)
    .await?;

    if let Some(cust) = customer {
        sqlx::query(
            "UPDATE customers SET \
             plan = 'free', \
             stripe_subscription_id = NULL, \
             cancel_at_period_end = false, \
             updated_at = NOW() \
             WHERE id = $1"
        )
        .bind(cust.id)
        .execute(pool)
        .await?;

        tracing::info!(
            "❌ Stripe subscription deleted: customer {} downgraded to free",
            cust.id
        );
    }

    Ok(())
}

async fn handle_invoice_paid(
    pool: &PgPool,
    data: &serde_json::Value,
) -> Result<(), AppError> {
    let stripe_sub_id = data
        .get("subscription")
        .and_then(|v| v.as_str());

    if let Some(sub_id) = stripe_sub_id {
        let customer = sqlx::query_as::<_, Customer>(
            "SELECT * FROM customers WHERE stripe_subscription_id = $1"
        )
        .bind(sub_id)
        .fetch_optional(pool)
        .await?;

        if let Some(cust) = customer {
            // Extract period dates from invoice
            let period_start = data
                .get("period_start")
                .and_then(|v| v.as_i64())
                .map(|ts| chrono::DateTime::from_timestamp(ts, 0).map(|dt| dt.to_rfc3339()))
                .flatten();
            let period_end = data
                .get("period_end")
                .and_then(|v| v.as_i64())
                .map(|ts| chrono::DateTime::from_timestamp(ts, 0).map(|dt| dt.to_rfc3339()))
                .flatten();

            // Clear payment_failed_at on successful payment
            sqlx::query(
                "UPDATE customers SET \
                 payment_failed_at = NULL, \
                 current_period_end = COALESCE($2::timestamptz, current_period_end), \
                 updated_at = NOW() \
                 WHERE id = $1"
            )
            .bind(cust.id)
            .bind(period_end.as_deref())
            .execute(pool)
            .await?;

            // Extract and save card details if available
            extract_and_save_card(pool, cust.id, data).await;

            tracing::info!(
                "💰 Stripe invoice paid: customer {}, period {:?}-{:?}",
                cust.id,
                period_start,
                period_end
            );
        }
    }

    Ok(())
}

async fn handle_invoice_failed(
    pool: &PgPool,
    data: &serde_json::Value,
) -> Result<(), AppError> {
    let stripe_sub_id = data
        .get("subscription")
        .and_then(|v| v.as_str());

    if let Some(sub_id) = stripe_sub_id {
        let customer = sqlx::query_as::<_, Customer>(
            "SELECT * FROM customers WHERE stripe_subscription_id = $1"
        )
        .bind(sub_id)
        .fetch_optional(pool)
        .await?;

        if let Some(cust) = customer {
            let attempt_count = data
                .get("attempt_count")
                .and_then(|v| v.as_i64())
                .unwrap_or(1);

            // On first failure, mark payment_failed_at
            if attempt_count <= 1 {
                sqlx::query(
                    "UPDATE customers SET payment_failed_at = NOW(), updated_at = NOW() WHERE id = $1"
                )
                .bind(cust.id)
                .execute(pool)
                .await?;

                tracing::warn!(
                    "⚠️ Stripe invoice payment failed (attempt {}): customer {}",
                    attempt_count,
                    cust.id
                );
            } else {
                tracing::warn!(
                    "⚠️ Stripe invoice payment failed (attempt {}): customer {}",
                    attempt_count,
                    cust.id
                );
            }

            // Extract and save card details if available
            extract_and_save_card(pool, cust.id, data).await;
        }
    }

    Ok(())
}

/// Item 251: Handle Stripe chargeback (charge.dispute.created).
///
/// When a chargeback is received, we:
/// 1. Find the customer by the disputed charge's customer ID
/// 2. Downgrade them to free plan
/// 3. Clear subscription IDs
/// 4. Mark payment_failed_at for audit trail
async fn handle_chargeback_created(
    pool: &PgPool,
    data: &serde_json::Value,
) -> Result<(), AppError> {
    // The dispute object contains the charge ID
    let charge_id = data
        .get("charge")
        .and_then(|v| v.as_str())
        .or_else(|| {
            data.get("id").and_then(|v| v.as_str())
        });

    if charge_id.is_none() {
        tracing::warn!("Chargeback event missing charge ID");
        return Ok(());
    }

    // Try to find the customer from metadata or from the charge
    // Stripe doesn't always include customer_id directly in dispute events,
    // so we look for it in the evidence or metadata
    let customer_id = data
        .get("metadata")
        .and_then(|m| m.get("customer_id"))
        .and_then(|v| v.as_str())
        .map(|s| Uuid::parse_str(s).ok())
        .flatten();

    if let Some(cid) = customer_id {
        // Downgrade to free, clear payment info
        sqlx::query(
            "UPDATE customers SET \
             plan = 'free', \
             stripe_subscription_id = NULL, \
             stripe_customer_id = NULL, \
             payment_failed_at = NOW(), \
             updated_at = NOW() \
             WHERE id = $1"
        )
        .bind(cid)
        .execute(pool)
        .await?;

        tracing::warn!(
            "🚨 Chargeback received: customer {} downgraded to free (charge: {})",
            cid,
            charge_id.unwrap_or("unknown")
        );
    } else {
        tracing::warn!(
            "Chargeback received but could not identify customer (charge: {})",
            charge_id.unwrap_or("unknown")
        );
    }

    Ok(())
}

// ── Helpers ──────────────────────────────────────────────────────

/// Extract plan from Stripe subscription data.
fn extract_plan_from_subscription(data: &serde_json::Value) -> Plan {
    // Try to get plan from metadata first
    if let Some(plan_str) = data
        .get("metadata")
        .and_then(|m| m.get("plan"))
        .and_then(|v| v.as_str())
    {
        return Plan::parse_str(plan_str);
    }

    // Try to get from items data
    if let Some(items) = data.get("items").and_then(|v| v.get("data")) {
        if let Some(arr) = items.as_array() {
            if let Some(first) = arr.first() {
                if let Some(price) = first.get("price") {
                    if let Some(price_id) = price.get("id").and_then(|v| v.as_str()) {
                        // Map known price IDs to plans
                        let prices = StripePrices::from_env();
                        if price_id == prices.pro_monthly {
                            return Plan::Pro;
                        } else if price_id == prices.business_monthly {
                            return Plan::Enterprise;
                        }
                    }
                }
            }
        }
    }

    // Default to current plan if we can't determine
    Plan::Developer
}
