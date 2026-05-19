//! Suspicious activity detection engine.
//!
//! Monitors login patterns, API abuse, and anomalous behavior.
//! Logs events to `security_events` table and triggers alerts.

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

// ── Event Types ───────────────────────────────────────────

/// All security event types the system can detect.
pub mod event_types {
    // Brute force
    pub const BRUTE_FORCE_LOGIN: &str = "brute_force_login";
    pub const BRUTE_FORCE_API: &str = "brute_force_api";
    pub const ACCOUNT_LOCKOUT: &str = "account_lockout";

    // Credential attacks
    pub const CREDENTIAL_STUFFING: &str = "credential_stuffing";
    pub const PASSWORD_SPRAY: &str = "password_spray";
    pub const MULTIPLE_ACCOUNTS_SAME_IP: &str = "multiple_accounts_same_ip";

    // Anomalous behavior
    pub const UNUSUAL_LOCATION: &str = "unusual_location";
    pub const UNUSUAL_API_PATTERN: &str = "unusual_api_pattern";
    pub const RAPID_ENDPOINT_CREATION: &str = "rapid_endpoint_creation";
    pub const RAPID_WEBHOOK_VOLUME: &str = "rapid_webhook_volume";
    pub const SUSPICIOUS_USER_AGENT: &str = "suspicious_user_agent";

    // Account security
    pub const LOGIN_NEW_DEVICE: &str = "login_new_device";
    pub const PASSWORD_RESET_ABUSE: &str = "password_reset_abuse";
    pub const ACCOUNT_ENUMERATION: &str = "account_enumeration";
    pub const DISABLED_ACCOUNT_LOGIN: &str = "disabled_account_login";

    // API abuse
    pub const RATE_LIMIT_EXCEEDED: &str = "rate_limit_exceeded";
    pub const API_KEY_ABUSE: &str = "api_key_abuse";
    pub const SCANNER_DETECTED: &str = "scanner_detected";

    // Injection attempts
    pub const SQL_INJECTION_ATTEMPT: &str = "sql_injection_attempt";
    pub const XSS_ATTEMPT: &str = "xss_attempt";
    pub const PATH_TRAVERSAL_ATTEMPT: &str = "path_traversal_attempt";
}

// ── Severity Levels ───────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

impl Severity {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Medium => "medium",
            Self::High => "high",
            Self::Critical => "critical",
        }
    }
}

// ── Detection Result ──────────────────────────────────────

pub struct DetectionResult {
    pub should_log: bool,
    pub should_alert: bool,
    pub should_block: bool,
    pub event_type: String,
    pub severity: Severity,
    pub details: serde_json::Value,
}

// ── Login Attempt Tracking ────────────────────────────────

/// Record a login attempt (success or failure).
pub async fn record_login_attempt(
    pool: &PgPool,
    email: &str,
    ip: &str,
    user_agent: Option<&str>,
    success: bool,
    failure_reason: Option<&str>,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason)
         VALUES ($1, $2, $3, $4, $5)"
    )
    .bind(email)
    .bind(ip)
    .bind(user_agent)
    .bind(success)
    .bind(failure_reason)
    .execute(pool)
    .await?;
    Ok(())
}

// ── Brute Force Detection ─────────────────────────────────

