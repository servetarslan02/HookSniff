//! Schema registry API routes for HookRelay.
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
    Json(request): Json<RegisterSchemaRequest>,
) -> Result<Json<Value>, AppError> {
    let registry = SchemaRegistry::new(pool);

    if request.name.is_empty() {
        return Err(AppError::BadRequest("Schema name is required".into()));
    }

    let schema = registry
        .register(customer.id, request)
        .await
        .map_err(|e| AppError::BadRequest(e.to_string()))?;

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
    Path(id): Path<Uuid>,
) -> Result<Json<Value>, AppError> {
    let registry = SchemaRegistry::new(pool);

    let schema = registry
        .get(id)
        .await?
        .ok_or(AppError::NotFound)?;

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
    Path(id): Path<Uuid>,
    Json(request): Json<ValidateEventRequest>,
) -> Result<Json<Value>, AppError> {
    let registry = SchemaRegistry::new(pool);

    let result = registry.validate(id, request).await?;

    Ok(Json(json!({
        "valid": result.valid,
        "errors": result.errors,
    })))
}
