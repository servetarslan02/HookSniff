//! Message Poller — Cursor-based message polling.
//!
//! Allows consumers to poll for new messages using a cursor.
//! Each consumer tracks their position via `message_cursors` table.
//!
//! ## Endpoints
//!
//! - `GET  /v1/message-poller/poll`   — Fetch new messages since cursor
//! - `POST /v1/message-poller/seek`   — Set cursor to a specific message
//! - `POST /v1/message-poller/commit` — Acknowledge messages processed (advance cursor)

use axum::extract::{Extension, Query};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/poll", get(poll_messages))
        .route("/seek", post(seek_cursor))
        .route("/commit", post(commit_cursor))
}

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct PollParams {
    consumer_id: String,
    #[serde(default)]
    limit: Option<i64>,
    #[serde(default)]
    endpoint_id: Option<Uuid>,
    #[serde(default)]
    event_type: Option<String>,
    #[serde(default = "default_include_payload")]
    include_payload: bool,
}

fn default_include_payload() -> bool {
    true
}

#[derive(Debug, Deserialize)]
struct SeekRequest {
    consumer_id: String,
    message_id: Uuid,
    #[serde(default)]
    endpoint_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
struct CommitRequest {
    consumer_id: String,
    message_id: Uuid,
    #[serde(default)]
    endpoint_id: Option<Uuid>,
}

#[derive(Debug, Serialize)]
struct PolledMessage {
    id: Uuid,
    endpoint_id: Uuid,
    event_type: Option<String>,
    status: String,
    attempt_count: i32,
    response_status: Option<i32>,
    created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    payload: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct PollResponse {
    messages: Vec<PolledMessage>,
    cursor: CursorInfo,
    done: bool,
}

#[derive(Debug, Serialize)]
struct CursorInfo {
    consumer_id: String,
    last_message_id: Option<Uuid>,
    last_sequence_num: i64,
}

#[derive(Debug, Serialize)]
struct SeekResponse {
    cursor: CursorInfo,
}

#[derive(Debug, Serialize)]
struct CommitResponse {
    cursor: CursorInfo,
    committed: bool,
}

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

/// Poll for new messages since the consumer's cursor.
///
/// Returns messages with `created_at > cursor position`, ordered by creation time.
/// If no cursor exists, starts from the beginning.
async fn poll_messages(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<PollParams>,
) -> Result<Json<PollResponse>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let limit = params.limit.unwrap_or(50).min(200);

    // Get or create cursor
    let cursor = get_or_create_cursor(&pool, customer.id, &params.consumer_id, params.endpoint_id).await?;

    // Build query for messages after cursor
    let mut conditions = vec![
        "d.customer_id = $1".to_string(),
        "d.created_at > (SELECT updated_at FROM message_cursors WHERE customer_id = $1 AND consumer_id = $2)".to_string(),
    ];
    let mut bind_idx: i32 = 3;

