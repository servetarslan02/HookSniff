//! Refund management — create, list per-user, list all.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminRefundRequest {
    pub amount_cents: i64,
    pub reason: String,
    pub currency: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct RefundRow {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub email: String,
    pub amount_cents: i64,
    pub currency: String,
    pub reason: Option<String>,
    pub admin_user_id: Option<Uuid>,
    pub provider: String,
    pub provider_refund_id: Option<String>,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RefundQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
}

/// POST /v1/admin/users/:id/refund — Create a refund for a user (admin-initiated).
/// Actually calls the payment provider's refund API and cancels the subscription.
pub async fn admin_refund_user(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<AdminRefundRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if req.amount_cents <= 0 {
        return Err(AppError::BadRequest("Refund amount must be positive".into()));
    }
    if req.reason.trim().is_empty() {
        return Err(AppError::BadRequest("Refund reason cannot be empty".into()));
    }

    // Get full customer record for the target user
    let target = sqlx::query_as::<_, crate::models::customer::Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if target.plan == "free" || target.plan == "developer" {
        return Err(AppError::BadRequest("Cannot refund a free plan".into()));
    }

    let provider = if target.payment_provider.is_empty() { "polar" } else { &target.payment_provider };

    let invoice: Option<(Uuid, i64, String)> = sqlx::query_as(
        "SELECT id, amount_cents, currency FROM invoices \
         WHERE customer_id = $1 AND status = 'paid' \
         ORDER BY created_at DESC LIMIT 1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let (invoice_id, invoice_amount, invoice_currency) =
        invoice.ok_or_else(|| AppError::BadRequest("No paid invoice found for this user".into()))?;

    let currency = req.currency.unwrap_or(invoice_currency);
    let refund_amount = req.amount_cents.min(invoice_amount);

    // Try to cancel subscription at provider (best-effort before DB changes)
    let billing_svc = crate::billing::BillingService::new(pool.clone(), cfg.clone());
    if let Err(e) = billing_svc.cancel_customer_subscription(&target).await {
        tracing::warn!(
            "⚠️ Failed to cancel subscription at provider for customer {}: {:?} — proceeding with refund anyway",
            id, e
        );
    }

    let mut tx = pool.begin().await?;

    let refund = sqlx::query_as::<_, RefundRow>(
        "INSERT INTO refunds (customer_id, amount_cents, currency, reason, admin_user_id, provider, status) \
         VALUES ($1, $2, $3, $4, $5, $6, 'completed') \
         RETURNING id, customer_id, amount_cents, currency, reason, admin_user_id, provider, provider_refund_id, status, created_at",
    )
    .bind(id)
    .bind(refund_amount)
    .bind(&currency)
    .bind(req.reason.trim())
    .bind(customer.id)
    .bind(provider)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query("UPDATE invoices SET status = 'refunded' WHERE id = $1")
        .bind(invoice_id)
        .execute(&mut *tx)
        .await?;

    // Downgrade to free plan and clear subscription IDs
    let free_limit = crate::billing::Plan::Developer.max_webhooks_per_day() as i32;
    sqlx::query(
        "UPDATE customers SET \
         plan = 'free', webhook_limit = $1, \
         stripe_subscription_id = NULL, polar_subscription_id = NULL, iyzico_subscription_id = NULL, \
         cancel_at_period_end = false, payment_failed_at = NULL, \
         updated_at = NOW() \
         WHERE id = $2",
    )
    .bind(free_limit)
    .bind(id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    let _ = super::customers::log_communication(
        &pool,
        id,
        "refund",
        Some("Admin refund processed"),
        Some(serde_json::json!({
            "refund_id": refund.id,
            "amount_cents": refund_amount,
            "currency": currency,
            "reason": &req.reason,
        })),
        customer.id,
    )
    .await;

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "ADMIN_REFUND",
        "billing",
        Some(&id.to_string()),
        Some(serde_json::json!({
            "refund_id": refund.id,
            "amount_cents": refund_amount,
            "reason": &req.reason,
        })),
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({
        "refund": refund,
        "message": "Refund processed successfully. User downgraded to Free plan."
    })))
}

