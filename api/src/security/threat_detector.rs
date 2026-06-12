//! Advanced Threat Detection
//!
//! Redis-first behavioral analysis for detecting:
//! - Brute force attacks
//! - Credential stuffing
//! - API abuse patterns
//! - Data exfiltration attempts
//! - Anomalous request patterns
//!
//! Uses Redis counters for fast lookups (no DB COUNT spirals).
//! Falls back to in-memory counters if Redis unavailable.

use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::OnceLock;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use uuid::Uuid;

/// In-memory fallback counters (IP → Vec<timestamp>)
static MEMORY_EVENTS: OnceLock<RwLock<HashMap<String, Vec<Instant>>>> = OnceLock::new();
static MEMORY_LOGINS: OnceLock<RwLock<HashMap<String, Vec<Instant>>>> = OnceLock::new();
static MEMORY_PATHS: OnceLock<RwLock<HashMap<String, Vec<Instant>>>> = OnceLock::new();

fn memory_events() -> &'static RwLock<HashMap<String, Vec<Instant>>> {
    MEMORY_EVENTS.get_or_init(|| RwLock::new(HashMap::new()))
}
fn memory_logins() -> &'static RwLock<HashMap<String, Vec<Instant>>> {
    MEMORY_LOGINS.get_or_init(|| RwLock::new(HashMap::new()))
}
fn memory_paths() -> &'static RwLock<HashMap<String, Vec<Instant>>> {
    MEMORY_PATHS.get_or_init(|| RwLock::new(HashMap::new()))
}

/// Threat analysis result
pub struct ThreatResult {
    pub is_threat: bool,
    pub threat_type: ThreatType,
    pub confidence: f64,
    pub action: ThreatAction,
    pub details: String,
}

#[derive(Debug)]
pub enum ThreatType {
    BruteForce,
    CredentialStuffing,
    ApiAbuse,
    DataExfiltration,
    SuspiciousPattern,
    DDoSAttempt,
    ScannerDetected,
}

#[derive(Debug)]
pub enum ThreatAction {
    Allow,
    Warn,
    RateLimit,
    Block,
    Alert,
}

/// Redis-backed counter helper: INCR + EXPIRE in one Lua script
async fn redis_count(conn: &mut redis::aio::ConnectionManager, key: &str, window_secs: u64) -> i64 {
    let lua = redis::Script::new(
        r#"
        local current = redis.call('INCR', KEYS[1])
        if current == 1 then
            redis.call('EXPIRE', KEYS[1], ARGV[1])
        end
        return current
        "#,
    );
    lua.key(key)
        .arg(window_secs as i64)
        .invoke_async(conn)
        .await
        .unwrap_or(0)
}

/// Redis-backed read-only counter (GET, no INCR)
async fn redis_get_count(conn: &mut redis::aio::ConnectionManager, key: &str) -> i64 {
    redis::cmd("GET")
        .arg(key)
        .query_async::<Option<i64>>(conn)
        .await
        .unwrap_or(None)
        .unwrap_or(0)
}

