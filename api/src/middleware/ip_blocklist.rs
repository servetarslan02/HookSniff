//! IP Blocklist Middleware
//!
//! Checks every incoming request against the `ip_blocks` table.
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
pub struct IpBlocklistCache {
    blocked_ips: Arc<RwLock<HashSet<String>>>,
    last_refresh: Arc<RwLock<Instant>>,
    refresh_interval: Duration,
}

impl IpBlocklistCache {
    pub fn new() -> Self {
        Self {
            blocked_ips: Arc::new(RwLock::new(HashSet::new())),
            last_refresh: Arc::new(RwLock::new(Instant::now() - Duration::from_secs(300))),
            refresh_interval: Duration::from_secs(60),
        }
    }

    /// Refresh the blocklist from the database.
    pub async fn refresh(&self, pool: &PgPool) {
        let rows: Vec<(String,)> = sqlx::query_as(
            "SELECT ip_address FROM ip_blocks WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())"
        )
        .fetch_all(pool)
        .await
        .unwrap_or_default();

        let ips: HashSet<String> = rows.into_iter().map(|(ip,)| ip).collect();
        *self.blocked_ips.write().await = ips;
        *self.last_refresh.write().await = Instant::now();
    }

    /// Check if an IP is blocked. Auto-refreshes if stale.
    pub async fn is_blocked(&self, ip: &str, pool: &PgPool) -> bool {
        // Auto-refresh if stale
        let should_refresh = {
            let last = self.last_refresh.read().await;
            last.elapsed() > self.refresh_interval
        };
        if should_refresh {
            self.refresh(pool).await;
        }

        self.blocked_ips.read().await.contains(ip)
    }
}

/// Axum middleware: block requests from IPs in the blocklist.
pub async fn ip_blocklist_middleware(
    axum::extract::Extension(cache): axum::extract::Extension<Arc<IpBlocklistCache>>,
    axum::extract::Extension(pool): axum::extract::Extension<PgPool>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let ip = extract_client_ip(&request);

    if let Some(ip) = &ip {
        if cache.is_blocked(ip, &pool).await {
            tracing::warn!(ip = %ip, "🚫 Blocked IP attempted access");
            crate::security_monitor::log_security_event(
                &pool,
                "blocked_ip_access",
                "medium",
                None,
                None,
                Some(ip),
                None,
                serde_json::json!({ "path": request.uri().path() }),
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
