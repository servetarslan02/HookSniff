use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Not found")]
    NotFound,

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Payload too large")]
    PayloadTooLarge,

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match &self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "NOT_FOUND", self.to_string()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", self.to_string()),
            AppError::Forbidden(msg) => (StatusCode::FORBIDDEN, "FORBIDDEN", msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg.clone()),
            AppError::PayloadTooLarge => (
                StatusCode::PAYLOAD_TOO_LARGE,
                "PAYLOAD_TOO_LARGE",
                self.to_string(),
            ),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, "CONFLICT", msg.clone()),
            AppError::Validation(msg) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                msg.clone(),
            ),
            AppError::RateLimitExceeded => (
                StatusCode::TOO_MANY_REQUESTS,
                "RATE_LIMIT_EXCEEDED",
                self.to_string(),
            ),
            AppError::Internal(e) => {
                tracing::error!("Internal error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    "Internal server error".into(),
                )
            }
            AppError::Database(e) => {
                tracing::error!("Database error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DATABASE_ERROR",
                    "Internal server error".into(),
                )
            }
            AppError::Serialization(e) => {
                tracing::error!("Serialization error: {:?}", e);
                (
                    StatusCode::BAD_REQUEST,
                    "SERIALIZATION_ERROR",
                    "Invalid request format".into(),
                )
            }
        };

        let body = json!({
            "error": {
                "code": code,
                "message": message,
            }
        });

        (status, Json(body)).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::to_bytes;
    use axum::response::IntoResponse;

    // ── Display / Error trait tests ──

    #[test]
    fn test_display_not_found() {
        let err = AppError::NotFound;
        assert_eq!(err.to_string(), "Not found");
    }

    #[test]
    fn test_display_unauthorized() {
        let err = AppError::Unauthorized;
        assert_eq!(err.to_string(), "Unauthorized");
    }

    #[test]
    fn test_display_forbidden() {
        let err = AppError::Forbidden("nope".into());
        assert_eq!(err.to_string(), "Forbidden: nope");
    }

    #[test]
    fn test_display_bad_request() {
        let err = AppError::BadRequest("invalid input".into());
        assert_eq!(err.to_string(), "Bad request: invalid input");
    }

    #[test]
    fn test_display_payload_too_large() {
        let err = AppError::PayloadTooLarge;
        assert_eq!(err.to_string(), "Payload too large");
    }

    #[test]
    fn test_display_rate_limit_exceeded() {
        let err = AppError::RateLimitExceeded;
        assert_eq!(err.to_string(), "Rate limit exceeded");
    }

    #[test]
    fn test_display_conflict() {
        let err = AppError::Conflict("duplicate entry".into());
        assert_eq!(err.to_string(), "Conflict: duplicate entry");
    }

    #[test]
    fn test_display_validation() {
        let err = AppError::Validation("invalid field".into());
        assert_eq!(err.to_string(), "Validation error: invalid field");
    }

    #[test]
    fn test_display_internal() {
        let err = AppError::Internal(anyhow::anyhow!("boom"));
        assert_eq!(err.to_string(), "Internal error: boom");
    }

    #[test]
    fn test_display_serialization() {
        let inner = serde_json::from_str::<serde_json::Value>("not json").unwrap_err();
        let err = AppError::Serialization(inner);
        assert!(err.to_string().starts_with("Serialization error:"));
    }

    #[test]
    fn test_display_database() {
        // Create a sqlx error via invalid connection string parsing
        let err = AppError::Database(sqlx::Error::PoolClosed);
        assert!(err.to_string().contains("Database error"));
    }

    // ── From trait tests ──

    #[test]
    fn test_from_anyhow() {
        let err: AppError = anyhow::anyhow!("test").into();
        match err {
            AppError::Internal(_) => {}
            _ => panic!("expected Internal variant"),
        }
    }

    #[test]
    fn test_from_sqlx() {
        let inner = sqlx::Error::PoolClosed;
        let err: AppError = inner.into();
        match err {
            AppError::Database(_) => {}
            _ => panic!("expected Database variant"),
        }
    }

    #[test]
    fn test_from_serde_json() {
        let inner = serde_json::from_str::<serde_json::Value>("}").unwrap_err();
        let err: AppError = inner.into();
        match err {
            AppError::Serialization(_) => {}
            _ => panic!("expected Serialization variant"),
        }
    }

    // ── IntoResponse tests ──

    async fn extract_status_and_body(
        resp: axum::response::Response,
    ) -> (StatusCode, serde_json::Value) {
        let status = resp.status();
        let body = to_bytes(resp.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        (status, json)
    }

    #[tokio::test]
    async fn test_into_response_not_found() {
        let resp = AppError::NotFound.into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(body["error"]["code"], "NOT_FOUND");
        assert_eq!(body["error"]["message"], "Not found");
    }

    #[tokio::test]
    async fn test_into_response_unauthorized() {
        let resp = AppError::Unauthorized.into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        assert_eq!(body["error"]["code"], "UNAUTHORIZED");
        assert_eq!(body["error"]["message"], "Unauthorized");
    }

    #[tokio::test]
    async fn test_into_response_forbidden() {
        let resp = AppError::Forbidden("admin only".into()).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::FORBIDDEN);
        assert_eq!(body["error"]["code"], "FORBIDDEN");
        assert_eq!(body["error"]["message"], "admin only");
    }

    #[tokio::test]
    async fn test_into_response_bad_request() {
        let resp = AppError::BadRequest("missing field".into()).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(body["error"]["code"], "BAD_REQUEST");
        assert_eq!(body["error"]["message"], "missing field");
    }

    #[tokio::test]
    async fn test_into_response_payload_too_large() {
        let resp = AppError::PayloadTooLarge.into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::PAYLOAD_TOO_LARGE);
        assert_eq!(body["error"]["code"], "PAYLOAD_TOO_LARGE");
    }

    #[tokio::test]
    async fn test_into_response_rate_limit() {
        let resp = AppError::RateLimitExceeded.into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(body["error"]["code"], "RATE_LIMIT_EXCEEDED");
    }

    #[tokio::test]
    async fn test_into_response_conflict() {
        let resp = AppError::Conflict("duplicate endpoint name".into()).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::CONFLICT);
        assert_eq!(body["error"]["code"], "CONFLICT");
        assert_eq!(body["error"]["message"], "duplicate endpoint name");
    }

    #[tokio::test]
    async fn test_into_response_validation() {
        let resp = AppError::Validation("invalid input".into()).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert_eq!(body["error"]["code"], "VALIDATION_ERROR");
        assert_eq!(body["error"]["message"], "invalid input");
    }

    #[tokio::test]
    async fn test_into_response_internal() {
        let resp = AppError::Internal(anyhow::anyhow!("kaboom")).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(body["error"]["code"], "INTERNAL_ERROR");
        // Internal errors should NOT leak details
        assert_eq!(body["error"]["message"], "Internal server error");
    }

    #[tokio::test]
    async fn test_into_response_database() {
        let resp = AppError::Database(sqlx::Error::PoolClosed).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(body["error"]["code"], "DATABASE_ERROR");
        assert_eq!(body["error"]["message"], "Internal server error");
    }

    #[tokio::test]
    async fn test_into_response_serialization() {
        let inner = serde_json::from_str::<serde_json::Value>("}").unwrap_err();
        let resp = AppError::Serialization(inner).into_response();
        let (status, body) = extract_status_and_body(resp).await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(body["error"]["code"], "SERIALIZATION_ERROR");
        // Should NOT leak internal serde_json error details
        assert_eq!(body["error"]["message"], "Invalid request format");
    }

    // ── Debug trait ──

    #[test]
    fn test_debug_not_found() {
        let err = AppError::NotFound;
        assert_eq!(format!("{:?}", err), "NotFound");
    }

    #[test]
    fn test_debug_forbidden() {
        let err = AppError::Forbidden("x".into());
        let dbg = format!("{:?}", err);
        assert!(dbg.contains("Forbidden"));
        assert!(dbg.contains("x"));
    }
}
