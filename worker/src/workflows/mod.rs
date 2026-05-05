//! Temporal Workflows for HookRelay webhook delivery.
//!
//! ## Temporal Concepts (for future developers)
//!
//! A **workflow** is a durable, fault-tolerant function that orchestrates
//! activities. Unlike activities (which do I/O), workflows must be
//! *deterministic* — they're replayed from event history on recovery, so
//! they can't perform I/O, use random numbers, or access system time.
//!
//! The key workflow here is `WebhookDeliveryWorkflow`, which replaces the
//! old "Kafka consumer + sleep + retry scheduler" pattern with a proper
//! Temporal workflow that:
//!
//! 1. Calls the `deliver_webhook` activity to POST to the endpoint
//! 2. Records the attempt in the DB via `record_delivery_attempt`
//! 3. On failure, waits (exponential backoff via Temporal timer) then retries
//! 4. On max retries exceeded, moves to dead letter queue
//! 5. On success, publishes result to Kafka for downstream consumers
//!
//! Temporal handles all the hard parts: retries, timeouts, persistence,
//! and crash recovery. If the worker restarts mid-delivery, the workflow
//! resumes exactly where it left off.

use serde::{Deserialize, Serialize};
use std::time::Duration;
use temporalio_macros::{workflow, workflow_methods};
use temporalio_sdk::workflows::ActivityOptions;
use temporalio_sdk::{WorkflowContext, WorkflowResult};

use crate::activities::{
    DeadLetterInput, DeliverWebhookInput, DeliverWebhookOutput, HookRelayActivities,
    PublishKafkaInput, RecordAttemptInput,
};

// ---------------------------------------------------------------------------
// Workflow input types
// ---------------------------------------------------------------------------

/// Input to start a webhook delivery workflow.
///
/// Passed from the Kafka consumer when a new webhook message arrives.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookDeliveryInput {
    pub delivery_id: String,
    pub endpoint_id: String,
    pub endpoint_url: String,
    pub signing_secret: String,
    pub payload: String,
    pub custom_headers: Option<serde_json::Value>,
    pub retry_policy: RetryPolicy,
}

/// Retry policy configuration, deserialized from the endpoint's settings.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: i32,
    /// Backoff strategy: "exponential", "linear", or "fixed".
    pub backoff: String,
    pub initial_delay_secs: i32,
    pub max_delay_secs: i32,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            backoff: "exponential".to_string(),
            initial_delay_secs: 10,
            max_delay_secs: 3600,
        }
    }
}

impl RetryPolicy {
    /// Calculate the backoff delay for a given attempt number (1-indexed).
    pub fn delay_for_attempt(&self, attempt: i32) -> i64 {
        let base = self.initial_delay_secs as i64;
        match self.backoff.as_str() {
            "exponential" => {
                let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
                delay.min(self.max_delay_secs as i64)
            }
            "linear" => {
                let delay = base * attempt as i64;
                delay.min(self.max_delay_secs as i64)
            }
            _ => base, // fixed
        }
    }
}

// ---------------------------------------------------------------------------
// Workflow state & result
// ---------------------------------------------------------------------------

/// Tracks all delivery attempts within a workflow execution.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttemptResult {
    pub attempt_number: i32,
    pub status_code: i32,
    pub response_body: String,
    pub duration_ms: i32,
    pub error: String,
    pub success: bool,
}

// ---------------------------------------------------------------------------
// Workflow definition
// ---------------------------------------------------------------------------

