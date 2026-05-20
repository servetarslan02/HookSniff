use super::*;

pub async fn process_expired_grace_periods(pool: &sqlx::PgPool) -> Result<u64, AppError> {
    let cutoff = Utc::now() - chrono::Duration::days(GRACE_PERIOD_DAYS);

    // Find customers past grace period
    let rows: Vec<(uuid::Uuid, String)> = sqlx::query_as(
        "SELECT id, plan FROM customers \
         WHERE payment_failed_at IS NOT NULL \
         AND payment_failed_at < $1 \
         AND plan != 'free'",
    )
    .bind(cutoff)
    .fetch_all(pool)
    .await?;

    let count = rows.len() as u64;

    for (customer_id, _plan) in &rows {
        let free_limit = Plan::Developer.max_webhooks_per_day() as i64;

        sqlx::query(
            "UPDATE customers SET plan = 'free', webhook_limit = $1, \
             payment_failed_at = NULL, cancel_at_period_end = false, updated_at = NOW() \
             WHERE id = $2",
        )
        .bind(free_limit)
        .bind(customer_id)
        .execute(pool)
        .await?;

        // HS-060: Clean up excess endpoints on grace period expiry
        cleanup_excess_endpoints(pool, *customer_id, &Plan::Developer).await?;

        tracing::info!(
            "⏰ Customer {} downgraded to free after {} day grace period",
            customer_id,
            GRACE_PERIOD_DAYS
        );
    }

    Ok(count)
}

// ──────────────────────────────────────────────────────────────
// HS-060: Endpoint cleanup on downgrade
// ──────────────────────────────────────────────────────────────

/// Disable endpoints that exceed the new plan's limit.
/// Keeps the oldest (by created_at) endpoints active, disables the rest.

