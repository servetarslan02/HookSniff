//! Event transformation templates for HookSniff.
//!
//! Provides field mapping, field filtering, value transformation,
//! and JSON template transformers.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::EventTransformer;

// ---------------------------------------------------------------------------
// Field Mapper — rename, move, or compute fields
// ---------------------------------------------------------------------------

/// Maps field names from input to output.
///
/// Config format:
/// ```json
/// {
///   "mappings": {
///     "new_field": "old_field",
///     "user_name": "name",
///     "total": "amount"
///   }
/// }
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldMapper {
    pub mappings: std::collections::HashMap<String, String>,
}

impl FieldMapper {
    pub fn from_config(config: &Value) -> Result<Self> {
        let mappings: std::collections::HashMap<String, String> = config
            .get("mappings")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        Ok(Self { mappings })
    }
}

impl EventTransformer for FieldMapper {
    fn transform(&self, input: &Value) -> Result<Value> {
        let mut output = input.clone();

        if let Some(obj) = output.as_object_mut() {
            // Collect source keys to remove after iteration
            let mut keys_to_remove: Vec<String> = Vec::new();

            for (new_key, old_key) in &self.mappings {
                if let Some(value) = input.get(old_key) {
                    obj.insert(new_key.clone(), value.clone());
                    // Remove the original key (only if source != target)
                    if new_key != old_key {
                        keys_to_remove.push(old_key.clone());
                    }
                }
            }

            for key in keys_to_remove {
                obj.remove(&key);
            }
        }

        Ok(output)
    }

    fn name(&self) -> &str {
        "FieldMapper"
    }
}

// ---------------------------------------------------------------------------
// Field Filter — include/exclude specific fields
// ---------------------------------------------------------------------------

/// Filters fields from the event, keeping only included or removing excluded.
///
/// Config format:
/// ```json
/// {
///   "include": ["field1", "field2"],
///   "exclude": ["internal_field", "debug_info"]
/// }
/// ```
///
/// If both `include` and `exclude` are specified, `include` takes precedence.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldFilter {
    pub include: Option<Vec<String>>,
    pub exclude: Option<Vec<String>>,
}

impl FieldFilter {
    pub fn from_config(config: &Value) -> Result<Self> {
        Ok(Self {
            include: config
                .get("include")
                .and_then(|v| serde_json::from_value(v.clone()).ok()),
            exclude: config
                .get("exclude")
                .and_then(|v| serde_json::from_value(v.clone()).ok()),
        })
    }
}

impl EventTransformer for FieldFilter {
    fn transform(&self, input: &Value) -> Result<Value> {
        let Some(obj) = input.as_object() else {
            return Ok(input.clone());
        };

        let filtered: serde_json::Map<String, Value> = if let Some(ref include) = self.include {
            let include_set: std::collections::HashSet<&String> = include.iter().collect();
            obj.iter()
                .filter(|(k, _)| include_set.contains(k))
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect()
        } else if let Some(ref exclude) = self.exclude {
            let exclude_set: std::collections::HashSet<&String> = exclude.iter().collect();
            obj.iter()
                .filter(|(k, _)| !exclude_set.contains(k))
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect()
        } else {
            return Ok(input.clone());
        };

        Ok(Value::Object(filtered))
    }

    fn name(&self) -> &str {
        "FieldFilter"
    }
}

// ---------------------------------------------------------------------------
// Value Transformer — uppercase, lowercase, date format, etc.
// ---------------------------------------------------------------------------

