//! HookSniff API Resource: Search
//!
//! Search webhook deliveries.

use crate::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub endpoint_id: String,
    pub event: String,
    pub status: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

pub struct Search {
    ctx: HookSniffRequestContext,
}

impl Search {
    pub fn new(ctx: HookSniffRequestContext) -> Self {
        Self { ctx }
    }

    /// Search deliveries by query
    pub fn query(&self, q: &str) -> Result<Vec<SearchResult>, Box<dyn std::error::Error>> {
        let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/search");
        req.set_query_param("q", q);
        req.send(&self.ctx)
    }
}
