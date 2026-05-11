//! Shared HTTP client for external API calls.
//!
//! Creating a `reqwest::Client` per request wastes resources (new connection pool,
//! DNS resolver, TLS context each time). This module provides a shared client
//! with sensible defaults that all external calls should use.

use reqwest::Client;
use std::sync::LazyLock;
use std::time::Duration;

/// Shared HTTP client for API → external service calls (OAuth, billing, email, notifications).
///
/// - 15 second timeout (connect + read)
/// - Connection pooling enabled (default pool_idle_timeout)
/// - TLS via rustls (consistent with the rest of the project)
static SHARED_CLIENT: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .timeout(Duration::from_secs(15))
        .connect_timeout(Duration::from_secs(5))
        .pool_idle_timeout(Duration::from_secs(90))
        .build()
        .expect("Failed to create shared HTTP client")
});

/// Get the shared HTTP client. Use this instead of `reqwest::Client::new()`.
pub fn get_client() -> &'static Client {
    &SHARED_CLIENT
}
