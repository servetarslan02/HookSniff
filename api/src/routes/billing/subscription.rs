use super::*;

async fn get_subscription(
    Extension(customer): Extension<Customer>,
) -> Result<Json<SubscriptionResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);

    // Item 247: Derive subscription status dynamically from actual customer state
    let status = if customer.cancel_at_period_end {
        "canceled".to_string()
    } else if customer.payment_failed_at.is_some() {
        "past_due".to_string()
    } else if plan == Plan::Developer {
        "inactive".to_string()
    } else {
        "active".to_string()
    };

    // Calculate current_period_end: 1st of next month for paid plans
    let current_period_end = if plan != Plan::Developer {
        let now = chrono::Utc::now();
        let next_month = if now.month() == 12 {
            chrono::NaiveDate::from_ymd_opt(now.year() + 1, 1, 1)
        } else {
            chrono::NaiveDate::from_ymd_opt(now.year(), now.month() + 1, 1)
        };
        next_month.map(|d| d.and_hms_opt(0, 0, 0).expect("midnight is valid time").and_utc().to_rfc3339())
    } else {
        None
    };

    Ok(Json(SubscriptionResponse {
        plan: plan.as_str().to_string(),
        status,
        payment_provider: customer.payment_provider.clone(),
        stripe_subscription_id: customer.stripe_subscription_id.clone(),
        polar_subscription_id: customer.polar_subscription_id.clone(),
        iyzico_subscription_id: customer.iyzico_subscription_id.clone(),
        webhook_limit: plan.max_webhooks_per_month(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
        cancel_at_period_end: customer.cancel_at_period_end,
        billing_period: "monthly".to_string(), // Default; annual tracked via provider
        current_period_end,
        card_last4: customer.card_last4.clone(),
        card_brand: customer.card_brand.clone(),
        card_exp_month: customer.card_exp_month,
        card_exp_year: customer.card_exp_year,
    }))
}

// ──────────────────────────────────────────────────────────────
// DELETE /v1/billing/subscription — Cancel subscription
// ──────────────────────────────────────────────────────────────

/// DELETE /v1/billing/subscription — Cancel the current subscription (downgrade to free at period end)

async fn cancel_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    if customer.plan == "developer" {
        return Err(AppError::BadRequest(
            "You are already on the free plan".into(),
        ));
    }

    // Mark subscription for cancellation at period end
    sqlx::query(
        "UPDATE customers SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    tracing::info!(
        "✅ Subscription cancellation requested for customer {} (plan: {})",
        customer.id,
        customer.plan
    );

    // Audit log — SUBSCRIPTION_CANCEL
    {
        let rid = customer.id.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "SUBSCRIPTION_CANCEL", "billing", Some(&rid), None, None, None).await; }
    }

    Ok(Json(serde_json::json!({
        "message": "Your subscription will be cancelled at the end of the current billing period.",
        "cancel_at_period_end": true,
    })))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan (with proration)
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct UpgradeRequest {
    plan: String,
    /// Payment provider: "stripe", "polar", or "iyzico"
    /// If not specified, uses the customer's existing provider or defaults to Stripe.
    #[serde(default)]
    provider: Option<String>,
    /// Billing period: "monthly" (default) or "annual"
    #[serde(default)]
    billing_period: Option<String>,
}

#[derive(Debug, Serialize)]
struct UpgradeResponse {
    checkout_url: Option<String>,
    provider: String,
    message: String,
    /// Prorated amount in cents (if applicable)
    #[serde(skip_serializing_if = "Option::is_none")]
    prorated_amount_cents: Option<u64>,
    /// Days remaining in current billing period
    #[serde(skip_serializing_if = "Option::is_none")]
    days_remaining: Option<u32>,
    /// Whether this plan requires contacting sales
    #[serde(skip_serializing_if = "Option::is_none")]
    requires_contact: Option<bool>,
    /// Contact URL for enterprise plans
    #[serde(skip_serializing_if = "Option::is_none")]
    contact_url: Option<String>,
}

/// Calculate prorated amount for a mid-cycle upgrade.
///
/// Returns the prorated amount in cents for the remaining days in the current billing period.
/// If the current plan is free or the period can't be determined, returns None.

fn calculate_proration(
    current_plan: &Plan,
    new_plan: &Plan,
    current_period_start: Option<&chrono::DateTime<Utc>>,
) -> Option<(u64, u32)> {
    if *current_plan == Plan::Developer || current_period_start.is_none() {
        return None;
    }

    let period_start = current_period_start?;
    let now = Utc::now();

    // Calculate days in the billing period (assume monthly)
    let days_in_period = 30;
    let days_used = (now - *period_start).num_days().max(0) as u32;
    let days_remaining = (days_in_period as i64 - days_used as i64).max(1) as u32;

    // Prorate: charge the difference for remaining days
    let old_daily_rate = current_plan.monthly_price_cents() as f64 / days_in_period as f64;
    let new_daily_rate = new_plan.monthly_price_cents() as f64 / days_in_period as f64;
    let prorated = ((new_daily_rate - old_daily_rate) * days_remaining as f64).max(0.0) as u64;

    Some((prorated, days_remaining))
}


