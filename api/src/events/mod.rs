//! CloudEvents module for HookSniff.
//!
//! Provides CloudEvents v1.0 support and an event type registry
//! with the naming convention: `com.hooksniff.<category>.<action>`

pub mod cloudevents;

pub use cloudevents::CloudEvent;

/// Event type registry with naming convention: `com.hooksniff.<category>.<action>`
///
/// All HookSniff internal events follow this convention for consistency
/// and interoperability with CloudEvents-compatible systems.
pub mod event_types {
    // ── Delivery events ────────────────────────────────────────────────
    /// A webhook delivery was completed successfully.
    pub const DELIVERY_COMPLETED: &str = "com.hooksniff.delivery.completed";
    /// A webhook delivery failed.
    pub const DELIVERY_FAILED: &str = "com.hooksniff.delivery.failed";
    /// A webhook delivery is pending.
    pub const DELIVERY_PENDING: &str = "com.hooksniff.delivery.pending";
    /// A webhook delivery was retried.
    pub const DELIVERY_RETRIED: &str = "com.hooksniff.delivery.retried";
    /// A webhook delivery was sent to dead letter queue.
    pub const DELIVERY_DEADLETTERED: &str = "com.hooksniff.delivery.deadlettered";

    // ── Endpoint events ────────────────────────────────────────────────
    /// An endpoint was created.
    pub const ENDPOINT_CREATED: &str = "com.hooksniff.endpoint.created";
    /// An endpoint was updated.
    pub const ENDPOINT_UPDATED: &str = "com.hooksniff.endpoint.updated";
    /// An endpoint was deleted.
    pub const ENDPOINT_DELETED: &str = "com.hooksniff.endpoint.deleted";
    /// An endpoint was enabled.
    pub const ENDPOINT_ENABLED: &str = "com.hooksniff.endpoint.enabled";
    /// An endpoint was disabled.
    pub const ENDPOINT_DISABLED: &str = "com.hooksniff.endpoint.disabled";

    // ── Security events ────────────────────────────────────────────────
    /// A signature verification failed.
    pub const SECURITY_SIGNATURE_FAILED: &str = "com.hooksniff.security.signature_failed";
    /// A replay attack was detected.
    pub const SECURITY_REPLAY_DETECTED: &str = "com.hooksniff.security.replay_detected";
    /// An IP was blocked.
    pub const SECURITY_IP_BLOCKED: &str = "com.hooksniff.security.ip_blocked";

    // ── System events ──────────────────────────────────────────────────
    /// System health check completed.
    pub const SYSTEM_HEALTH_CHECK: &str = "com.hooksniff.system.health_check";
    /// Rate limit was exceeded.
    pub const SYSTEM_RATE_LIMITED: &str = "com.hooksniff.system.rate_limited";

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

    /// Check if an event type follows the HookSniff naming convention.
    pub fn is_valid_hooksniff_event(event_type: &str) -> bool {
        event_type.starts_with("com.hooksniff.")
    }

    /// Extract the category from a HookSniff event type.
    /// Returns `None` if the event doesn't follow the convention.
    pub fn category(event_type: &str) -> Option<&str> {
        let rest = event_type.strip_prefix("com.hooksniff.")?;
        rest.split('.').next()
    }

    /// Extract the action from a HookSniff event type.
    /// Returns `None` if the event doesn't follow the convention.
    pub fn action(event_type: &str) -> Option<&str> {
        let rest = event_type.strip_prefix("com.hooksniff.")?;
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
    let mut ce = CloudEvent::new(event_type, "https://api.hooksniff.is-a.dev", Some(data));
    ce.subject = Some(endpoint_id.to_string());
    ce
}

/// Create a CloudEvent for a security event.
pub fn security_event(
    event_type: &str,
    data: serde_json::Value,
) -> CloudEvent {
    CloudEvent::new(event_type, "https://api.hooksniff.is-a.dev/security", Some(data))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_type_registry() {
        let all = event_types::all();
        assert!(!all.is_empty());
        for et in &all {
            assert!(et.starts_with("com.hooksniff."));
        }
    }

    #[test]
    fn test_event_type_naming_convention() {
        assert!(event_types::is_valid_hooksniff_event("com.hooksniff.delivery.completed"));
        assert!(!event_types::is_valid_hooksniff_event("delivery.completed"));
        assert!(!event_types::is_valid_hooksniff_event("com.other.event"));
    }

    #[test]
    fn test_event_type_category() {
        assert_eq!(
            event_types::category("com.hooksniff.delivery.completed"),
            Some("delivery")
        );
        assert_eq!(
            event_types::category("com.hooksniff.endpoint.created"),
            Some("endpoint")
        );
        assert_eq!(event_types::category("random.event"), None);
    }

    #[test]
    fn test_event_type_action() {
        assert_eq!(
            event_types::action("com.hooksniff.delivery.completed"),
            Some("completed")
        );
        assert_eq!(
            event_types::action("com.hooksniff.endpoint.created"),
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
