use super::*;

/// Fintech industry package — payment processors, banks, financial services
pub struct FintechPackage;

impl Default for FintechPackage {
    fn default() -> Self {
        Self::new()
    }
}

impl FintechPackage {
    pub fn new() -> Self {
        Self
    }
}

impl IndustryPackage for FintechPackage {
    fn name(&self) -> &str {
        "fintech"
    }

    fn description(&self) -> &str {
        "Webhook solutions for financial technology — payment processing, fraud detection, and transaction monitoring"
    }

    fn event_types(&self) -> Vec<&str> {
        vec![
            "payment.completed",
            "payment.pending",
            "payment.failed",
            "payment.refunded",
            "refund.created",
            "refund.completed",
            "refund.failed",
            "fraud.detected",
            "fraud.escalated",
            "transaction.anomaly",
            "chargeback.created",
            "chargeback.resolved",
            "payout.initiated",
            "payout.completed",
            "payout.failed",
            "kyc.verified",
            "kyc.rejected",
            "account.frozen",
        ]
    }

    fn compliance_requirements(&self) -> Vec<ComplianceRequirement> {
        vec![ComplianceRequirement {
            name: "PCI-DSS".to_string(),
            description: "Payment Card Industry Data Security Standard — masks card numbers, CVV, and account numbers in webhook payloads".to_string(),
            masking_rules: vec![
                DataMaskingRule {
                    field_path: "data.card_number".to_string(),
                    strategy: "partial".to_string(),
                    pattern: Some(r"^\d{13,19}$".to_string()),
                    replacement: None,
                },
                DataMaskingRule {
                    field_path: "data.card_cvv".to_string(),
                    strategy: "full".to_string(),
                    pattern: Some(r"^\d{3,4}$".to_string()),
                    replacement: Some("***".to_string()),
                },
                DataMaskingRule {
                    field_path: "data.account_number".to_string(),
                    strategy: "partial".to_string(),
                    pattern: None,
                    replacement: None,
                },
                DataMaskingRule {
                    field_path: "data.routing_number".to_string(),
                    strategy: "full".to_string(),
                    pattern: None,
                    replacement: Some("****".to_string()),
                },
                DataMaskingRule {
                    field_path: "data.ssn".to_string(),
                    strategy: "full".to_string(),
                    pattern: None,
                    replacement: Some("***-**-****".to_string()),
                },
            ],
        }]
    }

    fn agents(&self) -> Vec<IndustryAgent> {
        vec![
            IndustryAgent {
                name: "fraud_detector".to_string(),
                description: "AI-powered fraud detection — analyzes transaction patterns, velocity, and behavioral anomalies in real-time".to_string(),
                event_types: vec![
                    "payment.completed".to_string(),
                    "payment.pending".to_string(),
                    "fraud.detected".to_string(),
                ],
                agent_type: "anomaly_detection".to_string(),
                config: serde_json::json!({
                    "velocity_threshold_per_minute": 10,
                    "amount_spike_factor": 3.0,
                    "geo_anomaly_enabled": true,
                    "device_fingerprint_tracking": true,
                    "risk_score_threshold": 75,
                    "auto_block_above_score": 90
                }),
            },
            IndustryAgent {
                name: "transaction_anomaly_detector".to_string(),
                description: "Monitors transaction volumes and patterns for unusual activity — detects sudden spikes, unusual merchant categories, and off-hours transactions".to_string(),
                event_types: vec![
                    "payment.completed".to_string(),
                    "payment.failed".to_string(),
                    "transaction.anomaly".to_string(),
                ],
                agent_type: "monitoring".to_string(),
                config: serde_json::json!({
                    "baseline_window_hours": 168,
                    "anomaly_z_score_threshold": 2.5,
                    "check_merchant_category": true,
                    "check_time_of_day": true,
                    "alert_on_weekend_spike": true
                }),
            },
            IndustryAgent {
                name: "chargeback_predictor".to_string(),
                description: "Predicts chargeback likelihood based on transaction characteristics — recommends preventive actions".to_string(),
                event_types: vec![
                    "payment.completed".to_string(),
                    "chargeback.created".to_string(),
                ],
                agent_type: "prediction".to_string(),
                config: serde_json::json!({
                    "lookback_days": 90,
                    "risk_factors": ["high_ticket", "new_customer", "international", "digital_goods"],
                    "preventive_hold_threshold": 0.7
                }),
            },
        ]
    }

    fn webhook_chains(&self) -> Vec<WebhookChain> {
        vec![
            WebhookChain {
                trigger_event: "payment.completed".to_string(),
                downstream_events: vec![
                    "fraud.detected".to_string(),
                    "transaction.anomaly".to_string(),
                ],
                description:
                    "Every completed payment triggers fraud analysis and anomaly detection"
                        .to_string(),
            },
            WebhookChain {
                trigger_event: "fraud.detected".to_string(),
                downstream_events: vec!["account.frozen".to_string()],
                description: "High-confidence fraud detection triggers automatic account freeze"
                    .to_string(),
            },
        ]
    }

