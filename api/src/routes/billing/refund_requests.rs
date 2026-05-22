//! Customer-facing refund request endpoints.
//!
//! Flow:
//! 1. Customer submits a refund request with category + description
//! 2. Request is saved as "pending"
//! 3. Admin reviews in admin panel
//! 4. If approved → refund is processed automatically

use axum::extract::Extension;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;

/// Refund request categories that customers can choose from.
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum RefundCategory {
    AccidentalPurchase,
    NotSatisfied,
    MissingFeatures,
    TechnicalIssues,
    BillingError,
    Other,
}

impl RefundCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::AccidentalPurchase => "accidental_purchase",
            Self::NotSatisfied => "not_satisfied",
            Self::MissingFeatures => "missing_features",
            Self::TechnicalIssues => "technical_issues",
            Self::BillingError => "billing_error",
            Self::Other => "other",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "accidental_purchase" => Self::AccidentalPurchase,
            "not_satisfied" => Self::NotSatisfied,
            "missing_features" => Self::MissingFeatures,
            "technical_issues" => Self::TechnicalIssues,
            "billing_error" => Self::BillingError,
            _ => Self::Other,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateRefundRequest {
    pub category: RefundCategory,
    pub description: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct RefundRequestRow {
    pub id: uuid::Uuid,
    pub customer_id: uuid::Uuid,
    pub category: String,
    pub description: String,
    pub invoice_id: Option<uuid::Uuid>,
    pub amount_cents: i64,
    pub currency: String,
    pub status: String,
    pub reviewed_by: Option<uuid::Uuid>,
    pub reviewed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub admin_notes: Option<String>,
    pub refund_id: Option<uuid::Uuid>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// POST /v1/billing/refund-request — Create a refund request.
pub async fn create_refund_request(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateRefundRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // RBAC: admin required to create refund requests
    super::super::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    // Can't request refund on free plan
    if customer.plan == "developer" || customer.plan == "free" {
        return Err(AppError::BadRequest(
            "Cannot request refund on a free plan".into(),
        ));
    }

    // Check for existing pending request
    let existing_pending: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM refund_requests WHERE customer_id = $1 AND status = 'pending')",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if existing_pending {
        return Err(AppError::BadRequest(
            "You already have a pending refund request. Please wait for it to be reviewed.".into(),
        ));
    }

    // Get latest paid invoice
    let invoice: Option<(uuid::Uuid, i64, String)> = sqlx::query_as(
        "SELECT id, amount_cents, currency FROM invoices \
         WHERE customer_id = $1 AND status = 'paid' \
         ORDER BY created_at DESC LIMIT 1",
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let (invoice_id, amount_cents, currency) =
        invoice.ok_or_else(|| AppError::BadRequest("No paid invoice found".into()))?;

    // Validate description
    let description = req.description.trim().to_string();
    if description.is_empty() {
        return Err(AppError::BadRequest(
            "Please provide a description for your refund request".into(),
        ));
    }
    if description.len() > 2000 {
        return Err(AppError::BadRequest(
            "Description is too long (max 2000 characters)".into(),
        ));
    }

    // Create the request
    let row = sqlx::query_as::<_, RefundRequestRow>(
        "INSERT INTO refund_requests \
         (customer_id, category, description, invoice_id, amount_cents, currency, status) \
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') \
         RETURNING id, customer_id, category, description, invoice_id, amount_cents, currency, \
                   status, reviewed_by, reviewed_at, admin_notes, refund_id, created_at, updated_at",
    )
    .bind(customer.id)
    .bind(req.category.as_str())
    .bind(&description)
    .bind(invoice_id)
    .bind(amount_cents)
    .bind(&currency)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "📋 Refund request created by customer {} (category: {}, amount: {} {})",
        customer.id,
        req.category.as_str(),
        amount_cents as f64 / 100.0,
        currency
    );

    Ok(Json(serde_json::json!({
        "request": row,
        "message": "Refund request submitted. Our team will review it shortly."
    })))
}

/// GET /v1/billing/refund-requests — List customer's own refund requests.
pub async fn list_my_refund_requests(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<RefundRequestRow>>, AppError> {
    // RBAC: viewer or higher to view refund requests
    super::super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let rows = sqlx::query_as::<_, RefundRequestRow>(
        "SELECT id, customer_id, category, description, invoice_id, amount_cents, currency, \
                status, reviewed_by, reviewed_at, admin_notes, refund_id, created_at, updated_at \
         FROM refund_requests WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}
