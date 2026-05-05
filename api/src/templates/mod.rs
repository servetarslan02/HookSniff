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
