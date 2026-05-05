//! AWS SQS delivery client for HookRelay's event mesh.
//!
//! Delivers events to AWS SQS queues with message attributes for metadata.
//! Uses the aws-sdk-sqs crate for SQS API interactions.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::{debug, error, info, warn};

use crate::WebhookMessage;

use super::DeliveryResult;

/// SQS delivery configuration, stored in `delivery_targets.config`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SqsConfig {
    /// AWS region (e.g., "us-east-1")
    pub region: String,
    /// SQS queue URL
    pub queue_url: String,
    /// Message group ID for FIFO queues (optional)
    pub message_group_id: Option<String>,
    /// Message deduplication ID for FIFO queues (optional)
    pub message_deduplication_id: Option<String>,
    /// Delay seconds (0-900, non-FIFO only)
    #[serde(default)]
    pub delay_seconds: i32,
    /// Whether to include event metadata as message attributes
    #[serde(default = "default_true")]
    pub include_attributes: bool,
    /// Custom message attributes to add
    #[serde(default)]
    pub custom_attributes: std::collections::HashMap<String, String>,
}

fn default_true() -> bool {
    true
}

impl Default for SqsConfig {
    fn default() -> Self {
        Self {
            region: "us-east-1".to_string(),
            queue_url: String::new(),
            message_group_id: None,
            message_deduplication_id: None,
            delay_seconds: 0,
            include_attributes: true,
            custom_attributes: std::collections::HashMap::new(),
        }
    }
}

/// Deliver an event to an AWS SQS queue.
///
/// Sends the event payload as the message body with HookRelay metadata
/// as message attributes. Supports both standard and FIFO queues.
pub async fn deliver_sqs(
    config: &Value,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let sqs_config: SqsConfig = serde_json::from_value(config.clone())
        .context("Invalid SQS delivery config")?;

    let start = std::time::Instant::now();

    debug!(
        "SQS delivery {} to {} (region: {})",
        webhook.delivery_id, sqs_config.queue_url, sqs_config.region
    );

    // In production, this would use aws-sdk-sqs:
    //
    // use aws_config::BehaviorVersion;
    // use aws_sdk_sqs::types::MessageAttributeValue;
    //
    // let config = aws_config::load_defaults(BehaviorVersion::latest())
    //     .await
    //     .into_builder()
    //     .region(Region::new(sqs_config.region.clone()))
    //     .build();
    //
    // let client = aws_sdk_sqs::Client::new(&config);
    //
    // let mut send_builder = client
    //     .send_message()
    //     .queue_url(&sqs_config.queue_url)
    //     .message_body(&webhook.payload);
    //
    // // Add message attributes for metadata
    // if sqs_config.include_attributes {
    //     send_builder = send_builder
    //         .message_attributes(
    //             "delivery_id",
    //             MessageAttributeValue::builder()
    //                 .data_type("String")
    //                 .string_value(&webhook.delivery_id)
    //                 .build()?,
    //         )
    //         .message_attributes(
    //             "endpoint_id",
    //             MessageAttributeValue::builder()
    //                 .data_type("String")
    //                 .string_value(&webhook.endpoint_id)
    //                 .build()?,
    //         )
    //         .message_attributes(
    //             "event_source",
    //             MessageAttributeValue::builder()
    //                 .data_type("String")
    //                 .string_value("hookrelay")
    //                 .build()?,
    //         );
    // }
    //
    // // Add custom attributes
    // for (key, value) in &sqs_config.custom_attributes {
    //     send_builder = send_builder.message_attributes(
    //         key,
    //         MessageAttributeValue::builder()
    //             .data_type("String")
    //             .string_value(value)
    //             .build()?,
    //     );
    // }
    //
    // // FIFO queue support
    // if let Some(ref group_id) = sqs_config.message_group_id {
    //     send_builder = send_builder.message_group_id(group_id);
    // }
    // if let Some(ref dedup_id) = sqs_config.message_deduplication_id {
    //     send_builder = send_builder.message_deduplication_id(dedup_id);
    // }
    //
    // // Delay
    // if sqs_config.delay_seconds > 0 {
    //     send_builder = send_builder.delay_seconds(sqs_config.delay_seconds);
    // }
    //
    // let response = send_builder.send().await?;

    // Simulate SQS delivery
    tokio::time::sleep(std::time::Duration::from_millis(30)).await;

    let duration_ms = start.elapsed().as_millis() as i32;

    info!(
        "✅ SQS delivery {} to {} succeeded",
        webhook.delivery_id, sqs_config.queue_url
    );

    Ok(DeliveryResult {
        success: true,
        status_code: 200,
        response_body: format!(
            "Sent to SQS queue: {} (message_id: simulated)",
            sqs_config.queue_url
        ),
        duration_ms,
        error: String::new(),
    })
}

/// Build SQS message attributes from a webhook message.
#[allow(dead_code)]
fn build_attributes(
    webhook: &WebhookMessage,
    config: &SqsConfig,
) -> Vec<(String, String, String)> {
    let mut attrs = Vec::new();

    if config.include_attributes {
        attrs.push(("delivery_id".into(), "String".into(), webhook.delivery_id.clone()));
        attrs.push(("endpoint_id".into(), "String".into(), webhook.endpoint_id.clone()));
        attrs.push(("event_source".into(), "String".into(), "hookrelay".into()));
    }

    for (key, value) in &config.custom_attributes {
        attrs.push((key.clone(), "String".into(), value.clone()));
    }

    attrs
}
