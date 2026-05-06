use axum::body::Body;
use axum::extract::{Extension, Path, Query};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::error::AppError;
use crate::kafka;
use crate::middleware::idempotency;
use crate::models::customer::Customer;
use crate::models::delivery::{
    BatchError, BatchResponse, BatchWebhookRequest, CreateWebhookRequest, Delivery, DeliveryAttempt,
    DeliveryListResponse, DeliveryResponse, ExportDelivery,
};
use crate::models::endpoint::{Endpoint, RetryPolicy};
use crate::validation;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_deliveries).post(create_webhook))
        .route("/batch", post(batch_webhooks))
        .route("/export", get(export_deliveries))
        .route("/{id}", get(get_delivery))
        .route("/{id}/replay", post(replay_webhook))
        .route("/{id}/attempts", get(get_delivery_attempts))
}

#[derive(Debug, Deserialize)]
struct ListParams {
    page: Option<i64>,
    per_page: Option<i64>,
    status: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ExportParams {
    format: Option<String>,
    status: Option<String>,
    date_from: Option<String>,
    date_to: Option<String>,
}

async fn list_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ListParams>,
) -> Result<Json<DeliveryListResponse>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let (deliveries, total) = if let Some(status) = &params.status {
        let deliveries = sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        )
        .bind(customer.id)
        .bind(status)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = $2",
        )
        .bind(customer.id)
        .bind(status)
        .fetch_one(&pool)
        .await?;

        (deliveries, total.0)
    } else {
        let deliveries = sqlx::query_as::<_, Delivery>(
            "SELECT * FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        )
        .bind(customer.id)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
                .bind(customer.id)
                .fetch_one(&pool)
                .await?;

        (deliveries, total.0)
    };

    Ok(Json(DeliveryListResponse {
        deliveries: deliveries.into_iter().map(|d| d.to_response()).collect(),
        total,
        page,
        per_page,
    }))
}

async fn create_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    headers: axum::http::header::HeaderMap,
    Json(req): Json<CreateWebhookRequest>,
) -> Result<Json<DeliveryResponse>, AppError> {
    // Check idempotency key
    let idempotency_key = headers
        .get("Idempotency-Key")
        .and_then(|v| v.to_str().ok());

    if let Some(key) = idempotency_key {
        if let Some(cached) = idempotency::check_idempotency(&pool, key, customer.id).await {
            tracing::info!("♻️ Returning cached response for idempotency key: {}", key);
            return Ok(Json(serde_json::from_value(cached.response_body).unwrap_or_else(|_| {
                DeliveryResponse {
                    id: Uuid::nil(),
                    endpoint_id: Uuid::nil(),
                    event: None,
                    status: "cached".to_string(),
                    attempt_count: 0,
                    response_status: Some(cached.status_code),
                    replay_count: Some(0),
                    created_at: cached.created_at,
                }
            })));
        }
    }

    // Validate event_type if provided
    if let Some(ref event) = req.event {
        validation::validate_event_type(event).map_err(AppError::BadRequest)?;
    }

    // Validate JSON payload depth
    validation::validate_json_depth(&req.data).map_err(AppError::BadRequest)?;

    // Check payload size
    let payload_size = serde_json::to_string(&req.data)
        .map(|s| s.len())
        .unwrap_or(0);
    if payload_size > cfg.max_webhook_payload_bytes {
        return Err(AppError::PayloadTooLarge);
    }

    // Check rate limit
    if customer.webhook_count >= customer.webhook_limit {
        return Err(AppError::RateLimitExceeded);
    }

    // Verify endpoint exists and belongs to customer
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(req.endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check event filter
    if let Some(ref event) = req.event {
        if !endpoint.matches_event_filter(event) {
            tracing::info!(
                "⏭️ Event '{}' does not match filter for endpoint {}, skipping",
                event,
                endpoint.id
            );
            let response = serde_json::json!({
                "id": Uuid::nil(),
                "endpoint_id": endpoint.id,
                "event": event,
                "status": "filtered",
                "attempt_count": 0,
                "response_status": null,
                "replay_count": 0,
                "created_at": Utc::now().to_rfc3339(),
            });
            return Ok(Json(serde_json::from_value(response).unwrap_or_else(|_| {
                DeliveryResponse {
                    id: Uuid::nil(),
                    endpoint_id: endpoint.id,
                    event: Some(event.clone()),
                    status: "filtered".to_string(),
                    attempt_count: 0,
                    response_status: None,
                    replay_count: Some(0),
                    created_at: Utc::now(),
                }
            })));
        }
    }

    let payload = serde_json::json!({
        "event": req.event,
        "data": req.data,
        "timestamp": Utc::now().to_rfc3339(),
    });

    let payload_str =
        serde_json::to_string(&payload).map_err(|e| AppError::Internal(e.into()))?;

    // Get retry policy from endpoint, or use defaults
    let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

    let delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *",
    )
    .bind(endpoint.id)
    .bind(customer.id)
    .bind(&payload)
    .bind(&req.event)
    .bind(retry_policy.max_attempts)
    .fetch_one(&pool)
    .await?;

    sqlx::query("UPDATE customers SET webhook_count = webhook_count + 1 WHERE id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    kafka::publish_to_queue(
        &pool,
        delivery.id,
        endpoint.id,
        &endpoint.url,
        &endpoint.signing_secret,
        &payload_str,
        endpoint.custom_headers.as_ref(),
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to publish to queue: {:?}", e);
        AppError::Internal(e)
    })?;

    // Store idempotency key if provided
    if let Some(key) = idempotency_key {
        let response_body = serde_json::to_value(&delivery.to_response())
            .unwrap_or(serde_json::Value::Null);
        if let Err(e) =
            idempotency::store_idempotency(&pool, key, customer.id, response_body, 200).await
        {
            tracing::warn!("Failed to store idempotency key: {:?}", e);
        }
    }

    Ok(Json(delivery.to_response()))
}

