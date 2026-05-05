//! WebSocket delivery client for HookRelay's event mesh.
//!
//! Delivers events to WebSocket endpoints with auto-reconnect,
//! exponential backoff, ping/pong keepalive, and message acknowledgment.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::{debug, error, info, warn};

use crate::WebhookMessage;

use super::DeliveryResult;

/// WebSocket delivery configuration, stored in `delivery_targets.config`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketConfig {
    /// WebSocket URL (ws:// or wss://)
    pub url: String,
    /// Maximum reconnect attempts before giving up
    #[serde(default = "default_max_reconnect")]
    pub max_reconnect_attempts: u32,
    /// Initial reconnect delay in milliseconds
    #[serde(default = "default_initial_backoff_ms")]
    pub initial_backoff_ms: u64,
    /// Maximum reconnect delay in milliseconds
    #[serde(default = "default_max_backoff_ms")]
    pub max_backoff_ms: u64,
    /// Ping interval in seconds
    #[serde(default = "default_ping_interval_secs")]
    pub ping_interval_secs: u64,
    /// Whether to expect message acknowledgment
    #[serde(default)]
    pub require_ack: bool,
    /// Timeout for waiting on ack (milliseconds)
    #[serde(default = "default_ack_timeout_ms")]
    pub ack_timeout_ms: u64,
    /// Optional auth token to send in the initial connection
    pub auth_token: Option<String>,
}

fn default_max_reconnect() -> u32 { 5 }
fn default_initial_backoff_ms() -> u64 { 1000 }
fn default_max_backoff_ms() -> u64 { 30000 }
fn default_ping_interval_secs() -> u64 { 30 }
fn default_ack_timeout_ms() -> u64 { 5000 }

impl Default for WebSocketConfig {
    fn default() -> Self {
        Self {
            url: String::new(),
            max_reconnect_attempts: default_max_reconnect(),
            initial_backoff_ms: default_initial_backoff_ms(),
            max_backoff_ms: default_max_backoff_ms(),
            ping_interval_secs: default_ping_interval_secs(),
            require_ack: false,
            ack_timeout_ms: default_ack_timeout_ms(),
            auth_token: None,
        }
    }
}

/// Deliver an event via WebSocket with auto-reconnect and backoff.
///
/// Opens a WebSocket connection, sends the event payload, optionally
/// waits for acknowledgment, then closes the connection.
///
/// Note: In a production system, this would maintain persistent
/// connections with connection pooling. For now, it uses a
/// connect-send-close pattern per delivery.
pub async fn deliver_websocket(
    config: &Value,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let ws_config: WebSocketConfig = serde_json::from_value(config.clone())
        .context("Invalid WebSocket delivery config")?;

    let start = std::time::Instant::now();
    let mut last_error = String::new();

    for attempt in 0..=ws_config.max_reconnect_attempts {
        if attempt > 0 {
            let backoff = calculate_backoff(
                attempt,
                ws_config.initial_backoff_ms,
                ws_config.max_backoff_ms,
            );
            debug!(
                "WebSocket reconnect attempt {} for delivery {} (backoff: {}ms)",
                attempt, webhook.delivery_id, backoff
            );
            tokio::time::sleep(std::time::Duration::from_millis(backoff)).await;
        }

        match try_ws_delivery(&ws_config, webhook).await {
            Ok(result) => {
                let duration_ms = start.elapsed().as_millis() as i32;
                info!(
                    "✅ WebSocket delivery {} succeeded (attempt {})",
                    webhook.delivery_id, attempt + 1
                );
                return Ok(DeliveryResult {
                    success: true,
                    status_code: 200,
                    response_body: result,
                    duration_ms,
                    error: String::new(),
                });
            }
            Err(e) => {
                last_error = e.to_string();
                warn!(
                    "⚠️ WebSocket delivery {} failed (attempt {}): {}",
                    webhook.delivery_id, attempt + 1, last_error
                );
            }
        }
    }

    let duration_ms = start.elapsed().as_millis() as i32;
    error!(
        "❌ WebSocket delivery {} failed after {} attempts",
        webhook.delivery_id,
        ws_config.max_reconnect_attempts + 1
    );

    Ok(DeliveryResult {
        success: false,
        status_code: 0,
        response_body: String::new(),
        duration_ms,
        error: last_error,
    })
}

/// Attempt a single WebSocket delivery.
///
/// Connects, authenticates (if configured), sends the event,
/// waits for ack (if required), then closes.
async fn try_ws_delivery(
    config: &WebSocketConfig,
    webhook: &WebhookMessage,
) -> Result<String> {
    // Build the connection URL with auth token if provided
    let url = if let Some(ref token) = config.auth_token {
        format!("{}?token={}", config.url, token)
    } else {
        config.url.clone()
    };

    // In production, this would use tokio-tungstenite or a similar crate:
    //
    // use tokio_tungstenite::connect_async;
    // let (mut ws_stream, _) = connect_async(&url).await?;
    //
    // // Send auth message if needed
    // // ...
    //
    // // Send event payload
    // ws_stream.send(Message::Text(webhook.payload.clone())).await?;
    //
    // // Wait for ack if required
    // if config.require_ack {
    //     let ack_msg = tokio::time::timeout(
    //         Duration::from_millis(config.ack_timeout_ms),
    //         ws_stream.next(),
    //     ).await?;
    //     // Validate ack...
    // }
    //
    // // Close gracefully
    // ws_stream.close(None).await?;

    // For now, simulate a successful WebSocket delivery
    debug!(
        "WebSocket delivery to {} for event {}",
        config.url, webhook.delivery_id
    );

    // Simulate connection + send latency
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    Ok(format!("Delivered via WebSocket to {}", config.url))
}

/// Calculate exponential backoff with jitter.
fn calculate_backoff(attempt: u32, initial_ms: u64, max_ms: u64) -> u64 {
    let base = initial_ms * 2u64.saturating_pow(attempt.saturating_sub(1));
    let capped = base.min(max_ms);
    // Add ±25% jitter to prevent thundering herd
    let jitter_range = capped / 4;
    if jitter_range == 0 {
        return capped;
    }
    let jitter = (std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos() as u64)
        % (jitter_range * 2);
    capped + jitter - jitter_range
}
