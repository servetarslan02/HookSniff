use super::*;

/// Returns all built-in webhook templates
pub fn all_templates() -> Vec<WebhookTemplate> {
    vec![
        stripe_like_template(),
        shopify_like_template(),
        github_like_template(),
        twilio_like_template(),
        saas_platform_template(),
        healthcare_template(),
        slack_like_template(),
    ]
}

/// Stripe-like payments webhook template
fn stripe_like_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "stripe-like-payments".to_string(),
        name: "Stripe-like Payments Webhooks".to_string(),
        description: "Standard payment event flow modeled after Stripe's webhook architecture — covers the full payment lifecycle from intent to settlement with dispute handling and fraud signals".to_string(),
        industry: "fintech".to_string(),
        event_types: vec![
            "payment_intent.created".to_string(),
            "payment_intent.succeeded".to_string(),
            "payment_intent.failed".to_string(),
            "charge.succeeded".to_string(),
            "charge.failed".to_string(),
            "charge.refunded".to_string(),
            "charge.disputed".to_string(),
            "customer.created".to_string(),
            "customer.updated".to_string(),
            "invoice.created".to_string(),
            "invoice.paid".to_string(),
            "invoice.payment_failed".to_string(),
            "subscription.created".to_string(),
            "subscription.updated".to_string(),
            "subscription.deleted".to_string(),
            "payout.created".to_string(),
            "payout.paid".to_string(),
            "payout.failed".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-server.com/webhooks/stripe".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-Webhook-Version": "2024-01-01"
            }),
            event_filter: vec!["payment_*".to_string(), "charge_*".to_string(), "invoice_*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 5,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 86400, // 24 hours max
        },
        agents: vec![
            TemplateAgent {
                agent_name: "fraud_detector".to_string(),
                description: "Real-time fraud detection on payment events".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "transaction_anomaly_detector".to_string(),
                description: "Monitors for unusual transaction patterns".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 10000,
        tags: vec!["payments".to_string(), "fintech".to_string(), "billing".to_string()],
    }
}

/// Shopify-like order webhook template
fn shopify_like_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "shopify-like-orders".to_string(),
        name: "Shopify-like Order Webhooks".to_string(),
        description: "Order lifecycle events modeled after Shopify's webhook system — covers the complete order journey from cart to delivery including inventory management and fulfillment tracking".to_string(),
        industry: "ecommerce".to_string(),
        event_types: vec![
            "orders/create".to_string(),
            "orders/updated".to_string(),
            "orders/cancelled".to_string(),
            "orders/fulfilled".to_string(),
            "orders/paid".to_string(),
            "orders/partially_fulfilled".to_string(),
            "order_transactions/create".to_string(),
            "checkouts/create".to_string(),
            "checkouts/update".to_string(),
            "customers/create".to_string(),
            "customers/update".to_string(),
            "products/create".to_string(),
            "products/update".to_string(),
            "inventory_levels/update".to_string(),
            "inventory_items/create".to_string(),
            "fulfillments/create".to_string(),
            "fulfillments/update".to_string(),
            "refunds/create".to_string(),
            "carts/update".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-store.com/api/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-Shopify-Topic": "{{event_type}}"
            }),
            event_filter: vec!["orders/*".to_string(), "customers/*".to_string(), "inventory/*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 4,
            backoff: "exponential".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 43200, // 12 hours
        },
        agents: vec![
            TemplateAgent {
                agent_name: "inventory_optimizer".to_string(),
                description: "Smart inventory management with auto-reorder points".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "abandoned_cart_recovery".to_string(),
                description: "Automated cart recovery sequences".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "churn_predictor".to_string(),
                description: "Customer retention insights".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 5000,
        tags: vec!["ecommerce".to_string(), "orders".to_string(), "inventory".to_string(), "fulfillment".to_string()],
    }
}