    fn rate_limits(&self) -> Vec<EventRateLimit> {
        vec![
            EventRateLimit {
                event_pattern: "payment.*".to_string(),
                requests_per_minute: 500,
            },
            EventRateLimit {
                event_pattern: "fraud.*".to_string(),
                requests_per_minute: 200,
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
    fn test_fintech_name() {
        let pkg = FintechPackage::new();
        assert_eq!(pkg.name(), "fintech");
    }

    #[test]
    fn test_fintech_description() {
        let pkg = FintechPackage::new();
        assert!(pkg.description().contains("financial technology"));
    }

    #[test]
    fn test_fintech_event_types() {
        let pkg = FintechPackage::new();
        let events = pkg.event_types();
        assert!(events.len() >= 18);
        assert!(events.contains(&"payment.completed"));
        assert!(events.contains(&"payment.pending"));
        assert!(events.contains(&"payment.failed"));
        assert!(events.contains(&"payment.refunded"));
        assert!(events.contains(&"refund.created"));
        assert!(events.contains(&"fraud.detected"));
        assert!(events.contains(&"fraud.escalated"));
        assert!(events.contains(&"transaction.anomaly"));
        assert!(events.contains(&"chargeback.created"));
        assert!(events.contains(&"chargeback.resolved"));
        assert!(events.contains(&"payout.initiated"));
        assert!(events.contains(&"payout.completed"));
        assert!(events.contains(&"kyc.verified"));
        assert!(events.contains(&"kyc.rejected"));
        assert!(events.contains(&"account.frozen"));
    }

    #[test]
    fn test_fintech_compliance() {
        let pkg = FintechPackage::new();
        let reqs = pkg.compliance_requirements();
        assert_eq!(reqs.len(), 1);
        assert_eq!(reqs[0].name, "PCI-DSS");
        assert_eq!(reqs[0].masking_rules.len(), 5);

        let rule_paths: Vec<&str> = reqs[0].masking_rules.iter().map(|r| r.field_path.as_str()).collect();
        assert!(rule_paths.contains(&"data.card_number"));
        assert!(rule_paths.contains(&"data.card_cvv"));
        assert!(rule_paths.contains(&"data.account_number"));
        assert!(rule_paths.contains(&"data.routing_number"));
        assert!(rule_paths.contains(&"data.ssn"));
    }

    #[test]
    fn test_fintech_compliance_card_cvv_replacement() {
        let pkg = FintechPackage::new();
        let reqs = pkg.compliance_requirements();
        let cvv_rule = reqs[0].masking_rules.iter().find(|r| r.field_path == "data.card_cvv").unwrap();
        assert_eq!(cvv_rule.strategy, "full");
        assert_eq!(cvv_rule.replacement, Some("***".to_string()));
        assert!(cvv_rule.pattern.is_some());
    }

    #[test]
    fn test_fintech_agents() {
        let pkg = FintechPackage::new();
        let agents = pkg.agents();
        assert_eq!(agents.len(), 3);

        let names: Vec<&str> = agents.iter().map(|a| a.name.as_str()).collect();
        assert!(names.contains(&"fraud_detector"));
        assert!(names.contains(&"transaction_anomaly_detector"));
        assert!(names.contains(&"chargeback_predictor"));
    }

    #[test]
    fn test_fintech_fraud_detector_agent() {
        let pkg = FintechPackage::new();
        let agent = pkg.agents().into_iter().find(|a| a.name == "fraud_detector").unwrap();
        assert_eq!(agent.agent_type, "anomaly_detection");
        assert!(agent.event_types.contains(&"payment.completed".to_string()));
        assert!(agent.event_types.contains(&"fraud.detected".to_string()));
        assert!(agent.config["velocity_threshold_per_minute"] == 10);
        assert!(agent.config["geo_anomaly_enabled"] == true);
    }

    #[test]
    fn test_fintech_webhook_chains() {
        let pkg = FintechPackage::new();
        let chains = pkg.webhook_chains();
        assert_eq!(chains.len(), 2);
        assert_eq!(chains[0].trigger_event, "payment.completed");
        assert!(chains[0].downstream_events.contains(&"fraud.detected".to_string()));
        assert_eq!(chains[1].trigger_event, "fraud.detected");
        assert!(chains[1].downstream_events.contains(&"account.frozen".to_string()));
    }

    #[test]
    fn test_fintech_rate_limits() {
        let pkg = FintechPackage::new();
        let limits = pkg.rate_limits();
        assert_eq!(limits.len(), 3);
        assert_eq!(limits[0].event_pattern, "payment.*");
        assert_eq!(limits[0].requests_per_minute, 500);
        assert_eq!(limits[1].event_pattern, "fraud.*");
        assert_eq!(limits[1].requests_per_minute, 200);
    }

    #[test]
    fn test_fintech_default() {
        let pkg = FintechPackage::default();
        assert_eq!(pkg.name(), "fintech");
    }

    #[test]
    fn test_fintech_config() {
        let pkg = FintechPackage::new();
        let config = pkg.config();
        assert_eq!(config.name, "fintech");
        assert!(!config.event_types.is_empty());
        assert!(!config.compliance.is_empty());
        assert!(!config.agents.is_empty());
        assert!(!config.webhook_chains.is_empty());
        assert!(!config.rate_limits.is_empty());
    }
}
