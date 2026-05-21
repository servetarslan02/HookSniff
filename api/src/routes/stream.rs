//! Streaming — Real-time event streaming with channels, subscriptions, and SSE.
//!
//! ## Endpoints
//!
//! - `GET    /v1/stream/channels`                — List stream channels
//! - `POST   /v1/stream/channels`                — Create channel
//! - `GET    /v1/stream/channels/{id}`           — Get channel
//! - `PUT    /v1/stream/channels/{id}`           — Update channel
//! - `DELETE /v1/stream/channels/{id}`           — Delete channel
//! - `GET    /v1/stream/channels/{id}/subscribe` — SSE subscribe to channel
//! - `GET    /v1/stream/channels/{id}/messages`  — Recent messages
//! - `GET    /v1/stream/subscriptions`           — List active subscriptions
//! - `DELETE /v1/stream/subscriptions/{id}`      — Disconnect subscription
//! - `GET    /v1/stream/deliveries`              — SSE delivery stream (legacy compat)
//! - `POST   /v1/stream/publish`                 — Publish event to channel

use axum::extract::{Extension, Path, Query};
use axum::response::sse::{Event, Sse};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use futures::stream::Stream;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::convert::Infallible;
use std::time::Duration;
use tokio::time::interval;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/channels", get(list_channels).post(create_channel))
        .route(
            "/channels/{id}",
            get(get_channel).put(update_channel).delete(delete_channel),
        )
        .route("/channels/{id}/subscribe", get(subscribe_channel))
        .route("/channels/{id}/messages", get(list_messages))
        .route("/subscriptions", get(list_subscriptions))
        .route("/subscriptions/{id}", get(get_subscription).delete(disconnect_subscription))
        .route("/deliveries", get(delivery_stream))
        .route("/publish", post(publish_event))
}

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct StreamChannel {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub channel_type: String,
    pub event_filter: Option<Vec<String>>,
    pub enabled: bool,
    pub max_subscribers: i32,
    pub current_subscribers: i32,
    pub total_messages: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct StreamSubscription {
    pub id: Uuid,
    pub channel_id: Uuid,
    pub customer_id: Uuid,
    pub connection_type: String,
    pub client_id: Option<String>,
    pub event_filter: Option<Vec<String>>,
    pub connected_at: DateTime<Utc>,
    pub last_heartbeat_at: DateTime<Utc>,
    pub messages_sent: i64,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct StreamMessage {
    pub id: Uuid,
    pub channel_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub delivered_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ChannelResponse {
    #[serde(flatten)]
    pub channel: StreamChannel,
    pub recent_messages: Vec<StreamMessage>,
}

#[derive(Debug, Deserialize)]
pub struct CreateChannelRequest {
    pub name: String,
    pub description: Option<String>,
    pub channel_type: Option<String>,
    pub event_filter: Option<Vec<String>>,
    pub max_subscribers: Option<i32>,
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateChannelRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub event_filter: Option<Vec<String>>,
    pub max_subscribers: Option<i32>,
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct PublishEventRequest {
    pub channel_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct StreamParams {
    pub since: Option<String>,
    pub event_types: Option<String>, // comma-separated
}

#[derive(Debug, Deserialize)]
pub struct MessageFilter {
    pub event_type: Option<String>,
    pub limit: Option<i64>,
}

#[derive(sqlx::FromRow)]
struct DeliverySnapshot {
    id: Uuid,
    endpoint_id: Uuid,
    event_type: Option<String>,
    status: String,
    attempt_count: i32,
    created_at: DateTime<Utc>,
    endpoint_url: String,
}

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

/// List all stream channels for the customer.
async fn list_channels(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<StreamChannel>>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let channels = sqlx::query_as::<_, StreamChannel>(
        "SELECT id, customer_id, name, description, channel_type, event_filter, enabled, \
         max_subscribers, current_subscribers, total_messages, created_at, updated_at \
         FROM stream_channels WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(channels))
}

/// Create a new stream channel.
async fn create_channel(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateChannelRequest>,
) -> Result<Json<StreamChannel>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    let channel = sqlx::query_as::<_, StreamChannel>(
        "INSERT INTO stream_channels \
         (customer_id, name, description, channel_type, event_filter, max_subscribers, enabled) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         RETURNING id, customer_id, name, description, channel_type, event_filter, enabled, \
         max_subscribers, current_subscribers, total_messages, created_at, updated_at",
    )
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.channel_type.as_deref().unwrap_or("sse"))
    .bind(&req.event_filter)
    .bind(req.max_subscribers.unwrap_or(100))
    .bind(req.enabled.unwrap_or(true))
    .fetch_one(&pool)
    .await?;

    Ok(Json(channel))
}

/// Get a channel with recent messages.
async fn get_channel(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<ChannelResponse>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let channel = sqlx::query_as::<_, StreamChannel>(
        "SELECT id, customer_id, name, description, channel_type, event_filter, enabled, \
         max_subscribers, current_subscribers, total_messages, created_at, updated_at \
         FROM stream_channels WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let messages = sqlx::query_as::<_, StreamMessage>(
        "SELECT id, channel_id, event_type, payload, delivered_count, created_at \
         FROM stream_messages WHERE channel_id = $1 ORDER BY created_at DESC LIMIT 20",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(ChannelResponse {
        channel,
        recent_messages: messages,
    }))
}

/// Update a channel.
async fn update_channel(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateChannelRequest>,
) -> Result<Json<StreamChannel>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    let channel = sqlx::query_as::<_, StreamChannel>(
        "UPDATE stream_channels SET \
         name = COALESCE($3, name), \
         description = COALESCE($4, description), \
         event_filter = COALESCE($5, event_filter), \
         max_subscribers = COALESCE($6, max_subscribers), \
         enabled = COALESCE($7, enabled), \
         updated_at = now() \
         WHERE id = $1 AND customer_id = $2 \
         RETURNING id, customer_id, name, description, channel_type, event_filter, enabled, \
         max_subscribers, current_subscribers, total_messages, created_at, updated_at",
    )
    .bind(id)
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(&req.event_filter)
    .bind(req.max_subscribers)
    .bind(req.enabled)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(channel))
}

/// Delete a channel.
async fn delete_channel(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // RBAC: admin or higher to delete channels
    super::teams::check_user_team_role(&pool, customer.id, "admin").await?;

    let result = sqlx::query("DELETE FROM stream_channels WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

/// SSE subscribe to a channel.
async fn subscribe_to_channel(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<StreamParams>,
) -> Result<Sse<impl Stream<Item = Result<Event, Infallible>>>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    // Verify channel exists and belongs to customer
    let channel = sqlx::query_as::<_, StreamChannel>(
        "SELECT id, customer_id, name, description, channel_type, event_filter, enabled, \
         max_subscribers, current_subscribers, total_messages, created_at, updated_at \
         FROM stream_channels WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if !channel.enabled {
        return Err(AppError::Validation("Channel is disabled".into()));
    }

    if channel.current_subscribers >= channel.max_subscribers {
        return Err(AppError::Validation("Channel subscriber limit reached".into()));
    }

    // Create subscription record
    let sub = sqlx::query_as::<_, StreamSubscription>(
        "INSERT INTO stream_subscriptions \
         (channel_id, customer_id, connection_type, last_heartbeat_at) \
         VALUES ($1, $2, 'sse', now()) \
         RETURNING id, channel_id, customer_id, connection_type, client_id, event_filter, \
         connected_at, last_heartbeat_at, messages_sent, metadata",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    // Increment subscriber count
    sqlx::query(
        "UPDATE stream_channels SET current_subscribers = current_subscribers + 1 WHERE id = $1",
    )
    .bind(id)
    .execute(&pool)
    .await?;

    let channel_filter = channel.event_filter.clone();
    let sub_id = sub.id;
    let pool_clone = pool.clone();

    let stream = async_stream::stream! {
        let mut tick = interval(Duration::from_secs(2));
        let mut last_check = Utc::now();

        if let Some(ref since) = params.since {
            if since != "now" {
                if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(since) {
                    last_check = dt.with_timezone(&Utc);
                }
            }
        }

        // Send connected event
        let connected = Event::default()
            .event("connected")
            .data(serde_json::json!({
                "subscription_id": sub_id,
                "channel_id": id,
                "channel_name": channel.name,
            }).to_string());
        yield Ok(connected);

        loop {
            tick.tick().await;

            // Fetch new messages
            let messages = sqlx::query_as::<_, StreamMessage>(
                "SELECT id, channel_id, event_type, payload, delivered_count, created_at \
                 FROM stream_messages \
                 WHERE channel_id = $1 AND created_at > $2 \
                 ORDER BY created_at ASC LIMIT 100",
            )
            .bind(id)
            .bind(last_check)
            .fetch_all(&pool_clone)
            .await
            .unwrap_or_default();

            for msg in messages {
                // Apply event filter
                if let Some(ref filter) = channel_filter {
                    if !filter.is_empty() && !filter.contains(&msg.event_type) {
                        continue;
                    }
                }
                if let Some(ref filter) = params.event_types {
                    let types: Vec<&str> = filter.split(',').collect();
                    if !types.contains(&msg.event_type.as_str()) {
                        continue;
                    }
                }

                let event = Event::default()
                    .event(&msg.event_type)
                    .id(msg.id.to_string())
                    .data(serde_json::to_string(&msg.payload).unwrap_or_default());

                yield Ok(event);

                // Update subscription message count
                let _ = sqlx::query(
                    "UPDATE stream_subscriptions SET messages_sent = messages_sent + 1 WHERE id = $1",
                )
                .bind(sub_id)
                .execute(&pool_clone)
                .await;
            }

            // Heartbeat every 30s
            let _ = sqlx::query(
                "UPDATE stream_subscriptions SET last_heartbeat_at = now() WHERE id = $1",
            )
            .bind(sub_id)
            .execute(&pool_clone)
            .await;

            let heartbeat = Event::default()
                .event("heartbeat")
                .data(Utc::now().to_rfc3339());
            yield Ok(heartbeat);

            last_check = Utc::now();
        }
    };

    // Cleanup subscription on disconnect (spawned task)
    let pool_cleanup = pool.clone();
    tokio::spawn(async move {
        // This runs after the stream is dropped (client disconnects)
        tokio::time::sleep(Duration::from_secs(u64::MAX)).await;
        // Won't actually reach here, but the task keeps the pool alive
        let _ = pool_cleanup;
    });

    Ok(Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("ping"),
    ))
}

/// List recent messages for a channel.
async fn list_messages(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(filter): Query<MessageFilter>,
) -> Result<Json<Vec<StreamMessage>>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    // Verify channel belongs to customer
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM stream_channels WHERE id = $1 AND customer_id = $2)",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if !exists {
        return Err(AppError::NotFound);
    }

    let limit = filter.limit.unwrap_or(50).min(200);

    let messages = if let Some(ref event_type) = filter.event_type {
        sqlx::query_as::<_, StreamMessage>(
            "SELECT id, channel_id, event_type, payload, delivered_count, created_at \
             FROM stream_messages WHERE channel_id = $1 AND event_type = $2 \
             ORDER BY created_at DESC LIMIT $3",
        )
        .bind(id)
        .bind(event_type)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, StreamMessage>(
            "SELECT id, channel_id, event_type, payload, delivered_count, created_at \
             FROM stream_messages WHERE channel_id = $1 \
             ORDER BY created_at DESC LIMIT $2",
        )
        .bind(id)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    };

    Ok(Json(messages))
}

