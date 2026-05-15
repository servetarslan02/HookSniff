//! QStash integration for reliable message delivery.
//!
//! QStash is Upstash's serverless messaging service that provides:
//! - Guaranteed delivery with automatic retries
//! - Dead letter queue for failed messages
//! - Scheduled/delayed message delivery
//! - Message deduplication
//!
//! Used for: webhook delivery retries, scheduled jobs, email queue

use anyhow::Result;
use serde::{Deserialize, Serialize};

/// QStash client for publishing messages.
#[derive(Clone)]
pub struct QStashClient {
    client: reqwest::Client,
    token: String,
    base_url: String,
}

/// QStash publish request.
#[derive(Debug, Serialize)]
struct PublishRequest<'a> {
    destination: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    body: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    retries: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    retry_delay: Option<u64>,
    #[serde(rename = "content-type", skip_serializing_if = "Option::is_none")]
    content_type: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    deduplication_id: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    not_before: Option<u64>,
}

/// QStash publish response.
#[derive(Debug, Deserialize)]
pub struct PublishResponse {
    pub message_id: String,
}

/// QStash message for webhook delivery retry.
#[derive(Debug, Serialize, Deserialize)]
pub struct WebhookRetryPayload {
    pub delivery_id: String,
    pub endpoint_url: String,
    pub payload: String,
    pub secret: String,
    pub event: String,
    pub attempt: u32,
}

impl QStashClient {
    /// Create a new QStash client.
    ///
    /// `token` is the QSTASH_TOKEN from Upstash console.
    /// `base_url` defaults to "https://qstash-eu-central-1.upstash.io" for EU region.
    pub fn new(token: &str, base_url: Option<&str>) -> Self {
        Self {
            client: reqwest::Client::new(),
            token: token.to_string(),
            base_url: base_url
                .unwrap_or("https://qstash-eu-central-1.upstash.io")
                .to_string(),
        }
    }

    /// Create from environment variables.
    /// Requires: QSTASH_TOKEN
    /// Optional: QSTASH_URL (defaults to EU region)
    pub fn from_env() -> Option<Self> {
        let token = std::env::var("QSTASH_TOKEN").ok()?;
        if token.is_empty() {
            return None;
        }
        let base_url = std::env::var("QSTASH_URL").ok();
        Some(Self::new(&token, base_url.as_deref()))
    }

    /// Publish a message to a destination URL.
    ///
    /// `destination` - the URL to deliver the message to
    /// `body` - the message body (JSON string)
    /// `retries` - number of retries on failure (default: 3)
    /// `retry_delay` - delay between retries in seconds (default: 60)
    pub async fn publish(
        &self,
        destination: &str,
        body: &str,
        retries: Option<u32>,
        retry_delay: Option<u64>,
    ) -> Result<PublishResponse> {
        let url = format!("{}/v2/publish/{}", self.base_url, destination);

        let request = PublishRequest {
            destination,
            body: Some(body),
            retries: retries.or(Some(3)),
            retry_delay: retry_delay.or(Some(60)),
            content_type: Some("application/json"),
            deduplication_id: None,
            not_before: None,
        };

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            anyhow::bail!("QStash publish failed ({}): {}", status, text);
        }

        let result: PublishResponse = serde_json::from_str(&text)?;
        Ok(result)
    }

    /// Publish a webhook delivery retry.
    ///
    /// Enqueues a failed webhook delivery for retry via QStash.
    /// The callback URL should be an internal endpoint that processes the retry.
    pub async fn enqueue_webhook_retry(
        &self,
        callback_url: &str,
        payload: &WebhookRetryPayload,
    ) -> Result<PublishResponse> {
        let body = serde_json::to_string(payload)?;
        // Exponential backoff: 2^attempt seconds
        let delay = 2u64.pow(payload.attempt);
        self.publish(callback_url, &body, Some(3), Some(delay)).await
    }

    /// Schedule a message for future delivery.
    ///
    /// `not_before` - Unix timestamp when the message should be delivered
    pub async fn schedule(
        &self,
        destination: &str,
        body: &str,
        not_before: u64,
    ) -> Result<PublishResponse> {
        let url = format!("{}/v2/publish/{}", self.base_url, destination);

        let request = PublishRequest {
            destination,
            body: Some(body),
            retries: Some(3),
            retry_delay: Some(60),
            content_type: Some("application/json"),
            deduplication_id: None,
            not_before: Some(not_before),
        };

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            anyhow::bail!("QStash schedule failed ({}): {}", status, text);
        }

        let result: PublishResponse = serde_json::from_str(&text)?;
        Ok(result)
    }

    /// Enqueue an email job via QStash.
    pub async fn enqueue_email(
        &self,
        callback_url: &str,
        to: &str,
        template: &crate::jobs::job_queue::EmailTemplate,
        language: &str,
    ) -> Result<PublishResponse> {
        let job = crate::jobs::job_queue::Job::Email {
            to: to.to_string(),
            template: template.clone(),
            language: language.to_string(),
        };
        let body = serde_json::to_string(&job)?;
        self.publish(callback_url, &body, Some(3), Some(30)).await
    }

    /// Enqueue a cleanup job via QStash (scheduled).
    pub async fn enqueue_cleanup(
        &self,
        callback_url: &str,
        task: &str,
        not_before: u64,
    ) -> Result<PublishResponse> {
        let job = crate::jobs::job_queue::Job::ScheduledCleanup {
            task: task.to_string(),
        };
        let body = serde_json::to_string(&job)?;
        self.schedule(callback_url, &body, not_before).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn webhook_retry_payload_serialization() {
        let payload = WebhookRetryPayload {
            delivery_id: "del_123".to_string(),
            endpoint_url: "https://example.com/webhook".to_string(),
            payload: r#"{"event":"test"}"#.to_string(),
            secret: "whsec_abc".to_string(),
            event: "order.created".to_string(),
            attempt: 1,
        };
        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("del_123"));
        assert!(json.contains("order.created"));
    }

    #[test]
    fn qstash_client_from_env_none() {
        // Without QSTASH_TOKEN set, should return None
        std::env::remove_var("QSTASH_TOKEN");
        assert!(QStashClient::from_env().is_none());
    }
}
