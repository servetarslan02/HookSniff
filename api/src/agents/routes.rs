use axum::{
    extract::{Extension, Path, Query},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Json, Router,
};
use crate::error::AppError;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use super::auth::generate_agent_key;
use super::security::AuditLogQuery;
use super::models::*;

#[derive(Debug, Deserialize)]
pub struct Pagination {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

pub fn router() -> Router {
    Router::new()
        // Agent CRUD
        .route("/", get(list_agents).post(create_agent))
        .route("/{agent_id}", get(get_agent).put(update_agent).delete(delete_agent))
        // Agent Event API
        .route("/{agent_id}/emit", post(emit_event))
        .route("/{agent_id}/events", get(list_agent_events))
        // Routing kurallari
        .route("/routes", get(list_routes).post(create_route))
        .route("/routes/{route_id}", delete(delete_route))
        // Rate limit
        .route("/{agent_id}/rate-limit", get(get_rate_limit).put(update_rate_limit))
        .route("/audit", get(get_audit_log))
        .route("/{agent_id}/anomaly", get(get_anomaly_status))
}

// ============ Agent CRUD ============

async fn list_agents(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Query(pagination): Query<Pagination>,
) -> Result<impl IntoResponse, AppError> {
    let page = pagination.page.unwrap_or(1).max(1);
    let per_page = pagination.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let agents = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    )
    .bind(customer.id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    let responses: Vec<AgentResponse> = agents.into_iter().map(AgentResponse::from).collect();
    Ok(Json(serde_json::json!({ "agents": responses })))
}

async fn create_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Json(req): Json<CreateAgentRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Input validation
    super::validation::validate_agent_name(&req.name)?;
    if let Some(ref desc) = req.description {
        super::validation::validate_description(desc)?;
    }

    let agent_key = generate_agent_key();

    // Argon2id hash
    let agent_key_hash = {
        use argon2::password_hash::{rand_core::OsRng, SaltString};
        use argon2::{Argon2, PasswordHasher};
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        argon2
            .hash_password(agent_key.as_bytes(), &salt)
            .map(|h| h.to_string())
            .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?
    };

    let agent = sqlx::query_as::<_, Agent>(
        r#"INSERT INTO agents (customer_id, name, description, agent_key, agent_key_hash, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *"#
    )
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&agent_key)
    .bind(&agent_key_hash)
    .bind(req.metadata.unwrap_or(serde_json::json!({})))
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    // Varsayilan rate limit olustur
    let _ = sqlx::query(
        "INSERT INTO agent_rate_limits (agent_id) VALUES ($1)"
    )
    .bind(agent.id)
    .execute(&pool)
    .await;

    // Audit log
    let _ = super::security::log_action(
        &pool,
        agent.id,
        customer.id,
        "agent.created",
        serde_json::json!({"name": req.name}),
        None,
    ).await;

    Ok((StatusCode::CREATED, Json(serde_json::json!({
        "agent": AgentResponse::from(agent),
        "message": "Agent created. Save the agent_key — it won't be shown again."
    }))))
}

async fn get_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2"
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    match agent {
        Some(a) => Ok(Json(serde_json::json!({ "agent": AgentResponse::from(a) }))),
        None => Err(AppError::NotFound),
    }
}

async fn update_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<UpdateAgentRequest>,
) -> Result<impl IntoResponse, AppError> {
    let agent = sqlx::query_as::<_, Agent>(
        r#"UPDATE agents SET
            name = COALESCE($3, name),
            description = COALESCE($4, description),
            status = COALESCE($5, status),
            metadata = COALESCE($6, metadata),
            updated_at = now()
           WHERE id = $1 AND customer_id = $2
           RETURNING *"#
    )
    .bind(agent_id)
    .bind(customer.id)
    .bind(req.name)
    .bind(req.description)
    .bind(req.status)
    .bind(req.metadata)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    match agent {
        Some(a) => Ok(Json(serde_json::json!({ "agent": AgentResponse::from(a) }))),
        None => Err(AppError::NotFound),
    }
}

