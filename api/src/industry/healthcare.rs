use super::*;

/// Healthcare industry package — hospitals, labs, pharmacies, EHR systems
pub struct HealthcarePackage;

impl Default for HealthcarePackage {
    fn default() -> Self {
        Self::new()
    }
}

impl HealthcarePackage {
    pub fn new() -> Self {
        Self
    }
}

impl IndustryPackage for HealthcarePackage {
    fn name(&self) -> &str {
        "healthcare"
    }

    fn description(&self) -> &str {
        "Webhook solutions for healthcare — patient events, lab results, prescriptions, and clinical workflows with HIPAA compliance"
    }

    fn event_types(&self) -> Vec<&str> {
        vec![
            "patient.admitted",
            "patient.discharged",
            "patient.transferred",
            "patient.updated",
            "lab.result",
            "lab.result.abnormal",
            "lab.result.critical",
            "prescription.created",
            "prescription.filled",
            "prescription.denied",
            "prescription.expired",
            "appointment.scheduled",
            "appointment.reminder",
            "appointment.cancelled",
            "appointment.completed",
            "insurance.claim_submitted",
            "insurance.claim_approved",
            "insurance.claim_denied",
            "referral.created",
            "referral.completed",
        ]
    }

    fn compliance_requirements(&self) -> Vec<ComplianceRequirement> {
        vec![
            ComplianceRequirement {
                name: "HIPAA".to_string(),
                description: "Health Insurance Portability and Accountability Act — masks all Protected Health Information (PHI) in webhook payloads".to_string(),
                masking_rules: vec![
                    DataMaskingRule {
                        field_path: "data.patient.ssn".to_string(),
                        strategy: "full".to_string(),
                        pattern: None,
                        replacement: Some("***-**-****".to_string()),
                    },
                    DataMaskingRule {
                        field_path: "data.patient.date_of_birth".to_string(),
                        strategy: "full".to_string(),
                        pattern: None,
                        replacement: Some("[DOB-REDACTED]".to_string()),
                    },
                    DataMaskingRule {
                        field_path: "data.patient.mrn".to_string(),
                        strategy: "partial".to_string(),
                        pattern: None,
                        replacement: None,
                    },
                    DataMaskingRule {
                        field_path: "data.patient.phone".to_string(),
                        strategy: "full".to_string(),
                        pattern: None,
                        replacement: Some("***-***-****".to_string()),
                    },
                    DataMaskingRule {
                        field_path: "data.patient.email".to_string(),
                        strategy: "partial".to_string(),
                        pattern: None,
                        replacement: None,
                    },
                    DataMaskingRule {
                        field_path: "data.patient.address".to_string(),
                        strategy: "full".to_string(),
                        pattern: None,
                        replacement: Some("[ADDRESS-REDACTED]".to_string()),
                    },
                    DataMaskingRule {
                        field_path: "data.prescription.ndc".to_string(),
                        strategy: "full".to_string(),
                        pattern: None,
                        replacement: Some("[NDC-REDACTED]".to_string()),
                    },
                ],
            },
            ComplianceRequirement {
                name: "HIPAA-audit-trail".to_string(),
                description: "Every webhook delivery must be logged with full context — who accessed what data, when, and from where".to_string(),
                masking_rules: vec![],
            },
        ]
    }

