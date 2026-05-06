//! # HookRelay Rust SDK
//!
//! Official Rust client for the [HookRelay](https://hookrelay.io) webhook delivery service.
//!
//! ## Usage
//!
//! ```rust,no_run
//! use hookrelay::HookRelayClient;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let client = HookRelayClient::new("hr_live_...");
//!
//!     // Create endpoint
//!     let endpoint = client.endpoints()
//!         .create("https://myapp.com/webhook", Some("Orders"), None)
//!         .await?;
//!
//!     // Send webhook
//!     let delivery = client.webhooks()
//!         .send(&endpoint.id, "order.created", serde_json::json!({"order_id": "12345"}))
//!         .await?;
//!
//!     Ok(())
//! }
//! ```

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use hmac::{Hmac, Mac};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::time::Duration;
use thiserror::Error;

type HmacSha256 = Hmac<Sha256>;

// ==================== Error Types ====================

/// HookRelay API error.
#[derive(Error, Debug)]
pub enum HookRelayError {
    #[error("Authentication error: {message}")]
    Authentication { status: u16, message: String },

    #[error("Validation error: {message}")]
    Validation { status: u16, message: String },

    #[error("Not found: {message}")]
    NotFound { status: u16, message: String },

    #[error("Rate limit exceeded: {message}")]
    RateLimit { status: u16, message: String },

    #[error("Payload too large: {message}")]
    PayloadTooLarge { status: u16, message: String },

    #[error("API error (HTTP {status}): {message}")]
    Api { status: u16, message: String },

    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

// ==================== Models ====================

/// A webhook endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Endpoint {
    pub id: String,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub retry_policy: Option<RetryPolicy>,
    pub created_at: Option<String>,
}

/// Retry policy configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: Option<i32>,
    pub backoff: Option<String>,
    pub initial_delay_secs: Option<i32>,
    pub max_delay_secs: Option<i32>,
}

/// A webhook delivery.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delivery {
    pub id: String,
    pub endpoint_id: Option<String>,
    pub event: Option<String>,
    pub status: Option<String>,
    pub attempt_count: i32,
    pub response_status: Option<i32>,
    pub replay_count: i32,
    pub created_at: Option<String>,
}

/// A delivery attempt.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryAttempt {
    pub id: String,
    pub attempt_number: i32,
    pub status_code: Option<i32>,
    pub response_body: Option<String>,
    pub duration_ms: Option<i64>,
    pub error_message: Option<String>,
    pub created_at: Option<String>,
}

/// Paginated delivery list.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryList {
    pub deliveries: Vec<Delivery>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

/// Batch send result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchResult {
    pub deliveries: Vec<Delivery>,
    pub errors: Vec<serde_json::Value>,
}

/// Platform statistics.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    pub total_deliveries: i64,
    pub delivered: i64,
    pub failed: i64,
    pub pending: i64,
    pub success_rate: f64,
    pub endpoints_count: i64,
}

// ==================== Client ====================

const DEFAULT_BASE_URL: &str = "https://api.hookrelay.io/v1";
const DEFAULT_TIMEOUT: u64 = 30;
const USER_AGENT: &str = "hookrelay-rust/0.2.0";

/// HookRelay API client.
pub struct HookRelayClient {
    api_key: String,
    base_url: String,
    http: Client,
}

impl HookRelayClient {
    /// Create a new HookRelay client.
    pub fn new(api_key: &str) -> Self {
        Self {
            api_key: api_key.to_string(),
            base_url: DEFAULT_BASE_URL.to_string(),
            http: Client::builder()
                .timeout(Duration::from_secs(DEFAULT_TIMEOUT))
                .build()
                .expect("Failed to create HTTP client"),
        }
    }

    /// Create a client with a custom base URL.
    pub fn with_base_url(api_key: &str, base_url: &str) -> Self {
        let mut client = Self::new(api_key);
        client.base_url = base_url.trim_end_matches('/').to_string();
        client
    }

    /// Access endpoints resource.
    pub fn endpoints(&self) -> EndpointsResource<'_> {
        EndpointsResource { client: self }
    }

    /// Access webhooks resource.
    pub fn webhooks(&self) -> WebhooksResource<'_> {
        WebhooksResource { client: self }
    }

    /// Get platform statistics.
    pub async fn get_stats(&self) -> Result<Stats, HookRelayError> {
        self.request(reqwest::Method::GET, "/stats", None).await
    }

    async fn request<T: for<'de> Deserialize<'de>>(
        &self,
        method: reqwest::Method,
        path: &str,
        body: Option<serde_json::Value>,
    ) -> Result<T, HookRelayError> {
        let url = format!("{}{}", self.base_url, path);
        let mut req = self
            .http
            .request(method, &url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .header("User-Agent", USER_AGENT);

        if let Some(body) = body {
            req = req.json(&body);
        }

        let resp = req.send().await?;
        let status = resp.status().as_u16();

        if status >= 400 {
            let text = resp.text().await.unwrap_or_default();
            let message = serde_json::from_str::<serde_json::Value>(&text)
                .ok()
                .and_then(|v| v["error"]["message"].as_str().map(|s| s.to_string()))
                .unwrap_or_else(|| format!("HTTP {}", status));

            return Err(match status {
                400 => HookRelayError::Validation { status, message },
                401 => HookRelayError::Authentication { status, message },
                404 => HookRelayError::NotFound { status, message },
                413 => HookRelayError::PayloadTooLarge { status, message },
                429 => HookRelayError::RateLimit { status, message },
                _ => HookRelayError::Api { status, message },
            });
        }

        let text = resp.text().await?;
        Ok(serde_json::from_str(&text)?)
    }
}

