use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_service_tokens).post(create_service_token))
        .route("/{id}", delete(delete_service_token).put(update_service_token))
        .route("/{id}/reveal", post(reveal_service_token))
}

// ── Models ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct ServiceTokenInfo {
    pub id: Uuid,
    pub name: String,
    pub token_prefix: String,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ServiceTokenCreated {
    pub id: Uuid,
    pub name: String,
    pub token: String,
    pub token_prefix: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateServiceTokenRequest {
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateServiceTokenRequest {
    pub name: String,
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// List all service tokens for teams owned by the current user.
/// GET /v1/service-tokens
async fn list_service_tokens(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<ServiceTokenInfo>>, AppError> {
    let tokens = sqlx::query_as::<_, ServiceTokenInfo>(
        r#"
        SELECT st.id, st.name, st.token_prefix, st.created_at, st.last_used_at
        FROM service_tokens st
        INNER JOIN teams t ON t.id = st.team_id
        WHERE t.owner_id = $1 AND st.is_active = true
        ORDER BY st.created_at DESC
        "#,
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(tokens))
}

/// Create a new service token for a team owned by the current user.
/// POST /v1/service-tokens
async fn create_service_token(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateServiceTokenRequest>,
) -> Result<Json<ServiceTokenCreated>, AppError> {
    // Find the first team owned by this customer
    let team_id: (Uuid,) = sqlx::query_as(
        "SELECT id FROM teams WHERE owner_id = $1 ORDER BY created_at ASC LIMIT 1",
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound)?;

    // ── Role enforcement: require admin for service token management ──
    super::teams::require_team_admin(&pool, team_id.0, customer.id).await?;

    let raw_token = generate_api_key();
    let token_hash = hash_api_key(&raw_token);
    let token_prefix = raw_token[..24].to_string();
    let name = req.name.unwrap_or_else(|| "Default Token".to_string());

    let created = sqlx::query_as::<_, (Uuid, String, String, DateTime<Utc>)>(
        r#"
        INSERT INTO service_tokens (team_id, name, token_hash, token_prefix)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, token_prefix, created_at
        "#,
    )
    .bind(team_id.0)
    .bind(&name)
    .bind(&token_hash)
    .bind(&token_prefix)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "🎟️ New service token '{}' created for team {} (customer {})",
        name,
        team_id.0,
        customer.id
    );

    // Audit log
    {
        let token_id = created.0.to_string();
        let _ = crate::audit::log_action(
            &pool,
            customer.id,
            "SERVICE_TOKEN_CREATE",
            "service_token",
            Some(&token_id),
            None,
            None,
            None,
        )
        .await;
    }

    Ok(Json(ServiceTokenCreated {
        id: created.0,
        name: created.1,
        token: raw_token,
        token_prefix: created.2,
        created_at: created.3,
    }))
}

/// Delete a service token.
/// DELETE /v1/service-tokens/{id}
async fn delete_service_token(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        r#"
        DELETE FROM service_tokens st
        USING teams t
        WHERE st.team_id = t.id
          AND st.id = $1
          AND t.owner_id = $2
        "#,
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("🗑️ Service token {} deleted by customer {}", id, customer.id);

    // Audit log
    {
        let _ = crate::audit::log_action(
            &pool,
            customer.id,
            "SERVICE_TOKEN_DELETE",
            "service_token",
            Some(&id.to_string()),
            None,
            None,
            None,
        )
        .await;
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

/// Reveal the full token value (only works for tokens owned by the customer).
/// POST /v1/service-tokens/{id}/reveal
async fn reveal_service_token(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Verify ownership through team
    let exists: Option<(Uuid,)> = sqlx::query_as(
        r#"
        SELECT st.id FROM service_tokens st
        INNER JOIN teams t ON t.id = st.team_id
        WHERE st.id = $1 AND t.owner_id = $2 AND st.is_active = true
        "#,
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    if exists.is_none() {
        return Err(AppError::NotFound);
    }

    // Token hash is one-way, so we can't reveal the original.
    // Return the prefix as a hint. Full token only shown at creation.
    Ok(Json(serde_json::json!({
        "token": null,
        "message": "Token is only shown once at creation. Create a new token if needed."
    })))
}

/// Update a service token name.
/// PUT /v1/service-tokens/{id}
async fn update_service_token(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateServiceTokenRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        r#"
        UPDATE service_tokens st
        SET name = $1
        FROM teams t
        WHERE st.team_id = t.id
          AND st.id = $2
          AND t.owner_id = $3
        "#,
    )
    .bind(&req.name)
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✏️ Service token {} renamed by customer {}", id, customer.id);

    Ok(Json(serde_json::json!({"updated": true, "name": req.name})))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_service_token_info_serialize() {
        let info = ServiceTokenInfo {
            id: Uuid::new_v4(),
            name: "Production".to_string(),
            token_prefix: "hr_live_abc123def456".to_string(),
            created_at: chrono::Utc::now(),
            last_used_at: Some(chrono::Utc::now()),
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["name"], "Production");
        assert_eq!(json["token_prefix"], "hr_live_abc123def456");
        assert!(!json["last_used_at"].is_null());
    }

    #[test]
    fn test_create_request_deserialize() {
        let json = r#"{"name": "My Token"}"#;
        let req: CreateServiceTokenRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name.unwrap(), "My Token");
    }

    #[test]
    fn test_create_request_no_name() {
        let json = r#"{}"#;
        let req: CreateServiceTokenRequest = serde_json::from_str(json).unwrap();
        assert!(req.name.is_none());
    }

    #[test]
    fn test_update_request_deserialize() {
        let json = r#"{"name": "Renamed Token"}"#;
        let req: UpdateServiceTokenRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Renamed Token");
    }
}