async fn upgrade_plan(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpgradeRequest>,
) -> Result<Json<UpgradeResponse>, AppError> {
    let new_plan = Plan::parse_str(&req.plan);
    let current_plan = Plan::parse_str(&customer.plan);

    match new_plan {
        Plan::Developer => {
            return Err(AppError::BadRequest(
                "Use the customer portal to downgrade your plan".into(),
            ));
        }
        Plan::Enterprise => {
            // Item 256: Enterprise requires contact — return contact info instead of checkout
            return Ok(Json(UpgradeResponse {
                checkout_url: None,
                provider: customer.payment_provider.clone(),
                message: "Enterprise plan requires a custom agreement. Contact us to get started.".into(),
                prorated_amount_cents: None,
                days_remaining: None,
                requires_contact: Some(true),
                contact_url: Some(
                    "mailto:enterprise@hooksniff.dev?subject=Enterprise%20Plan%20Inquiry".into(),
                ),
            }));
        }
        _ => {}
    }

    // Prevent same-plan upgrade
    if new_plan == current_plan {
        return Err(AppError::BadRequest("You are already on this plan".into()));
    }

    // Item 258: Validate plan transition — only allow upgrading to a higher tier
    let plan_tier = |p: &Plan| match p {
        Plan::Developer => 0,
        Plan::Startup => 1,
        Plan::Pro => 2,
        Plan::Enterprise => 3,
    };
    if plan_tier(&new_plan) <= plan_tier(&current_plan) {
        return Err(AppError::BadRequest(
            "This endpoint only supports plan upgrades. To downgrade, please use the customer portal or contact support.".into(),
        ));
    }

    // Calculate proration for upgrades from paid plans
    // Fetch the customer's last payment date as period start approximation
    let period_start: Option<chrono::DateTime<Utc>> = sqlx::query_scalar(
        "SELECT MAX(paid_at) FROM invoices WHERE customer_id = $1 AND status = 'paid'",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .ok()
    .flatten();

    let proration = calculate_proration(&current_plan, &new_plan, period_start.as_ref());

    // Determine which provider to use
    let mut provider_name = req
        .provider
        .as_deref()
        .unwrap_or(&customer.payment_provider)
        .to_string();

    // If provider is "stripe" but Stripe is not configured, fall back to "polar"
    if provider_name == "stripe" && std::env::var("STRIPE_SECRET_KEY").unwrap_or_default().is_empty() {
        provider_name = "polar".to_string();
    }

    // ── Item 249: Cancel old subscription if switching providers ──
    let old_provider = &customer.payment_provider;
    if provider_name != *old_provider && current_plan != Plan::Developer {
        // Customer is switching to a different provider with an active paid plan.
        // Cancel the old subscription at the old provider first.
        if let Some(old_sub_id) =
            BillingService::subscription_id_for_provider(&customer, old_provider)
        {
            let billing_svc = BillingService::new(pool.clone(), cfg.clone());
            match billing_svc
                .cancel_at_provider(old_provider, old_sub_id)
                .await
            {
                Ok(()) => {
                    tracing::info!(
                        "✅ Canceled old {} subscription {} for customer {} (switching to {})",
                        old_provider,
                        old_sub_id,
                        customer.id,
                        provider_name
                    );
                    // Clear the old subscription ID in the DB
                    let clear_col = match old_provider.as_str() {
                        "polar" => "polar_subscription_id",
                        "iyzico" => "iyzico_subscription_id",
                        _ => "stripe_subscription_id",
                    };
                    let _ = sqlx::query(&format!(
                        "UPDATE customers SET {} = NULL, updated_at = NOW() WHERE id = $1",
                        clear_col
                    ))
                    .bind(customer.id)
                    .execute(&pool)
                    .await;
                }
                Err(e) => {
                    // Log but don't block the upgrade — the old subscription
                    // may have already been canceled or the provider may be down.
                    tracing::warn!(
                        "⚠️ Failed to cancel old {} subscription {} for customer {}: {:?} \
                         — proceeding with upgrade anyway",
                        old_provider,
                        old_sub_id,
                        customer.id,
                        e
                    );
                }
            }
        }
    }

    // ── Create checkout at the new provider ──
    let billing_svc = BillingService::new(pool.clone(), cfg.clone());

    // Update customer's payment provider before checkout
    if provider_name != customer.payment_provider {
        sqlx::query("UPDATE customers SET payment_provider = $1 WHERE id = $2")
            .bind(&provider_name)
            .bind(customer.id)
            .execute(&pool)
            .await?;
    }

    let result = billing_svc
        .checkout(&customer, &new_plan, Some(&provider_name), req.billing_period.as_deref() == Some("annual"))
        .await?;

    // Item 259: Validate checkout URL server-side before returning to client
    if let Some(ref url) = result.checkout_url {
        validate_checkout_url(url)?;
    }

    let (prorated_amount, days_remaining) = proration.unwrap_or((0, 0));

    // Audit log — PLAN_CHANGE
    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool,
            customer.id,
            "PLAN_CHANGE",
            "billing",
            Some(&rid),
            Some(serde_json::json!({
                "new_plan": new_plan.as_str(),
                "provider": provider_name,
            })),
            None,
            None,
        )
        .await;
    }

    Ok(Json(UpgradeResponse {
        checkout_url: result.checkout_url,
        provider: result.provider,
        message: format!(
            "Redirecting to {} Checkout for {} plan{}",
            provider_name,
            new_plan.as_str(),
            if req.billing_period.as_deref() == Some("annual") {
                " (annual billing — 20% discount)"
            } else {
                ""
            },
        ),
        prorated_amount_cents: if prorated_amount > 0 {
            Some(prorated_amount)
        } else {
            None
        },
        days_remaining: if days_remaining > 0 {
            Some(days_remaining)
        } else {
            None
        },
        requires_contact: None,
        contact_url: None,
    }))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/portal — Open customer portal
// ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct PortalResponse {
    url: String,
    provider: String,
}