// ==================== Endpoints Resource ====================

/// Endpoints CRUD operations.
pub struct EndpointsResource<'a> {
    client: &'a HookRelayClient,
}

impl<'a> EndpointsResource<'a> {
    /// Create a new endpoint.
    pub async fn create(
        &self,
        url: &str,
        description: Option<&str>,
        retry_policy: Option<serde_json::Value>,
    ) -> Result<Endpoint, HookRelayError> {
        let mut body = serde_json::json!({ "url": url });
        if let Some(desc) = description {
            body["description"] = serde_json::json!(desc);
        }
        if let Some(rp) = retry_policy {
            body["retry_policy"] = rp;
        }
        self.client
            .request(reqwest::Method::POST, "/endpoints", Some(body))
            .await
    }

    /// Get an endpoint by ID.
    pub async fn get(&self, endpoint_id: &str) -> Result<Endpoint, HookRelayError> {
        self.client
            .request(reqwest::Method::GET, &format!("/endpoints/{}", endpoint_id), None)
            .await
    }

    /// List all endpoints.
    pub async fn list(&self, page: i32, per_page: i32) -> Result<Vec<Endpoint>, HookRelayError> {
        self.client
            .request(
                reqwest::Method::GET,
                &format!("/endpoints?page={}&per_page={}", page, per_page),
                None,
            )
            .await
    }

    /// Delete an endpoint.
    pub async fn delete(&self, endpoint_id: &str) -> Result<bool, HookRelayError> {
        let result: serde_json::Value = self
            .client
            .request(
                reqwest::Method::DELETE,
                &format!("/endpoints/{}", endpoint_id),
                None,
            )
            .await?;
        Ok(result["deleted"].as_bool().unwrap_or(true))
    }

    /// Rotate the signing secret for an endpoint.
    pub async fn rotate_secret(
        &self,
        endpoint_id: &str,
    ) -> Result<serde_json::Value, HookRelayError> {
        self.client
            .request(
                reqwest::Method::POST,
                &format!("/endpoints/{}/rotate-secret", endpoint_id),
                None,
            )
            .await
    }
}

// ==================== Webhooks Resource ====================

/// Webhooks operations.
pub struct WebhooksResource<'a> {
    client: &'a HookRelayClient,
}

impl<'a> WebhooksResource<'a> {
    /// Send a webhook.
    pub async fn send(
        &self,
        endpoint_id: &str,
        event: &str,
        data: serde_json::Value,
    ) -> Result<Delivery, HookRelayError> {
        let body = serde_json::json!({
            "endpoint_id": endpoint_id,
            "event": event,
            "data": data,
        });
        self.client
            .request(reqwest::Method::POST, "/webhooks", Some(body))
            .await
    }

    /// Get a delivery by ID.
    pub async fn get(&self, delivery_id: &str) -> Result<Delivery, HookRelayError> {
        self.client
            .request(reqwest::Method::GET, &format!("/webhooks/{}", delivery_id), None)
            .await
    }

    /// List deliveries with optional filters.
    pub async fn list(
        &self,
        status: Option<&str>,
        page: i32,
        per_page: i32,
    ) -> Result<DeliveryList, HookRelayError> {
        let mut params = format!("page={}&per_page={}", page, per_page);
        if let Some(s) = status {
            params.push_str(&format!("&status={}", s));
        }
        self.client
            .request(reqwest::Method::GET, &format!("/webhooks?{}", params), None)
            .await
    }

    /// Replay a delivery.
    pub async fn replay(&self, delivery_id: &str) -> Result<Delivery, HookRelayError> {
        self.client
            .request(
                reqwest::Method::POST,
                &format!("/webhooks/{}/replay", delivery_id),
                None,
            )
            .await
    }

    /// Send multiple webhooks in a batch.
    pub async fn batch(
        &self,
        webhooks: Vec<serde_json::Value>,
    ) -> Result<BatchResult, HookRelayError> {
        let body = serde_json::json!({ "webhooks": webhooks });
        self.client
            .request(reqwest::Method::POST, "/webhooks/batch", Some(body))
            .await
    }

    /// Get delivery attempts.
    pub async fn attempts(&self, delivery_id: &str) -> Result<Vec<DeliveryAttempt>, HookRelayError> {
        self.client
            .request(
                reqwest::Method::GET,
                &format!("/webhooks/{}/attempts", delivery_id),
                None,
            )
            .await
    }
}

// ==================== Webhook Verification ====================