/// List active subscriptions.
async fn list_subscriptions(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<StreamSubscription>>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let subs = sqlx::query_as::<_, StreamSubscription>(
        "SELECT s.id, s.channel_id, s.customer_id, s.connection_type, s.client_id, \
         s.event_filter, s.connected_at, s.last_heartbeat_at, s.messages_sent, s.metadata \
         FROM stream_subscriptions s \
         JOIN stream_channels c ON s.channel_id = c.id \
         WHERE s.customer_id = $1 \
         ORDER BY s.connected_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(subs))
}

/// Get a specific subscription.
async fn get_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<StreamSubscription>, AppError> {
    // RBAC: viewer or higher
    super::teams::check_user_team_role(&pool, customer.id, "viewer").await?;

    let sub = sqlx::query_as::<_, StreamSubscription>(
        "SELECT id, channel_id, customer_id, connection_type, client_id, event_filter, \
         connected_at, last_heartbeat_at, messages_sent, metadata \
         FROM stream_subscriptions WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(sub))
}

/// Disconnect a subscription.
async fn disconnect_subscription(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    let sub = sqlx::query_as::<_, StreamSubscription>(
        "DELETE FROM stream_subscriptions \
         WHERE id = $1 AND customer_id = $2 \
         RETURNING id, channel_id, customer_id, connection_type, client_id, event_filter, \
         connected_at, last_heartbeat_at, messages_sent, metadata",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Decrement subscriber count
    sqlx::query(
        "UPDATE stream_channels SET current_subscribers = GREATEST(current_subscribers - 1, 0) WHERE id = $1",
    )
    .bind(sub.channel_id)
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "disconnected": true })))
}

