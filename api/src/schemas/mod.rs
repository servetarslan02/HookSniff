//! Event Schema Registry for HookRelay's event mesh.
//!
//! Provides schema management for event types, including auto-detection,
//! versioning, backward-compatible evolution, and validation.

pub mod registry;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// An event schema definition with version tracking.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventSchema {
    pub id: uuid::Uuid,
    pub name: String,
    pub version: i32,
    pub schema: Value,
    pub customer_id: uuid::Uuid,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Request to register a new schema.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegisterSchemaRequest {
    pub name: String,
    pub schema: Value,
    /// If true, auto-detect the schema from the first event.
    #[serde(default)]
    pub auto_detect: bool,
}

/// Request to validate an event against a schema.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidateEventRequest {
    pub event: Value,
}

/// Result of schema validation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub errors: Vec<ValidationError>,
}

/// A single validation error.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub path: String,
    pub message: String,
    pub expected: Option<String>,
    pub actual: Option<String>,
}

/// Auto-detect a JSON schema from an event payload.
///
/// Generates a minimal schema that describes the structure and types
/// of the event. This is used when a schema is registered with
/// `auto_detect: true`.
pub fn auto_detect_schema(event: &Value) -> Value {
    infer_schema(event)
}

/// Infer a JSON schema from a value.
fn infer_schema(value: &Value) -> Value {
    match value {
        Value::Null => serde_json::json!({"type": "null"}),
        Value::Bool(_) => serde_json::json!({"type": "boolean"}),
        Value::Number(n) => {
            if n.is_i64() || n.is_u64() {
                serde_json::json!({"type": "integer"})
            } else {
                serde_json::json!({"type": "number"})
            }
        }
        Value::String(_) => serde_json::json!({"type": "string"}),
        Value::Array(arr) => {
            if let Some(first) = arr.first() {
                serde_json::json!({
                    "type": "array",
                    "items": infer_schema(first)
                })
            } else {
                serde_json::json!({"type": "array"})
            }
        }
        Value::Object(obj) => {
            let mut properties = serde_json::Map::new();
            let mut required = Vec::new();

            for (key, val) in obj {
                properties.insert(key.clone(), infer_schema(val));
                required.push(key.clone());
            }

            serde_json::json!({
                "type": "object",
                "properties": properties,
                "required": required
            })
        }
    }
}

/// Validate an event against a JSON schema.
///
/// Performs structural validation: checks required fields, types,
/// and nested structure. Returns a list of validation errors.
pub fn validate_event(schema: &Value, event: &Value) -> ValidationResult {
    let mut errors = Vec::new();
    validate_value(schema, event, "", &mut errors);
    ValidationResult {
        valid: errors.is_empty(),
        errors,
    }
}

