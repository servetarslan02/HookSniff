use super::*;

/// E-commerce industry package — online stores, marketplaces, fulfillment
pub struct EcommercePackage;

impl Default for EcommercePackage {
    fn default() -> Self {
        Self::new()
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ecommerce_name() {
        let pkg = EcommercePackage::new();
        assert_eq!(pkg.name(), "ecommerce");
    }

    #[test]
    fn test_ecommerce_description() {
        let pkg = EcommercePackage::new();
        assert!(pkg.description().contains("e-commerce"));
    }

    #[test]
    fn test_ecommerce_event_types() {
        let pkg = EcommercePackage::new();
        let events = pkg.event_types();
        assert!(events.len() >= 20);
        assert!(events.contains(&"order.created"));
        assert!(events.contains(&"order.paid"));
        assert!(events.contains(&"order.shipped"));
        assert!(events.contains(&"order.delivered"));
        assert!(events.contains(&"order.cancelled"));
        assert!(events.contains(&"order.returned"));
        assert!(events.contains(&"order.refunded"));
        assert!(events.contains(&"inventory.low"));
        assert!(events.contains(&"inventory.out_of_stock"));
        assert!(events.contains(&"inventory.restocked"));
        assert!(events.contains(&"cart.created"));
        assert!(events.contains(&"cart.abandoned"));
        assert!(events.contains(&"customer.registered"));
        assert!(events.contains(&"review.submitted"));
        assert!(events.contains(&"product.created"));
    }

    #[test]
    fn test_ecommerce_compliance() {
        let pkg = EcommercePackage::new();
        let reqs = pkg.compliance_requirements();
        assert_eq!(reqs.len(), 1);
        assert_eq!(reqs[0].name, "PCI-DSS-lite");
        assert_eq!(reqs[0].masking_rules.len(), 2);
        assert_eq!(reqs[0].masking_rules[0].field_path, "data.payment.card_number");
        assert_eq!(reqs[0].masking_rules[0].strategy, "partial");
        assert_eq!(reqs[0].masking_rules[1].field_path, "data.payment.card_cvv");
        assert_eq!(reqs[0].masking_rules[1].strategy, "full");
    }

    #[test]
    fn test_ecommerce_agents() {
        let pkg = EcommercePackage::new();
        let agents = pkg.agents();
        assert_eq!(agents.len(), 3);

        let names: Vec<&str> = agents.iter().map(|a| a.name.as_str()).collect();
        assert!(names.contains(&"inventory_optimizer"));
        assert!(names.contains(&"churn_predictor"));
        assert!(names.contains(&"abandoned_cart_recovery"));
    }

    #[test]
    fn test_ecommerce_inventory_optimizer_agent() {
        let pkg = EcommercePackage::new();
        let agent = pkg.agents().into_iter().find(|a| a.name == "inventory_optimizer").unwrap();
        assert_eq!(agent.agent_type, "optimization");
        assert!(agent.event_types.contains(&"order.created".to_string()));
        assert!(agent.event_types.contains(&"inventory.low".to_string()));
        assert!(agent.config["lookback_days"] == 30);
        assert!(agent.config["seasonal_adjustment"] == true);
    }

    #[test]
    fn test_ecommerce_webhook_chains() {
        let pkg = EcommercePackage::new();
        let chains = pkg.webhook_chains();
        assert_eq!(chains.len(), 3);
        assert_eq!(chains[0].trigger_event, "order.created");
        assert!(chains[0].downstream_events.contains(&"inventory.low".to_string()));
        assert_eq!(chains[1].trigger_event, "cart.abandoned");
        assert_eq!(chains[2].trigger_event, "order.delivered");
    }

    #[test]
    fn test_ecommerce_rate_limits() {
        let pkg = EcommercePackage::new();
        let limits = pkg.rate_limits();
        assert_eq!(limits.len(), 4);
        assert_eq!(limits[0].event_pattern, "order.*");
        assert_eq!(limits[0].requests_per_minute, 300);
        assert_eq!(limits[3].event_pattern, "*");
        assert_eq!(limits[3].requests_per_minute, 100);
    }

    #[test]
    fn test_ecommerce_default() {
        let pkg = EcommercePackage::default();
        assert_eq!(pkg.name(), "ecommerce");
    }

    #[test]
    fn test_ecommerce_config() {
        let pkg = EcommercePackage::new();
        let config = pkg.config();
        assert_eq!(config.name, "ecommerce");
        assert!(!config.event_types.is_empty());
        assert!(!config.agents.is_empty());
        assert!(!config.webhook_chains.is_empty());
        assert!(!config.rate_limits.is_empty());
    }
}
