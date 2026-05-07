//! Real-time delivery stream via Server-Sent Events (SSE).
//!
//! Dashboard'da canlı olay akışı için kullanılır.
//! GET /v1/stream/deliveries — SSE stream

use axum::extract::{Extension, Query};
use axum::response::sse::{Event, Sse};
use axum::routing::get;
use axum::Router;
use futures::stream::Stream;
use serde::Deserialize;
use sqlx::PgPool;
use std::convert::Infallible;
use std::time::Duration;
use tokio::time::interval;
use uuid::Uuid;

use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/deliveries", get(delivery_stream))
}

#[derive(Deserialize)]
pub struct StreamParams {
    pub since: Option<String>, // ISO timestamp or "now"
}

/// SSE stream for real-time delivery updates.
/// Polls the database every 2 seconds for new deliveries.
pub async fn delivery_stream(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<StreamParams>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let customer_id = customer.id;
    let since = params.since.unwrap_or_else(|| "now".to_string());

    let stream = async_stream::stream! {
        let mut tick = interval(Duration::from_secs(2));
        let mut last_check = chrono::Utc::now();

        // If "since" is a timestamp, use it
        if since != "now" {
            if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&since) {
                last_check = dt.with_timezone(&chrono::Utc);
            }
        }

        loop {
            tick.tick().await;

            // Query new deliveries since last check
            let deliveries = sqlx::query_as::<_, DeliverySnapshot>(
                r#"SELECT d.id, d.endpoint_id, d.event_type, d.status, d.attempt_count,
                          d.created_at, e.url as endpoint_url
                   FROM deliveries d
                   JOIN endpoints e ON d.endpoint_id = e.id
                   WHERE d.customer_id = $1 AND d.created_at > $2
                   ORDER BY d.created_at DESC
                   LIMIT 50"#,
            )
            .bind(customer_id)
            .bind(last_check)
            .fetch_all(&pool)
            .await
            .unwrap_or_default();

            for d in deliveries {
                let data = serde_json::json!({
                    "id": d.id,
                    "endpoint_id": d.endpoint_id,
                    "event": d.event_type,
                    "status": d.status,
                    "attempts": d.attempt_count,
                    "endpoint_url": d.endpoint_url,
                    "created_at": d.created_at.to_rfc3339(),
                });

                let event = Event::default()
                    .event("delivery")
                    .data(serde_json::to_string(&data).unwrap_or_default());

                yield Ok(event);
            }

            // Send heartbeat every 30 seconds
            last_check = chrono::Utc::now();

            let heartbeat = Event::default()
                .event("heartbeat")
                .data(chrono::Utc::now().to_rfc3339());
            yield Ok(heartbeat);
        }
    };

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("ping"),
    )
}

#[derive(sqlx::FromRow)]
struct DeliverySnapshot {
    id: Uuid,
    endpoint_id: Uuid,
    event_type: Option<String>,
    status: String,
    attempt_count: i32,
    created_at: chrono::DateTime<chrono::Utc>,
    endpoint_url: String,
}
