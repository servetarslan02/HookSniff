//! HookSniff API Resource: Health
//!
//! API health check.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthOutput {
    pub status: String,
    pub version: Option<String>,
    pub uptime: Option<u64>,
}

#[derive(Debug)]
pub struct Health {
    ctx: HookSniffRequestContext,
}

impl Health {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Check API health
    pub fn check(&self) -> Result<HealthOutput, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/health");
        req.send(&self.ctx)
    }
}
