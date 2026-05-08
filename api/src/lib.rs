// Per-module allows removed — fix unused code instead of suppressing warnings.
// If a specific module genuinely needs an allow, add it there with a reason.

pub mod auth;
pub mod billing;
pub mod circuit_breaker;
pub mod config;
pub mod db;
pub mod email;
pub mod error;
pub mod events;
pub mod fifo;
pub mod industry;
pub mod jobs;
pub mod metrics;
pub mod middleware;
pub mod models;
pub mod notifications;
pub mod rate_limit;
pub mod retry_policy;
pub mod routes;
pub mod schemas;
pub mod signing;
pub mod ssrf;
pub mod telemetry;
pub mod templates;
pub mod throttle;
pub mod transform;
pub mod validation;
pub mod ws;
