//! HTTP webhook delivery — the original and default delivery method.
//!
//! Delivers events via HTTP POST with Standard Webhooks headers
//! (webhook-id, webhook-timestamp, webhook-signature) and HMAC-SHA256
//! signature. Falls back to legacy `X-Hookrelay-Signature` header for
//! backward compatibility.

use anyhow::Result;
use reqwest::Client;
use serde_json;
use tracing::{info, warn};

use crate::signing;
use crate::WebhookMessage;

use super::DeliveryResult;

/// Deliver a webhook via HTTP POST.
///
/// Generates a Standard Webhooks HMAC-SHA256 signature, attaches
/// standard headers (`webhook-id`, `webhook-timestamp`,
/// `webhook-signature`), and sends the request. Also attaches
/// legacy `X-Hookrelay-Signature` for backward compatibility.
pub async fn deliver_http(
    http_client: &Client,
    webhook: &WebhookMessage,
) -> Result<DeliveryResult> {
    let timestamp = chrono::Utc::now().timestamp().to_string();

    // Standard Webhooks signature: v1,<base64(hmac)>
    let standard_sig = signing::compute_standard_signature(
        &webhook.signing_secret,
        &webhook.delivery_id,
        &timestamp,
        &webhook.payload,
    );

    // Legacy hex signature for backward compat
    let legacy_sig = signing::compute_hmac(&webhook.signing_secret, &webhook.payload);

    let start = std::time::Instant::now();

    let mut req_builder = http_client
        .post(&webhook.endpoint_url)
        .header("Content-Type", "application/json")
        // Standard Webhooks headers
        .header("webhook-id", &webhook.delivery_id)
        .header("webhook-timestamp", &timestamp)
        .header("webhook-signature", &standard_sig)
        // Legacy headers (backward compat)
        .header("X-Hookrelay-Signature", format!("sha256={}", legacy_sig))
        .header("X-Hookrelay-Delivery-Id", &webhook.delivery_id)
        .header("X-Hookrelay-Attempt", "1")
        .body(webhook.payload.clone());

    // Attach custom headers if configured
    if let Some(ref headers) = webhook.custom_headers {
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                if let Some(val) = value.as_str() {
                    req_builder = req_builder.header(key.as_str(), val);
                }
            }
        }
    }

    let result = req_builder.send().await;
    let duration_ms = start.elapsed().as_millis() as i32;

    match result {
        Ok(response) => {
            let status_code = response.status().as_u16() as i32;
            let body = response.text().await.unwrap_or_default();
            let response_body = truncate_str(&body, 1000);
            let success = (200..300).contains(&status_code);

            if success {
                info!("✅ HTTP delivery {} succeeded", webhook.delivery_id);
            } else {
                warn!(
                    "⚠️ HTTP delivery {} got status {}",
                    webhook.delivery_id, status_code
                );
            }

            Ok(DeliveryResult {
                success,
                status_code,
                response_body,
                duration_ms,
                error: String::new(),
            })
        }
        Err(e) => {
            warn!(
                "❌ HTTP delivery {} failed: {:?}",
                webhook.delivery_id, e
            );
            Ok(DeliveryResult {
                success: false,
                status_code: 0,
                response_body: String::new(),
                duration_ms,
                error: e.to_string(),
            })
        }
    }
}

fn truncate_str(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}
