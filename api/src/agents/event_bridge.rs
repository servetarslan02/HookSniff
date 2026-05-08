//! Agent Event → SSE Bridge
//!
//! Agent event'leri DB'ye yazildiginda, mevcut SSE stream otomatik olarak
//! yeni event'leri 2 saniye icinde gosterir.
//!
//! Ekstra bir broadcast mekanizmasi gereksiz — SSE zaten DB'den okuyor.

use uuid::Uuid;

/// Agent event bilgisi (SSE icin hazir format)
pub fn format_agent_event_for_sse(
    agent_id: Uuid,
    event_type: &str,
    direction: &str,
) -> String {
    format!("agent.{}.{}", direction, event_type)
}
