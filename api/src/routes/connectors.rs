//! Connectors — Manage external service integrations.
//!
//! Built-in connectors: Stripe, Shopify, GitHub, Slack, Twilio, Discord, Linear, Notion.
//! Each connector has a config schema and supported events.
//!
//! ## Endpoints
//!
//! - `GET    /v1/connectors`              — List available connectors
//! - `GET    /v1/connectors/{id}`         — Get connector details
//! - `GET    /v1/connectors/configs`      — List customer's connector configs
//! - `POST   /v1/connectors/configs`      — Create connector config
//! - `PUT    /v1/connectors/configs/{id}` — Update connector config
//! - `DELETE /v1/connectors/configs/{id}` — Delete connector config

use axum::extract::{Extension, Path};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_connectors))
        .route("/configs", get(list_configs).post(create_config))
        .route(
            "/configs/{id}",
            get(get_config).put(update_config).delete(delete_config),
        )
        .route("/{id}", get(get_connector))
}

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Connector {
    pub id: Uuid,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub icon_url: Option<String>,
    pub config_schema: serde_json::Value,
    pub supported_events: Option<Vec<String>>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ConnectorConfig {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub connector_id: Uuid,
    pub name: String,
    pub config: serde_json::Value,
    #[serde(skip_serializing)]
    pub credentials: serde_json::Value,
    pub is_active: bool,
    pub last_sync_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateConfigRequest {
    pub connector_id: Uuid,
    pub name: String,
    pub config: Option<serde_json::Value>,
    pub credentials: Option<serde_json::Value>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateConfigRequest {
    pub name: Option<String>,
    pub config: Option<serde_json::Value>,
    pub credentials: Option<serde_json::Value>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct ConnectorConfigResponse {
    pub id: Uuid,
    pub connector_id: Uuid,
    pub connector_name: String,
    pub connector_display_name: String,
    pub name: String,
    pub config: serde_json::Value,
    pub is_active: bool,
    pub last_sync_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

/// List all available connectors.
async fn list_connectors(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<Connector>>, AppError> {
    let connectors = sqlx::query_as::<_, Connector>(
        "SELECT id, name, display_name, description, icon_url, config_schema, supported_events, is_active, created_at, updated_at \
         FROM connectors WHERE is_active = true ORDER BY display_name",
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(connectors))
}

/// Get a single connector by ID.
async fn get_connector(
    Extension(pool): Extension<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Connector>, AppError> {
    let connector = sqlx::query_as::<_, Connector>(
        "SELECT id, name, display_name, description, icon_url, config_schema, supported_events, is_active, created_at, updated_at \
         FROM connectors WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(connector))
}

/// List customer's connector configs.
async fn list_configs(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<ConnectorConfigResponse>>, AppError> {
    let configs = sqlx::query_as::<_, ConfigJoinRow>(
        "SELECT cc.id, cc.connector_id, cc.name, cc.config, cc.is_active, cc.last_sync_at, \
         cc.created_at, cc.updated_at, c.name as connector_name, c.display_name as connector_display_name \
         FROM connector_configs cc \
         JOIN connectors c ON cc.connector_id = c.id \
         WHERE cc.customer_id = $1 \
         ORDER BY cc.created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let responses: Vec<ConnectorConfigResponse> = configs
        .into_iter()
        .map(|r| ConnectorConfigResponse {
            id: r.id,
            connector_id: r.connector_id,
            connector_name: r.connector_name,
            connector_display_name: r.connector_display_name,
            name: r.name,
            config: r.config,
            is_active: r.is_active,
            last_sync_at: r.last_sync_at,
            created_at: r.created_at,
            updated_at: r.updated_at,
        })
        .collect();

    Ok(Json(responses))
}

/// Get a single connector config.
async fn get_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<ConnectorConfigResponse>, AppError> {
    let config = sqlx::query_as::<_, ConfigJoinRow>(
        "SELECT cc.id, cc.connector_id, cc.name, cc.config, cc.is_active, cc.last_sync_at, \
         cc.created_at, cc.updated_at, c.name as connector_name, c.display_name as connector_display_name \
         FROM connector_configs cc \
         JOIN connectors c ON cc.connector_id = c.id \
         WHERE cc.id = $1 AND cc.customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(ConnectorConfigResponse {
        id: config.id,
        connector_id: config.connector_id,
        connector_name: config.connector_name,
        connector_display_name: config.connector_display_name,
        name: config.name,
        config: config.config,
        is_active: config.is_active,
        last_sync_at: config.last_sync_at,
        created_at: config.created_at,
        updated_at: config.updated_at,
    }))
}

/// Create a new connector config.
async fn create_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<CreateConfigRequest>,
) -> Result<Json<ConnectorConfigResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Verify connector exists
    let connector_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM connectors WHERE id = $1 AND is_active = true)",
    )
    .bind(req.connector_id)
    .fetch_one(&pool)
    .await?;

    if !connector_exists {
        return Err(AppError::NotFound);
    }

    let config = sqlx::query_as::<_, ConnectorConfig>(
        "INSERT INTO connector_configs (customer_id, connector_id, name, config, credentials, is_active) \
         VALUES ($1, $2, $3, $4, $5, $6) \
         RETURNING id, customer_id, connector_id, name, config, credentials, is_active, last_sync_at, created_at, updated_at",
    )
    .bind(customer.id)
    .bind(req.connector_id)
    .bind(&req.name)
    .bind(req.config.unwrap_or(serde_json::json!({})))
    .bind(req.credentials.unwrap_or(serde_json::json!({})))
    .bind(req.is_active.unwrap_or(true))
    .fetch_one(&pool)
    .await?;

    // Fetch connector name for response
    let connector = sqlx::query_as::<_, (String, String)>(
        "SELECT name, display_name FROM connectors WHERE id = $1",
    )
    .bind(req.connector_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(ConnectorConfigResponse {
        id: config.id,
        connector_id: config.connector_id,
        connector_name: connector.0,
        connector_display_name: connector.1,
        name: config.name,
        config: config.config,
        is_active: config.is_active,
        last_sync_at: config.last_sync_at,
        created_at: config.created_at,
        updated_at: config.updated_at,
    }))
}

/// Update a connector config.
async fn update_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateConfigRequest>,
) -> Result<Json<ConnectorConfigResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    let config = sqlx::query_as::<_, ConnectorConfig>(
        "UPDATE connector_configs SET \
         name = COALESCE($3, name), \
         config = COALESCE($4, config), \
         credentials = COALESCE($5, credentials), \
         is_active = COALESCE($6, is_active), \
         updated_at = now() \
         WHERE id = $1 AND customer_id = $2 \
         RETURNING id, customer_id, connector_id, name, config, credentials, is_active, last_sync_at, created_at, updated_at",
    )
    .bind(id)
    .bind(customer.id)
    .bind(req.name)
    .bind(req.config)
    .bind(req.credentials)
    .bind(req.is_active)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let connector = sqlx::query_as::<_, (String, String)>(
        "SELECT name, display_name FROM connectors WHERE id = $1",
    )
    .bind(config.connector_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(ConnectorConfigResponse {
        id: config.id,
        connector_id: config.connector_id,
        connector_name: connector.0,
        connector_display_name: connector.1,
        name: config.name,
        config: config.config,
        is_active: config.is_active,
        last_sync_at: config.last_sync_at,
        created_at: config.created_at,
        updated_at: config.updated_at,
    }))
}

/// Delete a connector config.
async fn delete_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
) -> Result<axum::Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    let result = sqlx::query(
        "DELETE FROM connector_configs WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(axum::Json(serde_json::json!({ "deleted": true })))
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

#[derive(Debug, sqlx::FromRow)]
struct ConfigJoinRow {
    id: Uuid,
    connector_id: Uuid,
    name: String,
    config: serde_json::Value,
    is_active: bool,
    last_sync_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    connector_name: String,
    connector_display_name: String,
}
