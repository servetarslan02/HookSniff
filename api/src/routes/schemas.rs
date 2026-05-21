//! Schema registry API routes for HookSniff.
//!
//! Provides CRUD endpoints for managing event schemas:
//! - POST /v1/schemas — Register schema
//! - GET /v1/schemas — List schemas
//! - GET /v1/schemas/{id} — Get schema
//! - POST /v1/schemas/{id}/validate — Validate event against schema

use axum::{
    extract::{Extension, Path},
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::AppError;
use crate::models::customer::Customer;
use crate::schemas::registry::SchemaRegistry;
use crate::schemas::{RegisterSchemaRequest, ValidateEventRequest};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_schemas).post(register_schema))
        .route("/{id}", get(get_schema))
        .route("/{id}/validate", post(validate_event))
}

/// POST /v1/schemas — Register a new schema.
async fn register_schema(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(request): Json<RegisterSchemaRequest>,
) -> Result<Json<Value>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    let registry = SchemaRegistry::new(pool.clone());

    if request.name.is_empty() {
        return Err(AppError::BadRequest("Schema name is required".into()));
    }

    // Plan-based event type limit check
    // Only enforce limit for NEW event types (not new versions of existing ones)
    let plan = Plan::parse_str(&customer.plan);
    let max_types = plan.max_event_types();

    let existing = registry
        .get_latest_by_name(customer.id, &request.name)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;

    if existing.is_none() {
        // New event type — check limit
        let distinct_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(DISTINCT name) FROM event_schemas WHERE customer_id = $1",
        )
        .bind(customer.id)
        .fetch_one(&pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;

        if distinct_count.0 as u32 >= max_types {
            return Err(AppError::BadRequest(format!(
                "Event type limit reached ({max_types}). Upgrade your plan for more event types."
            )));
        }
    }

    let schema = registry.register(customer.id, request).await.map_err(|e| {
        tracing::warn!("Schema registration error: {:?}", e);
        AppError::BadRequest("Invalid schema".into())
    })?;

    Ok(Json(json!({
        "id": schema.id,
        "name": schema.name,
        "version": schema.version,
        "schema": schema.schema,
        "created_at": schema.created_at,
    })))
}

/// GET /v1/schemas — List all schemas for the customer.
async fn list_schemas(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Value>, AppError> {
    let registry = SchemaRegistry::new(pool);

    let schemas = registry.list(customer.id).await?;

    let items: Vec<Value> = schemas
        .into_iter()
        .map(|s| {
            json!({
                "id": s.id,
                "name": s.name,
                "version": s.version,
                "schema": s.schema,
                "created_at": s.created_at,
            })
        })
        .collect();

    Ok(Json(json!({
        "schemas": items,
        "total": items.len(),
    })))
}

/// GET /v1/schemas/{id} — Get a schema by ID.
async fn get_schema(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Value>, AppError> {
    let registry = SchemaRegistry::new(pool);

    let schema = registry.get(id).await?.ok_or(AppError::NotFound)?;

    // Ownership check — customers can only access their own schemas
    if schema.customer_id != customer.id {
        return Err(AppError::NotFound);
    }

    Ok(Json(json!({
        "id": schema.id,
        "name": schema.name,
        "version": schema.version,
        "schema": schema.schema,
        "customer_id": schema.customer_id,
        "created_at": schema.created_at,
    })))
}

/// POST /v1/schemas/{id}/validate — Validate an event against a schema.
async fn validate_event(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(request): Json<ValidateEventRequest>,
) -> Result<Json<Value>, AppError> {
    let registry = SchemaRegistry::new(pool);

    // Ownership check — customers can only validate against their own schemas
    let schema = registry.get(id).await?.ok_or(AppError::NotFound)?;
    if schema.customer_id != customer.id {
        return Err(AppError::NotFound);
    }

    let result = registry.validate(id, request).await?;

    Ok(Json(json!({
        "valid": result.valid,
        "errors": result.errors,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schemas::{
        EventSchema, RegisterSchemaRequest, ValidateEventRequest, ValidationError, ValidationResult,
    };

    // ── RegisterSchemaRequest ───────────────────────────────

    #[test]
    fn test_register_schema_request_deserialization() {
        let json = r#"{
            "name": "order.created",
            "schema": {"type": "object", "properties": {"order_id": {"type": "string"}}},
            "auto_detect": false
        }"#;
        let req: RegisterSchemaRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "order.created");
        assert!(!req.auto_detect);
        assert!(req.schema.is_object());
    }

    #[test]
    fn test_register_schema_request_auto_detect_default() {
        let json = r#"{
            "name": "user.signup",
            "schema": {}
        }"#;
        let req: RegisterSchemaRequest = serde_json::from_str(json).unwrap();
        assert!(!req.auto_detect); // default false
    }

    // ── ValidateEventRequest ────────────────────────────────

    #[test]
    fn test_validate_event_request_deserialization() {
        let json = r#"{"event": {"order_id": "ord_123", "total": 49.99}}"#;
        let req: ValidateEventRequest = serde_json::from_str(json).unwrap();
        assert!(req.event.is_object());
        assert_eq!(req.event["order_id"], "ord_123");
    }

    // ── ValidationResult ────────────────────────────────────

    #[test]
    fn test_validation_result_valid() {
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
            errors: vec![ValidationError {
                path: "/order_id".to_string(),
                message: "Expected string, got number".to_string(),
                expected: Some("string".to_string()),
                actual: Some("number".to_string()),
            }],
        };
        let json = serde_json::to_value(&result).unwrap();
        assert!(!json["valid"].as_bool().unwrap());
        assert_eq!(json["errors"].as_array().unwrap().len(), 1);
    }

    // ── EventSchema ─────────────────────────────────────────

    #[test]
    fn test_event_schema_serialization() {
        let schema = EventSchema {
            id: Uuid::new_v4(),
            name: "order.created".to_string(),
            version: 1,
            schema: serde_json::json!({"type": "object"}),
            customer_id: Uuid::new_v4(),
            created_at: chrono::Utc::now(),
        };
        let json = serde_json::to_value(&schema).unwrap();
        assert_eq!(json["name"], "order.created");
        assert_eq!(json["version"], 1);
    }

    #[test]
    fn test_event_schema_clone() {
        let schema = EventSchema {
            id: Uuid::new_v4(),
            name: "test".to_string(),
            version: 1,
            schema: serde_json::json!({}),
            customer_id: Uuid::new_v4(),
            created_at: chrono::Utc::now(),
        };
        let cloned = schema.clone();
        assert_eq!(cloned.name, schema.name);
        assert_eq!(cloned.id, schema.id);
    }

    // ── ValidationError ─────────────────────────────────────

    #[test]
    fn test_validation_error_serialization() {
        let err = ValidationError {
            path: "/name".to_string(),
            message: "Required field missing".to_string(),
            expected: Some("string".to_string()),
            actual: None,
        };
        let json = serde_json::to_value(&err).unwrap();
        assert_eq!(json["path"], "/name");
        assert_eq!(json["message"], "Required field missing");
        assert!(json["actual"].is_null());
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_schemas_router_construction() {
        let _router = router();
    }
}
