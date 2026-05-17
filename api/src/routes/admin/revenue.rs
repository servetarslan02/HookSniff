//! Revenue metrics, cohort analysis, invoices, payments.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::require_admin;

// ── Types ──────────────────────────────────────────────────

#[derive(Debug, Serialize, FromRow)]
pub struct InvoiceRow {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub amount_cents: i64,
    pub currency: String,
    pub plan: String,
    pub status: String,
    pub provider: String,
    pub provider_invoice_id: Option<String>,
    pub paid_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct PaymentTransactionRow {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub amount_cents: i64,
    pub currency: String,
    pub status: String,
    pub provider: String,
    pub provider_transaction_id: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct RevenueMetrics {
    pub mrr: f64,
    pub arr: f64,
    pub arpu: f64,
    pub ltv: f64,
    pub nrr: f64,
    pub expansion_revenue: f64,
    pub total_customers: i64,
    pub paying_customers: i64,
    pub churn_rate: f64,
    pub avg_months_retained: f64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct CohortRow {
    pub cohort_month: String,
    pub customers_signed_up: i64,
    pub customers_active: i64,
    pub total_revenue_cents: i64,
    pub retention_rate: f64,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct InvoiceQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PaymentQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CohortQuery {
    pub months: Option<i32>,
}

// ── Handlers ──────────────────────────────────────────────

/// GET /v1/admin/users/:id/invoices — List user's invoices.
pub async fn admin_user_invoices(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<InvoiceQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let (count_sql, data_sql) = if let Some(ref _status) = params.status {
        (
            "SELECT COUNT(*) FROM invoices WHERE customer_id = $1 AND status = $2".to_string(),
            format!("SELECT id, customer_id, amount_cents, currency, plan, status, provider, provider_invoice_id, paid_at, created_at FROM invoices WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4"),
        )
    } else {
        (
            "SELECT COUNT(*) FROM invoices WHERE customer_id = $1".to_string(),
            "SELECT id, customer_id, amount_cents, currency, plan, status, provider, provider_invoice_id, paid_at, created_at FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3".to_string(),
        )
    };

    let total: i64 = if let Some(ref status) = params.status {
        sqlx::query_scalar(&count_sql)
            .bind(id)
            .bind(status)
            .fetch_one(&pool)
            .await?
    } else {
        sqlx::query_scalar(&count_sql)
            .bind(id)
            .fetch_one(&pool)
            .await?
    };

    let invoices = if let Some(ref status) = params.status {
        sqlx::query_as::<_, InvoiceRow>(&data_sql)
            .bind(id)
            .bind(status)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&pool)
            .await?
    } else {
        sqlx::query_as::<_, InvoiceRow>(&data_sql)
            .bind(id)
            .bind(per_page)
            .bind(offset)
            .fetch_all(&pool)
            .await?
    };

    Ok(Json(serde_json::json!({
        "invoices": invoices,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

/// GET /v1/admin/users/:id/payments — List user's payment transactions.
pub async fn admin_user_payments(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<PaymentQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let total: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM payment_transactions WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let payments = sqlx::query_as::<_, PaymentTransactionRow>(
        "SELECT id, customer_id, amount_cents, currency, status, provider, provider_transaction_id, metadata, created_at FROM payment_transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    )
    .bind(id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "payments": payments,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

/// GET /v1/admin/revenue/metrics — ARPU, LTV, NRR, expansion revenue.
pub async fn admin_revenue_metrics(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let total_customers: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM customers")
        .fetch_one(&pool)
        .await?;

    let paying_customers: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM customers WHERE plan NOT IN ('free', 'developer')")
            .fetch_one(&pool)
            .await?;

    let mrr: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0) as mrr
           FROM invoices
           WHERE status = 'paid'
             AND paid_at >= NOW() - INTERVAL '30 days'"#,
    )
    .fetch_one(&pool)
    .await?;

    let mrr_val = mrr.0.unwrap_or(0.0);
    let arr = mrr_val * 12.0;

    let arpu = if paying_customers > 0 {
        mrr_val / paying_customers as f64
    } else {
        0.0
    };

    let avg_months: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(AVG(
             CASE WHEN COUNT(*) > 1
               THEN EXTRACT(EPOCH FROM (MAX(paid_at) - MIN(paid_at))) / 2592000.0
               ELSE 0.0
             END
           ), 0.0)
           FROM invoices WHERE status = 'paid'
           GROUP BY customer_id"#,
    )
    .fetch_one(&pool)
    .await?;
    let avg_months_val = avg_months.0.unwrap_or(0.0);

    let ltv = arpu * avg_months_val;

    let churned: (i64,) = sqlx::query_as(
        r#"SELECT COUNT(*) FROM (
             SELECT customer_id FROM invoices WHERE status = 'paid'
             GROUP BY customer_id
             HAVING MAX(paid_at) < NOW() - INTERVAL '30 days'
           ) churned"#,
    )
    .fetch_one(&pool)
    .await?;
    let churn_rate = if paying_customers > 0 {
        (churned.0 as f64 / paying_customers as f64) * 100.0
    } else {
        0.0
    };

    let current_month_rev: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(SUM(i.amount_cents::double precision / 100.0), 0.0)
           FROM invoices i
           JOIN customers c ON c.id = i.customer_id
           WHERE i.status = 'paid'
             AND i.paid_at >= DATE_TRUNC('month', NOW())
             AND c.created_at < DATE_TRUNC('month', NOW())"#,
    )
    .fetch_one(&pool)
    .await?;

    let last_month_rev: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(SUM(i.amount_cents::double precision / 100.0), 0.0)
           FROM invoices i
           JOIN customers c ON c.id = i.customer_id
           WHERE i.status = 'paid'
             AND i.paid_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
             AND i.paid_at < DATE_TRUNC('month', NOW())
             AND c.created_at < DATE_TRUNC('month', NOW() - INTERVAL '1 month')"#,
    )
    .fetch_one(&pool)
    .await?;

    let nrr = if last_month_rev.0.unwrap_or(0.0) > 0.0 {
        (current_month_rev.0.unwrap_or(0.0) / last_month_rev.0.unwrap_or(0.0)) * 100.0
    } else {
        100.0
    };

    let expansion: (Option<f64>,) = sqlx::query_as(
        r#"SELECT COALESCE(SUM(amount_cents::double precision / 100.0), 0.0)
           FROM invoices i
           JOIN customers c ON c.id = i.customer_id
           WHERE i.status = 'paid'
             AND i.paid_at >= DATE_TRUNC('month', NOW())
             AND c.plan IN ('startup', 'pro', 'enterprise')
             AND c.created_at < DATE_TRUNC('month', NOW()) - INTERVAL '1 month'"#,
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "mrr": mrr_val,
        "arr": arr,
        "arpu": arpu,
        "ltv": ltv,
        "nrr": nrr,
        "expansion_revenue": expansion.0.unwrap_or(0.0),
        "total_customers": total_customers,
        "paying_customers": paying_customers,
        "churn_rate": churn_rate,
        "avg_months_retained": avg_months_val,
    })))
}

/// GET /v1/admin/revenue/cohorts — Monthly cohort analysis.
pub async fn admin_revenue_cohorts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<CohortQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let months = params.months.unwrap_or(12).clamp(1, 24);

    let cohorts = sqlx::query_as::<_, CohortRow>(
        r#"WITH cohort_base AS (
             SELECT
               TO_CHAR(DATE_TRUNC('month', c.created_at), 'YYYY-MM') as cohort_month,
               c.id as customer_id,
               DATE_TRUNC('month', c.created_at) as cohort_start
             FROM customers c
             WHERE c.created_at >= NOW() - ($1 || ' months')::interval
           ),
           cohort_revenue AS (
             SELECT
               cb.cohort_month,
               COUNT(DISTINCT cb.customer_id) as customers_signed_up,
               COUNT(DISTINCT CASE WHEN i.paid_at >= NOW() - INTERVAL '30 days' THEN cb.customer_id END) as customers_active,
               COALESCE(SUM(
                 CASE WHEN i.paid_at >= cb.cohort_start
                   AND i.paid_at < cb.cohort_start + INTERVAL '1 month'
                 THEN i.amount_cents ELSE 0 END
               ), 0) as total_revenue_cents
             FROM cohort_base cb
             LEFT JOIN invoices i ON i.customer_id = cb.customer_id AND i.status = 'paid'
             GROUP BY cb.cohort_month
           )
           SELECT
             cohort_month,
             customers_signed_up,
             customers_active,
             total_revenue_cents,
             CASE WHEN customers_signed_up > 0
               THEN ROUND(customers_active::numeric / customers_signed_up * 100, 1)
               ELSE 0
             END as retention_rate
           FROM cohort_revenue
           ORDER BY cohort_month DESC"#,
    )
    .bind(months)
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "cohorts": cohorts,
        "months": months,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_invoice_query_defaults() {
        let json = r#"{}"#;
        let params: InvoiceQuery = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
        assert!(params.status.is_none());
    }

