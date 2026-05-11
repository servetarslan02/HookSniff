pub mod library;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Pre-built webhook configuration template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub industry: String,
    /// Event types this template subscribes to
    pub event_types: Vec<String>,
    /// Default endpoint configuration
    pub endpoint_config: EndpointTemplateConfig,
    /// Default retry policy
    pub retry_policy: RetryTemplatePolicy,
    /// AI agents to enable with this template
    pub agents: Vec<TemplateAgent>,
    /// Estimated webhook volume per day
    pub estimated_daily_volume: u32,
    /// Tags for searchability
    pub tags: Vec<String>,
}

/// Endpoint configuration within a template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EndpointTemplateConfig {
    /// Default URL pattern (user fills in their URL)
    pub url_placeholder: String,
    /// Suggested signing algorithm
    pub signing_algorithm: String,
    /// Recommended content type
    pub content_type: String,
    /// Custom headers to include
    pub custom_headers: serde_json::Value,
    /// Event filter patterns
    pub event_filter: Vec<String>,
}

/// Retry policy preset within a template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryTemplatePolicy {
    pub max_attempts: i32,
    pub backoff: String,
    pub initial_delay_secs: i32,
    pub max_delay_secs: i32,
}

/// AI agent reference within a template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateAgent {
    pub agent_name: String,
    pub description: String,
    pub enabled_by_default: bool,
    pub config: serde_json::Value,
}

/// Response when listing templates
#[derive(Debug, Serialize)]
pub struct TemplateListResponse {
    pub templates: Vec<WebhookTemplate>,
    pub total: usize,
}

/// Request to apply a template
#[derive(Debug, Deserialize)]
pub struct ApplyTemplateRequest {
    /// Customer's actual endpoint URL
    pub endpoint_url: String,
    /// Optional signing secret override
    pub signing_secret: Option<String>,
    /// Optional custom headers
    pub custom_headers: Option<serde_json::Value>,
    /// Which agents to enable (defaults to template defaults)
    pub enabled_agents: Option<Vec<String>>,
}

/// Response after applying a template
#[derive(Debug, Serialize)]
pub struct ApplyTemplateResponse {
    pub template_id: String,
    pub endpoint_id: Uuid,
    pub event_subscriptions: Vec<String>,
    pub agents_enabled: Vec<String>,
    pub message: String,
}

impl WebhookTemplate {
    /// Get all templates from the built-in library
    pub fn all() -> Vec<WebhookTemplate> {
        library::all_templates()
    }

    /// Find a template by ID
    pub fn find_by_id(id: &str) -> Option<WebhookTemplate> {
        library::all_templates().into_iter().find(|t| t.id == id)
    }

    /// Search templates by industry
    pub fn by_industry(industry: &str) -> Vec<WebhookTemplate> {
        library::all_templates()
            .into_iter()
            .filter(|t| t.industry == industry)
            .collect()
    }

    /// Search templates by tag
    pub fn by_tag(tag: &str) -> Vec<WebhookTemplate> {
        library::all_templates()
            .into_iter()
            .filter(|t| t.tags.iter().any(|t| t == tag))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_webhook_template_serialization_roundtrip() {
        let template = WebhookTemplate {
            id: "test-template".to_string(),
            name: "Test Template".to_string(),
            description: "A test template".to_string(),
            industry: "test".to_string(),
            event_types: vec!["test.event".to_string()],
            endpoint_config: EndpointTemplateConfig {
                url_placeholder: "https://example.com".to_string(),
                signing_algorithm: "hmac-sha256".to_string(),
                content_type: "application/json".to_string(),
                custom_headers: serde_json::json!({"X-Test": "value"}),
                event_filter: vec!["test.*".to_string()],
            },
            retry_policy: RetryTemplatePolicy {
                max_attempts: 3,
                backoff: "exponential".to_string(),
                initial_delay_secs: 10,
                max_delay_secs: 3600,
            },
            agents: vec![TemplateAgent {
                agent_name: "test_agent".to_string(),
                description: "Test agent".to_string(),
                enabled_by_default: true,
                config: serde_json::json!({}),
            }],
            estimated_daily_volume: 100,
            tags: vec!["test".to_string()],
        };

        let json = serde_json::to_string(&template).unwrap();
        let deserialized: WebhookTemplate = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, "test-template");
        assert_eq!(deserialized.name, "Test Template");
        assert_eq!(deserialized.industry, "test");
        assert_eq!(deserialized.event_types, vec!["test.event"]);
        assert_eq!(
            deserialized.endpoint_config.signing_algorithm,
            "hmac-sha256"
        );
        assert_eq!(deserialized.retry_policy.max_attempts, 3);
        assert_eq!(deserialized.agents.len(), 1);
        assert_eq!(deserialized.estimated_daily_volume, 100);
    }