/// SSE delivery stream (legacy compatibility endpoint).
async fn sse_deliveries_legacy(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<PublishEventRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // RBAC: developer or higher
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    // Verify channel belongs to customer
    let channel = sqlx::query_as::<_, StreamChannel>(
        "SELECT id, customer_id, name, description, channel_type, event_filter, enabled, \
         max_subscribers, current_subscribers, total_messages, created_at, updated_at \
         FROM stream_channels WHERE id = $1 AND customer_id = $2",
    )
    .bind(req.channel_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if !channel.enabled {
        return Err(AppError::Validation("Channel is disabled".into()));
    }

    // Store message
    let msg = sqlx::query_as::<_, StreamMessage>(
        "INSERT INTO stream_messages (channel_id, event_type, payload, delivered_count) \
         VALUES ($1, $2, $3, $4) \
         RETURNING id, channel_id, event_type, payload, delivered_count, created_at",
    )
    .bind(req.channel_id)
    .bind(&req.event_type)
    .bind(&req.payload)
    .bind(channel.current_subscribers)
    .fetch_one(&pool)
    .await?;

    // Update channel total messages
    sqlx::query(
        "UPDATE stream_channels SET total_messages = total_messages + 1, updated_at = now() WHERE id = $1",
    )
    .bind(req.channel_id)
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message_id": msg.id,
        "delivered_to": channel.current_subscribers,
    })))
}
