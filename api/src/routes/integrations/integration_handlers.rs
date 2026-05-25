use axum::{
    extract::{Extension, Path, Query},
    Json,
};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::routes::teams;

use super::{
    to_response, CreateIntegrationRequest, EventFilter, Integration, IntegrationEvent,
    IntegrationJoinRow, IntegrationResponse, IntegrationStats, UpdateIntegrationRequest,
    INTEGRATION_JOIN_SQL,
};

pub async fn list_integrations(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<IntegrationResponse>>, AppError> {
    let rows = sqlx::query_as::<_, IntegrationJoinRow>(&format!(
        "{} WHERE i.customer_id = $1 ORDER BY i.created_at DESC",
        INTEGRATION_JOIN_SQL
    ))
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows.into_iter().map(to_response).collect()))
}

/// Get a single integration by ID.
pub async fn get_integration(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<IntegrationResponse>, AppError> {
    let row = sqlx::query_as::<_, IntegrationJoinRow>(&format!(
        "{} WHERE i.id = $1 AND i.customer_id = $2",
        INTEGRATION_JOIN_SQL
    ))
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(to_response(row)))
}

/// Create a new integration.
pub async fn create_integration(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<CreateIntegrationRequest>,
) -> Result<Json<IntegrationResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        crate::routes::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Verify connector_config belongs to customer
    let config_ok: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM connector_configs WHERE id = $1 AND customer_id = $2)",
    )
    .bind(req.connector_config_id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if !config_ok {
        return Err(AppError::Validation("Connector config not found".into()));
    }

    // Verify endpoint belongs to customer
    let endpoint_ok: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM endpoints WHERE id = $1 AND customer_id = $2)",
    )
    .bind(req.endpoint_id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if !endpoint_ok {
        return Err(AppError::Validation("Endpoint not found".into()));
    }

    let integration = sqlx::query_as::<_, Integration>(
        "INSERT INTO integrations \
         (customer_id, name, description, connector_config_id, endpoint_id, event_filter, transform_id, retry_policy, metadata, enabled) \
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) \
         RETURNING id, customer_id, name, description, connector_config_id, endpoint_id, enabled, \
         event_filter, transform_id, retry_policy, metadata, last_triggered_at, last_success_at, \
         last_failure_at, failure_count, total_deliveries, total_failures, created_at, updated_at",
    )
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.connector_config_id)
    .bind(req.endpoint_id)
    .bind(&req.event_filter)
    .bind(req.transform_id)
    .bind(req.retry_policy.unwrap_or(serde_json::json!({"max_retries": 5, "backoff": "exponential"})))
    .bind(req.metadata.unwrap_or(serde_json::json!({})))
    .bind(req.enabled.unwrap_or(true))
    .fetch_one(&pool)
    .await?;

    // Fetch joined data for response
    let row = sqlx::query_as::<_, IntegrationJoinRow>(&format!(
        "{} WHERE i.id = $1",
        INTEGRATION_JOIN_SQL
    ))
    .bind(integration.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(to_response(row)))
}

/// Update an integration.
pub async fn update_integration(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateIntegrationRequest>,
) -> Result<Json<IntegrationResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        crate::routes::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Verify endpoint if changed
    if let Some(endpoint_id) = req.endpoint_id {
        let ok: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM endpoints WHERE id = $1 AND customer_id = $2)",
        )
        .bind(endpoint_id)
        .bind(customer.id)
        .fetch_one(&pool)
        .await?;

        if !ok {
            return Err(AppError::Validation("Endpoint not found".into()));
        }
    }

    let result = sqlx::query(
        "UPDATE integrations SET \
         name = COALESCE($3, name), \
         description = COALESCE($4, description), \
         endpoint_id = COALESCE($5, endpoint_id), \
         event_filter = COALESCE($6, event_filter), \
         transform_id = COALESCE($7, transform_id), \
         retry_policy = COALESCE($8, retry_policy), \
         metadata = COALESCE($9, metadata), \
         enabled = COALESCE($10, enabled), \
         updated_at = now() \
         WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.endpoint_id)
    .bind(&req.event_filter)
    .bind(req.transform_id)
    .bind(&req.retry_policy)
    .bind(&req.metadata)
    .bind(req.enabled)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    let row = sqlx::query_as::<_, IntegrationJoinRow>(&format!(
        "{} WHERE i.id = $1 AND i.customer_id = $2",
        INTEGRATION_JOIN_SQL
    ))
    .bind(id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(to_response(row)))
}

