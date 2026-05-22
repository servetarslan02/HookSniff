//! Feature flag CRUD management.

use axum::extract::{Extension, Path};
use axum::response::IntoResponse;
use axum::Json;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

#[derive(Debug, serde::Serialize, Deserialize, FromRow)]
struct FeatureFlag {
    id: Uuid,
    name: String,
    description: Option<String>,
    is_enabled: bool,
    rollout_percentage: i32,
    enabled_for_plans: serde_json::Value,
    created_by: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct CreateFeatureFlagRequest {
    name: String,
    description: Option<String>,
    is_enabled: Option<bool>,
    rollout_percentage: Option<i32>,
    enabled_for_plans: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct UpdateFeatureFlagRequest {
    name: Option<String>,
    description: Option<String>,
    is_enabled: Option<bool>,
    rollout_percentage: Option<i32>,
    enabled_for_plans: Option<Vec<String>>,
}

/// GET /v1/admin/feature-flags — List all feature flags.
pub async fn list_feature_flags(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<impl IntoResponse, AppError> {
    require_admin(&customer)?;

    let flags = sqlx::query_as::<_, FeatureFlag>(
        "SELECT id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at
         FROM feature_flags ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "FEATURE_FLAG_LIST",
        "feature_flag",
        None,
        None,
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({ "flags": flags })))
}

/// POST /v1/admin/feature-flags — Create a feature flag.
#[allow(private_interfaces)]
pub async fn create_feature_flag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(body): Json<CreateFeatureFlagRequest>,
) -> Result<impl IntoResponse, AppError> {
    require_admin_write(&customer)?;

    let name = body.name.trim();
    if name.is_empty() || name.len() > 100 {
        return Err(AppError::BadRequest(
            "Flag name must be 1-100 characters".into(),
        ));
    }
    if !name
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
    {
        return Err(AppError::BadRequest(
            "Flag name may only contain alphanumeric, underscore, or hyphen".into(),
        ));
    }

    let exists =
        sqlx::query_scalar::<_, bool>("SELECT EXISTS(SELECT 1 FROM feature_flags WHERE name = $1)")
            .bind(name)
            .fetch_one(&pool)
            .await?;
    if exists {
        return Err(AppError::BadRequest(format!(
            "Flag '{}' already exists",
            name
        )));
    }

    let plans_json = serde_json::to_value(body.enabled_for_plans.unwrap_or_default())?;

    let flag = sqlx::query_as::<_, FeatureFlag>(
        "INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at"
    )
    .bind(name)
    .bind(&body.description)
    .bind(body.is_enabled.unwrap_or(false))
    .bind(body.rollout_percentage.unwrap_or(100))
    .bind(&plans_json)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "FEATURE_FLAG_CREATE",
        "feature_flag",
        Some(&flag.id.to_string()),
        None,
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!(flag)))
}

/// PUT /v1/admin/feature-flags/:id — Update a feature flag.
#[allow(private_interfaces)]
pub async fn update_feature_flag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateFeatureFlagRequest>,
) -> Result<impl IntoResponse, AppError> {
    require_admin_write(&customer)?;

    let current = sqlx::query_as::<_, FeatureFlag>(
        "SELECT id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at FROM feature_flags WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let new_name = match body.name {
        Some(ref n) => {
            let trimmed = n.trim();
            if trimmed.is_empty() || trimmed.len() > 100 {
                return Err(AppError::BadRequest(
                    "Flag name must be 1-100 characters".into(),
                ));
            }
            if !trimmed
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
            {
                return Err(AppError::BadRequest(
                    "Flag name may only contain alphanumeric, underscore, or hyphen".into(),
                ));
            }
            trimmed.to_string()
        }
        None => current.name.clone(),
    };

    let new_desc: Option<String> = match body.description {
        Some(d) if d.trim().is_empty() => None,
        Some(d) => Some(d),
        None => current.description.clone(),
    };

    let new_enabled = body.is_enabled.unwrap_or(current.is_enabled);
    let new_pct = body.rollout_percentage.unwrap_or(current.rollout_percentage);
    let new_plans = if let Some(ref plans) = body.enabled_for_plans {
        serde_json::to_value(plans)?
    } else {
        current.enabled_for_plans.clone()
    };

    let flag = sqlx::query_as::<_, FeatureFlag>(
        "UPDATE feature_flags SET name = $1, description = $2, is_enabled = $3, rollout_percentage = $4, enabled_for_plans = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING id, name, description, is_enabled, rollout_percentage, enabled_for_plans, created_by, created_at, updated_at"
    )
    .bind(&new_name)
    .bind(new_desc)
    .bind(new_enabled)
    .bind(new_pct)
    .bind(&new_plans)
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let details = serde_json::json!({
        "is_enabled": body.is_enabled,
        "rollout_percentage": body.rollout_percentage,
    });
    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "FEATURE_FLAG_UPDATE",
        "feature_flag",
        Some(&id.to_string()),
        Some(details),
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!(flag)))
}

/// DELETE /v1/admin/feature-flags/:id — Delete a feature flag.
pub async fn delete_feature_flag(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    require_admin_write(&customer)?;

    sqlx::query("DELETE FROM feature_flags WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "FEATURE_FLAG_DELETE",
        "feature_flag",
        Some(&id.to_string()),
        None,
        None,
        None,
    )
    .await;

    Ok(Json(serde_json::json!({ "success": true })))
}
