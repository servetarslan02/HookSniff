//! HookSniff API Resource: Endpoints
//!
//! Manage webhook endpoints — create, list, update, delete, rotate secrets.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EndpointCreateInput {
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rate_limit: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EndpointUpdateInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rate_limit: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EndpointOutput {
    pub id: String,
    pub url: String,
    pub description: String,
    pub rate_limit: u64,
    pub active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EndpointSecretOutput {
    pub key: String,
}

pub struct Endpoints {
    ctx: HookSniffRequestContext,
}

impl Endpoints {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// List all endpoints
    pub fn list(&self) -> Result<Vec<EndpointOutput>, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints");
        req.send(&self.ctx)
    }

    /// Create a new endpoint
    pub fn create(&self, input: &EndpointCreateInput) -> Result<EndpointOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Get an endpoint by ID
    pub fn get(&self, id: &str) -> Result<EndpointOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints/{id}");
        req.set_path_param("id", id);
        req.send(&self.ctx)
    }

    /// Update an endpoint
    pub fn update(&self, id: &str, input: &EndpointUpdateInput) -> Result<EndpointOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Put, "/v1/endpoints/{id}");
        req.set_path_param("id", id);
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Delete an endpoint
    pub fn delete(&self, id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/endpoints/{id}");
        req.set_path_param("id", id);
        req.send_void(&self.ctx)
    }

    /// Rotate the signing secret for an endpoint
    pub fn rotate_secret(&self, id: &str) -> Result<EndpointSecretOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints/{id}/rotate-secret");
        req.set_path_param("id", id);
        req.send(&self.ctx)
    }
}
