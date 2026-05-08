//! Agent Event → SSE/WS Bridge
//!
//! Agent event'leri DB'ye yazildiginda:
//! 1. Mevcut SSE stream 2 saniye icinde gosterir (DB polling)
//! 2. WS gateway'e broadcast yapilir (anlik bildirim)

use uuid::Uuid;

/// Agent event bilgisi (SSE icin hazir format)
pub fn format_agent_event_for_sse(
    agent_id: Uuid,
    event_type: &str,
    direction: &str,
) -> String {
    format!("agent.{}.{}.{}", agent_id, direction, event_type)
}

/// Agent event'ini WS gateway uzerinden broadcast et.
///
/// Mevcut WsGateway'in broadcast_event fonksiyonunu kullanarak
/// tum eslesen baglantilara gonderir.
pub async fn broadcast_agent_event(
    ws_gateway: &crate::ws::WsGateway,
    agent_id: Uuid,
    customer_id: Uuid,
    event_type: &str,
    payload: &serde_json::Value,
) {
    let ws_event = crate::ws::WsEvent {
        event_type: format!("agent.{}", event_type),
        delivery_id: Uuid::new_v4().to_string(),
        endpoint_id: agent_id.to_string(),
        payload: serde_json::json!({
            "agent_id": agent_id,
            "customer_id": customer_id,
            "event_type": event_type,
            "payload": payload,
            "timestamp": chrono::Utc::now().to_rfc3339(),
        }),
        timestamp: chrono::Utc::now(),
    };

    ws_gateway.broadcast_event(ws_event).await;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_agent_event_for_sse() {
        let agent_id = Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap();
        let result = format_agent_event_for_sse(agent_id, "order.created", "emit");
        assert_eq!(
            result,
            "agent.550e8400-e29b-41d4-a716-446655440000.emit.order.created"
        );
    }

    #[test]
    fn test_format_agent_event_receive() {
        let agent_id = Uuid::new_v4();
        let result = format_agent_event_for_sse(agent_id, "payment.received", "receive");
        assert!(result.contains("receive"));
        assert!(result.contains("payment.received"));
        assert!(result.contains(&agent_id.to_string()));
    }

    #[test]
    fn test_format_agent_event_different_types() {
        let agent_id = Uuid::new_v4();

        let emit = format_agent_event_for_sse(agent_id, "test.event", "emit");
        let receive = format_agent_event_for_sse(agent_id, "test.event", "receive");

        assert_ne!(emit, receive, "Emit ve receive formatlari farkli olmali");
    }

    #[test]
    fn test_format_agent_event_dotted_type() {
        let agent_id = Uuid::new_v4();
        let result = format_agent_event_for_sse(agent_id, "deeply.nested.event.type", "emit");
        assert!(result.contains("deeply.nested.event.type"));
    }

    #[test]
    fn test_format_agent_event_for_ws() {
        let agent_id = Uuid::new_v4();
        // WS formatinda "agent." prefix eklenmeli
        let event_type = "order.created";
        let ws_type = format!("agent.{}", event_type);
        assert_eq!(ws_type, "agent.order.created");
    }
}
