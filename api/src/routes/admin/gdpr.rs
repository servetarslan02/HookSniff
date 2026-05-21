//! GDPR data export/delete and bulk email.

use axum::extract::{Extension, Path};
use axum::Json;
use serde::Deserialize;
use sqlx::Row;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::feature_flags::FeatureFlagService;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Types ──────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct BulkEmailRequest {
    pub subject: String,
    pub body: String,
    pub plan_filter: Option<String>,
    pub status_filter: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AdminDeleteDataRequest {
    pub confirm: bool,
    pub reason: String,
}

#[derive(Debug, serde::Serialize)]
pub struct BulkEmailResult {
    pub total_sent: i64,
    pub total_failed: i64,
}

// ── Handlers ──────────────────────────────────────────────

/// GET /v1/admin/users/:id/export — Export all user data (admin GDPR export).
pub async fn admin_export_user_data(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    if !feature_flags.is_enabled("gdpr_data_deletion").await {
        return Err(AppError::BadRequest(
            "GDPR data export is not enabled. Contact support to enable this feature.".into(),
        ));
    }

    let user = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let endpoints: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, url, description, is_active, created_at FROM endpoints WHERE customer_id = $1 ORDER BY created_at",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "url": row.get::<String, _>("url"),
        "description": row.get::<Option<String>, _>("description"),
        "is_active": row.get::<bool, _>("is_active"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let deliveries: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, endpoint_id, event_type, status, attempt_count, created_at FROM deliveries WHERE customer_id = $1 AND created_at > NOW() - INTERVAL '90 days' ORDER BY created_at DESC LIMIT 10000",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "endpoint_id": row.get::<Uuid, _>("endpoint_id"),
        "event_type": row.get::<Option<String>, _>("event_type"),
        "status": row.get::<String, _>("status"),
        "attempt_count": row.get::<i32, _>("attempt_count"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let invoices: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, amount_cents, currency, plan, status, provider, paid_at, created_at FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "amount_cents": row.get::<i64, _>("amount_cents"),
        "currency": row.get::<String, _>("currency"),
        "plan": row.get::<String, _>("plan"),
        "status": row.get::<String, _>("status"),
        "provider": row.get::<String, _>("provider"),
        "paid_at": row.get::<Option<chrono::DateTime<chrono::Utc>>, _>("paid_at"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let notes: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, content, admin_user_id, created_at FROM customer_notes WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "content": row.get::<String, _>("content"),
        "admin_user_id": row.get::<Uuid, _>("admin_user_id"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let tags: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, tag, admin_user_id, created_at FROM customer_tags WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "tag": row.get::<String, _>("tag"),
        "admin_user_id": row.get::<Uuid, _>("admin_user_id"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let communications: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, type, subject, details, admin_user_id, created_at FROM communication_history WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "type": row.get::<String, _>("type"),
        "subject": row.get::<Option<String>, _>("subject"),
        "details": row.get::<Option<serde_json::Value>, _>("details"),
        "admin_user_id": row.get::<Option<Uuid>, _>("admin_user_id"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let audit_logs: Vec<serde_json::Value> = sqlx::query(
        "SELECT id, action, resource_type, resource_id, details, ip_address, created_at FROM audit_log WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 5000",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(|row| serde_json::json!({
        "id": row.get::<Uuid, _>("id"),
        "action": row.get::<String, _>("action"),
        "resource_type": row.get::<Option<String>, _>("resource_type"),
        "resource_id": row.get::<Option<String>, _>("resource_id"),
        "details": row.get::<Option<serde_json::Value>, _>("details"),
        "ip_address": row.get::<Option<String>, _>("ip_address"),
        "created_at": row.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
    }))
    .collect();

    let _ = super::customers::log_communication(
        &pool,
        id,
        "gdpr_export",
        Some("Admin GDPR data export"),
        Some(serde_json::json!({ "admin_id": customer.id })),
        customer.id,
    )
    .await;

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "GDPR_EXPORT",
        "customer",
        Some(&id.to_string()),
        None,
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({
        "export_date": chrono::Utc::now().to_rfc3339(),
        "account": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "plan": user.plan,
            "is_active": user.is_active,
            "email_verified": user.email_verified,
            "created_at": user.created_at,
        },
        "endpoints": endpoints,
        "deliveries": deliveries,
        "invoices": invoices,
        "notes": notes,
        "tags": tags,
        "communications": communications,
        "audit_logs": audit_logs,
    })))
}

/// DELETE /v1/admin/users/:id/data — Delete all user data (admin GDPR delete).
pub async fn admin_delete_user_data(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    Path(id): Path<Uuid>,
    Json(req): Json<AdminDeleteDataRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if !feature_flags.is_enabled("gdpr_data_deletion").await {
        return Err(AppError::BadRequest(
            "GDPR data deletion is not enabled. Contact support to enable this feature.".into(),
        ));
    }

    if !req.confirm {
        return Err(AppError::BadRequest(
            "confirm must be true to delete user data".into(),
        ));
    }
    if req.reason.trim().is_empty() {
        return Err(AppError::BadRequest(
            "reason is required for GDPR deletion".into(),
        ));
    }

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM customers WHERE id = $1)")
        .bind(id)
        .fetch_one(&pool)
        .await?;
    if !exists {
        return Err(AppError::NotFound);
    }

    if id == customer.id {
        return Err(AppError::BadRequest(
            "Cannot delete your own data via admin".into(),
        ));
    }

    let is_target_admin: bool =
        sqlx::query_scalar("SELECT is_admin FROM customers WHERE id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;
    if is_target_admin {
        return Err(AppError::BadRequest("Cannot delete admin user data".into()));
    }

    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM delivery_attempts WHERE delivery_id IN (SELECT id FROM deliveries WHERE customer_id = $1)")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM deliveries WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM endpoints WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM api_keys WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM payment_transactions WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM invoices WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM refunds WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM customer_notes WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM customer_tags WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM communication_history WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM audit_log WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM refresh_tokens WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM password_reset_tokens WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM email_verification_tokens WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM notifications WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM devices WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;
    sqlx::query("DELETE FROM alert_rules WHERE customer_id = $1")
        .bind(id).execute(&mut *tx).await?;

    sqlx::query(
        "UPDATE customers SET \
         plan = 'free', webhook_limit = 1000, webhook_count = 0, \
         paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
         card_last4 = NULL, card_brand = NULL, card_exp_month = NULL, card_exp_year = NULL, \
         billing_interval = NULL, 
         stripe_subscription_id = NULL, polar_subscription_id = NULL, iyzico_subscription_id = NULL, \
         cancel_at_period_end = false, payment_failed_at = NULL, \
         updated_at = NOW() \
         WHERE id = $1",
    )
    .bind(id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    let _ = super::customers::log_communication(
        &pool,
        id,
        "gdpr_delete",
        Some("Admin GDPR data deletion"),
        Some(serde_json::json!({ "admin_id": customer.id, "reason": &req.reason })),
        customer.id,
    )
    .await;

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "GDPR_DATA_DELETE",
        "customer",
        Some(&id.to_string()),
        Some(serde_json::json!({ "reason": &req.reason })),
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({
        "message": "All user data has been permanently deleted. Account downgraded to Free.",
        "deleted_at": chrono::Utc::now().to_rfc3339(),
    })))
}

/// POST /v1/admin/bulk-email — Send bulk email to users by segment.
pub async fn admin_bulk_email(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(email): Extension<crate::email::EmailProvider>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    Json(req): Json<BulkEmailRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    if !email.is_configured() {
        return Err(AppError::BadRequest(
            "Email provider not configured. Set RESEND_API_KEY or GCP_SA_JSON environment variable."
                .into(),
        ));
    }

    let rl_key = format!("admin_bulk_email:{}", customer.id);
    let rl_result = rate_limiter.check_with_window(&rl_key, 5, 3600).await;
    if !rl_result.allowed {
        return Err(AppError::RateLimitExceeded);
    }

    if req.subject.trim().is_empty() {
        return Err(AppError::BadRequest("Email subject cannot be empty".into()));
    }
    if req.body.trim().is_empty() {
        return Err(AppError::BadRequest("Email body cannot be empty".into()));
    }
    if req.subject.len() > 500 {
        return Err(AppError::BadRequest(
            "Email subject too long (max 500 chars)".into(),
        ));
    }
    if req.body.len() > 100_000 {
        return Err(AppError::BadRequest(
            "Email body too long (max 100KB)".into(),
        ));
    }

    let mut query = "SELECT id, email, name FROM customers WHERE is_active = true".to_string();
    let mut bind_values: Vec<String> = Vec::new();

    if let Some(ref plan) = req.plan_filter {
        bind_values.push(plan.clone());
        query.push_str(&format!(" AND plan = ${}", bind_values.len()));
    } else {
        query.push_str(" AND plan NOT IN ('free', 'developer')");
    }
    if let Some(ref status) = req.status_filter {
        if status == "verified" {
            query.push_str(" AND email_verified = true");
        } else if status == "unverified" {
            query.push_str(" AND email_verified = false");
        }
    }

    query.push_str(" ORDER BY created_at DESC LIMIT 5000");

    let users: Vec<(Uuid, String, Option<String>)> = if bind_values.is_empty() {
        sqlx::query_as(&query).fetch_all(&pool).await?
    } else {
        let mut q = sqlx::query_as(&query);
        for val in &bind_values {
            q = q.bind(val);
        }
        q.fetch_all(&pool).await?
    };

    if users.is_empty() {
        return Ok(Json(serde_json::json!({
            "total_sent": 0,
            "total_failed": 0,
            "skipped_free": 0,
            "message": "No users match the filter criteria"
        })));
    }

    let mut sent = 0i64;
    let mut failed = 0i64;

    for chunk in users.chunks(50) {
        for (user_id, email_addr, name) in chunk {
            let personalized_body = req
                .body
                .replace("{name}", &name.as_deref().unwrap_or("User"))
                .replace("{email}", email_addr);

            match email
                .send_contact_email(email_addr, &req.subject, &personalized_body)
                .await
            {
                Ok(_) => {
                    sent += 1;
                    let _ = super::customers::log_communication(
                        &pool,
                        *user_id,
                        "bulk_email",
                        Some(&req.subject),
                        Some(serde_json::json!({ "batch": true, "admin_id": customer.id })),
                        customer.id,
                    )
                    .await;
                }
                Err(_) => {
                    failed += 1;
                }
            }
        }

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    }

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "BULK_EMAIL_SENT",
        "customer",
        None,
        Some(serde_json::json!({
            "subject": &req.subject,
            "plan_filter": &req.plan_filter,
            "status_filter": &req.status_filter,
            "sent": sent,
            "failed": failed,
        })),
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({
        "total_sent": sent,
        "total_failed": failed,
        "message": format!("Bulk email complete: {} sent, {} failed", sent, failed),
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bulk_email_request_deserialization() {
        let json = r#"{"subject": "New Feature", "body": "Hello {name}, check out our new feature!"}"#;
        let req: BulkEmailRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.subject, "New Feature");
        assert!(req.body.contains("{name}"));
        assert!(req.plan_filter.is_none());
    }

    #[test]
    fn test_admin_delete_data_request_deserialization() {
        let json = r#"{"confirm": true, "reason": "User requested account deletion via support ticket #1234"}"#;
        let req: AdminDeleteDataRequest = serde_json::from_str(json).unwrap();
        assert!(req.confirm);
        assert!(req.reason.contains("support ticket"));
    }

    #[test]
    fn test_bulk_email_result_serialization() {
        let result = BulkEmailResult {
            total_sent: 150,
            total_failed: 3,
        };
        let json = serde_json::to_value(&result).unwrap();
        assert_eq!(json["total_sent"], 150);
        assert_eq!(json["total_failed"], 3);
    }
}

    #[test]
    fn test_admin_delete_data_request_confirm_false() {
        let json = r#"{"confirm": false, "reason": "testing"}"#;
        let req: AdminDeleteDataRequest = serde_json::from_str(json).unwrap();
        assert!(!req.confirm);
    }

    #[test]
    fn test_bulk_email_request_with_filters() {
        let json = r#"{"subject": "Pro Update", "body": "Hi", "plan_filter": "pro", "status_filter": "verified"}"#;
        let req: BulkEmailRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan_filter.as_deref(), Some("pro"));
        assert_eq!(req.status_filter.as_deref(), Some("verified"));
    }