/// Recursively validate a value against a schema.
fn validate_value(
    schema: &Value,
    value: &Value,
    path: &str,
    errors: &mut Vec<ValidationError>,
) {
    let Some(schema_type) = schema.get("type").and_then(|v| v.as_str()) else {
        return;
    };

    match schema_type {
        "object" => {
            let Value::Object(obj) = value else {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected object, got {}", value_type_name(value)),
                    expected: Some("object".into()),
                    actual: Some(value_type_name(value).into()),
                });
                return;
            };

            // Check required fields
            if let Some(required) = schema.get("required").and_then(|v| v.as_array()) {
                for req in required {
                    if let Some(field_name) = req.as_str() {
                        if !obj.contains_key(field_name) {
                            errors.push(ValidationError {
                                path: if path.is_empty() {
                                    field_name.to_string()
                                } else {
                                    format!("{}.{}", path, field_name)
                                },
                                message: format!("Missing required field: {}", field_name),
                                expected: Some("present".into()),
                                actual: Some("missing".into()),
                            });
                        }
                    }
                }
            }

            // Validate properties
            if let Some(properties) = schema.get("properties").and_then(|v| v.as_object()) {
                for (key, prop_schema) in properties {
                    if let Some(field_value) = obj.get(key) {
                        let field_path = if path.is_empty() {
                            key.clone()
                        } else {
                            format!("{}.{}", path, key)
                        };
                        validate_value(prop_schema, field_value, &field_path, errors);
                    }
                }
            }
        }
        "array" => {
            let Value::Array(arr) = value else {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected array, got {}", value_type_name(value)),
                    expected: Some("array".into()),
                    actual: Some(value_type_name(value).into()),
                });
                return;
            };

            if let Some(items_schema) = schema.get("items") {
                for (i, item) in arr.iter().enumerate() {
                    let item_path = format!("{}[{}]", path, i);
                    validate_value(items_schema, item, &item_path, errors);
                }
            }
        }
        "string" => {
            if !value.is_string() {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected string, got {}", value_type_name(value)),
                    expected: Some("string".into()),
                    actual: Some(value_type_name(value).into()),
                });
            }
        }
        "integer" => {
            if !value.is_i64() && !value.is_u64() {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected integer, got {}", value_type_name(value)),
                    expected: Some("integer".into()),
                    actual: Some(value_type_name(value).into()),
                });
            }
        }
        "number" => {
            if !value.is_number() {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected number, got {}", value_type_name(value)),
                    expected: Some("number".into()),
                    actual: Some(value_type_name(value).into()),
                });
            }
        }
        "boolean" => {
            if !value.is_boolean() {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected boolean, got {}", value_type_name(value)),
                    expected: Some("boolean".into()),
                    actual: Some(value_type_name(value).into()),
                });
            }
        }
        "null" => {
            if !value.is_null() {
                errors.push(ValidationError {
                    path: path.to_string(),
                    message: format!("Expected null, got {}", value_type_name(value)),
                    expected: Some("null".into()),
                    actual: Some(value_type_name(value).into()),
                });
            }
        }
        _ => {}
    }
}

/// Get a human-readable type name for a JSON value.
fn value_type_name(value: &Value) -> &'static str {
    match value {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(_) => "number",
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

/// Check if a new schema version is backward-compatible with the old one.
///
/// A schema is backward-compatible if:
/// - All required fields in the old schema are still required (or optional) in the new one
/// - No field types have changed
/// - New fields are optional
pub fn check_compatibility(old_schema: &Value, new_schema: &Value) -> CompatibilityResult {
    let mut issues = Vec::new();
    check_schema_compatible(old_schema, new_schema, "", &mut issues);
    CompatibilityResult {
        compatible: issues.is_empty(),
        issues,
    }
}

/// Result of a compatibility check.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompatibilityResult {
    pub compatible: bool,
    pub issues: Vec<String>,
}

/// Recursively check backward compatibility.
fn check_schema_compatible(
    old_schema: &Value,
    new_schema: &Value,
    path: &str,
    issues: &mut Vec<String>,
) {
    let old_type = old_schema.get("type").and_then(|v| v.as_str());
    let new_type = new_schema.get("type").and_then(|v| v.as_str());

    // Type changed
    if old_type.is_some() && new_type.is_some() && old_type != new_type {
        issues.push(format!(
            "Type changed at '{}' from {:?} to {:?}",
            path, old_type, new_type
        ));
        return;
    }

    if old_type == Some("object") {
        let old_required: std::collections::HashSet<String> = old_schema
            .get("required")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect()
            })
            .unwrap_or_default();

        let new_required: std::collections::HashSet<String> = new_schema
            .get("required")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect()
            })
            .unwrap_or_default();

        // Old required fields must still be present and required
        for field in &old_required {
            if !new_required.contains(field) {
                issues.push(format!(
                    "Previously required field '{}' at '{}' is no longer required",
                    field, path
                ));
            }
        }

        // Check property types
        if let (Some(old_props), Some(new_props)) = (
            old_schema.get("properties").and_then(|v| v.as_object()),
            new_schema.get("properties").and_then(|v| v.as_object()),
        ) {
            for (key, old_prop_schema) in old_props {
                let field_path = if path.is_empty() {
                    key.clone()
                } else {
                    format!("{}.{}", path, key)
                };

                if let Some(new_prop_schema) = new_props.get(key) {
                    check_schema_compatible(old_prop_schema, new_prop_schema, &field_path, issues);
                } else if old_required.contains(key) {
                    issues.push(format!(
                        "Required field '{}' removed from '{}'",
                        key, path
                    ));
                }
            }
        }
    }
}

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
}
