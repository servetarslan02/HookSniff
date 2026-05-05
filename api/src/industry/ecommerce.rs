use super::*;

/// E-commerce industry package — online stores, marketplaces, fulfillment
pub struct EcommercePackage;

impl EcommercePackage {
    pub fn new() -> Self {
        Self
    }
}

impl IndustryPackage for EcommercePackage {
    fn name(&self) -> &str {
        "ecommerce"
    }

    fn description(&self) -> &str {
        "Webhook solutions for e-commerce — order lifecycle, inventory management, shipping, and customer engagement"
    }

    fn event_types(&self) -> Vec<&str> {
        vec![
            "order.created",
            "order.paid",
            "order.confirmed",
            "order.shipped",
            "order.delivered",
            "order.cancelled",
            "order.returned",
            "order.refunded",
            "inventory.low",
            "inventory.out_of_stock",
            "inventory.restocked",
            "cart.created",
            "cart.updated",
            "cart.abandoned",
            "cart.recovered",
            "customer.registered",
            "customer.updated",
            "review.submitted",
            "product.created",
            "product.updated",
        ]
    }

    fn compliance_requirements(&self) -> Vec<ComplianceRequirement> {
        vec![ComplianceRequirement {
            name: "PCI-DSS-lite".to_string(),
            description: "Basic payment data protection for checkout flows — masks card data in order webhooks".to_string(),
            masking_rules: vec![
                DataMaskingRule {
                    field_path: "data.payment.card_number".to_string(),
                    strategy: "partial".to_string(),
                    pattern: None,
                    replacement: None,
                },
                DataMaskingRule {
                    field_path: "data.payment.card_cvv".to_string(),
                    strategy: "full".to_string(),
                    pattern: None,
                    replacement: Some("***".to_string()),
                },
            ],
        }]
    }

    fn agents(&self) -> Vec<IndustryAgent> {
        vec![
            IndustryAgent {
                name: "inventory_optimizer".to_string(),
                description: "AI-powered inventory management — predicts stock needs, triggers reorder points, and optimizes warehouse allocation based on sales velocity".to_string(),
                event_types: vec![
                    "order.created".to_string(),
                    "order.cancelled".to_string(),
                    "inventory.low".to_string(),
                    "inventory.restocked".to_string(),
                ],
                agent_type: "optimization".to_string(),
                config: serde_json::json!({
                    "lookback_days": 30,
                    "seasonal_adjustment": true,
                    "safety_stock_days": 7,
                    "auto_reorder_enabled": false,
                    "low_stock_threshold_percent": 15
                }),
            },
            IndustryAgent {
                name: "churn_predictor".to_string(),
                description: "Predicts customer churn risk — analyzes purchase frequency, recency, and engagement signals to identify at-risk customers before they leave".to_string(),
                event_types: vec![
                    "order.created".to_string(),
                    "cart.abandoned".to_string(),
                    "customer.registered".to_string(),
                ],
                agent_type: "prediction".to_string(),
                config: serde_json::json!({
                    "recency_weight": 0.4,
                    "frequency_weight": 0.35,
                    "monetary_weight": 0.25,
                    "churn_risk_threshold": 0.6,
                    "engagement_decay_days": 60
                }),
            },
            IndustryAgent {
                name: "abandoned_cart_recovery".to_string(),
                description: "Automated abandoned cart recovery — triggers personalized follow-up sequences based on cart value, customer history, and abandonment timing".to_string(),
                event_types: vec![
                    "cart.abandoned".to_string(),
                    "cart.recovered".to_string(),
                ],
                agent_type: "automation".to_string(),
                config: serde_json::json!({
                    "abandonment_threshold_minutes": 30,
                    "recovery_sequence": [
                        {"delay_hours": 1, "channel": "email", "template": "gentle_reminder"},
                        {"delay_hours": 24, "channel": "email", "template": "incentive_offer"},
                        {"delay_hours": 72, "channel": "email", "template": "final_reminder"}
                    ],
                    "min_cart_value_for_recovery": 25.00,
                    "max_recovery_attempts": 3
                }),
            },
        ]
    }

    fn webhook_chains(&self) -> Vec<WebhookChain> {
        vec![
            WebhookChain {
                trigger_event: "order.created".to_string(),
                downstream_events: vec![
                    "inventory.low".to_string(),
                    "order.shipped".to_string(),
                ],
                description: "New order triggers inventory check and initiates the shipping notification chain".to_string(),
            },
            WebhookChain {
                trigger_event: "cart.abandoned".to_string(),
                downstream_events: vec![
                    "cart.recovered".to_string(),
                ],
                description: "Abandoned cart triggers recovery sequence with escalating follow-ups".to_string(),
            },
            WebhookChain {
                trigger_event: "order.delivered".to_string(),
                downstream_events: vec![
                    "review.submitted".to_string(),
                ],
                description: "Delivery completion triggers review request workflow".to_string(),
            },
        ]
    }

    fn rate_limits(&self) -> Vec<EventRateLimit> {
        vec![
            EventRateLimit {
                event_pattern: "order.*".to_string(),
                requests_per_minute: 300,
            },
            EventRateLimit {
                event_pattern: "cart.*".to_string(),
                requests_per_minute: 200,
            },
            EventRateLimit {
                event_pattern: "inventory.*".to_string(),
                requests_per_minute: 150,
            },
            EventRateLimit {
                event_pattern: "*".to_string(),
                requests_per_minute: 100,
            },
        ]
    }
}
