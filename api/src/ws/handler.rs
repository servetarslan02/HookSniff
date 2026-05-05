//! WebSocket connection handler for HookRelay's real-time gateway.
//!
//! Manages individual WebSocket connections: authentication, subscription
//! filtering, message serialization, heartbeat, and rate limiting.

use anyhow::{Context, Result};
use axum::extract::ws::{Message, WebSocket};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::mpsc;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

use super::{SubscribeRequest, WsEvent, WsGateway, WsMessage};

/// Rate limiter per WebSocket connection.
///
/// Limits the number of messages a client can receive per time window.
/// Prevents a single connection from consuming excessive bandwidth.
pub struct ConnectionRateLimiter {
    /// Maximum messages per window.
    max_messages: usize,
    /// Window duration in seconds.
    window_secs: u64,
    /// Timestamps of messages in the current window.
    timestamps: Vec<std::time::Instant>,
}

impl ConnectionRateLimiter {
    pub fn new(max_messages: usize, window_secs: u64) -> Self {
        Self {
            max_messages,
            window_secs,
            timestamps: Vec::new(),
        }
    }

    /// Check if a message is allowed under the rate limit.
    pub fn allow(&mut self) -> bool {
        let now = std::time::Instant::now();
        let window = std::time::Duration::from_secs(self.window_secs);

        // Remove expired timestamps
        self.timestamps
            .retain(|ts| now.duration_since(*ts) < window);

        if self.timestamps.len() < self.max_messages {
            self.timestamps.push(now);
            true
        } else {
            false
        }
    }
}

/// Configuration for a WebSocket handler.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WsHandlerConfig {
    /// Maximum messages per minute per connection.
    #[serde(default = "default_rate_limit")]
    pub rate_limit_per_minute: usize,
    /// Ping interval in seconds.
    #[serde(default = "default_ping_interval")]
    pub ping_interval_secs: u64,
    /// Pong timeout in seconds.
    #[serde(default = "default_pong_timeout")]
    pub pong_timeout_secs: u64,
    /// Maximum message size in bytes.
    #[serde(default = "default_max_message_size")]
    pub max_message_size: usize,
}

fn default_rate_limit() -> usize {
    100
}
fn default_ping_interval() -> u64 {
    30
}
fn default_pong_timeout() -> u64 {
    10
}
fn default_max_message_size() -> usize {
    64 * 1024 // 64KB
}

impl Default for WsHandlerConfig {
    fn default() -> Self {
        Self {
            rate_limit_per_minute: default_rate_limit(),
            ping_interval_secs: default_ping_interval(),
            pong_timeout_secs: default_pong_timeout(),
            max_message_size: default_max_message_size(),
        }
    }
}

