use axum::extract::Extension;
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_api_keys).post(create_api_key))
        .route("/{id}", delete(delete_api_key))
        .route("/{id}/rotate", post(rotate_api_key))
}

#[derive(Serialize)]
struct ApiKeyInfo {
    id: Uuid,
    name: Option<String>,
    #[serde(rename = "api_key_prefix")]
    prefix: String,
    created_at: String,
    last_used_at: Option<String>,
    is_active: bool,
}

#[derive(Serialize)]
struct CreateApiKeyResponse {
    id: Uuid,
    key: String,
    prefix: String,
    message: String,
}

async fn list_api_keys(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<ApiKeyInfo>>, AppError> {
    let keys = sqlx::query_as::<_, (Uuid, Option<String>, String, bool, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT id, name, api_key_prefix, is_active, created_at, last_used_at FROM api_keys WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(
        keys.into_iter()
            .map(
                |(id, name, prefix, is_active, created_at, last_used)| ApiKeyInfo {
                    id,
                    name,
                    prefix: format!("{}...", &prefix),
                    created_at: created_at.to_rfc3339(),
                    last_used_at: last_used.map(|t| t.to_rfc3339()),
                    is_active,
                },
            )
            .collect(),
    ))
}

async fn create_api_key(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<CreateKeyRequest>,
) -> Result<Json<CreateApiKeyResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        let team_id: Option<(Uuid,)> = sqlx::query_as("SELECT team_id FROM team_members WHERE customer_id = $1 LIMIT 1")
            .bind(customer.id).fetch_optional(&pool).await?;
        if let Some((tid,)) = team_id {
            super::teams::require_team_developer(&pool, tid, customer.id).await?;
        }
    }

    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..24].to_string();

    let name = req.name.unwrap_or_else(|| "Default".to_string());

    let id: (Uuid,) = sqlx::query_as(
        "INSERT INTO api_keys (customer_id, api_key_hash, api_key_prefix, name, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id"
    )
    .bind(customer.id)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(&name)
    .fetch_one(&pool)
    .await?;

    tracing::info!("🔑 New API key created for customer {}", customer.id);

    // Audit log — API_KEY_CREATE
    {
        let kid = id.0.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "API_KEY_CREATE", "api_key", Some(&kid), None, None, None).await; }
    }

    // HS-039: Notify user of new API key
    crate::notifications::helpers::api_key_created(&pool, customer.id, &name).await;

    Ok(Json(CreateApiKeyResponse {
        id: id.0,
        key: api_key,
        prefix: api_key_prefix,
        message: "Save this key — it won't be shown again.".to_string(),
    }))
}

async fn delete_api_key(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache): Extension<Option<crate::cache::CacheLayer>>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        let team_id: Option<(Uuid,)> = sqlx::query_as("SELECT team_id FROM team_members WHERE customer_id = $1 LIMIT 1")
            .bind(customer.id).fetch_optional(&pool).await?;
        if let Some((tid,)) = team_id {
            super::teams::require_team_admin(&pool, tid, customer.id).await?;
        }
    }

    // Get the prefix and name before deleting for cache invalidation and notification
    let old_key: Option<(String, Option<String>)> = sqlx::query_as("SELECT api_key_prefix, name FROM api_keys WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?;

    let result = sqlx::query("DELETE FROM api_keys WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Invalidate Redis cache for the deleted key
    if let (Some(ref c), Some((prefix, _))) = (&cache, &old_key) {
        c.invalidate("apikey", prefix).await;
    }

    // Audit log — API_KEY_DELETE
    {
        let kid = id.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "API_KEY_DELETE", "api_key", Some(&kid), None, None, None).await; }
    }

    // HS-039: Notify user of API key revocation
    let key_name = old_key.and_then(|(_, n)| n).unwrap_or_else(|| "Unnamed".to_string());
    crate::notifications::helpers::api_key_revoked(&pool, customer.id, &key_name).await;

    Ok(Json(serde_json::json!({"deleted": true})))
}

async fn rotate_api_key(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cache): Extension<Option<crate::cache::CacheLayer>>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<CreateApiKeyResponse>, AppError> {
    // ── Role enforcement: require admin for secret rotation ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        let team_id: Option<(Uuid,)> = sqlx::query_as("SELECT team_id FROM team_members WHERE customer_id = $1 LIMIT 1")
            .bind(customer.id).fetch_optional(&pool).await?;
        if let Some((tid,)) = team_id {
            super::teams::require_team_admin(&pool, tid, customer.id).await?;
        }
    }

    // Verify ownership and get old prefix for cache invalidation
    let existing: Option<(Uuid, String)> =
        sqlx::query_as("SELECT id, api_key_prefix FROM api_keys WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?;

    let (_, old_prefix) = existing.ok_or(AppError::NotFound)?;

    let new_key = generate_api_key();
    let new_hash = hash_api_key(&new_key);
    let new_prefix = new_key[..24].to_string();

    sqlx::query("UPDATE api_keys SET api_key_hash = $1, api_key_prefix = $2, last_used_at = NULL WHERE id = $3")
        .bind(&new_hash)
        .bind(&new_prefix)
        .bind(id)
        .execute(&pool)
        .await?;

    // Invalidate old prefix in Redis cache
    if let Some(ref c) = cache {
        c.invalidate("apikey", &old_prefix).await;
    }

    tracing::info!("🔑 API key rotated for customer {}", customer.id);

    Ok(Json(CreateApiKeyResponse {
        id,
        key: new_key,
        prefix: new_prefix,
        message: "Key rotated. Save the new key — it won't be shown again.".to_string(),
    }))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct CreateKeyRequest {
    name: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_api_key_info_serialize() {
        let info = ApiKeyInfo {
            id: Uuid::new_v4(),
            name: Some("Production".to_string()),
            prefix: "hr_live_abc123...".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            last_used_at: Some("2024-01-02T00:00:00Z".to_string()),
            is_active: true,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["api_key_prefix"], "hr_live_abc123...");
        assert_eq!(json["is_active"], true);
        assert_eq!(json["last_used_at"], "2024-01-02T00:00:00Z");
    }

    #[test]
    fn test_api_key_info_no_last_used() {
        let info = ApiKeyInfo {
            id: Uuid::new_v4(),
            name: None,
            prefix: "hr_live_xyz...".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            last_used_at: None,
            is_active: false,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert!(json["last_used_at"].is_null());
        assert_eq!(json["is_active"], false);
    }

    #[test]
    fn test_create_api_key_response_serialize() {
        let resp = CreateApiKeyResponse {
            id: Uuid::new_v4(),
            key: "hr_live_abc123def456".to_string(),
            prefix: "hr_live_abc123".to_string(),
            message: "Save this key — it won't be shown again.".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["key"], "hr_live_abc123def456");
        assert_eq!(json["prefix"], "hr_live_abc123");
        assert!(json["message"].as_str().unwrap().contains("won't be shown"));
    }

    #[test]
    fn test_create_key_request_deserialize() {
        let json = r#"{"name": "Production Key"}"#;
        let req: CreateKeyRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name.unwrap(), "Production Key");
    }

    #[test]
    fn test_create_key_request_no_name() {
        let json = r#"{}"#;
        let req: CreateKeyRequest = serde_json::from_str(json).unwrap();
        assert!(req.name.is_none());
    }

    #[test]
    fn test_api_key_prefix_format() {
        // Prefix should be first 24 chars of the key
        let api_key = "hr_live_abc123def456ghi789";
        let prefix = &api_key[..24];
        assert_eq!(prefix, "hr_live_abc123def456ghi7");
    }
}
