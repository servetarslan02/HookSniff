//! Event-driven SSE delivery stream.
//!
//! Subscribes to EventPublisher's broadcast channel and streams
//! delivery events to dashboard clients in real-time (< 100ms).
//!
//! Replaces the legacy polling-based SSE handler.

use axum::{
    extract::Extension,
    response::sse::{Event, Sse},
};
use chrono::Utc;
use futures::stream::Stream;
use std::convert::Infallible;
use std::sync::Arc;
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::error::AppError;
use crate::events::{AppEvent, EventEnvelope, EventPublisher};
use crate::models::customer::Customer;
use crate::ws::WsGateway;

/// SSE delivery stream — event-driven (no polling).
///
/// GET /v1/stream/deliveries
///
/// Streams delivery events in real-time by subscribing to the
/// EventPublisher's broadcast channel. Events are filtered by
/// customer_id so each client only sees their own deliveries.
///
/// Keep-alive: 15s ping to prevent proxy timeouts.
/// Reconnect: Client gets `connected` event with server_time on connect.
pub async fn delivery_event_stream(
    Extension(customer): Extension<Customer>,
    Extension(publisher): Extension<Option<EventPublisher>>,
    Extension(gateway): Extension<Arc<WsGateway>>,
) -> Result<Sse<impl Stream<Item = Result<Event, Infallible>>>, AppError> {
    let publisher = match publisher {
        Some(p) => p,
        None => {
            // EventPublisher not configured — return empty stream
            tracing::warn!("SSE delivery stream requested but EventPublisher not configured");
            let stream = async_stream::stream! {
                yield Ok(Event::default()
                    .event("error")
                    .data("Event system not configured"));
            };
            return Ok(Sse::new(stream).keep_alive(
                axum::response::sse::KeepAlive::new()
                    .interval(std::time::Duration::from_secs(15))
                    .text("ping"),
            ));
        }
    };

    let customer_id = customer.id;
    let mut rx = publisher.subscribe();
    let active_connections = gateway.connection_count().await;

    tracing::info!(
        "📡 SSE delivery stream opened for customer {} (active WS connections: {})",
        customer_id,
        active_connections
    );

    let stream = async_stream::stream! {
        // Send connected event
        let connected = Event::default()
            .event("connected")
            .data(serde_json::json!({
                "customer_id": customer_id,
                "server_time": Utc::now().to_rfc3339(),
                "type": "delivery_stream",
            }).to_string());
        yield Ok(connected);

        loop {
            match rx.recv().await {
                Ok(envelope) => {
                    // Filter: only delivery events for this customer
                    let should_send = match &envelope.event {
                        AppEvent::DeliveryCreated { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::DeliveryStatusChanged { customer_id: cid, .. } => *cid == customer_id,
                        _ => false,
                    };

                    if !should_send {
                        continue;
                    }

                    let (event_type, data) = match &envelope.event {
                        AppEvent::DeliveryCreated {
                            delivery_id,
                            endpoint_id,
                            event_type,
                            ..
                        } => {
                            let data = serde_json::json!({
                                "id": delivery_id,
                                "endpoint_id": endpoint_id,
                                "event": event_type,
                                "status": "pending",
                                "attempts": 0,
                                "created_at": Utc::now().to_rfc3339(),
                            });
                            ("delivery", data)
                        }
                        AppEvent::DeliveryStatusChanged {
                            delivery_id,
                            old_status,
                            new_status,
                            ..
                        } => {
                            let data = serde_json::json!({
                                "id": delivery_id,
                                "old_status": old_status,
                                "new_status": new_status,
                                "updated_at": Utc::now().to_rfc3339(),
                            });
                            ("delivery_status", data)
                        }
                        _ => continue,
                    };

                    let event = Event::default()
                        .event(event_type)
                        .id(envelope.id.to_string())
                        .data(data.to_string());

                    yield Ok(event);
                }
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    tracing::warn!("SSE client (customer {}) lagged {} events", customer_id, n);
                    let lagged = Event::default()
                        .event("lagged")
                        .data(format!("{} events missed", n));
                    yield Ok(lagged);
                }
                Err(broadcast::error::RecvError::Closed) => {
                    tracing::info!("SSE delivery stream: publisher closed");
                    break;
                }
            }
        }
    };

    Ok(Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(std::time::Duration::from_secs(15))
            .text("ping"),
    ))
}