/// Handle a single WebSocket connection.
///
/// This is the main handler that:
/// 1. Authenticates the client via JWT token
/// 2. Registers the connection with the gateway
/// 3. Processes incoming messages (subscribe, ping, etc.)
/// 4. Forwards matching events to the client
/// 5. Handles disconnects and cleanup
pub async fn handle_connection(
    socket: WebSocket,
    gateway: Arc<WsGateway>,
    customer_id: Uuid,
    initial_filters: Vec<String>,
    config: WsHandlerConfig,
) {
    let (mut ws_sender, mut ws_receiver) = socket.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<WsMessage>();

    // Register the connection
    let connection_id = gateway
        .add_connection(customer_id, initial_filters.clone(), tx)
        .await;

    // Send connection confirmation
    let connected_msg = WsMessage::Connected {
        connection_id: connection_id.clone(),
        server_time: chrono::Utc::now(),
    };
    if let Ok(json) = serde_json::to_string(&connected_msg) {
        let _ = ws_sender.send(Message::Text(json)).await;
    }

    // If initial filters were provided, send subscription confirmation
    if !initial_filters.is_empty() {
        let subscribed_msg = WsMessage::Subscribed {
            event_types: initial_filters,
        };
        if let Ok(json) = serde_json::to_string(&subscribed_msg) {
            let _ = ws_sender.send(Message::Text(json)).await;
        }
    }

    let mut rate_limiter = ConnectionRateLimiter::new(
        config.rate_limit_per_minute,
        60,
    );

    let conn_id_for_recv = connection_id.clone();
    let gw_for_recv = gateway.clone();
    let conn_id_for_fwd = connection_id.clone();
    let gw_for_fwd = gateway.clone();

    // Spawn a task to forward events from the gateway to the WebSocket
    let forward_handle = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            // Rate limiting
            if !rate_limiter.allow() {
                warn!(
                    "Rate limit exceeded for connection {}",
                    conn_id_for_fwd
                );
                continue;
            }

            // Serialize and send
            match serde_json::to_string(&msg) {
                Ok(json) => {
                    if ws_sender.send(Message::Text(json)).await.is_err() {
                        debug!("Connection {} closed during send", conn_id_for_fwd);
                        break;
                    }
                }
                Err(e) => {
                    error!("Failed to serialize message: {}", e);
                }
            }
        }
    });

    // Process incoming messages from the client
    let recv_handle = tokio::spawn(async move {
        while let Some(result) = ws_receiver.next().await {
            match result {
                Ok(Message::Text(text)) => {
                    handle_client_message(
                        &text,
                        &conn_id_for_recv,
                        &gw_for_recv,
                    )
                    .await;
                }
                Ok(Message::Ping(_)) => {
                    gw_for_recv.heartbeat(&conn_id_for_recv).await;
                }
                Ok(Message::Pong(_)) => {
                    gw_for_recv.heartbeat(&conn_id_for_recv).await;
                }
                Ok(Message::Close(_)) => {
                    info!("Connection {} closed by client", conn_id_for_recv);
                    break;
                }
                Err(e) => {
                    warn!("Connection {} error: {}", conn_id_for_recv, e);
                    break;
                }
                _ => {}
            }
        }
    });

    // Wait for either task to complete (connection closed)
    tokio::select! {
        _ = forward_handle => {},
        _ = recv_handle => {},
    }

    // Cleanup
    gateway.remove_connection(&connection_id).await;
    info!("🔌 WebSocket handler for {} finished", connection_id);
}

/// Handle a message from a WebSocket client.
async fn handle_client_message(
    text: &str,
    connection_id: &str,
    gateway: &Arc<WsGateway>,
) {
    // Try to parse as a client message
    let Ok(msg) = serde_json::from_str::<ClientMessage>(text) else {
        warn!("Invalid message from connection {}: {}", connection_id, text);
        return;
    };

    match msg {
        ClientMessage::Subscribe { event_types } => {
            info!(
                "📡 Connection {} subscribing to: {:?}",
                connection_id, event_types
            );
            if let Err(e) = gateway
                .update_subscriptions(connection_id, event_types.clone())
                .await
            {
                error!("Failed to update subscriptions: {}", e);
            }
        }
        ClientMessage::Unsubscribe { event_types } => {
            info!(
                "📡 Connection {} unsubscribing from: {:?}",
                connection_id, event_types
            );
            // Get current filters and remove the specified ones
            let connections = gateway.connections.read().await;
            if let Some(conn) = connections.get(connection_id) {
                let mut filters: Vec<String> = conn
                    .event_filters
                    .iter()
                    .filter(|f| !event_types.contains(f))
                    .cloned()
                    .collect();
                drop(connections);
                let _ = gateway
                    .update_subscriptions(connection_id, filters)
                    .await;
            }
        }
        ClientMessage::Ping => {
            gateway.heartbeat(connection_id).await;
        }
    }
}

/// Messages from a WebSocket client.
#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum ClientMessage {
    Subscribe { event_types: Vec<String> },
    Unsubscribe { event_types: Vec<String> },
    Ping,
}

/// Authenticate a WebSocket connection from a JWT token.
///
/// Extracts the customer_id from the token and validates it.
pub fn authenticate_ws_token(token: &str, jwt_secret: &str) -> Result<Uuid> {
    use jsonwebtoken::{decode, DecodingKey, Validation};

    #[derive(Debug, Deserialize)]
    struct Claims {
        sub: String,
        #[allow(dead_code)]
        exp: usize,
    }

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .context("Invalid JWT token")?;

    let customer_id = Uuid::parse_str(&token_data.claims.sub)
        .context("Invalid customer ID in token")?;

    Ok(customer_id)
}
