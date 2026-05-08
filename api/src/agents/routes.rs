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
        .route(
            "/{agent_id}",
            get(get_agent).put(update_agent).delete(delete_agent),
        )
        // Agent Event API
        .route("/{agent_id}/emit", post(emit_event))
        .route("/{agent_id}/events", get(list_agent_events))
        // Routing kurallari
        .route("/routes", get(list_routes).post(create_route))
        .route("/routes/{route_id}", delete(delete_route))
        // Rate limit
        .route(
            "/{agent_id}/rate-limit",
            get(get_rate_limit).put(update_rate_limit),
        )
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

    // Toplam sayiyi al
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM agents WHERE customer_id = $1")
        .bind(customer.id)
        .fetch_one(&pool)
        .await
        .map_err(|e| AppError::Database(e))?;

    let agents = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    )
    .bind(customer.id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    let responses: Vec<AgentResponse> = agents.into_iter().map(AgentResponse::from).collect();

    Ok(Json(serde_json::json!({
        "agents": responses,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total.0,
            "total_pages": (total.0 as f64 / per_page as f64).ceil() as i64
        }
    })))
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

    // Ayni isimde agent var mi kontrol et
    let existing: Option<Agent> = sqlx::query_as(
        "SELECT * FROM agents WHERE customer_id = $1 AND name = $2",
    )
    .bind(customer.id)
    .bind(&req.name)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if existing.is_some() {
        return Err(AppError::BadRequest(
            "Bu isimde bir agent zaten mevcut".to_string(),
        ));
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
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Agent key hash hatasi: {}", e)))?
    };

    let agent = sqlx::query_as::<_, Agent>(
        r#"INSERT INTO agents (customer_id, name, description, agent_key, agent_key_hash, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *"#,
    )
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&agent_key)
    .bind(&agent_key_hash)
    .bind(req.metadata.unwrap_or(serde_json::json!({})))
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    // Varsayilan rate limit olustur
    sqlx::query("INSERT INTO agent_rate_limits (agent_id) VALUES ($1)")
        .bind(agent.id)
        .execute(&pool)
        .await
        .map_err(|e| {
            tracing::error!("Rate limit olusturma hatasi (agent {}): {:?}", agent.id, e);
            AppError::Database(e)
        })?;

    // Audit log
    let _ = super::security::log_action(
        &pool,
        agent.id,
        customer.id,
        "agent.created",
        serde_json::json!({"name": &req.name}),
        None,
    )
    .await;

    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({
            "agent": AgentResponse::from(agent),
            "message": "Agent created. Save the agent_key — it won't be shown again."
        })),
    ))
}

async fn get_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

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
    // Input validation
    super::validation::validate_optional_agent_name(&req.name)?;
    super::validation::validate_optional_description(&req.description)?;
    super::validation::validate_optional_status(&req.status)?;

    // Agent mevcut mu kontrol et
    let existing = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    let _existing = match existing {
        Some(a) => a,
        None => return Err(AppError::NotFound),
    };

    // Eger isim degisiyorsa, cakisma kontrolu
    if let Some(ref new_name) = req.name {
        if new_name != &_existing.name {
            let duplicate: Option<Agent> = sqlx::query_as(
                "SELECT * FROM agents WHERE customer_id = $1 AND name = $2 AND id != $3",
            )
            .bind(customer.id)
            .bind(new_name)
            .bind(agent_id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| AppError::Database(e))?;

            if duplicate.is_some() {
                return Err(AppError::BadRequest(
                    "Bu isimde baska bir agent zaten mevcut".to_string(),
                ));
            }
        }
    }

    let agent = sqlx::query_as::<_, Agent>(
        r#"UPDATE agents SET
            name = COALESCE($3, name),
            description = COALESCE($4, description),
            status = COALESCE($5, status),
            metadata = COALESCE($6, metadata),
            updated_at = now()
           WHERE id = $1 AND customer_id = $2
           RETURNING *"#,
    )
    .bind(agent_id)
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.status)
    .bind(&req.metadata)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    match agent {
        Some(a) => {
            // Audit log — ne degisti kaydet
            let mut changes = serde_json::json!({});
            if let Some(ref name) = req.name {
                changes["name"] = serde_json::json!(name);
            }
            if let Some(ref desc) = req.description {
                changes["description"] = serde_json::json!(desc);
            }
            if let Some(ref status) = req.status {
                changes["status"] = serde_json::json!(status);
            }
            if req.metadata.is_some() {
                changes["metadata_updated"] = serde_json::json!(true);
            }

            let _ = super::security::log_action(
                &pool,
                agent_id,
                customer.id,
                "agent.updated",
                serde_json::json!({"changes": changes}),
                None,
            )
            .await;

            Ok(Json(serde_json::json!({ "agent": AgentResponse::from(a) })))
        }
        None => Err(AppError::NotFound),
    }
}