async fn delete_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        "DELETE FROM agents WHERE id = $1 AND customer_id = $2"
    )
    .bind(agent_id)
    .bind(customer.id)
    .execute(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Audit log
    let _ = super::security::log_action(
        &pool,
        agent_id,
        customer.id,
        "agent.deleted",
        serde_json::json!({}),
        None,
    ).await;

    Ok(Json(serde_json::json!({ "message": "Agent deleted" })))
}

// ============ Agent Event API ============

async fn emit_event(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<EmitEventRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Input validation
    super::validation::validate_event_type(&req.event_type)?;
    super::validation::validate_payload(&req.payload)?;

    // Agent dogrula
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2 AND status = 'active'"
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    let _agent = match agent {
        Some(a) => a,
        None => return Err(AppError::NotFound),
    };

    // Rate limit kontrolu
    let rate_limit = sqlx::query_as::<_, AgentRateLimit>(
        "SELECT * FROM agent_rate_limits WHERE agent_id = $1"
    )
    .bind(agent_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    if let Some(rl) = rate_limit {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND created_at > now() - INTERVAL '1 minute'"
        )
        .bind(agent_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

        if count.0 >= rl.max_events_per_minute as i64 {
            return Err(AppError::RateLimitExceeded);
        }
    }

    // Event kaydet (emit)
    let event = sqlx::query_as::<_, AgentEvent>(
        r#"INSERT INTO agent_events (agent_id, customer_id, event_type, payload, direction, target_agent_id)
           VALUES ($1, $2, $3, $4, 'emit', $5)
           RETURNING *"#
    )
    .bind(agent_id)
    .bind(customer.id)
    .bind(&req.event_type)
    .bind(&req.payload)
    .bind(req.target_agent_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    // Routing kurallarini uygula
    let routes = sqlx::query_as::<_, AgentRoute>(
        "SELECT * FROM agent_routes WHERE event_type = $1 AND customer_id = $2 AND is_active = true"
    )
    .bind(&req.event_type)
    .bind(customer.id)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    let mut delivered_to: Vec<Uuid> = Vec::new();

    for route in &routes {
        // Kaynak agent filtresi
        if let Some(src) = route.source_agent_id {
            if src != agent_id {
                continue;
            }
        }

        // Hedef agent'a event kaydet (receive)
        let _ = sqlx::query(
            r#"INSERT INTO agent_events (agent_id, customer_id, event_type, payload, direction, target_agent_id)
               VALUES ($1, $2, $3, $4, 'receive', $5)"#
        )
        .bind(route.target_agent_id)
        .bind(customer.id)
        .bind(&req.event_type)
        .bind(&req.payload)
        .bind(agent_id)
        .execute(&pool)
        .await;

        delivered_to.push(route.target_agent_id);
    }

    // Eger direkt target varsa onu da ekle
    if let Some(target) = req.target_agent_id {
        if !delivered_to.contains(&target) {
            let _ = sqlx::query(
                r#"INSERT INTO agent_events (agent_id, customer_id, event_type, payload, direction, target_agent_id)
                   VALUES ($1, $2, $3, $4, 'receive', $5)"#
            )
            .bind(target)
            .bind(customer.id)
            .bind(&req.event_type)
            .bind(&req.payload)
            .bind(agent_id)
            .execute(&pool)
            .await;
            delivered_to.push(target);
        }
    }

    // Audit log kaydet
    let _ = super::security::log_action(
        &pool,
        agent_id,
        customer.id,
        "event.emit",
        serde_json::json!({
            "event_type": req.event_type,
            "target_count": delivered_to.len(),
        }),
        None,
    ).await;

    Ok(Json(serde_json::json!({
        "event_id": event.id,
        "status": "delivered",
        "delivered_to": delivered_to
    })))
}

async fn list_agent_events(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
    Query(pagination): Query<Pagination>,
) -> Result<impl IntoResponse, AppError> {
    let page = pagination.page.unwrap_or(1).max(1);
    let per_page = pagination.per_page.unwrap_or(50).min(200);
    let offset = (page - 1) * per_page;

    let events = sqlx::query_as::<_, AgentEvent>(
        "SELECT * FROM agent_events WHERE agent_id = $1 AND customer_id = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4"
    )
    .bind(agent_id)
    .bind(customer.id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    Ok(Json(serde_json::json!({ "events": events })))
}

// ============ Routing ============

async fn list_routes(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
) -> Result<impl IntoResponse, AppError> {
    let routes = sqlx::query_as::<_, AgentRoute>(
        "SELECT * FROM agent_routes WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    Ok(Json(serde_json::json!({ "routes": routes })))
}

async fn create_route(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Json(req): Json<CreateRouteRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Input validation
    super::validation::validate_event_type(&req.event_type)?;

    let route = sqlx::query_as::<_, AgentRoute>(
        r#"INSERT INTO agent_routes (customer_id, event_type, source_agent_id, target_agent_id, filter_expression)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *"#
    )
    .bind(customer.id)
    .bind(&req.event_type)
    .bind(req.source_agent_id)
    .bind(req.target_agent_id)
    .bind(req.filter_expression)
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "route": route }))))
}

