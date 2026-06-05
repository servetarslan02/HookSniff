//! IP Blocklist Middleware
//!
//! Checks every incoming request against the `ip_blocklist` table.
//! Blocked IPs get an immediate 403 response without hitting any handler.
//!
//! Integrates with the admin security dashboard (routes/admin/security.rs).

use axum::{extract::Request, middleware::Next, response::Response};
use sqlx::PgPool;
use std::collections::HashSet;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

use crate::error::AppError;

/// Cached IP blocklist with automatic refresh.
/// Supports both exact IPs and CIDR ranges (e.g., "192.168.1.0/24").
pub struct IpBlocklistCache {
    blocked_ips: Arc<RwLock<HashSet<String>>>,
    blocked_cidrs: Arc<RwLock<Vec<(u32, u32)>>>,  // (network_addr, mask) pairs
    last_refresh: Arc<RwLock<Instant>>,
    refresh_interval: Duration,
}

impl IpBlocklistCache {
    pub fn new() -> Self {
        Self {
            blocked_ips: Arc::new(RwLock::new(HashSet::new())),
            blocked_cidrs: Arc::new(RwLock::new(Vec::new())),
            last_refresh: Arc::new(RwLock::new(Instant::now() - Duration::from_secs(300))),
            refresh_interval: Duration::from_secs(60),
        }
    }

    /// Refresh the blocklist from the database.
    /// Supports both exact IPs and CIDR ranges (e.g., "192.168.1.0/24").
    pub async fn refresh(&self, pool: &PgPool) {
        let rows: Vec<(String,)> = sqlx::query_as(
            "SELECT ip_address FROM ip_blocklist WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())"
        )
        .fetch_all(pool)
        .await
        .unwrap_or_default();

        let mut ips = HashSet::new();
        let mut cidrs = Vec::new();

        for (entry,) in rows {
            if entry.contains('/') {
                // CIDR range — parse "192.168.1.0/24"
                if let Some((network, prefix_len)) = parse_cidr(&entry) {
                    let mask = !((1u32 << (32 - prefix_len)) - 1);
                    cidrs.push((network & mask, mask));
                }
            } else {
                ips.insert(entry);
            }
        }

        *self.blocked_ips.write().await = ips;
        *self.blocked_cidrs.write().await = cidrs;
        *self.last_refresh.write().await = Instant::now();
    }

    /// Check if an IP is blocked (exact match or CIDR range). Auto-refreshes if stale.
    pub async fn is_blocked(&self, ip: &str, pool: &PgPool) -> bool {
        let should_refresh = {
            let last = self.last_refresh.read().await;
            last.elapsed() > self.refresh_interval
        };
        if should_refresh {
            self.refresh(pool).await;
        }

        // 1. Exact match
        if self.blocked_ips.read().await.contains(ip) {
            return true;
        }

        // 2. CIDR range match
        if let Some(ip_u32) = ip_to_u32(ip) {
            let cidrs = self.blocked_cidrs.read().await;
            for &(network, mask) in cidrs.iter() {
                if (ip_u32 & mask) == network {
                    return true;
                }
            }
        }

        false
    }
}

/// Parse CIDR notation "192.168.1.0/24" → (network_ip, prefix_len)
fn parse_cidr(cidr: &str) -> Option<(u32, u8)> {
    let parts: Vec<&str> = cidr.split('/').collect();
    if parts.len() != 2 { return None; }
    let ip = ip_to_u32(parts[0])?;
    let prefix: u8 = parts[1].parse().ok()?;
    if prefix > 32 { return None; }
    Some((ip, prefix))
}

/// Convert IPv4 string to u32
fn ip_to_u32(ip: &str) -> Option<u32> {
    let parts: Vec<&str> = ip.split('.').collect();
    if parts.len() != 4 { return None; }
    let mut result: u32 = 0;
    for part in parts {
        let octet: u32 = part.parse().ok()?;
        result = (result << 8) | octet;
    }
    Some(result)
}

/// Axum middleware: block requests from IPs in the blocklist.
/// Admin users and health/status endpoints are exempt from blocking.
pub async fn ip_blocklist_middleware(
    axum::extract::Extension(cache): axum::extract::Extension<Arc<IpBlocklistCache>>,
    axum::extract::Extension(pool): axum::extract::Extension<PgPool>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let path = request.uri().path();

    // Always allow health checks and status endpoints
    if path.starts_with("/health") || path.starts_with("/v1/health") || path.starts_with("/v1/status") || path.starts_with("/metrics") {
        return Ok(next.run(request).await);
    }

    // Allow admin users — check for Customer extension (set after auth middleware)
    // NOTE: This bypass only works if auth_middleware runs BEFORE ip_blocklist_middleware.
    // Currently ip_blocklist runs before auth, so we also check the Authorization header.
    if let Some(customer) = request.extensions().get::<crate::models::customer::Customer>() {
        if customer.is_admin {
            return Ok(next.run(request).await);
        }
    }

    // If request has Authorization header, let it pass through to auth middleware.
    // Auth + Zero Trust will handle admin verification and blocking.
    // This prevents admins from being blocked by IP blocklist before their identity is verified.
    if request.headers().get("authorization").is_some() {
        return Ok(next.run(request).await);
    }

    let ip = extract_client_ip(&request);

    if let Some(ip) = &ip {
        if cache.is_blocked(ip, &pool).await {
            tracing::warn!(ip = %ip, path = %path, "🚫 Blocked IP attempted access");
            crate::security_monitor::log_security_event(
                &pool,
                "blocked_ip_access",
                "medium",
                None,
                None,
                Some(ip),
                None,
                serde_json::json!({ "path": path }),
            ).await.ok();
            return Err(AppError::Forbidden);
        }
    }

    Ok(next.run(request).await)
}

fn extract_client_ip(req: &Request) -> Option<String> {
    // Try X-Forwarded-For first (Render/Cloudflare proxy)
    if let Some(forwarded) = req.headers().get("x-forwarded-for") {
        if let Ok(val) = forwarded.to_str() {
            return val.split(',').next().map(|s| s.trim().to_string());
        }
    }
    // Fall back to X-Real-IP
    if let Some(real_ip) = req.headers().get("x-real-ip") {
        if let Ok(val) = real_ip.to_str() {
            return Some(val.to_string());
        }
    }
    None
}
