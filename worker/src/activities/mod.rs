//! Activity definitions for webhook delivery operations.
//!
//! These are the building blocks that perform I/O: HTTP calls, DB writes,
//! and queue operations. Each function is independently retryable.
//!
//! NOTE: Previously used Temporal SDK for activity orchestration.
//! Now uses direct function calls from the main processing loop.
//! The Temporal SDK (`temporalio-sdk`) is no longer a dependency.

use anyhow::Result;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::signing;

// ---------------------------------------------------------------------------
// Activity input/output types
// ---------------------------------------------------------------------------

/// Input for delivering a webhook.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverWebhookInput {
    pub delivery_id: String,
    pub endpoint_url: String,
    pub signing_secret: String,
    pub payload: String,
    pub attempt_number: i32,
    pub custom_headers: Option<serde_json::Value>,
}

/// Result of a webhook delivery attempt.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverWebhookOutput {
    pub status_code: i32,
    pub response_body: String,
    pub duration_ms: i32,
    pub error: String,
    pub success: bool,
}

/// Input for recording a delivery attempt.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordAttemptInput {
    pub delivery_id: String,
    pub attempt_number: i32,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub delivery_status: String,
    pub response_status: i32,
}

/// Input for moving a delivery to dead letter.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeadLetterInput {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub reason: String,
    pub attempts: i32,
}

/// Input for triggering AI agents.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerAgentsInput {
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

/// Result of agent triggering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerAgentsOutput {
    pub agents_triggered: i32,
    pub actions_count: i32,
    pub success: bool,
    pub error: Option<String>,
}

// ---------------------------------------------------------------------------
// Activity implementations (plain async functions)
// ---------------------------------------------------------------------------

/// Record a delivery attempt in the database.
pub async fn record_delivery_attempt(
    pool: &PgPool,
    input: &RecordAttemptInput,
) -> Result<()> {
    sqlx::query(
        "INSERT INTO delivery_attempts \
         (delivery_id, attempt_number, status_code, response_body, duration_ms, error_message) \
         VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(&input.delivery_id)
    .bind(input.attempt_number)
    .bind(input.status_code)
    .bind(input.response_body.as_deref())
    .bind(input.duration_ms)
    .bind(input.error_message.as_deref())
    .execute(pool)
    .await?;

    sqlx::query(
        "UPDATE deliveries \
         SET status = $1, attempt_count = $2, response_status = $3, \
             response_body = $4, last_attempt_at = now() \
         WHERE id = $5",
    )
    .bind(&input.delivery_status)
    .bind(input.attempt_number)
    .bind(input.response_status)
    .bind(input.response_body.as_deref())
    .bind(&input.delivery_id)
    .execute(pool)
    .await?;

    Ok(())
}

/// Move a delivery to the dead letter queue.
pub async fn move_to_dead_letter(
    pool: &PgPool,
    input: &DeadLetterInput,
) -> Result<()> {
    sqlx::query(
        "INSERT INTO dead_letters \
         (delivery_id, endpoint_id, customer_id, payload, reason, attempts) \
         SELECT id, endpoint_id, customer_id, payload, $2, $3 \
         FROM deliveries WHERE id = $1",
    )
    .bind(&input.delivery_id)
    .bind(&input.reason)
    .bind(input.attempts)
    .execute(pool)
    .await?;

    sqlx::query("UPDATE deliveries SET status = 'failed' WHERE id = $1")
        .bind(&input.delivery_id)
        .execute(pool)
        .await?;

    tracing::info!("🪦 Delivery {} moved to dead letter queue", input.delivery_id);
    Ok(())
}

/// Trigger AI agent analysis via HTTP call to AI center.
pub async fn trigger_agents(
    http_client: &reqwest::Client,
    input: &TriggerAgentsInput,
) -> TriggerAgentsOutput {
    let ai_center_url = std::env::var("AI_CENTER_URL")
        .unwrap_or_else(|_| "http://localhost:8081".to_string());

    let context_payload = serde_json::json!({
        "delivery_id": input.delivery_id,
        "endpoint_id": input.endpoint_id,
        "endpoint_url": input.endpoint_url,
        "customer_id": input.customer_id,
        "payload": input.payload,
        "event_type": input.event_type,
        "status_code": input.status_code,
        "response_body": input.response_body,
        "duration_ms": input.duration_ms,
        "attempt_number": input.attempt_number,
    });

    let url = format!("{}/v1/agents/trigger", ai_center_url);

    match http_client
        .post(&url)
        .json(&context_payload)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            let body: serde_json::Value = response.json().await.unwrap_or_default();
            TriggerAgentsOutput {
                agents_triggered: body.get("agents_triggered").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
                actions_count: body.get("actions_count").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
                success: true,
                error: None,
            }
        }
        Ok(response) => {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            tracing::warn!("⚠️ Agent trigger failed: HTTP {} — {}", status, body);
            TriggerAgentsOutput {
                agents_triggered: 0,
                actions_count: 0,
                success: false,
                error: Some(format!("HTTP {}: {}", status, body)),
            }
        }
        Err(e) => {
            tracing::warn!("⚠️ Agent trigger error: {:?}", e);
            TriggerAgentsOutput {
                agents_triggered: 0,
                actions_count: 0,
                success: false,
                error: Some(e.to_string()),
            }
        }
    }
}
