//! Temporal Activities for HookRelay webhook delivery.
//!
//! Activities are the "non-deterministic" building blocks in Temporal — they
//! perform I/O (HTTP calls, DB writes, Kafka publishes) while the workflow
//! itself remains deterministic. Each activity is independently retryable
//! via Temporal's built-in retry policy.
//!
//! ## Activity Lifecycle
//! 1. Workflow calls an activity with typed input
//! 2. Temporal dispatches the activity to a worker polling the task queue
//! 3. Worker executes the activity function and returns a result
//! 4. Temporal records the result and resumes the workflow
//!
//! If an activity fails, Temporal retries it according to the retry policy
//! configured on the activity options (or the workflow-level default).

use anyhow::Result;
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use temporalio_macros::{activities, activity};
use temporalio_sdk::activities::{ActivityContext, ActivityError};

use crate::signing;

// ---------------------------------------------------------------------------
// Shared state — accessible from all activities via Arc<Self>
// ---------------------------------------------------------------------------

/// Shared state passed to all activities. Holds the HTTP client and DB pool
/// so activities don't need to create their own connections.
pub struct HookRelayActivities {
    pub http_client: Client,
    pub pool: PgPool,
}

// ---------------------------------------------------------------------------
// Activity input/output types
// ---------------------------------------------------------------------------

/// Input for the `deliver_webhook` activity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverWebhookInput {
    pub delivery_id: String,
    pub endpoint_url: String,
    pub signing_secret: String,
    pub payload: String,
    pub attempt_number: i32,
    pub custom_headers: Option<serde_json::Value>,
}

/// Result of a successful or failed webhook delivery attempt.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverWebhookOutput {
    /// HTTP status code from the endpoint (0 if connection failed).
    pub status_code: i32,
    /// Truncated response body (max 1000 chars).
    pub response_body: String,
    /// Time taken for the HTTP call in milliseconds.
    pub duration_ms: i32,
    /// Non-empty if the delivery failed (network error, timeout, etc.).
    pub error: String,
    /// Whether the delivery was successful (2xx status code and no error).
    pub success: bool,
}

/// Input for the `record_delivery_attempt` activity.
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

/// Input for the `move_to_dead_letter` activity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeadLetterInput {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub reason: String,
    pub attempts: i32,
}

/// Input for the `publish_to_kafka` activity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishKafkaInput {
    pub delivery_id: String,
    pub status: String,
    pub attempt_count: i32,
    pub status_code: i32,
    pub error: String,
}

/// Input for the `trigger_agents` activity.
///
/// Called after a successful webhook delivery to trigger AI agent analysis.
/// Runs asynchronously — does not block the delivery workflow.
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

/// Result of the `trigger_agents` activity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerAgentsOutput {
    pub agents_triggered: i32,
    pub actions_count: i32,
    pub success: bool,
    pub error: Option<String>,
}

// ---------------------------------------------------------------------------
// Activity implementations
// ---------------------------------------------------------------------------

