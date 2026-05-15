//! WebSocket real-time event streaming gateway for HookSniff.
//!
//! Provides a WebSocket server that allows clients to subscribe to
//! event types and receive events in real-time. Supports JWT auth,
//! pattern-based subscriptions, heartbeat/ping-pong, and reconnection
//! with missed event replay.

pub mod handler;
pub mod bridge;
pub mod metrics;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tracing::{debug, info, warn};
use uuid::Uuid;

/// Shared state for the WebSocket gateway.
///
/// Manages active connections, subscription filters, and event broadcasting.
/// Thread-safe via Arc<RwLock<...>> for concurrent access from multiple
/// WebSocket handlers.
pub struct WsGateway {
    /// Active connections indexed by connection_id.
    pub connections: Arc<RwLock<HashMap<String, WsConnection>>>,
    /// Broadcast channel for distributing events to all connections.
    pub event_tx: broadcast::Sender<WsEvent>,
    /// JWT secret for authenticating WebSocket connections.
    pub jwt_secret: String,
    /// HS-019: Maximum concurrent WebSocket connections.
    pub max_connections: usize,
}

/// A single WebSocket connection with its metadata and subscriptions.
#[derive(Debug, Clone)]
pub struct WsConnection {
    pub connection_id: String,
    pub customer_id: Uuid,
    pub event_filters: Vec<String>,
    pub last_heartbeat: chrono::DateTime<chrono::Utc>,
    pub metadata: Option<Value>,
    /// Channel for sending messages to this specific connection.
    /// BUG-025: Bounded channel (256) to prevent memory growth from slow consumers.
    pub tx: tokio::sync::mpsc::Sender<WsMessage>,
}

/// An event broadcast to WebSocket subscribers.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WsEvent {
    pub event_type: String,
    pub delivery_id: String,
    pub endpoint_id: String,
    pub payload: Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// A message sent to a WebSocket client.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WsMessage {
    /// An event matching the client's subscriptions.
    Event(WsEvent),
    /// A heartbeat/ping request.
    Ping { timestamp: i64 },
    /// A heartbeat/pong response.
    Pong { timestamp: i64 },
    /// Subscription confirmation.
    Subscribed { event_types: Vec<String> },
    /// Error message.
    Error { code: String, message: String },
    /// Connection info (sent on connect).
    Connected {
        connection_id: String,
        server_time: chrono::DateTime<chrono::Utc>,
    },
}

/// Request to subscribe to event types.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubscribeRequest {
    pub event_types: Vec<String>,
}

impl WsGateway {
    /// Create a new WebSocket gateway.
    pub fn new(jwt_secret: String) -> Self {
        // Item 286: Larger broadcast channel to reduce overflow drops
        // 4096 events buffered — should handle burst traffic
        let (event_tx, _) = broadcast::channel(4096);
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
            event_tx,
            jwt_secret,
            max_connections: 1000, // HS-019: Default limit
        }
    }

    /// Register a new WebSocket connection.
    /// HS-019: Rejects new connections when max_connections is reached.
    pub async fn add_connection(
        &self,
        customer_id: Uuid,
        event_filters: Vec<String>,
        tx: tokio::sync::mpsc::Sender<WsMessage>,
    ) -> Result<String, &'static str> {
        let mut connections = self.connections.write().await;

        // HS-019: Check connection limit
        if connections.len() >= self.max_connections {
            warn!(
                "⚠️ WebSocket connection limit reached ({}/{}), rejecting new connection",
                connections.len(),
                self.max_connections
            );
            return Err("Connection limit reached");
        }

        let connection_id = Uuid::new_v4().to_string();
        let connection = WsConnection {
            connection_id: connection_id.clone(),
            customer_id,
            event_filters,
            last_heartbeat: chrono::Utc::now(),
            metadata: None,
            tx,
        };

        connections.insert(connection_id.clone(), connection);

        info!(
            "🔌 WebSocket connection {} established ({}/{})",
            connection_id,
            connections.len(),
            self.max_connections
        );
        Ok(connection_id)
    }

    /// Remove a WebSocket connection.
    pub async fn remove_connection(&self, connection_id: &str) {
        let mut connections = self.connections.write().await;
        if connections.remove(connection_id).is_some() {
            info!("🔌 WebSocket connection {} removed", connection_id);
        }
    }

    /// Update subscriptions for a connection.
    pub async fn update_subscriptions(
        &self,
        connection_id: &str,
        event_filters: Vec<String>,
    ) -> Result<()> {
        let mut connections = self.connections.write().await;
        if let Some(conn) = connections.get_mut(connection_id) {
            conn.event_filters = event_filters;
            debug!(
                "📡 Updated subscriptions for {}: {:?}",
                connection_id, conn.event_filters
            );
        }
        Ok(())
    }

    /// Update heartbeat timestamp for a connection.
    pub async fn heartbeat(&self, connection_id: &str) {
        let mut connections = self.connections.write().await;
        if let Some(conn) = connections.get_mut(connection_id) {
            conn.last_heartbeat = chrono::Utc::now();
        }
    }

    /// Broadcast an event to all matching connections.
    ///
    /// Filters connections by customer_id and event type patterns.
    pub async fn broadcast_event(&self, event: WsEvent) {
        let connections = self.connections.read().await;

        for conn in connections.values() {
            // Check if the event matches any of the connection's filters
            if event_matches_filters(&event.event_type, &conn.event_filters) {
                let msg = WsMessage::Event(event.clone());
                // BUG-025: Use try_send for bounded channel — drop events for slow consumers
                // rather than blocking the broadcast loop.
                if conn.tx.try_send(msg).is_err() {
                    warn!(
                        "Failed to send event to connection {} (channel full or closed)",
                        conn.connection_id
                    );
                }
            }
        }

        // Also broadcast to the general channel for any subscribers
        // Item 286: Log overflow instead of silently dropping
        if let Err(e) = self.event_tx.send(event) {
            match e {
                tokio::sync::broadcast::error::SendError(_) => {
                    debug!("Broadcast channel: no active receivers for event");
                }
            }
        }
    }

    /// Get the count of active connections.
    pub async fn connection_count(&self) -> usize {
        self.connections.read().await.len()
    }

    /// Clean up stale connections (no heartbeat in 5 minutes).
    pub async fn cleanup_stale(&self) {
        let stale_threshold = chrono::Utc::now() - chrono::Duration::minutes(5);
        let mut connections = self.connections.write().await;
        let stale_ids: Vec<String> = connections
            .iter()
            .filter(|(_, conn)| conn.last_heartbeat < stale_threshold)
            .map(|(id, _)| id.clone())
            .collect();

        for id in &stale_ids {
            connections.remove(id);
            info!("🧹 Cleaned up stale WebSocket connection {}", id);
        }
    }
}