    #[test]
    fn test_payment_query_defaults() {
        let json = r#"{}"#;
        let params: PaymentQuery = serde_json::from_str(json).unwrap();
        assert!(params.page.is_none());
        assert!(params.per_page.is_none());
    }

    #[test]
    fn test_cohort_query_defaults() {
        let json = r#"{}"#;
        let params: CohortQuery = serde_json::from_str(json).unwrap();
        assert!(params.months.is_none());
    }

    #[test]
    fn test_invoice_row_serialization() {
        let invoice = InvoiceRow {
            id: Uuid::nil(),
            customer_id: Uuid::nil(),
            amount_cents: 4900,
            currency: "usd".to_string(),
            plan: "pro".to_string(),
            status: "paid".to_string(),
            provider: "polar".to_string(),
            provider_invoice_id: Some("inv_123".to_string()),
            paid_at: Some(chrono::Utc.timestamp_opt(1700000000, 0).unwrap()),
            created_at: chrono::Utc.timestamp_opt(1700000000, 0).unwrap(),
        };
        let json = serde_json::to_value(&invoice).unwrap();
        assert_eq!(json["amount_cents"], 4900);
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["status"], "paid");
    }

    #[test]
    fn test_revenue_metrics_serialization() {
        let metrics = RevenueMetrics {
            mrr: 5000.0,
            arr: 60000.0,
            arpu: 50.0,
            ltv: 300.0,
            nrr: 105.0,
            expansion_revenue: 500.0,
            total_customers: 200,
            paying_customers: 100,
            churn_rate: 5.0,
            avg_months_retained: 6.0,
        };
        let json = serde_json::to_value(&metrics).unwrap();
        assert_eq!(json["mrr"], 5000.0);
        assert_eq!(json["arr"], 60000.0);
        assert_eq!(json["paying_customers"], 100);
    }

    #[test]
    fn test_cohort_row_serialization() {
        let cohort = CohortRow {
            cohort_month: "2026-01".to_string(),
            customers_signed_up: 50,
            customers_active: 35,
            total_revenue_cents: 1715000,
            retention_rate: 70.0,
        };
        let json = serde_json::to_value(&cohort).unwrap();
        assert_eq!(json["cohort_month"], "2026-01");
        assert_eq!(json["retention_rate"], 70.0);
    }
}
