use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::delivery::DeliveryAttempt;

pub fn router() -> Router {
    Router::new()
        .route("/{id}/details", get(get_delivery_details))
        .route("/{id}/attempts/{attempt_id}", get(get_attempt_detail))
}

#[derive(Serialize)]
struct DeliveryDetails {
    id: Uuid,
    endpoint_id: Uuid,
    endpoint_url: String,
    event: Option<String>,
    status: String,
    attempt_count: i32,
    max_attempts: i32,
    payload: serde_json::Value,
    created_at: String,
    last_attempt_at: Option<String>,
    next_retry_at: Option<String>,
    response_status: Option<i32>,
    response_body: Option<String>,
    attempts: Vec<AttemptDetail>,
    signature_info: SignatureInfo,
}

#[derive(Serialize)]
struct AttemptDetail {
    id: Uuid,
    attempt_number: i32,
    status: String,
    status_code: Option<i32>,
    response_body: Option<String>,
    request_headers: Option<serde_json::Value>,
    response_headers: Option<serde_json::Value>,
    duration_ms: Option<i32>,
    error_message: Option<String>,
    created_at: String,
}

#[derive(Serialize)]
struct SignatureInfo {
    algorithm: String,
    header_name: String,
    format: String,
    secret_prefix: String,
}

async fn get_delivery_details(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> Result<Json<DeliveryDetails>, AppError> {
    // Get delivery with endpoint info
    let delivery = sqlx::query_as::<_, (Uuid, Uuid, serde_json::Value, Option<String>, String, i32, i32, Option<chrono::DateTime<chrono::Utc>>, Option<i32>, Option<String>, Option<chrono::DateTime<chrono::Utc>>, chrono::DateTime<chrono::Utc>)>(
        "SELECT d.id, d.endpoint_id, d.payload, d.event_type, d.status, d.attempt_count, d.max_attempts, d.last_attempt_at, d.response_status, d.response_body, d.next_retry_at, d.created_at FROM deliveries d WHERE d.id = $1 AND d.customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Get endpoint URL
    let endpoint_url: (String,) = sqlx::query_as("SELECT url FROM endpoints WHERE id = $1")
        .bind(delivery.1)
        .fetch_one(&pool)
        .await?;

    // Get all attempts
    let attempts = sqlx::query_as::<_, (Uuid, i32, Option<i32>, Option<String>, Option<i32>, Option<String>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, attempt_number, status_code, response_body, duration_ms, error_message, created_at FROM delivery_attempts WHERE delivery_id = $1 ORDER BY attempt_number ASC"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(DeliveryDetails {
        id: delivery.0,
        endpoint_id: delivery.1,
        endpoint_url: endpoint_url.0,
        event: delivery.3,
        status: delivery.4,
        attempt_count: delivery.5,
        max_attempts: delivery.6,
        payload: delivery.2,
        created_at: delivery.11.to_rfc3339(),
        last_attempt_at: delivery.7.map(|t| t.to_rfc3339()),
        next_retry_at: delivery.10.map(|t| t.to_rfc3339()),
        response_status: delivery.8,
        response_body: delivery.9,
        attempts: attempts.into_iter().map(|(id, num, status, body, dur, err, created)| {
            let derived_status = match status {
                Some(code) if (200..300).contains(&code) => "delivered".to_string(),
                _ => "failed".to_string(),
            };
            AttemptDetail {
                id,
                attempt_number: num,
                status: derived_status,
                status_code: status,
                response_body: body,
                request_headers: None,
                response_headers: None,
                duration_ms: dur,
                error_message: err,
                created_at: created.to_rfc3339(),
            }
        }).collect(),
        signature_info: SignatureInfo {
            algorithm: "HMAC-SHA256".to_string(),
            header_name: "webhook-signature".to_string(),
            format: "v1,<base64(hmac)>".to_string(),
            secret_prefix: "whsec_".to_string(),
        },
    }))
}

async fn get_attempt_detail(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    axum::extract::Path((delivery_id, attempt_id)): axum::extract::Path<(Uuid, Uuid)>,
) -> Result<Json<AttemptDetail>, AppError> {
    // Verify delivery belongs to customer
    let _delivery: (Uuid,) = sqlx::query_as("SELECT id FROM deliveries WHERE id = $1 AND customer_id = $2")
        .bind(delivery_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    let attempt = sqlx::query_as::<_, (Uuid, i32, Option<i32>, Option<String>, Option<i32>, Option<String>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, attempt_number, status_code, response_body, duration_ms, error_message, created_at FROM delivery_attempts WHERE id = $1 AND delivery_id = $2"
    )
    .bind(attempt_id)
    .bind(delivery_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let derived_status = match attempt.2 {
        Some(code) if (200..300).contains(&code) => "delivered".to_string(),
        _ => "failed".to_string(),
    };

    Ok(Json(AttemptDetail {
        id: attempt.0,
        attempt_number: attempt.1,
        status: derived_status,
        status_code: attempt.2,
        response_body: attempt.3,
        request_headers: None,
        response_headers: None,
        duration_ms: attempt.4,
        error_message: attempt.5,
        created_at: attempt.6.to_rfc3339(),
    }))
}
