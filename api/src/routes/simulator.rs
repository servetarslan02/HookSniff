//! Webhook Simulator — test webhook delivery without a real endpoint.
//!
//! POST /v1/simulator/send — Send a test webhook to a mock receiver.
//! The simulator accepts any payload and returns a simulated response.
//! Useful for testing signature verification, retry logic, and payload formatting.

use axum::extract::Extension;
use axum::routing::post;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::signing;

pub fn router() -> Router {
    Router::new().route("/", post(simulate_webhook))
}

#[derive(Debug, Deserialize)]
struct SimulateRequest {
    /// The payload to simulate.
    data: serde_json::Value,
    /// Optional event type.
    event: Option<String>,
    /// HTTP status code to simulate (default 200).
    status_code: Option<u16>,
    /// Simulated response delay in milliseconds (default 0).
    delay_ms: Option<u64>,
    /// Whether to simulate a failure (default false).
    fail: Option<bool>,
}

#[derive(Debug, Serialize)]
struct SimulateResponse {
    /// Simulated HTTP status code.
    status_code: u16,
    /// Simulated response body.
    body: serde_json::Value,
    /// HMAC signature of the payload (for testing verification).
    signature: String,
    /// Elapsed time in milliseconds.
    elapsed_ms: u64,
    /// Whether the simulated request "succeeded".
    success: bool,
}

async fn simulate_webhook(
    Extension(_customer): Extension<Customer>,
    Json(req): Json<SimulateRequest>,
) -> Result<Json<SimulateResponse>, AppError> {
    let start = std::time::Instant::now();

    // Simulate delay if requested
    if let Some(delay) = req.delay_ms {
        if delay > 0 && delay <= 30000 {
            tokio::time::sleep(std::time::Duration::from_millis(delay)).await;
        }
    }

    // Build the simulated payload
    let payload = serde_json::json!({
        "event": req.event,
        "data": req.data,
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "simulator": true,
    });

    let payload_str = serde_json::to_string(&payload)
        .map_err(|e| AppError::Internal(e.into()))?;

    // Generate a test signature
    let test_secret = "whsec_simulator_test_key";
    let signature = signing::compute_hmac(&payload_str, test_secret);

    let elapsed = start.elapsed().as_millis() as u64;
    let fail = req.fail.unwrap_or(false);
    let status_code = if fail {
        req.status_code.unwrap_or(500)
    } else {
        req.status_code.unwrap_or(200)
    };

    let body = if fail {
        serde_json::json!({
            "error": "Simulated failure",
            "message": "This is a simulated error response from the webhook simulator."
        })
    } else {
        serde_json::json!({
            "received": true,
            "message": "Webhook received successfully (simulated).",
            "event": req.event,
        })
    };

    Ok(Json(SimulateResponse {
        status_code,
        body,
        signature,
        elapsed_ms: elapsed,
        success: !fail,
    }))
}
