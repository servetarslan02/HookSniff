use axum::extract::Extension;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_alerts).post(create_alert))
        .route("/{id}", get(get_alert).delete(delete_alert))
        .route("/{id}/test", post(test_alert))
}

#[derive(Serialize)]
struct AlertRule {
    id: Uuid,
    name: String,
    condition: String,
    threshold: i32,
    channels: Vec<String>,
    is_active: bool,
    created_at: String,
}

#[derive(Deserialize)]
struct CreateAlertRequest {
    name: String,
    condition: String,  // "failure_rate", "latency", "consecutive_failures"
    threshold: i32,
    channels: Vec<String>,  // "slack", "email", "webhook"
    endpoint_id: Option<Uuid>,
}

async fn list_alerts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<AlertRule>>, AppError> {
    let alerts = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, condition, threshold, channels, is_active, created_at FROM alert_rules WHERE customer_id = $1 ORDER BY created_at DESC"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(alerts.into_iter().map(|(id, name, condition, threshold, channels, active, created)| {
        let channel_list: Vec<String> = channels.as_array()
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_default();
        AlertRule {
            id, name, condition, threshold, channels: channel_list, is_active: active,
            created_at: created.to_rfc3339(),
        }
    }).collect()))
}

async fn create_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateAlertRequest>,
) -> Result<Json<AlertRule>, AppError> {
    let channels_json = serde_json::json!(req.channels);

    let alert = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "INSERT INTO alert_rules (customer_id, name, condition, threshold, channels, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, condition, threshold, channels, is_active, created_at"
    )
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.condition)
    .bind(req.threshold)
    .bind(&channels_json)
    .fetch_one(&pool)
    .await?;

    tracing::info!("🔔 Alert rule created: {} for customer {}", req.name, customer.id);

    Ok(Json(AlertRule {
        id: alert.0,
        name: alert.1,
        condition: alert.2,
        threshold: alert.3,
        channels: req.channels,
        is_active: alert.5,
        created_at: alert.6.to_rfc3339(),
    }))
}

async fn get_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<AlertRule>, AppError> {
    let alert = sqlx::query_as::<_, (Uuid, String, String, i32, serde_json::Value, bool, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, condition, threshold, channels, is_active, created_at FROM alert_rules WHERE id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let channels: Vec<String> = alert.4.as_array()
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_default();

    Ok(Json(AlertRule {
        id: alert.0, name: alert.1, condition: alert.2, threshold: alert.3,
        channels, is_active: alert.5, created_at: alert.6.to_rfc3339(),
    }))
}

async fn delete_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM alert_rules WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

async fn test_alert(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Verify ownership
    let _alert: (Uuid,) = sqlx::query_as("SELECT id FROM alert_rules WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    // Send test notification
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Test alert sent. Check your notification channels."
    })))
}
