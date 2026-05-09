//! Schema registry CRUD operations.
//!
//! Provides database operations for managing event schemas,
//! including version tracking and compatibility checking.

use anyhow::{Context, Result};
use serde_json::Value;
use sqlx::PgPool;
use tracing::{info, warn};
use uuid::Uuid;

use super::{
    auto_detect_schema, check_compatibility, validate_event, EventSchema, RegisterSchemaRequest,
    ValidateEventRequest, ValidationResult,
};

/// Schema registry for managing event schemas.
pub struct SchemaRegistry {
    pool: PgPool,
}

impl SchemaRegistry {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Register a new schema or create a new version.
    ///
    /// If a schema with the same name already exists for this customer,
    /// creates a new version (only if backward-compatible).
    pub async fn register(
        &self,
        customer_id: Uuid,
        request: RegisterSchemaRequest,
    ) -> Result<EventSchema> {
        // Check if schema already exists
        let existing = self.get_latest_by_name(customer_id, &request.name).await?;

        let schema = if request.auto_detect {
            // Auto-detect is only valid for the first version
            if existing.is_some() {
                return Err(anyhow::anyhow!(
                    "Cannot auto-detect schema for existing schema '{}'. Provide a schema definition.",
                    request.name
                ));
            }
            // Will be populated when the first event arrives
            serde_json::json!({"type": "object", "auto_detect": true})
        } else {
            request.schema.clone()
        };

        let version = if let Some(ref existing_schema) = existing {
            // Check backward compatibility
            let compat = check_compatibility(&existing_schema.schema, &schema);
            if !compat.compatible {
                warn!(
                    "Schema '{}' v{} is not backward-compatible: {:?}",
                    request.name,
                    existing_schema.version + 1,
                    compat.issues
                );
                return Err(anyhow::anyhow!(
                    "Schema is not backward-compatible: {}",
                    compat.issues.join(", ")
                ));
            }
            existing_schema.version + 1
        } else {
            1
        };

        // Insert the schema
        let id = Uuid::new_v4();
        sqlx::query(
            "INSERT INTO event_schemas (id, name, version, schema, customer_id) \
             VALUES ($1, $2, $3, $4, $5)",
        )
        .bind(id)
        .bind(&request.name)
        .bind(version)
        .bind(&schema)
        .bind(customer_id)
        .execute(&self.pool)
        .await
        .context("Failed to register schema")?;

        info!(
            "📝 Registered schema '{}' v{} for customer {}",
            request.name, version, customer_id
        );

        Ok(EventSchema {
            id,
            name: request.name,
            version,
            schema,
            customer_id,
            created_at: chrono::Utc::now(),
        })
    }

    /// Get all schemas for a customer.
    pub async fn list(&self, customer_id: Uuid) -> Result<Vec<EventSchema>> {
        let rows: Vec<EventSchemaRow> = sqlx::query_as(
            "SELECT id, name, version, schema, customer_id, created_at \
             FROM event_schemas WHERE customer_id = $1 ORDER BY name, version DESC",
        )
        .bind(customer_id)
        .fetch_all(&self.pool)
        .await
        .context("Failed to list schemas")?;

        Ok(rows.into_iter().map(|r| r.into()).collect())
    }

    /// Get a schema by ID.
    pub async fn get(&self, id: Uuid) -> Result<Option<EventSchema>> {
        let row: Option<EventSchemaRow> = sqlx::query_as(
            "SELECT id, name, version, schema, customer_id, created_at \
             FROM event_schemas WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .context("Failed to get schema")?;

        Ok(row.map(|r| r.into()))
    }

    /// Get the latest version of a schema by name.
    pub async fn get_latest_by_name(
        &self,
        customer_id: Uuid,
        name: &str,
    ) -> Result<Option<EventSchema>> {
        let row: Option<EventSchemaRow> = sqlx::query_as(
            "SELECT id, name, version, schema, customer_id, created_at \
             FROM event_schemas WHERE customer_id = $1 AND name = $2 \
             ORDER BY version DESC LIMIT 1",
        )
        .bind(customer_id)
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .context("Failed to get schema by name")?;

        Ok(row.map(|r| r.into()))
    }

    /// Validate an event against a schema.
    pub async fn validate(
        &self,
        schema_id: Uuid,
        request: ValidateEventRequest,
    ) -> Result<ValidationResult> {
        let schema = self.get(schema_id).await?.context("Schema not found")?;

        Ok(validate_event(&schema.schema, &request.event))
    }

    /// Auto-detect and update a schema from an event.
    ///
    /// Used when a schema was registered with `auto_detect: true`
    /// and the first event arrives.
    pub async fn update_from_event(&self, schema_id: Uuid, event: &Value) -> Result<EventSchema> {
        let detected = auto_detect_schema(event);

        sqlx::query("UPDATE event_schemas SET schema = $1 WHERE id = $2")
            .bind(&detected)
            .bind(schema_id)
            .execute(&self.pool)
            .await
            .context("Failed to update schema from event")?;

        info!("📝 Auto-detected schema for {}", schema_id);

        let schema = self
            .get(schema_id)
            .await?
            .context("Schema not found after update")?;

        Ok(schema)
    }
}

/// Database row for event_schemas table.
#[derive(Debug, sqlx::FromRow)]
struct EventSchemaRow {
    id: Uuid,
    name: String,
    version: i32,
    schema: Value,
    customer_id: Uuid,
    created_at: chrono::DateTime<chrono::Utc>,
}

impl From<EventSchemaRow> for EventSchema {
    fn from(row: EventSchemaRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            version: row.version,
            schema: row.schema,
            customer_id: row.customer_id,
            created_at: row.created_at,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::{CompatibilityResult, ValidationError};
    use serde_json::json;

    #[test]
    fn test_event_schema_serialization_roundtrip() {
        let schema = EventSchema {
            id: Uuid::new_v4(),
            name: "order.created".to_string(),
            version: 1,
            schema: json!({"type": "object", "properties": {"id": {"type": "string"}}}),
            customer_id: Uuid::new_v4(),
            created_at: chrono::Utc::now(),
        };
        let json_str = serde_json::to_string(&schema).unwrap();
        let deserialized: EventSchema = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.name, "order.created");
        assert_eq!(deserialized.version, 1);
        assert_eq!(deserialized.schema["type"], "object");
    }

