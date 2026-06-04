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

/// Trigger AI agent analysis.
/// NOTE: AI center is not part of the MVP. This is a no-op that returns
/// a successful empty result. Re-enable when ai-center service is added.
pub async fn trigger_agents(
    _http_client: &reqwest::Client,
    _input: &TriggerAgentsInput,
) -> TriggerAgentsOutput {
    tracing::debug!("⏭️ AI agent trigger skipped (ai-center not available)");
    TriggerAgentsOutput {
        agents_triggered: 0,
        actions_count: 0,
        success: true,
        error: None,
    }
}
