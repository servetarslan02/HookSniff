//! WebSocket metrics for Prometheus/Grafana monitoring.

use prometheus::{IntCounter, IntGauge, Registry};

/// WebSocket connection metrics.
pub struct WsMetrics {
    pub active_connections: IntGauge,
    pub total_connections: IntCounter,
    pub messages_sent: IntCounter,
    pub messages_received: IntCounter,
    pub connection_errors: IntCounter,
    pub evictions: IntCounter,
}

impl WsMetrics {
    pub fn new(registry: &Registry) -> Self {
        let metrics = Self {
            active_connections: IntGauge::new(
                "ws_active_connections",
                "Active WebSocket connections",
            )
            .expect("valid metric name"),
            total_connections: IntCounter::new(
                "ws_total_connections_total",
                "Total WebSocket connections established",
            )
            .expect("valid metric name"),
            messages_sent: IntCounter::new(
                "ws_messages_sent_total",
                "Total WebSocket messages sent to clients",
            )
            .expect("valid metric name"),
            messages_received: IntCounter::new(
                "ws_messages_received_total",
                "Total WebSocket messages received from clients",
            )
            .expect("valid metric name"),
            connection_errors: IntCounter::new(
                "ws_connection_errors_total",
                "Total WebSocket connection errors",
            )
            .expect("valid metric name"),
            evictions: IntCounter::new(
                "ws_evictions_total",
                "Total WebSocket connection evictions (limit reached)",
            )
            .expect("valid metric name"),
        };

        registry
            .register(Box::new(metrics.active_connections.clone()))
            .expect("register ws_active_connections");
        registry
            .register(Box::new(metrics.total_connections.clone()))
            .expect("register ws_total_connections_total");
        registry
            .register(Box::new(metrics.messages_sent.clone()))
            .expect("register ws_messages_sent_total");
        registry
            .register(Box::new(metrics.messages_received.clone()))
            .expect("register ws_messages_received_total");
        registry
            .register(Box::new(metrics.connection_errors.clone()))
            .expect("register ws_connection_errors_total");
        registry
            .register(Box::new(metrics.evictions.clone()))
            .expect("register ws_evictions_total");

        metrics
    }
}
