use super::*;

/// Fintech industry package — payment processors, banks, financial services
pub struct FintechPackage;

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
                description: "Every completed payment triggers fraud analysis and anomaly detection".to_string(),
            },
            WebhookChain {
                trigger_event: "fraud.detected".to_string(),
                downstream_events: vec![
                    "account.frozen".to_string(),
                ],
                description: "High-confidence fraud detection triggers automatic account freeze".to_string(),
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
