use super::super::*;
use super::subscription_status::PauseRequest;

// ──────────────────────────────────────────────────────────────
// DELETE /v1/billing/subscription — Cancel subscription
// ──────────────────────────────────────────────────────────────

pub async fn cancel_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::routes::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    if customer.plan == "free" || customer.plan == "developer" {
        return Err(AppError::BadRequest(
            "You are already on the free plan".into(),
        ));
    }

    if customer.cancel_at_period_end {
        return Err(AppError::BadRequest(
            "Your subscription is already scheduled for cancellation.".into(),
        ));
    }

    if customer.paused_at.is_some() {
        return Err(AppError::BadRequest(
            "Your subscription is paused. Use /billing/resume first, then cancel if needed.".into(),
        ));
    }

    sqlx::query(
        "UPDATE customers SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1",
    )
    .bind(customer.id)
    .execute(&pool)
    .await?;

    let billing_svc = BillingService::new(pool.clone(), cfg.clone());
    if let Err(e) = billing_svc.cancel_customer_subscription_at_period_end(&customer).await {
        tracing::warn!(
 " Failed to set cancel_at_period_end at provider for customer {}: {:?}",
            customer.id, e
        );
    }

    tracing::info!(
 " Subscription cancellation requested for customer {} (plan: {})",
        customer.id,
        customer.plan
    );

    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "SUBSCRIPTION_CANCEL", "billing", Some(&rid), None, None, None).await;
    }

    Ok(Json(serde_json::json!({
        "message": "Your subscription will be cancelled at the end of the current billing period.",
        "cancel_at_period_end": true,
    })))
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/pause — Pause subscription (freeze)
// ──────────────────────────────────────────────────────────────

pub async fn pause_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<PauseRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::routes::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    let current_plan = Plan::parse_str(&customer.plan);
    if current_plan == Plan::Developer {
        return Err(AppError::BadRequest("Free plan cannot be paused".into()));
    }

    if customer.paused_at.is_some() {
        return Err(AppError::BadRequest("Subscription is already paused. Use /billing/resume to continue.".into()));
    }

    if customer.cancel_at_period_end {
        return Err(AppError::BadRequest("Subscription is scheduled for cancellation. Cancel the cancellation first, then pause.".into()));
    }

    let days = req.days.clamp(1, 90);
    let paused_until = Utc::now() + chrono::Duration::days(days as i64);

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

    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool, customer.id, "SUBSCRIPTION_PAUSE_SCHEDULED", "billing",
            Some(&rid),
            Some(serde_json::json!({
                "plan": current_plan.as_str(),
                "days": days,
                "paused_until": paused_until.to_rfc3339(),
            })),
            None, None,
        ).await;
    }

    let pool_clone = pool.clone();
    let plan_name = current_plan.as_str().to_string();
    let cid = customer.id;
    tokio::spawn(async move {
        crate::notifications::helpers::create(
            &pool_clone, cid, "billing",
 "⏸ Abonelik Dondurma Planlandı",
            &format!(
                "{} plan aboneliğiniz dönem sonunda dondurulacak. Mevcut döneminizin sonuna kadar hizmeti kullanmaya devam edebilirsiniz. {} tarihine kadar dondurma süresi dolmadan devam edebilirsiniz.",
                plan_name, paused_until.format("%d.%m.%Y")
            ),
            Some("/billing"),
        ).await;
    });

    tracing::info!(
 "⏸ Customer {} scheduled pause for {} plan (max {} days, until {})",
        customer.id, current_plan.as_str(), days, paused_until
    );

    let billing_svc = BillingService::new(pool.clone(), cfg.clone());
    if let Err(e) = billing_svc.cancel_customer_subscription_at_period_end(&customer).await {
        tracing::warn!(
 " Failed to set cancel_at_period_end at provider for paused customer {}: {:?}",
            customer.id, e
        );
    }

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

pub async fn resume_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::routes::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    if customer.paused_at.is_none() {
        return Err(AppError::BadRequest("Subscription is not paused".into()));
    }

    if let Some(paused_until) = customer.paused_until {
        if Utc::now() > paused_until {
            sqlx::query(
                "UPDATE customers SET \
                 paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
                 plan = 'free', webhook_limit = $1, cancel_at_period_end = false, \
                 updated_at = NOW() \
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

    let resume_plan = customer
        .pause_plan
        .as_deref()
        .map(Plan::parse_str)
        .unwrap_or(Plan::Startup);

    let plan_limit = resume_plan.max_webhooks_per_day() as i64;
    let endpoint_limit = resume_plan.max_endpoints() as i64;

    sqlx::query(
        "UPDATE customers SET \
         paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
         plan = $1, webhook_limit = $2, endpoint_limit = $3, \
         cancel_at_period_end = false, \
         updated_at = NOW() \
         WHERE id = $4",
    )
    .bind(resume_plan.as_str())
    .bind(plan_limit)
    .bind(endpoint_limit)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool, customer.id, "SUBSCRIPTION_RESUME", "billing",
            Some(&rid),
            Some(serde_json::json!({ "plan": resume_plan.as_str() })),
            None, None,
        ).await;
    }

    let pool_clone = pool.clone();
    let plan_name = resume_plan.as_str().to_string();
    let cid = customer.id;
    tokio::spawn(async move {
        crate::notifications::helpers::create(
            &pool_clone, cid, "billing",
 "▶ Abonelik Devam Ediyor",
            &format!("{} plan aboneliğiniz yeniden aktif edildi. Dönem sonuna kadar hizmeti kullanmaya devam edebilirsiniz.", plan_name),
            Some("/billing"),
        ).await;
    });

 tracing::info!("▶ Customer {} resumed {} plan (pause cleared)", customer.id, resume_plan.as_str());

    Ok(Json(serde_json::json!({
        "message": format!("Your {} plan subscription has been restored. You can continue using the service until the end of your current billing period.", resume_plan.as_str()),
        "plan": resume_plan.as_str(),
        "status": "active",
    })))
}