/// Main webhook delivery workflow.
///
/// Replaces the old approach of processing webhooks inline in the Kafka
/// consumer with `tokio::time::sleep` for retries and a separate retry
/// scheduler polling the DB.
///
/// ## How it works
///
/// ```text
/// ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
/// │  Kafka Msg  │────▶│  Start       │────▶│  deliver_    │
/// │  Arrives    │     │  Workflow     │     │  webhook     │
/// └─────────────┘     └──────────────┘     └──────┬───────┘
///                                                  │
///                              ┌────────────────────┤
///                              │                    │
///                         success               failure
///                              │                    │
///                    ┌─────────▼──┐     ┌───────────▼──────┐
///                    │ record +   │     │ retries left?    │
///                    │ kafka msg  │     └────┬─────────┬───┘
///                    └────────────┘          yes       no
///                                          │          │
///                                   ┌──────▼──┐  ┌────▼──────┐
///                                   │ timer   │  │ dead      │
///                                   │ sleep   │  │ letter    │
///                                   └────┬────┘  └───────────┘
///                                        │
///                                   retry delivery
/// ```
#[workflow]
pub struct WebhookDeliveryWorkflow {
    input: WebhookDeliveryInput,
    /// All attempts made so far, tracked for observability.
    attempts: Vec<AttemptResult>,
    /// Current attempt number (1-indexed).
    current_attempt: i32,
}

#[workflow_methods]
impl WebhookDeliveryWorkflow {
    /// Initialize the workflow with the webhook delivery input.
    #[init]
    fn new(_ctx: &temporalio_sdk::WorkflowContextView, input: WebhookDeliveryInput) -> Self {
        Self {
            input,
            attempts: Vec::new(),
            current_attempt: 0,
        }
    }

