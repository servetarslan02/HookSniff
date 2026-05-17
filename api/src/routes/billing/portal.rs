use super::*;

pub async fn open_portal(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PortalResponse>, AppError> {
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
struct UsageResponse {
    plan: String,
    payment_provider: String,
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


pub async fn get_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<UsageResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);

    // Count endpoints
    let endpoint_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    Ok(Json(UsageResponse {
        plan: plan.as_str().to_string(),
        payment_provider: customer.payment_provider.clone(),
        webhooks: UsageCounter {
            used: customer.webhook_count as u64,
            limit: plan.max_webhooks_per_month(),
            remaining: plan
                .max_webhooks_per_month()
                .saturating_sub(customer.webhook_count as u64),
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
// GET /v1/billing/invoices — Invoice history
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct InvoiceResponse {
    id: String,
    date: String,
    amount: f64,
    status: String,
    plan: String,
}

type InvoiceRow = (
    uuid::Uuid,
    i32,
    String,
    String,
    String,
    Option<chrono::DateTime<chrono::Utc>>,
    chrono::DateTime<chrono::Utc>,
);


pub async fn get_invoices(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<InvoiceResponse>>, AppError> {
    let rows: Vec<InvoiceRow> = sqlx::query_as(
        "SELECT id, amount_cents, currency, status, plan, paid_at, created_at \
             FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let invoices: Vec<InvoiceResponse> = rows
        .into_iter()
        .map(
            |(id, amount_cents, _currency, status, plan, paid_at, created_at)| {
                let date = paid_at.unwrap_or(created_at);
                InvoiceResponse {
                    id: id.to_string(),
                    date: date.format("%Y-%m-%d").to_string(),
                    amount: amount_cents as f64 / 100.0,
                    status,
                    plan,
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
struct RefundRequest {
    reason: String,
}

#[derive(Serialize)]
struct RefundResponse {
    message: String,
    status: String,
}


pub async fn request_refund(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<RefundRequest>,
) -> Result<Json<RefundResponse>, AppError> {
    if customer.plan == "developer" {
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
struct OverageSettingsResponse {
    allow_overage: bool,
    overage_email_notification: bool,
    plan: String,
    daily_limit: u64,
    overage_price: f64,
}

/// GET /v1/billing/settings — Get current overage settings

pub async fn get_overage_settings(
    Extension(customer): Extension<Customer>,
) -> Result<Json<OverageSettingsResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);
    Ok(Json(OverageSettingsResponse {
        allow_overage: customer.allow_overage,
        overage_email_notification: customer.overage_email_notification,
        plan: plan.as_str().to_string(),
        daily_limit: plan.max_events_per_day(),
        overage_price: plan.overage_price_per_event(),
    }))
}

#[derive(Deserialize, Debug)]
struct UpdateOverageSettingsRequest {
    allow_overage: Option<bool>,
    overage_email_notification: Option<bool>,
}

/// PUT /v1/billing/settings — Update overage settings

pub async fn update_overage_settings(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateOverageSettingsRequest>,
) -> Result<Json<OverageSettingsResponse>, AppError> {
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
    Ok(Json(OverageSettingsResponse {
        allow_overage: updated.allow_overage,
        overage_email_notification: updated.overage_email_notification,
        plan: plan.as_str().to_string(),
        daily_limit: plan.max_events_per_day(),
        overage_price: plan.overage_price_per_event(),
    }))
}

// ──────────────────────────────────────────────────────────────
// Webhook handlers for each provider
// ──────────────────────────────────────────────────────────────

/// Maximum billing webhook attempts per IP per minute.
const BILLING_WEBHOOK_RATE_LIMIT: u32 = 30;

/// POST /v1/billing/webhook — Stripe webhook handler
