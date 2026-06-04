//! Bridge between EventPublisher and WsGateway.
//!
//! Subscribes to the EventPublisher's local broadcast channel
//! and forwards events to all connected WebSocket clients via WsGateway.

use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{info, warn};

use crate::events::{EventEnvelope, EventPublisher};
use super::{WsGateway, WsEvent};

/// Bridges EventPublisher → WsGateway.
///
/// Spawns a background task that listens for events from the publisher
/// and broadcasts them to all WebSocket connections.
pub struct EventBridge {
    _handle: tokio::task::JoinHandle<()>,
}

impl EventBridge {
    /// Start the bridge. Runs in a background task until shutdown.
    pub fn start(publisher: EventPublisher, gateway: Arc<WsGateway>) -> Self {
        let handle = tokio::spawn(async move {
            let mut rx = publisher.subscribe();
            info!("🌉 Event bridge started (EventPublisher → WsGateway)");

            loop {
                match rx.recv().await {
                    Ok(envelope) => {
                        let ws_event = convert_to_ws_event(&envelope);
                        gateway.broadcast_event(ws_event).await;
                    }
                    Err(broadcast::error::RecvError::Lagged(n)) => {
                        warn!("Event bridge lagged, skipped {} events", n);
                    }
                    Err(broadcast::error::RecvError::Closed) => {
                        info!("Event bridge: publisher channel closed, stopping");
                        break;
                    }
                }
            }
        });

        Self { _handle: handle }
    }
}

/// Convert an EventEnvelope to a WsEvent for WebSocket broadcasting.
fn convert_to_ws_event(envelope: &EventEnvelope) -> WsEvent {
    let (event_type, delivery_id, endpoint_id, payload) = match &envelope.event {
        crate::events::AppEvent::DeliveryCreated {
            delivery_id,
            endpoint_id,
            customer_id,
            event_type,
        } => (
            "delivery.created".to_string(),
            delivery_id.to_string(),
            endpoint_id.to_string(),
            serde_json::json!({
                "customer_id": customer_id,
                "event_type": event_type,
            }),
        ),
        crate::events::AppEvent::DeliveryStatusChanged {
            delivery_id,
            customer_id,
            old_status,
            new_status,
        } => (
            "delivery.status_changed".to_string(),
            delivery_id.to_string(),
            String::new(),
            serde_json::json!({
                "customer_id": customer_id,
                "old_status": old_status,
                "new_status": new_status,
            }),
        ),
        crate::events::AppEvent::QueueUpdated {
            pending,
            processing,
            failed,
        } => (
            "queue.updated".to_string(),
            String::new(),
            String::new(),
            serde_json::json!({
                "pending": pending,
                "processing": processing,
                "failed": failed,
            }),
        ),
        crate::events::AppEvent::UserCreated {
            user_id,
            email,
            plan,
        } => (
            "user.created".to_string(),
            String::new(),
            String::new(),
            serde_json::json!({
                "user_id": user_id,
                "email": email,
                "plan": plan,
            }),
        ),
        crate::events::AppEvent::EndpointCreated {
            endpoint_id,
            customer_id,
            url,
        } => (
            "endpoint.created".to_string(),
            String::new(),
            endpoint_id.to_string(),
            serde_json::json!({
                "customer_id": customer_id,
                "url": url,
            }),
        ),
        crate::events::AppEvent::EndpointUpdated {
            endpoint_id,
            customer_id,
        } => (
            "endpoint.updated".to_string(),
            String::new(),
            endpoint_id.to_string(),
            serde_json::json!({
                "customer_id": customer_id,
            }),
        ),
        crate::events::AppEvent::EndpointDeleted {
            endpoint_id,
            customer_id,
        } => (
            "endpoint.deleted".to_string(),
            String::new(),
            endpoint_id.to_string(),
            serde_json::json!({
                "customer_id": customer_id,
            }),
        ),
        crate::events::AppEvent::EndpointStatusChanged {
            endpoint_id,
            customer_id,
            is_active,
        } => (
            "endpoint.status_changed".to_string(),
            String::new(),
            endpoint_id.to_string(),
            serde_json::json!({
                "customer_id": customer_id,
                "is_active": is_active,
            }),
        ),
        crate::events::AppEvent::AlertTriggered {
            alert_id,
            customer_id,
            name,
            condition,
        } => (
            "alert.triggered".to_string(),
            String::new(),
            String::new(),
            serde_json::json!({
                "alert_id": alert_id,
                "customer_id": customer_id,
                "name": name,
                "condition": condition,
            }),
        ),
        crate::events::AppEvent::ApplicationCreated {
            application_id,
            customer_id,
            name,
        } => (
            "application.created".to_string(),
            String::new(),
            String::new(),
            serde_json::json!({
                "application_id": application_id,
                "customer_id": customer_id,
                "name": name,
            }),
        ),
        crate::events::AppEvent::ApplicationUpdated {
            application_id,
            customer_id,
        } => (
            "application.updated".to_string(),
            String::new(),
            String::new(),
            serde_json::json!({
                "application_id": application_id,
                "customer_id": customer_id,
            }),
        ),
        crate::events::AppEvent::ApplicationDeleted {
            application_id,
            customer_id,
        } => (
            "application.deleted".to_string(),
            String::new(),
            String::new(),
            serde_json::json!({
                "application_id": application_id,
                "customer_id": customer_id,
            }),
        ),
    };

    WsEvent {
        event_type,
        delivery_id,
        endpoint_id,
        payload,
        timestamp: chrono::DateTime::from_timestamp_millis(envelope.ts)
            .unwrap_or_else(chrono::Utc::now),
    }
}
