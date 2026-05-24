//! Template definitions — 10 built-in webhook templates.

use super::*;
pub(super) fn stripe_like_template() -> WebhookTemplate {
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
pub(super) fn shopify_like_template() -> WebhookTemplate {
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
pub(super) fn github_like_template() -> WebhookTemplate {
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
pub(super) fn twilio_like_template() -> WebhookTemplate {
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
pub(super) fn saas_platform_template() -> WebhookTemplate {
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
pub(super) fn healthcare_template() -> WebhookTemplate {
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
pub(super) fn slack_like_template() -> WebhookTemplate {
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

/// Discord webhook template
pub(super) fn discord_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "discord-interactions".to_string(),
        name: "Discord Interaction Webhooks".to_string(),
        description: "Community and bot interaction events from Discord — covers slash commands, button clicks, modal submissions, member joins, message reactions, and moderation events".to_string(),
        industry: "community".to_string(),
        event_types: vec![
            "INTERACTION_CREATE".to_string(),
            "MESSAGE_CREATE".to_string(),
            "MESSAGE_UPDATE".to_string(),
            "MESSAGE_DELETE".to_string(),
            "GUILD_MEMBER_ADD".to_string(),
            "GUILD_MEMBER_REMOVE".to_string(),
            "GUILD_MEMBER_UPDATE".to_string(),
            "MESSAGE_REACTION_ADD".to_string(),
            "MESSAGE_REACTION_REMOVE".to_string(),
            "CHANNEL_CREATE".to_string(),
            "CHANNEL_UPDATE".to_string(),
            "CHANNEL_DELETE".to_string(),
            "VOICE_STATE_UPDATE".to_string(),
            "THREAD_CREATE".to_string(),
            "THREAD_UPDATE".to_string(),
            "MODERATION_ACTION".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/discord/interactions".to_string(),
            signing_algorithm: "ed25519".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-Signature-Ed25519": "{{signature}}",
                "X-Signature-Timestamp": "{{timestamp}}"
            }),
            event_filter: vec!["INTERACTION_CREATE".to_string(), "MESSAGE_*".to_string(), "GUILD_MEMBER_*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 3600,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "toxicity_filter".to_string(),
                description: "Filters toxic messages and spam in community channels".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "engagement_tracker".to_string(),
                description: "Tracks member engagement, active users, and channel activity patterns".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "moderation_assistant".to_string(),
                description: "Automated moderation suggestions based on message patterns".to_string(),
                enabled_by_default: false,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 50000,
        tags: vec!["community".to_string(), "discord".to_string(), "bot".to_string(), "gaming".to_string(), "real-time".to_string()],
    }
}

/// Linear webhook template
pub(super) fn linear_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "linear-project-events".to_string(),
        name: "Linear Project Webhooks".to_string(),
        description: "Project management events from Linear — covers issue lifecycle, project updates, cycle progress, team changes, and comment activity for development teams".to_string(),
        industry: "devtools".to_string(),
        event_types: vec![
            "Issue.create".to_string(),
            "Issue.update".to_string(),
            "Issue.remove".to_string(),
            "IssueComment.create".to_string(),
            "Project.create".to_string(),
            "Project.update".to_string(),
            "ProjectArchive".to_string(),
            "Cycle.create".to_string(),
            "Cycle.update".to_string(),
            "Team.create".to_string(),
            "Team.update".to_string(),
            "Label.create".to_string(),
            "Label.update".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/linear/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "Linear-Signature": "{{signature}}"
            }),
            event_filter: vec!["Issue.*".to_string(), "Project.*".to_string(), "Cycle.*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 3600,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "sprint_velocity_tracker".to_string(),
                description: "Tracks issue completion rates and sprint velocity metrics".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "stale_issue_detector".to_string(),
                description: "Detects stale issues and blocked tasks, sends alerts".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 2000,
        tags: vec!["devtools".to_string(), "project-management".to_string(), "linear".to_string(), "issues".to_string()],
    }
}

/// Notion webhook template
pub(super) fn notion_template() -> WebhookTemplate {
    WebhookTemplate {
        id: "notion-workspace-events".to_string(),
        name: "Notion Workspace Webhooks".to_string(),
        description: "Workspace and database events from Notion — covers page creation, updates, comments, database entries, and team collaboration for knowledge management workflows".to_string(),
        industry: "productivity".to_string(),
        event_types: vec![
            "page.created".to_string(),
            "page.updated".to_string(),
            "page.deleted".to_string(),
            "database.created".to_string(),
            "database.updated".to_string(),
            "comment.created".to_string(),
            "comment.updated".to_string(),
            "block.created".to_string(),
            "block.updated".to_string(),
            "workspace.updated".to_string(),
        ],
        endpoint_config: EndpointTemplateConfig {
            url_placeholder: "https://your-app.com/api/notion/webhooks".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({
                "X-Notion-Signature": "{{signature}}",
                "X-Notion-Timestamp": "{{timestamp}}"
            }),
            event_filter: vec!["page.*".to_string(), "database.*".to_string(), "comment.*".to_string()],
        },
        retry_policy: RetryTemplatePolicy {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 3600,
        },
        agents: vec![
            TemplateAgent {
                agent_name: "content_sync_agent".to_string(),
                description: "Syncs Notion content changes to external systems and databases".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
            TemplateAgent {
                agent_name: "wiki_change_monitor".to_string(),
                description: "Monitors wiki/documentation changes and notifies relevant team members".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            },
        ],
        estimated_daily_volume: 5000,
        tags: vec!["productivity".to_string(), "notion".to_string(), "wiki".to_string(), "documentation".to_string()],
    }
}