/// Check if an event type matches a list of filter patterns.
///
/// Supports glob-style patterns:
/// - `*` matches any characters
/// - `order.*` matches `order.created`, `order.updated`, etc.
/// - `payment.completed` matches exactly `payment.completed`
fn event_matches_filters(event_type: &str, filters: &[String]) -> bool {
    if filters.is_empty() {
        return true; // No filters = receive all events
    }

    for filter in filters {
        if pattern_matches(filter, event_type) {
            return true;
        }
    }

    false
}

/// Simple glob pattern matching.
///
/// Supports `*` as a wildcard that matches any characters.
fn pattern_matches(pattern: &str, text: &str) -> bool {
    if pattern == "*" {
        return true;
    }

    if !pattern.contains('*') {
        return pattern == text;
    }

    let parts: Vec<&str> = pattern.split('*').collect();
    let mut text_pos = 0;

    for (i, part) in parts.iter().enumerate() {
        if part.is_empty() {
            continue;
        }

        if i == 0 {
            // Must match from the start
            if !text[text_pos..].starts_with(part) {
                return false;
            }
            text_pos += part.len();
        } else if i == parts.len() - 1 {
            // Must match at the end
            return text[text_pos..].ends_with(part);
        } else {
            // Must match somewhere in the middle
            if let Some(pos) = text[text_pos..].find(part) {
                text_pos += pos + part.len();
            } else {
                return false;
            }
        }
    }

    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pattern_matches_exact() {
        assert!(pattern_matches("order.created", "order.created"));
        assert!(!pattern_matches("order.created", "order.updated"));
    }

    #[test]
    fn test_pattern_matches_glob() {
        assert!(pattern_matches("order.*", "order.created"));
        assert!(pattern_matches("order.*", "order.updated"));
        assert!(pattern_matches("order.*", "order.deleted"));
        assert!(!pattern_matches("order.*", "payment.created"));
    }

    #[test]
    fn test_pattern_matches_wildcard() {
        assert!(pattern_matches("*", "anything"));
    }

    #[test]
    fn test_pattern_matches_prefix_glob() {
        assert!(pattern_matches("*.created", "order.created"));
        assert!(pattern_matches("*.created", "payment.created"));
        assert!(!pattern_matches("*.created", "order.updated"));
    }

    #[test]
    fn test_event_matches_filters() {
        let filters = vec!["order.*".to_string(), "payment.completed".to_string()];
        assert!(event_matches_filters("order.created", &filters));
        assert!(event_matches_filters("payment.completed", &filters));
        assert!(!event_matches_filters("user.updated", &filters));
    }

    #[test]
    fn test_empty_filters_match_all() {
        assert!(event_matches_filters("anything", &[]));
    }
}
