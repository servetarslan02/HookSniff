//! CloudEvents module for HookRelay.
//!
//! Provides CloudEvents v1.0 support and an event type registry
//! with the naming convention: `com.hookrelay.<category>.<action>`

pub mod cloudevents;

pub use cloudevents::CloudEvent;

/// Event type registry with naming convention: `com.hookrelay.<category>.<action>`
///
/// All HookRelay internal events follow this convention for consistency
/// and interoperability with CloudEvents-compatible systems.
pub mod event_types {
    // ── Delivery events ────────────────────────────────────────────────
    /// A webhook delivery was completed successfully.
    pub const DELIVERY_COMPLETED: &str = "com.hookrelay.delivery.completed";
    /// A webhook delivery failed.
    pub const DELIVERY_FAILED: &str = "com.hookrelay.delivery.failed";
    /// A webhook delivery is pending.
    pub const DELIVERY_PENDING: &str = "com.hookrelay.delivery.pending";
    /// A webhook delivery was retried.
    pub const DELIVERY_RETRIED: &str = "com.hookrelay.delivery.retried";
    /// A webhook delivery was sent to dead letter queue.
    pub const DELIVERY_DEADLETTERED: &str = "com.hookrelay.delivery.deadlettered";

    // ── Endpoint events ────────────────────────────────────────────────
    /// An endpoint was created.
    pub const ENDPOINT_CREATED: &str = "com.hookrelay.endpoint.created";
    /// An endpoint was updated.
    pub const ENDPOINT_UPDATED: &str = "com.hookrelay.endpoint.updated";
    /// An endpoint was deleted.
    pub const ENDPOINT_DELETED: &str = "com.hookrelay.endpoint.deleted";
    /// An endpoint was enabled.
    pub const ENDPOINT_ENABLED: &str = "com.hookrelay.endpoint.enabled";
    /// An endpoint was disabled.
    pub const ENDPOINT_DISABLED: &str = "com.hookrelay.endpoint.disabled";

    // ── Security events ────────────────────────────────────────────────
    /// A signature verification failed.
    pub const SECURITY_SIGNATURE_FAILED: &str = "com.hookrelay.security.signature_failed";
    /// A replay attack was detected.
    pub const SECURITY_REPLAY_DETECTED: &str = "com.hookrelay.security.replay_detected";
    /// An IP was blocked.
    pub const SECURITY_IP_BLOCKED: &str = "com.hookrelay.security.ip_blocked";

    // ── System events ──────────────────────────────────────────────────
    /// System health check completed.
    pub const SYSTEM_HEALTH_CHECK: &str = "com.hookrelay.system.health_check";
    /// Rate limit was exceeded.
    pub const SYSTEM_RATE_LIMITED: &str = "com.hookrelay.system.rate_limited";

    /// Get all registered event types.
    pub fn all() -> Vec<&'static str> {
        vec![
            DELIVERY_COMPLETED,
            DELIVERY_FAILED,
            DELIVERY_PENDING,
            DELIVERY_RETRIED,
            DELIVERY_DEADLETTERED,
            ENDPOINT_CREATED,
            ENDPOINT_UPDATED,
            ENDPOINT_DELETED,
            ENDPOINT_ENABLED,
            ENDPOINT_DISABLED,
            SECURITY_SIGNATURE_FAILED,
            SECURITY_REPLAY_DETECTED,
            SECURITY_IP_BLOCKED,
            SYSTEM_HEALTH_CHECK,
            SYSTEM_RATE_LIMITED,
        ]
    }

    /// Check if an event type follows the HookRelay naming convention.
    pub fn is_valid_hookrelay_event(event_type: &str) -> bool {
        event_type.starts_with("com.hookrelay.")
    }

    /// Extract the category from a HookRelay event type.
    /// Returns `None` if the event doesn't follow the convention.
    pub fn category(event_type: &str) -> Option<&str> {
        let rest = event_type.strip_prefix("com.hookrelay.")?;
        rest.split('.').next()
    }

    /// Extract the action from a HookRelay event type.
    /// Returns `None` if the event doesn't follow the convention.
    pub fn action(event_type: &str) -> Option<&str> {
        let rest = event_type.strip_prefix("com.hookrelay.")?;
        rest.split('.').nth(1)
    }
}

/// Create a CloudEvent for a delivery event.
pub fn delivery_event(
    event_type: &str,
    delivery_id: &str,
    endpoint_id: &str,
    data: serde_json::Value,
) -> CloudEvent {
    CloudEvent::from_delivery(event_type, delivery_id, endpoint_id, data)
}

/// Create a CloudEvent for an endpoint event.
pub fn endpoint_event(
    event_type: &str,
    endpoint_id: &str,
    data: serde_json::Value,
) -> CloudEvent {
    let mut ce = CloudEvent::new(event_type, "https://api.hookrelay.is-a.dev", Some(data));
    ce.subject = Some(endpoint_id.to_string());
    ce
}

/// Create a CloudEvent for a security event.
pub fn security_event(
    event_type: &str,
    data: serde_json::Value,
) -> CloudEvent {
    CloudEvent::new(event_type, "https://api.hookrelay.is-a.dev/security", Some(data))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_type_registry() {
        let all = event_types::all();
        assert!(!all.is_empty());
        for et in &all {
            assert!(et.starts_with("com.hookrelay."));
        }
    }

    #[test]
    fn test_event_type_naming_convention() {
        assert!(event_types::is_valid_hookrelay_event("com.hookrelay.delivery.completed"));
        assert!(!event_types::is_valid_hookrelay_event("delivery.completed"));
        assert!(!event_types::is_valid_hookrelay_event("com.other.event"));
    }

    #[test]
    fn test_event_type_category() {
        assert_eq!(
            event_types::category("com.hookrelay.delivery.completed"),
            Some("delivery")
        );
        assert_eq!(
            event_types::category("com.hookrelay.endpoint.created"),
            Some("endpoint")
        );
        assert_eq!(event_types::category("random.event"), None);
    }

    #[test]
    fn test_event_type_action() {
        assert_eq!(
            event_types::action("com.hookrelay.delivery.completed"),
            Some("completed")
        );
        assert_eq!(
            event_types::action("com.hookrelay.endpoint.created"),
            Some("created")
        );
    }

    #[test]
    fn test_delivery_event_creation() {
        let ce = delivery_event(
            event_types::DELIVERY_COMPLETED,
            "del_123",
            "ep_456",
            serde_json::json!({"status": "success"}),
        );
        assert_eq!(ce.event_type, event_types::DELIVERY_COMPLETED);
        assert_eq!(ce.id, "del_123");
        assert_eq!(ce.subject, Some("ep_456".to_string()));
    }

    #[test]
    fn test_endpoint_event_creation() {
        let ce = endpoint_event(
            event_types::ENDPOINT_CREATED,
            "ep_789",
            serde_json::json!({"url": "https://example.com"}),
        );
        assert_eq!(ce.event_type, event_types::ENDPOINT_CREATED);
        assert_eq!(ce.subject, Some("ep_789".to_string()));
    }
}
