use super::*;

pub async fn get_subscription(
    Extension(customer): Extension<Customer>,
) -> Result<Json<SubscriptionResponse>, AppError> {
    let plan = Plan::parse_str(&customer.plan);

    // Item 247: Derive subscription status dynamically from actual customer state
    let status = if customer.paused_at.is_some() {
        "paused".to_string()
    } else if customer.cancel_at_period_end {
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
        webhook_limit: plan.max_webhooks_per_day(),
        endpoint_limit: plan.max_endpoints(),
        retention_days: plan.retention_days(),
        monthly_price_cents: plan.monthly_price_cents(),
        monthly_price_kurus: plan.monthly_price_kurus(),
        cancel_at_period_end: customer.cancel_at_period_end,
        billing_period: customer.billing_interval.clone().unwrap_or_else(|| "month".to_string()),
        current_period_end,
        card_last4: customer.card_last4.clone(),
        card_brand: customer.card_brand.clone(),
        card_exp_month: customer.card_exp_month,
        card_exp_year: customer.card_exp_year,
        paused_at: customer.paused_at.map(|d| d.to_rfc3339()),
        paused_until: customer.paused_until.map(|d| d.to_rfc3339()),
        pause_plan: customer.pause_plan.clone(),
        has_used_startup_trial: customer.has_used_startup_trial,
    }))
}

// ──────────────────────────────────────────────────────────────
// DELETE /v1/billing/subscription — Cancel subscription
// ──────────────────────────────────────────────────────────────

/// DELETE /v1/billing/subscription — Cancel the current subscription (downgrade to free at period end)

pub async fn cancel_subscription(
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
// POST /v1/billing/pause — Pause subscription (freeze)
// ──────────────────────────────────────────────────────────────

/// POST /v1/billing/pause — Temporarily pause the subscription.
///
/// Pausing means:
/// - Subscription is canceled at the payment provider (Polar)
/// - Customer is marked as "paused" instead of "canceled"
/// - Plan info is preserved (for easy resume)
/// - Webhook limits reduced to free tier during pause
/// - Max pause duration: 90 days (auto-downgrade after)
#[derive(Debug, Deserialize)]
pub(crate) struct PauseRequest {
    /// Duration in days to pause (default: 30, max: 90)
    #[serde(default = "default_pause_days")]
    days: i32,
}

fn default_pause_days() -> i32 {
    30
}

pub async fn pause_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<PauseRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Validate: can't pause free plan
    let current_plan = Plan::parse_str(&customer.plan);
    if current_plan == Plan::Developer {
        return Err(AppError::BadRequest(
            "Free plan cannot be paused".into(),
        ));
    }

    // Validate: can't pause if already paused
    if customer.paused_at.is_some() {
        return Err(AppError::BadRequest(
            "Subscription is already paused. Use /billing/resume to continue.".into(),
        ));
    }

    // Validate pause duration
    let days = req.days.clamp(1, 90);
    let paused_until = Utc::now() + chrono::Duration::days(days as i64);

    // Step 1: Mark for pause at period end (not immediate)
    // Customer keeps access until current period ends
    // cancel_at_period_end = true → Polar won't charge next cycle
    // pause_plan → preserved for resume
    let free_limit = Plan::Developer.max_webhooks_per_day() as i64;

    sqlx::query(
        "UPDATE customers SET \
         cancel_at_period_end = true, \
         pause_plan = $1, \
         paused_at = NOW(), \
         paused_until = $2, \
         updated_at = NOW() \
         WHERE id = $3",
    )
    .bind(current_plan.as_str())
    .bind(paused_until)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    // Audit log
    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool,
            customer.id,
            "SUBSCRIPTION_PAUSE_SCHEDULED",
            "billing",
            Some(&rid),
            Some(serde_json::json!({
                "plan": current_plan.as_str(),
                "days": days,
                "paused_until": paused_until.to_rfc3339(),
            })),
            None,
            None,
        )
        .await;
    }

    // Notification — inform customer they keep access until period end
    let pool_clone = pool.clone();
    let plan_name = current_plan.as_str().to_string();
    let cid = customer.id;
    tokio::spawn(async move {
        crate::notifications::helpers::create(
            &pool_clone,
            cid,
            "billing",
            "⏸️ Abonelik Dondurma Planlandı",
            &format!(
                "{} plan aboneliğiniz dönem sonunda dondurulacak. Mevcut döneminizin sonuna kadar hizmeti kullanmaya devam edebilirsiniz. {} tarihine kadar dondurma süresi dolmadan devam edebilirsiniz.",
                plan_name,
                paused_until.format("%d.%m.%Y")
            ),
            Some("/billing-section"),
        )
        .await;
    });

    tracing::info!(
        "⏸️ Customer {} scheduled pause for {} plan (max {} days, until {})",
        customer.id,
        current_plan.as_str(),
        days,
        paused_until
    );

    Ok(Json(serde_json::json!({
        "message": format!("Your subscription will be paused at the end of the current billing period. You can resume anytime before {}.", paused_until.format("%d.%m.%Y")),
        "paused_until": paused_until.to_rfc3339(),
        "plan_preserved": current_plan.as_str(),
        "keeps_access_until_period_end": true,
    })))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/resume — Resume paused subscription
