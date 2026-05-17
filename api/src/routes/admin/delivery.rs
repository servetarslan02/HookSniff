//! Delivery replay and test webhook.

use axum::extract::{Extension, Path};
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Test Webhook ──────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TestWebhookRequest {
    pub endpoint_url: String,
    pub event_type: Option<String>,
    pub payload: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct TestWebhookResponse {
    pub status_code: u16,
    pub response_body: String,
    pub duration_ms: u64,
}

/// POST /v1/admin/test-webhook — Send a test HTTP POST to a URL.
pub async fn test_webhook(
    Extension(customer): Extension<Customer>,
    Json(req): Json<TestWebhookRequest>,
) -> Result<Json<TestWebhookResponse>, AppError> {
    require_admin_write(&customer)?;

    if !req.endpoint_url.starts_with("http://") && !req.endpoint_url.starts_with("https://") {
        return Err(AppError::BadRequest(
            "URL must start with http:// or https://".into(),
        ));
    }

    if let Err(e) = crate::ssrf::validate_url(&req.endpoint_url) {
        tracing::warn!("SSRF blocked on test-webhook: {} — {:?}", req.endpoint_url, e);
        return Err(AppError::BadRequest(format!("URL not allowed: {}", e)));
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .connect_timeout(std::time::Duration::from_secs(5))
        .build()
        .unwrap_or_else(|_| reqwest::Client::new());
    let start = std::time::Instant::now();

    let mut request = client
        .post(&req.endpoint_url)
        .header("Content-Type", "application/json");

    if let Some(ref event_type) = req.event_type {
        request = request.header("X-HookSniff-Event", event_type.as_str());
    }

    let response = request
        .json(&req.payload)
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Request failed: {}", e)))?;

    let duration_ms = start.elapsed().as_millis() as u64;
    let status_code = response.status().as_u16();
    let response_body = response
        .text()
        .await
        .unwrap_or_else(|_| "<unreadable>".to_string());

    let response_body = if response_body.len() > 4096 {
        format!("{}...[truncated]", &response_body[..4096])
    } else {
        response_body
    };

    Ok(Json(TestWebhookResponse {
        status_code,
        response_body,
        duration_ms,
    }))
}

// ── Delivery Replay ───────────────────────────────────────

/// POST /v1/admin/deliveries/:id/replay — Replay a delivery.
pub async fn replay_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let original = sqlx::query_as::<_, (Uuid, Uuid, serde_json::Value, Option<String>, i32)>(
        "SELECT id, endpoint_id, payload, event_type, replay_count FROM deliveries WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (orig_id, endpoint_id, payload, event_type, replay_count) = original;

    let new_delivery = sqlx::query_as::<_, (Uuid,)>(
        r#"INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count, is_test)
           VALUES ($1, $2, $3, $4, 'pending', 3, $5, FALSE)
           RETURNING id"#,
    )
    .bind(endpoint_id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&event_type)
    .bind(replay_count + 1)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "🔁 Admin replayed delivery {} → new delivery {}",
        orig_id,
        new_delivery.0
    );

    Ok(Json(serde_json::json!({
        "message": "Delivery replayed successfully",
        "original_id": orig_id,
        "new_delivery_id": new_delivery.0,
    })))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_test_webhook_response_serialization() {
        let resp = TestWebhookResponse {
            status_code: 200,
            response_body: "OK".to_string(),
            duration_ms: 42,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["status_code"], 200);
        assert_eq!(json["response_body"], "OK");
        assert_eq!(json["duration_ms"], 42);
    }
}
