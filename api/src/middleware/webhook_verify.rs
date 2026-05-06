//! Standard Webhooks verification middleware.
//!
//! Verifies incoming webhook requests using the Standard Webhooks spec.
//! Checks `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers.

use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
    body::Body,
};
use serde_json::json;

use crate::signing;

/// Middleware that verifies Standard Webhooks signatures on incoming requests.
///
/// Extracts the following headers:
/// - `webhook-id`: The unique message ID
/// - `webhook-timestamp`: Unix timestamp string
/// - `webhook-signature`: `v1,<base64(hmac)>` signature(s)
///
/// The signing secret is expected to be available in request extensions
/// (set by the endpoint resolution logic upstream).
pub async fn webhook_verify_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, Response> {
    // Extract Standard Webhooks headers
    let msg_id = req
        .headers()
        .get("webhook-id")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let timestamp = req
        .headers()
        .get("webhook-timestamp")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let signature = req
        .headers()
        .get("webhook-signature")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // If all Standard Webhooks headers are present, verify them
    if let (Some(id), Some(ts), Some(sig)) = (msg_id, timestamp, signature) {
        // Get the signing secret from extensions (set by endpoint resolution)
        let signing_secret = req
            .extensions()
            .get::<String>()
            .cloned()
            .unwrap_or_default();

        if !signing_secret.is_empty() {
            // Get the body for verification
            let body = std::mem::replace(req.body_mut(), Body::empty());
            let body_bytes = axum::body::to_bytes(body, usize::MAX)
                .await
                .unwrap_or_default();
            let body_str = String::from_utf8_lossy(&body_bytes).to_string();

            // Read tolerance from config
            let tolerance = req
                .extensions()
                .get::<crate::config::Config>()
                .and_then(|_| {
                    std::env::var("WEBHOOK_TIMESTAMP_TOLERANCE_SECS")
                        .ok()
                        .and_then(|v| v.parse::<i64>().ok())
                });

            match signing::verify_standard_signature(
                &signing_secret,
                &id,
                &ts,
                &sig,
                &body_str,
                tolerance,
            ) {
                Ok(()) => {
                    // Reconstruct the request with the consumed body
                    *req.body_mut() = Body::from(body_bytes);
                    Ok(next.run(req).await)
                }
                Err(signing::VerificationError::TimestampExpired { age_secs, .. }) => {
                    Err((
                        StatusCode::BAD_REQUEST,
                        axum::Json(json!({
                            "error": {
                                "code": "TIMESTAMP_EXPIRED",
                                "message": format!("Webhook timestamp expired ({}s old)", age_secs)
                            }
                        })),
                    )
                        .into_response())
                }
                Err(signing::VerificationError::SignatureMismatch) => {
                    Err((
                        StatusCode::UNAUTHORIZED,
                        axum::Json(json!({
                            "error": {
                                "code": "INVALID_SIGNATURE",
                                "message": "Webhook signature verification failed"
                            }
                        })),
                    )
                        .into_response())
                }
                Err(signing::VerificationError::InvalidTimestamp) => {
                    Err((
                        StatusCode::BAD_REQUEST,
                        axum::Json(json!({
                            "error": {
                                "code": "INVALID_TIMESTAMP",
                                "message": "Invalid webhook timestamp header"
                            }
                        })),
                    )
                        .into_response())
                }
                Err(signing::VerificationError::MissingHeader(name)) => {
                    Err((
                        StatusCode::BAD_REQUEST,
                        axum::Json(json!({
                            "error": {
                                "code": "MISSING_HEADER",
                                "message": format!("Missing required header: {}", name)
                            }
                        })),
                    )
                        .into_response())
                }
            }
        } else {
            // No signing secret available, pass through
            Ok(next.run(req).await)
        }
    } else {
        // Standard Webhooks headers not present — pass through (legacy mode)
        Ok(next.run(req).await)
    }
}
