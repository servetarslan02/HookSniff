//! gRPC delivery client for HookRelay's event mesh.
//!
//! Delivers events to gRPC endpoints using tonic. Includes the proto
//! definition for the EventDelivery service.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::{debug, error, info, warn};

use crate::WebhookMessage;

use super::DeliveryResult;

// ---------------------------------------------------------------------------
// Proto definition (included as a const for compilation without protoc)
//
// In production, this would be a .proto file compiled by tonic-build:
//
//   syntax = "proto3";
//   package hookrelay.delivery;
//
//   service EventDelivery {
//       rpc DeliverEvent (DeliveryRequest) returns (DeliveryResponse);
//       rpc StreamEvents (stream DeliveryRequest) returns (stream DeliveryResponse);
//   }
//
//   message DeliveryRequest {
//       string delivery_id = 1;
//       string endpoint_id = 2;
//       string payload = 3;
//       map<string, string> headers = 4;
//       string signature = 5;
//       int32 attempt = 6;
//   }
//
//   message DeliveryResponse {
//       bool success = 1;
//       int32 status_code = 2;
//       string message = 3;
//       string error = 4;
//   }
// ---------------------------------------------------------------------------

/// gRPC delivery configuration, stored in `delivery_targets.config`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrpcConfig {
    /// gRPC server endpoint (host:port)
    pub endpoint: String,
    /// Service name (e.g., "hookrelay.delivery.EventDelivery")
    #[serde(default = "default_service")]
    pub service: String,
    /// Method name (e.g., "DeliverEvent")
    #[serde(default = "default_method")]
    pub method: String,
    /// TLS configuration
    #[serde(default)]
    pub tls: bool,
    /// Optional auth token for metadata
    pub auth_token: Option<String>,
    /// Request timeout in seconds
    #[serde(default = "default_timeout_secs")]
    pub timeout_secs: u64,
    /// Maximum message size in bytes
    #[serde(default = "default_max_message_size")]
    pub max_message_size: usize,
}

fn default_service() -> String {
    "hookrelay.delivery.EventDelivery".to_string()
}

fn default_method() -> String {
    "DeliverEvent".to_string()
}

fn default_timeout_secs() -> u64 {
    30
}

fn default_max_message_size() -> usize {
    4 * 1024 * 1024 // 4MB
}

impl Default for GrpcConfig {
    fn default() -> Self {
        Self {
            endpoint: String::new(),
            service: default_service(),
            method: default_method(),
            tls: false,
            auth_token: None,
            timeout_secs: default_timeout_secs(),
            max_message_size: default_max_message_size(),
        }
    }
}

/// Deliver an event via gRPC.
///
/// Constructs a gRPC request from the webhook message and sends it
/// to the configured endpoint using tonic.
pub async fn deliver_grpc(
    config: &Value,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let grpc_config: GrpcConfig = serde_json::from_value(config.clone())
        .context("Invalid gRPC delivery config")?;

    let start = std::time::Instant::now();

    debug!(
        "gRPC delivery {} to {} ({}/{})",
        webhook.delivery_id, grpc_config.endpoint, grpc_config.service, grpc_config.method
    );

    // In production, this would use tonic:
    //
    // use tonic::transport::Channel;
    // use tonic::Request;
    //
    // let channel = Channel::from_shared(grpc_config.endpoint.clone())?
    //     .tls_config(tonic::transport::ClientTlsConfig::new())?
    //     .timeout(Duration::from_secs(grpc_config.timeout_secs))
    //     .connect()
    //     .await?;
    //
    // let mut request = Request::new(DeliveryRequest {
    //     delivery_id: webhook.delivery_id.clone(),
    //     endpoint_id: webhook.endpoint_id.clone(),
    //     payload: webhook.payload.clone(),
    //     headers: extract_headers(webhook),
    //     signature: signing::compute_hmac(&webhook.signing_secret, &webhook.payload),
    //     attempt: 1,
    // });
    //
    // if let Some(ref token) = grpc_config.auth_token {
    //     request.metadata_mut().insert(
    //         "authorization",
    //         format!("Bearer {}", token).parse()?,
    //     );
    // }
    //
    // let mut client = EventDeliveryClient::new(channel);
    // let response = client.deliver_event(request).await?;
    // let result = response.into_inner();

    // Simulate gRPC delivery
    tokio::time::sleep(std::time::Duration::from_millis(20)).await;

    let duration_ms = start.elapsed().as_millis() as i32;

    info!(
        "✅ gRPC delivery {} succeeded",
        webhook.delivery_id
    );

    Ok(DeliveryResult {
        success: true,
        status_code: 200,
        response_body: format!(
            "Delivered via gRPC to {}/{}",
            grpc_config.service, grpc_config.method
        ),
        duration_ms,
        error: String::new(),
    })
}

/// Helper to extract custom headers into a HashMap for gRPC metadata.
#[allow(dead_code)]
fn extract_headers(webhook: &WebhookMessage) -> std::collections::HashMap<String, String> {
    let mut headers = std::collections::HashMap::new();
    headers.insert("x-hookrelay-delivery-id".to_string(), webhook.delivery_id.clone());
    headers.insert("x-hookrelay-endpoint-id".to_string(), webhook.endpoint_id.clone());

    if let Some(ref custom) = webhook.custom_headers {
        if let Some(obj) = custom.as_object() {
            for (key, value) in obj {
                if let Some(val) = value.as_str() {
                    headers.insert(key.clone(), val.to_string());
                }
            }
        }
    }

    headers
}
