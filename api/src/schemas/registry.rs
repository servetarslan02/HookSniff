//! Schema registry CRUD operations.
//!
//! Provides database operations for managing event schemas,
//! including version tracking and compatibility checking.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::PgPool;
use tracing::{debug, info, warn};
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