    #[test]
    fn test_register_schema_request_deserialization() {
        let json = r#"{
            "name": "user.created",
            "schema": {"type": "object", "properties": {"email": {"type": "string"}}},
            "auto_detect": false
        }"#;
        let req: RegisterSchemaRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "user.created");
        assert!(!req.auto_detect);
        assert_eq!(req.schema["type"], "object");
    }

    #[test]
    fn test_register_schema_request_auto_detect_default() {
        let json = r#"{
            "name": "test.event",
            "schema": {}
        }"#;
        let req: RegisterSchemaRequest = serde_json::from_str(json).unwrap();
        assert!(!req.auto_detect); // default is false
    }

    #[test]
    fn test_validate_event_request_deserialization() {
        let json = r#"{"event": {"name": "test", "value": 42}}"#;
        let req: ValidateEventRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.event["name"], "test");
        assert_eq!(req.event["value"], 42);
    }

    #[test]
    fn test_validation_result_serialization() {
        let result = ValidationResult {
            valid: true,
            errors: vec![],
        };
        let json = serde_json::to_value(&result).unwrap();
        assert!(json["valid"].as_bool().unwrap());
        assert!(json["errors"].as_array().unwrap().is_empty());
    }

    #[test]
    fn test_validation_result_with_errors() {
        let result = ValidationResult {
            valid: false,
            errors: vec![
                ValidationError {
                    path: "data.email".to_string(),
                    message: "Expected string, got number".to_string(),
                    expected: Some("string".to_string()),
                    actual: Some("number".to_string()),
                },
            ],
        };
        let json = serde_json::to_value(&result).unwrap();
        assert!(!json["valid"].as_bool().unwrap());
        assert_eq!(json["errors"].as_array().unwrap().len(), 1);
        assert_eq!(json["errors"][0]["path"], "data.email");
    }

    #[test]
    fn test_validation_error_serialization() {
        let err = ValidationError {
            path: "root.field".to_string(),
            message: "Missing required field".to_string(),
            expected: Some("present".to_string()),
            actual: Some("missing".to_string()),
        };
        let json = serde_json::to_value(&err).unwrap();
        assert_eq!(json["path"], "root.field");
        assert_eq!(json["message"], "Missing required field");
        assert_eq!(json["expected"], "present");
        assert_eq!(json["actual"], "missing");
    }

    #[test]
    fn test_validation_error_optional_fields() {
        let err = ValidationError {
            path: "".to_string(),
            message: "error".to_string(),
            expected: None,
            actual: None,
        };
        let json = serde_json::to_value(&err).unwrap();
        assert!(json["expected"].is_null());
        assert!(json["actual"].is_null());
    }

    #[test]
    fn test_event_schema_clone() {
        let schema = EventSchema {
            id: Uuid::new_v4(),
            name: "test".to_string(),
            version: 1,
            schema: json!({"type": "string"}),
            customer_id: Uuid::new_v4(),
            created_at: chrono::Utc::now(),
        };
        let cloned = schema.clone();
        assert_eq!(cloned.id, schema.id);
        assert_eq!(cloned.name, schema.name);
        assert_eq!(cloned.version, schema.version);
    }

    #[test]
    fn test_compatibility_result_serialization() {
        let result = CompatibilityResult {
            compatible: true,
            issues: vec![],
        };
        let json = serde_json::to_value(&result).unwrap();
        assert!(json["compatible"].as_bool().unwrap());

        let result_with_issues = CompatibilityResult {
            compatible: false,
            issues: vec!["Type changed at 'email'".to_string()],
        };
        let json = serde_json::to_value(&result_with_issues).unwrap();
        assert!(!json["compatible"].as_bool().unwrap());
        assert_eq!(json["issues"][0], "Type changed at 'email'");
    }

    #[test]
    fn test_schema_registry_new() {
        // We can't easily create a PgPool without a real database,
        // but we can verify the struct signature compiles correctly.
        // This test ensures the type exists and has the expected shape.
        // SchemaRegistry::new requires PgPool, so we just verify the
        // EventSchemaRow -> EventSchema conversion works.
        let row = EventSchemaRow {
            id: Uuid::new_v4(),
            name: "test_schema".to_string(),
            version: 2,
            schema: json!({"type": "object", "properties": {"name": {"type": "string"}}}),
            customer_id: Uuid::new_v4(),
            created_at: chrono::Utc::now(),
        };
        let schema: EventSchema = row.into();
        assert_eq!(schema.name, "test_schema");
        assert_eq!(schema.version, 2);
        assert_eq!(schema.schema["type"], "object");
    }

    #[test]
    fn test_register_schema_request_auto_detect_true() {
        let json = r#"{
            "name": "auto.schema",
            "schema": {},
            "auto_detect": true
        }"#;
        let req: RegisterSchemaRequest = serde_json::from_str(json).unwrap();
        assert!(req.auto_detect);
    }
}
