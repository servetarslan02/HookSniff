//! HookSniff API Resource: Alerts
//!
//! Alert rules and notifications.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AlertRule {
    pub id: String,
    pub name: String,
    pub condition: String,
    pub threshold: f64,
    pub enabled: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AlertNotification {
    pub id: String,
    pub rule_id: String,
    pub message: String,
    pub read: bool,
    pub created_at: String,
}

#[derive(Debug)]
pub struct Alerts {
    ctx: HookSniffRequestContext,
}

impl Alerts {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Get alert rules
    pub fn rules(&self) -> Result<Vec<AlertRule>, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/alerts/rules");
        req.send(&self.ctx)
    }

    /// Get alert notifications
    pub fn notifications(&self) -> Result<Vec<AlertNotification>, Box<dyn std::error::Error>> {
        let req = HookSniffRequest::new(HttpMethod::Get, "/v1/alerts/notifications");
        req.send(&self.ctx)
    }
}