async fn delete_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Once agent bilgisini al (audit icin)
    let existing = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    let agent = match existing {
        Some(a) => a,
        None => return Err(AppError::NotFound),
    };

    // Audit log — silmeden once kaydet
    let _ = super::security::log_action(
        &pool,
        agent_id,
        customer.id,
        "agent.deleted",
        serde_json::json!({"name": &agent.name}),
        None,
    )
    .await;

    // Agent'i sil (CASCADE: events, routes, rate_limits, audit_log otomatik silinir)
    let result = sqlx::query("DELETE FROM agents WHERE id = $1 AND customer_id = $2")
        .bind(agent_id)
        .bind(customer.id)
        .execute(&pool)
        .await
        .map_err(|e| AppError::Database(e))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({
        "message": "Agent deleted",
        "deleted_agent_id": agent_id
    })))
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
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2 AND status = 'active'",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    let _agent = match agent {
        Some(a) => a,
        None => {
            // Agent var ama aktif degil mi?
            let any_agent = sqlx::query_as::<_, Agent>(
                "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
            )
            .bind(agent_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| AppError::Database(e))?;

            if any_agent.is_some() {
                return Err(AppError::Forbidden(
                    "Agent aktif degil, event gonderemez".to_string(),
                ));
            }
            return Err(AppError::NotFound);
        }
    };

    // Rate limit kontrolu
    let rate_limit = sqlx::query_as::<_, AgentRateLimit>(
        "SELECT * FROM agent_rate_limits WHERE agent_id = $1",
    )
    .bind(agent_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if let Some(rl) = rate_limit {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND created_at > now() - INTERVAL '1 minute'",
        )
        .bind(agent_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| AppError::Database(e))?;

        if count.0 >= rl.max_events_per_minute as i64 {
            return Err(AppError::RateLimitExceeded);
        }
    }

    // Event kaydet (emit)
    let event = sqlx::query_as::<_, AgentEvent>(
        r#"INSERT INTO agent_events (agent_id, customer_id, event_type, payload, direction, target_agent_id)
           VALUES ($1, $2, $3, $4, 'emit', $5)
           RETURNING *"#,
    )
    .bind(agent_id)
    .bind(customer.id)
    .bind(&req.event_type)
    .bind(&req.payload)
    .bind(req.target_agent_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    // Routing kurallarini uygula
    let routes = sqlx::query_as::<_, AgentRoute>(
        "SELECT * FROM agent_routes WHERE event_type = $1 AND customer_id = $2 AND is_active = true",
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
               VALUES ($1, $2, $3, $4, 'receive', $5)"#,
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
            // Hedef agent'in ayni customer'a ait oldugunu dogrula
            let target_agent = sqlx::query_as::<_, Agent>(
                "SELECT * FROM agents WHERE id = $1 AND customer_id = $2 AND status = 'active'",
            )
            .bind(target)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await
            .map_err(|e| AppError::Database(e))?;

            if target_agent.is_none() {
                return Err(AppError::BadRequest(
                    "Hedef agent bulunamakti veya aktif degil".to_string(),
                ));
            }

            let _ = sqlx::query(
                r#"INSERT INTO agent_events (agent_id, customer_id, event_type, payload, direction, target_agent_id)
                   VALUES ($1, $2, $3, $4, 'receive', $5)"#,
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
            "event_type": &req.event_type,
            "target_count": delivered_to.len(),
        }),
        None,
    )
    .await;

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

    // Agent var mı kontrol et
    let agent_exists = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if agent_exists.is_none() {
        return Err(AppError::NotFound);
    }

    // Toplam sayi
    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    let events = sqlx::query_as::<_, AgentEvent>(
        "SELECT * FROM agent_events WHERE agent_id = $1 AND customer_id = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
    )
    .bind(agent_id)
    .bind(customer.id)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    Ok(Json(serde_json::json!({
        "events": events,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total.0,
            "total_pages": (total.0 as f64 / per_page as f64).ceil() as i64
        }
    })))
}

// ============ Routing ============

