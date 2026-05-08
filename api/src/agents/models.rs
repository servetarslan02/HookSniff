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

// ============ Event Statistics ============

#[derive(Debug, Serialize)]
pub struct EventStats {
    pub total_events: i64,
    pub emit_count: i64,
    pub receive_count: i64,
    pub delivered_count: i64,
    pub failed_count: i64,
    pub unique_event_types: i64,
    pub last_event_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─── CreateAgentRequest Deserialization ───

    #[test]
    fn test_create_agent_request_full() {
        let json = r#"{
            "name": "Test Agent",
            "description": "A test agent",
            "metadata": {"env": "test"}
        }"#;

        let req: CreateAgentRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Test Agent");
        assert_eq!(req.description, Some("A test agent".to_string()));
        assert!(req.metadata.is_some());
    }

    #[test]
    fn test_create_agent_request_minimal() {
        let json = r#"{"name": "Minimal Agent"}"#;

        let req: CreateAgentRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Minimal Agent");
        assert!(req.description.is_none());
        assert!(req.metadata.is_none());
    }

    #[test]
    fn test_create_agent_request_empty_name() {
        let json = r#"{"name": ""}"#;

        let req: CreateAgentRequest = serde_json::from_str(json).unwrap();
        assert!(req.name.is_empty()); // Validation handler'da yapilir
    }

    // ─── UpdateAgentRequest Deserialization ───

    #[test]
    fn test_update_agent_request_partial() {
        let json = r#"{"name": "New Name"}"#;

        let req: UpdateAgentRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, Some("New Name".to_string()));
        assert!(req.description.is_none());
        assert!(req.status.is_none());
        assert!(req.metadata.is_none());
    }

    #[test]
    fn test_update_agent_request_all_fields() {
        let json = r#"{
            "name": "Updated",
            "description": "New desc",
            "status": "inactive",
            "metadata": {"key": "value"}
        }"#;

        let req: UpdateAgentRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, Some("Updated".to_string()));
        assert_eq!(req.description, Some("New desc".to_string()));
        assert_eq!(req.status, Some("inactive".to_string()));
        assert!(req.metadata.is_some());
    }

    #[test]
    fn test_update_agent_request_empty() {
        let json = r#"{}"#;

        let req: UpdateAgentRequest = serde_json::from_str(json).unwrap();
        assert!(req.name.is_none());
        assert!(req.description.is_none());
        assert!(req.status.is_none());
        assert!(req.metadata.is_none());
    }

    // ─── EmitEventRequest Deserialization ───

    #[test]
    fn test_emit_event_request() {
        let json = r#"{
            "event_type": "order.created",
            "payload": {"id": 123, "total": 99.99}
        }"#;

        let req: EmitEventRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.event_type, "order.created");
        assert_eq!(req.payload["id"], 123);
        assert!(req.target_agent_id.is_none());
    }

    #[test]
    fn test_emit_event_request_with_target() {
        let target = Uuid::new_v4();
        let json = format!(
            r#"{{
            "event_type": "payment.received",
            "payload": {{}},
            "target_agent_id": "{}"
        }}"#,
            target
        );

        let req: EmitEventRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(req.target_agent_id, Some(target));
    }

    // ─── CreateRouteRequest Deserialization ───

    #[test]
    fn test_create_route_request() {
        let target = Uuid::new_v4();
        let json = format!(
            r#"{{
            "event_type": "order.created",
            "target_agent_id": "{}"
        }}"#,
            target
        );

        let req: CreateRouteRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(req.event_type, "order.created");
        assert_eq!(req.target_agent_id, target);
        assert!(req.source_agent_id.is_none());
        assert!(req.filter_expression.is_none());
    }

    #[test]
    fn test_create_route_request_with_source() {
        let source = Uuid::new_v4();
        let target = Uuid::new_v4();
        let json = format!(
            r#"{{
            "event_type": "user.signup",
            "source_agent_id": "{}",
            "target_agent_id": "{}",
            "filter_expression": {{"priority": "high"}}
        }}"#,
            source, target
        );

        let req: CreateRouteRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(req.source_agent_id, Some(source));
        assert_eq!(req.target_agent_id, target);
        assert!(req.filter_expression.is_some());
    }

    // ─── UpdateRateLimitRequest Deserialization ───

    #[test]
    fn test_update_rate_limit_request() {
        let json = r#"{"max_events_per_minute": 120}"#;

        let req: UpdateRateLimitRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.max_events_per_minute, Some(120));
        assert!(req.max_events_per_hour.is_none());
    }

    #[test]
    fn test_update_rate_limit_request_both() {
        let json = r#"{"max_events_per_minute": 120, "max_events_per_hour": 5000}"#;

        let req: UpdateRateLimitRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.max_events_per_minute, Some(120));
        assert_eq!(req.max_events_per_hour, Some(5000));
    }

    // ─── AgentResponse Serialization ───

    #[test]
    fn test_agent_response_from_agent() {
        let now = Utc::now();
        let agent = Agent {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            name: "Test Agent".to_string(),
            description: Some("Test description".to_string()),
            agent_key: "pub_agent_abc123".to_string(),
            agent_key_hash: "$argon2id$...".to_string(),
            status: "active".to_string(),
            metadata: serde_json::json!({"env": "prod"}),
            last_seen_at: Some(now),
            created_at: now,
            updated_at: now,
        };

        let resp = AgentResponse::from(agent.clone());

        assert_eq!(resp.id, agent.id);
        assert_eq!(resp.name, "Test Agent");
        assert_eq!(resp.description, Some("Test description".to_string()));
        assert_eq!(resp.agent_key, "pub_agent_abc123");
        assert_eq!(resp.status, "active");
        assert_eq!(resp.metadata, serde_json::json!({"env": "prod"}));
        assert_eq!(resp.last_seen_at, Some(now));
        assert_eq!(resp.created_at, now);
    }

    #[test]
    fn test_agent_response_serialization() {
        let now = Utc::now();
        let resp = AgentResponse {
            id: Uuid::new_v4(),
            name: "My Agent".to_string(),
            description: None,
            agent_key: "pub_agent_test".to_string(),
            status: "active".to_string(),
            metadata: serde_json::json!({}),
            last_seen_at: None,
            created_at: now,
        };

        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("\"name\":\"My Agent\""));
        assert!(json.contains("\"description\":null"));
        assert!(json.contains("\"last_seen_at\":null"));
        assert!(!json.contains("agent_key_hash"), "Hash response'ta olmamali");
    }

    // ─── Pagination Deserialization ───

    #[test]
    fn test_pagination_defaults() {
        let json = r#"{}"#;
        let p: crate::agents::routes::Pagination = serde_json::from_str(json).unwrap();
        assert!(p.page.is_none());
        assert!(p.per_page.is_none());
    }

    #[test]
    fn test_pagination_values() {
        let json = r#"{"page": 2, "per_page": 50}"#;
        let p: crate::agents::routes::Pagination = serde_json::from_str(json).unwrap();
        assert_eq!(p.page, Some(2));
        assert_eq!(p.per_page, Some(50));
    }
}
