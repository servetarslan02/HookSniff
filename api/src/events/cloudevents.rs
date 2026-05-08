//! CloudEvents v1.0 implementation for HookSniff.
//!
//! Follows the CloudEvents spec: https://cloudevents.io/
//!
//! Required attributes: specversion, type, source, id, time
//! Optional attributes: datacontenttype, dataschema, subject

use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A CloudEvent following the CloudEvents spec v1.0.
///
/// When serialized to JSON, uses the [CloudEvents JSON format](https://github.com/cloudevents/spec/blob/v1.0/json-format.md).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudEvent {
    /// CloudEvents spec version — always "1.0".
    pub specversion: String,

    /// Event type in reverse-domain notation.
    /// Example: `com.hooksniff.delivery.completed`
    #[serde(rename = "type")]
    pub event_type: String,

    /// Event source — identifies the context in which the event originated.
    /// Example: `https://hooksniff-api-1046140057667.europe-west1.run.app`
    pub source: String,

    /// Unique event ID.
    pub id: String,

    /// Event timestamp in RFC 3339 format.
    pub time: String,

    /// Content type of the `data` attribute (optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub datacontenttype: Option<String>,

    /// URI identifying the schema of the `data` attribute (optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dataschema: Option<String>,

    /// Subject of the event in the context of the event source (optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subject: Option<String>,

    /// The event payload (optional).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

/// Extension attributes that can be attached to a CloudEvent.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CloudEventExtensions {
    /// Custom extension attributes.
    #[serde(flatten)]
    pub custom: std::collections::HashMap<String, serde_json::Value>,
}

impl CloudEvent {
    /// Create a new CloudEvent with required attributes.
    pub fn new(
        event_type: impl Into<String>,
        source: impl Into<String>,
        data: Option<serde_json::Value>,
    ) -> Self {
        Self {
            specversion: "1.0".to_string(),
            event_type: event_type.into(),
            source: source.into(),
            id: Uuid::new_v4().to_string(),
            time: Utc::now().to_rfc3339(),
            datacontenttype: Some("application/json".to_string()),
            dataschema: None,
            subject: None,
            data,
        }
    }

    /// Create a CloudEvent from a webhook delivery.
    ///
    /// Wraps the delivery payload in a CloudEvent envelope with
    /// delivery-specific metadata.
    pub fn from_delivery(
        event_type: &str,
        delivery_id: &str,
        endpoint_id: &str,
        payload: serde_json::Value,
    ) -> Self {
        let mut ce = Self::new(
            event_type,
            "https://hooksniff-api-1046140057667.europe-west1.run.app",
            Some(payload),
        );
        ce.id = delivery_id.to_string();
        ce.subject = Some(endpoint_id.to_string());
        ce
    }

    /// Serialize to JSON string.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Serialize to pretty JSON string.
    pub fn to_json_pretty(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Parse a CloudEvent from JSON.
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    /// Parse a CloudEvent from a JSON value.
    pub fn from_value(value: &serde_json::Value) -> Result<Self, serde_json::Error> {
        serde_json::from_value(value.clone())
    }

    /// Validate that all required attributes are present and well-formed.
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();

        if self.specversion != "1.0" {
            errors.push(format!(
                "specversion must be '1.0', got '{}'",
                self.specversion
            ));
        }

        if self.event_type.is_empty() {
            errors.push("type is required".to_string());
        }

        if self.source.is_empty() {
            errors.push("source is required".to_string());
        }

        if self.id.is_empty() {
            errors.push("id is required".to_string());
        }

        if self.time.is_empty() {
            errors.push("time is required".to_string());
        } else if chrono::DateTime::parse_from_rfc3339(&self.time).is_err() {
            errors.push(format!("time must be RFC 3339, got '{}'", self.time));
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}

impl std::fmt::Display for CloudEvent {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "[{}] {} from {} (id: {})",
            self.time, self.event_type, self.source, self.id
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cloud_event_creation() {
        let ce = CloudEvent::new(
            "com.hooksniff.delivery.completed",
            "https://hooksniff-api-1046140057667.europe-west1.run.app",
            Some(serde_json::json!({"delivery_id": "del_123"})),
        );

        assert_eq!(ce.specversion, "1.0");
        assert_eq!(ce.event_type, "com.hooksniff.delivery.completed");
        assert_eq!(
            ce.source,
            "https://hooksniff-api-1046140057667.europe-west1.run.app"
        );
        assert!(!ce.id.is_empty());
        assert!(!ce.time.is_empty());
        assert!(ce.validate().is_ok());
    }

    #[test]
    fn test_cloud_event_from_delivery() {
        let payload = serde_json::json!({"order_id": "ord_456", "amount": 99.99});
        let ce = CloudEvent::from_delivery(
            "com.hooksniff.delivery.completed",
            "del_789",
            "ep_012",
            payload,
        );

        assert_eq!(ce.id, "del_789");
        assert_eq!(ce.subject, Some("ep_012".to_string()));
        assert!(ce.data.is_some());
        assert!(ce.validate().is_ok());
    }

    #[test]
    fn test_cloud_event_json_roundtrip() {
        let ce = CloudEvent::new(
            "com.hooksniff.endpoint.created",
            "https://hooksniff-api-1046140057667.europe-west1.run.app",
            Some(serde_json::json!({"url": "https://example.com/hook"})),
        );

        let json = ce.to_json().unwrap();
        let parsed = CloudEvent::from_json(&json).unwrap();

        assert_eq!(ce.id, parsed.id);
        assert_eq!(ce.event_type, parsed.event_type);
        assert_eq!(ce.source, parsed.source);
    }

    #[test]
    fn test_cloud_event_validation() {
        let mut ce = CloudEvent::new("test", "source", None);
        assert!(ce.validate().is_ok());

        ce.specversion = "0.3".to_string();
        let errors = ce.validate().unwrap_err();
        assert!(errors.iter().any(|e| e.contains("specversion")));
    }

    #[test]
    fn test_cloud_event_display() {
        let ce = CloudEvent::new("test.event", "test-source", None);
        let display = format!("{}", ce);
        assert!(display.contains("test.event"));
        assert!(display.contains("test-source"));
    }

    #[test]
    fn test_cloud_event_json_structure() {
        let ce = CloudEvent::new(
            "test.event",
            "source",
            Some(serde_json::json!({"key": "value"})),
        );
        let json_str = ce.to_json().unwrap();
        let json: serde_json::Value = serde_json::from_str(&json_str).unwrap();

        assert_eq!(json["specversion"], "1.0");
        assert_eq!(json["type"], "test.event");
        assert_eq!(json["source"], "source");
        assert!(json["id"].is_string());
        assert!(json["time"].is_string());
        assert_eq!(json["datacontenttype"], "application/json");
        assert_eq!(json["data"]["key"], "value");
    }
}