/// Delete an integration.
pub async fn delete_integration(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        crate::routes::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    let result = sqlx::query("DELETE FROM integrations WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

/// Send a test event through the integration.
pub async fn test_integration(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let integration = sqlx::query_as::<_, Integration>(
        "SELECT id, customer_id, name, description, connector_config_id, endpoint_id, enabled, \
         event_filter, transform_id, retry_policy, metadata, last_triggered_at, last_success_at, \
         last_failure_at, failure_count, total_deliveries, total_failures, created_at, updated_at \
         FROM integrations WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if !integration.enabled {
        return Err(AppError::Validation("Integration is disabled".into()));
    }

    // Create a test event
    let event = sqlx::query_as::<_, IntegrationEvent>(
        "INSERT INTO integration_events \
         (integration_id, event_type, source_event_id, payload, status) \
         VALUES ($1, 'test.ping', $2, $3, 'pending') \
         RETURNING id, integration_id, event_type, source_event_id, payload, status, \
         delivery_id, error_message, attempts, duration_ms, created_at, processed_at",
    )
    .bind(integration.id)
    .bind(format!("test-{}", Uuid::new_v4()))
    .bind(serde_json::json!({
        "type": "test.ping",
        "data": {"message": "Integration test event", "timestamp": Utc::now().to_rfc3339()},
        "source": "hooksniff-test"
    }))
    .fetch_one(&pool)
    .await?;

    // Update last_triggered_at
    sqlx::query("UPDATE integrations SET last_triggered_at = now(), updated_at = now() WHERE id = $1")
        .bind(integration.id)
        .execute(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "event_id": event.id,
        "message": "Test event created and queued for delivery"
    })))
}

/// List events for an integration.
pub async fn list_events(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(filter): Query<EventFilter>,
) -> Result<Json<Vec<IntegrationEvent>>, AppError> {
    // Verify integration belongs to customer
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM integrations WHERE id = $1 AND customer_id = $2)",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if !exists {
        return Err(AppError::NotFound);
    }

    let limit = filter.limit.unwrap_or(50).min(200);
    let offset = filter.offset.unwrap_or(0);

    let mut query = String::from(
        "SELECT id, integration_id, event_type, source_event_id, payload, status, \
         delivery_id, error_message, attempts, duration_ms, created_at, processed_at \
         FROM integration_events WHERE integration_id = $1"
    );

    let mut bind_idx = 2;
    if filter.status.is_some() {
        query.push_str(&format!(" AND status = ${}", bind_idx));
        bind_idx += 1;
    }
    if filter.event_type.is_some() {
        query.push_str(&format!(" AND event_type = ${}", bind_idx));
        bind_idx += 1;
    }
    query.push_str(&format!(" ORDER BY created_at DESC LIMIT ${} OFFSET ${}", bind_idx, bind_idx + 1));

    let mut q = sqlx::query_as::<_, IntegrationEvent>(&query).bind(id);
    if let Some(ref status) = filter.status {
        q = q.bind(status);
    }
    if let Some(ref event_type) = filter.event_type {
        q = q.bind(event_type);
    }
    q = q.bind(limit).bind(offset);

    let events = q.fetch_all(&pool).await?;
    Ok(Json(events))
}

/// Get statistics for an integration.
pub async fn get_stats(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<IntegrationStats>, AppError> {
    let integration = sqlx::query_as::<_, Integration>(
        "SELECT id, customer_id, name, description, connector_config_id, endpoint_id, enabled, \
         event_filter, transform_id, retry_policy, metadata, last_triggered_at, last_success_at, \
         last_failure_at, failure_count, total_deliveries, total_failures, created_at, updated_at \
         FROM integrations WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let stats = sqlx::query_as::<_, (i64, i64, i64, i64, i64, Option<f64>)>(
        "SELECT \
         COUNT(*)::bigint as total, \
         COUNT(*) FILTER (WHERE status = 'delivered')::bigint as delivered, \
         COUNT(*) FILTER (WHERE status = 'failed')::bigint as failed, \
         COUNT(*) FILTER (WHERE status = 'pending')::bigint as pending, \
         COUNT(*) FILTER (WHERE status = 'filtered')::bigint as filtered, \
         AVG(duration_ms) FILTER (WHERE status = 'delivered') as avg_duration \
         FROM integration_events WHERE integration_id = $1",
    )
    .bind(integration.id)
    .fetch_one(&pool)
    .await?;

    let last_24h = sqlx::query_as::<_, (i64, i64)>(
        "SELECT \
         COUNT(*)::bigint, \
         COUNT(*) FILTER (WHERE status = 'failed')::bigint \
         FROM integration_events \
         WHERE integration_id = $1 AND created_at > now() - interval '24 hours'",
    )
    .bind(integration.id)
    .fetch_one(&pool)
    .await?;

    let success_rate = if stats.0 > 0 {
        (stats.1 as f64 / stats.0 as f64) * 100.0
    } else {
        100.0
    };

    Ok(Json(IntegrationStats {
        total_events: stats.0,
        delivered: stats.1,
        failed: stats.2,
        pending: stats.3,
        filtered: stats.4,
        avg_duration_ms: stats.5,
        success_rate,
        last_24h_events: last_24h.0,
        last_24h_failures: last_24h.1,
    }))
}