async fn delete_route(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(route_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        "DELETE FROM agent_routes WHERE id = $1 AND customer_id = $2"
    )
    .bind(route_id)
    .bind(customer.id)
    .execute(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({ "message": "Route deleted" })))
}

// ============ Rate Limit ============

async fn get_rate_limit(
    Extension(pool): Extension<PgPool>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let rl = sqlx::query_as::<_, AgentRateLimit>(
        "SELECT * FROM agent_rate_limits WHERE agent_id = $1"
    )
    .bind(agent_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    match rl {
        Some(r) => Ok(Json(serde_json::json!({ "rate_limit": r }))),
        None => Err(AppError::NotFound),
    }
}

async fn update_rate_limit(
    Extension(pool): Extension<PgPool>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<UpdateRateLimitRequest>,
) -> Result<impl IntoResponse, AppError> {
    let rl = sqlx::query_as::<_, AgentRateLimit>(
        r#"UPDATE agent_rate_limits SET
            max_events_per_minute = COALESCE($2, max_events_per_minute),
            max_events_per_hour = COALESCE($3, max_events_per_hour),
            updated_at = now()
           WHERE agent_id = $1
           RETURNING *"#
    )
    .bind(agent_id)
    .bind(req.max_events_per_minute)
    .bind(req.max_events_per_hour)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    match rl {
        Some(r) => Ok(Json(serde_json::json!({ "rate_limit": r }))),
        None => Err(AppError::NotFound),
    }
}

// ============ Audit Log & Anomaly ============

async fn get_audit_log(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Query(query): Query<AuditLogQuery>,
) -> Result<impl IntoResponse, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(50).min(200);
    let offset = (page - 1) * per_page;

    let logs = if let Some(agent_id) = query.agent_id {
        sqlx::query_as::<_, super::security::AuditLog>(
            "SELECT * FROM agent_audit_log WHERE agent_id = $1 AND customer_id = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4"
        )
        .bind(agent_id)
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?
    } else {
        sqlx::query_as::<_, super::security::AuditLog>(
            "SELECT * FROM agent_audit_log WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?
    };

    Ok(Json(serde_json::json!({ "logs": logs })))
}

async fn get_anomaly_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Agent dogrula
    let _agent = sqlx::query_as::<_, super::models::Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2"
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    let _ = match _agent {
        Some(a) => a,
        None => return Err(AppError::NotFound),
    };

    let warnings = super::security::check_anomaly(&pool, agent_id)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    let rate_status = super::security::check_rate_limit(&pool, agent_id)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{}", e)))?;

    Ok(Json(serde_json::json!({
        "agent_id": agent_id,
        "warnings": warnings,
        "rate_limit": rate_status,
        "healthy": warnings.is_empty()
    })))
}
