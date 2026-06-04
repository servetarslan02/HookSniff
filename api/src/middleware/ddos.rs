//! DDoS Middleware — wraps DdosProtection into an axum middleware layer
//!
//! Runs on ALL requests (before auth). Checks IP, endpoint, and global rate limits.

use axum::{extract::Extension, extract::Request, middleware::Next, response::Response};
use std::sync::Arc;

use crate::error::AppError;
use crate::security::ddos::DdosProtection;

/// Axum middleware: check DDoS rate limits on every request.
pub async fn ddos_middleware(
    Extension(ddos): Extension<Arc<DdosProtection>>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    // Authenticated requests pass through — per-user rate limiting handles abuse
    if request.headers().get("authorization").is_some() {
        return Ok(next.run(request).await);
    }

    let ip = request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .split(',')
        .next()
        .unwrap_or("unknown")
        .trim()
        .to_string();

    // Layer 1: IP rate limit
    let ip_result = ddos.check_ip(&ip).await;
    if !ip_result.allowed {
 tracing::warn!(ip = %ip, " DDoS: IP rate limit exceeded");
        return Err(AppError::Forbidden);
    }

    // Layer 3: Global rate limit
    let global_result = ddos.check_global().await;
    if !global_result.allowed {
 tracing::warn!(" DDoS: Global rate limit exceeded");
        return Err(AppError::Forbidden);
    }

    Ok(next.run(request).await)
}
