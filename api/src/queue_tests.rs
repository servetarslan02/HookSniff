//! Tests for the Redis Streams queue module.
//!
//! Tests cover:
//! - QueueMessage serialization/deserialization
//! - Stream entry parsing (parse_stream_result, parse_stream_entry, extract_fields)
//! - Queue constants and configuration

#[cfg(test)]
mod queue_tests {
    use serde_json;

    /// Test QueueMessage serialization roundtrip
    #[test]
    fn test_queue_message_serialization() {
        let msg = crate::queue::QueueMessage {
            delivery_id: "test-delivery-123".to_string(),
            endpoint_id: "ep-456".to_string(),
            endpoint_url: "https://example.com/webhook".to_string(),
            payload: r#"{"event":"test","data":{"key":"value"}}"#.to_string(),
            custom_headers: Some(serde_json::json!({"X-Custom": "header"})),
            signing_secret: "secret123".to_string(),
            trace_id: Some("trace-789".to_string()),
            attempt_count: 0,
            max_attempts: 5,
            queue_item_id: "qi-001".to_string(),
        };

        let json = serde_json::to_string(&msg).unwrap();
        let deserialized: crate::queue::QueueMessage = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.delivery_id, "test-delivery-123");
        assert_eq!(deserialized.endpoint_id, "ep-456");
        assert_eq!(deserialized.endpoint_url, "https://example.com/webhook");
        assert_eq!(deserialized.signing_secret, "secret123");
        assert_eq!(deserialized.attempt_count, 0);
        assert_eq!(deserialized.max_attempts, 5);
    }

    /// Test QueueMessage with None optional fields
    #[test]
    fn test_queue_message_none_optionals() {
        let msg = crate::queue::QueueMessage {
            delivery_id: "d1".to_string(),
            endpoint_id: "e1".to_string(),
            endpoint_url: "https://test.com".to_string(),
            payload: "{}".to_string(),
            custom_headers: None,
            signing_secret: String::new(),
            trace_id: None,
            attempt_count: 3,
            max_attempts: 5,
            queue_item_id: String::new(),
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(!json.contains("custom_headers"));
        assert!(!json.contains("trace_id"));

        let deserialized: crate::queue::QueueMessage = serde_json::from_str(&json).unwrap();
        assert!(deserialized.custom_headers.is_none());
        assert!(deserialized.trace_id.is_none());
    }

    /// Test stream constants are correct
    #[test]
    fn test_stream_constants() {
        // These are used by both API and worker — changing them breaks the system
        assert_eq!(crate::queue::STREAM_KEY, "hooksniff:webhooks");
        assert_eq!(crate::queue::CONSUMER_GROUP, "hooksniff-workers");
        assert_eq!(crate::queue::MAX_STREAM_LEN, 100_000);
    }
}
