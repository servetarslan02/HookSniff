use async_trait::async_trait;
use uuid::Uuid;

use crate::billing::provider::{CheckoutResult, PaymentProviderImpl, WebhookResult};
use crate::billing::Plan;
use crate::error::AppError;

use super::{PolarProvider, CreateCheckoutRequest, CheckoutSession, PolarWebhookEvent, PolarSubscription, CreateCustomerSessionRequest, CustomerSessionResponse};

#[async_trait]
impl PaymentProviderImpl for PolarProvider {
    async fn create_checkout(
        &self,
        customer_id: Uuid,
        customer_email: &str,
        plan: &Plan,
        app_url: &str,
        yearly: bool,
        discount_code: Option<&str>,
        has_used_startup_trial: bool,
    ) -> Result<CheckoutResult, AppError> {
        let product_id = self
            .config
            .product_id_for_plan(plan, yearly)
            .ok_or_else(|| AppError::BadRequest("Invalid plan for Polar checkout".into()))?;

        let mut metadata = std::collections::HashMap::new();
        metadata.insert("customer_id".to_string(), customer_id.to_string());
        metadata.insert("plan".to_string(), plan.as_str().to_string());

        // Auto-apply Startup trial discount (first month free) ONLY for first-time buyers
        // Skip if customer already used the trial or provided their own code
        let auto_discount_id = if *plan == Plan::Startup && discount_code.is_none() && !has_used_startup_trial {
            self.config.startup_trial_discount_id()
        } else {
            None
        };

        // If user provided a discount code, look up its ID via Polar API
        // (discount_code only prefills the input; discount_id auto-applies)
        let resolved_discount_id = if let Some(code) = discount_code {
            match self.lookup_discount_id(code).await {
                Ok(Some(id)) => Some(id),
                Ok(None) => {
                    tracing::warn!("Discount code '{}' not found in Polar", code);
                    None
                }
                Err(e) => {
                    tracing::warn!("Failed to lookup discount code '{}': {}", code, e);
                    None
                }
            }
        } else {
            auto_discount_id
        };

        let req_body = CreateCheckoutRequest {
            products: vec![product_id.to_string()],
            external_customer_id: Some(customer_id.to_string()),
            customer_email: Some(customer_email.to_string()),
            success_url: Some(format!("{}/billing?upgraded=true", app_url)),
            locale: Some("en".to_string()),
            discount_code: None, // Don't use discount_code — it only prefills, doesn't apply
            discount_id: resolved_discount_id,
            metadata: Some(metadata),
        };

        let resp = self
            .client
            .post(format!("{}/v1/checkouts", self.config.base_url))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .header("Content-Type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar request failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Polar checkout creation failed ({}): {}", status, body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Polar checkout failed ({}): {}",
                status,
                if body.len() > 200 { &body[..200] } else { &body }
            )));
        }

        let session: CheckoutSession = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Polar response: {}", e))
        })?;

        Ok(CheckoutResult {
            checkout_url: session.url,
            session_id: session.id,
        })
    }

    async fn handle_webhook(
        &self,
        headers: &axum::http::HeaderMap,
        body: &str,
        pool: &sqlx::PgPool,
    ) -> Result<WebhookResult, AppError> {
        // Verify signature — log failure but ALWAYS return 200 to prevent Polar auto-disable
        let sig_header = headers
            .get("polar-signature")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if sig_header.is_empty() {
            tracing::warn!("Polar webhook: missing signature header — ignoring");
            return Ok(WebhookResult::Ignored);
        }

        if let Err(e) = Self::verify_signature(body, sig_header, &self.config.webhook_secret) {
            tracing::warn!("Polar webhook: signature verification failed: {:?} — ignoring", e);
            return Ok(WebhookResult::Ignored);
        }

        // Parse event — NEVER return error to Polar (causes webhook auto-disable)
        let event: PolarWebhookEvent = match serde_json::from_str(body) {
            Ok(e) => e,
            Err(e) => {
                tracing::warn!("Invalid Polar webhook payload: {:?} — ignoring", e);
                return Ok(WebhookResult::Ignored);
            }
        };

        tracing::info!("Polar webhook: {}", event.event_type);

        match event.event_type.as_str() {
            "subscription.created" => {
                let sub: PolarSubscription = match serde_json::from_value(event.data.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::warn!("Invalid Polar subscription data: {:?} — ignoring", e);
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let customer_id = match sub
                    .external_customer_id
                    .as_deref()
                    .or(sub.customer_id.as_deref())
                    .and_then(|s| Uuid::parse_str(s).ok())
                {
                    Some(id) => id,
                    None => {
                        tracing::warn!("Missing/invalid customer_id in Polar subscription.created — ignoring");
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let product_id = match sub.product_id.as_deref() {
                    Some(id) => id,
                    None => {
                        tracing::warn!("Missing product_id in Polar subscription.created — ignoring");
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let plan = self.determine_plan(product_id);
                let interval = sub.interval.clone()
                    .unwrap_or_else(|| if self.config.is_yearly_product(product_id) { "year".to_string() } else { "month".to_string() });

                Ok(WebhookResult::SubscriptionCreated {
                    customer_id,
                    plan,
                    provider_customer_id: sub.customer_id.clone(),
                    provider_subscription_id: sub.id.clone(),
                    interval,
                    event_id: event.id.clone(),
                    cancel_at_period_end: sub.cancel_at_period_end.unwrap_or(false),
                    current_period_end: sub.current_period_end.clone(),
                })
            }
            "subscription.updated" => {
                let sub: PolarSubscription = match serde_json::from_value(event.data.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::warn!("Invalid Polar subscription update data: {:?} — ignoring", e);
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let sub_id = sub.id.unwrap_or_default();
                let status = sub.status.unwrap_or_else(|| "active".to_string());

                // POL-03: Handle canceled/revoked status in subscription.updated
                // Polar may send status change via updated event instead of canceled event
                if status == "canceled" || status == "revoked" {
                    tracing::info!(
                        "Polar subscription {} canceled via updated event (status={})",
                        sub_id, status
                    );
                    return Ok(WebhookResult::SubscriptionCanceled {
                        provider_subscription_id: sub_id,
                        event_id: event.id.clone(),
                    });
                }

                // Handle cancel_at_period_end — customer requested cancellation via Polar portal
                if sub.cancel_at_period_end == Some(true) {
                    tracing::info!(
                        "Polar subscription {} marked for cancellation at period end",
                        sub_id
                    );
                    // Find customer and set cancel_at_period_end in our DB
                    if let Some(cid) = sub.external_customer_id.as_deref()
                        .or(sub.customer_id.as_deref())
                        .and_then(|s| Uuid::parse_str(s).ok())
                    {
                        let _ = sqlx::query(
                            "UPDATE customers SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1"
                        )
                        .bind(cid)
                        .execute(pool)
                        .await;
                    }
                    // Still process as updated so plan/period info stays in sync
                }

                // POL-08: Handle past_due status — DON'T downgrade immediately!
                // Polar has its own retry schedule (2, 7, 14, 21 days).
                // We mark the customer as having a payment issue but keep their plan.
                if status == "past_due" {
                    tracing::warn!(
                        "Polar subscription {} is past_due — marking payment failure (NOT downgrading)",
                        sub_id
                    );
                    let customer_id = sub
                        .external_customer_id
                        .as_deref()
                        .or(sub.customer_id.as_deref())
                        .and_then(|s| Uuid::parse_str(s).ok());

                    // Mark payment_failed_at but do NOT change plan — Polar is retrying
                    if let Some(cid) = customer_id {
                        let _ = sqlx::query(
                            "UPDATE customers SET payment_failed_at = NOW(), updated_at = NOW() WHERE id = $1 AND payment_failed_at IS NULL"
                        )
                        .bind(cid)
                        .execute(pool)
                        .await;
                    }

                    return Ok(WebhookResult::PaymentFailed {
                        provider_tx_id: sub_id.clone(),
                        customer_id,
                    });
                }

                let product_id = match sub.product_id.as_deref() {
                    Some(id) => id,
                    None => {
                        tracing::warn!("Missing product_id in Polar subscription.updated — ignoring");
                        return Ok(WebhookResult::Ignored);
                    }
                };

                let plan = self.determine_plan(product_id);
                let interval = sub.interval.clone()
                    .unwrap_or_else(|| if self.config.is_yearly_product(product_id) { "year".to_string() } else { "month".to_string() });

                Ok(WebhookResult::SubscriptionUpdated {
                    provider_subscription_id: sub_id,
                    plan,
                    status,
                    interval,
                    event_id: event.id.clone(),
                    cancel_at_period_end: sub.cancel_at_period_end.unwrap_or(false),
                    current_period_end: sub.current_period_end.clone(),
                })
            }
            "subscription.canceled" | "subscription.revoked" => {
                let sub: PolarSubscription = match serde_json::from_value(event.data.clone()) {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::warn!("Invalid Polar subscription cancel data: {:?} — ignoring", e);
                        return Ok(WebhookResult::Ignored);
                    }
                };

                Ok(WebhookResult::SubscriptionCanceled {
                    provider_subscription_id: sub.id.unwrap_or_default(),
                    event_id: event.id.clone(),
                })
            }
            "order.completed" | "order.created" => {
                // Payment succeeded — Polar sends both order.created and order.completed
                // order.created fires first (when payment starts), order.completed after confirmation
                // We handle both for robustness; idempotency check in webhooks.rs prevents duplicates
                let order = &event.data;
                let tx_id = order
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                // Use total_amount (what customer actually paid) instead of amount (which may be 0)
                // Fallback chain: total_amount → net_amount → amount → subtotal_amount
                let amount = order
                    .get("total_amount")
                    .and_then(|v| v.as_i64())
                    .or_else(|| order.get("net_amount").and_then(|v| v.as_i64()))
                    .or_else(|| order.get("amount").and_then(|v| v.as_i64()))
                    .unwrap_or(0) as u64;

                // Store subtotal for reference (original price before discount)
                let _subtotal = order
                    .get("subtotal_amount")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0);

                let currency = order
                    .get("currency")
                    .and_then(|v| v.as_str())
                    .unwrap_or("USD")
                    .to_string();

                // Polar invoice number for customer reference
                let invoice_number = order
                    .get("invoice_number")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                // NOTE: Card info is NOT available from Polar (MoR — card data stays at Polar).
                // Card fields (card_last4, card_brand etc.) will be NULL for Polar customers.
                // UI should show "Managed by Polar.sh" instead of card details.

                Ok(WebhookResult::PaymentSucceeded {
                    provider_tx_id: tx_id,
                    amount_cents: amount,
                    currency,
                    customer_id: order
                        .get("customer_id")
                        .or_else(|| order.get("external_customer_id"))
                        .and_then(|v| v.as_str())
                        .and_then(|s| Uuid::parse_str(s).ok()),
                    invoice_number,
                })
            }
            "order.refunded" => {
                // Polar refund completed — update invoice status and downgrade customer
                let order = &event.data;
                let tx_id = order
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();

                let amount = order
                    .get("total_amount")
                    .and_then(|v| v.as_i64())
                    .or_else(|| order.get("amount").and_then(|v| v.as_i64()))
                    .unwrap_or(0) as i64;

                let customer_id = order
                    .get("customer_id")
                    .or_else(|| order.get("external_customer_id"))
                    .and_then(|v| v.as_str())
                    .and_then(|s| Uuid::parse_str(s).ok());

                tracing::info!(
                    "💰 Polar order refunded: {} (amount: {} cents)",
                    tx_id,
                    amount
                );

                if let Some(cid) = customer_id {
                    // Update latest paid invoice to "refunded"
                    let _ = sqlx::query(
                        "UPDATE invoices SET status = 'refunded' \
                         WHERE id = (\
                           SELECT id FROM invoices \
                           WHERE customer_id = $1 AND status = 'paid' \
                           ORDER BY created_at DESC LIMIT 1\
                         )",
                    )
                    .bind(cid)
                    .execute(pool)
                    .await;

                    // Downgrade to free
                    let free_limit = Plan::Developer.max_webhooks_per_day() as i64;
                    let _ = sqlx::query(
                        "UPDATE customers SET \
                         plan = 'free', webhook_limit = $1, \
                         cancel_at_period_end = false, \
                         updated_at = NOW() \
                         WHERE id = $2",
                    )
                    .bind(free_limit)
                    .bind(cid)
                    .execute(pool)
                    .await;

                    // Log refund transaction
                    let _ = sqlx::query(
                        "INSERT INTO payment_transactions \
                         (customer_id, provider, provider_tx_id, status, amount_cents, currency) \
                         VALUES ($1, 'polar', $2, 'refunded', $3, 'USD') \
                         ON CONFLICT DO NOTHING",
                    )
                    .bind(cid)
                    .bind(&tx_id)
                    .bind(amount)
                    .execute(pool)
                    .await;

                    tracing::info!(
                        "✅ Customer {} refunded via Polar order.refunded — downgraded to free",
                        cid
                    );
                }

                Ok(WebhookResult::Ignored)
            }
            _ => {
                tracing::debug!("Unhandled Polar event: {}", event.event_type);
                Ok(WebhookResult::Ignored)
            }
        }
    }

    async fn create_customer_portal(
        &self,
        polar_customer_id: &str,
        app_url: &str,
    ) -> Result<String, AppError> {
        // Create a customer portal session via Polar.sh API.
        // This generates a tokenized URL for the customer to manage their subscription.
        let req_body = CreateCustomerSessionRequest {
            external_customer_id: polar_customer_id.to_string(),
            return_url: Some(format!("{}/dashboard/billing", app_url)),
        };

        let resp = self
            .client
            .post(format!("{}/v1/customer-sessions/", self.config.base_url))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .header("Content-Type", "application/json")
            .json(&req_body)
            .send()
            .await
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!(
                    "Polar customer portal request failed: {}",
                    e
                ))
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            tracing::error!(
                "Polar customer portal creation failed ({}): {}",
                status,
                body
            );
            // Fall back to our own billing page if Polar portal fails
            return Ok(format!("{}/dashboard/billing", app_url));
        }

        let session: CustomerSessionResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to parse Polar customer session response: {}",
                e
            ))
        })?;

        // Prefer direct portal URL if Polar provides one
        if let Some(portal_url) = session.customer_portal_url {
            return Ok(portal_url);
        }

        // Construct portal URL from token
        if let Some(token) = session.token {
            let portal_base = if self.config.base_url.contains("sandbox") {
                "https://sandbox.polar.sh"
            } else {
                "https://polar.sh"
            };
            return Ok(format!("{}/customer-portal/{}", portal_base, token));
        }

        // Fallback to our billing page
        tracing::warn!("Polar customer session returned no token or portal URL");
        Ok(format!("{}/dashboard/billing", app_url))
    }

    async fn cancel_subscription(&self, polar_subscription_id: &str) -> Result<(), AppError> {
        let resp = self
            .client
            .delete(format!(
                "{}/v1/subscriptions/{}",
                self.config.base_url, polar_subscription_id
            ))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar cancel failed: {}", e)))?;

        if !resp.status().is_success() {
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Polar subscription cancel failed: {}", body);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Failed to cancel Polar subscription"
            )));
        }

        Ok(())
    }

    /// Cancel at period end — Polar supports this via PATCH with cancel_at_period_end=true.
    async fn cancel_subscription_at_period_end(&self, polar_subscription_id: &str) -> Result<(), AppError> {
        let resp = self
            .client
            .patch(format!(
                "{}/v1/subscriptions/{}",
                self.config.base_url, polar_subscription_id
            ))
            .header(
                "Authorization",
                format!("Bearer {}", self.config.access_token),
            )
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({ "cancel_at_period_end": true }))
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar cancel_at_period_end failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            tracing::error!("Polar cancel_at_period_end failed ({}): {}", status, body);
            // Fallback: if PATCH doesn't work, just set it in our DB (Polar will still charge)
            tracing::warn!("⚠️ Could not set cancel_at_period_end at Polar — customer will need to cancel manually via portal");
        }

        Ok(())
    }

}

