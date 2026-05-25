#[cfg(test)]
mod tests {
    use super::*;

    // ── AppEvent Tests ──────────────────────────────────────────────

    #[test]
    fn test_app_event_channel_delivery_created() {
        let event = AppEvent::DeliveryCreated {
            delivery_id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            event_type: Some("order.created".to_string()),
        };
        assert_eq!(event.channel(), "deliveries");
    }

    #[test]
    fn test_app_event_channel_delivery_status_changed() {
        let event = AppEvent::DeliveryStatusChanged {
            delivery_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            old_status: "pending".to_string(),
            new_status: "delivered".to_string(),
        };
        assert_eq!(event.channel(), "deliveries");
    }

    #[test]
    fn test_app_event_channel_queue_updated() {
        let event = AppEvent::QueueUpdated {
            pending: 10,
            processing: 5,
            failed: 2,
        };
        assert_eq!(event.channel(), "queue");
    }

    #[test]
    fn test_app_event_channel_user_created() {
        let event = AppEvent::UserCreated {
            user_id: Uuid::new_v4(),
            email: "test@example.com".to_string(),
            plan: "pro".to_string(),
        };
        assert_eq!(event.channel(), "users");
    }

    #[test]
    fn test_app_event_channel_endpoint_status_changed() {
        let event = AppEvent::EndpointStatusChanged {
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            is_active: true,
        };
        assert_eq!(event.channel(), "endpoints");
    }

    #[test]
    fn test_app_event_type_delivery_created() {
        let event = AppEvent::DeliveryCreated {
            delivery_id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            event_type: None,
        };
        assert_eq!(event.event_type(), "delivery.created");
    }

    #[test]
    fn test_app_event_type_delivery_status_changed() {
        let event = AppEvent::DeliveryStatusChanged {
            delivery_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            old_status: "pending".to_string(),
            new_status: "failed".to_string(),
        };
        assert_eq!(event.event_type(), "delivery.status_changed");
    }

    #[test]
    fn test_app_event_type_queue_updated() {
        let event = AppEvent::QueueUpdated {
            pending: 0,
            processing: 0,
            failed: 0,
        };
        assert_eq!(event.event_type(), "queue.updated");
    }

    #[test]
    fn test_app_event_type_user_created() {
        let event = AppEvent::UserCreated {
            user_id: Uuid::new_v4(),
            email: "a@b.com".to_string(),
            plan: "free".to_string(),
        };
        assert_eq!(event.event_type(), "user.created");
    }

    #[test]
    fn test_app_event_type_endpoint_status_changed() {
        let event = AppEvent::EndpointStatusChanged {
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            is_active: false,
        };
        assert_eq!(event.event_type(), "endpoint.status_changed");
    }

    // ── EventEnvelope Tests ─────────────────────────────────────────

    #[test]
    fn test_event_envelope_new_has_uuid() {
        let event = AppEvent::QueueUpdated {
            pending: 1,
            processing: 0,
            failed: 0,
        };
        let envelope = EventEnvelope::new(event);
        // UUID v4 format: 8-4-4-4-12
        let id_str = envelope.id.to_string();
        assert_eq!(id_str.len(), 36);
        assert_eq!(id_str.chars().filter(|c| *c == '-').count(), 4);
    }

    #[test]
    fn test_event_envelope_new_has_sequence() {
        let event1 = AppEvent::QueueUpdated {
            pending: 0,
            processing: 0,
            failed: 0,
        };
        let event2 = AppEvent::QueueUpdated {
            pending: 0,
            processing: 0,
            failed: 0,
        };
        let e1 = EventEnvelope::new(event1);
        let e2 = EventEnvelope::new(event2);
        assert!(e2.seq > e1.seq, "Sequence should be monotonically increasing");
    }

