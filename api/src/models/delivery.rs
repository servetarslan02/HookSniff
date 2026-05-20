use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Delivery {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub payload: serde_json::Value,
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub last_attempt_at: Option<DateTime<Utc>>,
    pub response_status: Option<i32>,
    pub response_body: Option<String>,
    pub next_retry_at: Option<DateTime<Utc>>,
    pub replay_count: i32,
    pub created_at: DateTime<Utc>,
    // Fields added by migrations
    pub sequence_num: Option<i64>,
    pub fifo_group_id: Option<String>,
    pub updated_at: DateTime<Utc>,
    pub error_message: Option<String>,
    /// True if this delivery was created with a test API key (hr_test_*).
    #[sqlx(default)]
    pub is_test: bool,
    /// Custom headers to send with the delivery.
    #[sqlx(default)]
    pub custom_headers: Option<serde_json::Value>,
}

/// Lightweight delivery struct for list queries.
/// Excludes `payload` (up to 256KB) and `response_body` to reduce DB bandwidth.
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct DeliveryListRow {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub customer_id: Uuid,
    pub event_type: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub max_attempts: i32,
    pub last_attempt_at: Option<DateTime<Utc>>,
    pub response_status: Option<i32>,
    pub next_retry_at: Option<DateTime<Utc>>,
    pub replay_count: i32,
    pub created_at: DateTime<Utc>,
    pub sequence_num: Option<i64>,
    pub fifo_group_id: Option<String>,
    pub updated_at: DateTime<Utc>,
    pub error_message: Option<String>,
    #[sqlx(default)]
    pub is_test: bool,
}

impl DeliveryListRow {
    pub fn to_response(&self) -> DeliveryResponse {
        DeliveryResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            event: self.event_type.clone(),
            status: self.status.clone(),
            attempt_count: self.attempt_count,
            response_status: self.response_status,
            replay_count: Some(self.replay_count),
            created_at: self.created_at,
            is_test: Some(self.is_test),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateWebhookRequest {
    pub endpoint_id: Uuid,
    pub event: Option<String>,
    pub data: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct BatchWebhookRequest {
    pub webhooks: Vec<CreateWebhookRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeliveryResponse {
    pub id: Uuid,
    pub endpoint_id: Uuid,
    pub event: Option<String>,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub replay_count: Option<i32>,
    pub created_at: DateTime<Utc>,
    /// True if this was a test delivery.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_test: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct DeliveryListResponse {
    pub deliveries: Vec<DeliveryResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, Serialize)]
pub struct BatchResponse {
    pub deliveries: Vec<DeliveryResponse>,
    pub errors: Vec<BatchError>,
}

#[derive(Debug, Serialize)]
pub struct BatchError {
    pub index: usize,
    pub error: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DeliveryAttempt {
    pub id: Uuid,
    pub delivery_id: Uuid,
    pub attempt_number: i32,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    pub trace_id: Option<String>,
    pub response_headers: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct DeliveryAttemptResponse {
    pub id: Uuid,
    pub delivery_id: Uuid,
    pub attempt_number: i32,
    pub status: String,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub response_headers: Option<serde_json::Value>,
    pub duration_ms: Option<i32>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl DeliveryAttempt {
    pub fn to_response(&self) -> DeliveryAttemptResponse {
        let status = match self.status_code {
            Some(code) if (200..300).contains(&code) => "delivered".to_string(),
            _ => "failed".to_string(),
        };
        DeliveryAttemptResponse {
            id: self.id,
            delivery_id: self.delivery_id,
            attempt_number: self.attempt_number,
            status,
            status_code: self.status_code,
            response_body: self.response_body.clone(),
            response_headers: self.response_headers.clone(),
            duration_ms: self.duration_ms,
            error_message: self.error_message.clone(),
            created_at: self.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ExportDelivery {
    pub id: Uuid,
    pub event: Option<String>,
    pub endpoint_url: String,
    pub status: String,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub created_at: DateTime<Utc>,
}

impl Delivery {
    pub fn to_response(&self) -> DeliveryResponse {
        DeliveryResponse {
            id: self.id,
            endpoint_id: self.endpoint_id,
            event: self.event_type.clone(),
            status: self.status.clone(),
            attempt_count: self.attempt_count,
            response_status: self.response_status,
            replay_count: Some(self.replay_count),
            created_at: self.created_at,
            is_test: Some(self.is_test),
        }
    }
}

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