async fn list_routes(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
) -> Result<impl IntoResponse, AppError> {
    let routes = sqlx::query_as::<_, AgentRoute>(
        "SELECT * FROM agent_routes WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    Ok(Json(serde_json::json!({ "routes": routes })))
}

async fn create_route(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Json(req): Json<CreateRouteRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Input validation
    super::validation::validate_event_type(&req.event_type)?;

    // Hedef agent'in varligini ve ayni customer'a ait oldugunu dogrula
    let target = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(req.target_agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if target.is_none() {
        return Err(AppError::BadRequest(
            "Hedef agent bulunamakti".to_string(),
        ));
    }

    // Kaynak agent varligini dogrula (eger belirtilmis)
    if let Some(source_id) = req.source_agent_id {
        let source = sqlx::query_as::<_, Agent>(
            "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
        )
        .bind(source_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await
        .map_err(|e| AppError::Database(e))?;

        if source.is_none() {
            return Err(AppError::BadRequest(
                "Kaynak agent bulunamakti".to_string(),
            ));
        }
    }

    // Ayni routing kurali var mi?
    let duplicate = sqlx::query_as::<_, AgentRoute>(
        "SELECT * FROM agent_routes WHERE customer_id = $1 AND event_type = $2 AND target_agent_id = $3 AND source_agent_id IS NOT DISTINCT FROM $4",
    )
    .bind(customer.id)
    .bind(&req.event_type)
    .bind(req.target_agent_id)
    .bind(req.source_agent_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if duplicate.is_some() {
        return Err(AppError::BadRequest(
            "Bu routing kurali zaten mevcut".to_string(),
        ));
    }

    let route = sqlx::query_as::<_, AgentRoute>(
        r#"INSERT INTO agent_routes (customer_id, event_type, source_agent_id, target_agent_id, filter_expression)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *"#,
    )
    .bind(customer.id)
    .bind(&req.event_type)
    .bind(req.source_agent_id)
    .bind(req.target_agent_id)
    .bind(req.filter_expression)
    .fetch_one(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({ "route": route })),
    ))
}

async fn delete_route(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(route_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query("DELETE FROM agent_routes WHERE id = $1 AND customer_id = $2")
        .bind(route_id)
        .bind(customer.id)
        .execute(&pool)
        .await
        .map_err(|e| AppError::Database(e))?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({ "message": "Route deleted" })))
}

// ============ Rate Limit ============

async fn get_rate_limit(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Agent'in customer'a ait oldugunu dogrula
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if agent.is_none() {
        return Err(AppError::NotFound);
    }

    let rl = sqlx::query_as::<_, AgentRateLimit>(
        "SELECT * FROM agent_rate_limits WHERE agent_id = $1",
    )
    .bind(agent_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    match rl {
        Some(r) => Ok(Json(serde_json::json!({ "rate_limit": r }))),
        None => Err(AppError::NotFound),
    }
}

async fn update_rate_limit(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<UpdateRateLimitRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Agent'in customer'a ait oldugunu dogrula
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    if agent.is_none() {
        return Err(AppError::NotFound);
    }

    // Deger kontrolu
    if let Some(minute) = req.max_events_per_minute {
        if minute < 1 || minute > 10000 {
            return Err(AppError::BadRequest(
                "Dakika limiti 1-10000 arasinda olmalidir".to_string(),
            ));
        }
    }
    if let Some(hour) = req.max_events_per_hour {
        if hour < 1 || hour > 100000 {
            return Err(AppError::BadRequest(
                "Saat limiti 1-100000 arasinda olmalidir".to_string(),
            ));
        }
    }

    let rl = sqlx::query_as::<_, AgentRateLimit>(
        r#"UPDATE agent_rate_limits SET
            max_events_per_minute = COALESCE($2, max_events_per_minute),
            max_events_per_hour = COALESCE($3, max_events_per_hour),
            updated_at = now()
           WHERE agent_id = $1
           RETURNING *"#,
    )
    .bind(agent_id)
    .bind(req.max_events_per_minute)
    .bind(req.max_events_per_hour)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

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

    // Toplam sayi
    let total: (i64,) = if let Some(agent_id) = query.agent_id {
        sqlx::query_as(
            "SELECT COUNT(*) FROM agent_audit_log WHERE agent_id = $1 AND customer_id = $2",
        )
        .bind(agent_id)
        .bind(customer.id)
        .fetch_one(&pool)
        .await
        .map_err(|e| AppError::Database(e))?
    } else {
        sqlx::query_as("SELECT COUNT(*) FROM agent_audit_log WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await
            .map_err(|e| AppError::Database(e))?
    };

    let logs = if let Some(agent_id) = query.agent_id {
        sqlx::query_as::<_, super::security::AuditLog>(
            "SELECT * FROM agent_audit_log WHERE agent_id = $1 AND customer_id = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        )
        .bind(agent_id)
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await
        .map_err(|e| AppError::Database(e))?
    } else {
        sqlx::query_as::<_, super::security::AuditLog>(
            "SELECT * FROM agent_audit_log WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await
        .map_err(|e| AppError::Database(e))?
    };

    Ok(Json(serde_json::json!({
        "logs": logs,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total.0,
            "total_pages": (total.0 as f64 / per_page as f64).ceil() as i64
        }
    })))
}

async fn get_anomaly_status(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(agent_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Agent dogrula
    let agent = sqlx::query_as::<_, super::models::Agent>(
        "SELECT * FROM agents WHERE id = $1 AND customer_id = $2",
    )
    .bind(agent_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| AppError::Database(e))?;

    let _ = match agent {
        Some(a) => a,
        None => return Err(AppError::NotFound),
    };

    let warnings = super::security::check_anomaly(&pool, agent_id)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Anomali kontrol hatasi: {}", e)))?;

    let rate_status = super::security::check_rate_limit(&pool, agent_id)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Rate limit kontrol hatasi: {}", e)))?;

    Ok(Json(serde_json::json!({
        "agent_id": agent_id,
        "warnings": warnings,
        "rate_limit": rate_status,
        "healthy": warnings.is_empty()
    })))
}
