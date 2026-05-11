//! HookSniff API Resource: API Keys
//!
//! Manage API keys — create, list, delete.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

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
