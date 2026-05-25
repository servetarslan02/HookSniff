//! Delivery listing, single get, and export handlers.

use axum::body::Body;
use axum::extract::{Extension, Path, Query};
use axum::http::{header, StatusCode};
use axum::response::Response;
use axum::Json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::delivery::{
    Delivery, DeliveryAttempt, DeliveryAttemptResponse, DeliveryListResponse, DeliveryListRow,
    DeliveryResponse, ExportDelivery,
};

use super::helpers::{escape_csv_cell, parse_date_from_str, parse_date_to_str};
use super::{ExportParams, ListParams};

pub async fn list_deliveries(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Query(params): Query<ListParams>,
) -> Result<Json<DeliveryListResponse>, AppError> {
    // ── Role enforcement: analyst can view deliveries ──
    if let Some(Extension(ref scope)) = service_token {
        crate::routes::teams::require_team_analyst(&pool, scope.team_id, customer.id).await?;
    }

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(200);
    let offset = (page - 1) * per_page;

    // Performance: select only columns needed for list view (skip payload + response_body)
    const LIST_COLUMNS: &str = "id, endpoint_id, customer_id, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test";

    // Team filter: use subquery with bind parameter for safety
    let team_id_filter: Option<Uuid> = service_token.as_ref().map(|s| s.team_id);

    let (deliveries, total) = if let Some(status) = &params.status {
        let (query, total_query) = if let Some(_tid) = team_id_filter {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 AND status = $2 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $3) ORDER BY created_at DESC LIMIT $4 OFFSET $5", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = $2 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $3)".to_string(),
            )
        } else {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = $2".to_string(),
            )
        };

        let mut q = sqlx::query_as::<_, DeliveryListRow>(&query)
            .bind(customer.id)
            .bind(status);
        let mut tq = sqlx::query_as(&total_query)
            .bind(customer.id)
            .bind(status);

        if let Some(_tid) = team_id_filter {
            q = q.bind(_tid);
            tq = tq.bind(_tid);
        }

        let deliveries = q.bind(per_page).bind(offset).fetch_all(&pool).await?;
        let total: (i64,) = tq.fetch_one(&pool).await?;
        (deliveries, total.0)
    } else {
        let (query, total_query) = if let Some(_tid) = team_id_filter {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND endpoint_id IN (SELECT id FROM endpoints WHERE team_id = $2)".to_string(),
            )
        } else {
            (
                format!("SELECT {} FROM deliveries WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", LIST_COLUMNS),
                "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1".to_string(),
            )
        };

        let mut q = sqlx::query_as::<_, DeliveryListRow>(&query)
            .bind(customer.id);
        let mut tq = sqlx::query_as(&total_query)
            .bind(customer.id);

        if let Some(_tid) = team_id_filter {
            q = q.bind(_tid);
            tq = tq.bind(_tid);
        }

        let deliveries = q.bind(per_page).bind(offset).fetch_all(&pool).await?;
        let total: (i64,) = tq.fetch_one(&pool).await?;
        (deliveries, total.0)
    };

    Ok(Json(DeliveryListResponse {
        deliveries: deliveries.into_iter().map(|d| d.to_response()).collect(),
        total,
        page,
        per_page,
    }))
}

pub async fn get_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeliveryResponse>, AppError> {
    let delivery = sqlx::query_as::<_, Delivery>(
        "SELECT id, endpoint_id, customer_id, payload, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, response_body, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test, event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(delivery.to_response()))
}

pub async fn get_delivery_attempts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<DeliveryAttemptResponse>>, AppError> {
    let _delivery = sqlx::query_as::<_, Delivery>(
        "SELECT id, endpoint_id, customer_id, payload, event_type, status, attempt_count, max_attempts, last_attempt_at, response_status, response_body, next_retry_at, replay_count, created_at, sequence_num, fifo_group_id, updated_at, error_message, is_test, event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let attempts = sqlx::query_as::<_, DeliveryAttempt>(
        "SELECT id, delivery_id, attempt_number, status_code, response_body, duration_ms, error_message, created_at, trace_id, response_headers FROM delivery_attempts WHERE delivery_id = $1 ORDER BY attempt_number ASC LIMIT 100",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(attempts.iter().map(|a| a.to_response()).collect()))
}

pub async fn export_deliveries(
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
            let mut csv = String::from(
                "id,event,endpoint_url,status,attempt_count,response_status,created_at\n",
            );
            for d in &filtered {
                csv.push_str(&format!(
                    "{},{},{},{},{},{},{}\n",
                    escape_csv_cell(&d.id.to_string()),
                    escape_csv_cell(d.event.as_deref().unwrap_or("")),
                    escape_csv_cell(&d.endpoint_url),
                    escape_csv_cell(&d.status),
                    escape_csv_cell(&d.attempt_count.to_string()),
                    escape_csv_cell(&d.response_status.map(|s| s.to_string()).unwrap_or_default()),
                    escape_csv_cell(&d.created_at.to_rfc3339())
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
                .map_err(|e| AppError::Internal(e.into()))?)
        }
        _ => {
            let body =
                serde_json::to_string(&filtered).map_err(|e| AppError::Internal(e.into()))?;

            Ok(Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(body))
                .map_err(|e| AppError::Internal(e.into()))?)
        }
    }
}
