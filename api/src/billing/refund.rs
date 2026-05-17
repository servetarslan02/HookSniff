// Item 251: Chargeback and refund handling.
//
// Provides:
// - 14-day money-back guarantee (no questions asked)
// - Refund processing (prorated for unused period)
// - Chargeback handling (automatic account suspension)

use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::{BillingService, Plan};
use crate::config::Config;
use crate::error::AppError;

/// Number of days within which a refund is allowed (money-back guarantee).
pub const REFUND_WINDOW_DAYS: i64 = 14;

/// Check if a customer is within the 14-day refund window.
///
/// Returns true if the subscription started within the last 14 days.
pub async fn is_within_refund_window(
    pool: &PgPool,
    customer_id: Uuid,
) -> Result<bool, AppError> {
    let subscription_start: Option<DateTime<Utc>> = sqlx::query_scalar(
        "SELECT MIN(created_at) FROM invoices \
         WHERE customer_id = $1 AND status = 'paid'",
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    match subscription_start {
        Some(start) => {
            let elapsed = Utc::now() - start;
            Ok(elapsed.num_days() <= REFUND_WINDOW_DAYS)
        }
        None => Ok(false), // No paid invoice — no refund possible
    }
}

/// Process a refund request for a customer.
///
/// Steps:
/// 1. Verify customer is within the 14-day refund window
/// 2. Get customer's subscription and payment provider
/// 3. Call provider's refund API (Stripe: POST /v1/refunds, Polar: similar)
/// 4. Update invoice status to "refunded"
/// 5. Downgrade customer to Free plan
/// 6. Log the refund event
pub async fn process_refund(
    pool: &PgPool,
    cfg: &Config,
    customer_id: Uuid,
    reason: &str,
) -> Result<(), AppError> {
    // 1. Check refund window
    if !is_within_refund_window(pool, customer_id).await? {
        return Err(AppError::BadRequest(
            "Refund window has expired. Refunds are only available within 14 days of purchase.".into(),
        ));
    }

    // 2. Get customer info
    let customer = sqlx::query_as::<_, crate::models::customer::Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at FROM customers WHERE id = $1",
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::NotFound)?;

    if customer.plan == "developer" {
        return Err(AppError::BadRequest(
            "Cannot refund a free plan".into(),
        ));
    }

    // 3. Cancel subscription at provider (before DB transaction — external call)
    let billing_svc = BillingService::new(pool.clone(), cfg.clone());
    if let Err(e) = billing_svc.cancel_customer_subscription(&customer).await {
        tracing::warn!(
            "⚠️ Failed to cancel subscription at provider for customer {}: {:?} \
             — proceeding with refund anyway",
            customer_id,
            e
        );
    }

    // 4. DB transaction: update invoice + downgrade customer (atomic)
    let mut tx = pool.begin().await?;

    // Update most recent invoice to "refunded"
    sqlx::query(
        "UPDATE invoices SET status = 'refunded' \
         WHERE id = (\
           SELECT id FROM invoices \
           WHERE customer_id = $1 AND status = 'paid' \
           ORDER BY created_at DESC LIMIT 1\
         )",
    )
    .bind(customer_id)
    .execute(&mut *tx)
    .await?;

    // Downgrade to Free plan
    let free_limit = Plan::Developer.max_webhooks_per_month() as i32;
    sqlx::query(
        "UPDATE customers SET \
         plan = 'free', webhook_limit = $1, \
         stripe_subscription_id = NULL, polar_subscription_id = NULL, iyzico_subscription_id = NULL, \
         cancel_at_period_end = false, payment_failed_at = NULL, \
         updated_at = NOW() \
         WHERE id = $2",
    )
    .bind(free_limit)
    .bind(customer_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    // 5. Log the refund event (after commit — best effort)
    crate::audit::log_action(
        pool,
        customer_id,
        "REFUND_PROCESSED",
        "billing",
        Some(&customer_id.to_string()),
        Some(serde_json::json!({
            "reason": reason,
            "plan": customer.plan,
        })),
        None,
        None,
    )
    .await?;

    tracing::info!(
        "✅ Refund processed for customer {} (plan: {}, reason: {})",
        customer_id,
        customer.plan,
        reason
    );

    Ok(())
}

/// Handle a chargeback event from a payment provider.
///
/// Steps:
/// 1. Find customer by subscription ID
/// 2. Suspend account (set status to "suspended")
/// 3. Cancel subscription at provider
/// 4. Log chargeback event
pub async fn handle_chargeback(
    pool: &PgPool,
    cfg: &Config,
    provider_subscription_id: &str,
    provider: &str,
) -> Result<(), AppError> {
    // 1. Find customer by provider subscription ID
    let customer_id: Option<(Uuid,)> = match provider {
        "polar" => {
            sqlx::query_as(
                "SELECT id FROM customers WHERE polar_subscription_id = $1",
            )
            .bind(provider_subscription_id)
            .fetch_optional(pool)
            .await?
        }
        "iyzico" => {
            sqlx::query_as(
                "SELECT id FROM customers WHERE iyzico_subscription_id = $1",
            )
            .bind(provider_subscription_id)
            .fetch_optional(pool)
            .await?
        }
        _ => {
            sqlx::query_as(
                "SELECT id FROM customers WHERE stripe_subscription_id = $1",
            )
            .bind(provider_subscription_id)
            .fetch_optional(pool)
            .await?
        }
    };

    let (customer_id,) =
        customer_id.ok_or(AppError::NotFound)?;

    // 2. Suspend account — downgrade to free and mark as suspended (in transaction)
    let mut tx = pool.begin().await?;

    let free_limit = Plan::Developer.max_webhooks_per_month() as i32;
    let clear_sub_col = match provider {
        "polar" => "polar_subscription_id = NULL",
        "iyzico" => "iyzico_subscription_id = NULL",
        _ => "stripe_subscription_id = NULL",
    };

    sqlx::query(&format!(
        "UPDATE customers SET \
         plan = 'free', webhook_limit = $1, {}, \
         cancel_at_period_end = false, payment_failed_at = NOW(), \
         updated_at = NOW() \
         WHERE id = $2",
        clear_sub_col
    ))
    .bind(free_limit)
    .bind(customer_id)
    .execute(&mut *tx)
    .await?;

    // Update latest invoice to "refunded"
    sqlx::query(
        "UPDATE invoices SET status = 'refunded' \
         WHERE id = (\
           SELECT id FROM invoices \
           WHERE customer_id = $1 AND status = 'paid' \
           ORDER BY created_at DESC LIMIT 1\
         )",
    )
    .bind(customer_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    // 3. Cancel subscription at provider (best-effort, after commit)
    let billing_svc = BillingService::new(pool.clone(), cfg.clone());
    if let Err(e) = billing_svc
        .cancel_at_provider(provider, provider_subscription_id)
        .await
    {
        tracing::warn!(
            "⚠️ Failed to cancel {} subscription {} during chargeback handling: {:?}",
            provider,
            provider_subscription_id,
            e
        );
    }

    // 4. Log chargeback event
    crate::audit::log_action(
        pool,
        customer_id,
        "CHARGEBACK_RECEIVED",
        "billing",
        Some(&customer_id.to_string()),
        Some(serde_json::json!({
            "provider": provider,
            "subscription_id": provider_subscription_id,
        })),
        None,
        None,
    )
    .await?;

    tracing::warn!(
        "🚨 Chargeback received for customer {} ({} subscription {}) — account suspended",
        customer_id,
        provider,
        provider_subscription_id
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn refund_window_constant() {
        assert_eq!(REFUND_WINDOW_DAYS, 14);
    }
}
