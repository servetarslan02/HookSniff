use super::*;

pub async fn handle_stripe_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    check_billing_webhook_rate_limit(&rate_limiter, &headers).await?;

    let signature = headers.get("stripe-signature").and_then(|v| v.to_str().ok()).unwrap_or("");
    let webhook_secret = cfg.stripe_webhook_secret.as_deref().unwrap_or("");
    if webhook_secret.is_empty() {
        tracing::error!("Stripe webhook secret not configured — rejecting webhook");
        return Err(AppError::Internal(anyhow::anyhow!("Billing webhook secret not configured")));
    }

    stripe::handle_webhook_event(&pool, &body, signature, webhook_secret, cfg.webhook_timestamp_tolerance_secs).await?;
    Ok(StatusCode::OK)
}

/// POST /v1/billing/webhook/polar — Polar.sh webhook handler
/// IMPORTANT: Always returns 200 to prevent Polar from auto-disabling the webhook.
/// Errors are logged but never returned to Polar.

pub async fn handle_polar_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    // Rate limit check — 429 is acceptable (Polar retries)
    check_billing_webhook_rate_limit(&rate_limiter, &headers).await?;

    // Idempotency — if already processed, return 200 (not error)
    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&body) {
        if let Some(event_id) = parsed.get("id").and_then(|v| v.as_str()) {
            let already_processed: bool = sqlx::query_scalar(
                "SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE provider = $1 AND provider_tx_id = $2)"
            )
            .bind("polar").bind(event_id).fetch_one(&pool).await.unwrap_or(false);
            if already_processed {
                tracing::info!("♻️ Polar event {} already processed, skipping", event_id);
                return Ok(StatusCode::OK);
            }
        }
    }

    // Load config — if not configured, log and return 200
    let config = match crate::billing::polar::PolarConfig::from_env() {
        Some(c) => c,
        None => {
            tracing::error!("Polar.sh not configured — webhook ignored");
            return Ok(StatusCode::OK);
        }
    };

    // Process webhook — handle_webhook now always returns Ok (never errors)
    let provider = crate::billing::polar::PolarProvider::new(config);
    let result = match provider.handle_webhook(&headers, &body, &pool).await {
        Ok(r) => r,
        Err(e) => {
            tracing::error!("Polar webhook handler error: {:?} — returning 200 anyway", e);
            return Ok(StatusCode::OK);
        }
    };

    // Process result — if DB write fails, log but return 200
    if let Err(e) = process_webhook_result(&pool, &result, "polar").await {
        tracing::error!("Polar webhook DB error: {:?} — returning 200 anyway", e);
    }

    Ok(StatusCode::OK)
}

/// POST /v1/billing/webhook/iyzico — iyzico webhook handler

pub async fn handle_iyzico_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    body: String,
) -> Result<StatusCode, AppError> {
    check_billing_webhook_rate_limit(&rate_limiter, &headers).await?;

    // Return 200 for duplicate events (iyzico may disable webhook on errors)
    if check_webhook_idempotency(&pool, &body, "iyzico").await.is_err() {
        return Ok(StatusCode::OK);
    }

    let config = crate::billing::iyzico::IyzicoConfig::from_env()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("iyzico not configured")))?;
    let provider = crate::billing::iyzico::IyzicoProvider::new(config);
    let result = provider.handle_webhook(&headers, &body, &pool).await?;
    process_webhook_result(&pool, &result, "iyzico").await?;
    Ok(StatusCode::OK)
}

/// Shared rate limit check for billing webhooks.