// ──────────────────────────────────────────────────────────────

/// POST /v1/billing/resume — Resume a paused subscription.
///
/// Creates a new checkout at the payment provider to re-activate the subscription.
/// The customer's previous plan is restored.
pub async fn resume_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Validate: must be paused
    if customer.paused_at.is_none() {
        return Err(AppError::BadRequest(
            "Subscription is not paused".into(),
        ));
    }

    // Check if pause has expired (auto-downgrade)
    if let Some(paused_until) = customer.paused_until {
        if Utc::now() > paused_until {
            // Pause expired — downgrade to free
            sqlx::query(
                "UPDATE customers SET \
                 paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
                 plan = 'developer', webhook_limit = $1, updated_at = NOW() \
                 WHERE id = $2",
            )
            .bind(Plan::Developer.max_webhooks_per_day() as i64)
            .bind(customer.id)
            .execute(&pool)
            .await?;

            return Err(AppError::BadRequest(
                "Pause period has expired. Your account has been downgraded to the free plan. Please upgrade to continue.".into(),
            ));
        }
    }

    // Get the preserved plan
    let resume_plan = customer
        .pause_plan
        .as_deref()
        .map(Plan::parse_str)
        .unwrap_or(Plan::Startup);

    // Create a new checkout to resume
    let billing_svc = BillingService::new(pool.clone(), cfg.clone());
    let result = billing_svc
        .checkout(&customer, &resume_plan, None, false, None)
        .await?;

    // Clear pause state
    sqlx::query(
        "UPDATE customers SET \
         paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
         updated_at = NOW() \
         WHERE id = $1",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    // Audit log
    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool,
            customer.id,
            "SUBSCRIPTION_RESUME",
            "billing",
            Some(&rid),
            Some(serde_json::json!({
                "plan": resume_plan.as_str(),
            })),
            None,
            None,
        )
        .await;
    }

    // Notification
    let pool_clone = pool.clone();
    let plan_name = resume_plan.as_str().to_string();
    let cid = customer.id;
    tokio::spawn(async move {
        crate::notifications::helpers::create(
            &pool_clone,
            cid,
            "billing",
            "▶️ Abonelik Devam Ediyor",
            &format!(
                "{} plan aboneliğiniz devam ediyor. Ödeme sayfasına yönlendiriliyorsunuz.",
                plan_name
            ),
            Some("/billing-section"),
        )
        .await;
    });

    tracing::info!(
        "▶️ Customer {} resuming {} plan",
        customer.id,
        resume_plan.as_str()
    );

    Ok(Json(serde_json::json!({
        "message": "Redirecting to checkout to resume your subscription.",
        "checkout_url": result.checkout_url,
        "plan": resume_plan.as_str(),
    })))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan (with proration)
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub(crate) struct UpgradeRequest {
    pub(crate) plan: String,
    /// Payment provider: "stripe", "polar", or "iyzico"
    /// If not specified, uses the customer's existing provider or defaults to Stripe.
    #[serde(default)]
    pub(crate) provider: Option<String>,
    /// Billing period: "monthly" (default) or "annual"
    #[serde(default)]
    pub(crate) billing_period: Option<String>,
    /// Discount/coupon code to apply at checkout.
    #[serde(default)]
    pub(crate) discount_code: Option<String>,
}