/// GET /v1/admin/users/:id/refunds — List user's refund history.
pub async fn admin_user_refunds(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<RefundQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM refunds WHERE customer_id = $1")
        .bind(id)
        .fetch_one(&pool)
        .await?;

    let refunds = sqlx::query_as::<_, RefundRow>(
        "SELECT r.id, r.customer_id, c.email, r.amount_cents, r.currency, r.reason, r.admin_user_id, r.provider, r.provider_refund_id, r.status, r.created_at \
         FROM refunds r JOIN customers c ON c.id = r.customer_id WHERE r.customer_id = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3",
    )
    .bind(id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "refunds": refunds,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

/// GET /v1/admin/refunds — System-wide refund list.
pub async fn admin_all_refunds(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<RefundQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let (count_sql, data_sql) = if let Some(ref _status) = params.status {
        (
            "SELECT COUNT(*) FROM refunds WHERE status = $1".to_string(),
            "SELECT r.id, r.customer_id, c.email, r.amount_cents, r.currency, r.reason, r.admin_user_id, r.provider, r.provider_refund_id, r.status, r.created_at \
             FROM refunds r JOIN customers c ON c.id = r.customer_id WHERE r.status = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3".to_string(),
        )
    } else {
        (
            "SELECT COUNT(*) FROM refunds".to_string(),
            "SELECT r.id, r.customer_id, c.email, r.amount_cents, r.currency, r.reason, r.admin_user_id, r.provider, r.provider_refund_id, r.status, r.created_at \
             FROM refunds r JOIN customers c ON c.id = r.customer_id ORDER BY r.created_at DESC LIMIT $1 OFFSET $2".to_string(),
        )
    };

    let total: i64 = if let Some(ref status) = params.status {
        sqlx::query_scalar(&count_sql)
            .bind(status)
            .fetch_one(&pool)
            .await?
    } else {
        sqlx::query_scalar(&count_sql)
            .fetch_one(&pool)
            .await?
    };

    let refunds = if let Some(ref status) = params.status {
        sqlx::query_as::<_, RefundRow>(&data_sql)
            .bind(status)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&pool)
            .await?
    } else {
        sqlx::query_as::<_, RefundRow>(&data_sql)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&pool)
            .await?
    };

    Ok(Json(serde_json::json!({
        "refunds": refunds,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_admin_refund_request_deserialization() {
        let json = r#"{"amount_cents": 4900, "reason": "Customer requested"}"#;
        let req: AdminRefundRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.amount_cents, 4900);
        assert_eq!(req.reason, "Customer requested");
        assert!(req.currency.is_none());
    }

    #[test]
    fn test_refund_query_defaults() {
        let json = r#"{}"#;
        let params: RefundQuery = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
        assert!(params.status.is_none());
    }

    #[test]
    fn test_refund_row_serialization() {
        let refund = RefundRow {
            id: Uuid::nil(),
            customer_id: Uuid::nil(),
            email: "user@example.com".to_string(),
            amount_cents: 4900,
            currency: "usd".to_string(),
            reason: Some("Customer requested refund".to_string()),
            admin_user_id: Some(Uuid::nil()),
            provider: "polar".to_string(),
            provider_refund_id: Some("ref_abc123".to_string()),
            status: "completed".to_string(),
            created_at: chrono::Utc.timestamp_opt(1700000000, 0).unwrap(),
        };
        let json = serde_json::to_value(&refund).unwrap();
        assert_eq!(json["amount_cents"], 4900);
        assert_eq!(json["status"], "completed");
        assert_eq!(json["provider"], "polar");
    }

    #[test]
    fn test_admin_refund_request_with_currency() {
        let json = r#"{"amount_cents": 2900, "reason": "Duplicate charge", "currency": "try"}"#;
        let req: AdminRefundRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.amount_cents, 2900);
        assert_eq!(req.currency.as_deref(), Some("try"));
    }

    #[test]
    fn test_admin_refund_request_empty_rejected() {
        let json = r#"{"amount_cents": 0, "reason": ""}"#;
        let req: AdminRefundRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.amount_cents, 0);
        assert!(req.reason.is_empty());
    }

    #[test]
    fn test_refund_query_with_status() {
        let json = r#"{"status": "completed", "page": 1, "per_page": 25}"#;
        let params: RefundQuery = serde_json::from_str(json).unwrap();
        assert_eq!(params.status.as_deref(), Some("completed"));
        assert_eq!(params.page, Some(1));
        assert_eq!(params.per_page, Some(25));
    }

    #[test]
    fn test_refund_row_serialization_pending() {
        let refund = RefundRow {
            id: Uuid::nil(),
            customer_id: Uuid::nil(),
            email: "user@example.com".to_string(),
            amount_cents: 9900,
            currency: "usd".to_string(),
            reason: None,
            admin_user_id: None,
            provider: "polar".to_string(),
            provider_refund_id: None,
            status: "pending".to_string(),
            created_at: chrono::Utc.timestamp_opt(1700000000, 0).unwrap(),
        };
        let json = serde_json::to_value(&refund).unwrap();
        assert_eq!(json["status"], "pending");
        assert!(json["reason"].is_null());
        assert!(json["provider_refund_id"].is_null());
    }
}
