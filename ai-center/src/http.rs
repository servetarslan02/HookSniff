use axum::extract::Extension;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::agents::context::{DeliverySummary, WebhookContext};
use crate::agents::orchestrator::AgentOrchestrator;

/// Build the HTTP router for the AI center agent API.
pub fn router() -> Router {
    Router::new()
        .route("/v1/agents", get(list_agents))
        .route("/v1/agents/trigger", post(trigger_agents))
}

/// Request body from the worker to trigger agents after a delivery.
#[derive(Debug, Deserialize)]
pub struct TriggerRequest {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub endpoint_url: String,
    pub customer_id: String,
    pub payload: String,
    pub event_type: Option<String>,
    pub status_code: i32,
    pub response_body: Option<String>,
    pub duration_ms: i32,
    pub attempt_number: i32,
}

/// Response from the trigger endpoint.
#[derive(Debug, Serialize)]
pub struct TriggerResponse {
    pub agents_triggered: i32,
    pub actions_count: i32,
    pub results: Vec<AgentResultSummary>,
}

#[derive(Debug, Serialize)]
pub struct AgentResultSummary {
    pub agent_name: String,
    pub confidence_score: f64,
    pub actions_count: usize,
    pub summary: String,
}

/// List all registered agents.
async fn list_agents(
    Extension(orchestrator): Extension<AgentOrchestrator>,
) -> Json<serde_json::Value> {
    let agents = orchestrator.list_agents().await;
    Json(serde_json::json!({
        "agents": agents,
        "count": agents.len(),
    }))
}

/// Trigger agents for a webhook delivery.
///
/// Called by the worker after a successful delivery. Builds a WebhookContext
/// from the request and runs matching agents through the orchestrator.
async fn trigger_agents(
    Extension(orchestrator): Extension<AgentOrchestrator>,
    Extension(pool): Extension<PgPool>,
    Json(req): Json<TriggerRequest>,
) -> Json<TriggerResponse> {
    // Parse IDs
    let delivery_id = match Uuid::parse_str(&req.delivery_id) {
        Ok(id) => id,
        Err(_) => {
            return Json(TriggerResponse {
                agents_triggered: 0,
                actions_count: 0,
                results: Vec::new(),
            });
        }
    };
    let endpoint_id = Uuid::parse_str(&req.endpoint_id).unwrap_or_else(|_| Uuid::new_v4());
    let customer_id = Uuid::parse_str(&req.customer_id).unwrap_or_else(|_| Uuid::new_v4());

    // Parse payload as JSON for field extraction
    let payload_json = serde_json::from_str(&req.payload).ok();

    // Extract event type from payload if not provided
    let event_type = req.event_type.or_else(|| {
        payload_json
            .as_ref()
            .and_then(|v| v.get("event_type").or_else(|| v.get("type")))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
    });

    // Fetch recent delivery history for this endpoint
    let recent_deliveries = fetch_recent_deliveries(&pool, endpoint_id)
        .await
        .unwrap_or_default();

    // Build the webhook context
    let context = WebhookContext {
        delivery_id,
        endpoint_id,
        endpoint_url: req.endpoint_url,
        customer_id,
        method: "POST".to_string(),
        status_code: req.status_code,
        response_body: req.response_body,
        duration_ms: req.duration_ms,
        payload: req.payload,
        payload_json,
        event_type,
        attempt_number: req.attempt_number,
        recent_deliveries,
        customer_metadata: None,
        created_at: chrono::Utc::now(),
    };

    // Trigger agents
    match orchestrator.trigger_agents(&context).await {
        Ok(results) => {
            let summaries: Vec<AgentResultSummary> = results
                .iter()
                .map(|r| AgentResultSummary {
                    agent_name: r.agent_name.clone(),
                    confidence_score: r.confidence_score,
                    actions_count: r.actions.len(),
                    summary: r.summary.clone(),
                })
                .collect();

            let total_actions: usize = results.iter().map(|r| r.actions.len()).sum();

            Json(TriggerResponse {
                agents_triggered: results.len() as i32,
                actions_count: total_actions as i32,
                results: summaries,
            })
        }
        Err(e) => {
            tracing::error!("❌ Agent trigger failed: {:?}", e);
            Json(TriggerResponse {
                agents_triggered: 0,
                actions_count: 0,
                results: Vec::new(),
            })
        }
    }
}

/// Fetch recent deliveries for an endpoint to build delivery history context.
async fn fetch_recent_deliveries(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> anyhow::Result<Vec<DeliverySummary>> {
    let rows = sqlx::query_as::<
        _,
        (
            Uuid,
            String,
            i32,
            i32,
            chrono::DateTime<chrono::Utc>,
            Option<String>,
        ),
    >(
        r#"
        SELECT id, status, COALESCE(response_status, 0), COALESCE(duration_ms, 0), created_at, NULL
        FROM deliveries
        WHERE endpoint_id = $1
        ORDER BY created_at DESC
        LIMIT 20
        "#,
    )
    .bind(endpoint_id)
    .fetch_all(pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|(id, status, status_code, duration_ms, created_at, event_type)| {
            DeliverySummary {
                delivery_id: id,
                status,
                status_code,
                duration_ms,
                created_at,
                event_type,
            }
        })
        .collect())
}