    if params.endpoint_id.is_some() {
        conditions.push(format!("d.endpoint_id = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.event_type.is_some() {
        conditions.push(format!("d.event_type = ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = conditions.join(" AND ");

    let payload_col = if params.include_payload {
        "d.payload,"
    } else {
        ""
    };

    let query = format!(
        "SELECT d.id, d.endpoint_id, d.event_type, d.status, d.attempt_count, \
         d.response_status, d.created_at, {} \
         d.customer_id \
         FROM deliveries d \
         WHERE {} \
         ORDER BY d.created_at ASC \
         LIMIT ${}",
        payload_col, where_clause, bind_idx
    );

    // Execute with dynamic binding
    let mut q = sqlx::query_as::<_, DeliveryRow>(&query)
        .bind(customer.id)
        .bind(&params.consumer_id);

    if let Some(ep_id) = params.endpoint_id {
        q = q.bind(ep_id);
    }
    if let Some(ref et) = params.event_type {
        q = q.bind(et);
    }
    q = q.bind(limit);

    let rows: Vec<DeliveryRow> = q.fetch_all(&pool).await?;

    let done = rows.len() < limit as usize;

    let messages: Vec<PolledMessage> = rows
        .iter()
        .map(|r| PolledMessage {
            id: r.id,
            endpoint_id: r.endpoint_id,
            event_type: r.event_type.clone(),
            status: r.status.clone(),
            attempt_count: r.attempt_count,
            response_status: r.response_status,
            created_at: r.created_at,
            payload: if params.include_payload {
                r.payload.clone()
            } else {
                None
            },
        })
        .collect();

    let _last_msg = messages.last().map(|m| m.id);

    Ok(Json(PollResponse {
        messages,
        cursor: CursorInfo {
            consumer_id: params.consumer_id,
            last_message_id: cursor.last_message_id,
            last_sequence_num: cursor.last_sequence_num,
        },
        done,
    }))
}

/// Seek cursor to a specific message.
///
/// Sets the consumer's cursor to the given message ID.
/// Useful for replaying from a specific point.
async fn seek_cursor(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<SeekRequest>,
) -> Result<Json<SeekResponse>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    // Verify the message exists and belongs to this customer
    let msg_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM deliveries WHERE id = $1 AND customer_id = $2)",
    )
    .bind(req.message_id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if !msg_exists {
        return Err(AppError::NotFound);
    }

    // Get the sequence number for this message
    let seq: i64 = sqlx::query_scalar(
        "SELECT COALESCE(sequence_num, 0) FROM deliveries WHERE id = $1",
    )
    .bind(req.message_id)
    .fetch_one(&pool)
    .await
    .unwrap_or(0);

    // Upsert cursor
    let cursor = sqlx::query_as::<_, CursorRow>(
        "INSERT INTO message_cursors (customer_id, consumer_id, endpoint_id, last_message_id, last_sequence_num, updated_at) \
         VALUES ($1, $2, $3, $4, $5, now()) \
         ON CONFLICT (customer_id, consumer_id) \
         DO UPDATE SET last_message_id = $4, last_sequence_num = $5, endpoint_id = COALESCE($3, message_cursors.endpoint_id), updated_at = now() \
         RETURNING id, customer_id, consumer_id, endpoint_id, last_message_id, last_sequence_num, created_at, updated_at",
    )
    .bind(customer.id)
    .bind(&req.consumer_id)
    .bind(req.endpoint_id)
    .bind(req.message_id)
    .bind(seq)
    .fetch_one(&pool)
    .await?;

    Ok(Json(SeekResponse {
        cursor: CursorInfo {
            consumer_id: cursor.consumer_id,
            last_message_id: cursor.last_message_id,
            last_sequence_num: cursor.last_sequence_num,
        },
    }))
}

/// Commit cursor — advance past a processed message.
///
/// Moves the cursor forward to the given message ID, indicating that
/// all messages up to and including this one have been processed.
async fn commit_cursor(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CommitRequest>,
) -> Result<Json<CommitResponse>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    // Get the sequence number for this message
    let seq: i64 = sqlx::query_scalar(
        "SELECT COALESCE(sequence_num, 0) FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(req.message_id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await
    .map_err(|_| AppError::NotFound)?;

    // Update cursor (only advance, never go back)
    let cursor = sqlx::query_as::<_, CursorRow>(
        "INSERT INTO message_cursors (customer_id, consumer_id, endpoint_id, last_message_id, last_sequence_num, updated_at) \
         VALUES ($1, $2, $3, $4, $5, now()) \
         ON CONFLICT (customer_id, consumer_id) \
         DO UPDATE SET \
           last_message_id = CASE \
             WHEN $5 > message_cursors.last_sequence_num THEN $4 \
             ELSE message_cursors.last_message_id \
           END, \
           last_sequence_num = GREATEST(message_cursors.last_sequence_num, $5), \
           endpoint_id = COALESCE($3, message_cursors.endpoint_id), \
           updated_at = now() \
         RETURNING id, customer_id, consumer_id, endpoint_id, last_message_id, last_sequence_num, created_at, updated_at",
    )
    .bind(customer.id)
    .bind(&req.consumer_id)
    .bind(req.endpoint_id)
    .bind(req.message_id)
    .bind(seq)
    .fetch_one(&pool)
    .await?;

    Ok(Json(CommitResponse {
        cursor: CursorInfo {
            consumer_id: cursor.consumer_id,
            last_message_id: cursor.last_message_id,
            last_sequence_num: cursor.last_sequence_num,
        },
        committed: true,
    }))
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/// Get or create a cursor for a consumer.
async fn get_or_create_cursor(
    pool: &PgPool,
    customer_id: Uuid,
    consumer_id: &str,
    endpoint_id: Option<Uuid>,
) -> Result<CursorRow, AppError> {
    let cursor = sqlx::query_as::<_, CursorRow>(
        "INSERT INTO message_cursors (customer_id, consumer_id, endpoint_id) \
         VALUES ($1, $2, $3) \
         ON CONFLICT (customer_id, consumer_id) DO NOTHING \
         RETURNING id, customer_id, consumer_id, endpoint_id, last_message_id, last_sequence_num, created_at, updated_at",
    )
    .bind(customer_id)
    .bind(consumer_id)
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    match cursor {
        Some(c) => Ok(c),
        None => {
            // Cursor already exists, fetch it
            let c = sqlx::query_as::<_, CursorRow>(
                "SELECT id, customer_id, consumer_id, endpoint_id, last_message_id, last_sequence_num, created_at, updated_at \
                 FROM message_cursors WHERE customer_id = $1 AND consumer_id = $2",
            )
            .bind(customer_id)
            .bind(consumer_id)
            .fetch_one(pool)
            .await?;
            Ok(c)
        }
    }
}

// ──────────────────────────────────────────────────────────────
// DB row types
// ──────────────────────────────────────────────────────────────

#[derive(Debug, sqlx::FromRow)]
struct CursorRow {
    #[allow(dead_code)]
    id: Uuid,
    #[allow(dead_code)]
    customer_id: Uuid,
    consumer_id: String,
    #[allow(dead_code)]
    endpoint_id: Option<Uuid>,
    last_message_id: Option<Uuid>,
    last_sequence_num: i64,
    #[allow(dead_code)]
    created_at: DateTime<Utc>,
    #[allow(dead_code)]
    updated_at: DateTime<Utc>,
}

#[derive(Debug, sqlx::FromRow)]
struct DeliveryRow {
    id: Uuid,
    endpoint_id: Uuid,
    event_type: Option<String>,
    status: String,
    attempt_count: i32,
    response_status: Option<i32>,
    created_at: DateTime<Utc>,
    #[sqlx(default)]
    payload: Option<serde_json::Value>,
    #[allow(dead_code)]
    customer_id: Uuid,
}
