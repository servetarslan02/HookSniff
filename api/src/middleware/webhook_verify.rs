//! Standard Webhooks verification middleware.
//!
//! Verifies incoming webhook requests using the Standard Webhooks spec.
//! Checks `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers.

use axum::{
    body::Body,
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
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
pub async fn webhook_verify_middleware(mut req: Request, next: Next) -> Result<Response, Response> {
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
                    tracing::warn!("Webhook timestamp expired: {}s", age_secs);
                    Err((
                    StatusCode::BAD_REQUEST,
                    axum::Json(json!({
                        "error": {
                            "code": "TIMESTAMP_EXPIRED",
                            "message": "Webhook timestamp expired"
                        }
                    })),
                )
                    .into_response())
                }
                Err(signing::VerificationError::SignatureMismatch) => Err((
                    StatusCode::UNAUTHORIZED,
                    axum::Json(json!({
                        "error": {
                            "code": "INVALID_SIGNATURE",
                            "message": "Webhook signature verification failed"
                        }
                    })),
                )
                    .into_response()),
                Err(signing::VerificationError::InvalidTimestamp) => Err((
                    StatusCode::BAD_REQUEST,
                    axum::Json(json!({
                        "error": {
                            "code": "INVALID_TIMESTAMP",
                            "message": "Invalid webhook timestamp"
                        }
                    })),
                )
                    .into_response()),
                Err(signing::VerificationError::MissingHeader(name)) => {
                    tracing::warn!("Missing webhook header: {}", name);
                    Err((
                    StatusCode::BAD_REQUEST,
                    axum::Json(json!({
                        "error": {
                            "code": "MISSING_HEADER",
                            "message": "Missing required webhook header"
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, routing::post, Router};
    use tower::ServiceExt;

    fn test_app(signing_secret: Option<String>) -> Router {
        let app = Router::new()
            .route("/webhook", post(|| async { "ok" }))
            .layer(axum::middleware::from_fn(webhook_verify_middleware));

        if let Some(secret) = signing_secret {
            app.layer(axum::extract::Extension(secret))
        } else {
            app
        }
    }

    #[tokio::test]
    async fn passes_through_without_standard_webhooks_headers() {
        let app = test_app(None);
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"test": true}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        // No Standard Webhooks headers → pass through (200)
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn passes_through_with_partial_headers() {
        let app = test_app(None);
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("webhook-id", "msg_123")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"test": true}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        // Only one header present → pass through
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn passes_through_with_all_headers_but_no_secret() {
        let app = test_app(None);
        let now = chrono::Utc::now().timestamp();
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("webhook-id", "msg_123")
                    .header("webhook-timestamp", now.to_string())
                    .header("webhook-signature", "v1,fakesig")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"test": true}"#))
                    .unwrap(),
            )
            .await
            .unwrap();
        // All headers present but no signing secret in extensions → pass through
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn rejects_expired_timestamp() {
        let secret = "whsec_test_secret_key_for_testing";
        let app = test_app(Some(secret.to_string()));

        let msg_id = "msg_001";
        let timestamp = "1000000000"; // Year 2001 — definitely expired
        let body = r#"{"test": true}"#;
        let signature_header = crate::signing::compute_standard_signature(secret, msg_id, timestamp, body);

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("webhook-id", msg_id)
                    .header("webhook-timestamp", timestamp)
                    .header("webhook-signature", &signature_header)
                    .header("content-type", "application/json")
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn rejects_invalid_signature() {
        let secret = "whsec_another_test_secret";
        let app = test_app(Some(secret.to_string()));

        let now = chrono::Utc::now().timestamp();
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("webhook-id", "msg_002")
                    .header("webhook-timestamp", now.to_string())
                    .header("webhook-signature", "v1,aW52YWxpZHNpZ25hdHVyZQ==") // base64("invalidsignature")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"test": true}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn accepts_valid_signature() {
        let secret = "whsec_valid_test_secret_key";
        let app = test_app(Some(secret.to_string()));

        let msg_id = "msg_valid";
        let now = chrono::Utc::now().timestamp().to_string();
        let body = r#"{"webhook":"test"}"#;
        let signature_header = crate::signing::compute_standard_signature(secret, msg_id, &now, body);

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("webhook-id", msg_id)
                    .header("webhook-timestamp", &now)
                    .header("webhook-signature", &signature_header)
                    .header("content-type", "application/json")
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn rejects_invalid_timestamp_format() {
        let secret = "whsec_test";
        let app = test_app(Some(secret.to_string()));

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/webhook")
                    .header("webhook-id", "msg_003")
                    .header("webhook-timestamp", "not_a_number")
                    .header("webhook-signature", "v1,fakesig")
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"test": true}"#))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    }
}
