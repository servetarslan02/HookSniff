use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post, put};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_agents))
        .route("/{id}/executions", get(list_executions))
        .route("/{id}/test", post(test_agent))
        .route("/{id}/config", put(update_agent_config))
}

// ---------------------------------------------------------------------------
// Query parameters
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
struct ExecutionsParams {
    limit: Option<i64>,
    customer_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
struct TestAgentRequest {
    /// Sample payload to test with
    payload: serde_json::Value,
    /// Optional event type override
    event_type: Option<String>,
    /// Optional endpoint URL
    endpoint_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UpdateConfigRequest {
    /// Whether the agent is enabled for this customer
    enabled: Option<bool>,
    /// Agent-specific configuration overrides
    config: Option<serde_json::Value>,
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
struct AgentEntry {
    id: Uuid,
    name: String,
    description: Option<String>,
    enabled: bool,
    config: Option<serde_json::Value>,
    execution_count: i64,
    last_executed_at: Option<chrono::DateTime<chrono::Utc>>,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
struct ExecutionEntry {
    id: Uuid,
    agent_id: Uuid,
    delivery_id: Option<Uuid>,
    customer_id: Option<Uuid>,
    trigger_reason: Option<String>,
    actions_taken: Option<serde_json::Value>,
    confidence_score: Option<f64>,
    ai_provider: Option<String>,
    latency_ms: Option<i32>,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
struct TestAgentResponse {
    agent_name: String,
    triggered: bool,
    actions: Vec<serde_json::Value>,
    confidence_score: f64,
    summary: String,
    latency_ms: u64,
}

#[derive(Debug, Serialize)]
struct AgentConfigResponse {
    customer_id: Uuid,
    agent_id: Uuid,
    enabled: bool,
    config: Option<serde_json::Value>,
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/// List all registered AI agents with execution stats.
async fn list_agents(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<Vec<AgentEntry>>, AppError> {
    let agents = sqlx::query_as::<
        _,
        (
            Uuid,
            String,
            Option<String>,
            bool,
            Option<serde_json::Value>,
            chrono::DateTime<chrono::Utc>,
        ),
    >(
        "SELECT id, name, description, enabled, config, created_at FROM ai_agents ORDER BY name"
    )
    .fetch_all(&pool)
    .await?;

    let mut result = Vec::new();
    for (id, name, desc, enabled, config, created_at) in agents {
        // Get execution stats
        let stats: (i64, Option<chrono::DateTime<chrono::Utc>>) = sqlx::query_as(
            "SELECT COUNT(*), MAX(created_at) FROM ai_agent_executions WHERE agent_id = $1",
        )
        .bind(id)
        .fetch_one(&pool)
        .await?;

        result.push(AgentEntry {
            id,
            name,
            description: desc,
            enabled,
            config,
            execution_count: stats.0,
            last_executed_at: stats.1,
            created_at,
        });
    }

    Ok(Json(result))
}

/// List execution history for a specific agent.
async fn list_executions(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Path(agent_id): Path<Uuid>,
    Query(params): Query<ExecutionsParams>,
) -> Result<Json<Vec<ExecutionEntry>>, AppError> {
    let limit = params.limit.unwrap_or(50).min(200);

    let executions = if let Some(cid) = params.customer_id {
        sqlx::query_as::<
            _,
            (
                Uuid,
                Uuid,
                Option<Uuid>,
                Option<Uuid>,
                Option<String>,
                Option<serde_json::Value>,
                Option<f64>,
                Option<String>,
                Option<i32>,
                chrono::DateTime<chrono::Utc>,
            ),
        >(
            r#"SELECT id, agent_id, delivery_id, customer_id, trigger_reason,
               actions_taken, confidence_score, ai_provider, latency_ms, created_at
               FROM ai_agent_executions
               WHERE agent_id = $1 AND customer_id = $2
               ORDER BY created_at DESC LIMIT $3"#,
        )
        .bind(agent_id)
        .bind(cid)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<
            _,
            (
                Uuid,
                Uuid,
                Option<Uuid>,
                Option<Uuid>,
                Option<String>,
                Option<serde_json::Value>,
                Option<f64>,
                Option<String>,
                Option<i32>,
                chrono::DateTime<chrono::Utc>,
            ),
        >(
            r#"SELECT id, agent_id, delivery_id, customer_id, trigger_reason,
               actions_taken, confidence_score, ai_provider, latency_ms, created_at
               FROM ai_agent_executions
               WHERE agent_id = $1
               ORDER BY created_at DESC LIMIT $2"#,
        )
        .bind(agent_id)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    };

    let result: Vec<ExecutionEntry> = executions
        .into_iter()
        .map(
            |(id, aid, did, cid, reason, actions, conf, provider, latency, created)| {
                ExecutionEntry {
                    id,
                    agent_id: aid,
                    delivery_id: did,
                    customer_id: cid,
                    trigger_reason: reason,
                    actions_taken: actions,
                    confidence_score: conf,
                    ai_provider: provider,
                    latency_ms: latency,
                    created_at: created,
                }
            },
        )
        .collect();

    Ok(Json(result))
}

/// Test an agent with a sample payload.
/// This doesn't persist results — it's a dry run.
async fn test_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<TestAgentRequest>,
) -> Result<Json<TestAgentResponse>, AppError> {
    // Verify the agent exists
    let agent_row: (String,) =
        sqlx::query_as("SELECT name FROM ai_agents WHERE id = $1")
            .bind(agent_id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let agent_name = agent_row.0;

    // Build a test context from the request
    let payload_str = serde_json::to_string(&req.payload).unwrap_or_default();
    let context = crate::agents::context::WebhookContext {
        delivery_id: Uuid::new_v4(),
        endpoint_id: Uuid::new_v4(),
        endpoint_url: req
            .endpoint_url
            .unwrap_or_else(|| "https://test.example.com/webhook".to_string()),
        customer_id: customer.id,
        method: "POST".to_string(),
        status_code: 200,
        response_body: None,
        duration_ms: 100,
        payload: payload_str,
        payload_json: Some(req.payload),
        event_type: req.event_type,
        attempt_number: 1,
        recent_deliveries: Vec::new(),
        customer_metadata: None,
        created_at: chrono::Utc::now(),
    };

    // Build the appropriate agent and run it
    let agent: Box<dyn crate::agents::WebhookAgent> = match agent_name.as_str() {
        "churn_detector" => Box::new(crate::agents::builtin::churn_detector::ChurnDetector::new()),
        "fraud_detector" => Box::new(crate::agents::builtin::fraud_detector::FraudDetector::new()),
        "inventory_optimizer" => {
            Box::new(crate::agents::builtin::inventory_optimizer::InventoryOptimizer::new())
        }
        "customer_segmenter" => {
            Box::new(crate::agents::builtin::customer_segmenter::CustomerSegmenter::new())
        }
        _ => {
            return Err(AppError::BadRequest(format!(
                "Agent '{}' does not support test mode",
                agent_name
            )));
        }
    };

    let triggered = agent.should_trigger(&context);
    let result = if triggered {
        agent.execute(&context).await.map_err(AppError::Internal)?
    } else {
        crate::agents::result::AgentResult::no_action(
            &agent_name,
            "Agent not triggered by this event type",
        )
    };

    let actions_json: Vec<serde_json::Value> = result
        .actions
        .iter()
        .map(|a| serde_json::to_value(a).unwrap_or_default())
        .collect();

    Ok(Json(TestAgentResponse {
        agent_name: result.agent_name,
        triggered,
        actions: actions_json,
        confidence_score: result.confidence_score,
        summary: result.summary,
        latency_ms: result.latency_ms,
    }))
}

/// Update agent configuration for a specific customer.
async fn update_agent_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<UpdateConfigRequest>,
) -> Result<Json<AgentConfigResponse>, AppError> {
    // Verify agent exists
    let exists: bool =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM ai_agents WHERE id = $1)")
            .bind(agent_id)
            .fetch_one(&pool)
            .await?;

    if !exists {
        return Err(AppError::NotFound);
    }

    let enabled = req.enabled.unwrap_or(true);

    // Upsert the config
    sqlx::query(
        r#"
        INSERT INTO ai_agent_configs (customer_id, agent_id, enabled, config)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (customer_id, agent_id)
        DO UPDATE SET enabled = $3, config = $4
        "#,
    )
    .bind(customer.id)
    .bind(agent_id)
    .bind(enabled)
    .bind(&req.config)
    .execute(&pool)
    .await?;

    tracing::info!(
        "⚙️ Agent config updated: customer={}, agent={}, enabled={}",
        customer.id,
        agent_id,
        enabled
    );

    Ok(Json(AgentConfigResponse {
        customer_id: customer.id,
        agent_id,
        enabled,
        config: req.config,
    }))
}
