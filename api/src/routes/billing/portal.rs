use super::*;

pub async fn open_portal(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PortalResponse>, AppError> {
    // RBAC: admin required to open billing portal
    super::super::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    let billing_svc = BillingService::new(pool, cfg);
    let result = billing_svc.portal(&customer).await?;

    Ok(Json(PortalResponse {
        url: result.url,
        provider: result.provider,
    }))
}

// ──────────────────────────────────────────────────────────────
// GET /v1/billing/usage — Current usage
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub(crate) struct UsageResponse {
    pub(crate) plan: String,
    pub(crate) payment_provider: String,
    pub(crate) webhooks: UsageCounter,
    pub(crate) endpoints: UsageCounter,
    pub(crate) rate_limit: RateLimitInfo,
    pub(crate) retention_days: i64,
    /// How many days of data the customer currently has (days since oldest delivery)
    pub(crate) data_age_days: i64,
    /// How many days until the oldest data gets deleted (retention_days - data_age_days)
    pub(crate) data_expires_in_days: i64,
    pub(crate) period: PeriodInfo,
}

#[derive(Serialize)]
pub(crate) struct UsageCounter {
    pub(crate) used: u64,
    pub(crate) limit: Option<u64>,
    pub(crate) remaining: u64,
}

#[derive(Serialize)]
pub(crate) struct RateLimitInfo {
    pub(crate) requests_per_minute: u32,
}

#[derive(Serialize)]
pub(crate) struct PeriodInfo {
    pub(crate) start: String,
    pub(crate) end: String,
}


pub async fn get_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<UsageResponse>, AppError> {
    // RBAC: viewer or higher to view usage
    super::super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let plan = Plan::parse_str(&customer.plan);

    // Count endpoints
    let endpoint_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    let webhook_limit = plan.max_webhooks_per_day();
    let endpoint_limit = plan.max_endpoints() as u64;

    // Calculate data age (days since oldest delivery)
    let oldest_delivery: Option<chrono::NaiveDateTime> = sqlx::query_scalar(
        "SELECT MIN(created_at) FROM deliveries WHERE customer_id = $1"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let retention = plan.retention_days();
    let data_age_days = oldest_delivery
        .map(|oldest| (chrono::Utc::now().naive_utc() - oldest).num_days())
        .unwrap_or(0);
    let data_expires_in_days = (retention - data_age_days).max(0);

    Ok(Json(UsageResponse {
        plan: plan.as_str().to_string(),
        payment_provider: customer.payment_provider.clone(),
        webhooks: UsageCounter {
            used: customer.webhook_count as u64,
            limit: if webhook_limit >= u64::MAX / 2 { None } else { Some(webhook_limit) },
            remaining: webhook_limit.saturating_sub(customer.webhook_count as u64),
        },
        endpoints: UsageCounter {
            used: endpoint_count.0 as u64,
            limit: if endpoint_limit >= u32::MAX as u64 { None } else { Some(endpoint_limit) },
            remaining: (plan.max_endpoints() as i64 - endpoint_count.0).max(0) as u64,
        },
        rate_limit: RateLimitInfo {
            requests_per_minute: plan.max_requests_per_minute(),
        },
        retention_days: retention,
        data_age_days,
        data_expires_in_days,
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
// GET /v1/billing/invoices — Invoice history
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub(crate) struct InvoiceResponse {
    pub(crate) id: String,
    pub(crate) date: String,
    pub(crate) amount: f64,
    pub(crate) status: String,
    pub(crate) plan: String,
    pub(crate) provider: String,
    pub(crate) provider_invoice_id: Option<String>,
}

type InvoiceRow = (
    uuid::Uuid,
    i64,
    String,
    String,
    String,
    Option<chrono::DateTime<chrono::Utc>>,
    chrono::DateTime<chrono::Utc>,
    String,
    Option<String>,
);


pub async fn get_invoices(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<InvoiceResponse>>, AppError> {
    // RBAC: viewer or higher to view invoices
    super::super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let rows: Vec<InvoiceRow> = sqlx::query_as(
        "SELECT id, amount_cents, currency, status, plan, paid_at, created_at, provider, provider_invoice_id \
             FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let invoices: Vec<InvoiceResponse> = rows
        .into_iter()
        .map(
            |(id, amount_cents, _currency, status, plan, paid_at, created_at, provider, provider_invoice_id)| {
                let date = paid_at.unwrap_or(created_at);
                InvoiceResponse {
                    id: id.to_string(),
                    date: date.format("%Y-%m-%d").to_string(),
                    amount: amount_cents as f64 / 100.0,
                    status,
                    plan,
                    provider,
                    provider_invoice_id,
                }
            },
        )
        .collect();

    Ok(Json(invoices))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/refund — Request a refund (Item 251)
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub(crate) struct RefundRequest {
    reason: String,
}

#[derive(Serialize)]
pub(crate) struct RefundResponse {
    message: String,
    status: String,
}


pub async fn request_refund(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<RefundRequest>,
) -> Result<Json<RefundResponse>, AppError> {
    // RBAC: admin required to request refunds
    super::super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    if customer.plan == "free" || customer.plan == "developer" {
        return Err(AppError::BadRequest(
            "Cannot refund a free plan".into(),
        ));
    }

    // Check 14-day refund window
    if !crate::billing::refund::is_within_refund_window(&pool, customer.id).await? {
        return Err(AppError::BadRequest(
            "Refund window has expired. Refunds are only available within 14 days of purchase.".into(),
        ));
    }

    crate::billing::refund::process_refund(&pool, &cfg, customer.id, &req.reason).await?;

    Ok(Json(RefundResponse {
        message: "Refund processed successfully. Your plan has been downgraded to Free.".into(),
        status: "refunded".into(),
    }))
}

// ──────────────────────────────────────────────────────────────
// Overage settings
// ──────────────────────────────────────────────────────────────

#[derive(Serialize, Debug)]
pub(crate) struct OverageSettingsResponse {
    allow_overage: bool,
    overage_email_notification: bool,
    plan: String,
    daily_limit: Option<u64>,
    overage_price: f64,
}

/// GET /v1/billing/settings — Get current overage settings

pub async fn get_overage_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<OverageSettingsResponse>, AppError> {
    // RBAC: viewer or higher to view overage settings
    super::super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let plan = Plan::parse_str(&customer.plan);
    let limit = plan.max_events_per_day();
    Ok(Json(OverageSettingsResponse {
        allow_overage: customer.allow_overage,
        overage_email_notification: customer.overage_email_notification,
        plan: plan.as_str().to_string(),
        daily_limit: if limit >= u64::MAX / 2 { None } else { Some(limit) },
        overage_price: plan.overage_price_per_event(),
    }))
}

#[derive(Deserialize, Debug)]
pub(crate) struct UpdateOverageSettingsRequest {
    allow_overage: Option<bool>,
    overage_email_notification: Option<bool>,
}

/// PUT /v1/billing/settings — Update overage settings

pub async fn update_overage_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateOverageSettingsRequest>,
) -> Result<Json<OverageSettingsResponse>, AppError> {
    // RBAC: admin required to update overage settings
    super::super::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    let updated = sqlx::query_as::<_, Customer>(
        "UPDATE customers SET \
         allow_overage = COALESCE($1, allow_overage), \
         overage_email_notification = COALESCE($2, overage_email_notification), \
         updated_at = NOW() \
         WHERE id = $3 \
         RETURNING *",
    )
    .bind(req.allow_overage)
    .bind(req.overage_email_notification)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let plan = Plan::parse_str(&updated.plan);
    let limit = plan.max_events_per_day();
    Ok(Json(OverageSettingsResponse {
        allow_overage: updated.allow_overage,
        overage_email_notification: updated.overage_email_notification,
        plan: plan.as_str().to_string(),
        daily_limit: if limit >= u64::MAX / 2 { None } else { Some(limit) },
        overage_price: plan.overage_price_per_event(),
    }))
}

// Webhook handlers are in billing/webhooks.rs