    fn agents(&self) -> Vec<IndustryAgent> {
        vec![
            IndustryAgent {
                name: "critical_result_notifier".to_string(),
                description: "Priority notification for critical lab results — ensures life-threatening values reach attending physicians within minutes with escalation chains".to_string(),
                event_types: vec![
                    "lab.result.critical".to_string(),
                    "lab.result.abnormal".to_string(),
                ],
                agent_type: "notification".to_string(),
                config: serde_json::json!({
                    "escalation_chain": [
                        {"role": "attending_physician", "timeout_minutes": 5},
                        {"role": "department_head", "timeout_minutes": 10},
                        {"role": "on_call_supervisor", "timeout_minutes": 15}
                    ],
                    "notification_channels": ["pager", "sms", "email"],
                    "requires_acknowledgment": true,
                    "audit_all_notifications": true
                }),
            },
            IndustryAgent {
                name: "prescription_monitor".to_string(),
                description: "Monitors prescription workflows — tracks fill rates, detects potential drug interactions, and flags denied prescriptions for pharmacist review".to_string(),
                event_types: vec![
                    "prescription.created".to_string(),
                    "prescription.filled".to_string(),
                    "prescription.denied".to_string(),
                    "prescription.expired".to_string(),
                ],
                agent_type: "monitoring".to_string(),
                config: serde_json::json!({
                    "drug_interaction_check": true,
                    "fill_rate_tracking": true,
                    "denial_analysis": true,
                    "expiration_reminder_days": 30,
                    "controlled_substance_alerts": true
                }),
            },
            IndustryAgent {
                name: "patient_flow_optimizer".to_string(),
                description: "Optimizes patient throughput — analyzes admission/discharge patterns, predicts bed availability, and identifies bottlenecks in clinical workflows".to_string(),
                event_types: vec![
                    "patient.admitted".to_string(),
                    "patient.discharged".to_string(),
                    "patient.transferred".to_string(),
                ],
                agent_type: "optimization".to_string(),
                config: serde_json::json!({
                    "bed_management_enabled": true,
                    "predict_discharge_time": true,
                    "staff_allocation_hints": true,
                    "bottleneck_detection": true,
                    "reporting_interval_hours": 4
                }),
            },
        ]
    }

    fn webhook_chains(&self) -> Vec<WebhookChain> {
        vec![
            WebhookChain {
                trigger_event: "lab.result.critical".to_string(),
                downstream_events: vec![
                    "patient.updated".to_string(),
                ],
                description: "Critical lab result triggers immediate physician notification and patient record update".to_string(),
            },
            WebhookChain {
                trigger_event: "prescription.created".to_string(),
                downstream_events: vec![
                    "prescription.filled".to_string(),
                    "prescription.denied".to_string(),
                ],
                description: "New prescription enters the fill/deny workflow with pharmacy and insurance checks".to_string(),
            },
            WebhookChain {
                trigger_event: "patient.discharged".to_string(),
                downstream_events: vec![
                    "prescription.created".to_string(),
                    "appointment.scheduled".to_string(),
                ],
                description: "Discharge triggers follow-up prescriptions and scheduling of follow-up appointments".to_string(),
            },
        ]
    }