async fn check_billing_webhook_rate_limit(
    rate_limiter: &crate::rate_limit::RateLimiter,
    headers: &axum::http::HeaderMap,
) -> Result<(), AppError> {
    let client_ip = headers.get("x-real-ip").or_else(|| headers.get("x-forwarded-for"))
        .and_then(|v| v.to_str().ok()).unwrap_or("unknown");
    let rl_key = format!("billing_webhook:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, BILLING_WEBHOOK_RATE_LIMIT).await;
    if !rl_result.allowed { Err(AppError::RateLimitExceeded) } else { Ok(()) }
}

/// HS-021: Idempotency check — skip if event already processed.

async fn check_webhook_idempotency(pool: &PgPool, body: &str, provider: &str) -> Result<(), AppError> {
    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(body) {
        if let Some(event_id) = parsed.get("id").and_then(|v| v.as_str()) {
            let already_processed: bool = sqlx::query_scalar(
                "SELECT EXISTS(SELECT 1 FROM payment_transactions WHERE provider = $1 AND provider_tx_id = $2)"
            )
            .bind(provider).bind(event_id).fetch_one(pool).await.unwrap_or(false);
            if already_processed {
                tracing::info!("♻️ {} event {} already processed, skipping", provider, event_id);
                return Err(AppError::from(anyhow::anyhow!("already_processed")));
            }
        }
    }
    Ok(())
}

/// Get the provider-specific column names for customer table updates.

fn provider_columns(provider: &str) -> Option<(&'static str, &'static str)> {
    match provider {
        "polar" => Some(("polar_customer_id", "polar_subscription_id")),
        "iyzico" => Some(("iyzico_customer_id", "iyzico_subscription_id")),
        _ => None,
    }
}

/// Get the provider-specific subscription ID column name.

fn provider_sub_col(provider: &str) -> Option<&'static str> {
    match provider {
        "polar" => Some("polar_subscription_id"),
        "iyzico" => Some("iyzico_subscription_id"),
        _ => None,
    }
}

/// Process a webhook result from any provider and update the database.

