pub mod builder;
pub mod registry;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A marketplace agent — an AI-powered webhook processor published to the marketplace
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct MarketplaceAgent {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub author: String,
    pub version: String,
    pub config: serde_json::Value,
    pub downloads: i32,
    pub rating: f64,
    pub created_at: DateTime<Utc>,
}

/// Agent metadata for listing/searching
#[derive(Debug, Clone, Serialize)]
pub struct AgentSummary {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub author: String,
    pub version: String,
    pub downloads: i32,
    pub rating: f64,
    pub tags: Vec<String>,
}

/// Detailed agent view including full config and reviews
#[derive(Debug, Clone, Serialize)]
pub struct AgentDetail {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub author: String,
    pub version: String,
    pub config: serde_json::Value,
    pub downloads: i32,
    pub rating: f64,
    pub created_at: DateTime<Utc>,
    pub tags: Vec<String>,
    pub triggers: Vec<AgentTrigger>,
    pub actions: Vec<AgentAction>,
    pub ai_config: Option<AiAnalysisConfig>,
}

/// Trigger definition for an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTrigger {
    /// Event type pattern (supports wildcards: "order.*", "*")
    pub event_pattern: String,
    /// Optional condition expression (e.g., "data.amount > 1000")
    pub condition: Option<String>,
    pub description: String,
}

/// Action an agent can take
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentAction {
    pub action_type: String, // "notify", "retry", "transform", "custom_webhook", "block", "flag"
    pub config: serde_json::Value,
    pub description: String,
}

/// AI analysis configuration for an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiAnalysisConfig {
    /// Which AI provider to use (or "auto" for orchestrator to choose)
    pub provider: String,
    /// System prompt for the AI
    pub system_prompt: String,
    /// Analysis type: "anomaly", "classification", "sentiment", "extraction"
    pub analysis_type: String,
    /// Output schema the AI should follow
    pub output_schema: Option<serde_json::Value>,
}

/// Request to publish a new agent
#[derive(Debug, Deserialize)]
pub struct PublishAgentRequest {
    pub name: String,
    pub description: String,
    pub version: Option<String>,
    pub config: serde_json::Value,
    pub triggers: Vec<AgentTrigger>,
    pub actions: Vec<AgentAction>,
    pub ai_config: Option<AiAnalysisConfig>,
    pub tags: Option<Vec<String>>,
}

/// Request to install an agent
#[derive(Debug, Deserialize)]
pub struct InstallAgentRequest {
    /// Customer-specific configuration overrides
    pub config: Option<serde_json::Value>,
}

/// Response after installing an agent
#[derive(Debug, Serialize)]
pub struct InstallAgentResponse {
    pub installation_id: Uuid,
    pub agent_id: Uuid,
    pub agent_name: String,
    pub enabled: bool,
    pub message: String,
}

/// Request to configure an installed agent
#[derive(Debug, Deserialize)]
pub struct ConfigureAgentRequest {
    pub enabled: Option<bool>,
    pub config: Option<serde_json::Value>,
}

/// Installed agent record
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct InstalledAgent {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub agent_id: Uuid,
    pub enabled: bool,
    pub config: Option<serde_json::Value>,
    pub installed_at: DateTime<Utc>,
}

/// List response for marketplace agents
#[derive(Debug, Serialize)]
pub struct AgentListResponse {
    pub agents: Vec<AgentSummary>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

impl MarketplaceAgent {
    /// Convert to summary view
    pub fn to_summary(&self) -> AgentSummary {
        let tags = self
            .config
            .get("tags")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        AgentSummary {
            id: self.id,
            name: self.name.clone(),
            description: self.description.clone(),
            author: self.author.clone(),
            version: self.version.clone(),
            downloads: self.downloads,
            rating: self.rating,
            tags,
        }
    }

    /// Convert to detailed view
    pub fn to_detail(&self) -> AgentDetail {
        let tags = self
            .config
            .get("tags")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let triggers = self
            .config
            .get("triggers")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let actions = self
            .config
            .get("actions")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let ai_config = self
            .config
            .get("ai_config")
            .and_then(|v| serde_json::from_value(v.clone()).ok());

        AgentDetail {
            id: self.id,
            name: self.name.clone(),
            description: self.description.clone(),
            author: self.author.clone(),
            version: self.version.clone(),
            config: self.config.clone(),
            downloads: self.downloads,
            rating: self.rating,
            created_at: self.created_at,
            tags,
            triggers,
            actions,
            ai_config,
        }
    }
}
