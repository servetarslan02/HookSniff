//! SSRF (Server-Side Request Forgery) Koruması
//!
//! Webhook endpoint URL'lerini teslimattan önce kontrol eder.
//! Internal/private IP'lere yapılan istekleri engeller.
//!
//! ## Korunan adresler
//! - Private IP aralıkları: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
//! - Loopback: 127.0.0.0/8, ::1
//! - Link-local: 169.254.0.0/16, fe80::/10
//! - Metadata endpoint'leri: 169.254.169.254 (AWS), metadata.google.internal (GCP)
//! - localhost, 0.0.0.0

use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};

/// SSRF doğrulama hatası
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SsrfError {
    /// URL parse edilemedi
    InvalidUrl(String),
    /// DNS çözümleme başarısız
    DnsResolutionFailed(String),
    /// Private/internal IP'ye istek engellendi
    BlockedIp(IpAddr),
    /// Metadata endpoint engellendi
    BlockedMetadata(String),
    /// localhost engellendi
    BlockedLocalhost,
}

impl std::fmt::Display for SsrfError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidUrl(url) => write!(f, "Invalid URL: {}", url),
            Self::DnsResolutionFailed(host) => write!(f, "DNS resolution failed: {}", host),
            Self::BlockedIp(ip) => write!(f, "Blocked private/internal IP: {}", ip),
            Self::BlockedMetadata(host) => write!(f, "Blocked metadata endpoint: {}", host),
            Self::BlockedLocalhost => write!(f, "Blocked localhost/loopback"),
        }
    }
}

impl std::error::Error for SsrfError {}

/// Metadata endpoint'leri
const METADATA_HOSTS: &[&str] = &[
    "metadata.google.internal",
    "metadata.goog",
];

/// Metadata IP'leri
const METADATA_IPS: &[&str] = &[
    "169.254.169.254",  // AWS, GCP, Azure
    "fd00:ec2::254",    // AWS IPv6
];

/// URL'in SSRF saldırılarına karşı güvenli olup olmadığını kontrol et.
///
/// Kontrol edilenler:
/// 1. URL parse
/// 2. Host adı metadata endpoint mi?
/// 3. Host IP'ye resolve edilir, IP private mı?
/// 4. localhost/loopback engelleme
pub fn validate_url(url: &str) -> Result<(), SsrfError> {
    let parsed = url::Url::parse(url).map_err(|e| SsrfError::InvalidUrl(format!("{}: {}", url, e)))?;

    let host_str = parsed.host_str().ok_or_else(|| SsrfError::InvalidUrl("No host in URL".into()))?;

    // localhost kontrolü
    if host_str == "localhost" || host_str == "0.0.0.0" || host_str == "[::1]" {
        return Err(SsrfError::BlockedLocalhost);
    }

    // Metadata host kontrolü
    for metadata_host in METADATA_HOSTS {
        if host_str == *metadata_host || host_str.ends_with(&format!(".{}", metadata_host)) {
            return Err(SsrfError::BlockedMetadata(host_str.to_string()));
        }
    }

    // IP adresi mi?
    if let Ok(ip) = host_str.parse::<IpAddr>() {
        return check_ip(&ip);
    }

    // DNS çözümleme
    let addrs: Vec<IpAddr> = std::net::ToSocketAddrs::to_socket_addrs(&(host_str, 0))
        .map_err(|_| SsrfError::DnsResolutionFailed(host_str.to_string()))?
        .map(|addr| addr.ip())
        .collect();

    if addrs.is_empty() {
        return Err(SsrfError::DnsResolutionFailed(host_str.to_string()));
    }

    // Tüm resolve edilen IP'leri kontrol et
    for ip in &addrs {
        check_ip(ip)?;
    }

    Ok(())
}

/// Tek bir IP adresinin private/internal olup olmadığını kontrol et
fn check_ip(ip: &IpAddr) -> Result<(), SsrfError> {
    match ip {
        IpAddr::V4(ipv4) => check_ipv4(ipv4),
        IpAddr::V6(ipv6) => check_ipv6(ipv6),
    }
}

