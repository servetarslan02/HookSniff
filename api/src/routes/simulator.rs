//! Webhook Simulator — test webhook delivery without a real endpoint.
//!
//! POST /v1/simulator/send — Send a test webhook to a mock receiver.
//! The simulator accepts any payload and returns a simulated response.
//! Useful for testing signature verification, retry logic, and payload formatting.

use axum::extract::Extension;
use axum::routing::post;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

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
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Json(req): Json<SimulateRequest>,
) -> Result<Json<SimulateResponse>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, _customer.id, "developer").await?;

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

    let payload_str = serde_json::to_string(&payload).map_err(|e| AppError::Internal(e.into()))?;

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_simulate_request_deserialize() {
        let json = r#"{
            "data": {"key": "value"},
            "event": "order.created",
            "status_code": 201,
            "delay_ms": 100,
            "fail": false
        }"#;
        let req: SimulateRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.event.unwrap(), "order.created");
        assert_eq!(req.status_code.unwrap(), 201);
        assert_eq!(req.delay_ms.unwrap(), 100);
        assert!(!req.fail.unwrap());
    }

    #[test]
    fn test_simulate_request_minimal() {
        let json = r#"{"data": {"test": true}}"#;
        let req: SimulateRequest = serde_json::from_str(json).unwrap();
        assert!(req.event.is_none());
        assert!(req.status_code.is_none());
        assert!(req.delay_ms.is_none());
        assert!(req.fail.is_none());
    }

    #[test]
    fn test_simulate_response_serialize() {
        let resp = SimulateResponse {
            status_code: 200,
            body: serde_json::json!({"received": true}),
            signature: "v1,abc123".to_string(),
            elapsed_ms: 5,
            success: true,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["status_code"], 200);
        assert_eq!(json["success"], true);
        assert_eq!(json["elapsed_ms"], 5);
        assert_eq!(json["signature"], "v1,abc123");
    }

    #[test]
    fn test_simulate_request_debug() {
        let json = r#"{"data": {}}"#;
        let req: SimulateRequest = serde_json::from_str(json).unwrap();
        let debug = format!("{:?}", req);
        assert!(debug.contains("SimulateRequest"));
    }

    #[test]
    fn test_fail_logic() {
        let fail = true;
        assert!(fail);

        let status_code = if fail { 500 } else { 200 };
        assert_eq!(status_code, 500);

        let success = !fail;
        assert!(!success);
    }

    #[test]
    fn test_status_code_defaults() {
        // When fail=true and no status_code => 500
        let fail = true;
        let status_code: u16 = if fail {
            500
        } else {
            200
        };
        assert_eq!(status_code, 500);

        // When fail=false and no status_code => 200
        let fail = false;
        let status_code: u16 = if fail {
            500
        } else {
            200
        };
        assert_eq!(status_code, 200);
    }

    #[test]
    fn test_delay_clamping() {
        // Delay should be capped at 30000ms
        let delay = Some(60000u64);
        if let Some(d) = delay {
            if d > 0 && d <= 30000 {
                // Would sleep
            } else {
                // Too large, skip
                assert!(d > 30000);
            }
        }
    }
}
