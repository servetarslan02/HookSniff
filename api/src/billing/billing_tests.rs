//! Tests for billing module — Plan limits, Usage tracking, serde.

#[cfg(test)]
mod billing_tests {
    use crate::billing::*;
    use crate::billing::models::*;

    // ── Plan::parse_str ────────────────────────────────────────

    #[test]
    fn parse_str_developer() {
        assert_eq!(Plan::parse_str("developer"), Plan::Developer);
        assert_eq!(Plan::parse_str("Developer"), Plan::Developer);
        assert_eq!(Plan::parse_str("DEVELOPER"), Plan::Developer);
        assert_eq!(Plan::parse_str("free"), Plan::Developer);
        assert_eq!(Plan::parse_str("Free"), Plan::Developer);
    }

    #[test]
    fn parse_str_startup() {
        assert_eq!(Plan::parse_str("startup"), Plan::Startup);
        assert_eq!(Plan::parse_str("Startup"), Plan::Startup);
        assert_eq!(Plan::parse_str("STARTUP"), Plan::Startup);
    }

    #[test]
    fn parse_str_pro() {
        assert_eq!(Plan::parse_str("pro"), Plan::Pro);
        assert_eq!(Plan::parse_str("Pro"), Plan::Pro);
        assert_eq!(Plan::parse_str("PRO"), Plan::Pro);
    }

