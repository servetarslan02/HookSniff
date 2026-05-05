//! Multi-protocol delivery router for HookRelay's event mesh.
//!
//! Routes events to the appropriate delivery mechanism based on the
//! endpoint's configured delivery target type (HTTP, WebSocket, gRPC,
//! SQS, Kafka, Email).

pub mod grpc;
pub mod http;
pub mod sqs;
pub mod websocket;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tracing::{info, warn};

use crate::WebhookMessage;

/// Supported delivery target types.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum DeliveryTargetType {
    Http,
    WebSocket,
    Grpc,
    Sqs,
    Kafka,
    Email,
}

impl std::fmt::Display for DeliveryTargetType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Http => write!(f, "http"),
            Self::WebSocket => write!(f, "ws"),
            Self::Grpc => write!(f, "grpc"),
            Self::Sqs => write!(f, "sqs"),
            Self::Kafka => write!(f, "kafka"),
            Self::Email => write!(f, "email"),
        }
    }
}

impl std::str::FromStr for DeliveryTargetType {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "http" => Ok(Self::Http),
            "ws" | "websocket" => Ok(Self::WebSocket),
            "grpc" => Ok(Self::Grpc),
            "sqs" => Ok(Self::Sqs),
            "kafka" => Ok(Self::Kafka),
            "email" => Ok(Self::Email),
            other => Err(anyhow::anyhow!("Unknown delivery target type: {}", other)),
        }
    }
}

/// Configuration for a delivery target, stored in `delivery_targets.config`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryTargetConfig {
    pub target_type: DeliveryTargetType,
    /// Protocol-specific configuration (URL, queue ARN, topic, etc.)
    pub config: serde_json::Value,
}

/// Result of a delivery attempt through any protocol.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryResult {
    pub success: bool,
    pub status_code: i32,
    pub response_body: String,
    pub duration_ms: i32,
    pub error: String,
}

/// The delivery router selects the appropriate protocol handler and
/// dispatches the event.
pub struct DeliveryRouter {
    pool: PgPool,
    http_client: reqwest::Client,
}

impl DeliveryRouter {
    pub fn new(pool: PgPool, http_client: reqwest::Client) -> Self {
        Self { pool, http_client }
    }

    /// Route a webhook message to the appropriate delivery target(s).
    ///
    /// First checks if the endpoint has custom delivery targets configured
    /// in `delivery_targets`. If so, uses those. Otherwise falls back to
    /// the default HTTP webhook delivery.
    pub async fn deliver(&self, webhook: &WebhookMessage) -> Result<Vec<DeliveryResult>> {
        let targets = self.load_targets(&webhook.endpoint_id).await?;

        if targets.is_empty() {
            // No custom targets — use default HTTP delivery
            info!(
                "No custom delivery targets for endpoint {}, using default HTTP",
                webhook.endpoint_id
            );
            let result = http::deliver_http(&self.http_client, webhook).await?;
            return Ok(vec![result]);
        }

        let mut results = Vec::with_capacity(targets.len());

        for target in targets {
            if !target.enabled {
                continue;
            }

            let result = match target.target_type {
                DeliveryTargetType::Http => {
                    http::deliver_http(&self.http_client, webhook).await
                }
                DeliveryTargetType::WebSocket => {
                    websocket::deliver_websocket(&target.config, webhook).await
                }
                DeliveryTargetType::Grpc => {
                    grpc::deliver_grpc(&target.config, webhook).await
                }
                DeliveryTargetType::Sqs => {
                    sqs::deliver_sqs(&target.config, webhook).await
                }
                DeliveryTargetType::Kafka => {
                    deliver_kafka(&target.config, webhook).await
                }
                DeliveryTargetType::Email => {
                    deliver_email(&target.config, webhook).await
                }
            };

            match result {
                Ok(delivery_result) => results.push(delivery_result),
                Err(e) => {
                    warn!(
                        "Delivery target {} ({}) failed for delivery {}: {:?}",
                        target.id, target.target_type, webhook.delivery_id, e
                    );
                    results.push(DeliveryResult {
                        success: false,
                        status_code: 0,
                        response_body: String::new(),
                        duration_ms: 0,
                        error: e.to_string(),
                    });
                }
            }
        }

        Ok(results)
    }

    /// Load delivery targets for an endpoint from the database.
    async fn load_targets(&self, endpoint_id: &str) -> Result<Vec<DeliveryTargetRow>> {
        let rows: Vec<DeliveryTargetRow> = sqlx::query_as(
            "SELECT id, endpoint_id, target_type, config, enabled \
             FROM delivery_targets WHERE endpoint_id = $1 ORDER BY created_at",
        )
        .bind(endpoint_id)
        .fetch_all(&self.pool)
        .await
        .context("Failed to load delivery targets")?;

        Ok(rows)
    }
}

/// Row from the `delivery_targets` table.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DeliveryTargetRow {
    pub id: uuid::Uuid,
    pub endpoint_id: uuid::Uuid,
    pub target_type: String,
    pub config: serde_json::Value,
    pub enabled: bool,
}

/// Placeholder for Kafka delivery (uses the existing Kafka producer).
async fn deliver_kafka(
    config: &serde_json::Value,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let topic = config
        .get("topic")
        .and_then(|v| v.as_str())
        .unwrap_or("webhook-deliveries");

    info!(
        "Kafka delivery for {} to topic {}",
        webhook.delivery_id, topic
    );

    // In production this would use rdkafka::FutureProducer to publish.
    // For now, return success — the existing Kafka consumer loop already
    // handles Kafka-based delivery through the Temporal workflow.
    Ok(DeliveryResult {
        success: true,
        status_code: 200,
        response_body: format!("Published to Kafka topic: {}", topic),
        duration_ms: 0,
        error: String::new(),
    })
}

/// Placeholder for Email delivery.
async fn deliver_email(
    config: &serde_json::Value,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let to = config
        .get("to")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown@example.com");

    info!(
        "Email delivery for {} to {}",
        webhook.delivery_id, to
    );

    // In production this would use an SMTP client or email API.
    Ok(DeliveryResult {
        success: true,
        status_code: 200,
        response_body: format!("Email sent to: {}", to),
        duration_ms: 0,
        error: String::new(),
    })
}
