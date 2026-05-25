#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn test_fifo_status_roundtrip() {
        let statuses = vec![
            FifoStatus::Pending,
            FifoStatus::Processing,
            FifoStatus::Delivered,
            FifoStatus::Failed,
            FifoStatus::DeadLettered,
            FifoStatus::TimedOut,
        ];

        for status in statuses {
            let s = status.as_str();
            let back = FifoStatus::parse_str(s);
            assert_eq!(status, back, "Roundtrip failed for {:?}", s);
        }
    }

    #[test]
    fn test_fifo_config_default() {
        let cfg = FifoConfig::default();
        assert!(!cfg.enabled);
        assert!(!cfg.group_by_customer);
        assert_eq!(cfg.max_wait_secs, 300);
    }

    #[test]
    fn test_enqueue_result_serialization() {
        let result = EnqueueResult {
            queue_item_id: Uuid::new_v4(),
            sequence_num: 42,
            is_head: true,
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"sequence_num\":42"));
        assert!(json.contains("\"is_head\":true"));
    }

    #[test]
    fn test_fifo_status_as_str_values() {
        assert_eq!(FifoStatus::Pending.as_str(), "pending");
        assert_eq!(FifoStatus::Processing.as_str(), "processing");
        assert_eq!(FifoStatus::Delivered.as_str(), "delivered");
        assert_eq!(FifoStatus::Failed.as_str(), "failed");
        assert_eq!(FifoStatus::DeadLettered.as_str(), "dead_lettered");
        assert_eq!(FifoStatus::TimedOut.as_str(), "timed_out");
    }

    #[test]
    fn test_fifo_status_parse_unknown_defaults_to_pending() {
        assert_eq!(FifoStatus::parse_str("unknown"), FifoStatus::Pending);
        assert_eq!(FifoStatus::parse_str(""), FifoStatus::Pending);
        assert_eq!(FifoStatus::parse_str("PENDING"), FifoStatus::Pending);
    }

    #[test]
    fn test_fifo_status_serde_roundtrip() {
        let statuses = vec![
            FifoStatus::Pending,
            FifoStatus::Processing,
            FifoStatus::Delivered,
            FifoStatus::Failed,
            FifoStatus::DeadLettered,
            FifoStatus::TimedOut,
        ];
        for status in statuses {
            let json = serde_json::to_string(&status).unwrap();
            let back: FifoStatus = serde_json::from_str(&json).unwrap();
            assert_eq!(status, back);
        }
    }

    #[test]
    fn test_fifo_status_deserialize_from_string() {
        let status: FifoStatus = serde_json::from_str("\"dead_lettered\"").unwrap();
        assert_eq!(status, FifoStatus::DeadLettered);
    }

    #[test]
    fn test_fifo_status_debug() {
        let debug = format!("{:?}", FifoStatus::Pending);
        assert_eq!(debug, "Pending");
    }

    #[test]
    fn test_fifo_status_clone() {
        let s = FifoStatus::Processing;
        let cloned = s.clone();
        assert_eq!(s, cloned);
    }

    #[test]
    fn test_fifo_status_partial_eq() {
        assert_eq!(FifoStatus::Pending, FifoStatus::Pending);
        assert_ne!(FifoStatus::Pending, FifoStatus::Failed);
    }

    #[test]
    fn test_fifo_queue_item_serde() {
        let item = FifoQueueItem {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            event_type: "order.created".to_string(),
            payload: serde_json::json!({"order_id": "ORD-1"}),
            sequence_num: 1,
            status: FifoStatus::Pending,
            created_at: Utc::now(),
        };
        let json = serde_json::to_string(&item).unwrap();
        assert!(json.contains("order.created"));
        assert!(json.contains("ORD-1"));

        let back: FifoQueueItem = serde_json::from_str(&json).unwrap();
        assert_eq!(back.event_type, "order.created");
        assert_eq!(back.sequence_num, 1);
    }

    #[test]
    fn test_enqueue_result_deserialization() {
        let json = r#"{"queue_item_id":"550e8400-e29b-41d4-a716-446655440000","sequence_num":5,"is_head":false}"#;
        let result: EnqueueResult = serde_json::from_str(json).unwrap();
        assert_eq!(result.sequence_num, 5);
        assert!(!result.is_head);
    }
}
