//! Integrations — Connect connectors to endpoints with event routing.
//!
//! An integration links a connector_config to an endpoint, defining which events
//! to forward and how to handle failures.
//!
//! ## Endpoints
//!
//! - `GET    /v1/integrations`              — List integrations
//! - `POST   /v1/integrations`              — Create integration
//! - `GET    /v1/integrations/{id}`         — Get integration details
//! - `PUT    /v1/integrations/{id}`         — Update integration
//! - `DELETE /v1/integrations/{id}`         — Delete integration
//! - `POST   /v1/integrations/{id}/test`    — Send test event
//! - `GET    /v1/integrations/{id}/events`  — List integration events
//! - `GET    /v1/integrations/{id}/stats`   — Get integration statistics

use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_integrations).post(create_integration))
        .route(
            "/{id}",
            get(get_integration)
                .put(update_integration)
                .delete(delete_integration),
        )
        .route("/{id}/test", post(test_integration))
        .route("/{id}/events", get(list_events))
        .route("/{id}/stats", get(get_stats))
}

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Integration {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub connector_config_id: Uuid,
    pub endpoint_id: Uuid,
    pub enabled: bool,
    pub event_filter: Option<Vec<String>>,
    pub transform_id: Option<Uuid>,
    pub retry_policy: serde_json::Value,
    pub metadata: serde_json::Value,
    pub last_triggered_at: Option<DateTime<Utc>>,
    pub last_success_at: Option<DateTime<Utc>>,
    pub last_failure_at: Option<DateTime<Utc>>,
    pub failure_count: i32,
    pub total_deliveries: i64,
    pub total_failures: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct IntegrationEvent {
    pub id: Uuid,
    pub integration_id: Uuid,
    pub event_type: String,
    pub source_event_id: Option<String>,
    pub payload: serde_json::Value,
    pub status: String,
    pub delivery_id: Option<Uuid>,
    pub error_message: Option<String>,
    pub attempts: i32,
    pub duration_ms: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub processed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct IntegrationResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub connector_config_id: Uuid,
    pub connector_name: String,
    pub connector_display_name: String,
    pub endpoint_id: Uuid,
    pub endpoint_url: String,
    pub enabled: bool,
    pub event_filter: Option<Vec<String>>,
    pub transform_id: Option<Uuid>,
    pub retry_policy: serde_json::Value,
    pub metadata: serde_json::Value,
    pub last_triggered_at: Option<DateTime<Utc>>,
    pub last_success_at: Option<DateTime<Utc>>,
    pub last_failure_at: Option<DateTime<Utc>>,
    pub failure_count: i32,
    pub total_deliveries: i64,
    pub total_failures: i64,
    pub health_status: String, // "healthy", "degraded", "failing"
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct IntegrationStats {
    pub total_events: i64,
    pub delivered: i64,
    pub failed: i64,
    pub pending: i64,
    pub filtered: i64,
    pub avg_duration_ms: Option<f64>,
    pub success_rate: f64,
    pub last_24h_events: i64,
    pub last_24h_failures: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateIntegrationRequest {
    pub name: String,
    pub description: Option<String>,
    pub connector_config_id: Uuid,
    pub endpoint_id: Uuid,
    pub event_filter: Option<Vec<String>>,
    pub transform_id: Option<Uuid>,
    pub retry_policy: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateIntegrationRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub endpoint_id: Option<Uuid>,
    pub event_filter: Option<Vec<String>>,
    pub transform_id: Option<Uuid>,
    pub retry_policy: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct EventFilter {
    pub status: Option<String>,
    pub event_type: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct IntegrationJoinRow {
    id: Uuid,
    customer_id: Uuid,
    name: String,
    description: Option<String>,
    connector_config_id: Uuid,
    endpoint_id: Uuid,
    enabled: bool,
    event_filter: Option<Vec<String>>,
    transform_id: Option<Uuid>,
    retry_policy: serde_json::Value,
    metadata: serde_json::Value,
    last_triggered_at: Option<DateTime<Utc>>,
    last_success_at: Option<DateTime<Utc>>,
    last_failure_at: Option<DateTime<Utc>>,
    failure_count: i32,
    total_deliveries: i64,
    total_failures: i64,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    connector_name: String,
    connector_display_name: String,
    endpoint_url: String,
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

fn compute_health(failure_count: i32, total_deliveries: i64, total_failures: i64) -> String {
    if total_deliveries == 0 {
        return "new".to_string();
    }
    let failure_rate = total_failures as f64 / total_deliveries as f64;
    if failure_count >= 10 || failure_rate > 0.5 {
        "failing".to_string()
    } else if failure_count >= 3 || failure_rate > 0.1 {
        "degraded".to_string()
    } else {
        "healthy".to_string()
    }
}

fn to_response(row: IntegrationJoinRow) -> IntegrationResponse {
    let health = compute_health(row.failure_count, row.total_deliveries, row.total_failures);
    IntegrationResponse {
        id: row.id,
        customer_id: row.customer_id,
        name: row.name,
        description: row.description,
        connector_config_id: row.connector_config_id,
        connector_name: row.connector_name,
        connector_display_name: row.connector_display_name,
        endpoint_id: row.endpoint_id,
        endpoint_url: row.endpoint_url,
        enabled: row.enabled,
        event_filter: row.event_filter,
        transform_id: row.transform_id,
        retry_policy: row.retry_policy,
        metadata: row.metadata,
        last_triggered_at: row.last_triggered_at,
        last_success_at: row.last_success_at,
        last_failure_at: row.last_failure_at,
        failure_count: row.failure_count,
        total_deliveries: row.total_deliveries,
        total_failures: row.total_failures,
        health_status: health,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

const INTEGRATION_JOIN_SQL: &str =
    "SELECT i.id, i.customer_id, i.name, i.description, i.connector_config_id, \
     i.endpoint_id, i.enabled, i.event_filter, i.transform_id, i.retry_policy, i.metadata, \
     i.last_triggered_at, i.last_success_at, i.last_failure_at, i.failure_count, \
     i.total_deliveries, i.total_failures, i.created_at, i.updated_at, \
     c.name as connector_name, c.display_name as connector_display_name, \
     e.url as endpoint_url \
     FROM integrations i \
     JOIN connector_configs cc ON i.connector_config_id = cc.id \
     JOIN connectors c ON cc.connector_id = c.id \
     JOIN endpoints e ON i.endpoint_id = e.id";

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

/// List all integrations for the authenticated customer.

pub mod integration_handlers;
pub use integration_handlers::*;