/// Transforms field values according to configured operations.
///
/// Config format:
/// ```json
/// {
///   "operations": [
///     {"field": "email", "op": "lowercase"},
///     {"field": "name", "op": "uppercase"},
///     {"field": "created_at", "op": "date_format", "format": "%Y-%m-%d"}
///   ]
/// }
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValueTransformer {
    pub operations: Vec<ValueOperation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValueOperation {
    pub field: String,
    pub op: ValueOp,
    pub format: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ValueOp {
    Uppercase,
    Lowercase,
    DateFormat,
    Trim,
    ToString,
    ToNumber,
}

impl ValueTransformer {
    pub fn from_config(config: &Value) -> Result<Self> {
        let operations: Vec<ValueOperation> = config
            .get("operations")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();
        Ok(Self { operations })
    }
}

impl EventTransformer for ValueTransformer {
    fn transform(&self, input: &Value) -> Result<Value> {
        let mut output = input.clone();

        for op in &self.operations {
            if let Some(field_value) = output
                .get(&op.field)
                .and_then(|v| v.as_str())
                .map(String::from)
            {
                let transformed = match &op.op {
                    ValueOp::Uppercase => Value::String(field_value.to_uppercase()),
                    ValueOp::Lowercase => Value::String(field_value.to_lowercase()),
                    ValueOp::Trim => Value::String(field_value.trim().to_string()),
                    ValueOp::ToString => Value::String(field_value),
                    ValueOp::ToNumber => field_value
                        .parse::<f64>()
                        .map(|n| {
                            Value::Number(
                                serde_json::Number::from_f64(n)
                                    .unwrap_or(serde_json::Number::from(0)),
                            )
                        })
                        .unwrap_or(Value::String(field_value)),
                    ValueOp::DateFormat => {
                        // Parse ISO 8601 and reformat
                        if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&field_value) {
                            let fmt = op.format.as_deref().unwrap_or("%Y-%m-%d");
                            Value::String(dt.format(fmt).to_string())
                        } else {
                            Value::String(field_value)
                        }
                    }
                };

                if let Some(obj) = output.as_object_mut() {
                    obj.insert(op.field.clone(), transformed);
                }
            }
        }

        Ok(output)
    }

    fn name(&self) -> &str {
        "ValueTransformer"
    }
}

// ---------------------------------------------------------------------------
// JSON Template — JSONata-like transformation
// ---------------------------------------------------------------------------

/// Applies a JSON template to reshape the event.
///
/// Config format:
/// ```json
/// {
///   "template": {
///     "user": {
///       "full_name": "{{first_name}} {{last_name}}",
///       "email": "{{email}}"
///     },
///     "event_id": "{{id}}",
///     "metadata": {
///       "source": "hooksniff",
///       "processed_at": "{{timestamp}}"
///     }
///   }
/// }
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonTemplate {
    pub template: Value,
}

impl JsonTemplate {
    pub fn from_config(config: &Value) -> Result<Self> {
        let template = config
            .get("template")
            .cloned()
            .context("JSON template requires 'template' field")?;
        Ok(Self { template })
    }

    /// Resolve template variables ({{field_name}}) from the input event.
    fn resolve_template(&self, template: &Value, input: &Value) -> Result<Value> {
        match template {
            Value::String(s) => {
                // Check if it's a template variable: {{field_name}}
                if s.starts_with("{{") && s.ends_with("}}") {
                    let field = &s[2..s.len() - 2];
                    Ok(input.get(field).cloned().unwrap_or(Value::Null))
                } else if s.contains("{{") {
                    // Mixed string with embedded variables
                    let mut result = s.clone();
                    while let (Some(start), Some(end)) = (result.find("{{"), result.find("}}")) {
                        if start < end {
                            let field = &result[start + 2..end].to_string();
                            let value = input
                                .get(field.as_str())
                                .and_then(|v| v.as_str())
                                .unwrap_or("");
                            result = format!("{}{}{}", &result[..start], value, &result[end + 2..]);
                        } else {
                            break;
                        }
                    }
                    Ok(Value::String(result))
                } else {
                    Ok(Value::String(s.clone()))
                }
            }
            Value::Object(obj) => {
                let mut resolved = serde_json::Map::new();
                for (key, value) in obj {
                    resolved.insert(key.clone(), self.resolve_template(value, input)?);
                }
                Ok(Value::Object(resolved))
            }
            Value::Array(arr) => {
                let resolved: Result<Vec<Value>> = arr
                    .iter()
                    .map(|v| self.resolve_template(v, input))
                    .collect();
                Ok(Value::Array(resolved?))
            }
            _ => Ok(template.clone()),
        }
    }
}

impl EventTransformer for JsonTemplate {
    fn transform(&self, input: &Value) -> Result<Value> {
        self.resolve_template(&self.template, input)
    }

    fn name(&self) -> &str {
        "JsonTemplate"
    }
}

// ---------------------------------------------------------------------------
// PassThrough — no-op transformer (used for conditional filters)
// ---------------------------------------------------------------------------

/// No-op transformer that passes events through unchanged.
pub struct PassThrough;

impl Default for PassThrough {
    fn default() -> Self {
        Self::new()
    }
}

impl PassThrough {
    pub fn new() -> Self {
        Self
    }
}

impl EventTransformer for PassThrough {
    fn transform(&self, input: &Value) -> Result<Value> {
        Ok(input.clone())
    }

    fn name(&self) -> &str {
        "PassThrough"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_field_mapper() {
        let mapper = FieldMapper {
            mappings: [("user_name".into(), "name".into())].into(),
        };
        let input = json!({"name": "Alice", "age": 30});
        let output = mapper.transform(&input).unwrap();
        assert_eq!(output["user_name"], "Alice");
        assert_eq!(output["age"], 30);
    }

    #[test]
    fn test_field_filter_include() {
        let filter = FieldFilter {
            include: Some(vec!["name".into(), "age".into()]),
            exclude: None,
        };
        let input = json!({"name": "Alice", "age": 30, "secret": "hidden"});
        let output = filter.transform(&input).unwrap();
        assert_eq!(output["name"], "Alice");
        assert!(output.get("secret").is_none());
    }

    #[test]
    fn test_field_filter_exclude() {
        let filter = FieldFilter {
            include: None,
            exclude: Some(vec!["secret".into()]),
        };
        let input = json!({"name": "Alice", "secret": "hidden"});
        let output = filter.transform(&input).unwrap();
        assert_eq!(output["name"], "Alice");
        assert!(output.get("secret").is_none());
    }

    #[test]
    fn test_value_transformer_uppercase() {
        let transformer = ValueTransformer {
            operations: vec![ValueOperation {
                field: "email".into(),
                op: ValueOp::Uppercase,
                format: None,
            }],
        };
        let input = json!({"email": "alice@example.com"});
        let output = transformer.transform(&input).unwrap();
        assert_eq!(output["email"], "ALICE@EXAMPLE.COM");
    }

    #[test]
    fn test_json_template() {
        let template = JsonTemplate {
            template: json!({
                "user_name": "{{name}}",
                "source": "hooksniff"
            }),
        };
        let input = json!({"name": "Alice", "age": 30});
        let output = template.transform(&input).unwrap();
        assert_eq!(output["user_name"], "Alice");
        assert_eq!(output["source"], "hooksniff");
    }
}
