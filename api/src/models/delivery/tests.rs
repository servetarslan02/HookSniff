#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    fn make_delivery() -> Delivery {
        Delivery {
            id: Uuid::parse_str("22222222-2222-2222-2222-222222222222").unwrap(),
            endpoint_id: Uuid::parse_str("33333333-3333-3333-3333-333333333333").unwrap(),
            customer_id: Uuid::parse_str("44444444-4444-4444-4444-444444444444").unwrap(),
            payload: serde_json::json!({"event": "test", "data": {"key": "value"}}),
            event_type: Some("order.created".to_string()),
            status: "pending".to_string(),
            attempt_count: 0,
            max_attempts: 5,
            last_attempt_at: None,
            response_status: None,
            response_body: None,
            next_retry_at: None,
            replay_count: 0,
            created_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
            sequence_num: Some(1),
            fifo_group_id: None,
            updated_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
            error_message: None,
            is_test: false,
            custom_headers: None,
            event: None,
            processed_at: None,
            idempotency_key: None,
            source_ip: None,
            request_headers: None,
            application_id: None,
            payload_hash: None,
        }
    }

    #[test]
    fn test_delivery_construction() {
        let d = make_delivery();
        assert_eq!(d.status, "pending");
        assert_eq!(d.attempt_count, 0);
        assert_eq!(d.max_attempts, 5);
        assert!(!d.is_test);
        assert_eq!(d.replay_count, 0);
    }

    #[test]
    fn test_delivery_serialization_roundtrip() {
        let d = make_delivery();
        let json = serde_json::to_string(&d).unwrap();
        let deserialized: Delivery = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, d.id);
        assert_eq!(deserialized.endpoint_id, d.endpoint_id);
        assert_eq!(deserialized.status, d.status);
        assert_eq!(deserialized.payload, d.payload);
    }

    #[test]
    fn test_delivery_optional_fields_none() {
        let d = make_delivery();
        assert!(d.last_attempt_at.is_none());
        assert!(d.response_status.is_none());
        assert!(d.response_body.is_none());
        assert!(d.next_retry_at.is_none());
        assert!(d.fifo_group_id.is_none());
        assert!(d.error_message.is_none());
    }

    #[test]
    fn test_delivery_with_all_fields() {
        let mut d = make_delivery();
        d.last_attempt_at = Some(Utc::now());
        d.response_status = Some(200);
        d.response_body = Some("OK".to_string());
        d.next_retry_at = Some(Utc::now());
        d.fifo_group_id = Some("group-1".to_string());
        d.error_message = Some("timeout".to_string());
        d.is_test = true;
        d.replay_count = 3;

        let json = serde_json::to_string(&d).unwrap();
        let deserialized: Delivery = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.response_status, Some(200));
        assert_eq!(deserialized.response_body, Some("OK".to_string()));
        assert_eq!(deserialized.fifo_group_id, Some("group-1".to_string()));
        assert_eq!(deserialized.error_message, Some("timeout".to_string()));
        assert!(deserialized.is_test);
        assert_eq!(deserialized.replay_count, 3);
    }

    #[test]
    fn test_delivery_to_response() {
        let d = make_delivery();
        let resp = d.to_response();
        assert_eq!(
            resp.id,
            Uuid::parse_str("22222222-2222-2222-2222-222222222222").unwrap()
        );
        assert_eq!(resp.event, Some("order.created".to_string()));
        assert_eq!(resp.status, "pending");
        assert_eq!(resp.attempt_count, 0);
        assert_eq!(resp.replay_count, Some(0));
        assert_eq!(resp.is_test, Some(false));
    }

    #[test]
    fn test_delivery_to_response_with_status() {
        let mut d = make_delivery();
        d.response_status = Some(201);
        d.status = "delivered".to_string();
        let resp = d.to_response();
        assert_eq!(resp.response_status, Some(201));
        assert_eq!(resp.status, "delivered");
    }

    #[test]
    fn test_create_webhook_request_deserialization() {
        let json = r#"{
            "endpoint_id": "22222222-2222-2222-2222-222222222222",
            "event": "order.created",
            "data": {"key": "value"}
        }"#;
        let req: CreateWebhookRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.event, Some("order.created".to_string()));
        assert_eq!(req.data["key"], "value");
    }

    #[test]
    fn test_create_webhook_request_no_event() {
        let json = r#"{
            "endpoint_id": "22222222-2222-2222-2222-222222222222",
            "data": {}
        }"#;
        let req: CreateWebhookRequest = serde_json::from_str(json).unwrap();
        assert!(req.event.is_none());
    }

    #[test]
    fn test_batch_webhook_request_deserialization() {
        let json = r#"{
            "webhooks": [
                {"endpoint_id": "22222222-2222-2222-2222-222222222222", "data": {}},
                {"endpoint_id": "22222222-2222-2222-2222-222222222222", "event": "test", "data": {}}
            ]
        }"#;
        let req: BatchWebhookRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.webhooks.len(), 2);
    }

    #[test]
    fn test_delivery_response_serialization_roundtrip() {
        let resp = DeliveryResponse {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            event: Some("test.event".to_string()),
            status: "delivered".to_string(),
            attempt_count: 2,
            response_status: Some(200),
            replay_count: Some(1),
            created_at: Utc::now(),
            is_test: None,
        };
        let json = serde_json::to_string(&resp).unwrap();
        let deserialized: DeliveryResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.status, "delivered");
        assert_eq!(deserialized.attempt_count, 2);
        assert!(deserialized.is_test.is_none());
    }

    #[test]
    fn test_delivery_response_is_test_skip_serializing() {
        let resp = DeliveryResponse {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            event: None,
            status: "pending".to_string(),
            attempt_count: 0,
            response_status: None,
            replay_count: None,
            created_at: Utc::now(),
            is_test: None,
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(!json.contains("is_test"));
    }

    #[test]
    fn test_delivery_list_response_serialization() {
        let list = DeliveryListResponse {
            deliveries: vec![],
            total: 0,
            page: 1,
            per_page: 20,
        };
        let json = serde_json::to_value(&list).unwrap();
        assert_eq!(json["total"], 0);
        assert_eq!(json["page"], 1);
        assert_eq!(json["per_page"], 20);
        assert!(json["deliveries"].as_array().unwrap().is_empty());
    }

    #[test]
    fn test_batch_response_serialization() {
        let resp = BatchResponse {
            deliveries: vec![],
            errors: vec![BatchError {
                index: 0,
                error: "Invalid payload".to_string(),
            }],
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["errors"][0]["index"], 0);
        assert_eq!(json["errors"][0]["error"], "Invalid payload");
    }

    #[test]
    fn test_batch_error_serialization() {
        let err = BatchError {
            index: 5,
            error: "Timeout".to_string(),
        };
        let json = serde_json::to_value(&err).unwrap();
        assert_eq!(json["index"], 5);
        assert_eq!(json["error"], "Timeout");
    }

    #[test]
    fn test_delivery_attempt_construction() {
        let attempt = DeliveryAttempt {
            id: Uuid::new_v4(),
            delivery_id: Uuid::new_v4(),
            attempt_number: 1,
            status_code: Some(200),
            response_body: Some("OK".to_string()),
            duration_ms: Some(150),
            error_message: None,
            created_at: Utc::now(),
            trace_id: Some("trace-abc".to_string()),
            response_headers: Some(serde_json::json!({"content-type": "application/json"})),
        };
        assert_eq!(attempt.attempt_number, 1);
        assert_eq!(attempt.status_code, Some(200));
        assert_eq!(attempt.duration_ms, Some(150));
    }

    #[test]
    fn test_delivery_attempt_serialization_roundtrip() {
        let attempt = DeliveryAttempt {
            id: Uuid::new_v4(),
            delivery_id: Uuid::new_v4(),
            attempt_number: 3,
            status_code: Some(500),
            response_body: Some("Internal Server Error".to_string()),
            duration_ms: Some(5000),
            error_message: Some("upstream timeout".to_string()),
            created_at: Utc::now(),
            trace_id: None,
            response_headers: None,
        };
        let json = serde_json::to_string(&attempt).unwrap();
        let deserialized: DeliveryAttempt = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.attempt_number, 3);
        assert_eq!(deserialized.status_code, Some(500));
        assert_eq!(
            deserialized.error_message,
            Some("upstream timeout".to_string())
        );
    }

    #[test]
    fn test_delivery_attempt_to_response() {
        let attempt = DeliveryAttempt {
            id: Uuid::parse_str("55555555-5555-5555-5555-555555555555").unwrap(),
            delivery_id: Uuid::new_v4(),
            attempt_number: 2,
            status_code: Some(201),
            response_body: Some("Created".to_string()),
            duration_ms: Some(200),
            error_message: None,
            created_at: Utc.with_ymd_and_hms(2024, 3, 15, 10, 30, 0).unwrap(),
            trace_id: Some("tr-1".to_string()),
            response_headers: None,
        };
        let resp = attempt.to_response();
        assert_eq!(
            resp.id,
            Uuid::parse_str("55555555-5555-5555-5555-555555555555").unwrap()
        );
        assert_eq!(resp.attempt_number, 2);
        assert_eq!(resp.status_code, Some(201));
        assert_eq!(resp.duration_ms, Some(200));
    }

    #[test]
    fn test_delivery_attempt_response_serialization() {
        let resp = DeliveryAttemptResponse {
            id: Uuid::new_v4(),
            delivery_id: Uuid::new_v4(),
            attempt_number: 1,
            status: "failed".to_string(),
            status_code: Some(200),
            response_body: None,
            response_headers: None,
            duration_ms: None,
            error_message: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["attempt_number"], 1);
        assert_eq!(json["status_code"], 200);
    }

    #[test]
    fn test_export_delivery_serialization_roundtrip() {
        let export = ExportDelivery {
            id: Uuid::new_v4(),
            event: Some("order.created".to_string()),
            endpoint_url: "https://example.com/webhook".to_string(),
            status: "delivered".to_string(),
            attempt_count: 1,
            response_status: Some(200),
            created_at: Utc::now(),
        };
        let json = serde_json::to_string(&export).unwrap();
        let deserialized: ExportDelivery = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.endpoint_url, "https://example.com/webhook");
        assert_eq!(deserialized.event, Some("order.created".to_string()));
    }

    #[test]
    fn test_export_delivery_no_event() {
        let export = ExportDelivery {
            id: Uuid::new_v4(),
            event: None,
            endpoint_url: "https://example.com".to_string(),
            status: "pending".to_string(),
            attempt_count: 0,
            response_status: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_string(&export).unwrap();
        let deserialized: ExportDelivery = serde_json::from_str(&json).unwrap();
        assert!(deserialized.event.is_none());
        assert!(deserialized.response_status.is_none());
    }

    #[test]
    fn test_delivery_empty_payload() {
        let mut d = make_delivery();
        d.payload = serde_json::json!({});
        let json = serde_json::to_string(&d).unwrap();
        let deserialized: Delivery = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.payload, serde_json::json!({}));
    }

    #[test]
    fn test_delivery_complex_payload() {
        let mut d = make_delivery();
        d.payload = serde_json::json!({
            "order": {
                "id": 12345,
                "items": [{"sku": "A", "qty": 2}, {"sku": "B", "qty": 1}],
                "total": 99.99,
                "metadata": {"source": "mobile"}
            }
        });
        let json = serde_json::to_string(&d).unwrap();
        let deserialized: Delivery = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.payload["order"]["id"], 12345);
        assert_eq!(
            deserialized.payload["order"]["items"]
                .as_array()
                .unwrap()
                .len(),
            2
        );
    }

    #[test]
    fn test_delivery_clone() {
        let d = make_delivery();
        let cloned = d.clone();
        assert_eq!(cloned.id, d.id);
        assert_eq!(cloned.status, d.status);
        assert_eq!(cloned.payload, d.payload);
    }

    #[test]
    fn test_delivery_attempt_clone() {
        let attempt = DeliveryAttempt {
            id: Uuid::new_v4(),
            delivery_id: Uuid::new_v4(),
            attempt_number: 1,
            status_code: Some(200),
            response_body: None,
            duration_ms: None,
            error_message: None,
            created_at: Utc::now(),
            trace_id: None,
            response_headers: None,
        };
        let cloned = attempt.clone();
        assert_eq!(cloned.id, attempt.id);
        assert_eq!(cloned.attempt_number, attempt.attempt_number);
    }
}
