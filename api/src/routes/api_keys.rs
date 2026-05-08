use axum::extract::Extension;
use axum::routing::{delete, get, post, put};
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
    let keys = sqlx::query_as::<_, (Uuid, String, bool, chrono::DateTime<chrono::Utc>, Option<chrono::DateTime<chrono::Utc>>)>(
        "SELECT id, api_key_prefix, is_active, created_at, last_used_at FROM api_keys WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(
        keys.into_iter()
            .map(
                |(id, prefix, is_active, created_at, last_used)| ApiKeyInfo {
                    id,
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
    Json(req): Json<CreateKeyRequest>,
) -> Result<Json<CreateApiKeyResponse>, AppError> {
    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

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
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM api_keys WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

async fn rotate_api_key(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<CreateApiKeyResponse>, AppError> {
    // Verify ownership
    let existing: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM api_keys WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?;

    if existing.is_none() {
        return Err(AppError::NotFound);
    }

    let new_key = generate_api_key();
    let new_hash = hash_api_key(&new_key);
    let new_prefix = new_key[..15].to_string();

    sqlx::query("UPDATE api_keys SET api_key_hash = $1, api_key_prefix = $2, last_used_at = NULL WHERE id = $3")
        .bind(&new_hash)
        .bind(&new_prefix)
        .bind(id)
        .execute(&pool)
        .await?;

    tracing::info!("🔑 API key rotated for customer {}", customer.id);

    Ok(Json(CreateApiKeyResponse {
        id,
        key: new_key,
        prefix: new_prefix,
        message: "Key rotated. Save the new key — it won't be shown again.".to_string(),
    }))
}

#[derive(Deserialize)]
struct CreateKeyRequest {
    name: Option<String>,
}