#[activities]
impl HookRelayActivities {
    /// Deliver a webhook to the endpoint via HTTP POST.
    ///
    /// This is the core activity that performs the actual network I/O.
    /// It generates an HMAC-SHA256 signature of the payload using the
    /// endpoint's signing secret, attaches standard HookRelay headers,
    /// and sends the request.
    ///
    /// The activity has a 30-second start-to-close timeout configured by
    /// the workflow when it calls this activity.
    #[activity]
    pub async fn deliver_webhook(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: DeliverWebhookInput,
    ) -> Result<DeliverWebhookOutput, ActivityError> {
        // Generate HMAC signature (same as existing signing.rs logic)
        let signature = signing::compute_hmac(&input.signing_secret, &input.payload);

        let start = std::time::Instant::now();

        // Build request with standard HookRelay headers
        let mut req_builder = self
            .http_client
            .post(&input.endpoint_url)
            .header("Content-Type", "application/json")
            .header("X-Hookrelay-Signature", format!("sha256={}", signature))
            .header("X-Hookrelay-Delivery-Id", &input.delivery_id)
            .header("X-Hookrelay-Attempt", input.attempt_number.to_string())
            .body(input.payload.clone());

        // Attach any custom headers configured on the endpoint
        if let Some(ref headers) = input.custom_headers {
            if let Some(obj) = headers.as_object() {
                for (key, value) in obj {
                    if let Some(val) = value.as_str() {
                        req_builder = req_builder.header(key.as_str(), val);
                    }
                }
            }
        }

        let result = req_builder.send().await;
        let duration_ms = start.elapsed().as_millis() as i32;

        match result {
            Ok(response) => {
                let status_code = response.status().as_u16() as i32;
                let body = response.text().await.unwrap_or_default();
                let response_body = truncate_str(&body, 1000);
                let success = (200..300).contains(&status_code);

                if !success {
                    tracing::warn!(
                        "⚠️ Delivery {} got HTTP {} (attempt {})",
                        input.delivery_id,
                        status_code,
                        input.attempt_number
                    );
                }

                Ok(DeliverWebhookOutput {
                    status_code,
                    response_body,
                    duration_ms,
                    error: String::new(),
                    success,
                })
            }
            Err(e) => {
                tracing::error!(
                    "❌ Delivery {} network error: {:?} (attempt {})",
                    input.delivery_id,
                    e,
                    input.attempt_number
                );

                Ok(DeliverWebhookOutput {
                    status_code: 0,
                    response_body: String::new(),
                    duration_ms,
                    error: e.to_string(),
                    success: false,
                })
            }
        }
    }

    /// Record a delivery attempt in the database.
    ///
    /// Inserts a row into `delivery_attempts` and updates the `deliveries`
    /// table with the current attempt count, status, and response info.
    /// This runs after every delivery attempt (success or failure).
    #[activity]
    pub async fn record_delivery_attempt(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: RecordAttemptInput,
    ) -> Result<(), ActivityError> {
        // Insert the attempt record
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
        .execute(&self.pool)
        .await
        .map_err(|e| ActivityError::from(anyhow::anyhow!("DB write failed: {}", e)))?;

        // Update the delivery record
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
        .execute(&self.pool)
        .await
        .map_err(|e| ActivityError::from(anyhow::anyhow!("DB update failed: {}", e)))?;

        Ok(())
    }

    /// Move a delivery to the dead letter queue.
    ///
    /// Called when a delivery has exhausted all retry attempts. Copies the
    /// delivery info into `dead_letters` and marks the delivery as 'failed'.
    #[activity]
    pub async fn move_to_dead_letter(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: DeadLetterInput,
    ) -> Result<(), ActivityError> {
        sqlx::query(
            "INSERT INTO dead_letters \
             (delivery_id, endpoint_id, customer_id, payload, reason, attempts) \
             SELECT id, endpoint_id, customer_id, payload, $2, $3 \
             FROM deliveries WHERE id = $1",
        )
        .bind(&input.delivery_id)
        .bind(&input.reason)
        .bind(input.attempts)
        .execute(&self.pool)
        .await
        .map_err(|e| ActivityError::from(anyhow::anyhow!("Dead letter write failed: {}", e)))?;

        sqlx::query("UPDATE deliveries SET status = 'failed' WHERE id = $1")
            .bind(&input.delivery_id)
            .execute(&self.pool)
            .await
            .map_err(|e| ActivityError::from(anyhow::anyhow!("DB update failed: {}", e)))?;

        tracing::info!(
            "🪦 Delivery {} moved to dead letter queue",
            input.delivery_id
        );
        Ok(())
    }