/// GitHub-like repository webhook template
fn github_like_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "github-like-repos".to_string(),
        name: "GitHub-like Repository Webhooks".to_string(),
        description: "Code event flow modeled after GitHub's webhook system — covers repository events, pull requests, issues, CI/CD status, and team collaboration signals".to_string(),
        industry: "devtools".to_string(),
        event_types: vec![
            "push".to_string(),
            "pull_request.opened".to_string(),
            "pull_request.closed".to_string(),
            "pull_request.merged".to_string(),
            "pull_request.review_requested".to_string(),
            "pull_request.reviewed".to_string(),
            "issues.opened".to_string(),
            "issues.closed".to_string(),
            "issues.labeled".to_string(),
            "issues.assigned".to_string(),
            "issue_comment.created".to_string(),
            "check_suite.completed".to_string(),
            "check_run.completed".to_string(),
            "workflow_run.completed".to_string(),
            "deployment.created".to_string(),
            "deployment.status".to_string(),
            "release.published".to_string(),
            "star.created".to_string(),
            "fork".to_string(),
            "member.added".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/github/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-GitHub-Event": "{{event_type}}",
                "X-GitHub-Delivery": "{{delivery_id}}"
            }),
            event_filter: vec!["push".to_string(), "pull_request.*".to_string(), "issues.*".to_string(), "workflow_run.*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "pr_review_tracker".to_string(),
                description: "Tracks PR review velocity and bottleneck detection".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "ci_health_monitor".to_string(),
                description: "Monitors CI/CD pipeline health and flaky test detection".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 2000,
        tags: vec!["devtools".to_string(), "git".to_string(), "ci-cd".to_string(), "code-review".to_string()],
    }
}

/// Twilio-like messaging webhook template
fn twilio_like_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "twilio-like-messaging".to_string(),
        name: "Twilio-like Messaging Webhooks".to_string(),
        description: "Message delivery events modeled after Twilio's webhook system — covers SMS/MMS/voice delivery status, incoming messages, and carrier feedback".to_string(),
        industry: "communications".to_string(),
        event_types: vec![
            "message.sent".to_string(),
            "message.delivered".to_string(),
            "message.undelivered".to_string(),
            "message.failed".to_string(),
            "message.received".to_string(),
            "message.read".to_string(),
            "call.initiated".to_string(),
            "call.ringing".to_string(),
            "call.answered".to_string(),
            "call.completed".to_string(),
            "call.failed".to_string(),
            "call.recording.available".to_string(),
            "number.purchased".to_string(),
            "number.configured".to_string(),
            "campaign.status_update".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/twilio/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/x-www-form-urlencoded".to_string(),
            custom_headers: serde_json::json!({
                "X-Twilio-Signature": "{{signature}}"
            }),
            event_filter: vec!["message.*".to_string(), "call.*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 5,
            backoff: "exponential".to_string(),
            initial_delay_secs: 15,
            max_delay_secs: 43200, // 12 hours
        },
        agents: vec![
            TemplateAgent {
                agent_name: "delivery_rate_monitor".to_string(),
                description: "Tracks message delivery rates and carrier feedback to optimize deliverability".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({
                    "delivery_rate_threshold": 0.95,
                    "carrier_feedback_tracking": true,
                    "opt_out_monitoring": true
                }),
            },
            TemplateAgent {
                agent_name: "cost_optimizer".to_string(),
                description: "Analyzes messaging costs per segment and route to find savings".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({
                    "cost_per_segment_tracking": true,
                    "route_optimization": true,
                    "volume_discount_alerts": true
                }),
            },
        ],
        estimated_daily_volume: 50000,
        tags: vec!["messaging".to_string(), "sms".to_string(), "voice".to_string(), "communications".to_string()],
    }
}

