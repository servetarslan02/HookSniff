//! HookSniff API Resource: Webhooks
//!
//! Send, list, get, replay, and batch webhooks.

use crate::pagination::{Page, PaginatedIterator};
use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};
use serde_json::Value;

const DEFAULT_PAGE_LIMIT: u32 = 50;
const DEFAULT_MAX_PAGES: u32 = 100;

#[derive(Debug, Serialize, Deserialize)]
pub struct WebhookSendInput {
    pub endpoint_id: String,
    pub event: String,
    pub data: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub headers: Option<std::collections::HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebhookBatchInput {
    pub webhooks: Vec<WebhookSendInput>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebhookOutput {
    pub id: String,
    pub endpoint_id: String,
    pub event: String,
    pub data: Value,
    pub status: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_code: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_body: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attempts: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchOutput {
    pub webhook_ids: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors: Option<Vec<BatchError>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchError {
    pub index: u64,
    pub error: String,
}

#[derive(Debug)]
pub struct Webhooks {
    ctx: HookSniffRequestContext,
}

impl Webhooks {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Send a webhook
    pub fn send(&self, input: &WebhookSendInput) -> Result<WebhookOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Send a batch of webhooks
    pub fn batch(&self, input: &WebhookBatchInput) -> Result<BatchOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks/batch");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// List webhooks
    pub fn list(&self) -> Result<Vec<WebhookOutput>, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
        req.send(&self.ctx)
    }

    /// List all webhooks with pagination
    pub fn list_all(&self) -> Result<Vec<WebhookOutput>, Box<dyn std::error::Error>> {
        let ctx = self.ctx.clone();
        let mut iter = PaginatedIterator::new(
            move |limit, offset| {
                let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
                req.set_query_param("limit", &limit.to_string());
                req.set_query_param("offset", &offset.to_string());
                req.send::<Page<WebhookOutput>>(&ctx)
            },
            DEFAULT_PAGE_LIMIT,
            DEFAULT_MAX_PAGES,
        );
        iter.collect_all()
    }

    /// Get a webhook by ID
    pub fn get(&self, id: &str) -> Result<WebhookOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks/{id}");
        req.set_path_param("id", id);
        req.send(&self.ctx)
    }

    /// Replay a webhook
    pub fn replay(&self, id: &str) -> Result<WebhookOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks/{id}/replay");
        req.set_path_param("id", id);
        req.send(&self.ctx)
    }
}