#[derive(Debug, Serialize)]
pub(crate) struct UpgradeResponse {
    pub(crate) checkout_url: Option<String>,
    pub(crate) provider: String,
    pub(crate) message: String,
    /// Prorated amount in cents (if applicable)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) prorated_amount_cents: Option<u64>,
    /// Days remaining in current billing period
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) days_remaining: Option<u32>,
    /// Whether this plan requires contacting sales
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) requires_contact: Option<bool>,
    /// Contact URL for enterprise plans
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) contact_url: Option<String>,
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


pub async fn upgrade_plan(
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
            // Enterprise goes through normal checkout like other plans
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

    // ── Check for internal coupon (direct plan application, no payment provider) ──
    if let Some(ref code) = req.discount_code {
        let code_upper = code.to_uppercase();
        if let Ok(Some(coupon)) = sqlx::query_as::<_, crate::models::coupon::CouponCode>(
            "SELECT * FROM coupon_codes WHERE UPPER(code) = $1 AND type = 'internal' AND is_active = true"
        )
        .bind(&code_upper)
        .fetch_optional(&pool)
        .await
        {
            // Validate coupon
            let now = Utc::now();

            // Check expiry
            if let Some(expires_at) = coupon.expires_at {
                if now > expires_at {
                    return Err(AppError::BadRequest("This coupon has expired".into()));
                }
            }

            // Check max redemptions
            if let Some(max) = coupon.max_redemptions {
                if coupon.redemption_count >= max {
                    return Err(AppError::BadRequest("This coupon has reached its maximum usage".into()));
                }
            }

            // Check if already used by this customer
            let already_used: i64 = sqlx::query_scalar(
                "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id = $1 AND customer_id = $2"
            )
            .bind(coupon.id)
            .bind(customer.id)
            .fetch_one(&pool)
            .await
            .unwrap_or(0);

            if already_used > 0 {
                return Err(AppError::BadRequest("You have already used this coupon".into()));
            }

            // Check plan match
            if let Some(ref target) = coupon.target_plan {
                if *target != new_plan.as_str() {
                    return Err(AppError::BadRequest(format!(
                        "This coupon is only valid for the {} plan", target
                    )));
                }
            }

            // Apply coupon: directly upgrade plan
            let webhook_limit = new_plan.max_webhooks_per_day() as i64;
            sqlx::query(
                "UPDATE customers SET plan = $1, webhook_limit = $2, updated_at = NOW() WHERE id = $3"
            )
            .bind(new_plan.as_str())
            .bind(webhook_limit)
            .bind(customer.id)
            .execute(&pool)
            .await?;

            // Record redemption
            sqlx::query(
                "INSERT INTO coupon_redemptions (coupon_id, customer_id) VALUES ($1, $2)"
            )
            .bind(coupon.id)
            .bind(customer.id)
            .execute(&pool)
            .await?;

            // Increment redemption count
            sqlx::query(
                "UPDATE coupon_codes SET redemption_count = redemption_count + 1, updated_at = NOW() WHERE id = $1"
            )
            .bind(coupon.id)
            .execute(&pool)
            .await?;

            // Create invoice with $0 (free via coupon)
            sqlx::query(
                "INSERT INTO invoices (customer_id, amount_cents, currency, status, plan) VALUES ($1, 0, 'USD', 'paid', $2)"
            )
            .bind(customer.id)
            .bind(new_plan.as_str())
            .execute(&pool)
            .await?;

            // Audit log
            {
                let rid = customer.id.to_string();
                let _ = crate::audit::log_action(
                    &pool, customer.id, "PLAN_CHANGE_COUPON", "billing",
                    Some(&rid),
                    Some(serde_json::json!({
                        "new_plan": new_plan.as_str(),
                        "coupon_code": coupon.code,
                        "coupon_type": coupon.coupon_type,
                        "discount_type": coupon.discount_type,
                        "discount_value": coupon.discount_value,
                    })),
                    None, None,
                ).await;
            }

            return Ok(Json(UpgradeResponse {
                checkout_url: None,
                provider: "internal".to_string(),
                message: format!("Plan upgraded to {} using coupon {}", new_plan.as_str(), coupon.code),
                prorated_amount_cents: None,
                days_remaining: None,
                requires_contact: None,
                contact_url: None,
            }));
        }
    }

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
        .checkout(&customer, &new_plan, Some(&provider_name), req.billing_period.as_deref() == Some("annual"), req.discount_code.as_deref())
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

// Portal routes are in billing/portal.rs

