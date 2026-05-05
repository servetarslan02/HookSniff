use super::*;

/// SaaS industry package — multi-tenant software platforms
pub struct SaaSvPackage;

impl SaaSvPackage {
    pub fn new() -> Self {
        Self
    }
}

impl IndustryPackage for SaaSvPackage {
    fn name(&self) -> &str {
        "saas"
    }

    fn description(&self) -> &str {
        "Webhook solutions for SaaS platforms — user lifecycle, subscription management, usage tracking, and multi-tenant isolation"
    }

    fn event_types(&self) -> Vec<&str> {
        vec![
            "user.created",
            "user.updated",
            "user.deleted",
            "user.suspended",
            "user.reactivated",
            "subscription.created",
            "subscription.changed",
            "subscription.cancelled",
            "subscription.renewed",
            "subscription.trial_ending",
            "subscription.past_due",
            "usage.threshold",
            "usage.limit_reached",
            "usage.reset",
            "tenant.created",
            "tenant.deleted",
            "tenant.settings_updated",
            "invoice.created",
            "invoice.paid",
            "invoice.overdue",
        ]
    }

    fn compliance_requirements(&self) -> Vec<ComplianceRequirement> {
        vec![
            ComplianceRequirement {
                name: "SOC2-data-isolation".to_string(),
                description: "Multi-tenant data isolation — ensures webhook payloads are scoped per-tenant and PII is masked".to_string(),
                masking_rules: vec![
                    DataMaskingRule {
                        field_path: "data.user.email".to_string(),
                        strategy: "partial".to_string(),
                        pattern: None,
                        replacement: None,
                    },
                    DataMaskingRule {
                        field_path: "data.user.phone".to_string(),
                        strategy: "partial".to_string(),
                        pattern: None,
                        replacement: None,
                    },
                    DataMaskingRule {
                        field_path: "data.user.ip_address".to_string(),
                        strategy: "full".to_string(),
                        pattern: None,
                        replacement: Some("[redacted]".to_string()),
                    },
                ],
            },
            ComplianceRequirement {
                name: "GDPR-right-to-erasure".to_string(),
                description: "Supports GDPR data erasure — when user.deleted fires, downstream systems must purge PII within 30 days".to_string(),
                masking_rules: vec![],
            },
        ]
    }

    fn agents(&self) -> Vec<IndustryAgent> {
        vec![
            IndustryAgent {
                name: "usage_anomaly_detector".to_string(),
                description: "Detects abnormal usage patterns — identifies API abuse, unusual resource consumption, and potential account compromise through usage spike analysis".to_string(),
                event_types: vec![
                    "usage.threshold".to_string(),
                    "usage.limit_reached".to_string(),
                ],
                agent_type: "anomaly_detection".to_string(),
                config: serde_json::json!({
                    "baseline_window_days": 30,
                    "spike_factor_threshold": 5.0,
                    "check_api_call_patterns": true,
                    "check_resource_consumption": true,
                    "auto_throttle_on_abuse": true,
                    "alert_tenant_admin": true
                }),
            },
            IndustryAgent {
                name: "churn_predictor".to_string(),
                description: "Predicts subscription churn — analyzes login frequency, feature adoption, support tickets, and billing issues to identify at-risk accounts".to_string(),
                event_types: vec![
                    "subscription.trial_ending".to_string(),
                    "subscription.past_due".to_string(),
                    "user.updated".to_string(),
                ],
                agent_type: "prediction".to_string(),
                config: serde_json::json!({
                    "signals": [
                        {"name": "login_frequency", "weight": 0.25},
                        {"name": "feature_adoption", "weight": 0.20},
                        {"name": "support_tickets", "weight": 0.15},
                        {"name": "billing_issues", "weight": 0.20},
                        {"name": "usage_trend", "weight": 0.20}
                    ],
                    "risk_threshold": 0.65,
                    "retention_offer_enabled": true
                }),
            },
            IndustryAgent {
                name: "subscription_health_monitor".to_string(),
                description: "Monitors subscription health across all tenants — tracks renewal rates, downgrades, and upgrade patterns for revenue optimization".to_string(),
                event_types: vec![
                    "subscription.created".to_string(),
                    "subscription.changed".to_string(),
                    "subscription.cancelled".to_string(),
                    "subscription.renewed".to_string(),
                ],
                agent_type: "monitoring".to_string(),
                config: serde_json::json!({
                    "track_mrr": true,
                    "track_net_revenue_retention": true,
                    "alert_on_downgrade_spike": true,
                    "cohort_analysis_enabled": true,
                    "reporting_interval_days": 7
                }),
            },
        ]
    }

    fn webhook_chains(&self) -> Vec<WebhookChain> {
        vec![
            WebhookChain {
                trigger_event: "user.created".to_string(),
                downstream_events: vec![
                    "subscription.created".to_string(),
                    "tenant.created".to_string(),
                ],
                description: "New user registration triggers tenant provisioning and initial subscription setup".to_string(),
            },
            WebhookChain {
                trigger_event: "subscription.trial_ending".to_string(),
                downstream_events: vec![
                    "subscription.changed".to_string(),
                    "invoice.created".to_string(),
                ],
                description: "Trial expiry triggers conversion flow and first invoice generation".to_string(),
            },
            WebhookChain {
                trigger_event: "usage.limit_reached".to_string(),
                downstream_events: vec![
                    "subscription.changed".to_string(),
                ],
                description: "Usage limit hit triggers upgrade recommendation flow".to_string(),
            },
        ]
    }

    fn rate_limits(&self) -> Vec<EventRateLimit> {
        vec![
            EventRateLimit {
                event_pattern: "user.*".to_string(),
                requests_per_minute: 200,
            },
            EventRateLimit {
                event_pattern: "subscription.*".to_string(),
                requests_per_minute: 300,
            },
            EventRateLimit {
                event_pattern: "usage.*".to_string(),
                requests_per_minute: 500,
            },
            EventRateLimit {
                event_pattern: "*".to_string(),
                requests_per_minute: 100,
            },
        ]
    }
}
