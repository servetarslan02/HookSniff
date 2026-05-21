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
    // RBAC: developer or higher required to use playground
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

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
        endpoints: endpoints
            .into_iter()
            .map(|(id, url, desc, active)| EndpointInfo {
                id,
                url,
                description: desc,
                is_active: active,
            })
            .collect(),
        recent_deliveries: deliveries
            .into_iter()
            .map(|(id, event, status, created)| DeliveryPreview {
                id,
                event,
                status,
                created_at: created.to_rfc3339(),
            })
            .collect(),
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

async fn test_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<TestWebhookRequest>,
) -> Result<Json<TestWebhookResponse>, AppError> {
    // RBAC: developer or higher required to send test webhooks
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    // Send a test webhook to the specified endpoint
    let endpoint = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
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
        "source": "hooksniff-playground"
    });

    let payload_str = serde_json::to_string(&payload).unwrap_or_default();
    let msg_id = Uuid::new_v4().to_string();
    let timestamp = chrono::Utc::now().timestamp().to_string();

    // Compute Standard Webhooks signature
    let signature = crate::signing::compute_standard_signature(
        &endpoint.signing_secret,
        &msg_id,
        &timestamp,
        &payload_str,
    );

    let start = std::time::Instant::now();
    let result = client
        .post(&endpoint.url)
        .header("Content-Type", "application/json")
        // Standard Webhooks headers
        .header("X-HookSniff-ID", &msg_id)
        .header("X-HookSniff-Timestamp", &timestamp)
        .header("X-HookSniff-Signature", &signature)
        // Test marker
        .header("X-HookSniff-Test", "true")
        .body(payload_str)
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
        Err(_e) => Ok(Json(TestWebhookResponse {
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

#[cfg(test)]
mod tests {
    use super::*;

    // ── PlaygroundResponse ──────────────────────────────────

    #[test]
    fn test_playground_response_serialization() {
        let resp = PlaygroundResponse {
            endpoints: vec![],
            recent_deliveries: vec![],
            sample_payloads: vec![],
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["endpoints"].as_array().unwrap().is_empty());
        assert!(json["recent_deliveries"].as_array().unwrap().is_empty());
        assert!(json["sample_payloads"].as_array().unwrap().is_empty());
    }

    // ── EndpointInfo ────────────────────────────────────────

    #[test]
    fn test_endpoint_info_serialization() {
        let info = EndpointInfo {
            id: Uuid::new_v4(),
            url: "https://example.com/webhook".to_string(),
            description: Some("Main endpoint".to_string()),
            is_active: true,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["url"], "https://example.com/webhook");
        assert!(json["is_active"].as_bool().unwrap());
    }

    #[test]
    fn test_endpoint_info_no_description() {
        let info = EndpointInfo {
            id: Uuid::new_v4(),
            url: "https://example.com".to_string(),
            description: None,
            is_active: false,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert!(json["description"].is_null());
        assert!(!json["is_active"].as_bool().unwrap());
    }

    // ── DeliveryPreview ─────────────────────────────────────

    #[test]
    fn test_delivery_preview_serialization() {
        let preview = DeliveryPreview {
            id: Uuid::new_v4(),
            event: Some("order.created".to_string()),
            status: "delivered".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&preview).unwrap();
        assert_eq!(json["event"], "order.created");
        assert_eq!(json["status"], "delivered");
    }

    #[test]
    fn test_delivery_preview_no_event() {
        let preview = DeliveryPreview {
            id: Uuid::new_v4(),
            event: None,
            status: "failed".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&preview).unwrap();
        assert!(json["event"].is_null());
    }

    // ── SamplePayload ───────────────────────────────────────

    #[test]
    fn test_sample_payload_serialization() {
        let payload = SamplePayload {
            name: "Order Created".to_string(),
            event: "order.created".to_string(),
            data: serde_json::json!({"order_id": "ord_123"}),
        };
        let json = serde_json::to_value(&payload).unwrap();
        assert_eq!(json["name"], "Order Created");
        assert_eq!(json["event"], "order.created");
        assert_eq!(json["data"]["order_id"], "ord_123");
    }

    // ── TestWebhookRequest ──────────────────────────────────

    #[test]
    fn test_test_webhook_request_deserialization() {
        let json = r#"{"endpoint_id":"11111111-1111-1111-1111-111111111111"}"#;
        let req: TestWebhookRequest = serde_json::from_str(json).unwrap();
        assert_eq!(
            req.endpoint_id,
            Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap()
        );
    }

    // ── TestWebhookResponse ─────────────────────────────────

    #[test]
    fn test_test_webhook_response_serialization() {
        let resp = TestWebhookResponse {
            success: true,
            status_code: 200,
            response_body: "OK".to_string(),
            duration_ms: 150,
            endpoint_url: "https://example.com".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json["success"].as_bool().unwrap());
        assert_eq!(json["status_code"], 200);
        assert_eq!(json["duration_ms"], 150);
    }

    #[test]
    fn test_test_webhook_response_failure() {
        let resp = TestWebhookResponse {
            success: false,
            status_code: 500,
            response_body: "Internal Server Error".to_string(),
            duration_ms: 5000,
            endpoint_url: "https://broken.com".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(!json["success"].as_bool().unwrap());
        assert_eq!(json["status_code"], 500);
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_playground_router_construction() {
        let _router = router();
    }
}
