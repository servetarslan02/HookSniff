//! SSRF (Server-Side Request Forgery) protection.
//!
//! Validates webhook endpoint URLs before delivery.
//! Blocks requests to internal/private IPs, metadata endpoints, and localhost.
//!
//! Protected addresses:
//! - Private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
//! - Loopback: 127.0.0.0/8, ::1
//! - Link-local: 169.254.0.0/16, fe80::/10
//! - Metadata endpoints: 169.254.169.254 (AWS), metadata.google.internal (GCP)
//! - localhost, 0.0.0.0

use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};

/// SSRF validation error.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum SsrfError {
    #[error("Invalid URL: {0}")]
    InvalidUrl(String),
    #[error("DNS resolution failed: {0}")]
    DnsResolutionFailed(String),
    #[error("Blocked private/internal IP: {0}")]
    BlockedIp(IpAddr),
    #[error("Blocked metadata endpoint: {0}")]
    BlockedMetadata(String),
    #[error("Blocked localhost/loopback")]
    BlockedLocalhost,
}

/// Check if an IP address is private/internal (should be blocked for SSRF).
fn is_blocked_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            v4.is_loopback()
                || v4.is_private()
                || v4.is_link_local()
                || v4.is_broadcast()
                || v4.is_unspecified()
                || v4 == Ipv4Addr::new(169, 254, 169, 254) // AWS metadata
        }
        IpAddr::V6(v6) => {
            v6.is_loopback()
                || v6.is_unspecified()
                || is_ipv6_link_local(v6)
                || is_ipv6_mapped_ipv4(v6)
        }
    }
}

/// Check if an IPv6 address is link-local (fe80::/10).
fn is_ipv6_link_local(ip: Ipv6Addr) -> bool {
    let segments = ip.segments();
    (segments[0] & 0xffc0) == 0xfe80
}

/// Check if an IPv6 address is an IPv4-mapped IPv6 address (::ffff:0:0/96).
fn is_ipv6_mapped_ipv4(ip: Ipv6Addr) -> bool {
    let segments = ip.segments();
    segments[0] == 0
        && segments[1] == 0
        && segments[2] == 0
        && segments[3] == 0
        && segments[4] == 0
        && segments[5] == 0xffff
}

/// Blocked hostnames (metadata endpoints).
const BLOCKED_HOSTS: &[&str] = &[
    "metadata.google.internal",
    "metadata.goog",
    "localhost",
];

/// Validate a delivery URL for SSRF protection.
///
/// Parses the URL, resolves DNS, and checks that the resolved IP
/// is not a private/internal address. This prevents DNS rebinding
/// attacks where a domain resolves to a public IP during endpoint
/// creation but to a private IP during actual delivery.
pub async fn validate_delivery_url(url_str: &str) -> Result<(), SsrfError> {
    // Parse URL
    let url = url::Url::parse(url_str).map_err(|e| SsrfError::InvalidUrl(format!("{}: {}", url_str, e)))?;

    // Only allow http/https
    if url.scheme() != "http" && url.scheme() != "https" {
        return Err(SsrfError::InvalidUrl(format!(
            "Unsupported scheme: {}",
            url.scheme()
        )));
    }

    // Check hostname
    let host = url
        .host_str()
        .ok_or_else(|| SsrfError::InvalidUrl("No host in URL".to_string()))?;

    // Check blocked hostnames
    let host_lower = host.to_lowercase();
    for blocked in BLOCKED_HOSTS {
        if host_lower == *blocked {
            return Err(SsrfError::BlockedLocalhost);
        }
    }

    // Try to parse as IP first
    if let Ok(ip) = host.parse::<IpAddr>() {
        if is_blocked_ip(ip) {
            return Err(SsrfError::BlockedIp(ip));
        }
        return Ok(());
    }

    // DNS resolution
    let addrs = tokio::net::lookup_host(format!("{}:0", host))
        .await
        .map_err(|e| SsrfError::DnsResolutionFailed(format!("{}: {}", host, e)))?;

    for addr in addrs {
        if is_blocked_ip(addr.ip()) {
            return Err(SsrfError::BlockedIp(addr.ip()));
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_blocked_private_ips() {
        // These should all be blocked
        assert!(validate_delivery_url("http://10.0.0.1/webhook").await.is_err());
        assert!(validate_delivery_url("http://172.16.0.1/webhook").await.is_err());
        assert!(validate_delivery_url("http://192.168.1.1/webhook").await.is_err());
        assert!(validate_delivery_url("http://127.0.0.1/webhook").await.is_err());
        assert!(validate_delivery_url("http://0.0.0.0/webhook").await.is_err());
        assert!(validate_delivery_url("http://169.254.169.254/webhook").await.is_err());
    }

    #[tokio::test]
    async fn test_blocked_hosts() {
        assert!(validate_delivery_url("http://localhost/webhook").await.is_err());
        assert!(validate_delivery_url("http://metadata.google.internal/webhook").await.is_err());
    }

    #[tokio::test]
    async fn test_invalid_urls() {
        assert!(validate_delivery_url("not-a-url").await.is_err());
        assert!(validate_delivery_url("ftp://example.com/file").await.is_err());
    }
}
