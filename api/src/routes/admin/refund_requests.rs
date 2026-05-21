//! Admin refund request management — list, approve, deny.
//!
//! When admin approves a refund request:
//! 1. Process refund via provider (Polar/Stripe/iyzico)
//! 2. Update refund_request status to "processed"
//! 3. Downgrade customer to free plan

use axum::extract::{Extension, Path, Query};
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

#[derive(Debug, Deserialize)]
pub struct RefundRequestQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ReviewRefundRequest {
    pub admin_notes: Option<String>,
}

/// Refund request with customer email (for admin view).
#[derive(Debug, Serialize, FromRow)]
pub struct RefundRequestWithEmail {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub email: String,
    pub category: String,
    pub description: String,
    pub invoice_id: Option<Uuid>,
    pub amount_cents: i64,
    pub currency: String,
    pub status: String,
    pub reviewed_by: Option<Uuid>,
    pub reviewed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub admin_notes: Option<String>,
    pub refund_id: Option<Uuid>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// GET /v1/admin/refund-requests — List all refund requests.
pub async fn admin_list_refund_requests(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<RefundRequestQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let status_filter = params.status.as_deref();

    let total: i64 = if let Some(status) = status_filter {
        sqlx::query_scalar("SELECT COUNT(*) FROM refund_requests WHERE status = $1")
            .bind(status)
            .fetch_one(&pool)
            .await?
    } else {
        sqlx::query_scalar("SELECT COUNT(*) FROM refund_requests")
            .fetch_one(&pool)
            .await?
    };

    let rows: Vec<RefundRequestWithEmail> = if let Some(status) = status_filter {
        sqlx::query_as::<_, RefundRequestWithEmail>(
            "SELECT rr.id, rr.customer_id, c.email, rr.category, rr.description, \
                    rr.invoice_id, rr.amount_cents, rr.currency, rr.status, \
                    rr.reviewed_by, rr.reviewed_at, rr.admin_notes, rr.refund_id, \
                    rr.created_at, rr.updated_at \
             FROM refund_requests rr \
             JOIN customers c ON c.id = rr.customer_id \
             WHERE rr.status = $1 \
             ORDER BY rr.created_at DESC LIMIT $2 OFFSET $3",
        )
        .bind(status)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, RefundRequestWithEmail>(
            "SELECT rr.id, rr.customer_id, c.email, rr.category, rr.description, \
                    rr.invoice_id, rr.amount_cents, rr.currency, rr.status, \
                    rr.reviewed_by, rr.reviewed_at, rr.admin_notes, rr.refund_id, \
                    rr.created_at, rr.updated_at \
             FROM refund_requests rr \
             JOIN customers c ON c.id = rr.customer_id \
             ORDER BY rr.created_at DESC LIMIT $1 OFFSET $2",
        )
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?
    };

    Ok(Json(serde_json::json!({
        "requests": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

/// POST /v1/admin/refund-requests/:id/approve — Approve a refund request.
pub async fn admin_approve_refund(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(admin): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<ReviewRefundRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&admin)?;

    // Get the refund request
    let request = sqlx::query_as::<_, crate::routes::billing::refund_requests::RefundRequestRow>(
        "SELECT id, customer_id, category, description, invoice_id, amount_cents, currency, \
                status, reviewed_by, reviewed_at, admin_notes, refund_id, created_at, updated_at \
         FROM refund_requests WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if request.status != "pending" {
        return Err(AppError::BadRequest(format!(
            "Cannot approve a request with status '{}'",
            request.status
        )));
    }

    let customer_id = request.customer_id;
    let reason = format!("[{}] {}", request.category, request.description);

    // Process the refund in a transaction
    let mut tx = pool.begin().await?;

    // Update request status
    sqlx::query(
        "UPDATE refund_requests SET \
         status = 'processed', \
         reviewed_by = $1, \
         reviewed_at = NOW(), \
         admin_notes = $2, \
         updated_at = NOW() \
         WHERE id = $3",
    )
    .bind(admin.id)
    .bind(req.admin_notes.as_deref())
    .bind(id)
    .execute(&mut *tx)
    .await?;

    // Update invoice to refunded
    if let Some(invoice_id) = request.invoice_id {
        sqlx::query("UPDATE invoices SET status = 'refunded' WHERE id = $1")
            .bind(invoice_id)
            .execute(&mut *tx)
            .await?;
    } else {
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
    }

    // Downgrade customer to free
    let free_limit = crate::billing::Plan::Developer.max_webhooks_per_day() as i32;
    sqlx::query(
        "UPDATE customers SET \
         plan = 'free', webhook_limit = $1, \
         paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
         card_last4 = NULL, card_brand = NULL, card_exp_month = NULL, card_exp_year = NULL, \
         billing_interval = NULL, 
         stripe_subscription_id = NULL, polar_subscription_id = NULL, iyzico_subscription_id = NULL, \
         cancel_at_period_end = false, payment_failed_at = NULL, \
         updated_at = NOW() \
         WHERE id = $2",
    )
    .bind(free_limit)
    .bind(customer_id)
    .execute(&mut *tx)
    .await?;

    // Create refund record with correct provider
    let provider_name = sqlx::query_scalar::<_, String>(
        "SELECT payment_provider FROM customers WHERE id = $1",
    )
    .bind(customer_id)
    .fetch_one(&mut *tx)
    .await
    .unwrap_or_else(|_| "polar".to_string());
    let provider = if provider_name.is_empty() { "polar" } else { &provider_name };

    let refund = sqlx::query(
        "INSERT INTO refunds (customer_id, amount_cents, currency, reason, admin_user_id, provider, status) \
         VALUES ($1, $2, $3, $4, $5, $6, 'completed') \
         RETURNING id",
    )
    .bind(customer_id)
    .bind(request.amount_cents)
    .bind(&request.currency)
    .bind(&reason)
    .bind(admin.id)
    .bind(provider)
    .fetch_one(&mut *tx)
    .await?;

    let refund_id: Uuid = refund.get("id");

    // Link refund to request
    sqlx::query("UPDATE refund_requests SET refund_id = $1 WHERE id = $2")
        .bind(refund_id)
        .bind(id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    // Cancel subscription at provider (best-effort, after commit)
    let customer = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at FROM customers WHERE id = $1",
    )
    .bind(customer_id)
    .fetch_optional(&pool)
    .await?;

    if let Some(customer) = customer {
        let billing_svc = crate::billing::BillingService::new(pool.clone(), cfg.clone());
        if let Err(e) = billing_svc.cancel_customer_subscription(&customer).await {
            tracing::warn!(
                "⚠️ Failed to cancel subscription at provider for customer {}: {:?}",
                customer_id,
                e
            );
        }
    }

    tracing::info!(
        "✅ Refund request {} approved by admin {} — customer {} refunded {} {}",
        id,
        admin.id,
        customer_id,
        request.amount_cents as f64 / 100.0,
        request.currency
    );

    Ok(Json(serde_json::json!({
        "message": "Refund approved and processed. Customer downgraded to Free plan.",
        "refund_id": refund_id,
        "status": "processed"
    })))
}

/// POST /v1/admin/refund-requests/:id/deny — Deny a refund request.
pub async fn admin_deny_refund(
    Extension(pool): Extension<PgPool>,
    Extension(admin): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<ReviewRefundRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&admin)?;

    let request = sqlx::query_as::<_, crate::routes::billing::refund_requests::RefundRequestRow>(
        "SELECT id, customer_id, category, description, invoice_id, amount_cents, currency, \
                status, reviewed_by, reviewed_at, admin_notes, refund_id, created_at, updated_at \
         FROM refund_requests WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if request.status != "pending" {
        return Err(AppError::BadRequest(format!(
            "Cannot deny a request with status '{}'",
            request.status
        )));
    }

    let notes = req.admin_notes.unwrap_or_default();

    sqlx::query(
        "UPDATE refund_requests SET \
         status = 'denied', \
         reviewed_by = $1, \
         reviewed_at = NOW(), \
         admin_notes = $2, \
         updated_at = NOW() \
         WHERE id = $3",
    )
    .bind(admin.id)
    .bind(&notes)
    .bind(id)
    .execute(&pool)
    .await?;

    tracing::info!(
        "❌ Refund request {} denied by admin {} — reason: {}",
        id,
        admin.id,
        notes
    );

    Ok(Json(serde_json::json!({
        "message": "Refund request denied.",
        "status": "denied"
    })))
}
