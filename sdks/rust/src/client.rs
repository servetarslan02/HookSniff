//! HookSniff SDK — Client
//!
//! Top-level client that exposes all API resources with a single entry point.
//!
//! ```no_run
//! use hooksniff::HookSniff;
//!
//! let client = HookSniff::new("sk_live_abc123").unwrap();
//! let endpoints = client.endpoints.list().unwrap();
//! ```

use crate::request::HookSniffRequestContext;
use crate::resources::*;
use std::time::Duration;

const DEFAULT_BASE_URL: &str = "https://hooksniff-api-1046140057667.europe-west1.run.app";

/// HookSniff SDK client.
///
/// Create with [`HookSniff::new`] for defaults, or [`HookSniff::with_options`]
/// to customize base URL, timeout, and retry count.
#[derive(Debug)]
pub struct HookSniff {
    pub endpoints: Endpoints,
    pub webhooks: Webhooks,
    pub auth: Auth,
    pub analytics: Analytics,
    pub api_keys: ApiKeys,
    pub alerts: Alerts,
    pub teams: Teams,
    pub search: Search,
    pub billing: Billing,
    pub health: Health,
}

impl HookSniff {
    /// Create a new HookSniff client with default settings.
    ///
    /// - Base URL: `https://hooksniff-api-1046140057667.europe-west1.run.app`
    /// - Timeout: 30 seconds
    /// - Retries: 2
    ///
    /// Returns `Err` if `api_key` is empty.
    pub fn new(api_key: &str) -> Result<Self, String> {
        Self::with_options(api_key, DEFAULT_BASE_URL, Duration::from_secs(30), 2)
    }

    /// Create a new HookSniff client with custom settings.
    pub fn with_options(
        api_key: &str,
        base_url: &str,
        timeout: Duration,
        num_retries: u32,
    ) -> Result<Self, String> {
        if api_key.is_empty() {
            return Err("HookSniff: apiKey is required".to_string());
        }
        let normalized_url = base_url.trim_end_matches('/').to_string();
        let ctx = HookSniffRequestContext {
            base_url: normalized_url,
            token: api_key.to_string(),
            timeout,
            num_retries,
        };
        Ok(Self {
            endpoints: Endpoints::new(ctx.clone()),
            webhooks: Webhooks::new(ctx.clone()),
            auth: Auth::new(ctx.clone()),
            analytics: Analytics::new(ctx.clone()),
            api_keys: ApiKeys::new(ctx.clone()),
            alerts: Alerts::new(ctx.clone()),
            teams: Teams::new(ctx.clone()),
            search: Search::new(ctx.clone()),
            billing: Billing::new(ctx.clone()),
            health: Health::new(ctx),
        })
    }
}