/// IPv4 adres kontrolü
fn check_ipv4(ip: &Ipv4Addr) -> Result<(), SsrfError> {
    // Loopback: 127.0.0.0/8
    if ip.is_loopback() {
        return Err(SsrfError::BlockedIp(IpAddr::V4(*ip)));
    }

    // Private: 10.0.0.0/8
    if ip.octets()[0] == 10 {
        return Err(SsrfError::BlockedIp(IpAddr::V4(*ip)));
    }

    // Private: 172.16.0.0/12
    if ip.octets()[0] == 172 && (ip.octets()[1] & 0xF0) == 16 {
        return Err(SsrfError::BlockedIp(IpAddr::V4(*ip)));
    }

    // Private: 192.168.0.0/16
    if ip.octets()[0] == 192 && ip.octets()[1] == 168 {
        return Err(SsrfError::BlockedIp(IpAddr::V4(*ip)));
    }

    // Link-local: 169.254.0.0/16
    if ip.octets()[0] == 169 && ip.octets()[1] == 254 {
        return Err(SsrfError::BlockedIp(IpAddr::V4(*ip)));
    }

    // 0.0.0.0
    if ip.is_unspecified() {
        return Err(SsrfError::BlockedIp(IpAddr::V4(*ip)));
    }

    // Metadata IP'leri
    for metadata_ip in METADATA_IPS {
        if let Ok(metadata) = metadata_ip.parse::<IpAddr>() {
            if IpAddr::V4(*ip) == metadata {
                return Err(SsrfError::BlockedMetadata(ip.to_string()));
            }
        }
    }

    Ok(())
}

/// IPv6 adres kontrolü
fn check_ipv6(ip: &Ipv6Addr) -> Result<(), SsrfError> {
    // Loopback: ::1
    if ip.is_loopback() {
        return Err(SsrfError::BlockedIp(IpAddr::V6(*ip)));
    }

    // Unspecified: ::
    if ip.is_unspecified() {
        return Err(SsrfError::BlockedIp(IpAddr::V6(*ip)));
    }

    // Link-local: fe80::/10
    if (ip.segments()[0] & 0xFFC0) == 0xFE80 {
        return Err(SsrfError::BlockedIp(IpAddr::V6(*ip)));
    }

    // Unique local: fc00::/7
    if (ip.segments()[0] & 0xFE00) == 0xFC00 {
        return Err(SsrfError::BlockedIp(IpAddr::V6(*ip)));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_public_url() {
        assert!(validate_url("https://example.com/webhook").is_ok());
        assert!(validate_url("https://api.stripe.com/webhook").is_ok());
        assert!(validate_url("https://hooks.slack.com/xxx").is_ok());
    }

    #[test]
    fn test_blocks_private_ipv4() {
        assert!(validate_url("http://10.0.0.1/webhook").is_err());
        assert!(validate_url("http://172.16.0.1/webhook").is_err());
        assert!(validate_url("http://192.168.1.1/webhook").is_err());
    }

    #[test]
    fn test_blocks_loopback() {
        assert!(validate_url("http://127.0.0.1/webhook").is_err());
        assert!(validate_url("http://localhost/webhook").is_err());
        assert!(validate_url("http://[::1]/webhook").is_err());
    }

    #[test]
    fn test_blocks_link_local() {
        assert!(validate_url("http://169.254.169.254/latest/meta-data/").is_err());
        assert!(validate_url("http://169.254.1.1/webhook").is_err());
    }

    #[test]
    fn test_blocks_metadata() {
        assert!(validate_url("http://metadata.google.internal/").is_err());
    }

    #[test]
    fn test_blocks_zero() {
        assert!(validate_url("http://0.0.0.0/webhook").is_err());
    }

    #[test]
    fn test_blocks_private_ipv6() {
        assert!(validate_url("http://[fc00::1]/webhook").is_err());
        assert!(validate_url("http://[fe80::1]/webhook").is_err());
    }

    #[test]
    fn test_invalid_url() {
        assert!(validate_url("not-a-url").is_err());
        assert!(validate_url("").is_err());
    }
}
