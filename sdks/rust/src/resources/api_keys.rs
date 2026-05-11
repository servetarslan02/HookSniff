//! HookSniff API Resource: API Keys
//!
//! Manage API keys — create, list, delete.

use crate::pagination::{Page, PaginatedIterator};
use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

const DEFAULT_PAGE_LIMIT: u32 = 50;
const DEFAULT_MAX_PAGES: u32 = 100;

#[derive(Debug, Serialize)]
pub struct ApiKeyCreateInput {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyOutput {
    pub id: String,
    pub name: String,
    pub key: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
}

pub struct ApiKeys {
    ctx: HookSniffRequestContext,
}

impl ApiKeys {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// List all API keys
    pub fn list(&self) -> Result<Vec<ApiKeyOutput>, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/api-keys");
        req.send(&self.ctx)
    }

    /// List all API keys with pagination
    pub fn list_all(&self) -> Result<Vec<ApiKeyOutput>, Box<dyn std::error::Error>> {
        let ctx = self.ctx.clone();
        let mut iter = PaginatedIterator::new(
            move |limit, offset| {
                let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/api-keys");
                req.set_query_param("limit", &limit.to_string());
                req.set_query_param("offset", &offset.to_string());
                req.send::<Page<ApiKeyOutput>>(&ctx)
            },
            DEFAULT_PAGE_LIMIT,
            DEFAULT_MAX_PAGES,
        );
        iter.collect_all()
    }

    /// Create a new API key
    pub fn create(&self, input: &ApiKeyCreateInput) -> Result<ApiKeyOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/api-keys");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Delete an API key
    pub fn delete(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/api-keys/{id}");
        req.set_path_param("id", id);
        req.send_void(&self.ctx)
    }
}
