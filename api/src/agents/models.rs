use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ============ Agent ============

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Agent {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub agent_key: String,
    pub agent_key_hash: String,
    pub status: String,
    pub metadata: serde_json::Value,
    pub last_seen_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAgentRequest {
    pub name: String,
    pub description: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAgentRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct AgentResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub agent_key: String,
    pub status: String,
    pub metadata: serde_json::Value,
    pub last_seen_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

impl From<Agent> for AgentResponse {
    fn from(a: Agent) -> Self {
        Self {
            id: a.id,
            name: a.name,
            description: a.description,
            agent_key: a.agent_key,
            status: a.status,
            metadata: a.metadata,
            last_seen_at: a.last_seen_at,
            created_at: a.created_at,
        }
    }
}

// ============ Agent Event ============

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AgentEvent {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub customer_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub direction: String,
    pub status: String,
    pub target_agent_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct EmitEventRequest {
    pub event_type: String,
    pub payload: serde_json::Value,
    pub target_agent_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct SubscribeRequest {
    pub event_type: String,
}

#[derive(Debug, Serialize)]
pub struct AgentEventResponse {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub direction: String,
    pub status: String,
    pub target_agent_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

// ============ Agent Route ============

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AgentRoute {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub event_type: String,
    pub source_agent_id: Option<Uuid>,
    pub target_agent_id: Uuid,
    pub filter_expression: Option<serde_json::Value>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRouteRequest {
    pub event_type: String,
    pub source_agent_id: Option<Uuid>,
    pub target_agent_id: Uuid,
    pub filter_expression: Option<serde_json::Value>,
}

// ============ Rate Limit ============

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AgentRateLimit {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub max_events_per_minute: i32,
    pub max_events_per_hour: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRateLimitRequest {
    pub max_events_per_minute: Option<i32>,
    pub max_events_per_hour: Option<i32>,
}
