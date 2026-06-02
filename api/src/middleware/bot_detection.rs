//! Bot Detection Middleware
//!
//! Detects and blocks automated bots, crawlers, and scrapers
//! from accessing the API. Uses user-agent analysis, request
//! pattern analysis, and honeypot endpoints.

use axum::{extract::Request, middleware::Next, response::Response};
use sqlx::PgPool;

use crate::error::AppError;

/// Known bot/scanner user-agent patterns
const BOT_PATTERNS: &[&str] = &[
    "sqlmap", "nikto", "nmap", "burpsuite", "owasp", "zap",
    "dirbuster", "gobuster", "wfuzz", "hydra", "medusa",
    "masscan", "zgrab", "censysinspect", "shodan",
    "semrush", "ahrefsbot", "mj12bot", "dotbot",
    "bytespider", "petalbot", "gptbot", "chatgpt-user",
    "ccbot", "anthropic", "claudebot",
];

/// Legitimate automation tools (allowed with rate limiting)
const ALLOWED_BOTS: &[&str] = &[
    "postman", "insomnia", "curl", "wget",
    "python-requests", "httpie",
];

/// Suspicious request patterns (expanded)
const SCANNER_PATHS: &[&str] = &[
    "/.env", "/wp-admin", "/wp-login", "/xmlrpc.php",
    "/phpmyadmin", "/admin/config", "/.git/config",
    "/.git/HEAD", "/.gitignore", "/.svn",
    "/actuator", "/debug", "/console", "/shell",
    "/api/v1/../", "/api/v1/..%2f",
    "/cgi-bin", "/scripts", "/setup", "/install",
    "/.well-known/security.txt", "/favicon.ico/.env",
    "/telemetry", "/metrics/prometheus", "/server-status",
];

/// Bot detection result
pub struct BotDetectionResult {
    pub is_bot: bool,
    pub is_scanner: bool,
    pub should_block: bool,
    pub bot_type: String,
}

/// Analyze request for bot/scanner behavior
pub fn detect_bot(request: &Request) -> BotDetectionResult {
    let ua = request
        .headers()
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_lowercase();

    let path = request.uri().path().to_lowercase();

    // Check for scanner paths
    let is_scanner = SCANNER_PATHS.iter().any(|p| path.contains(p));
    if is_scanner {
        return BotDetectionResult {
            is_bot: true,
            is_scanner: true,
            should_block: true,
            bot_type: "scanner".to_string(),
        };
    }

    // Check for malicious bot patterns
    let is_malicious_bot = BOT_PATTERNS.iter().any(|p| ua.contains(p));
    if is_malicious_bot {
        return BotDetectionResult {
            is_bot: true,
            is_scanner: false,
            should_block: true,
            bot_type: "malicious_bot".to_string(),
        };
    }

    // Check for missing or empty user-agent
    if ua.is_empty() {
        return BotDetectionResult {
            is_bot: true,
            is_scanner: false,
            should_block: false, // Allow but log
            bot_type: "missing_ua".to_string(),
        };
    }

    // Check for allowed automation tools (rate limited, not blocked)
    let is_allowed_bot = ALLOWED_BOTS.iter().any(|p| ua.contains(p));
    if is_allowed_bot {
        return BotDetectionResult {
            is_bot: true,
            is_scanner: false,
            should_block: false,
            bot_type: "automation_tool".to_string(),
        };
    }

    BotDetectionResult {
        is_bot: false,
        is_scanner: false,
        should_block: false,
        bot_type: "human".to_string(),
    }
}

/// Axum middleware: detect and block bots/scanners
pub async fn bot_detection_middleware(
    axum::extract::Extension(pool): axum::extract::Extension<PgPool>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let result = detect_bot(&request);

    // Extract IP once for all checks
    let ip = request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    if result.should_block {
        let ua = request
            .headers()
            .get("user-agent")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("unknown")
            .to_string();

        tracing::warn!(
            bot_type = %result.bot_type,
            ip = %ip,
            ua = %ua,
            path = %request.uri().path(),
            "🤖 Bot/scanner blocked"
        );

        crate::security_monitor::log_security_event(
            &pool,
            if result.is_scanner { "scanner_detected" } else { "suspicious_user_agent" },
            "high",
            None,
            None,
            Some(&ip),
            Some(&ua),
            serde_json::json!({
                "bot_type": result.bot_type,
                "path": request.uri().path(),
            }),
        )
        .await
        .ok();

        return Err(AppError::Forbidden);
    }

    if result.is_bot {
        // Log but allow (e.g., Postman, curl)
        tracing::debug!(bot_type = %result.bot_type, "Allowed bot detected");
    }

    Ok(next.run(request).await)
}
