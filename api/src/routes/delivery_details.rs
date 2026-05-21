use axum::extract::Extension;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

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
    #[serde(rename = "request_body")]
    payload: serde_json::Value,
    request_headers: Option<serde_json::Value>,
    created_at: String,
    updated_at: Option<String>,
    last_attempt_at: Option<String>,
    next_retry_at: Option<String>,
    response_status: Option<i32>,
    response_body: Option<String>,
    error_message: Option<String>,
    attempts: Vec<AttemptDetail>,
    signature_info: SignatureInfo,
}

#[derive(Serialize)]
struct AttemptDetail {
    id: Uuid,
    attempt_number: i32,
    status: String,
    #[serde(rename = "response_status")]
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
    // RBAC: viewer or higher required to view delivery details
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    // Get delivery with endpoint info
    let delivery = sqlx::query_as::<_, (Uuid, Uuid, serde_json::Value, Option<String>, String, i32, i32, Option<chrono::DateTime<chrono::Utc>>, Option<i32>, Option<String>, Option<chrono::DateTime<chrono::Utc>>, chrono::DateTime<chrono::Utc>, Option<serde_json::Value>, Option<chrono::DateTime<chrono::Utc>>, Option<String>)>(
        "SELECT d.id, d.endpoint_id, d.payload, d.event_type, d.status, d.attempt_count, d.max_attempts, d.last_attempt_at, d.response_status, d.response_body, d.next_retry_at, d.created_at, d.request_headers, d.updated_at, d.error_message FROM deliveries d WHERE d.id = $1 AND d.customer_id = $2"
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
    let attempts = sqlx::query_as::<_, (Uuid, i32, Option<i32>, Option<String>, Option<i32>, Option<String>, chrono::DateTime<chrono::Utc>, Option<serde_json::Value>)>(
        "SELECT id, attempt_number, status_code, response_body, duration_ms, error_message, created_at, response_headers FROM delivery_attempts WHERE delivery_id = $1 ORDER BY attempt_number ASC"
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
        request_headers: delivery.12,
        created_at: delivery.11.to_rfc3339(),
        updated_at: delivery.13.map(|t| t.to_rfc3339()),
        last_attempt_at: delivery.7.map(|t| t.to_rfc3339()),
        next_retry_at: delivery.10.map(|t| t.to_rfc3339()),
        response_status: delivery.8,
        response_body: delivery.9,
        error_message: delivery.14,
        attempts: attempts
            .into_iter()
            .map(|(id, num, status, body, dur, err, created, resp_headers)| {
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
                    response_headers: resp_headers,
                    duration_ms: dur,
                    error_message: err,
                    created_at: created.to_rfc3339(),
                }
            })
            .collect(),
        signature_info: SignatureInfo {
            algorithm: "HMAC-SHA256".to_string(),
            header_name: "X-HookSniff-Signature".to_string(),
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
    // RBAC: viewer or higher required to view attempt details
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    // Verify delivery belongs to customer
    let _delivery: (Uuid,) =
        sqlx::query_as("SELECT id FROM deliveries WHERE id = $1 AND customer_id = $2")
            .bind(delivery_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let attempt = sqlx::query_as::<_, (Uuid, i32, Option<i32>, Option<String>, Option<i32>, Option<String>, chrono::DateTime<chrono::Utc>, Option<serde_json::Value>)>(
        "SELECT id, attempt_number, status_code, response_body, duration_ms, error_message, created_at, response_headers FROM delivery_attempts WHERE id = $1 AND delivery_id = $2"
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
        response_headers: attempt.7,
        duration_ms: attempt.4,
        error_message: attempt.5,
        created_at: attempt.6.to_rfc3339(),
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
    fn test_delivery_details_serialize() {
        let dd = DeliveryDetails {
            id: Uuid::new_v4(),
            endpoint_id: Uuid::new_v4(),
            endpoint_url: "https://example.com".to_string(),
            event: Some("order.created".to_string()),
            status: "delivered".to_string(),
            attempt_count: 1,
            max_attempts: 3,
            payload: serde_json::json!({"key": "value"}),
            request_headers: Some(serde_json::json!({"X-Custom": "val"})),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: Some("2024-01-01T00:01:00Z".to_string()),
            last_attempt_at: Some("2024-01-01T00:00:30Z".to_string()),
            next_retry_at: None,
            response_status: Some(200),
            response_body: Some("{\"ok\":true}".to_string()),
            error_message: None,
            attempts: vec![],
            signature_info: SignatureInfo {
                algorithm: "HMAC-SHA256".to_string(),
                header_name: "X-HookSniff-Signature".to_string(),
                format: "v1,<base64(hmac)>".to_string(),
                secret_prefix: "whsec_".to_string(),
            },
        };
        let json = serde_json::to_value(&dd).unwrap();
        assert_eq!(json["endpoint_url"], "https://example.com");
        assert_eq!(json["status"], "delivered");
        assert_eq!(json["attempt_count"], 1);
        assert_eq!(json["max_attempts"], 3);
        assert_eq!(json["request_body"]["key"], "value");
        assert_eq!(json["response_status"], 200);
        assert!(json["next_retry_at"].is_null());
        assert!(json["error_message"].is_null());
    }

    #[test]
    fn test_attempt_detail_serialize() {
        let ad = AttemptDetail {
            id: Uuid::new_v4(),
            attempt_number: 1,
            status: "delivered".to_string(),
            status_code: Some(200),
            response_body: Some("{\"ok\":true}".to_string()),
            request_headers: None,
            response_headers: Some(serde_json::json!({"content-type": "application/json"})),
            duration_ms: Some(150),
            error_message: None,
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&ad).unwrap();
        assert_eq!(json["attempt_number"], 1);
        assert_eq!(json["status"], "delivered");
        assert_eq!(json["response_status"], 200);
        assert_eq!(json["duration_ms"], 150);
        assert!(json["error_message"].is_null());
    }

    #[test]
    fn test_attempt_detail_failed() {
        let ad = AttemptDetail {
            id: Uuid::new_v4(),
            attempt_number: 2,
            status: "failed".to_string(),
            status_code: Some(500),
            response_body: Some("Internal Server Error".to_string()),
            request_headers: None,
            response_headers: None,
            duration_ms: Some(5000),
            error_message: Some("Connection timeout".to_string()),
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };
        let json = serde_json::to_value(&ad).unwrap();
        assert_eq!(json["status"], "failed");
        assert_eq!(json["error_message"], "Connection timeout");
    }

    #[test]
    fn test_signature_info_serialize() {
        let si = SignatureInfo {
            algorithm: "HMAC-SHA256".to_string(),
            header_name: "X-HookSniff-Signature".to_string(),
            format: "v1,<base64(hmac)>".to_string(),
            secret_prefix: "whsec_".to_string(),
        };
        let json = serde_json::to_value(&si).unwrap();
        assert_eq!(json["algorithm"], "HMAC-SHA256");
        assert_eq!(json["header_name"], "X-HookSniff-Signature");
        assert_eq!(json["format"], "v1,<base64(hmac)>");
        assert_eq!(json["secret_prefix"], "whsec_");
    }

    #[test]
    fn test_derived_status_logic() {
        // 200 => delivered
        let code = Some(200i32);
        let status = match code {
            Some(c) if (200..300).contains(&c) => "delivered",
            _ => "failed",
        };
        assert_eq!(status, "delivered");

        // 201 => delivered
        let code = Some(201i32);
        let status = match code {
            Some(c) if (200..300).contains(&c) => "delivered",
            _ => "failed",
        };
        assert_eq!(status, "delivered");

        // 500 => failed
        let code = Some(500i32);
        let status = match code {
            Some(c) if (200..300).contains(&c) => "delivered",
            _ => "failed",
        };
        assert_eq!(status, "failed");

        // None => failed
        let code = None::<i32>;
        let status = match code {
            Some(c) if (200..300).contains(&c) => "delivered",
            _ => "failed",
        };
        assert_eq!(status, "failed");
    }
}
