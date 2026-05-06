//! Event filtering for HookRelay's event mesh.
//!
//! Provides conditional filtering based on JSON path evaluation,
//! comparison operators, and logical operators (AND, OR, NOT).

use anyhow::{Context, Result};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Conditional filter that evaluates whether an event matches a set of
/// conditions. Used for conditional fan-out and event routing.
///
/// Config format:
/// ```json
/// {
///   "conditions": {
///     "op": "and",
///     "conditions": [
///       {"field": "amount", "op": "gt", "value": 1000},
///       {"field": "currency", "op": "equals", "value": "USD"}
///     ]
///   }
/// }
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionalFilter {
    pub conditions: Condition,
}

/// A single condition or a logical group of conditions.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case")]
pub enum Condition {
    /// Comparison: field equals value
    Equals {
        field: String,
        value: Value,
    },
    /// Comparison: field does not equal value
    NotEquals {
        field: String,
        value: Value,
    },
    /// Comparison: field contains substring (for strings) or element (for arrays)
    Contains {
        field: String,
        value: Value,
    },
    /// Comparison: field starts with prefix
    StartsWith {
        field: String,
        value: String,
    },
    /// Comparison: field matches regex pattern
    Regex {
        field: String,
        pattern: String,
    },
    /// Comparison: numeric field greater than value
    GreaterThan {
        field: String,
        value: f64,
    },
    /// Comparison: numeric field less than value
    LessThan {
        field: String,
        value: f64,
    },
    /// Comparison: field exists (is not null)
    Exists {
        field: String,
    },
    /// Comparison: field is null or missing
    NotExists {
        field: String,
    },
    /// Logical: all conditions must match
    And {
        conditions: Vec<Condition>,
    },
    /// Logical: any condition must match
    Or {
        conditions: Vec<Condition>,
    },
    /// Logical: condition must not match
    Not {
        condition: Box<Condition>,
    },
}

impl ConditionalFilter {
    /// Create a filter from a config value.
    pub fn from_config(config: &Value) -> Result<Self> {
        let conditions: Condition = serde_json::from_value(
            config
                .get("conditions")
                .cloned()
                .context("Conditional filter requires 'conditions' field")?,
        )
        .context("Invalid condition format")?;

        Ok(Self { conditions })
    }

    /// Evaluate the filter against an event.
    pub fn matches(&self, event: &Value) -> Result<bool> {
        evaluate_condition(&self.conditions, event)
    }
}

/// Evaluate a condition against an event value.
fn evaluate_condition(condition: &Condition, event: &Value) -> Result<bool> {
    match condition {
        Condition::Equals { field, value } => {
            let field_value = resolve_json_path(event, field);
            Ok(field_value.as_ref() == Some(&value))
        }
        Condition::NotEquals { field, value } => {
            let field_value = resolve_json_path(event, field);
            Ok(field_value.as_ref() != Some(&value))
        }
        Condition::Contains { field, value } => {
            let field_value = resolve_json_path(event, field);
            match field_value {
                Some(Value::String(s)) => {
                    let needle = value.as_str().unwrap_or("");
                    Ok(s.contains(needle))
                }
                Some(Value::Array(arr)) => Ok(arr.contains(value)),
                _ => Ok(false),
            }
        }
        Condition::StartsWith { field, value } => {
            let field_value = resolve_json_path(event, field);
            match field_value {
                Some(Value::String(s)) => Ok(s.starts_with(value)),
                _ => Ok(false),
            }
        }
        Condition::Regex { field, pattern } => {
            let field_value = resolve_json_path(event, field);
            match field_value {
                Some(Value::String(s)) => {
                    let re = Regex::new(pattern)
                        .context(format!("Invalid regex pattern: {}", pattern))?;
                    Ok(re.is_match(&s))
                }
                _ => Ok(false),
            }
        }
        Condition::GreaterThan { field, value } => {
            let field_value = resolve_json_path(event, field);
            match field_value {
                Some(v) => {
                    let num = v.as_f64().unwrap_or(0.0);
                    Ok(num > *value)
                }
                None => Ok(false),
            }
        }
        Condition::LessThan { field, value } => {
            let field_value = resolve_json_path(event, field);
            match field_value {
                Some(v) => {
                    let num = v.as_f64().unwrap_or(0.0);
                    Ok(num < *value)
                }
                None => Ok(false),
            }
        }
        Condition::Exists { field } => {
            let field_value = resolve_json_path(event, field);
            Ok(field_value.is_some() && field_value.as_ref() != Some(&&Value::Null))
        }
        Condition::NotExists { field } => {
            let field_value = resolve_json_path(event, field);
            Ok(field_value.is_none() || field_value.as_ref() == Some(&&Value::Null))
        }
        Condition::And { conditions } => {
            for c in conditions {
                if !evaluate_condition(c, event)? {
                    return Ok(false);
                }
            }
            Ok(true)
        }
        Condition::Or { conditions } => {
            for c in conditions {
                if evaluate_condition(c, event)? {
                    return Ok(true);
                }
            }
            Ok(false)
        }
        Condition::Not { condition } => {
            Ok(!evaluate_condition(condition, event)?)
        }
    }
}