/// SaaS platform webhook template
fn saas_platform_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "saas-platform".to_string(),
        name: "SaaS Platform Webhooks".to_string(),
        description: "User lifecycle and subscription events for SaaS platforms — covers user management, subscription billing, usage tracking, and team collaboration events".to_string(),
        industry: "saas".to_string(),
        event_types: vec![
            "user.created".to_string(),
            "user.updated".to_string(),
            "user.deleted".to_string(),
            "user.suspended".to_string(),
            "user.reactivated".to_string(),
            "subscription.created".to_string(),
            "subscription.changed".to_string(),
            "subscription.cancelled".to_string(),
            "subscription.renewed".to_string(),
            "subscription.trial_ending".to_string(),
            "subscription.past_due".to_string(),
            "invoice.created".to_string(),
            "invoice.paid".to_string(),
            "invoice.payment_failed".to_string(),
            "usage.threshold".to_string(),
            "usage.limit_reached".to_string(),
            "team.member_added".to_string(),
            "team.member_removed".to_string(),
            "team.role_changed".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-Webhook-Version": "2024-01-01"
            }),
            event_filter: vec!["user.*".to_string(), "subscription.*".to_string(), "invoice.*".to_string(), "usage.*".to_string(), "team.*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 4,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 43200,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "churn_predictor".to_string(),
                description: "Predicts user churn based on usage patterns and subscription changes".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "usage_anomaly_detector".to_string(),
                description: "Monitors for unusual usage spikes or drops".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "trial_conversion_tracker".to_string(),
                description: "Tracks trial-to-paid conversion rates and sends reminders".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 5000,
        tags: vec!["saas".to_string(), "subscriptions".to_string(), "users".to_string(), "billing".to_string()],
    }
}

/// Healthcare webhook template
fn healthcare_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "healthcare-events".to_string(),
        name: "Healthcare Events Webhooks".to_string(),
        description: "Clinical event flow for healthcare systems — covers patient lifecycle, lab results, prescriptions, and appointment scheduling with HIPAA-aware patterns".to_string(),
        industry: "healthcare".to_string(),
        event_types: vec![
            "patient.admitted".to_string(),
            "patient.discharged".to_string(),
            "patient.transferred".to_string(),
            "patient.updated".to_string(),
            "appointment.scheduled".to_string(),
            "appointment.reminder".to_string(),
            "appointment.cancelled".to_string(),
            "appointment.completed".to_string(),
            "lab.result.ready".to_string(),
            "lab.result.critical".to_string(),
            "lab.result.abnormal".to_string(),
            "prescription.created".to_string(),
            "prescription.filled".to_string(),
            "prescription.denied".to_string(),
            "prescription.expired".to_string(),
            "vitals.alert".to_string(),
            "insurance.verified".to_string(),
            "insurance.claim_submitted".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-his.com/api/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-HIPAA-Audit": "true",
                "X-Data-Classification": "PHI"
            }),
            event_filter: vec!["patient.*".to_string(), "lab.*".to_string(), "prescription.*".to_string(), "appointment.*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 5,
            backoff: "exponential".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 86400,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "critical_alert_dispatcher".to_string(),
                description: "Immediately dispatches critical lab results and vitals alerts to on-call staff".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "appointment_no_show_predictor".to_string(),
                description: "Predicts no-show probability and triggers reminder sequences".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "bed_optimizer".to_string(),
                description: "Optimizes bed allocation based on admission/discharge patterns".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 20000,
        tags: vec!["healthcare".to_string(), "clinical".to_string(), "patients".to_string(), "hipaa".to_string()],
    }
}