/// Check for brute force login attempts.
/// Returns detection result if suspicious activity found.
pub async fn detect_brute_force(
    pool: &PgPool,
    email: &str,
    ip: &str,
) -> Result<Option<DetectionResult>, sqlx::Error> {
    let window = chrono::Utc::now() - chrono::Duration::minutes(15);

    // Check: failed attempts by same email in last 15 min
    let email_fails: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM login_attempts
         WHERE email = $1 AND success = false AND created_at > $2"
    )
    .bind(email)
    .bind(window)
    .fetch_one(pool)
    .await?;

    // Check: failed attempts by same IP in last 15 min
    let ip_fails: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM login_attempts
         WHERE ip_address = $1 AND success = false AND created_at > $2"
    )
    .bind(ip)
    .bind(window)
    .fetch_one(pool)
    .await?;

    // Check: how many different emails this IP tried
    let ip_unique_emails: (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT email) FROM login_attempts
         WHERE ip_address = $1 AND success = false AND created_at > $2"
    )
    .bind(ip)
    .bind(window)
    .fetch_one(pool)
    .await?;

    // Credential stuffing: same IP, many different emails
    if ip_unique_emails.0 >= 5 {
        return Ok(Some(DetectionResult {
            should_log: true,
            should_alert: true,
            should_block: true,
            event_type: event_types::CREDENTIAL_STUFFING.to_string(),
            severity: Severity::Critical,
            details: serde_json::json!({
                "ip": ip,
                "unique_emails_attempted": ip_unique_emails.0,
                "window_minutes": 15,
                "reason": "Same IP tried many different email accounts"
            }),
        }));
    }

    // Brute force by email: 5+ failed attempts
    if email_fails.0 >= 5 {
        return Ok(Some(DetectionResult {
            should_log: true,
            should_alert: true,
            should_block: email_fails.0 >= 10,
            event_type: event_types::BRUTE_FORCE_LOGIN.to_string(),
            severity: if email_fails.0 >= 10 { Severity::Critical } else { Severity::High },
            details: serde_json::json!({
                "email": email,
                "ip": ip,
                "failed_attempts": email_fails.0,
                "window_minutes": 15,
                "reason": "Multiple failed login attempts for same account"
            }),
        }));
    }

    // Brute force by IP: 10+ failed attempts
    if ip_fails.0 >= 10 {
        return Ok(Some(DetectionResult {
            should_log: true,
            should_alert: true,
            should_block: true,
            event_type: event_types::BRUTE_FORCE_API.to_string(),
            severity: Severity::High,
            details: serde_json::json!({
                "ip": ip,
                "failed_attempts": ip_fails.0,
                "window_minutes": 15,
                "reason": "High volume of failed attempts from single IP"
            }),
        }));
    }

    // Password spray: IP tries 3+ emails with few attempts each
    if ip_unique_emails.0 >= 3 && ip_fails.0 >= 3 {
        return Ok(Some(DetectionResult {
            should_log: true,
            should_alert: true,
            should_block: false,
            event_type: event_types::PASSWORD_SPRAY.to_string(),
            severity: Severity::High,
            details: serde_json::json!({
                "ip": ip,
                "unique_emails": ip_unique_emails.0,
                "total_failures": ip_fails.0,
                "window_minutes": 15,
                "reason": "IP trying multiple accounts with few attempts each"
            }),
        }));
    }

    Ok(None)
}

// ── Input Sanitization Detection ──────────────────────────

/// Check for injection attempts in user input.
pub fn detect_injection_attempt(input: &str) -> Option<DetectionResult> {
    let lower = input.to_lowercase();

    // SQL injection patterns
    let sql_patterns = [
        "' or '1'='1", "' or 1=1", "'; drop table", "'; delete from",
        "union select", "' union", "/*", "*/", "xp_cmdshell",
        "exec(", "execute(", "insert into", "update.*set",
    ];

    for pattern in &sql_patterns {
        if lower.contains(pattern) {
            return Some(DetectionResult {
                should_log: true,
                should_alert: true,
                should_block: true,
                event_type: event_types::SQL_INJECTION_ATTEMPT.to_string(),
                severity: Severity::Critical,
                details: serde_json::json!({
                    "input_snippet": &input[..input.len().min(200)],
                    "pattern_matched": pattern,
                    "reason": "SQL injection pattern detected in input"
                }),
            });
        }
    }

    // XSS patterns
    let xss_patterns = [
        "<script", "javascript:", "onerror=", "onload=", "onclick=",
        "onmouseover=", "onfocus=", "onblur=", "eval(", "document.cookie",
    ];

    for pattern in &xss_patterns {
        if lower.contains(pattern) {
            return Some(DetectionResult {
                should_log: true,
                should_alert: false,
                should_block: true,
                event_type: event_types::XSS_ATTEMPT.to_string(),
                severity: Severity::High,
                details: serde_json::json!({
                    "input_snippet": &input[..input.len().min(200)],
                    "pattern_matched": pattern,
                    "reason": "XSS pattern detected in input"
                }),
            });
        }
    }

    // Path traversal
    let traversal_patterns = ["../", "..\\", "/etc/passwd", "/etc/shadow", "c:\\"];
    for pattern in &traversal_patterns {
        if lower.contains(pattern) {
            return Some(DetectionResult {
                should_log: true,
                should_alert: false,
                should_block: true,
                event_type: event_types::PATH_TRAVERSAL_ATTEMPT.to_string(),
                severity: Severity::High,
                details: serde_json::json!({
                    "input_snippet": &input[..input.len().min(200)],
                    "pattern_matched": pattern,
                    "reason": "Path traversal attempt detected"
                }),
            });
        }
    }

    None
}

// ── User-Agent Analysis ───────────────────────────────────