async fn process_webhook_result(
    pool: &sqlx::PgPool,
    result: &crate::billing::provider::WebhookResult,
    provider: &str,
) -> Result<(), AppError> {
    use crate::billing::provider::WebhookResult;

    match result {
        WebhookResult::SubscriptionCreated {
            customer_id,
            plan,
            provider_customer_id,
            provider_subscription_id,
            interval,
            event_id,
            cancel_at_period_end,
            current_period_end,
        } => {
            let webhook_limit = plan.max_webhooks_per_day() as i64;
            let period_interval = if interval == "year" { "365 days" } else { "30 days" };
            if let Some((cust_col, sub_col)) = provider_columns(provider) {
                // Mark startup trial as used when customer subscribes to Startup plan
                let trial_flag = if *plan == Plan::Startup {
                    ", has_used_startup_trial = true"
                } else {
                    ""
                };
                // Use parameterized query for current_period_end to avoid SQL injection
                let query = format!(
                    "UPDATE customers SET plan = $1, payment_provider = $2, \
                     {} = $3, {} = $4, webhook_limit = $5, \
                     payment_failed_at = NULL, \
                     current_period_end = COALESCE($9::timestamptz, NOW() + INTERVAL '{}'), \
                     billing_interval = $7, \
                     cancel_at_period_end = $8, \
                     updated_at = NOW(){} WHERE id = $6",
                    cust_col, sub_col, period_interval, trial_flag
                );
                sqlx::query(&query)
                    .bind(plan.as_str()).bind(provider)
                    .bind(provider_customer_id).bind(provider_subscription_id)
                    .bind(webhook_limit).bind(customer_id)
                    .bind(&interval)
                    .bind(cancel_at_period_end)
                    .bind(current_period_end.as_deref())
                    .execute(pool).await?;
            } else {
                return Ok(());
            }

            // HS-060: Clean up excess endpoints if upgrading from free (in case of re-subscribe)
            cleanup_excess_endpoints(pool, *customer_id, plan).await?;

            // Log transaction
            sqlx::query(
                "INSERT INTO payment_transactions \
                 (customer_id, provider, provider_tx_id, status, plan, currency) \
                 VALUES ($1, $2, $3, 'completed', $4, $5)",
            )
            .bind(customer_id)
            .bind(provider)
            .bind(event_id.as_deref())
            .bind(plan.as_str())
            .bind(if provider == "iyzico" { "TRY" } else { "USD" })
            .execute(pool)
            .await?;

            // NOTE: Invoice is NOT created here — the actual payment amount is unknown
            // at subscription.created time (discounts, coupons, trials may apply).
            // The invoice is created in the order.completed handler with the real amount.

            tracing::info!(
                "✅ Customer {} upgraded to {} via {}",
                customer_id,
                plan.as_str(),
                provider
            );

            // Create in-app notification for plan upgrade
            {
                let pool_clone = pool.clone();
                let plan_name = plan.as_str().to_string();
                let cid = *customer_id;
                tokio::spawn(async move {
                    crate::notifications::helpers::plan_upgraded(&pool_clone, cid, "free", &plan_name).await;
                });
            }
        }
        WebhookResult::SubscriptionUpdated {
            provider_subscription_id,
            plan,
            status,
            interval,
            event_id: _,
            cancel_at_period_end,
            current_period_end,
        } => {
            let webhook_limit = plan.max_webhooks_per_day() as i64;
            let period_interval = if interval == "year" { "365 days" } else { "30 days" };
            if let Some(sub_col) = provider_sub_col(provider) {
                let query = format!(
                    "UPDATE customers SET plan = $1, webhook_limit = $2, \
                     payment_failed_at = NULL, \
                     current_period_end = COALESCE($6::timestamptz, NOW() + INTERVAL '{}'), \
                     billing_interval = $4, \
                     cancel_at_period_end = $5, \
                     updated_at = NOW() WHERE {} = $3",
                    period_interval, sub_col
                );
                sqlx::query(&query).bind(plan.as_str()).bind(webhook_limit)
                    .bind(provider_subscription_id).bind(&interval)
                    .bind(cancel_at_period_end)
                    .bind(current_period_end.as_deref())
                    .execute(pool).await?;
            } else {
                return Ok(());
            }

            // HS-060: If plan changed, clean up excess endpoints
            if let Some(sub_col) = provider_sub_col(provider) {
                let cid_query = format!("SELECT id FROM customers WHERE {} = $1", sub_col);
                let customer_id: Option<(uuid::Uuid,)> = sqlx::query_as(&cid_query)
                    .bind(provider_subscription_id).fetch_optional(pool).await?;
                if let Some((cid,)) = customer_id {
                    cleanup_excess_endpoints(pool, cid, plan).await?;
                    // Invoice is created in order.completed with actual payment amount
                }
            }

            tracing::info!(
                "✅ {} subscription {} updated: status={}, plan={}",
                provider,
                provider_subscription_id,
                status,
                plan.as_str()
            );
        }
        WebhookResult::SubscriptionCanceled {
            provider_subscription_id,
            event_id: _,
        } => {
            let free_limit = Plan::Developer.max_webhooks_per_day() as i64;
            if let Some(sub_col) = provider_sub_col(provider) {
                // Only clear subscription_id, NOT customer_id (needed for re-subscribe & portal)
                let query = format!(
                    "UPDATE customers SET plan = 'free', {} = NULL, webhook_limit = $2, \
                     cancel_at_period_end = false, payment_failed_at = NULL, \
                     paused_at = NULL, paused_until = NULL, pause_plan = NULL, \
                     card_last4 = NULL, card_brand = NULL, card_exp_month = NULL, card_exp_year = NULL, \
                     billing_interval = NULL, \
                     updated_at = NOW() WHERE {} = $1",
                    sub_col, sub_col
                );
                sqlx::query(&query).bind(provider_subscription_id).bind(free_limit)
                    .execute(pool).await?;
            } else {
                return Ok(());
            }

            // HS-060: Clean up excess endpoints on cancellation
            if let Some(sub_col) = provider_sub_col(provider) {
                let cid_query = format!("SELECT id FROM customers WHERE {} = $1", sub_col);
                let customer_id: Option<(uuid::Uuid,)> = sqlx::query_as(&cid_query)
                    .bind(provider_subscription_id).fetch_optional(pool).await?;
                if let Some((cid,)) = customer_id {
                    cleanup_excess_endpoints(pool, cid, &Plan::Developer).await?;
                }
            }

            tracing::info!(
                "✅ {} subscription {} canceled, customer downgraded to free",
                provider,
                provider_subscription_id
            );

            // Create in-app notification
            if let Some(sub_col) = provider_sub_col(provider) {
                let cid_query = format!("SELECT id FROM customers WHERE {} = $1", sub_col);
                if let Ok(Some((cid,))) = sqlx::query_as::<_, (uuid::Uuid,)>(&cid_query)
                    .bind(provider_subscription_id).fetch_optional(pool).await
                {
                    let pool_clone = pool.clone();
                    tokio::spawn(async move {
                        crate::notifications::helpers::subscription_canceled(&pool_clone, cid, "free").await;
                    });
                }
            }
        }
        WebhookResult::PaymentSucceeded {
            provider_tx_id,
            amount_cents,
            currency,
            customer_id,
            invoice_number,
        } => {
            // POL-04: Extend billing period on successful payment
            tracing::info!(
                "✅ {} payment succeeded: {} ({} {})",
                provider,
                provider_tx_id,
                *amount_cents as f64 / 100.0,
                currency
            );

            // Extend billing period for the customer (safety net)
            if let Some(cid) = customer_id {
                let period_ext = if *currency == "TRY" { "30 days" } else { "30 days" };
                sqlx::query(
                    &format!(
                        "UPDATE customers SET \
                         current_period_end = NOW() + INTERVAL '{}', \
                         payment_failed_at = NULL, \
                         updated_at = NOW() \
                         WHERE id = $1",
                        period_ext
                    )
                )
                .bind(cid)
                .execute(pool)
                .await?;

                tracing::info!(
                    "📅 Billing period extended for customer {} after successful payment",
                    cid
                );

                // HS-039: If customer had a previous payment failure, notify recovery
                let had_failure: Option<chrono::DateTime<chrono::Utc>> = sqlx::query_scalar(
                    "SELECT payment_failed_at FROM customers WHERE id = $1"
                )
                .bind(cid)
                .fetch_optional(pool)
                .await?
                .flatten();

                if had_failure.is_some() {
                    let pool_clone = pool.clone();
                    let provider_clone = provider.to_string();
                    let cid_owned = *cid;
                    tokio::spawn(async move {
                        crate::notifications::helpers::payment_recovered(&pool_clone, cid_owned, &provider_clone).await;
                    });
                }

                // Record payment transaction
                let _ = sqlx::query(
                    "INSERT INTO payment_transactions \
                     (customer_id, provider, provider_tx_id, status, amount_cents, currency) \
                     VALUES ($1, $2, $3, 'completed', $4, $5) \
                     ON CONFLICT DO NOTHING",
                )
                .bind(cid)
                .bind(provider)
                .bind(provider_tx_id)
                .bind(*amount_cents as i64)
                .bind(currency)
                .execute(pool)
                .await;

                // Create invoice with actual payment amount and correct provider
                let plan_name: Option<String> = sqlx::query_scalar(
                    "SELECT plan FROM customers WHERE id = $1"
                )
                .bind(cid)
                .fetch_optional(pool)
                .await
                .ok()
                .flatten();
                if let Some(plan) = plan_name {
                    let _ = sqlx::query(
                        "INSERT INTO invoices (customer_id, amount_cents, currency, status, plan, provider, provider_invoice_id, paid_at) \
                         VALUES ($1, $2, $3, 'paid', $4, $5, $6, NOW())",
                    )
                    .bind(cid)
                    .bind(*amount_cents as i64)
                    .bind(currency)
                    .bind(&plan)
                    .bind(provider)
                    .bind(invoice_number.as_deref())
                    .execute(pool)
                    .await;
                }
            }
        }
        WebhookResult::PaymentFailed {
            provider_tx_id,
            customer_id,
        } => {
            if let Some(cid) = customer_id {
                // Mark payment failure — but do NOT downgrade yet!
                // Polar has its own retry schedule (4 retries over 21 days).
                // If all retries fail, Polar will send subscription.canceled.
                // If a retry succeeds, Polar will send subscription.updated (active).
                let existing_failure: Option<chrono::DateTime<chrono::Utc>> = sqlx::query_scalar(
                    "SELECT payment_failed_at FROM customers WHERE id = $1"
                )
                .bind(cid)
                .fetch_optional(pool)
                .await?
                .flatten();

                if existing_failure.is_none() {
                    // First failure — mark it, Polar will handle retries
                    sqlx::query(
                        "UPDATE customers SET \
                         payment_failed_at = NOW(), \
                         updated_at = NOW() WHERE id = $1",
                    )
                    .bind(cid)
                    .execute(pool)
                    .await?;

                    // Notify customer about the failure
                    let pool_clone = pool.clone();
                    let cid_owned = *cid;
                    let provider_clone = provider.to_string();
                    tokio::spawn(async move {
                        crate::notifications::helpers::payment_failed_warning(&pool_clone, cid_owned, &provider_clone).await;
                    });

                    tracing::warn!(
                        "⚠️ {} payment failed: {} — customer {} marked (Polar will retry)",
                        provider, provider_tx_id, cid
                    );
                } else {
                    tracing::info!(
                        "⚠️ {} payment failed again: {} — customer {} (Polar retry in progress)",
                        provider, provider_tx_id, cid
                    );
                }
            } else {
                tracing::warn!(
                    "⚠️ {} payment failed: {} — no customer_id, downgrade skipped",
                    provider, provider_tx_id
                );
            }
        }
        WebhookResult::Ignored => {}
    }

    Ok(())
}