async fn batch_webhooks(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    Json(req): Json<BatchWebhookRequest>,
) -> Result<Json<BatchResponse>, AppError> {
    if req.webhooks.len() > 100 {
        return Err(AppError::BadRequest("Batch size cannot exceed 100".into()));
    }

    if customer.webhook_count >= customer.webhook_limit {
        return Err(AppError::RateLimitExceeded);
    }

    let mut deliveries = Vec::new();
    let mut errors = Vec::new();

    for (i, webhook_req) in req.webhooks.iter().enumerate() {
        let payload_size = serde_json::to_string(&webhook_req.data).map(|s| s.len()).unwrap_or(0);
        if payload_size > cfg.max_webhook_payload_bytes {
            errors.push(BatchError { index: i, error: "Payload too large".to_string() });
            continue;
        }

        let endpoint = match sqlx::query_as::<_, Endpoint>(
            "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
        )
        .bind(webhook_req.endpoint_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await
        {
            Ok(Some(ep)) => ep,
            Ok(None) => {
                errors.push(BatchError { index: i, error: "Endpoint not found or inactive".to_string() });
                continue;
            }
            Err(e) => {
                errors.push(BatchError { index: i, error: format!("Database error: {}", e) });
                continue;
            }
        };

        // Check event filter
        if let Some(ref event) = webhook_req.event {
            if !endpoint.matches_event_filter(event) {
                continue; // Silently skip filtered events in batch
            }
        }

        let payload = serde_json::json!({
            "event": webhook_req.event,
            "data": webhook_req.data,
            "timestamp": Utc::now().to_rfc3339(),
        });

        let payload_str = match serde_json::to_string(&payload) {
            Ok(s) => s,
            Err(e) => {
                errors.push(BatchError { index: i, error: format!("Serialization error: {}", e) });
                continue;
            }
        };

        let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

        match sqlx::query_as::<_, Delivery>(
            "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *",
        )
        .bind(endpoint.id)
        .bind(customer.id)
        .bind(&payload)
        .bind(&webhook_req.event)
        .bind(retry_policy.max_attempts)
        .fetch_one(&pool)
        .await
        {
            Ok(delivery) => {
                let webhook_message = serde_json::json!({
                    "delivery_id": delivery.id,
                    "endpoint_id": endpoint.id,
                    "endpoint_url": endpoint.url,
                    "signing_secret": endpoint.signing_secret,
                    "old_signing_secret": endpoint.old_signing_secret,
                    "secret_rotated_at": endpoint.secret_rotated_at.map(|t| t.to_rfc3339()),
                    "custom_headers": endpoint.custom_headers,
                    "payload": payload_str,
                });

                if let Err(e) = kafka::publish_to_queue(
                    &pool,
                    delivery.id,
                    endpoint.id,
                    &endpoint.url,
                    &endpoint.signing_secret,
                    &payload_str,
                    endpoint.custom_headers.as_ref(),
                )
                .await
                {
                    tracing::error!("Failed to publish to queue for batch item {}: {:?}", i, e);
                    errors.push(BatchError { index: i, error: "Failed to publish message".to_string() });
                    continue;
                }

                deliveries.push(delivery.to_response());
            }
            Err(e) => {
                errors.push(BatchError { index: i, error: format!("Failed to create delivery: {}", e) });
            }
        }
    }

    let success_count = deliveries.len() as i32;
    if success_count > 0 {
        let _ = sqlx::query("UPDATE customers SET webhook_count = webhook_count + $1 WHERE id = $2")
            .bind(success_count)
            .bind(customer.id)
            .execute(&pool)
            .await;
    }

    Ok(Json(BatchResponse { deliveries, errors }))
}

async fn replay_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(cfg): Extension<Config>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let original = sqlx::query_as::<_, Delivery>(
        "SELECT * FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2 AND is_active = true",
    )
    .bind(original.endpoint_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::BadRequest("Endpoint no longer active".into()))?;

    let retry_policy = RetryPolicy::from_value(endpoint.retry_policy.as_ref());

    let payload_str = serde_json::to_string(&original.payload)
        .map_err(|e| AppError::Internal(e.into()))?;

    let new_delivery = sqlx::query_as::<_, Delivery>(
        "INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count) VALUES ($1, $2, $3, $4, 'pending', $5, 1) RETURNING *",
    )
    .bind(original.endpoint_id)
    .bind(customer.id)
    .bind(&original.payload)
    .bind(&original.event_type)
    .bind(retry_policy.max_attempts)
    .fetch_one(&pool)
    .await?;

    sqlx::query("UPDATE customers SET webhook_count = webhook_count + 1 WHERE id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    let webhook_message = serde_json::json!({
        "delivery_id": new_delivery.id,
        "endpoint_id": endpoint.id,
        "endpoint_url": endpoint.url,
        "signing_secret": endpoint.signing_secret,
        "old_signing_secret": endpoint.old_signing_secret,
        "secret_rotated_at": endpoint.secret_rotated_at.map(|t| t.to_rfc3339()),
        "custom_headers": endpoint.custom_headers,
        "payload": payload_str,
    });

    kafka::publish_to_queue(
        &pool,
        new_delivery.id,
        endpoint.id,
        &endpoint.url,
        &endpoint.signing_secret,
        &payload_str,
        endpoint.custom_headers.as_ref(),
    )
    .await
    .map_err(|e| {
        tracing::error!("Failed to publish replay to queue: {:?}", e);
        AppError::Internal(e)
    })?;

    Ok(Json(new_delivery.to_response()))
}