    #[test]
    fn parse_str_enterprise() {
        assert_eq!(Plan::parse_str("enterprise"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("Enterprise"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("ENTERPRISE"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("business"), Plan::Enterprise);
        assert_eq!(Plan::parse_str("Business"), Plan::Enterprise);
    }

    #[test]
    fn parse_str_default_is_developer() {
        assert_eq!(Plan::parse_str(""), Plan::Developer);
        assert_eq!(Plan::parse_str("unknown"), Plan::Developer);
        assert_eq!(Plan::parse_str("random_string"), Plan::Developer);
    }

    // ── Plan::as_str ───────────────────────────────────────────

    #[test]
    fn as_str_all_variants() {
        assert_eq!(Plan::Developer.as_str(), "free");
        assert_eq!(Plan::Startup.as_str(), "startup");
        assert_eq!(Plan::Pro.as_str(), "pro");
        assert_eq!(Plan::Enterprise.as_str(), "enterprise");
    }

    // ── Roundtrip parse_str ↔ as_str ───────────────────────────

    #[test]
    fn parse_str_as_str_roundtrip() {
        for variant in &[Plan::Developer, Plan::Startup, Plan::Pro, Plan::Enterprise] {
            let s = variant.as_str();
            assert_eq!(Plan::parse_str(s), *variant);
        }
    }

    // ── max_applications ───────────────────────────────────────

    #[test]
    fn max_applications_all() {
        assert_eq!(Plan::Developer.max_applications(), u32::MAX);
        assert_eq!(Plan::Startup.max_applications(), u32::MAX);
        assert_eq!(Plan::Pro.max_applications(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_applications(), u32::MAX);
    }

    // ── max_event_types ────────────────────────────────────────

    #[test]
    fn max_event_types_all() {
        assert_eq!(Plan::Developer.max_event_types(), 10);
        assert_eq!(Plan::Startup.max_event_types(), 50);
        assert_eq!(Plan::Pro.max_event_types(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_event_types(), u32::MAX);
    }

    // ── max_team_members ───────────────────────────────────────

    #[test]
    fn max_team_members_all() {
        assert_eq!(Plan::Developer.max_team_members(), 1);
        assert_eq!(Plan::Startup.max_team_members(), 25);
        assert_eq!(Plan::Pro.max_team_members(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_team_members(), u32::MAX);
    }

    // ── max_subscriptions ──────────────────────────────────────

    #[test]
    fn max_subscriptions_all() {
        assert_eq!(Plan::Developer.max_subscriptions(), 10);
        assert_eq!(Plan::Startup.max_subscriptions(), 300);
        assert_eq!(Plan::Pro.max_subscriptions(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_subscriptions(), u32::MAX);
    }

    // ── max_events_per_day ─────────────────────────────────────

    #[test]
    fn max_events_per_day_all() {
        assert_eq!(Plan::Developer.max_events_per_day(), 1_000);
        assert_eq!(Plan::Startup.max_events_per_day(), 30_000);
        assert_eq!(Plan::Pro.max_events_per_day(), 100_000);
        assert_eq!(Plan::Enterprise.max_events_per_day(), u64::MAX);
    }

    // ── overage_price_per_event ──────────────────────────

    #[test]
    fn overage_price_all() {
        assert_eq!(Plan::Developer.overage_price_per_event(), 0.0);
        assert_eq!(Plan::Startup.overage_price_per_event(), 0.00003);
        assert_eq!(Plan::Pro.overage_price_per_event(), 0.000001);
        assert_eq!(Plan::Enterprise.overage_price_per_event(), 0.0);
    }

    // ── allows_overage ─────────────────────────────────────────

    #[test]
    fn allows_overage_all() {
        assert!(!Plan::Developer.allows_overage());
        assert!(Plan::Startup.allows_overage());
        assert!(Plan::Pro.allows_overage());
        assert!(Plan::Enterprise.allows_overage());
    }

    // ── max_webhooks_per_day ─────────────────────────────────

    #[test]
    fn max_webhooks_per_day_all() {
        assert_eq!(Plan::Developer.max_webhooks_per_day(), 1_000);
        assert_eq!(Plan::Startup.max_webhooks_per_day(), 30_000);
        assert_eq!(Plan::Pro.max_webhooks_per_day(), 100_000);
        assert_eq!(Plan::Enterprise.max_webhooks_per_day(), u64::MAX);
    }

    // ── max_requests_per_minute ────────────────────────────────

    #[test]
    fn max_requests_per_minute_all() {
        assert_eq!(Plan::Developer.max_requests_per_minute(), 1_000);
        assert_eq!(Plan::Startup.max_requests_per_minute(), 1_000);
        assert_eq!(Plan::Pro.max_requests_per_minute(), 10_000);
        assert_eq!(Plan::Enterprise.max_requests_per_minute(), u32::MAX);
    }

    // ── max_endpoints ──────────────────────────────────────────

    #[test]
    fn max_endpoints_all() {
        assert_eq!(Plan::Developer.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Startup.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Pro.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_endpoints(), u32::MAX);
    }

    // ── max_payload_bytes ──────────────────────────────────────

    #[test]
    fn max_payload_bytes_all() {
        assert_eq!(Plan::Developer.max_payload_bytes(), 256 * 1024);
        assert_eq!(Plan::Startup.max_payload_bytes(), 1024 * 1024);
        assert_eq!(Plan::Pro.max_payload_bytes(), 5 * 1024 * 1024);
        assert_eq!(Plan::Enterprise.max_payload_bytes(), 10 * 1024 * 1024);
    }

    // ── retention_days ─────────────────────────────────────────

    #[test]
    fn retention_days_all() {
        assert_eq!(Plan::Developer.retention_days(), 7);
        assert_eq!(Plan::Startup.retention_days(), 14);
        assert_eq!(Plan::Pro.retention_days(), 180);
        assert_eq!(Plan::Enterprise.retention_days(), 365);
    }

    // ── monthly_price_cents ────────────────────────────────────

    #[test]
    fn monthly_price_cents_all() {
        assert_eq!(Plan::Developer.monthly_price_cents(), 0);
        assert_eq!(Plan::Startup.monthly_price_cents(), 2900);
        assert_eq!(Plan::Pro.monthly_price_cents(), 4900);
        assert_eq!(Plan::Enterprise.monthly_price_cents(), 0);
    }

    // ── monthly_price_kurus ────────────────────────────────────

    #[test]
    fn monthly_price_kurus_all() {
        assert_eq!(Plan::Developer.monthly_price_kurus(), 0);
        assert_eq!(Plan::Startup.monthly_price_kurus(), 59900);
        assert_eq!(Plan::Pro.monthly_price_kurus(), 99900);
        assert_eq!(Plan::Enterprise.monthly_price_kurus(), 0);
    }

    // ── annual_price_cents ────────────────────────────────────

    #[test]
    fn annual_price_cents_all() {
        assert_eq!(Plan::Startup.annual_price_cents(), 27840);
        assert_eq!(Plan::Pro.annual_price_cents(), 47040);
        assert_eq!(Plan::Developer.annual_price_cents(), 0);
        assert_eq!(Plan::Enterprise.annual_price_cents(), 0);
    }

    // ── annual_price_kurus ────────────────────────────────────

    #[test]
    fn annual_price_kurus_all() {
        assert_eq!(Plan::Startup.annual_price_kurus(), 575040);
        assert_eq!(Plan::Pro.annual_price_kurus(), 959040);
        assert_eq!(Plan::Developer.annual_price_kurus(), 0);
        assert_eq!(Plan::Enterprise.annual_price_kurus(), 0);
    }

    // ── requires_contact ──────────────────────────────────────

    #[test]
    fn requires_contact_enterprise_only() {
        assert!(!Plan::Developer.requires_contact());
        assert!(!Plan::Startup.requires_contact());
        assert!(!Plan::Pro.requires_contact());
        assert!(Plan::Enterprise.requires_contact());
    }

    // ── Plan ordering ──────────────────────────────────────────

    #[test]
    fn higher_tiers_have_higher_limits() {
        assert!(Plan::Startup.max_requests_per_minute() <= Plan::Pro.max_requests_per_minute());
        assert!(Plan::Pro.max_requests_per_minute() < Plan::Enterprise.max_requests_per_minute());
        assert_eq!(Plan::Developer.max_endpoints(), u32::MAX);
        assert_eq!(Plan::Enterprise.max_endpoints(), u32::MAX);
        assert!(Plan::Developer.max_webhooks_per_day() < Plan::Startup.max_webhooks_per_day());
        assert!(Plan::Startup.max_webhooks_per_day() < Plan::Pro.max_webhooks_per_day());
        assert!(Plan::Pro.max_webhooks_per_day() < Plan::Enterprise.max_webhooks_per_day());
    }

    // ── Usage ──────────────────────────────────────────────────

    fn make_usage(plan: Plan, webhooks_today: u64, endpoints_count: u32) -> Usage {
        Usage {
            customer_id: "test-customer".to_string(),
            plan,
            webhooks_today,
            api_calls_today: 0,
            endpoints_count,
            period_start: "2025-01-01".to_string(),
            period_end: "2025-01-31".to_string(),
        }
    }

    #[test]
    fn usage_webhook_limit_not_exceeded() {
        let usage = make_usage(Plan::Developer, 500, 2);
        assert!(!usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_webhook_limit_exceeded_at_boundary() {
        let usage = make_usage(Plan::Developer, 1_000, 2);
        assert!(usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_webhook_limit_exceeded_over() {
        let usage = make_usage(Plan::Developer, 1_500, 2);
        assert!(usage.is_webhook_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_not_exceeded() {
        let usage = make_usage(Plan::Developer, 0, 3);
        assert!(!usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_endpoint_limit_always_unlimited() {
        let usage = make_usage(Plan::Developer, 0, 1000);
        assert!(!usage.is_endpoint_limit_exceeded());
    }

    #[test]
    fn usage_remaining_webhooks_normal() {
        let usage = make_usage(Plan::Pro, 20_000, 0);
        assert_eq!(usage.remaining_webhooks(), 80_000);
    }

    #[test]
    fn usage_remaining_webhooks_saturates_at_zero() {
        let usage = make_usage(Plan::Developer, 20_000, 0);
        assert_eq!(usage.remaining_webhooks(), 0);
    }

    #[test]
    fn usage_remaining_endpoints_normal() {
        let usage = make_usage(Plan::Pro, 0, 10);
        assert_eq!(usage.remaining_endpoints(), u32::MAX - 10);
    }

    #[test]
    fn usage_remaining_endpoints_saturates_at_zero() {
        let usage = make_usage(Plan::Developer, 0, u32::MAX);
        assert_eq!(usage.remaining_endpoints(), 0);
    }

    // ── SubscriptionStatus ─────────────────────────────────────

    #[test]
    fn subscription_status_serde() {
        let s = serde_json::to_string(&SubscriptionStatus::Active).unwrap();
        assert_eq!(s, "\"active\"");
        let s = serde_json::to_string(&SubscriptionStatus::Canceled).unwrap();
        assert_eq!(s, "\"canceled\"");
    }

    #[test]
    fn invoice_status_serde() {
        let s = serde_json::to_string(&InvoiceStatus::Paid).unwrap();
        assert_eq!(s, "\"paid\"");
        let s = serde_json::to_string(&InvoiceStatus::Draft).unwrap();
        assert_eq!(s, "\"draft\"");
        let s = serde_json::to_string(&InvoiceStatus::Refunded).unwrap();
        assert_eq!(s, "\"refunded\"");
    }

    // ── Plan serde ─────────────────────────────────────────────

    #[test]
    fn plan_serde_roundtrip() {
        for variant in &[Plan::Developer, Plan::Startup, Plan::Pro, Plan::Enterprise] {
            let json = serde_json::to_string(variant).unwrap();
            let deserialized: Plan = serde_json::from_str(&json).unwrap();
            assert_eq!(*variant, deserialized);
        }
    }

    #[test]
    fn plan_deserialize_from_json() {
        assert_eq!(serde_json::from_str::<Plan>("\"developer\"").unwrap(), Plan::Developer);
        assert_eq!(serde_json::from_str::<Plan>("\"startup\"").unwrap(), Plan::Startup);
        assert_eq!(serde_json::from_str::<Plan>("\"pro\"").unwrap(), Plan::Pro);
        assert_eq!(serde_json::from_str::<Plan>("\"enterprise\"").unwrap(), Plan::Enterprise);
        assert_eq!(serde_json::from_str::<Plan>("\"free\"").unwrap(), Plan::Developer);
        assert_eq!(serde_json::from_str::<Plan>("\"business\"").unwrap(), Plan::Enterprise);
    }
}