    #[test]
    fn test_event_envelope_new_has_timestamp() {
        let before = chrono::Utc::now().timestamp_millis();
        let event = AppEvent::QueueUpdated {
            pending: 0,
            processing: 0,
            failed: 0,
        };
        let envelope = EventEnvelope::new(event);
        let after = chrono::Utc::now().timestamp_millis();
        assert!(envelope.ts >= before, "Timestamp should be >= before");
        assert!(envelope.ts <= after, "Timestamp should be <= after");
    }

    #[test]
    fn test_event_envelope_unique_ids() {
        let mut ids = std::collections::HashSet::new();
        for _ in 0..100 {
            let event = AppEvent::QueueUpdated {
                pending: 0,
                processing: 0,
                failed: 0,
            };
            let envelope = EventEnvelope::new(event);
            assert!(ids.insert(envelope.id), "Each envelope should have a unique ID");
        }
    }

    #[test]
    fn test_event_envelope_serialization_roundtrip() {
        let event = AppEvent::DeliveryCreated {
            delivery_id: Uuid::parse_str("550e8400-e29b-41d4-a716-446655440000").unwrap(),
            endpoint_id: Uuid::parse_str("6ba7b810-9dad-11d1-80b4-00c04fd430c8").unwrap(),
            customer_id: Uuid::parse_str("6ba7b811-9dad-11d1-80b4-00c04fd430c8").unwrap(),
            event_type: Some("order.created".to_string()),
        };
        let envelope = EventEnvelope::new(event);

        let json = serde_json::to_string(&envelope).unwrap();
        let deserialized: EventEnvelope = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.id, envelope.id);
        assert_eq!(deserialized.seq, envelope.seq);
        assert_eq!(deserialized.ts, envelope.ts);
    }

    #[test]
    fn test_event_envelope_json_structure() {
        let event = AppEvent::QueueUpdated {
            pending: 42,
            processing: 7,
            failed: 3,
        };
        let envelope = EventEnvelope::new(event);
        let json = serde_json::to_value(&envelope).unwrap();

        // Top-level fields exist
        assert!(json.get("id").is_some());
        assert!(json.get("seq").is_some());
        assert!(json.get("ts").is_some());
        assert!(json.get("event").is_some());

        // Event has type tag
        let event_json = json.get("event").unwrap();
        assert!(event_json.get("type").is_some());
        assert_eq!(event_json.get("type").unwrap().as_str().unwrap(), "QueueUpdated");
    }

    // ── EventPublisher Tests (no Redis) ─────────────────────────────

    #[tokio::test]
    async fn test_publisher_new_without_redis() {
        let publisher = EventPublisher::new(None).await;
        assert!(!publisher.has_redis());
    }

    #[tokio::test]
    async fn test_publisher_subscribe_receives_event() {
        let publisher = EventPublisher::new(None).await;
        let mut rx = publisher.subscribe();

        let event = AppEvent::QueueUpdated {
            pending: 10,
            processing: 5,
            failed: 1,
        };
        publisher.publish(event).await.unwrap();

        let received = rx.recv().await.unwrap();
        assert_eq!(received.event.event_type(), "queue.updated");
    }

    #[tokio::test]
    async fn test_publisher_subscribe_multiple_receivers() {
        let publisher = EventPublisher::new(None).await;
        let mut rx1 = publisher.subscribe();
        let mut rx2 = publisher.subscribe();

        let event = AppEvent::UserCreated {
            user_id: Uuid::new_v4(),
            email: "multi@test.com".to_string(),
            plan: "pro".to_string(),
        };
        publisher.publish(event).await.unwrap();

        let r1 = rx1.recv().await.unwrap();
        let r2 = rx2.recv().await.unwrap();
        assert_eq!(r1.id, r2.id, "Both receivers should get the same envelope");
    }

    #[tokio::test]
    async fn test_publisher_publish_delivery_created() {
        let publisher = EventPublisher::new(None).await;
        let mut rx = publisher.subscribe();

        let event = AppEvent::DeliveryCreated {
            delivery_id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            event_type: Some("test.event".to_string()),
        };
        publisher.publish(event).await.unwrap();

        let received = rx.recv().await.unwrap();
        assert_eq!(received.event.channel(), "deliveries");
    }

    #[tokio::test]
    async fn test_publisher_publish_endpoint_status_changed() {
        let publisher = EventPublisher::new(None).await;
        let mut rx = publisher.subscribe();

        let event = AppEvent::EndpointStatusChanged {
            endpoint_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            is_active: false,
        };
        publisher.publish(event).await.unwrap();

        let received = rx.recv().await.unwrap();
        assert_eq!(received.event.event_type(), "endpoint.status_changed");
    }

    #[tokio::test]
    async fn test_publisher_get_recent_without_redis() {
        let publisher = EventPublisher::new(None).await;
        let events = publisher.get_recent(10).await.unwrap();
        assert!(events.is_empty());
    }

    #[tokio::test]
    async fn test_publisher_publish_preserves_ordering() {
        let publisher = EventPublisher::new(None).await;
        let mut rx = publisher.subscribe();

        for i in 0..5 {
            let event = AppEvent::QueueUpdated {
                pending: i,
                processing: 0,
                failed: 0,
            };
            publisher.publish(event).await.unwrap();
        }

        let mut seqs = Vec::new();
        for _ in 0..5 {
            let received = rx.recv().await.unwrap();
            seqs.push(received.seq);
        }

        // Sequence'lar artan sırada olmalı
        for i in 1..seqs.len() {
            assert!(seqs[i] > seqs[i - 1], "Sequences should be in ascending order");
        }
    }

    // ── Serialization Tests ─────────────────────────────────────────

    #[test]
    fn test_app_event_serde_delivery_created() {
        let event = AppEvent::DeliveryCreated {
            delivery_id: Uuid::nil(),
            endpoint_id: Uuid::nil(),
            customer_id: Uuid::nil(),
            event_type: None,
        };
        let json = serde_json::to_string(&event).unwrap();
        assert!(json.contains("DeliveryCreated"));
        let deserialized: AppEvent = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.event_type(), "delivery.created");
    }

    #[test]
    fn test_app_event_serde_queue_updated() {
        let event = AppEvent::QueueUpdated {
            pending: 100,
            processing: 25,
            failed: 5,
        };
        let json = serde_json::to_string(&event).unwrap();
        let deserialized: AppEvent = serde_json::from_str(&json).unwrap();
        match deserialized {
            AppEvent::QueueUpdated {
                pending,
                processing,
                failed,
            } => {
                assert_eq!(pending, 100);
                assert_eq!(processing, 25);
                assert_eq!(failed, 5);
            }
            _ => panic!("Expected QueueUpdated"),
        }
    }

    #[test]
    fn test_app_event_serde_all_variants() {
        let events = vec![
            AppEvent::DeliveryCreated {
                delivery_id: Uuid::new_v4(),
                endpoint_id: Uuid::new_v4(),
                customer_id: Uuid::new_v4(),
                event_type: None,
            },
            AppEvent::DeliveryStatusChanged {
                delivery_id: Uuid::new_v4(),
                customer_id: Uuid::new_v4(),
                old_status: "pending".to_string(),
                new_status: "delivered".to_string(),
            },
            AppEvent::QueueUpdated {
                pending: 0,
                processing: 0,
                failed: 0,
            },
            AppEvent::UserCreated {
                user_id: Uuid::new_v4(),
                email: "test@test.com".to_string(),
                plan: "free".to_string(),
            },
            AppEvent::EndpointStatusChanged {
                endpoint_id: Uuid::new_v4(),
                customer_id: Uuid::new_v4(),
                is_active: true,
            },
        ];

        for event in events {
            let json = serde_json::to_string(&event).unwrap();
            let deserialized: AppEvent = serde_json::from_str(&json).unwrap();
            assert_eq!(event.event_type(), deserialized.event_type());
            assert_eq!(event.channel(), deserialized.channel());
        }
    }
}
