use super::super::*;
use crate::error::ErrorCode;
use super::subscription_status::UpgradeRequest;

// ──────────────────────────────────────────────────────────────
// Proration calculation
// ──────────────────────────────────────────────────────────────

/// Calculate prorated amount for a mid-cycle upgrade.
/// Returns (prorated_amount_cents, days_remaining).
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

    let days_in_period = 30;
    let days_used = (now - *period_start).num_days().max(0) as u32;
    let days_remaining = (days_in_period as i64 - days_used as i64).max(1) as u32;

    let old_daily_rate = current_plan.monthly_price_cents() as f64 / days_in_period as f64;
    let new_daily_rate = new_plan.monthly_price_cents() as f64 / days_in_period as f64;
    let prorated = ((new_daily_rate - old_daily_rate) * days_remaining as f64).max(0.0) as u64;

    Some((prorated, days_remaining))
}

// ──────────────────────────────────────────────────────────────
// Auto-sync coupon to Polar (used when polar_discount_id is NULL)
// ──────────────────────────────────────────────────────────────

/// Auto-sync a polar-type coupon to Polar.sh when it hasn't been synced yet.
/// Returns the Polar discount ID on success.
async fn auto_sync_coupon_to_polar(
    pool: &PgPool,
    coupon: &crate::models::coupon::CouponCode,
) -> Result<String, AppError> {
    let polar_cfg = crate::billing::polar::PolarConfig::from_env()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Polar not configured")))?;
    let client = crate::http_client::get_client();

    let basis_points = (coupon.discount_value as u64) * 100; // e.g., 100% = 10000

    let mut polar_body = serde_json::json!({
        "name": coupon.code,
        "code": coupon.code,
        "type": "percentage",
        "basis_points": if coupon.discount_type == "free_month" { 10000 } else { basis_points },
        "duration": "once"
    });

    if let Some(ref expires_at) = coupon.expires_at {
        polar_body["ends_at"] = serde_json::json!(expires_at.to_rfc3339());
    }

    let resp = client
        .post(format!("{}/v1/discounts/", polar_cfg.base_url))
        .header("Authorization", format!("Bearer {}", polar_cfg.access_token))
        .header("Content-Type", "application/json")
        .json(&polar_body)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar API error: {}", e)))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        tracing::error!("Polar discount creation failed during auto-sync: {} {}", status, body);
        return Err(AppError::Internal(anyhow::anyhow!(
            "Failed to create discount in Polar.sh ({}): {}", status, body
        )));
    }

    #[derive(serde::Deserialize)]
    struct PolarDiscount {
        id: String,
    }

    let discount: PolarDiscount = resp.json().await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Polar response: {}", e)))?;

    // Save the polar_discount_id to DB
    let _ = sqlx::query(
        "UPDATE coupon_codes SET polar_discount_id = $2, updated_at = NOW() WHERE id = $1"
    )
    .bind(coupon.id)
    .bind(&discount.id)
    .execute(pool)
    .await;

    Ok(discount.id)
}

// ──────────────────────────────────────────────────────────────
// POST /v1/billing/upgrade — Upgrade plan (with proration)
// ──────────────────────────────────────────────────────────────

