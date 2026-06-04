//! CORS Configuration
//!
//! Builds the CORS layer based on environment configuration.
//! In production: uses configured CORS_ORIGINS or defaults to dashboard.
//! In development: allows localhost origins.

use axum::http::{header::HeaderName, Method};
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};

use crate::config::Config;

/// Standard allowed headers for CORS requests
fn allowed_headers() -> Vec<HeaderName> {
    vec![
        axum::http::header::AUTHORIZATION,
        axum::http::header::CONTENT_TYPE,
        axum::http::header::ACCEPT,
        axum::http::header::ORIGIN,
        HeaderName::from_static("x-api-key"),
        HeaderName::from_static("x-request-id"),
        HeaderName::from_static("x-hooksniff-id"),
        HeaderName::from_static("x-hooksniff-signature"),
        HeaderName::from_static("x-hooksniff-timestamp"),
    ]
}

/// Standard allowed methods
fn allowed_methods() -> Vec<Method> {
    vec![
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::DELETE,
        Method::PATCH,
        Method::OPTIONS,
    ]
}

/// Standard exposed headers
fn exposed_headers() -> Vec<HeaderName> {
    vec![
        HeaderName::from_static("x-trace-id"),
        HeaderName::from_static("x-request-id"),
        axum::http::header::ETAG,
    ]
}

/// Build CORS layer from config
///
/// Priority:
/// 1. Explicit CORS_ORIGINS from config
/// 2. Production defaults (dashboard URLs)
/// 3. Development defaults (localhost)
pub fn build_cors_layer(cfg: &Config) -> CorsLayer {
    let origins: Vec<axum::http::HeaderValue> = cfg
        .cors_origins
        .iter()
        .filter_map(|o| o.parse().ok())
        .collect();

    let effective_origins = if origins.is_empty() {
        if cfg.is_production() {
            tracing::warn!(
 " CORS_ORIGINS not set in production — defaulting to dashboard origins"
            );
            vec![
                "https://hooksniff.vercel.app",
                "https://www.hooksniff.vercel.app",
            ]
        } else {
            vec![
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
            ]
        }
        .iter()
        .filter_map(|o| o.parse().ok())
        .collect()
    } else {
        origins
    };

    CorsLayer::new()
        .allow_origin(AllowOrigin::list(effective_origins))
        .allow_methods(allowed_methods())
        .allow_headers(AllowHeaders::list(allowed_headers()))
        .allow_credentials(true)
        .expose_headers(exposed_headers())
}