    /// Publish the delivery result to a Kafka topic for downstream consumers.
    ///
    /// This maintains backward compatibility — systems that previously
    /// consumed delivery results from Kafka will continue to work.
    /// Uses the existing rdkafka producer.
    #[activity]
    pub async fn publish_to_kafka(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: PublishKafkaInput,
    ) -> Result<(), ActivityError> {
        use rdkafka::producer::{FutureProducer, FutureRecord};
        use std::time::Duration;

        let producer: FutureProducer = rdkafka::config::ClientConfig::new()
            .set("bootstrap.servers", &crate::config::WorkerConfig::from_env()
                .map_err(|e| ActivityError::from(anyhow::anyhow!("Config error: {}", e)))?
                .kafka_brokers)
            .set("message.timeout.ms", "5000")
            .create()
            .map_err(|e| ActivityError::from(anyhow::anyhow!("Kafka producer error: {}", e)))?;

        let msg = serde_json::json!({
            "delivery_id": input.delivery_id,
            "status": input.status,
            "attempt_count": input.attempt_count,
            "status_code": input.status_code,
            "error": input.error,
            "timestamp": Utc::now().to_rfc3339(),
        });

        let topic = crate::config::WorkerConfig::from_env()
            .map_err(|e| ActivityError::from(anyhow::anyhow!("Config error: {}", e)))?
            .kafka_topic;

        producer
            .send(
                FutureRecord::to(&topic)
                    .key(&input.delivery_id)
                    .payload(&msg.to_string()),
                Duration::from_secs(5),
            )
            .await
            .map_err(|(e, _)| ActivityError::from(anyhow::anyhow!("Kafka publish failed: {}", e)))?;

        Ok(())
    }

    /// Trigger AI agent analysis after a successful webhook delivery.
    ///
    /// This activity calls the AI center's agent orchestrator to run
    /// matching agents. It runs asynchronously and doesn't block the
    /// delivery workflow — failures here are logged but don't affect
    /// the delivery status.
    ///
    /// The AI center URL is configured via `AI_CENTER_URL` env var.
    /// If not configured, this activity is a no-op.
    #[activity]
    pub async fn trigger_agents(
        self: Arc<Self>,
        _ctx: ActivityContext,
        input: TriggerAgentsInput,
    ) -> Result<TriggerAgentsOutput, ActivityError> {
        let ai_center_url = std::env::var("AI_CENTER_URL")
            .unwrap_or_else(|_| "http://localhost:8081".to_string());

        // Build the context payload to send to the AI center
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

        match self
            .http_client
            .post(&url)
            .json(&context_payload)
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await
        {
            Ok(response) => {
                if response.status().is_success() {
                    let body: serde_json::Value = response.json().await.unwrap_or_default();
                    let agents_triggered =
                        body.get("agents_triggered").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
                    let actions_count =
                        body.get("actions_count").and_then(|v| v.as_i64()).unwrap_or(0) as i32;

                    tracing::info!(
                        "🤖 Agents triggered for delivery {}: {} agents, {} actions",
                        input.delivery_id,
                        agents_triggered,
                        actions_count
                    );

                    Ok(TriggerAgentsOutput {
                        agents_triggered,
                        actions_count,
                        success: true,
                        error: None,
                    })
                } else {
                    let status = response.status();
                    let body = response.text().await.unwrap_or_default();
                    tracing::warn!(
                        "⚠️ Agent trigger failed for delivery {}: HTTP {} — {}",
                        input.delivery_id,
                        status,
                        body
                    );
                    Ok(TriggerAgentsOutput {
                        agents_triggered: 0,
                        actions_count: 0,
                        success: false,
                        error: Some(format!("HTTP {}: {}", status, body)),
                    })
                }
            }
            Err(e) => {
                tracing::warn!(
                    "⚠️ Agent trigger error for delivery {}: {:?}",
                    input.delivery_id,
                    e
                );
                Ok(TriggerAgentsOutput {
                    agents_triggered: 0,
                    actions_count: 0,
                    success: false,
                    error: Some(e.to_string()),
                })
            }
        }
    }
}

fn truncate_str(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}
