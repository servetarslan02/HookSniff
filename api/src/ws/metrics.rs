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
            .unwrap(),
            total_connections: IntCounter::new(
                "ws_total_connections_total",
                "Total WebSocket connections established",
            )
            .unwrap(),
            messages_sent: IntCounter::new(
                "ws_messages_sent_total",
                "Total WebSocket messages sent to clients",
            )
            .unwrap(),
            messages_received: IntCounter::new(
                "ws_messages_received_total",
                "Total WebSocket messages received from clients",
            )
            .unwrap(),
            connection_errors: IntCounter::new(
                "ws_connection_errors_total",
                "Total WebSocket connection errors",
            )
            .unwrap(),
            evictions: IntCounter::new(
                "ws_evictions_total",
                "Total WebSocket connection evictions (limit reached)",
            )
            .unwrap(),
        };

        registry
            .register(Box::new(metrics.active_connections.clone()))
            .unwrap();
        registry
            .register(Box::new(metrics.total_connections.clone()))
            .unwrap();
        registry
            .register(Box::new(metrics.messages_sent.clone()))
            .unwrap();
        registry
            .register(Box::new(metrics.messages_received.clone()))
            .unwrap();
        registry
            .register(Box::new(metrics.connection_errors.clone()))
            .unwrap();
        registry
            .register(Box::new(metrics.evictions.clone()))
            .unwrap();

        metrics
    }
}
