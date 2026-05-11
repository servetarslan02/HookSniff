//! HookSniff API Resource: Analytics
//!
//! Delivery analytics — success rate, latency, delivery stats.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DeliveryStats {
    pub total: u64,
    pub success: u64,
    pub failed: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pending: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SuccessRateOutput {
    pub rate: f64,
    pub period: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LatencyOutput {
    pub avg_ms: f64,
    pub p50_ms: f64,
    pub p95_ms: f64,
    pub p99_ms: f64,
    pub period: String,
}

pub struct Analytics {
    ctx: HookSniffRequestContext,
}

impl Analytics {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Get delivery statistics
    pub fn deliveries(&self) -> Result<DeliveryStats, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/deliveries");
        req.send(&self.ctx)
    }

    /// Get success rate
    pub fn success_rate(&self) -> Result<SuccessRateOutput, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/success-rate");
        req.send(&self.ctx)
    }

    /// Get latency statistics
    pub fn latency(&self) -> Result<LatencyOutput, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/latency");
        req.send(&self.ctx)
    }
}
