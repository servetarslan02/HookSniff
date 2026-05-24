// Per-module allows removed — fix unused code instead of suppressing warnings.
// If a specific module genuinely needs an allow, add it there with a reason.

pub mod audit;
pub mod auth;
pub mod billing;
pub mod cache;
pub mod circuit_breaker;
pub mod config;
pub mod cortex;
pub mod crypto;
pub mod db;
pub mod email;
pub mod email_templates;
pub mod email_tests;
pub mod error;
pub mod events;
pub mod feature_flags;
pub mod http_client;
pub mod fifo;
pub mod industry;
pub mod jobs;
pub mod metrics;
pub mod middleware;
pub mod models;
pub mod notifications;
pub mod qstash;
pub mod r2;
pub mod rate_limit;
pub mod resend_email;
pub mod retry_policy;
pub mod routes;
pub mod schemas;
pub mod security_monitor;
pub mod signing;
pub mod ssrf;
pub mod telemetry;
pub mod templates;
pub mod throttle;
pub mod transform;
pub mod validation;
pub mod ws;

/// Property-based test strategies and tests.
/// Only compiled in test builds (proptest is a dev-dependency).
#[cfg(test)]
pub mod proptest_helpers;