    #[test]
    fn test_endpoint_template_config_serialization() {
        let config = EndpointTemplateConfig {
            url_placeholder: "https://my.app/webhook".to_string(),
            signing_algorithm: "hmac-sha256".to_string(),
            content_type: "application/json".to_string(),
            custom_headers: serde_json::json!({"Authorization": "Bearer {{token}}"}),
            event_filter: vec!["order.*".to_string(), "payment.*".to_string()],
        };
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: EndpointTemplateConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.url_placeholder, "https://my.app/webhook");
        assert_eq!(deserialized.event_filter.len(), 2);
    }

    #[test]
    fn test_retry_template_policy_serialization() {
        let policy = RetryTemplatePolicy {
            max_attempts: 5,
            backoff: "linear".to_string(),
            initial_delay_secs: 5,
            max_delay_secs: 600,
        };
        let json = serde_json::to_string(&policy).unwrap();
        let deserialized: RetryTemplatePolicy = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.max_attempts, 5);
        assert_eq!(deserialized.backoff, "linear");
        assert_eq!(deserialized.initial_delay_secs, 5);
        assert_eq!(deserialized.max_delay_secs, 600);
    }

    #[test]
    fn test_template_agent_serialization() {
        let agent = TemplateAgent {
            agent_name: "my_agent".to_string(),
            description: "Agent description".to_string(),
            enabled_by_default: false,
            config: serde_json::json!({"param": 42}),
        };
        let json = serde_json::to_string(&agent).unwrap();
        let deserialized: TemplateAgent = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.agent_name, "my_agent");
        assert!(!deserialized.enabled_by_default);
        assert_eq!(deserialized.config["param"], 42);
    }

    #[test]
    fn test_template_list_response_serialization() {
        let resp = TemplateListResponse {
            templates: vec![],
            total: 0,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["total"], 0);
        assert!(json["templates"].as_array().unwrap().is_empty());
    }

    #[test]
    fn test_apply_template_request_deserialization() {
        let json = r#"{
            "endpoint_url": "https://my-server.com/webhooks",
            "signing_secret": "whsec_abc123",
            "custom_headers": {"X-Custom": "value"},
            "enabled_agents": ["fraud_detector"]
        }"#;
        let req: ApplyTemplateRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.endpoint_url, "https://my-server.com/webhooks");
        assert_eq!(req.signing_secret, Some("whsec_abc123".to_string()));
        assert!(req.custom_headers.is_some());
        assert_eq!(req.enabled_agents, Some(vec!["fraud_detector".to_string()]));
    }

    #[test]
    fn test_apply_template_request_minimal() {
        let json = r#"{"endpoint_url": "https://example.com"}"#;
        let req: ApplyTemplateRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.endpoint_url, "https://example.com");
        assert!(req.signing_secret.is_none());
        assert!(req.custom_headers.is_none());
        assert!(req.enabled_agents.is_none());
    }

    #[test]
    fn test_apply_template_response_serialization() {
        let resp = ApplyTemplateResponse {
            template_id: "stripe-like-payments".to_string(),
            endpoint_id: Uuid::new_v4(),
            event_subscriptions: vec!["payment_intent.created".to_string()],
            agents_enabled: vec!["fraud_detector".to_string()],
            message: "Template applied successfully".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["template_id"], "stripe-like-payments");
        assert_eq!(json["message"], "Template applied successfully");
        assert_eq!(json["event_subscriptions"][0], "payment_intent.created");
        assert_eq!(json["agents_enabled"][0], "fraud_detector");
    }

    #[test]
    fn test_webhook_template_all() {
        let templates = WebhookTemplate::all();
        assert!(!templates.is_empty());
    }

    #[test]
    fn test_webhook_template_find_by_id() {
        let template = WebhookTemplate::find_by_id("stripe-like-payments");
        assert!(template.is_some());
        assert_eq!(template.unwrap().id, "stripe-like-payments");

        let missing = WebhookTemplate::find_by_id("nonexistent-template");
        assert!(missing.is_none());
    }

    #[test]
    fn test_webhook_template_by_industry() {
        let fintech = WebhookTemplate::by_industry("fintech");
        assert!(!fintech.is_empty());
        for t in &fintech {
            assert_eq!(t.industry, "fintech");
        }

        let ecommerce = WebhookTemplate::by_industry("ecommerce");
        assert!(!ecommerce.is_empty());
        for t in &ecommerce {
            assert_eq!(t.industry, "ecommerce");
        }

        let nonexistent = WebhookTemplate::by_industry("nonexistent");
        assert!(nonexistent.is_empty());
    }

    #[test]
    fn test_webhook_template_by_tag() {
        let payments = WebhookTemplate::by_tag("payments");
        assert!(!payments.is_empty());
        for t in &payments {
            assert!(t.tags.iter().any(|tag| tag == "payments"));
        }

        let sms = WebhookTemplate::by_tag("sms");
        assert!(!sms.is_empty());

        let nonexistent = WebhookTemplate::by_tag("nonexistent-tag-xyz");
        assert!(nonexistent.is_empty());
    }

    #[test]
    fn test_webhook_template_clone() {
        let templates = WebhookTemplate::all();
        let original = &templates[0];
        let cloned = original.clone();
        assert_eq!(cloned.id, original.id);
        assert_eq!(cloned.name, original.name);
        assert_eq!(cloned.event_types, original.event_types);
    }

    #[test]
    fn test_endpoint_template_config_empty_headers() {
        let config = EndpointTemplateConfig {
            url_placeholder: "https://example.com".to_string(),
            signing_algorithm: "none".to_string(),
            content_type: "text/plain".to_string(),
            custom_headers: serde_json::json!({}),
            event_filter: vec!["*".to_string()],
        };
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: EndpointTemplateConfig = serde_json::from_str(&json).unwrap();
        assert!(deserialized.custom_headers.as_object().unwrap().is_empty());
    }
}