/// Resolve a JSON path to a value.
///
/// Supports dot notation: "user.address.city" resolves to
/// event["user"]["address"]["city"].
///
/// Supports array indexing: "items.0.name" resolves to
/// event["items"][0]["name"].
fn resolve_json_path<'a>(event: &'a Value, path: &str) -> Option<&'a Value> {
    let parts: Vec<&str> = path.split('.').collect();
    let mut current = event;

    for part in parts {
        current = match current {
            Value::Object(obj) => obj.get(part),
            Value::Array(arr) => {
                if let Ok(index) = part.parse::<usize>() {
                    arr.get(index)
                } else {
                    return None;
                }
            }
            _ => return None,
        }?;
    }

    Some(current)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_equals_condition() {
        let filter = ConditionalFilter {
            conditions: Condition::Equals {
                field: "status".into(),
                value: json!("active"),
            },
        };
        assert!(filter.matches(&json!({"status": "active"})).unwrap());
        assert!(!filter.matches(&json!({"status": "inactive"})).unwrap());
    }

    #[test]
    fn test_greater_than_condition() {
        let filter = ConditionalFilter {
            conditions: Condition::GreaterThan {
                field: "amount".into(),
                value: 1000.0,
            },
        };
        assert!(filter.matches(&json!({"amount": 1500})).unwrap());
        assert!(!filter.matches(&json!({"amount": 500})).unwrap());
    }

    #[test]
    fn test_and_condition() {
        let filter = ConditionalFilter {
            conditions: Condition::And {
                conditions: vec![
                    Condition::GreaterThan {
                        field: "amount".into(),
                        value: 1000.0,
                    },
                    Condition::Equals {
                        field: "currency".into(),
                        value: json!("USD"),
                    },
                ],
            },
        };
        assert!(filter.matches(&json!({"amount": 1500, "currency": "USD"})).unwrap());
        assert!(!filter.matches(&json!({"amount": 1500, "currency": "EUR"})).unwrap());
        assert!(!filter.matches(&json!({"amount": 500, "currency": "USD"})).unwrap());
    }

    #[test]
    fn test_or_condition() {
        let filter = ConditionalFilter {
            conditions: Condition::Or {
                conditions: vec![
                    Condition::Equals {
                        field: "priority".into(),
                        value: json!("high"),
                    },
                    Condition::Equals {
                        field: "priority".into(),
                        value: json!("critical"),
                    },
                ],
            },
        };
        assert!(filter.matches(&json!({"priority": "high"})).unwrap());
        assert!(filter.matches(&json!({"priority": "critical"})).unwrap());
        assert!(!filter.matches(&json!({"priority": "low"})).unwrap());
    }

    #[test]
    fn test_not_condition() {
        let filter = ConditionalFilter {
            conditions: Condition::Not {
                condition: Box::new(Condition::Equals {
                    field: "status".into(),
                    value: json!("deleted"),
                }),
            },
        };
        assert!(filter.matches(&json!({"status": "active"})).unwrap());
        assert!(!filter.matches(&json!({"status": "deleted"})).unwrap());
    }

    #[test]
    fn test_nested_json_path() {
        let filter = ConditionalFilter {
            conditions: Condition::Equals {
                field: "user.address.country".into(),
                value: json!("US"),
            },
        };
        assert!(filter
            .matches(&json!({"user": {"address": {"country": "US"}}}))
            .unwrap());
        assert!(!filter
            .matches(&json!({"user": {"address": {"country": "UK"}}}))
            .unwrap());
    }

    #[test]
    fn test_contains_string() {
        let filter = ConditionalFilter {
            conditions: Condition::Contains {
                field: "email".into(),
                value: json!("@example.com"),
            },
        };
        assert!(filter.matches(&json!({"email": "alice@example.com"})).unwrap());
        assert!(!filter.matches(&json!({"email": "alice@other.com"})).unwrap());
    }

    #[test]
    fn test_regex_condition() {
        let filter = ConditionalFilter {
            conditions: Condition::Regex {
                field: "phone".into(),
                pattern: r"^\+1\d{10}$".into(),
            },
        };
        assert!(filter.matches(&json!({"phone": "+12345678901"})).unwrap());
        assert!(!filter.matches(&json!({"phone": "1234567890"})).unwrap());
    }
}
