//! Push notification support via Firebase Cloud Messaging (FCM).
//!
//! Sends push notifications to registered device tokens when webhook
//! deliveries succeed or fail (configurable per customer).

use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;

/// Firebase Cloud Messaging client using the legacy HTTP API.
#[derive(Clone)]
pub struct FcmClient {
    server_key: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct FcmMessage<'a> {
    to: &'a str,
    notification: FcmNotification<'a>,
    data: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct FcmNotification<'a> {
    title: &'a str,
    body: &'a str,
}

impl FcmClient {
    /// Create an FCM client from config. Returns None if FCM_SERVER_KEY is not set.
    pub fn from_config(cfg: &Config) -> Option<Self> {
        let server_key = cfg.fcm_server_key.as_ref()?;
        if server_key.is_empty() {
            return None;
        }
        Some(Self {
            server_key: server_key.clone(),
            client: reqwest::Client::new(),
        })
    }

    /// Send a push notification to a single device token.
    pub async fn send(
        &self,
        device_token: &str,
        title: &str,
        body: &str,
        data: Option<serde_json::Value>,
    ) -> Result<(), anyhow::Error> {
        let msg = FcmMessage {
            to: device_token,
            notification: FcmNotification { title, body },
            data,
        };

        let resp = self
            .client
            .post("https://fcm.googleapis.com/fcm/send")
            .header("Authorization", format!("key={}", self.server_key))
            .header("Content-Type", "application/json")
            .json(&msg)
            .send()
            .await?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::warn!("FCM send failed: status={}, body={}", status, text);
            return Err(anyhow::anyhow!("FCM returned {}: {}", status, text));
        }

        tracing::debug!("📱 Push notification sent to device token");
        Ok(())
    }
}

/// Send push notifications to all device tokens of a customer.
pub async fn notify_customer(
    pool: &PgPool,
    fcm: &FcmClient,
    customer_id: Uuid,
    title: &str,
    body: &str,
    data: Option<serde_json::Value>,
) {
    let tokens: Vec<(String,)> =
        sqlx::query_as("SELECT token FROM device_tokens WHERE customer_id = $1")
            .bind(customer_id)
            .fetch_all(pool)
            .await
            .unwrap_or_default();

    for (token,) in tokens {
        let title = title.to_string();
        let body = body.to_string();
        let data = data.clone();
        let fcm = fcm.clone();
        let token_clone = token.clone();
        let pool_clone = pool.clone();
        let customer_id_clone = customer_id;

        tokio::spawn(async move {
            match fcm.send(&token_clone, &title, &body, data).await {
                Ok(()) => {
                    // Update last_used_at
                    if let Err(e) = sqlx::query(
                        "UPDATE device_tokens SET last_used_at = NOW() WHERE customer_id = $1 AND token = $2",
                    )
                    .bind(customer_id_clone)
                    .bind(&token_clone)
                    .execute(&pool_clone)
                    .await
                    {
                        tracing::warn!("Failed to update device token last_used: {:?}", e);
                    }
                }
                Err(e) => {
                    tracing::warn!("Failed to send push to {}: {:?}", token_clone, e);
                }
            }
        });
    }
}

/// Notify about a delivery failure.
pub async fn notify_delivery_failed(
    pool: &PgPool,
    fcm: &FcmClient,
    customer_id: Uuid,
    endpoint_name: &str,
    error_details: &str,
) {
    let title = "⚠️ Delivery Failed";
    let body = &format!("Webhook to {} failed: {}", endpoint_name, error_details);
    let data = serde_json::json!({
        "type": "delivery_failed",
        "endpoint_name": endpoint_name,
    });
    notify_customer(pool, fcm, customer_id, title, body, Some(data)).await;
}

/// Notify about a delivery success (if configured).
pub async fn notify_delivery_success(
    pool: &PgPool,
    fcm: &FcmClient,
    customer_id: Uuid,
    endpoint_name: &str,
) {
    let title = "✅ Delivery Successful";
    let body = &format!("Webhook to {} delivered successfully", endpoint_name);
    let data = serde_json::json!({
        "type": "delivery_success",
        "endpoint_name": endpoint_name,
    });
    notify_customer(pool, fcm, customer_id, title, body, Some(data)).await;
}
