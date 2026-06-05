//! IP Reputation Engine
//!
//! Multi-source IP reputation checking:
//! - Internal reputation (from our own security_events)
//! - CIDR-based known bad ranges
//! - AbuseIPDB integration (when API key available)
//!
//! Each IP gets a reputation score 0-100 (higher = more dangerous).

use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// IP reputation result
#[derive(Debug, Clone)]
pub struct IpReputation {
    pub ip: String,
    pub score: u32,           // 0-100 (100 = definitely malicious)
    pub source: String,       // "internal", "cidr_block", "abuseipdb"
    pub reason: String,
    pub is_known_bad: bool,
}

/// Cached reputation entries
struct ReputationCache {
    entries: HashMap<String, (IpReputation, std::time::Instant)>,
    ttl: std::time::Duration,
}

impl ReputationCache {
    fn new(ttl_secs: u64) -> Self {
        Self {
            entries: HashMap::new(),
            ttl: std::time::Duration::from_secs(ttl_secs),
        }
    }

    fn get(&self, ip: &str) -> Option<&IpReputation> {
        let (rep, cached_at) = self.entries.get(ip)?;
        if cached_at.elapsed() > self.ttl {
            return None;
        }
        Some(rep)
    }

    fn set(&mut self, rep: IpReputation) {
        self.entries.insert(rep.ip.clone(), (rep, std::time::Instant::now()));
    }
}

/// Global IP reputation engine
pub struct IpReputationEngine {
    cache: Arc<RwLock<ReputationCache>>,
}

impl IpReputationEngine {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(RwLock::new(ReputationCache::new(300))), // 5 min cache
        }
    }

    /// Check IP reputation from all sources
    pub async fn check(&self, pool: &PgPool, ip: &str) -> IpReputation {
        // 1. Check cache
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.get(ip) {
                return cached.clone();
            }
        }

        // 2. Check internal reputation (from our security_events)
        let internal = self.check_internal(pool, ip).await;
        if internal.score >= 70 {
            let mut cache = self.cache.write().await;
            cache.set(internal.clone());
            return internal;
        }

        // 3. Check CIDR block ranges (known malicious)
        let cidr = self.check_cidr_blocks(ip);
        if cidr.score >= 70 {
            let mut cache = self.cache.write().await;
            cache.set(cidr.clone());
            return cidr;
        }

        // 4. Check AbuseIPDB (if API key available)
        if let Ok(api_key) = std::env::var("ABUSEIPDB_API_KEY") {
            if !api_key.is_empty() {
                let abuse = self.check_abuseipdb(ip, &api_key).await;
                if abuse.score > internal.score {
                    let mut cache = self.cache.write().await;
                    cache.set(abuse.clone());
                    return abuse;
                }
            }
        }

        // 5. Return internal result (may be clean)
        let mut cache = self.cache.write().await;
        cache.set(internal.clone());
        internal
    }

    /// Check internal security events for this IP
    async fn check_internal(&self, pool: &PgPool, ip: &str) -> IpReputation {
        let result: Option<(i64, i64, i64)> = sqlx::query_as(
            r#"SELECT
                COUNT(*) as total_events,
                COUNT(*) FILTER (WHERE severity IN ('high', 'critical')) as high_events,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as recent_events
            FROM security_events
            WHERE ip_address = $1"#
        )
        .bind(ip)
        .fetch_optional(pool)
        .await
        .unwrap_or(None);

        let (total, high, recent) = result.unwrap_or((0, 0, 0));

        let score = if total == 0 {
            0
        } else if high >= 10 || recent >= 20 {
            95 // Definitely malicious
        } else if high >= 5 || recent >= 10 {
            80 // Very suspicious
        } else if high >= 2 || recent >= 5 {
            60 // Suspicious
        } else if total >= 3 {
            30 // Some activity
        } else {
            10 // Minimal
        };

        IpReputation {
            ip: ip.to_string(),
            score,
            source: "internal".to_string(),
            reason: format!("{} total events, {} high/critical, {} in 24h", total, high, recent),
            is_known_bad: score >= 70,
        }
    }

    /// Check against known malicious CIDR ranges
    fn check_cidr_blocks(&self, ip: &str) -> IpReputation {
        // Known malicious hosting/providers commonly used by attackers
        let bad_cidrs: Vec<(&str, &str, u32)> = vec![
            // Tor exit nodes (common ranges)
            ("185.220.100.0/22", "Tor exit node range", 60),
            ("185.220.101.0/24", "Tor exit node", 70),
            // Known bulletproof hosting
            ("194.87.0.0/16", "Known bulletproof hosting", 65),
            ("195.123.0.0/16", "Known bulletproof hosting", 60),
            // Google Cloud metadata (SSRF target)
            ("169.254.169.254/32", "Cloud metadata endpoint", 100),
            // AWS metadata
            ("169.254.169.254/32", "Cloud metadata endpoint", 100),
        ];

        let ip_u32 = match ip_to_u32(ip) {
            Some(v) => v,
            None => return IpReputation {
                ip: ip.to_string(),
                score: 0,
                source: "cidr_block".to_string(),
                reason: "Invalid IP format".to_string(),
                is_known_bad: false,
            },
        };

        for (cidr, reason, score) in &bad_cidrs {
            if let Some((network, prefix_len)) = parse_cidr(cidr) {
                let mask = !((1u32 << (32 - prefix_len)) - 1);
                if (ip_u32 & mask) == (network & mask) {
                    return IpReputation {
                        ip: ip.to_string(),
                        score: *score,
                        source: "cidr_block".to_string(),
                        reason: reason.to_string(),
                        is_known_bad: *score >= 70,
                    };
                }
            }
        }

        IpReputation {
            ip: ip.to_string(),
            score: 0,
            source: "cidr_block".to_string(),
            reason: "Not in known bad CIDR ranges".to_string(),
            is_known_bad: false,
        }
    }

    /// Check AbuseIPDB API
    async fn check_abuseipdb(&self, ip: &str, api_key: &str) -> IpReputation {
        let url = format!(
            "https://api.abuseipdb.com/api/v2/check?ipAddress={}&maxAgeInDays=90&verbose",
            ip
        );

        let client = reqwest::Client::new();
        let response = client
            .get(&url)
            .header("Key", api_key)
            .header("Accept", "application/json")
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await;

        match response {
            Ok(resp) if resp.status().is_success() => {
                if let Ok(body) = resp.json::<serde_json::Value>().await {
                    let data = &body["data"];
                    let abuse_score = data["abuseConfidenceScore"].as_u64().unwrap_or(0) as u32;
                    let total_reports = data["totalReports"].as_u64().unwrap_or(0);
                    let country = data["countryCode"].as_str().unwrap_or("??");
                    let isp = data["isp"].as_str().unwrap_or("unknown");

                    IpReputation {
                        ip: ip.to_string(),
                        score: abuse_score,
                        source: "abuseipdb".to_string(),
                        reason: format!("{} reports, country: {}, ISP: {}", total_reports, country, isp),
                        is_known_bad: abuse_score >= 70,
                    }
                } else {
                    IpReputation {
                        ip: ip.to_string(),
                        score: 0,
                        source: "abuseipdb".to_string(),
                        reason: "Failed to parse response".to_string(),
                        is_known_bad: false,
                    }
                }
            }
            _ => IpReputation {
                ip: ip.to_string(),
                score: 0,
                source: "abuseipdb".to_string(),
                reason: "API unavailable".to_string(),
                is_known_bad: false,
            },
        }
    }
}

/// Parse CIDR notation
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
