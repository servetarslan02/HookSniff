use super::*;

/// SaaS industry package — multi-tenant software platforms
pub struct SaaSvPackage;

impl Default for SaaSvPackage {
    fn default() -> Self {
        Self::new()
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_saas_name() {
        let pkg = SaaSvPackage::new();
        assert_eq!(pkg.name(), "saas");
    }

    #[test]
    fn test_saas_description() {
        let pkg = SaaSvPackage::new();
        assert!(pkg.description().contains("SaaS"));
        assert!(pkg.description().contains("multi-tenant"));
    }

    #[test]
    fn test_saas_event_types() {
        let pkg = SaaSvPackage::new();
        let events = pkg.event_types();
        assert!(events.len() >= 20);
        assert!(events.contains(&"user.created"));
        assert!(events.contains(&"user.deleted"));
        assert!(events.contains(&"user.suspended"));
        assert!(events.contains(&"subscription.created"));
        assert!(events.contains(&"subscription.cancelled"));
        assert!(events.contains(&"subscription.renewed"));
        assert!(events.contains(&"subscription.trial_ending"));
        assert!(events.contains(&"subscription.past_due"));
        assert!(events.contains(&"usage.threshold"));
        assert!(events.contains(&"usage.limit_reached"));
        assert!(events.contains(&"tenant.created"));
        assert!(events.contains(&"tenant.deleted"));
        assert!(events.contains(&"invoice.created"));
        assert!(events.contains(&"invoice.paid"));
        assert!(events.contains(&"invoice.overdue"));
    }

    #[test]
    fn test_saas_compliance() {
        let pkg = SaaSvPackage::new();
        let reqs = pkg.compliance_requirements();
        assert_eq!(reqs.len(), 2);
        assert_eq!(reqs[0].name, "SOC2-data-isolation");
        assert_eq!(reqs[1].name, "GDPR-right-to-erasure");
        assert_eq!(reqs[0].masking_rules.len(), 3);
        assert!(reqs[1].masking_rules.is_empty());
    }

    #[test]
    fn test_saas_soc2_masking_rules() {
        let pkg = SaaSvPackage::new();
        let reqs = pkg.compliance_requirements();
        let rules = &reqs[0].masking_rules;

        let rule_paths: Vec<&str> = rules.iter().map(|r| r.field_path.as_str()).collect();
        assert!(rule_paths.contains(&"data.user.email"));
        assert!(rule_paths.contains(&"data.user.phone"));
        assert!(rule_paths.contains(&"data.user.ip_address"));

        let ip_rule = rules
            .iter()
            .find(|r| r.field_path == "data.user.ip_address")
            .unwrap();
        assert_eq!(ip_rule.strategy, "full");
        assert_eq!(ip_rule.replacement, Some("[redacted]".to_string()));
    }

    #[test]
    fn test_saas_agents() {
        let pkg = SaaSvPackage::new();
        let agents = pkg.agents();
        assert_eq!(agents.len(), 3);

        let names: Vec<&str> = agents.iter().map(|a| a.name.as_str()).collect();
        assert!(names.contains(&"usage_anomaly_detector"));
        assert!(names.contains(&"churn_predictor"));
        assert!(names.contains(&"subscription_health_monitor"));
    }

    #[test]
    fn test_saas_usage_anomaly_detector() {
        let pkg = SaaSvPackage::new();
        let agent = pkg
            .agents()
            .into_iter()
            .find(|a| a.name == "usage_anomaly_detector")
            .unwrap();
        assert_eq!(agent.agent_type, "anomaly_detection");
        assert!(agent.event_types.contains(&"usage.threshold".to_string()));
        assert!(agent
            .event_types
            .contains(&"usage.limit_reached".to_string()));
        assert!(agent.config["auto_throttle_on_abuse"] == true);
        assert!(agent.config["spike_factor_threshold"] == 5.0);
    }

    #[test]
    fn test_saas_webhook_chains() {
        let pkg = SaaSvPackage::new();
        let chains = pkg.webhook_chains();
        assert_eq!(chains.len(), 3);
        assert_eq!(chains[0].trigger_event, "user.created");
        assert!(chains[0]
            .downstream_events
            .contains(&"subscription.created".to_string()));
        assert!(chains[0]
            .downstream_events
            .contains(&"tenant.created".to_string()));
        assert_eq!(chains[1].trigger_event, "subscription.trial_ending");
        assert_eq!(chains[2].trigger_event, "usage.limit_reached");
    }

    #[test]
    fn test_saas_rate_limits() {
        let pkg = SaaSvPackage::new();
        let limits = pkg.rate_limits();
        assert_eq!(limits.len(), 4);
        assert_eq!(limits[0].event_pattern, "user.*");
        assert_eq!(limits[0].requests_per_minute, 200);
        assert_eq!(limits[1].event_pattern, "subscription.*");
        assert_eq!(limits[1].requests_per_minute, 300);
        assert_eq!(limits[2].event_pattern, "usage.*");
        assert_eq!(limits[2].requests_per_minute, 500);
        assert_eq!(limits[3].event_pattern, "*");
        assert_eq!(limits[3].requests_per_minute, 100);
    }

    #[test]
    fn test_saas_default() {
        let pkg = SaaSvPackage;
        assert_eq!(pkg.name(), "saas");
    }

    #[test]
    fn test_saas_config() {
        let pkg = SaaSvPackage::new();
        let config = pkg.config();
        assert_eq!(config.name, "saas");
        assert!(!config.event_types.is_empty());
        assert_eq!(config.compliance.len(), 2);
        assert!(!config.agents.is_empty());
        assert!(!config.webhook_chains.is_empty());
        assert!(!config.rate_limits.is_empty());
    }
}