    /// Main workflow logic — deliver with retries and exponential backoff.
    ///
    /// This method is deterministic: no I/O, no system time, no randomness.
    /// All side effects go through activities. All waits use `ctx.timer()`
    /// instead of `tokio::time::sleep`.
    #[run]
    async fn run(ctx: &mut WorkflowContext<Self>) -> WorkflowResult<()> {
        let max_attempts = ctx.state(|s| s.input.retry_policy.max_attempts);

        loop {
            // Increment attempt counter
            ctx.state_mut(|s| s.current_attempt += 1);
            let attempt = ctx.state(|s| s.current_attempt);

            // --- Step 1: Deliver the webhook via activity ---
            let deliver_input = ctx.state(|s| DeliverWebhookInput {
                delivery_id: s.input.delivery_id.clone(),
                endpoint_url: s.input.endpoint_url.clone(),
                signing_secret: s.input.signing_secret.clone(),
                payload: s.input.payload.clone(),
                attempt_number: attempt,
                custom_headers: s.input.custom_headers.clone(),
            });

            let delivery_result: DeliverWebhookOutput = ctx
                .start_activity(
                    HookRelayActivities::deliver_webhook,
                    deliver_input,
                    ActivityOptions::start_to_close_timeout(Duration::from_secs(30)),
                )?
                .await?;

            // Track the attempt
            let attempt_record = AttemptResult {
                attempt_number: attempt,
                status_code: delivery_result.status_code,
                response_body: delivery_result.response_body.clone(),
                duration_ms: delivery_result.duration_ms,
                error: delivery_result.error.clone(),
                success: delivery_result.success,
            };
            ctx.state_mut(|s| s.attempts.push(attempt_record));

            // --- Step 2: Record the attempt in the database ---
            let (delivery_status, response_status) = if delivery_result.success {
                ("delivered".to_string(), delivery_result.status_code)
            } else if attempt >= max_attempts {
                ("failed".to_string(), delivery_result.status_code)
            } else {
                ("pending".to_string(), delivery_result.status_code)
            };

            let record_input = ctx.state(|s| RecordAttemptInput {
                delivery_id: s.input.delivery_id.clone(),
                attempt_number: attempt,
                status_code: Some(delivery_result.status_code),
                response_body: Some(delivery_result.response_body.clone()),
                duration_ms: Some(delivery_result.duration_ms),
                error_message: if delivery_result.error.is_empty() {
                    None
                } else {
                    Some(delivery_result.error.clone())
                },
                delivery_status: delivery_status.clone(),
                response_status,
            });

            ctx.start_activity(
                HookRelayActivities::record_delivery_attempt,
                record_input,
                ActivityOptions::start_to_close_timeout(Duration::from_secs(10)),
            )?
            .await?;

            if delivery_result.success {
                // --- Success path: publish to Kafka and finish ---
                tracing::info!(
                    "✅ Workflow: delivery {} succeeded on attempt {}",
                    ctx.state(|s| s.input.delivery_id.clone()),
                    attempt
                );

                let kafka_input = PublishKafkaInput {
                    delivery_id: ctx.state(|s| s.input.delivery_id.clone()),
                    status: "delivered".to_string(),
                    attempt_count: attempt,
                    status_code: delivery_result.status_code,
                    error: String::new(),
                };

                ctx.start_activity(
                    HookRelayActivities::publish_to_kafka,
                    kafka_input,
                    ActivityOptions::start_to_close_timeout(Duration::from_secs(10)),
                )?
                .await?;

                return Ok(());
            }

            // --- Failure path ---
            if attempt >= max_attempts {
                // Max retries exceeded → dead letter queue
                tracing::error!(
                    "❌ Workflow: delivery {} failed after {} attempts, moving to dead letter",
                    ctx.state(|s| s.input.delivery_id.clone()),
                    attempt
                );

                let dead_letter_input = ctx.state(|s| DeadLetterInput {
                    delivery_id: s.input.delivery_id.clone(),
                    endpoint_id: s.input.endpoint_id.clone(),
                    reason: if delivery_result.error.is_empty() {
                        format!("HTTP {}", delivery_result.status_code)
                    } else {
                        delivery_result.error.clone()
                    },
                    attempts: attempt,
                });

                ctx.start_activity(
                    HookRelayActivities::move_to_dead_letter,
                    dead_letter_input,
                    ActivityOptions::start_to_close_timeout(Duration::from_secs(10)),
                )?
                .await?;

                // Publish failure to Kafka
                let kafka_input = PublishKafkaInput {
                    delivery_id: ctx.state(|s| s.input.delivery_id.clone()),
                    status: "failed".to_string(),
                    attempt_count: attempt,
                    status_code: delivery_result.status_code,
                    error: delivery_result.error.clone(),
                };

                ctx.start_activity(
                    HookRelayActivities::publish_to_kafka,
                    kafka_input,
                    ActivityOptions::start_to_close_timeout(Duration::from_secs(10)),
                )?
                .await?;

                return Ok(());
            }

            // --- Retry path: wait with exponential backoff, then loop ---
            let delay_secs = ctx.state(|s| s.input.retry_policy.delay_for_attempt(attempt));

            tracing::info!(
                "⏰ Workflow: delivery {} retrying in {}s (attempt {}/{})",
                ctx.state(|s| s.input.delivery_id.clone()),
                delay_secs,
                attempt,
                max_attempts
            );

            // Use Temporal's deterministic timer instead of tokio::time::sleep.
            // This is safe for workflow replay — the timer is recorded in the
            // event history and replays identically.
            ctx.timer(Duration::from_secs(delay_secs as u64)).await;

            // Loop continues with next attempt
        }
    }

    /// Query the current workflow state (for the dashboard or debugging).
    ///
    /// Returns all attempts made so far and the current attempt number.
    /// This is a read-only query — it doesn't mutate workflow state.
    #[query]
    fn get_status(&self, _ctx: &temporalio_sdk::WorkflowContextView) -> WorkflowStatus {
        WorkflowStatus {
            delivery_id: self.input.delivery_id.clone(),
            current_attempt: self.current_attempt,
            max_attempts: self.input.retry_policy.max_attempts,
            attempts: self.attempts.clone(),
        }
    }
}

/// Queryable workflow status — used by the dashboard to show delivery progress.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStatus {
    pub delivery_id: String,
    pub current_attempt: i32,
    pub max_attempts: i32,
    pub attempts: Vec<AttemptResult>,
}