pub async fn upgrade_plan(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpgradeRequest>,
) -> Result<Json<super::subscription_status::UpgradeResponse>, AppError> {
    crate::routes::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    let new_plan = Plan::parse_str(&req.plan);
    let current_plan = Plan::parse_str(&customer.plan);

    match new_plan {
        Plan::Developer => {
            return Err(AppError::BadRequest("Use the customer portal to downgrade your plan".into()));
        }
        Plan::Enterprise => {}
        _ => {}
    }

    if new_plan == current_plan {
        return Err(AppError::coded(ErrorCode::AlreadyOnPlan));
    }

    if customer.cancel_at_period_end {
        sqlx::query("UPDATE customers SET cancel_at_period_end = false, updated_at = NOW() WHERE id = $1")
            .bind(customer.id)
            .execute(&pool)
            .await?;
    }

    if customer.paused_at.is_some() {
        sqlx::query(
            "UPDATE customers SET paused_at = NULL, paused_until = NULL, pause_plan = NULL, updated_at = NOW() WHERE id = $1"
        )
        .bind(customer.id)
        .execute(&pool)
        .await?;
    }

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

    let period_start: Option<chrono::DateTime<Utc>> = sqlx::query_scalar(
        "SELECT MAX(paid_at) FROM invoices WHERE customer_id = $1 AND status = 'paid'",
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .ok()
    .flatten();

    // ── Internal coupon check ──
    if let Some(ref code) = req.discount_code {
        let code_upper = code.to_uppercase();
        let coupon_result = sqlx::query_as::<_, crate::models::coupon::CouponCode>(
            "SELECT id, code, type, discount_type, discount_value, target_plan, polar_discount_id, max_redemptions, redemption_count, expires_at, is_active, created_by, created_at, updated_at FROM coupon_codes WHERE UPPER(code) = $1 AND type = 'internal' AND is_active = true"
        )
        .bind(&code_upper)
        .fetch_optional(&pool)
        .await;

        match coupon_result {
            Err(e) => {
                tracing::error!("Coupon lookup failed for code '{}': {:?}", code_upper, e);
                return Err(AppError::Internal(anyhow::anyhow!("Failed to validate coupon code: {}", e)));
            }
            Ok(None) => {
                tracing::info!("No internal coupon found for code '{}', checking polar coupons", code_upper);
            }
            Ok(Some(coupon)) => {
            let now = Utc::now();

            if let Some(expires_at) = coupon.expires_at {
                if now > expires_at {
                    return Err(AppError::coded(ErrorCode::CouponExpired));
                }
            }

            let updated_rows: i32 = if let Some(_max) = coupon.max_redemptions {
                sqlx::query_scalar(
                    "UPDATE coupon_codes SET redemption_count = redemption_count + 1, updated_at = NOW() \
                     WHERE id = $1 AND (max_redemptions IS NULL OR redemption_count < max_redemptions) \
                     RETURNING 1"
                )
                .bind(coupon.id)
                .fetch_optional(&pool)
                .await
                .map_err(|e| AppError::Internal(anyhow::anyhow!("coupon_update_redemption_count: {}", e)))?
                .unwrap_or(0)
            } else {
                sqlx::query_scalar(
                    "UPDATE coupon_codes SET redemption_count = redemption_count + 1, updated_at = NOW() \
                     WHERE id = $1 RETURNING 1"
                )
                .bind(coupon.id)
                .fetch_one(&pool)
                .await
                .map_err(|e| AppError::Internal(anyhow::anyhow!("coupon_update_redemption_count: {}", e)))?
            };

            if updated_rows == 0 {
                return Err(AppError::coded(ErrorCode::CouponMaxUsage));
            }

            let already_used: i64 = sqlx::query_scalar(
                "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id = $1 AND customer_id = $2"
            )
            .bind(coupon.id)
            .bind(customer.id)
            .fetch_one(&pool)
            .await
            .unwrap_or(0);

            if already_used > 0 {
                return Err(AppError::coded(ErrorCode::CouponAlreadyUsed));
            }

            if let Some(ref target) = coupon.target_plan {
                if *target != new_plan.as_str() {
                    return Err(AppError::BadRequest(format!(
                        "This coupon is only valid for the {} plan", target
                    )));
                }
            }

            let webhook_limit = new_plan.max_webhooks_per_day() as i64;
            sqlx::query(
                "UPDATE customers SET plan = $1, webhook_limit = $2, updated_at = NOW() WHERE id = $3"
            )
            .bind(new_plan.as_str())
            .bind(webhook_limit)
            .bind(customer.id)
            .execute(&pool)
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("coupon_update_customer_plan: {}", e)))?;

            sqlx::query(
                "INSERT INTO coupon_redemptions (coupon_id, customer_id) VALUES ($1, $2)"
            )
            .bind(coupon.id)
            .bind(customer.id)
            .execute(&pool)
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("coupon_insert_redemption: {}", e)))?;

            let provider_name = &customer.payment_provider;
            sqlx::query(
                "INSERT INTO invoices (customer_id, amount_cents, currency, status, plan, provider, paid_at) VALUES ($1, 0, 'USD', 'paid', $2, $3, NOW())"
            )
            .bind(customer.id)
            .bind(new_plan.as_str())
            .bind(if provider_name.is_empty() { "polar" } else { provider_name })
            .execute(&pool)
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("coupon_insert_invoice: {}", e)))?;

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

                return Ok(Json(super::subscription_status::UpgradeResponse {
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

        // If we reach here, the code was provided but no internal coupon was found.
        // Check if it's a polar coupon that exists but hasn't been synced yet.
        let polar_coupon = sqlx::query_as::<_, crate::models::coupon::CouponCode>(
            "SELECT id, code, type, discount_type, discount_value, target_plan, polar_discount_id, max_redemptions, redemption_count, expires_at, is_active, created_by, created_at, updated_at FROM coupon_codes WHERE UPPER(code) = $1 AND type = 'polar' AND is_active = true"
        )
        .bind(&code_upper)
        .fetch_optional(&pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("polar_coupon_lookup: {}", e)))?;

        if let Some(ref pc) = polar_coupon {
            // Found a polar coupon — make sure it's synced to Polar
            if pc.polar_discount_id.is_none() {
                tracing::warn!("Polar coupon '{}' exists but not synced — attempting auto-sync", code_upper);
                // Try auto-sync
                let sync_result = auto_sync_coupon_to_polar(&pool, pc).await;
                match sync_result {
                    Ok(discount_id) => {
                        tracing::info!("Auto-synced coupon '{}' to Polar, discount_id={}", code_upper, discount_id);
                    }
                    Err(e) => {
                        tracing::error!("Auto-sync failed for coupon '{}': {:?}", code_upper, e);
                        return Err(AppError::BadRequest(
                            "This coupon code has not been synced to the payment provider yet. Please contact support.".into()
                        ));
                    }
                }
            }
        } else if req.discount_code.is_some() {
            // Code was provided but no coupon found at all (neither internal nor polar)
            return Err(AppError::BadRequest(
                format!("Coupon code '{}' is not valid or has expired.", code_upper)
            ));
        }
    }

    let proration = calculate_proration(&current_plan, &new_plan, period_start.as_ref());

    let mut provider_name = req
        .provider
        .as_deref()
        .unwrap_or(&customer.payment_provider)
        .to_string();

    if provider_name == "stripe" && std::env::var("STRIPE_SECRET_KEY").unwrap_or_default().is_empty() {
        provider_name = "polar".to_string();
    }

    // ── Cancel old subscription if switching providers ──
    let old_provider = &customer.payment_provider;
    if provider_name != *old_provider && current_plan != Plan::Developer {
        if let Some(old_sub_id) =
            BillingService::subscription_id_for_provider(&customer, old_provider)
        {
            let billing_svc = BillingService::new(pool.clone(), cfg.clone());
            match billing_svc.cancel_at_provider(old_provider, old_sub_id).await {
                Ok(()) => {
                    tracing::info!(
                        "✅ Canceled old {} subscription {} for customer {} (switching to {})",
                        old_provider, old_sub_id, customer.id, provider_name
                    );
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
                    tracing::warn!(
                        "⚠️ Failed to cancel old {} subscription {} for customer {}: {:?} — proceeding with upgrade anyway",
                        old_provider, old_sub_id, customer.id, e
                    );
                }
            }
        }
    }

    // ── Create checkout at the new provider ──
    let billing_svc = BillingService::new(pool.clone(), cfg.clone());

    if provider_name != customer.payment_provider {
        sqlx::query("UPDATE customers SET payment_provider = $1 WHERE id = $2")
            .bind(&provider_name)
            .bind(customer.id)
            .execute(&pool)
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("update_payment_provider: {}", e)))?;
    }

    // ── Look up polar_discount_id for coupon code (if applicable) ──
    let polar_discount_id = if let Some(ref code) = req.discount_code {
        let code_upper = code.to_uppercase();
        let found_id = sqlx::query_scalar::<_, String>(
            "SELECT polar_discount_id FROM coupon_codes WHERE UPPER(code) = $1 AND is_active = true AND polar_discount_id IS NOT NULL"
        )
        .bind(&code_upper)
        .fetch_optional(&pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("lookup_polar_discount_id: {}", e)))?;

        if found_id.is_none() && req.discount_code.is_some() {
            tracing::warn!("Coupon code '{}' provided but no polar_discount_id found in DB", code_upper);
        }

        found_id
    } else {
        None
    };

    let result = billing_svc
        .checkout(&customer, &new_plan, Some(&provider_name), req.billing_period.as_deref() == Some("annual"), req.discount_code.as_deref(), polar_discount_id)
        .await?;

    if let Some(ref url) = result.checkout_url {
        validate_checkout_url(url)?;
    }

    let (prorated_amount, days_remaining) = proration.unwrap_or((0, 0));

    {
        let rid = customer.id.to_string();
        let _ = crate::audit::log_action(
            &pool, customer.id, "PLAN_CHANGE", "billing",
            Some(&rid),
            Some(serde_json::json!({
                "new_plan": new_plan.as_str(),
                "provider": provider_name,
            })),
            None, None,
        ).await;
    }

    Ok(Json(super::subscription_status::UpgradeResponse {
        checkout_url: result.checkout_url,
        provider: result.provider,
        message: format!(
            "Redirecting to {} Checkout for {} plan{}",
            provider_name,
            new_plan.as_str(),
            if req.billing_period.as_deref() == Some("annual") { " (annual billing — 20% discount)" } else { "" },
        ),
        prorated_amount_cents: if prorated_amount > 0 { Some(prorated_amount) } else { None },
        days_remaining: if days_remaining > 0 { Some(days_remaining) } else { None },
        requires_contact: None,
        contact_url: None,
    }))
}