/// SSE channel subscribe — event-driven version.
///
/// Subscribes to a stream channel using the EventPublisher broadcast
/// instead of polling the database every 2 seconds.
///
/// GET /v1/stream/channels/{id}/subscribe
pub async fn channel_event_stream(
    Extension(customer): Extension<Customer>,
    Extension(publisher): Extension<Option<EventPublisher>>,
    axum::extract::Path(channel_id): axum::extract::Path<Uuid>,
    axum::extract::Query(params): axum::extract::Query<super::StreamParams>,
) -> Result<Sse<impl Stream<Item = Result<Event, Infallible>>>, AppError> {
    let publisher = match publisher {
        Some(p) => p,
        None => {
            // Fallback to DB polling if EventPublisher not available
            tracing::warn!("EventPublisher not available, channel stream will be empty");
            let stream = async_stream::stream! {
                yield Ok(Event::default()
                    .event("error")
                    .data("Event system not configured"));
            };
            return Ok(Sse::new(stream).keep_alive(
                axum::response::sse::KeepAlive::new()
                    .interval(std::time::Duration::from_secs(15))
                    .text("ping"),
            ));
        }
    };

    let customer_id = customer.id;
    let mut rx = publisher.subscribe();

    tracing::info!(
        "📡 SSE channel stream opened for customer {} channel {}",
        customer_id,
        channel_id
    );

    let event_filter = params.event_types.clone();
    let stream = async_stream::stream! {
        // Send connected event
        let connected = Event::default()
            .event("connected")
            .data(serde_json::json!({
                "channel_id": channel_id,
                "customer_id": customer_id,
                "server_time": Utc::now().to_rfc3339(),
            }).to_string());
        yield Ok(connected);

        loop {
            match rx.recv().await {
                Ok(envelope) => {
                    let event_type_str = envelope.event.event_type();

                    // Apply event type filter if specified
                    if let Some(ref filter) = event_filter {
                        let types: Vec<&str> = filter.split(',').collect();
                        if !types.iter().any(|t| event_type_str.contains(t)) {
                            continue;
                        }
                    }

                    // Filter by customer for delivery events
                    let should_send = match &envelope.event {
                        AppEvent::DeliveryCreated { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::DeliveryStatusChanged { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::EndpointCreated { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::EndpointUpdated { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::EndpointDeleted { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::EndpointStatusChanged { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::AlertTriggered { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::ApplicationCreated { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::ApplicationUpdated { customer_id: cid, .. } => *cid == customer_id,
                        AppEvent::ApplicationDeleted { customer_id: cid, .. } => *cid == customer_id,
                        // Queue and user events are global (admin)
                        AppEvent::QueueUpdated { .. } => true,
                        AppEvent::UserCreated { .. } => true,
                    };

                    if !should_send {
                        continue;
                    }

                    let data = serde_json::to_string(&envelope.event).unwrap_or_default();
                    let event = Event::default()
                        .event(event_type_str)
                        .id(envelope.id.to_string())
                        .data(data);

                    yield Ok(event);
                }
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    tracing::warn!("SSE channel client lagged {} events", n);
                    yield Ok(Event::default()
                        .event("lagged")
                        .data(format!("{} events missed", n)));
                }
                Err(broadcast::error::RecvError::Closed) => {
                    break;
                }
            }
        }
    };

    Ok(Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(std::time::Duration::from_secs(15))
            .text("ping"),
    ))
}
