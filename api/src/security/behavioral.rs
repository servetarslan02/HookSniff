//! Behavioral Bot Detection Engine
//!
//! Tracks request patterns over time to detect bots that evade
//! user-agent and path-based detection. Uses behavioral fingerprinting:
//! - Request timing patterns (too regular = bot)
//! - Session depth (too many pages too fast)
//! - Resource request patterns (no CSS/JS = bot)
//! - Navigation patterns (sequential paths = scanner)

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Behavioral fingerprint for an IP/session
#[derive(Debug, Clone)]
pub struct BehaviorProfile {
    pub ip: String,
    pub request_times: Vec<Instant>,
    pub paths_visited: Vec<String>,
    pub methods_used: HashMap<String, u32>,
    pub status_codes_received: HashMap<u16, u32>,
    pub avg_interval_ms: f64,
    pub interval_variance: f64,
    pub first_seen: Instant,
    pub total_requests: u32,
}

impl BehaviorProfile {
    fn new(ip: &str) -> Self {
        Self {
            ip: ip.to_string(),
            request_times: Vec::new(),
            paths_visited: Vec::new(),
            methods_used: HashMap::new(),
            status_codes_received: HashMap::new(),
            avg_interval_ms: 0.0,
            interval_variance: 0.0,
            first_seen: Instant::now(),
            total_requests: 0,
        }
    }

    /// Record a new request
    fn record_request(&mut self, path: &str, method: &str) {
        self.total_requests += 1;
        self.request_times.push(Instant::now());
        self.paths_visited.push(path.to_string());
        *self.methods_used.entry(method.to_string()).or_insert(0) += 1;

        // Keep only last 100 request times
        if self.request_times.len() > 100 {
            self.request_times.remove(0);
        }
        if self.paths_visited.len() > 200 {
            self.paths_visited.remove(0);
        }

        // Recalculate interval stats
        self.recalculate_intervals();
    }

    fn recalculate_intervals(&mut self) {
        if self.request_times.len() < 3 {
            return;
        }

        let intervals: Vec<f64> = self.request_times
            .windows(2)
            .map(|w| w[1].duration_since(w[0]).as_millis() as f64)
            .collect();

        let n = intervals.len() as f64;
        self.avg_interval_ms = intervals.iter().sum::<f64>() / n;
        let variance = intervals.iter()
            .map(|x| (x - self.avg_interval_ms).powi(2))
            .sum::<f64>() / n;
        self.interval_variance = variance;
    }

    /// Calculate bot score (0-100, higher = more likely bot)
    pub fn calculate_bot_score(&self) -> (u32, Vec<String>) {
        let mut score: u32 = 0;
        let mut reasons = Vec::new();

        // 1. Too regular timing (low variance = bot)
        if self.request_times.len() >= 5 {
            let cv = if self.avg_interval_ms > 0.0 {
                (self.interval_variance.sqrt() / self.avg_interval_ms) * 100.0
            } else {
                0.0
            };
            // CV < 10% means very regular timing (bot behavior)
            if cv < 5.0 && self.avg_interval_ms < 1000.0 {
                score += 40;
                reasons.push(format!("too_regular_timing: CV={:.1}%, avg={:.0}ms", cv, self.avg_interval_ms));
            } else if cv < 10.0 && self.avg_interval_ms < 2000.0 {
                score += 25;
                reasons.push(format!("regular_timing: CV={:.1}%, avg={:.0}ms", cv, self.avg_interval_ms));
            }
        }

        // 2. Too fast (sub-second requests)
        if self.avg_interval_ms < 100.0 && self.total_requests >= 10 {
            score += 30;
            reasons.push(format!("too_fast: avg_interval={:.0}ms", self.avg_interval_ms));
        } else if self.avg_interval_ms < 500.0 && self.total_requests >= 20 {
            score += 20;
            reasons.push(format!("fast_requests: avg_interval={:.0}ms", self.avg_interval_ms));
        }

        // 3. High request volume in short time
        let elapsed = self.first_seen.elapsed().as_secs();
        if elapsed > 0 {
            let rpm = (self.total_requests as f64 / elapsed as f64) * 60.0;
            if rpm > 100.0 {
                score += 30;
                reasons.push(format!("high_volume: {:.0} req/min", rpm));
            } else if rpm > 50.0 {
                score += 15;
                reasons.push(format!("elevated_volume: {:.0} req/min", rpm));
            }
        }

        // 4. Sequential path scanning
        let unique_paths: std::collections::HashSet<&String> = self.paths_visited.iter().collect();
        let unique_ratio = if self.paths_visited.is_empty() {
            0.0
        } else {
            unique_paths.len() as f64 / self.paths_visited.len() as f64
        };
        if unique_ratio > 0.9 && self.paths_visited.len() >= 10 {
            score += 25;
            reasons.push(format!("sequential_scanning: {:.0}% unique paths", unique_ratio * 100.0));
        }

        // 5. Only GET requests (no resource loading)
        let total_methods: u32 = self.methods_used.values().sum();
        let get_ratio = self.methods_used.get("GET").unwrap_or(&0) as f64 / total_methods.max(1) as f64;
        if get_ratio > 0.95 && total_methods >= 10 {
            score += 15;
            reasons.push(format!("only_get: {:.0}% GET requests", get_ratio * 100.0));
        }

        // 6. No typical browser patterns (no favicon, no .js, no .css)
        let has_browser_resources = self.paths_visited.iter().any(|p| {
            p.contains(".js") || p.contains(".css") || p.contains(".png")
                || p.contains(".jpg") || p.contains("favicon") || p.contains("/_next/")
        });
        if !has_browser_resources && self.paths_visited.len() >= 5 {
            score += 20;
            reasons.push("no_browser_resources: no JS/CSS/image requests".to_string());
        }

        // Cap at 100
        score = score.min(100);

        (score, reasons)
    }
}

/// Global behavioral analysis engine
pub struct BehavioralEngine {
    profiles: Arc<RwLock<HashMap<String, BehaviorProfile>>>,
    max_profiles: usize,
}

impl BehavioralEngine {
    pub fn new() -> Self {
        Self {
            profiles: Arc::new(RwLock::new(HashMap::new())),
            max_profiles: 10000,
        }
    }

    /// Record a request and return bot score
    pub async fn analyze(&self, ip: &str, path: &str, method: &str) -> (u32, Vec<String>) {
        let mut profiles = self.profiles.write().await;

        // Cleanup if too many profiles
        if profiles.len() >= self.max_profiles {
            // Remove oldest 10%
            let cutoff = Instant::now() - Duration::from_secs(3600);
            profiles.retain(|_, p| p.first_seen > cutoff);
        }

        let profile = profiles
            .entry(ip.to_string())
            .or_insert_with(|| BehaviorProfile::new(ip));

        profile.record_request(path, method);
        profile.calculate_bot_score()
    }

    /// Get profile for an IP (for debugging)
    pub async fn get_profile(&self, ip: &str) -> Option<BehaviorProfile> {
        let profiles = self.profiles.read().await;
        profiles.get(ip).cloned()
    }

    /// Cleanup old profiles
    pub async fn cleanup(&self) {
        let cutoff = Instant::now() - Duration::from_secs(3600);
        let mut profiles = self.profiles.write().await;
        profiles.retain(|_, p| p.first_seen > cutoff);
    }
}