/// Result of webhook verification.
#[derive(Debug)]
pub struct VerificationResult {
    pub valid: bool,
    pub payload: Option<serde_json::Value>,
    pub error: Option<String>,
}

/// Webhook signature verifier.
///
/// Supports both Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
/// and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
pub struct WebhookVerifier {
    key: Vec<u8>,
    tolerance_secs: u64,
}

impl WebhookVerifier {
    /// Create a new verifier with a secret.
    pub fn new(secret: &str) -> Self {
        let stripped = secret.strip_prefix("whsec_").unwrap_or(secret);
        // Add padding in case secret is unpadded base64
        let padded = match stripped.len() % 4 {
            0 => stripped.to_string(),
            n => format!("{}{}", stripped, "=".repeat(4 - n)),
        };
        let key = BASE64.decode(&padded).unwrap_or_else(|_| secret.as_bytes().to_vec());
        Self {
            key,
            tolerance_secs: 300,
        }
    }

    /// Set custom tolerance in seconds.
    pub fn with_tolerance(mut self, tolerance_secs: u64) -> Self {
        self.tolerance_secs = tolerance_secs;
        self
    }

    /// Verify a webhook using Standard Webhooks headers.
    pub fn verify(
        &self,
        body: &str,
        msg_id: Option<&str>,
        timestamp: Option<&str>,
        signature_header: Option<&str>,
    ) -> VerificationResult {
        let msg_id = match msg_id {
            Some(id) if !id.is_empty() => id,
            _ => return VerificationResult { valid: false, payload: None, error: Some("Missing webhook-id header".into()) },
        };
        let timestamp = match timestamp {
            Some(ts) if !ts.is_empty() => ts,
            _ => return VerificationResult { valid: false, payload: None, error: Some("Missing webhook-timestamp header".into()) },
        };
        let signature_header = match signature_header {
            Some(sig) if !sig.is_empty() => sig,
            _ => return VerificationResult { valid: false, payload: None, error: Some("Missing webhook-signature header".into()) },
        };
        if body.is_empty() {
            return VerificationResult { valid: false, payload: None, error: Some("Missing request body".into()) };
        }

        let ts: i64 = match timestamp.parse() {
            Ok(t) => t,
            Err(_) => return VerificationResult { valid: false, payload: None, error: Some("Invalid webhook timestamp".into()) },
        };

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        if now - ts > self.tolerance_secs as i64 {
            return VerificationResult { valid: false, payload: None, error: Some("Message timestamp too old".into()) };
        }
        if ts > now + self.tolerance_secs as i64 {
            return VerificationResult { valid: false, payload: None, error: Some("Message timestamp too new".into()) };
        }

        // Compute expected signature
        let signed_content = format!("{}.{}.{}", msg_id, timestamp, body);
        let mut mac = HmacSha256::new_from_slice(&self.key).expect("HMAC key error");
        mac.update(signed_content.as_bytes());
        let expected_sig = format!("v1,{}", BASE64.encode(mac.finalize().into_bytes()));

        // Check each signature (constant-time comparison)
        let verified = signature_header
            .split(' ')
            .any(|sig| {
                let trimmed = sig.trim();
                if !trimmed.starts_with("v1,") {
                    return false;
                }
                let sig_bytes = &trimmed.as_bytes()[3..]; // skip "v1,"
                let exp_bytes = expected_sig.as_bytes();
                if sig_bytes.len() != exp_bytes.len() {
                    return false;
                }
                // Constant-time comparison (XOR-based)
                let mut result = 0u8;
                for (a, b) in sig_bytes.iter().zip(exp_bytes.iter()) {
                    result |= a ^ b;
                }
                result == 0
            });

        if !verified {
            return VerificationResult { valid: false, payload: None, error: Some("Invalid webhook signature".into()) };
        }

        // Parse payload
        let payload = serde_json::from_str(body).ok();
        VerificationResult { valid: true, payload, error: None }
    }

    /// Verify a webhook from headers with automatic header detection.
    /// Supports both Standard Webhooks and Svix headers.
    pub fn verify_from_headers(
        &self,
        body: &str,
        headers: &std::collections::HashMap<String, String>,
    ) -> VerificationResult {
        let normalized: std::collections::HashMap<String, String> = headers
            .iter()
            .map(|(k, v)| (k.to_lowercase(), v.clone()))
            .collect();

        let mut msg_id = normalized.get("webhook-id").map(|s| s.as_str());
        let mut timestamp = normalized.get("webhook-timestamp").map(|s| s.as_str());
        let mut signature_header = normalized.get("webhook-signature").map(|s| s.as_str());

        if msg_id.is_none() || timestamp.is_none() || signature_header.is_none() {
            msg_id = msg_id.or_else(|| normalized.get("svix-id").map(|s| s.as_str()));
            timestamp = timestamp.or_else(|| normalized.get("svix-timestamp").map(|s| s.as_str()));
            signature_header = signature_header.or_else(|| normalized.get("svix-signature").map(|s| s.as_str()));
        }

        self.verify(body, msg_id, timestamp, signature_header)
    }
}