pub async fn cleanup_excess_endpoints(
    pool: &sqlx::PgPool,
    customer_id: uuid::Uuid,
    new_plan: &Plan,
) -> Result<(), AppError> {
    let max_endpoints = new_plan.max_endpoints();

    // Count active endpoints
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true",
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    let active_count = count.0 as u32;

    if active_count <= max_endpoints {
        return Ok(()); // No cleanup needed
    }

    let excess = active_count - max_endpoints;

    // Disable the newest endpoints (keep oldest active)
    let result = sqlx::query(
        "UPDATE endpoints SET is_active = false, updated_at = NOW() \
         WHERE id IN (\
           SELECT id FROM endpoints \
           WHERE customer_id = $1 AND is_active = true \
           ORDER BY created_at DESC \
           LIMIT $2\
         )",
    )
    .bind(customer_id)
    .bind(excess as i64)
    .execute(pool)
    .await?;

    tracing::info!(
        "🔧 Disabled {} excess endpoints for customer {} (plan: {}, limit: {})",
        result.rows_affected(),
        customer_id,
        new_plan.as_str(),
        max_endpoints
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::routes::billing::subscription::{UpgradeRequest, UpgradeResponse};
    use crate::routes::billing::portal::{UsageResponse, UsageCounter, RateLimitInfo, PeriodInfo, InvoiceResponse};

    // ── SubscriptionResponse ────────────────────────────────

    #[test]
    fn test_subscription_response_serialization() {
        let resp = SubscriptionResponse {
            plan: "pro".to_string(),
            status: "active".to_string(),
            payment_provider: "stripe".to_string(),
            stripe_subscription_id: Some("sub_123".to_string()),
            polar_subscription_id: None,
            iyzico_subscription_id: None,
            webhook_limit: 50_000,
            endpoint_limit: u32::MAX,
            retention_days: 30,
            monthly_price_cents: 4900,
            monthly_price_kurus: 0,
            cancel_at_period_end: false,
            billing_period: "monthly".to_string(),
            current_period_end: Some("2026-06-01T00:00:00+00:00".to_string()),
            card_last4: Some("4242".to_string()),
            card_brand: Some("visa".to_string()),
            card_exp_month: Some(12),
            card_exp_year: Some(2027),
            paused_at: None,
            paused_until: None,
            pause_plan: None,
            has_used_startup_trial: false,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["status"], "active");
        assert_eq!(json["webhook_limit"], 50_000);
        assert_eq!(json["monthly_price_cents"], 4900);
        assert_eq!(json["cancel_at_period_end"], false);
        assert_eq!(json["billing_period"], "monthly");
    }

    #[test]
    fn test_subscription_response_clone_and_debug() {
        let resp = SubscriptionResponse {
            plan: "developer".to_string(),
            status: "active".to_string(),
            payment_provider: "polar".to_string(),
            stripe_subscription_id: None,
            polar_subscription_id: Some("polar_sub".to_string()),
            iyzico_subscription_id: None,
            webhook_limit: 1000,
            endpoint_limit: u32::MAX,
            retention_days: 7,
            monthly_price_cents: 0,
            monthly_price_kurus: 0,
            cancel_at_period_end: false,
            billing_period: "monthly".to_string(),
            current_period_end: None,
            card_last4: None,
            card_brand: None,
            card_exp_month: None,
            card_exp_year: None,
            paused_at: None,
            paused_until: None,
            pause_plan: None,
            has_used_startup_trial: false,
        };
        let _debug = format!("{:?}", resp);
    }

    // ── UpgradeRequest ──────────────────────────────────────

    #[test]
    fn test_upgrade_request_deserialization_with_provider() {
        let json = r#"{"plan":"pro","provider":"polar"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "pro");
        assert_eq!(req.provider, Some("polar".to_string()));
    }

    #[test]
    fn test_upgrade_request_deserialization_without_provider() {
        let json = r#"{"plan":"enterprise"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "enterprise");
        assert_eq!(req.provider, None);
        assert_eq!(req.billing_period, None);
    }

    #[test]
    fn test_upgrade_request_deserialization_with_billing_period() {
        let json = r#"{"plan":"pro","billing_period":"annual"}"#;
        let req: UpgradeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.plan, "pro");
        assert_eq!(req.billing_period, Some("annual".to_string()));
    }

    #[test]
    fn test_upgrade_request_debug() {
        let req: UpgradeRequest = serde_json::from_str(r#"{"plan":"pro"}"#).unwrap();
        let _debug = format!("{:?}", req);
    }

    // ── UpgradeResponse ─────────────────────────────────────

    #[test]
    fn test_upgrade_response_serialization() {
        let resp = UpgradeResponse {
            checkout_url: Some("https://checkout.stripe.com/xyz".to_string()),
            provider: "stripe".to_string(),
            message: "Redirecting".to_string(),
            prorated_amount_cents: None,
            days_remaining: None,
            requires_contact: None,
            contact_url: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["checkout_url"], "https://checkout.stripe.com/xyz");
        assert_eq!(json["provider"], "stripe");
    }

    #[test]
    fn test_upgrade_response_none_checkout_url() {
        let resp = UpgradeResponse {
            checkout_url: None,
            provider: "stripe".to_string(),
            message: "Done".to_string(),
            prorated_amount_cents: Some(1500),
            days_remaining: Some(15),
            requires_contact: None,
            contact_url: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["checkout_url"].is_null());
        assert_eq!(json["prorated_amount_cents"], 1500);
        assert_eq!(json["days_remaining"], 15);
    }

    #[test]
    fn test_upgrade_response_enterprise_contact() {
        let resp = UpgradeResponse {
            checkout_url: None,
            provider: "stripe".to_string(),
            message: "Enterprise plan requires a custom agreement.".into(),
            prorated_amount_cents: None,
            days_remaining: None,
            requires_contact: Some(true),
            contact_url: Some("mailto:enterprise@hooksniff.dev".into()),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["checkout_url"].is_null());
        assert_eq!(json["requires_contact"], true);
        assert_eq!(json["contact_url"], "mailto:enterprise@hooksniff.dev");
    }

    // ── PortalResponse ──────────────────────────────────────

    #[test]
    fn test_portal_response_serialization() {
        let resp = PortalResponse {
            url: "https://billing.stripe.com/session/abc".to_string(),
            provider: "stripe".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["url"], "https://billing.stripe.com/session/abc");
        assert_eq!(json["provider"], "stripe");
    }

    // ── UsageResponse ───────────────────────────────────────

    #[test]
    fn test_usage_response_serialization() {
        let resp = UsageResponse {
            plan: "pro".to_string(),
            payment_provider: "stripe".to_string(),
            webhooks: UsageCounter {
                used: 100,
                limit: Some(50_000),
                remaining: 49_900,
            },
            endpoints: UsageCounter {
                used: 5,
                limit: Some(50),
                remaining: 45,
            },
            rate_limit: RateLimitInfo {
                requests_per_minute: 1000,
            },
            period: PeriodInfo {
                start: "2024-01-01".to_string(),
                end: "2024-02-01".to_string(),
            },
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["plan"], "pro");
        assert_eq!(json["webhooks"]["used"], 100);
        assert_eq!(json["webhooks"]["remaining"], 49_900);
        assert_eq!(json["endpoints"]["limit"], 50);
        assert_eq!(json["rate_limit"]["requests_per_minute"], 1000);
        assert_eq!(json["period"]["start"], "2024-01-01");
    }

    #[test]
    fn test_usage_counter_serialization() {
        let counter = UsageCounter {
            used: 0,
            limit: Some(1000),
            remaining: 1000,
        };
        let json = serde_json::to_value(&counter).unwrap();
        assert_eq!(json["used"], 0);
        assert_eq!(json["limit"], 1000);
    }

    #[test]
    fn test_rate_limit_info_serialization() {
        let info = RateLimitInfo {
            requests_per_minute: 60,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["requests_per_minute"], 60);
    }

    #[test]
    fn test_period_info_serialization() {
        let period = PeriodInfo {
            start: "2024-01-01".to_string(),
            end: "2024-02-01".to_string(),
        };
        let json = serde_json::to_value(&period).unwrap();
        assert_eq!(json["start"], "2024-01-01");
        assert_eq!(json["end"], "2024-02-01");
    }

    // ── InvoiceResponse ─────────────────────────────────────

    #[test]
    fn test_invoice_response_serialization() {
        let resp = InvoiceResponse {
            id: "inv_123".to_string(),
            date: "2024-01-15".to_string(),
            amount: 49.00,
            status: "paid".to_string(),
            plan: "pro".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["id"], "inv_123");
        assert_eq!(json["amount"], 49.0);
        assert_eq!(json["status"], "paid");
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_billing_router_construction() {
        let _router = router();
    }

    // ── Item 259: Checkout URL validation ──────────────────

    #[test]
    fn test_validate_checkout_url_stripe() {
        assert!(validate_checkout_url("https://checkout.stripe.com/pay/cs_test_abc123").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_polar() {
        assert!(validate_checkout_url("https://polar.sh/checkout/sess_001").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_iyzico() {
        assert!(validate_checkout_url("https://secure.iyzipay.com/checkout/123").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_localhost() {
        assert!(validate_checkout_url("http://localhost:3001/checkout").is_ok());
    }

    #[test]
    fn test_validate_checkout_url_rejects_http() {
        assert!(validate_checkout_url("http://checkout.stripe.com/pay/cs_test").is_err());
    }

    #[test]
    fn test_validate_checkout_url_rejects_unknown_domain() {
        assert!(validate_checkout_url("https://evil.example.com/steal").is_err());
    }

    #[test]
    fn test_validate_checkout_url_rejects_invalid_url() {
        assert!(validate_checkout_url("not-a-url").is_err());
    }

    // ── SubscriptionResponse with cancel_at_period_end ─────

    #[test]
    fn test_subscription_response_cancel_at_period_end_true() {
        let resp = SubscriptionResponse {
            plan: "pro".to_string(),
            status: "canceled".to_string(),
            payment_provider: "stripe".to_string(),
            stripe_subscription_id: Some("sub_123".to_string()),
            polar_subscription_id: None,
            iyzico_subscription_id: None,
            webhook_limit: 50_000,
            endpoint_limit: u32::MAX,
            retention_days: 30,
            monthly_price_cents: 4900,
            monthly_price_kurus: 0,
            cancel_at_period_end: true,
            billing_period: "monthly".to_string(),
            current_period_end: Some("2026-06-01T00:00:00+00:00".to_string()),
            card_last4: Some("4242".to_string()),
            card_brand: Some("visa".to_string()),
            card_exp_month: Some(12),
            card_exp_year: Some(2027),
            paused_at: None,
            paused_until: None,
            pause_plan: None,
            has_used_startup_trial: false,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["cancel_at_period_end"], true);
        assert_eq!(json["status"], "canceled");
    }
}

