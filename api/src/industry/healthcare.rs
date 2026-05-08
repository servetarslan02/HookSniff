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