fn parse_date_from_str(s: &str) -> Option<DateTime<Utc>> {
    if let Ok(dt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc))
    } else if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(
            d.and_hms_opt(0, 0, 0)?,
            Utc,
        ))
    } else {
        None
    }
}

fn parse_date_to_str(s: &str) -> Option<DateTime<Utc>> {
    if let Ok(dt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(dt, Utc))
    } else if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        Some(DateTime::<Utc>::from_naive_utc_and_offset(
            d.and_hms_opt(23, 59, 59)?,
            Utc,
        ))
    } else {
        None
    }
}

async fn export_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<ExportParams>,
) -> Result<Response, AppError> {
    let format = params.format.unwrap_or_else(|| "json".to_string());

    let deliveries: Vec<ExportDelivery> = sqlx::query_as::<_, ExportDelivery>(
        "SELECT d.id, d.event_type as event, e.url as endpoint_url, d.status, d.attempt_count, d.response_status, d.created_at \
         FROM deliveries d JOIN endpoints e ON d.endpoint_id = e.id WHERE d.customer_id = $1 ORDER BY d.created_at DESC LIMIT 10000",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let filtered: Vec<ExportDelivery> = deliveries
        .into_iter()
        .filter(|d| {
            if let Some(ref status) = params.status {
                if d.status != *status {
                    return false;
                }
            }
            if let Some(ref from) = params.date_from {
                if let Some(from_dt) = parse_date_from_str(from) {
                    if d.created_at < from_dt {
                        return false;
                    }
                }
            }
            if let Some(ref to) = params.date_to {
                if let Some(to_dt) = parse_date_to_str(to) {
                    if d.created_at > to_dt {
                        return false;
                    }
                }
            }
            true
        })
        .collect();

    match format.as_str() {
        "csv" => {
            let mut csv = String::from("id,event,endpoint_url,status,attempt_count,response_status,created_at\n");
            for d in &filtered {
                csv.push_str(&format!(
                    "{},{},{},{},{},{},{}\n",
                    d.id,
                    d.event.as_deref().unwrap_or(""),
                    d.endpoint_url,
                    d.status,
                    d.attempt_count,
                    d.response_status.map(|s| s.to_string()).unwrap_or_default(),
                    d.created_at.to_rfc3339()
                ));
            }

            Ok(Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "text/csv")
                .header(
                    header::CONTENT_DISPOSITION,
                    "attachment; filename=\"webhook_logs.csv\"",
                )
                .body(Body::from(csv))
                .unwrap())
        }
        _ => {
            let body =
                serde_json::to_string(&filtered).map_err(|e| AppError::Internal(e.into()))?;

            Ok(Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(body))
                .unwrap())
        }
    }
}

async fn get_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let delivery = sqlx::query_as::<_, Delivery>(
        "SELECT * FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(delivery.to_response()))
}

async fn get_delivery_attempts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<DeliveryAttempt>>, AppError> {
    let _delivery = sqlx::query_as::<_, Delivery>(
        "SELECT * FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let attempts = sqlx::query_as::<_, DeliveryAttempt>(
        "SELECT * FROM delivery_attempts WHERE delivery_id = $1 ORDER BY attempt_number ASC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(attempts))
}
