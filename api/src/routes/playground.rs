use axum::extract::Extension;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(get_playground))
        .route("/test", post(test_webhook))
}

#[derive(Serialize)]
struct PlaygroundResponse {
    endpoints: Vec<EndpointInfo>,
    recent_deliveries: Vec<DeliveryPreview>,
    sample_payloads: Vec<SamplePayload>,
}

#[derive(Serialize)]
struct EndpointInfo {
    id: Uuid,
    url: String,
    description: Option<String>,
    is_active: bool,
}

#[derive(Serialize)]
struct DeliveryPreview {
    id: Uuid,
    event: Option<String>,
    status: String,
    created_at: String,
}

#[derive(Serialize)]
struct SamplePayload {
    name: String,
    event: String,
    data: serde_json::Value,
}

async fn get_playground(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PlaygroundResponse>, AppError> {
    // Get user's endpoints
    let endpoints: Vec<(Uuid, String, Option<String>, bool)> = sqlx::query_as(
        "SELECT id, url, description, is_active FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 5"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    // Get recent deliveries
    let deliveries: Vec<(Uuid, Option<String>, String, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
        "SELECT id, event_type, status, created_at FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 5"
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(PlaygroundResponse {
        endpoints: endpoints.into_iter().map(|(id, url, desc, active)| EndpointInfo {
            id, url, description: desc, is_active: active,
        }).collect(),
        recent_deliveries: deliveries.into_iter().map(|(id, event, status, created)| DeliveryPreview {
            id, event, status, created_at: created.to_rfc3339(),
        }).collect(),
        sample_payloads: vec![
            SamplePayload {
                name: "Order Created".to_string(),
                event: "order.created".to_string(),
                data: serde_json::json!({"order_id": "ord_123", "total": 49.99, "currency": "USD"}),
            },
            SamplePayload {
                name: "User Signed Up".to_string(),
                event: "user.signup".to_string(),
                data: serde_json::json!({"user_id": "usr_456", "email": "user@example.com", "plan": "pro"}),
            },
            SamplePayload {
                name: "Payment Completed".to_string(),
                event: "payment.completed".to_string(),
                data: serde_json::json!({"payment_id": "pay_789", "amount": 9900, "method": "card"}),
            },
        ],
    }))
}

use axum::response::IntoResponse;

async fn test_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<TestWebhookRequest>,
) -> Result<Json<TestWebhookResponse>, AppError> {
    // Send a test webhook to the specified endpoint
    let endpoint = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true"
    )
    .bind(req.endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| AppError::Internal(e.into()))?;

    let payload = serde_json::json!({
        "event": "test.ping",
        "data": {"test": true, "timestamp": chrono::Utc::now().to_rfc3339()},
        "source": "hookrelay-playground"
    });

    let start = std::time::Instant::now();
    let result = client
        .post(&endpoint.url)
        .header("Content-Type", "application/json")
        .header("X-Hookrelay-Test", "true")
        .json(&payload)
        .send()
        .await;

    let duration_ms = start.elapsed().as_millis() as i32;

    match result {
        Ok(resp) => {
            let status = resp.status().as_u16();
            let body = resp.text().await.unwrap_or_default();
            Ok(Json(TestWebhookResponse {
                success: (200..300).contains(&status),
                status_code: status,
                response_body: body.chars().take(500).collect(),
                duration_ms,
                endpoint_url: endpoint.url,
            }))
        }
        Err(e) => Ok(Json(TestWebhookResponse {
            success: false,
            status_code: 0,
            response_body: String::new(),
            duration_ms,
            endpoint_url: endpoint.url,
        })),
    }
}

#[derive(serde::Deserialize)]
struct TestWebhookRequest {
    endpoint_id: Uuid,
}

#[derive(Serialize)]
struct TestWebhookResponse {
    success: bool,
    status_code: u16,
    response_body: String,
    duration_ms: i32,
    endpoint_url: String,
}