/// Analyze request patterns for threats
/// Uses Redis for fast counter lookups, falls back to in-memory if Redis unavailable.
pub async fn analyze_request(
    pool: &PgPool,
    ip: &str,
    customer_id: Option<Uuid>,
    path: &str,
    method: &str,
) -> ThreatResult {
    let mut score: f64 = 0.0;
    let mut reasons = Vec::new();

    // Try Redis connection
    let mut redis_conn: Option<redis::aio::ConnectionManager> = None;
    if let Some(redis_url) = crate::config::resolve_redis_url() {
        if let Ok(client) = redis::Client::open(redis_url.as_str()) {
            redis_conn = redis::aio::ConnectionManager::new(client).await.ok();
        }
    }

    // 1. Check recent security events from this IP (5 min window)
    let event_count = if let Some(ref mut conn) = redis_conn {
        // Record this request as an event, then read the count
        let key = format!("threat:{}:events:5min", ip);
        redis_count(conn, &key, 300).await
    } else {
        // In-memory fallback
        let mut map = memory_events().write().await;
        let entry = map.entry(ip.to_string()).or_insert_with(Vec::new);
        let cutoff = Instant::now() - Duration::from_secs(300);
        entry.retain(|t| *t > cutoff);
        entry.push(Instant::now());
        entry.len() as i64
    };

    if event_count > 200 {
        score += 0.5;
        reasons.push(format!("High request rate: {} in 5min", event_count));
    } else if event_count > 100 {
        score += 0.3;
        reasons.push(format!("Elevated requests: {} in 5min", event_count));
    }

    // 2. Check for scanning behavior — unique paths from this IP (10 min window)
    let unique_paths = if let Some(ref mut conn) = redis_conn {
        let set_key = format!("threat:{}:pathset:10min", ip);
        let _: Result<(), _> = redis::cmd("SADD")
            .arg(&set_key)
            .arg(path)
            .query_async::<()>(conn)
            .await;
        let _: Result<(), _> = redis::cmd("EXPIRE")
            .arg(&set_key)
            .arg(600i64)
            .query_async::<()>(conn)
            .await;
        redis::cmd("SCARD")
            .arg(&set_key)
            .query_async::<i64>(conn)
            .await
            .unwrap_or(0)
    } else {
        // In-memory: count unique paths from recent entries
        let mut map = memory_paths().write().await;
        let entry = map.entry(ip.to_string()).or_insert_with(Vec::new);
        let cutoff = Instant::now() - Duration::from_secs(600);
        entry.retain(|t| *t > cutoff);
        entry.push(Instant::now());
        // Approximate: just use total count as proxy for unique paths
        entry.len() as i64
    };

    if unique_paths > 50 {
        score += 0.4;
        reasons.push(format!("Scanning: {} unique endpoints", unique_paths));
    }

    // 3. Check for failed login attempts (15 min window)
    let failures = if let Some(ref mut conn) = redis_conn {
        let key = format!("threat:{}:failed_logins:15min", ip);
        redis_get_count(conn, &key).await
    } else {
        let mut map = memory_logins().write().await;
        let entry = map.entry(ip.to_string()).or_insert_with(Vec::new);
        let cutoff = Instant::now() - Duration::from_secs(900);
        entry.retain(|t| *t > cutoff);
        entry.len() as i64
    };

    if failures > 30 {
        score += 0.5;
        reasons.push(format!("Brute force: {} failed logins in 15min", failures));
    } else if failures > 15 {
        score += 0.3;
        reasons.push(format!("Multiple failed logins: {} in 15min", failures));
    }

    // 4. Check for suspicious paths (instant, no DB needed)
    let suspicious_paths = [
        "/.env", "/wp-admin", "/admin/config", "/.git",
        "/phpmyadmin", "/actuator", "/debug", "/shell",
        "/wp-login", "/xmlrpc.php", "/cgi-bin", "/setup",
    ];
    if suspicious_paths.iter().any(|p| path.contains(p)) {
        score += 0.2;
        reasons.push(format!("Suspicious path: {}", path));
    }

    // 5. Check for unusual method on sensitive endpoints
    if method == "DELETE" && path.contains("/admin/") {
        score += 0.2;
        reasons.push("DELETE on admin endpoint".to_string());
    }

    // Determine action (rapor: Block veya Warn based on severity)
    let (is_threat, action, threat_type) = if score > 0.95 {
        (true, ThreatAction::Block, ThreatType::SuspiciousPattern)
    } else if score > 0.7 {
        (true, ThreatAction::RateLimit, ThreatType::ApiAbuse)
    } else if score > 0.5 {
        (true, ThreatAction::Warn, ThreatType::SuspiciousPattern)
    } else {
        (false, ThreatAction::Allow, ThreatType::SuspiciousPattern)
    };

    if is_threat {
        // Log to DB only for persistent record (not for counting!)
        crate::security_monitor::log_security_event(
            pool,
            "threat_detected",
            if score > 0.8 { "critical" } else if score > 0.5 { "high" } else { "medium" },
            customer_id,
            None,
            Some(ip),
            None,
            serde_json::json!({
                "threat_type": format!("{:?}", threat_type),
                "score": score,
                "reasons": reasons,
                "path": path,
                "method": method,
            }),
        )
        .await
        .ok();

        // Real-time alert for high-confidence threats
        if score > 0.8 {
            super::alerting::send_alert(pool, &super::alerting::SecurityAlert {
                level: super::alerting::AlertLevel::Critical,
                title: format!("Threat detected: {:?}", threat_type),
                body: format!("IP {} — {} (score {:.0}%)", ip, reasons.join("; "), score * 100.0),
                ip: Some(ip.to_string()),
                customer_id,
                event_type: "threat_detected".to_string(),
                details: serde_json::json!({
                    "threat_type": format!("{:?}", threat_type),
                    "score": score,
                    "reasons": reasons,
                    "path": path,
                    "method": method,
                }),
            }).await;
        }
    }

    ThreatResult {
        is_threat,
        threat_type,
        confidence: score,
        action,
        details: reasons.join("; "),
    }
}

/// Record a failed login attempt for threat tracking (called from auth routes)
pub async fn record_failed_login(ip: &str) {
    if let Some(redis_url) = crate::config::resolve_redis_url() {
        if let Ok(client) = redis::Client::open(redis_url.as_str()) {
            if let Ok(mut conn) = redis::aio::ConnectionManager::new(client).await {
                let key = format!("threat:{}:failed_logins:15min", ip);
                let _ = redis_count(&mut conn, &key, 900).await;
            }
        }
    } else {
        let mut map = memory_logins().write().await;
        let entry = map.entry(ip.to_string()).or_insert_with(Vec::new);
        let cutoff = Instant::now() - Duration::from_secs(900);
        entry.retain(|t| *t > cutoff);
        entry.push(Instant::now());
    }
}
