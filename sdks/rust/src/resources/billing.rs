//! HookSniff API Resource: Billing
//!
//! Billing and subscription management.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlanOutput {
    pub plan: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub webhook_limit: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub endpoint_limit: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_usage: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpgradeInput {
    pub plan: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortalOutput {
    pub url: String,
}

#[derive(Debug)]
pub struct Billing {
    ctx: HookSniffRequestContext,
}

impl Billing {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Get current plan
    pub fn plan(&self) -> Result<PlanOutput, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/billing/plan");
        req.send(&self.ctx)
    }

    /// Upgrade plan
    pub fn upgrade(&self, input: &UpgradeInput) -> Result<PlanOutput, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/billing/upgrade");
        req.set_body(input);
        req.send(&self.ctx)
    }

    /// Get billing portal URL
    pub fn portal(&self) -> Result<PortalOutput, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Post, "/v1/billing/portal");
        req.send(&self.ctx)
    }
}
