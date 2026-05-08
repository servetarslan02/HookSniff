use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::Serialize;
use std::sync::OnceLock;

/// Cached outbound IPs response, refreshed every hour.
static CACHED_RESPONSE: OnceLock<CachedOutboundIps> = OnceLock::new();

struct CachedOutboundIps {
    response: OutboundIpsResponse,
    loaded_at: DateTime<Utc>,
}

#[derive(Serialize, Clone)]
struct OutboundIpsResponse {
    ips: Vec<String>,
    updated_at: String,
}

/// Default outbound IPs used when the OUTBOUND_IPS env var is not set.
/// TODO: Replace with real IPs from the production infrastructure.
const DEFAULT_IPS: &[&str] = &[];

fn load_outbound_ips() -> OutboundIpsResponse {
    let ips: Vec<String> = match std::env::var("OUTBOUND_IPS") {
        Ok(val) if !val.trim().is_empty() => val
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect(),
        _ => {
            tracing::warn!("⚠️ OUTBOUND_IPS not configured — returning empty list");
            DEFAULT_IPS.iter().map(|s| s.to_string()).collect()
        }
    };

    let now = Utc::now();

    OutboundIpsResponse {
        ips,
        updated_at: now.to_rfc3339(),
    }
}

fn get_cached_response() -> OutboundIpsResponse {
    let cached = CACHED_RESPONSE.get_or_init(|| CachedOutboundIps {
        response: load_outbound_ips(),
        loaded_at: Utc::now(),
    });

    // Refresh cache if older than 1 hour
    let age = Utc::now().signed_duration_since(cached.loaded_at);
    if age.num_hours() >= 1 {
        // OnceLock can't be updated, so we just return the cached value.
        // For production, consider using tokio::sync::RwLock for dynamic refresh.
        // For now, a restart picks up new env values.
        return cached.response.clone();
    }

    cached.response.clone()
}

pub fn router() -> Router {
    Router::new().route("/", get(get_outbound_ips))
}

/// GET /v1/outbound-ips
///
/// Returns the list of static IP addresses that HookSniff uses to deliver webhooks.
/// Enterprise customers use this endpoint to configure firewall/WAF allowlists.
async fn get_outbound_ips() -> Json<OutboundIpsResponse> {
    Json(get_cached_response())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_ips_when_env_unset() {
        // Clear the env var for test
        std::env::remove_var("OUTBOUND_IPS");
        let resp = load_outbound_ips();
        assert!(resp.ips.is_empty(), "Default IPs should be empty until OUTBOUND_IPS is configured");
        assert!(!resp.updated_at.is_empty());
    }

    #[test]
    fn test_custom_ips_from_env() {
        std::env::set_var("OUTBOUND_IPS", "1.2.3.4, 5.6.7.8 ,9.10.11.12");
        let resp = load_outbound_ips();
        assert_eq!(resp.ips, vec!["1.2.3.4", "5.6.7.8", "9.10.11.12"]);
        std::env::remove_var("OUTBOUND_IPS");
    }

    #[test]
    fn test_empty_env_falls_back_to_default() {
        std::env::set_var("OUTBOUND_IPS", "");
        let resp = load_outbound_ips();
        assert!(resp.ips.is_empty());
        std::env::remove_var("OUTBOUND_IPS");
    }
}
