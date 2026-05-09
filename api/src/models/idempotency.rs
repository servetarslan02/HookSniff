use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct IdempotencyKey {
    pub key: String,
    pub customer_id: Uuid,
    pub response_body: serde_json::Value,
    pub status_code: i32,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    fn make_idempotency_key() -> IdempotencyKey {
        IdempotencyKey {
            key: "idem-key-abc123".to_string(),
            customer_id: Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap(),
            response_body: serde_json::json!({"status": "ok", "id": "res_123"}),
            status_code: 200,
            created_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
            expires_at: Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap(),
        }
    }

    #[test]
    fn test_idempotency_key_construction() {
        let k = make_idempotency_key();
        assert_eq!(k.key, "idem-key-abc123");
        assert_eq!(k.status_code, 200);
        assert_eq!(k.response_body["status"], "ok");
    }

    #[test]
    fn test_idempotency_key_serialization_roundtrip() {
        let k = make_idempotency_key();
        let json = serde_json::to_string(&k).unwrap();
        let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.key, k.key);
        assert_eq!(deserialized.customer_id, k.customer_id);
        assert_eq!(deserialized.status_code, k.status_code);
        assert_eq!(deserialized.response_body, k.response_body);
    }

    #[test]
    fn test_idempotency_key_empty_key() {
        let mut k = make_idempotency_key();
        k.key = "".to_string();
        let json = serde_json::to_string(&k).unwrap();
        let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.key, "");
    }

    #[test]
    fn test_idempotency_key_empty_response_body() {
        let mut k = make_idempotency_key();
        k.response_body = serde_json::json!({});
        let json = serde_json::to_string(&k).unwrap();
        let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.response_body, serde_json::json!({}));
    }

    #[test]
    fn test_idempotency_key_complex_response_body() {
        let mut k = make_idempotency_key();
        k.response_body = serde_json::json!({
            "data": {
                "items": [1, 2, 3],
                "nested": {"key": "value"}
            },
            "meta": {"page": 1, "total": 100}
        });
        let json = serde_json::to_string(&k).unwrap();
        let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.response_body["data"]["items"][0], 1);
        assert_eq!(deserialized.response_body["meta"]["total"], 100);
    }

    #[test]
    fn test_idempotency_key_various_status_codes() {
        for code in &[200, 201, 400, 404, 500] {
            let mut k = make_idempotency_key();
            k.status_code = *code;
            let json = serde_json::to_string(&k).unwrap();
            let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
            assert_eq!(deserialized.status_code, *code);
        }
    }

    #[test]
    fn test_idempotency_key_clone() {
        let k = make_idempotency_key();
        let cloned = k.clone();
        assert_eq!(cloned.key, k.key);
        assert_eq!(cloned.customer_id, k.customer_id);
        assert_eq!(cloned.status_code, k.status_code);
    }

    #[test]
    fn test_idempotency_key_error_response_body() {
        let mut k = make_idempotency_key();
        k.status_code = 422;
        k.response_body = serde_json::json!({
            "error": "validation_failed",
            "message": "Missing required field: email",
            "details": [{"field": "email", "issue": "required"}]
        });
        let json = serde_json::to_string(&k).unwrap();
        let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.status_code, 422);
        assert_eq!(deserialized.response_body["error"], "validation_failed");
    }

    #[test]
    fn test_idempotency_key_long_key() {
        let mut k = make_idempotency_key();
        k.key = "a".repeat(1000);
        let json = serde_json::to_string(&k).unwrap();
        let deserialized: IdempotencyKey = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.key.len(), 1000);
    }

    #[test]
    fn test_idempotency_key_serialized_json_structure() {
        let k = make_idempotency_key();
        let json = serde_json::to_value(&k).unwrap();
        assert!(json.is_object());
        assert!(json.get("key").is_some());
        assert!(json.get("customer_id").is_some());
        assert!(json.get("response_body").is_some());
        assert!(json.get("status_code").is_some());
        assert!(json.get("created_at").is_some());
        assert!(json.get("expires_at").is_some());
    }
}
