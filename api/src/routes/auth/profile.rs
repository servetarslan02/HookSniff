//! Profile and consent handlers.

use axum::extract::Extension;
use axum::Json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::{Customer, CustomerResponse, UpdateProfileRequest};

// ── Profile ─────────────────────────────────────────────────

pub async fn get_me(Extension(customer): Extension<Customer>) -> Result<Json<CustomerResponse>, AppError> {
    Ok(Json(customer.to_response(None)))
}

pub async fn update_profile(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<CustomerResponse>, AppError> {
    if req.name.trim().is_empty() { return Err(AppError::BadRequest("Name cannot be empty".into())); }

    let updated = sqlx::query_as::<_, Customer>("UPDATE customers SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *")
        .bind(&req.name).bind(customer.id).fetch_one(&pool).await?;

 tracing::info!(" Profile updated for customer {}", customer.id);
    Ok(Json(updated.to_response(None)))
}

// ── Consent ─────────────────────────────────────────────────

pub async fn get_consent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let consents: Option<(serde_json::Value,)> = sqlx::query_as("SELECT consents FROM customer_consents WHERE customer_id = $1")
        .bind(customer.id).fetch_optional(&pool).await?;
    Ok(Json(serde_json::json!({ "consents": consents.map(|v| v.0).unwrap_or_else(|| serde_json::json!({})) })))
}

pub async fn update_consent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let key = req.get("key").and_then(|v| v.as_str()).ok_or(AppError::BadRequest("Missing 'key' field".into()))?;
    let value = req.get("value").and_then(|v| v.as_bool()).ok_or(AppError::BadRequest("Missing 'value' field".into()))?;

    sqlx::query(
        r#"INSERT INTO customer_consents (id, customer_id, consents, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (customer_id) DO UPDATE SET consents = customer_consents.consents || $3, updated_at = NOW()"#,
    )
    .bind(Uuid::new_v4()).bind(customer.id).bind(serde_json::json!({ key: value }))
    .execute(&pool).await?;

    Ok(Json(serde_json::json!({ "success": true })))
}
