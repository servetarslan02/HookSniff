//! Agent Event → WebSocket Bridge
//!
//! Agent event'lerini mevcut WebSocket gateway'ye broadcast eder.
//! Dashboard'da real-time güncelleme sağlar.

use crate::ws::{WsEvent, WsGateway};
use uuid::Uuid;

/// Agent event'ini WebSocket gateway'ye broadcast et.
/// Dashboard'daki agent monitoring sayfası real-time güncellenir.
pub fn broadcast_agent_event(
    ws: &WsGateway,
    agent_id: Uuid,
    event_type: &str,
    payload: &serde_json::Value,
    direction: &str,
) {
    let ws_event = WsEvent {
        event_type: format!("agent.{}.{}", direction, event_type),
        delivery_id: agent_id.to_string(),
        endpoint_id: agent_id.to_string(),
        payload: serde_json::json!({
            "agent_id": agent_id,
            "event_type": event_type,
            "direction": direction,
            "data": payload,
        }),
        timestamp: chrono::Utc::now(),
    };

    // Non-blocking broadcast
    let _ = ws.event_tx.send(ws_event);
}
