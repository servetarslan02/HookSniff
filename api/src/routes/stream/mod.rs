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

use axum::routing::{get, post};
use axum::Router;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;


pub mod handlers;
pub use handlers::*;

// Types and re-exports are below; handlers are in handlers.rs

pub fn router() -> Router {
    Router::new()
        .route("/channels", get(list_channels).post(create_channel))
        .route(
            "/channels/{id}",
            get(get_channel).put(update_channel).delete(delete_channel),
        )
        .route("/channels/{id}/subscribe", get(subscribe_to_channel))
        .route("/channels/{id}/messages", get(list_messages))
        .route("/subscriptions", get(list_subscriptions))
        .route("/subscriptions/{id}", get(get_subscription).delete(disconnect_subscription))
        .route("/deliveries", get(sse_deliveries_legacy))
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
