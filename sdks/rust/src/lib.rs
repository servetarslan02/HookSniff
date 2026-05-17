//! HookSniff Rust SDK
//!
//! Adapted from Svix SDK architecture.

use std::{sync::Arc, time::Duration};

use hyper::body::Bytes;
use hyper_util::client::legacy::Client as HyperClient;

pub mod api;
mod connector;
pub mod error;
pub mod models;
pub mod model_ext;
pub mod request;
pub mod webhooks;

pub use api::HookSniff;
pub use error::Error;
pub use webhooks::Webhook;

pub(crate) use connector::{make_connector, Connector};

pub struct Configuration {
    pub base_path: String,
    pub user_agent: Option<String>,
    pub bearer_access_token: Option<String>,
    pub timeout: Option<Duration>,
    pub num_retries: u32,
    pub retry_schedule: Option<Vec<Duration>>,
    pub(crate) client: HyperClient<Connector, http_body_util::Full<Bytes>>,
}

/// The default base URL for the HookSniff API.
pub const DEFAULT_SERVER_URL: &str = "https://api.hooksniff.com";
