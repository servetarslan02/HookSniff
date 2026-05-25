#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_auto_detect_schema() {
        let event = json!({
            "name": "Alice",
            "age": 30,
            "active": true,
            "tags": ["admin", "user"]
        });
        let schema = auto_detect_schema(&event);
        assert_eq!(schema["type"], "object");
        assert_eq!(schema["properties"]["name"]["type"], "string");
        assert_eq!(schema["properties"]["age"]["type"], "integer");
        assert_eq!(schema["properties"]["active"]["type"], "boolean");
        assert_eq!(schema["properties"]["tags"]["type"], "array");
    }

    #[test]
    fn test_validate_event_valid() {
        let schema = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"}
            },
            "required": ["name"]
        });
        let event = json!({"name": "Alice", "age": 30});
        let result = validate_event(&schema, &event);
        assert!(result.valid);
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_validate_event_missing_required() {
        let schema = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"}
            },
            "required": ["name", "age"]
        });
        let event = json!({"name": "Alice"});
        let result = validate_event(&schema, &event);
        assert!(!result.valid);
        assert_eq!(result.errors.len(), 1);
        assert!(result.errors[0].message.contains("age"));
    }

    #[test]
    fn test_validate_event_wrong_type() {
        let schema = json!({
            "type": "object",
            "properties": {
                "age": {"type": "integer"}
            },
            "required": ["age"]
        });
        let event = json!({"age": "thirty"});
        let result = validate_event(&schema, &event);
        assert!(!result.valid);
    }

    #[test]
    fn test_backward_compatible() {
        let old = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"}
            },
            "required": ["name"]
        });
        let new = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"},
                "email": {"type": "string"}
            },
            "required": ["name"]
        });
        let result = check_compatibility(&old, &new);
        assert!(result.compatible);
    }

    #[test]
    fn test_backward_incompatible_removed_required() {
        let old = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"}
            },
            "required": ["name", "age"]
        });
        let new = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"}
            },
            "required": ["name"]
        });
        let result = check_compatibility(&old, &new);
        assert!(!result.compatible);
    }

    // ── Additional tests ──────────────────────────────────────

    #[test]
    fn test_auto_detect_schema_nested_object() {
        let event = json!({
            "user": {
                "name": "Alice",
                "address": {
                    "city": "Istanbul"
                }
            }
        });
        let schema = auto_detect_schema(&event);
        assert_eq!(schema["type"], "object");
        assert_eq!(schema["properties"]["user"]["type"], "object");
    }

    #[test]
    fn test_auto_detect_schema_null_field() {
        let event = json!({"name": "Alice", "middle_name": null});
        let schema = auto_detect_schema(&event);
        assert_eq!(schema["properties"]["name"]["type"], "string");
        assert_eq!(schema["properties"]["middle_name"]["type"], "null");
    }

    #[test]
    fn test_validate_event_extra_fields_allowed() {
        let schema = json!({
            "type": "object",
            "properties": {
                "name": {"type": "string"}
            }
        });
        let event = json!({"name": "Alice", "extra": "field"});
        let result = validate_event(&schema, &event);
        assert!(result.valid);
    }

    #[test]
    fn test_validate_event_empty_object() {
        let schema = json!({"type": "object", "properties": {}});
        let event = json!({});
        let result = validate_event(&schema, &event);
        assert!(result.valid);
    }

    #[test]
    fn test_check_compatibility_identical() {
        let schema = json!({
            "type": "object",
            "properties": {"name": {"type": "string"}}
        });
        let result = check_compatibility(&schema, &schema);
        assert!(result.compatible);
    }

    #[test]
    fn test_check_compatibility_type_change() {
        let old = json!({
            "type": "object",
            "properties": {"age": {"type": "integer"}}
        });
        let new = json!({
            "type": "object",
            "properties": {"age": {"type": "string"}}
        });
        let result = check_compatibility(&old, &new);
        assert!(!result.compatible);
    }

    #[test]
    fn test_validation_result_serde() {
        let result = ValidationResult {
            valid: false,
            errors: vec![ValidationError {
                path: "/name".to_string(),
                message: "missing".to_string(),
                expected: Some("string".to_string()),
                actual: None,
            }],
        };
        let json = serde_json::to_string(&result).unwrap();
        let back: ValidationResult = serde_json::from_str(&json).unwrap();
        assert!(!back.valid);
        assert_eq!(back.errors.len(), 1);
    }

    #[test]
    fn test_register_schema_request_serde() {
        let req = RegisterSchemaRequest {
            name: "order.created".to_string(),
            schema: json!({"type": "object"}),
            auto_detect: false,
        };
        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("order.created"));
    }

    #[test]
    fn test_register_schema_request_auto_detect_default() {
        let json_str = r#"{"name":"test","schema":{"type":"object"}}"#;
        let req: RegisterSchemaRequest = serde_json::from_str(json_str).unwrap();
        assert!(!req.auto_detect);
    }

    #[test]
    fn test_validate_event_request_serde() {
        let req = ValidateEventRequest {
            event: json!({"key": "value"}),
        };
        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("key"));
    }
}