    fn rate_limits(&self) -> Vec<EventRateLimit> {
        vec![
            EventRateLimit {
                event_pattern: "lab.result.*".to_string(),
                requests_per_minute: 400,
            },
            EventRateLimit {
                event_pattern: "patient.*".to_string(),
                requests_per_minute: 200,
            },
            EventRateLimit {
                event_pattern: "prescription.*".to_string(),
                requests_per_minute: 150,
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
    fn test_healthcare_name() {
        let pkg = HealthcarePackage::new();
        assert_eq!(pkg.name(), "healthcare");
    }

    #[test]
    fn test_healthcare_description() {
        let pkg = HealthcarePackage::new();
        assert!(pkg.description().contains("healthcare"));
        assert!(pkg.description().contains("HIPAA"));
    }

    #[test]
    fn test_healthcare_event_types() {
        let pkg = HealthcarePackage::new();
        let events = pkg.event_types();
        assert!(events.len() >= 20);
        assert!(events.contains(&"patient.admitted"));
        assert!(events.contains(&"patient.discharged"));
        assert!(events.contains(&"patient.transferred"));
        assert!(events.contains(&"lab.result"));
        assert!(events.contains(&"lab.result.critical"));
        assert!(events.contains(&"prescription.created"));
        assert!(events.contains(&"prescription.filled"));
        assert!(events.contains(&"prescription.denied"));
        assert!(events.contains(&"appointment.scheduled"));
        assert!(events.contains(&"insurance.claim_submitted"));
        assert!(events.contains(&"referral.created"));
    }

    #[test]
    fn test_healthcare_compliance() {
        let pkg = HealthcarePackage::new();
        let reqs = pkg.compliance_requirements();
        assert_eq!(reqs.len(), 2);
        assert_eq!(reqs[0].name, "HIPAA");
        assert_eq!(reqs[1].name, "HIPAA-audit-trail");
        assert!(reqs[0].masking_rules.len() >= 7);
        assert!(reqs[1].masking_rules.is_empty()); // audit trail has no masking rules
    }

    #[test]
    fn test_healthcare_hipaa_masking_rules() {
        let pkg = HealthcarePackage::new();
        let reqs = pkg.compliance_requirements();
        let rules = &reqs[0].masking_rules;

        let rule_paths: Vec<&str> = rules.iter().map(|r| r.field_path.as_str()).collect();
        assert!(rule_paths.contains(&"data.patient.ssn"));
        assert!(rule_paths.contains(&"data.patient.date_of_birth"));
        assert!(rule_paths.contains(&"data.patient.mrn"));
        assert!(rule_paths.contains(&"data.patient.phone"));
        assert!(rule_paths.contains(&"data.patient.email"));
        assert!(rule_paths.contains(&"data.patient.address"));
        assert!(rule_paths.contains(&"data.prescription.ndc"));
    }

    #[test]
    fn test_healthcare_agents() {
        let pkg = HealthcarePackage::new();
        let agents = pkg.agents();
        assert_eq!(agents.len(), 3);

        let names: Vec<&str> = agents.iter().map(|a| a.name.as_str()).collect();
        assert!(names.contains(&"critical_result_notifier"));
        assert!(names.contains(&"prescription_monitor"));
        assert!(names.contains(&"patient_flow_optimizer"));
    }

    #[test]
    fn test_healthcare_critical_result_notifier() {
        let pkg = HealthcarePackage::new();
        let agent = pkg
            .agents()
            .into_iter()
            .find(|a| a.name == "critical_result_notifier")
            .unwrap();
        assert_eq!(agent.agent_type, "notification");
        assert!(agent
            .event_types
            .contains(&"lab.result.critical".to_string()));
        assert!(agent
            .event_types
            .contains(&"lab.result.abnormal".to_string()));
        assert!(agent.config["requires_acknowledgment"] == true);
        assert!(agent.config["audit_all_notifications"] == true);
        let chain = agent.config["escalation_chain"].as_array().unwrap();
        assert_eq!(chain.len(), 3);
    }

    #[test]
    fn test_healthcare_webhook_chains() {
        let pkg = HealthcarePackage::new();
        let chains = pkg.webhook_chains();
        assert_eq!(chains.len(), 3);
        assert_eq!(chains[0].trigger_event, "lab.result.critical");
        assert_eq!(chains[1].trigger_event, "prescription.created");
        assert_eq!(chains[2].trigger_event, "patient.discharged");
        assert!(chains[2]
            .downstream_events
            .contains(&"prescription.created".to_string()));
        assert!(chains[2]
            .downstream_events
            .contains(&"appointment.scheduled".to_string()));
    }

    #[test]
    fn test_healthcare_rate_limits() {
        let pkg = HealthcarePackage::new();
        let limits = pkg.rate_limits();
        assert_eq!(limits.len(), 4);
        assert_eq!(limits[0].event_pattern, "lab.result.*");
        assert_eq!(limits[0].requests_per_minute, 400);
        assert_eq!(limits[1].event_pattern, "patient.*");
        assert_eq!(limits[1].requests_per_minute, 200);
        assert_eq!(limits[2].event_pattern, "prescription.*");
        assert_eq!(limits[2].requests_per_minute, 150);
    }

    #[test]
    fn test_healthcare_default() {
        let pkg = HealthcarePackage;
        assert_eq!(pkg.name(), "healthcare");
    }

    #[test]
    fn test_healthcare_config() {
        let pkg = HealthcarePackage::new();
        let config = pkg.config();
        assert_eq!(config.name, "healthcare");
        assert!(!config.event_types.is_empty());
        assert_eq!(config.compliance.len(), 2);
        assert!(!config.agents.is_empty());
        assert!(!config.webhook_chains.is_empty());
        assert!(!config.rate_limits.is_empty());
    }
}
