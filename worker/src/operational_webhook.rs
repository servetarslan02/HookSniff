//! Operational Webhook Dispatch
//!
//! When system events occur (delivery failures, endpoint disabled, etc.),
//! this module dispatches notifications to customer-configured operational
//! webhook endpoints.
//!
//! Flow:
//! 1. Worker detects a significant event (e.g., delivery dead-lettered)
//! 2. Calls `dispatch_event(pool, http_client, customer_id, event_type, payload)`
//! 3. Module looks up active operational webhook endpoints for the customer
//! 4. Filters by event_types subscription (if configured)
//! 5. Signs payload with HMAC-SHA256 and POSTs to each endpoint
//! 6. Records delivery in `operational_webhook_deliveries`

use chrono::Utc;
use hooksniff_common::signing;
use reqwest::Client;
use serde::Serialize;
use sqlx::PgPool;
use tracing::{info, warn};
use uuid::Uuid;

/// Operational webhook event types.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OpWebhookEvent {
    DeliveryFailed,
    EndpointDisabled,
}

impl OpWebhookEvent {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::DeliveryFailed => "delivery.failed",
            Self::EndpointDisabled => "endpoint.disabled",
        }
    }
}

/// Payload sent to operational webhook endpoints.
#[derive(Debug, Serialize)]
struct OpWebhookPayload {
    #[serde(rename = "eventType")]
    event_type: String,
    #[serde(rename = "customerId")]
    customer_id: Uuid,
    data: serde_json::Value,
    #[serde(rename = "timestamp")]
    timestamp: String,
}

/// An operational webhook endpoint row from the database.
#[derive(Debug, sqlx::FromRow)]
struct OpEndpoint {
    id: Uuid,
    url: String,
    signing_secret: String,
    event_types: Option<Vec<String>>,
}

/// Dispatch an operational webhook event to all subscribed endpoints for a customer.
///
/// This is fire-and-forget — errors are logged but not propagated, so they
/// never block the main delivery pipeline.
pub async fn dispatch_event(
    pool: &PgPool,
    http_client: &Client,
    customer_id: Uuid,
    event: OpWebhookEvent,
    data: serde_json::Value,
) {
    let event_str = event.as_str();

    // Fetch active endpoints for this customer
    let endpoints: Vec<OpEndpoint> = match sqlx::query_as(
        "SELECT id, url, signing_secret, event_types \
         FROM operational_webhook_endpoints \
         WHERE customer_id = $1 AND is_active = true",
    )
    .bind(customer_id)
    .fetch_all(pool)
    .await
    {
        Ok(rows) => rows,
        Err(e) => {
            warn!(
                "⚠️ Failed to fetch operational webhook endpoints for customer {}: {:?}",
                customer_id, e
            );
            return;
        }
    };

    if endpoints.is_empty() {
        return;
    }

    // Filter by event_types subscription
    let subscribed: Vec<&OpEndpoint> = endpoints
        .iter()
        .filter(|ep| {
            // If event_types is None or empty, subscribe to all events
            ep.event_types
                .as_ref()
                .map(|types| types.is_empty() || types.iter().any(|t| t == event_str))
                .unwrap_or(true)
        })
        .collect();

    if subscribed.is_empty() {
        return;
    }

    let payload = OpWebhookPayload {
        event_type: event_str.to_string(),
        customer_id,
        data,
        timestamp: Utc::now().to_rfc3339(),
    };

    let payload_json = match serde_json::to_string(&payload) {
        Ok(j) => j,
        Err(e) => {
            warn!("⚠️ Failed to serialize operational webhook payload: {:?}", e);
            return;
        }
    };

    // Dispatch to each endpoint concurrently
    let mut handles = Vec::with_capacity(subscribed.len());

    for endpoint in subscribed {
        let pool = pool.clone();
        let http_client = http_client.clone();
        let url = endpoint.url.clone();
        let secret = endpoint.signing_secret.clone();
        let ep_id = endpoint.id;
        let payload = payload_json.clone();
        let event_type = event_str.to_string();

        handles.push(tokio::spawn(async move {
            dispatch_one(&pool, &http_client, ep_id, customer_id, &url, &secret, &event_type, &payload).await;
        }));
    }

    for handle in handles {
        if let Err(e) = handle.await {
            warn!("⚠️ Operational webhook dispatch task panicked: {:?}", e);
        }
    }
}

