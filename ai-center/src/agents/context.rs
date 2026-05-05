use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Rich context passed to AI agents when a webhook event triggers them.
///
/// Contains everything an agent needs to make informed decisions:
/// delivery details, endpoint config, customer info, the event payload,
/// and recent delivery history for the endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookContext {
    /// The delivery that triggered this agent
    pub delivery_id: Uuid,
    /// Endpoint that received the webhook
    pub endpoint_id: Uuid,
    /// Endpoint URL
    pub endpoint_url: String,
    /// Customer who owns the endpoint
    pub customer_id: Uuid,
    /// HTTP method used (usually POST)
    pub method: String,
    /// HTTP status code returned by the endpoint
    pub status_code: i32,
    /// Response body (truncated)
    pub response_body: Option<String>,
    /// Time taken for the delivery in ms
    pub duration_ms: i32,
    /// The webhook payload (JSON string)
    pub payload: String,
    /// Parsed payload as JSON value for easy field access
    pub payload_json: Option<serde_json::Value>,
    /// Event type extracted from payload (e.g., "payment.failed")
    pub event_type: Option<String>,
    /// Attempt number for this delivery
    pub attempt_number: i32,
    /// Recent delivery history for this endpoint (last N deliveries)
    pub recent_deliveries: Vec<DeliverySummary>,
    /// Customer metadata (plan, tier, tags, etc.)
    pub customer_metadata: Option<serde_json::Value>,
    /// Timestamp of the webhook event
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// Summary of a recent delivery, used for pattern analysis.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverySummary {
    pub delivery_id: Uuid,
    pub status: String,
    pub status_code: i32,
    pub duration_ms: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub event_type: Option<String>,
}

impl WebhookContext {
    /// Get the event type, falling back to "unknown" if not set.
    pub fn event_type(&self) -> &str {
        self.event_type.as_deref().unwrap_or("unknown")
    }

    /// Check if this is a payment-related event.
    pub fn is_payment_event(&self) -> bool {
        let et = self.event_type();
        et.starts_with("payment.") || et.starts_with("invoice.") || et.starts_with("subscription.")
    }

    /// Check if this is an order-related event.
    pub fn is_order_event(&self) -> bool {
        self.event_type().starts_with("order.")
    }

    /// Check if this is a stock/inventory event.
    pub fn is_stock_event(&self) -> bool {
        let et = self.event_type();
        et.starts_with("stock.") || et.starts_with("inventory.")
    }

    /// Extract the payment amount from the payload.
    /// Looks for common field names: amount, total, price, value.
    pub fn extract_amount(&self) -> Option<f64> {
        let json = self.payload_json.as_ref()?;
        for key in &["amount", "total", "price", "value", "total_amount"] {
            if let Some(val) = json.get(key) {
                if let Some(n) = val.as_f64() {
                    return Some(n);
                }
                if let Some(s) = val.as_str() {
                    if let Ok(n) = s.parse::<f64>() {
                        return Some(n);
                    }
                }
            }
        }
        None
    }

    /// Extract the customer ID from the payload.
    /// Looks for: customer_id, user_id, account_id, buyer_id.
    pub fn extract_customer_id(&self) -> Option<String> {
        let json = self.payload_json.as_ref()?;
        for key in &["customer_id", "user_id", "account_id", "buyer_id", "customer"] {
            if let Some(val) = json.get(key) {
                if let Some(s) = val.as_str() {
                    return Some(s.to_string());
                }
                if let Some(n) = val.as_i64() {
                    return Some(n.to_string());
                }
            }
        }
        None
    }

    /// Extract order ID from the payload.
    pub fn extract_order_id(&self) -> Option<String> {
        let json = self.payload_json.as_ref()?;
        for key in &["order_id", "id", "order_number"] {
            if let Some(val) = json.get(key) {
                if let Some(s) = val.as_str() {
                    return Some(s.to_string());
                }
            }
        }
        None
    }

    /// Get the full payload as a pretty-printed JSON string.
    pub fn payload_pretty(&self) -> String {
        self.payload_json
            .as_ref()
            .and_then(|v| serde_json::to_string_pretty(v).ok())
            .unwrap_or_else(|| self.payload.clone())
    }

    /// Calculate the failure rate from recent deliveries (0.0 - 1.0).
    pub fn recent_failure_rate(&self) -> f64 {
        if self.recent_deliveries.is_empty() {
            return 0.0;
        }
        let failures = self
            .recent_deliveries
            .iter()
            .filter(|d| d.status == "failed")
            .count();
        failures as f64 / self.recent_deliveries.len() as f64
    }

    /// Calculate average response time from recent deliveries.
    pub fn avg_response_time_ms(&self) -> f64 {
        if self.recent_deliveries.is_empty() {
            return 0.0;
        }
        let total: i32 = self.recent_deliveries.iter().map(|d| d.duration_ms).sum();
        total as f64 / self.recent_deliveries.len() as f64
    }
}
