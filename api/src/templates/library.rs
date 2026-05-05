use super::*;

/// Returns all built-in webhook templates
pub fn all_templates() -> Vec<WebhookTemplate> {
    vec![
        stripe_like_template(),
        shopify_like_template(),
        github_like_template(),
        twilio_like_template(),
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
