use axum::routing::get;
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::Serialize;
use std::sync::{LazyLock, RwLock};

/// Cached outbound IPs response, refreshed every 5 minutes.
static CACHED_RESPONSE: LazyLock<RwLock<CachedOutboundIps>> =
    LazyLock::new(|| RwLock::new(CachedOutboundIps::load()));

struct CachedOutboundIps {
    response: OutboundIpsResponse,
    loaded_at: DateTime<Utc>,
}

#[derive(Serialize, Clone)]
struct OutboundIpsResponse {
    ips: Vec<String>,
    updated_at: String,
}

/// Default outbound IPs — set OUTBOUND_IPS env var with comma-separated IPs.
/// Returns empty list when not configured (warning logged at startup).
const DEFAULT_IPS: &[&str] = &[];

/// Cache TTL in seconds (5 minutes).
const CACHE_TTL_SECS: i64 = 300;

impl CachedOutboundIps {
    fn load() -> Self {
        let response = load_outbound_ips();
        CachedOutboundIps {
            response,
            loaded_at: Utc::now(),
        }
    }

    fn get(&mut self) -> OutboundIpsResponse {
        let age = Utc::now().signed_duration_since(self.loaded_at);
        if age.num_seconds() >= CACHE_TTL_SECS {
            *self = Self::load();
        }
        self.response.clone()
    }
}

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

pub fn router() -> Router {
    Router::new().route("/", get(get_outbound_ips))
}

/// GET /v1/outbound-ips
///
/// Returns the list of static IP addresses that HookSniff uses to deliver webhooks.
/// Enterprise customers use this endpoint to configure firewall/WAF allowlists.
async fn get_outbound_ips() -> Json<OutboundIpsResponse> {
    let mut cached = CACHED_RESPONSE
        .write()
        .expect("outbound_ips cache lock poisoned");
    Json(cached.get())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_ips_when_env_unset() {
        // Clear the env var for test
        std::env::remove_var("OUTBOUND_IPS");
        let resp = load_outbound_ips();
        assert!(
            resp.ips.is_empty(),
            "Default IPs should be empty until OUTBOUND_IPS is configured"
        );
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

    #[test]
    fn test_cache_ttl_constant() {
        assert_eq!(CACHE_TTL_SECS, 300, "Cache TTL should be 5 minutes");
    }
}