/// Check for suspicious user agents (scanners, bots, known attack tools).
pub fn detect_suspicious_user_agent(user_agent: &str) -> Option<DetectionResult> {
    let ua_lower = user_agent.to_lowercase();

    let suspicious_patterns = [
        "sqlmap", "nikto", "nmap", "masscan", "zgrab", "nuclei",
        "burpsuite", "owasp", "dirbuster", "gobuster", "wfuzz",
        "hydra", "medusa", "nessus", "openvas", "acunetix",
        "havij", "w3af", "skipfish", "arachni",
    ];

    for pattern in &suspicious_patterns {
        if ua_lower.contains(pattern) {
            return Some(DetectionResult {
                should_log: true,
                should_alert: true,
                should_block: true,
                event_type: event_types::SCANNER_DETECTED.to_string(),
                severity: Severity::Critical,
                details: serde_json::json!({
                    "user_agent": user_agent,
                    "pattern_matched": pattern,
                    "reason": "Known attack tool/scanner detected"
                }),
            });
        }
    }

    // Empty or minimal user agent (suspicious for API calls)
    if user_agent.trim().is_empty() || user_agent.len() < 5 {
        return Some(DetectionResult {
            should_log: true,
            should_alert: false,
            should_block: false,
            event_type: event_types::SUSPICIOUS_USER_AGENT.to_string(),
            severity: Severity::Low,
            details: serde_json::json!({
                "user_agent": user_agent,
                "reason": "Empty or minimal user agent"
            }),
        });
    }

    None
}

// ── Account Enumeration Detection ─────────────────────────

/// Check if someone is enumerating valid accounts via password reset.
pub async fn detect_password_reset_abuse(
    pool: &PgPool,
    ip: &str,
) -> Result<Option<DetectionResult>, sqlx::Error> {
    let window = chrono::Utc::now() - chrono::Duration::hours(1);

    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM audit_log
         WHERE action = 'PASSWORD_RESET_REQUEST'
         AND ip_address = $1
         AND created_at > $2"
    )
    .bind(ip)
    .bind(window)
    .fetch_one(pool)
    .await?;

    if count.0 >= 5 {
        return Ok(Some(DetectionResult {
            should_log: true,
            should_alert: true,
            should_block: true,
            event_type: event_types::PASSWORD_RESET_ABUSE.to_string(),
            severity: Severity::High,
            details: serde_json::json!({
                "ip": ip,
                "reset_requests": count.0,
                "window_hours": 1,
                "reason": "Excessive password reset requests from same IP"
            }),
        }));
    }

    Ok(None)
}

// ── Log Security Event ────────────────────────────────────

/// Log a security event to the database.
pub async fn log_security_event(
    pool: &PgPool,
    event_type: &str,
    severity: &str,
    customer_id: Option<Uuid>,
    email: Option<&str>,
    ip: Option<&str>,
    user_agent: Option<&str>,
    details: serde_json::Value,
) -> Result<Uuid, sqlx::Error> {
    let id: (Uuid,) = sqlx::query_as(
        "INSERT INTO security_events (event_type, severity, customer_id, email, ip_address, user_agent, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id"
    )
    .bind(event_type)
    .bind(severity)
    .bind(customer_id)
    .bind(email)
    .bind(ip)
    .bind(user_agent)
    .bind(details)
    .fetch_one(pool)
    .await?;

    Ok(id.0)
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_sql_injection() {
        assert!(detect_injection_attempt("' OR '1'='1").is_some());
        assert!(detect_injection_attempt("'; DROP TABLE users--").is_some());
        assert!(detect_injection_attempt("UNION SELECT * FROM passwords").is_some());
        assert!(detect_injection_attempt("normal input").is_none());
    }

    #[test]
    fn test_detect_xss() {
        assert!(detect_injection_attempt("<script>alert(1)</script>").is_some());
        assert!(detect_injection_attempt("javascript:alert(1)").is_some());
        assert!(detect_injection_attempt("onerror=alert(1)").is_some());
        assert!(detect_injection_attempt("hello world").is_none());
    }

    #[test]
    fn test_detect_path_traversal() {
        assert!(detect_injection_attempt("../../etc/passwd").is_some());
        assert!(detect_injection_attempt("..\\windows\\system32").is_some());
        assert!(detect_injection_attempt("normal/path").is_none());
    }

    #[test]
    fn test_detect_scanner_user_agent() {
        assert!(detect_suspicious_user_agent("sqlmap/1.0").is_some());
        assert!(detect_suspicious_user_agent("Nikto/2.1").is_some());
        assert!(detect_suspicious_user_agent("Mozilla/5.0 Chrome/120").is_none());
    }

    #[test]
    fn test_detect_empty_user_agent() {
        let result = detect_suspicious_user_agent("");
        assert!(result.is_some());
        assert_eq!(result.unwrap().event_type, event_types::SUSPICIOUS_USER_AGENT);
    }

    #[test]
    fn test_severity_as_str() {
        assert_eq!(Severity::Low.as_str(), "low");
        assert_eq!(Severity::Medium.as_str(), "medium");
        assert_eq!(Severity::High.as_str(), "high");
        assert_eq!(Severity::Critical.as_str(), "critical");
    }

    #[test]
    fn test_event_types_exist() {
        assert!(!event_types::BRUTE_FORCE_LOGIN.is_empty());
        assert!(!event_types::CREDENTIAL_STUFFING.is_empty());
        assert!(!event_types::SQL_INJECTION_ATTEMPT.is_empty());
        assert!(!event_types::SCANNER_DETECTED.is_empty());
    }
}