/// Dispatch a single operational webhook delivery.
async fn dispatch_one(
    pool: &PgPool,
    http_client: &Client,
    endpoint_id: Uuid,
    customer_id: Uuid,
    url: &str,
    signing_secret: &str,
    event_type: &str,
    payload: &str,
) {
    let delivery_id = Uuid::new_v4().to_string();
    let timestamp = Utc::now().timestamp().to_string();

    // Standard Webhooks signature
    let signature = signing::compute_standard_signature(
        signing_secret,
        &delivery_id,
        &timestamp,
        payload,
    );

    let start = std::time::Instant::now();

    let result = http_client
        .post(url)
        .header("Content-Type", "application/json")
        .header("webhook-id", &delivery_id)
        .header("webhook-timestamp", &timestamp)
        .header("webhook-signature", &signature)
        .header("hooksniff-event", event_type)
        .body(payload.to_string())
        .send()
        .await;

    let _duration_ms = start.elapsed().as_millis() as i32;

    match result {
        Ok(resp) => {
            let status = resp.status().as_u16() as i16;
            let body = resp.text().await.unwrap_or_default();
            let success = (200..300).contains(&status);
            let delivered_at = if success { Some(Utc::now()) } else { None };

            if success {
                info!(
                    "✅ Operational webhook delivered: event={} endpoint={} status={}",
                    event_type, endpoint_id, status
                );
            } else {
                warn!(
                    "⚠️ Operational webhook delivery failed: event={} endpoint={} status={}",
                    event_type, endpoint_id, status
                );
            }

            // Record delivery
            let _ = sqlx::query(
                "INSERT INTO operational_webhook_deliveries \
                 (id, endpoint_id, customer_id, event_type, payload, response_status, response_body, attempt_count, status, delivered_at) \
                 VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, 1, $8, $9)",
            )
            .bind(Uuid::new_v4())
            .bind(endpoint_id)
            .bind(customer_id)
            .bind(event_type)
            .bind(serde_json::from_str::<serde_json::Value>(payload).unwrap_or_default())
            .bind(status)
            .bind(truncate(&body, 1000))
            .bind(if success { "success" } else { "failed" })
            .bind(delivered_at)
            .execute(pool)
            .await;
        }
        Err(e) => {
            warn!(
                "❌ Operational webhook request error: event={} endpoint={} error={}",
                event_type, endpoint_id, e
            );

            // Record failed delivery
            let _ = sqlx::query(
                "INSERT INTO operational_webhook_deliveries \
                 (id, endpoint_id, customer_id, event_type, payload, response_status, response_body, attempt_count, status) \
                 VALUES ($1, $2, $3, $4, $5::jsonb, NULL, $6, 1, 'failed')",
            )
            .bind(Uuid::new_v4())
            .bind(endpoint_id)
            .bind(customer_id)
            .bind(event_type)
            .bind(serde_json::from_str::<serde_json::Value>(payload).unwrap_or_default())
            .bind(truncate(&e.to_string(), 1000))
            .execute(pool)
            .await;
        }
    }
}

/// Truncate a string to max bytes.
fn truncate(s: &str, max: usize) -> &str {
    if s.len() <= max {
        s
    } else {
        &s[..max]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_type_strings() {
        assert_eq!(OpWebhookEvent::DeliveryFailed.as_str(), "delivery.failed");
        assert_eq!(OpWebhookEvent::EndpointDisabled.as_str(), "endpoint.disabled");
    }

    #[test]
    fn test_truncate() {
        assert_eq!(truncate("hello", 10), "hello");
        assert_eq!(truncate("hello world", 5), "hello");
        assert_eq!(truncate("", 5), "");
    }
}