/// Slack-like notifications webhook template
fn slack_like_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "slack-like-notifications".to_string(),
        name: "Slack-like Notification Webhooks".to_string(),
        description: "Real-time notification events modeled after Slack's webhook system — covers channel messages, reactions, mentions, commands, and app interactions".to_string(),
        industry: "communications".to_string(),
        event_types: vec![
            "message.created".to_string(),
            "message.updated".to_string(),
            "message.deleted".to_string(),
            "channel.created".to_string(),
            "channel.archived".to_string(),
            "channel.renamed".to_string(),
            "reaction.added".to_string(),
            "reaction.removed".to_string(),
            "app_mention".to_string(),
            "app_command".to_string(),
            "user.presence_changed".to_string(),
            "file.shared".to_string(),
            "workflow.triggered".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/slack/events".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-Slack-Signature": "{{signature}}",
                "X-Slack-Request-Timestamp": "{{timestamp}}"
            }),
            event_filter: vec!["message.*".to_string(), "channel.*".to_string(), "reaction.*".to_string(), "app_*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 3600,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "message_sentiment_analyzer".to_string(),
                description: "Analyzes message sentiment and flags toxic content".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "notification_aggregator".to_string(),
                description: "Batches and deduplicates notifications to reduce noise".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 100000,
        tags: vec!["notifications".to_string(), "messaging".to_string(), "slack".to_string(), "real-time".to_string()],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_templates_count() {
        let templates = all_templates();
        assert_eq!(templates.len(), 7);
    }

    #[test]
    fn test_all_templates_unique_ids() {
        let templates = all_templates();
        let ids: Vec<&str> = templates.iter().map(|t| t.id.as_str()).collect();
        let mut unique_ids = ids.clone();
        unique_ids.sort();
        unique_ids.dedup();
        assert_eq!(ids.len(), unique_ids.len(), "Template IDs should be unique");
    }

    #[test]
    fn test_stripe_template() {
        let templates = all_templates();
        let stripe = templates
            .iter()
            .find(|t| t.id == "stripe-like-payments")
            .unwrap();
        assert_eq!(stripe.name, "Stripe-like Payments Webhooks");
        assert_eq!(stripe.industry, "fintech");
        assert!(!stripe.event_types.is_empty());
        assert!(stripe
            .event_types
            .contains(&"payment_intent.created".to_string()));
        assert!(stripe.event_types.contains(&"charge.succeeded".to_string()));
        assert!(stripe.event_types.contains(&"invoice.paid".to_string()));
        assert!(stripe
            .event_types
            .contains(&"subscription.created".to_string()));
        assert_eq!(stripe.endpoint_config.signing_algorithm, "hmac-sha256");
        assert_eq!(stripe.retry_policy.max_attempts, 5);
        assert_eq!(stripe.retry_policy.backoff, "exponential");
        assert!(stripe.tags.contains(&"payments".to_string()));
        assert!(stripe.tags.contains(&"fintech".to_string()));
    }

    #[test]
    fn test_shopify_template() {
        let templates = all_templates();
        let shopify = templates
            .iter()
            .find(|t| t.id == "shopify-like-orders")
            .unwrap();
        assert_eq!(shopify.name, "Shopify-like Order Webhooks");
        assert_eq!(shopify.industry, "ecommerce");
        assert!(shopify.event_types.contains(&"orders/create".to_string()));
        assert!(shopify
            .event_types
            .contains(&"orders/fulfilled".to_string()));
        assert!(shopify
            .event_types
            .contains(&"inventory_levels/update".to_string()));
        assert_eq!(shopify.retry_policy.max_attempts, 4);
        assert!(shopify.tags.contains(&"ecommerce".to_string()));
        assert!(shopify.tags.contains(&"inventory".to_string()));
    }

    #[test]
    fn test_github_template() {
        let templates = all_templates();
        let github = templates
            .iter()
            .find(|t| t.id == "github-like-repos")
            .unwrap();
        assert_eq!(github.name, "GitHub-like Repository Webhooks");
        assert_eq!(github.industry, "devtools");
        assert!(github.event_types.contains(&"push".to_string()));
        assert!(github
            .event_types
            .contains(&"pull_request.opened".to_string()));
        assert!(github.event_types.contains(&"issues.opened".to_string()));
        assert!(github
            .event_types
            .contains(&"workflow_run.completed".to_string()));
        assert_eq!(github.retry_policy.max_attempts, 3);
        assert!(github.tags.contains(&"devtools".to_string()));
        assert!(github.tags.contains(&"ci-cd".to_string()));
    }

    #[test]
    fn test_twilio_template() {
        let templates = all_templates();
        let twilio = templates
            .iter()
            .find(|t| t.id == "twilio-like-messaging")
            .unwrap();
        assert_eq!(twilio.name, "Twilio-like Messaging Webhooks");
        assert_eq!(twilio.industry, "communications");
        assert!(twilio.event_types.contains(&"message.sent".to_string()));
        assert!(twilio
            .event_types
            .contains(&"message.delivered".to_string()));
        assert!(twilio.event_types.contains(&"call.initiated".to_string()));
        assert_eq!(
            twilio.endpoint_config.content_type,
            "application/x-www-form-urlencoded"
        );
        assert_eq!(twilio.retry_policy.max_attempts, 5);
        assert_eq!(twilio.estimated_daily_volume, 50000);
        assert!(twilio.tags.contains(&"messaging".to_string()));
        assert!(twilio.tags.contains(&"sms".to_string()));
    }

    #[test]
    fn test_templates_have_valid_retry_policies() {
        for template in all_templates() {
            assert!(
                template.retry_policy.max_attempts > 0,
                "{}: max_attempts should be > 0",
                template.id
            );
            assert!(
                template.retry_policy.initial_delay_secs > 0,
                "{}: initial_delay_secs should be > 0",
                template.id
            );
            assert!(
                template.retry_policy.max_delay_secs > 0,
                "{}: max_delay_secs should be > 0",
                template.id
            );
            assert!(
                !template.retry_policy.backoff.is_empty(),
                "{}: backoff should not be empty",
                template.id
            );
        }
    }

    #[test]
    fn test_templates_have_agents() {
        for template in all_templates() {
            assert!(
                !template.agents.is_empty(),
                "{}: should have at least one agent",
                template.id
            );
            for agent in &template.agents {
                assert!(!agent.agent_name.is_empty());
                assert!(!agent.description.is_empty());
            }
        }
    }

    #[test]
    fn test_templates_have_endpoint_configs() {
        for template in all_templates() {
            assert!(!template.endpoint_config.url_placeholder.is_empty());
            assert!(!template.endpoint_config.signing_algorithm.is_empty());
            assert!(!template.endpoint_config.content_type.is_empty());
            assert!(!template.endpoint_config.event_filter.is_empty());
        }
    }

    #[test]
    fn test_templates_have_non_zero_daily_volume() {
        for template in all_templates() {
            assert!(
                template.estimated_daily_volume > 0,
                "{}: daily volume should be > 0",
                template.id
            );
        }
    }

    #[test]
    fn test_templates_have_tags() {
        for template in all_templates() {
            assert!(
                !template.tags.is_empty(),
                "{}: should have at least one tag",
                template.id
            );
        }
    }

    #[test]
    fn test_templates_serialization_roundtrip() {
        for template in all_templates() {
            let json = serde_json::to_string(&template).unwrap();
            let deserialized: WebhookTemplate = serde_json::from_str(&json).unwrap();
            assert_eq!(deserialized.id, template.id);
            assert_eq!(deserialized.name, template.name);
            assert_eq!(deserialized.industry, template.industry);
            assert_eq!(deserialized.event_types.len(), template.event_types.len());
            assert_eq!(deserialized.agents.len(), template.agents.len());
        }
    }

    #[test]
    fn test_stripe_template_agents() {
        let templates = all_templates();
        let stripe = templates
            .iter()
            .find(|t| t.id == "stripe-like-payments")
            .unwrap();
        assert_eq!(stripe.agents.len(), 2);
        assert_eq!(stripe.agents[0].agent_name, "fraud_detector");
        assert!(stripe.agents[0].enabled_by_default);
        assert_eq!(stripe.agents[1].agent_name, "transaction_anomaly_detector");
        assert!(stripe.agents[1].enabled_by_default);
    }

    #[test]
    fn test_shopify_template_agents() {
        let templates = all_templates();
        let shopify = templates
            .iter()
            .find(|t| t.id == "shopify-like-orders")
            .unwrap();
        assert_eq!(shopify.agents.len(), 3);
        let inventory_agent = shopify
            .agents
            .iter()
            .find(|a| a.agent_name == "inventory_optimizer")
            .unwrap();
        assert!(inventory_agent.enabled_by_default);
        let cart_agent = shopify
            .agents
            .iter()
            .find(|a| a.agent_name == "abandoned_cart_recovery")
            .unwrap();
        assert!(!cart_agent.enabled_by_default);
    }

    #[test]
    fn test_twilio_content_type_is_form_encoded() {
        let templates = all_templates();
        let twilio = templates
            .iter()
            .find(|t| t.id == "twilio-like-messaging")
            .unwrap();
        assert_eq!(
            twilio.endpoint_config.content_type,
            "application/x-www-form-urlencoded"
        );
    }

    #[test]
    fn test_stripe_max_delay_is_24h() {
        let templates = all_templates();
        let stripe = templates
            .iter()
            .find(|t| t.id == "stripe-like-payments")
            .unwrap();
        assert_eq!(stripe.retry_policy.max_delay_secs, 86400);
    }
}
