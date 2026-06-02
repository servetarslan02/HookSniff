//! Advanced Threat Detection
//!
//! ML-inspired behavioral analysis for detecting:
//! - Brute force attacks
//! - Credential stuffing
//! - API abuse patterns
//! - Data exfiltration attempts
//! - Anomalous request patterns

use sqlx::PgPool;
use uuid::Uuid;

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

/// Analyze request patterns for threats
pub async fn analyze_request(
    pool: &PgPool,
    ip: &str,
    customer_id: Option<Uuid>,
    path: &str,
    method: &str,
) -> ThreatResult {
    let mut score: f64 = 0.0;
    let mut reasons = Vec::new();

    // 1. Check recent security events from this IP
    let recent_count: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '5 minutes'"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let count = recent_count.map(|(c,)| c).unwrap_or(0);
    if count > 50 {
        score += 0.5;
        reasons.push(format!("High security event rate: {} in 5min", count));
    } else if count > 20 {
        score += 0.3;
        reasons.push(format!("Elevated security events: {} in 5min", count));
    }

    // 2. Check for scanning behavior (many unique paths)
    let unique_paths: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(DISTINCT resource_id) FROM security_events WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '10 minutes'"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let unique = unique_paths.map(|(c,)| c).unwrap_or(0);
    if unique > 20 {
        score += 0.4;
        reasons.push(format!("Scanning: {} unique endpoints", unique));
    }

    // 3. Check for failed login attempts
    let failed_logins: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM login_attempts WHERE ip_address = $1 AND success = false AND created_at > NOW() - INTERVAL '15 minutes'"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let failures = failed_logins.map(|(c,)| c).unwrap_or(0);
    if failures > 10 {
        score += 0.5;
        reasons.push(format!("Brute force: {} failed logins in 15min", failures));
    } else if failures > 5 {
        score += 0.3;
        reasons.push(format!("Multiple failed logins: {} in 15min", failures));
    }

    // 4. Check for suspicious paths
    let suspicious_paths = [
        "/.env", "/wp-admin", "/admin/config", "/.git",
        "/phpmyadmin", "/actuator", "/debug", "/shell",
    ];
    if suspicious_paths.iter().any(|p| path.contains(p)) {
        score += 0.6;
        reasons.push(format!("Suspicious path: {}", path));
    }

    // 5. Check for unusual method on sensitive endpoints
    if method == "DELETE" && path.contains("/admin/") {
        score += 0.2;
        reasons.push("DELETE on admin endpoint".to_string());
    }

    // Determine action
    let (is_threat, action, threat_type) = if score > 0.8 {
        (true, ThreatAction::Block, ThreatType::SuspiciousPattern)
    } else if score > 0.5 {
        (true, ThreatAction::RateLimit, ThreatType::ApiAbuse)
    } else if score > 0.3 {
        (true, ThreatAction::Warn, ThreatType::SuspiciousPattern)
    } else {
        (false, ThreatAction::Allow, ThreatType::SuspiciousPattern)
    };

    if is_threat {
        // Log the threat
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
    }

    ThreatResult {
        is_threat,
        threat_type,
        confidence: score,
        action,
        details: reasons.join("; "),
    }
}
