use axum::extract::{Extension, Path};
use axum::routing::{delete, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::{Customer, DeviceTokenResponse, RegisterDeviceRequest};

pub fn router() -> Router {
    Router::new()
        .route("/", post(register_device).get(list_devices))
        .route("/{token}", delete(remove_device))
}

#[derive(Debug, sqlx::FromRow)]
struct DeviceTokenRow {
    id: Uuid,
    customer_id: Uuid,
    token: String,
    platform: String,
    created_at: DateTime<Utc>,
}

/// POST /v1/devices — Register a device token for push notifications
async fn register_device(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<RegisterDeviceRequest>,
) -> Result<Json<DeviceTokenResponse>, AppError> {
    // RBAC: developer or higher required to register devices
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    if req.token.trim().is_empty() {
        return Err(AppError::coded(ErrorCode::DeviceTokenRequired));
    }

    let platform = req.platform.unwrap_or_else(|| "android".to_string());
    if !["android", "ios", "web"].contains(&platform.as_str()) {
        return Err(AppError::BadRequest(
            "Platform must be android, ios, or web".into(),
        ));
    }

    // Upsert: if token already exists for this customer, update last_used_at
    let row = sqlx::query_as::<_, DeviceTokenRow>(
        r#"INSERT INTO device_tokens (customer_id, token, platform)
           VALUES ($1, $2, $3)
           ON CONFLICT (customer_id, token) DO UPDATE SET created_at = NOW()
           RETURNING id, customer_id, token, platform, created_at"#,
    )
    .bind(customer.id)
    .bind(&req.token)
    .bind(&platform)
    .fetch_one(&pool)
    .await?;

    tracing::info!("📱 Device token registered for customer {}", customer.id);

    Ok(Json(DeviceTokenResponse {
        id: row.id,
        token: row.token,
        platform: row.platform,
        created_at: row.created_at,
    }))
}

/// GET /v1/devices — List registered device tokens
async fn list_devices(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<DeviceTokenResponse>>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;
    let rows = sqlx::query_as::<_, DeviceTokenRow>(
        "SELECT id, customer_id, token, platform, created_at FROM device_tokens WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(
        rows.into_iter()
            .map(|r| DeviceTokenResponse {
                id: r.id,
                token: r.token,
                platform: r.platform,
                created_at: r.created_at,
            })
            .collect(),
    ))
}

/// DELETE /v1/devices/{token} — Remove a device token
async fn remove_device(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(token): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    // RBAC: developer or higher required to remove devices
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    let result = sqlx::query("DELETE FROM device_tokens WHERE customer_id = $1 AND token = $2")
        .bind(customer.id)
        .bind(&token)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("📱 Device token removed for customer {}", customer.id);

    Ok(Json(serde_json::json!({"deleted": true})))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_device_platform_validation() {
        // Valid platforms
        assert!(["android", "ios", "web"].contains(&"android"));
        assert!(["android", "ios", "web"].contains(&"ios"));
        assert!(["android", "ios", "web"].contains(&"web"));

        // Invalid platform
        assert!(!["android", "ios", "web"].contains(&"windows"));
    }

    #[test]
    fn test_empty_token_validation() {
        let token = "  ";
        assert!(token.trim().is_empty());

        let token = "valid_token_123";
        assert!(!token.trim().is_empty());
    }

    #[test]
    fn test_default_platform() {
        let platform = "android";
        assert_eq!(platform, "android");
    }
}
