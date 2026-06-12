//! Security Alerting — Real-time notifications for critical security events
//!
//! Sends alerts via:
//! - Slack webhooks (when configured)
//! - PagerDuty events API (when configured)
//! - Custom webhook endpoints (when configured)
//! - AdminNotificationCenter (dashboard - always)
//!
//! Configuration via platform_settings table:
//! - security_slack_webhook_url
//! - security_pagerduty_routing_key
//! - security_custom_webhook_url

use sqlx::PgPool;
use uuid::Uuid;

/// Alert severity levels that trigger notifications
#[derive(Debug, Clone, PartialEq)]
pub enum AlertLevel {
    /// Always notify — auto-block + page on-call
    Critical,
    /// Notify via Slack + dashboard
    High,
    /// Dashboard only (no external notification)
    Medium,
    /// Dashboard only
    Low,
}

impl AlertLevel {
    pub fn should_notify_externally(&self) -> bool {
        matches!(self, AlertLevel::Critical | AlertLevel::High)
    }

    pub fn emoji(&self) -> &'static str {
        match self {
            Self::Critical => "🔴",
            Self::High => "🟠",
            Self::Medium => "🟡",
            Self::Low => "🟢",
        }
    }
}

/// Security alert payload
pub struct SecurityAlert {
    pub level: AlertLevel,
    pub title: String,
    pub body: String,
    pub ip: Option<String>,
    pub customer_id: Option<Uuid>,
    pub event_type: String,
    pub details: serde_json::Value,
}

/// Send security alert through all configured channels
pub async fn send_alert(pool: &PgPool, alert: &SecurityAlert) {
    // Always log
    tracing::warn!(
        level = ?alert.level,
        event_type = %alert.event_type,
        ip = ?alert.ip,
        "🔔 Security alert: {}",
        alert.title
    );

    // Store in security_events (always)
    let _ = sqlx::query(
        "INSERT INTO security_events (event_type, severity, ip_address, customer_id, details) \
         VALUES ($1, $2, $3, $4, $5)"
    )
    .bind(&alert.event_type)
    .bind(match alert.level {
        AlertLevel::Critical => "critical",
        AlertLevel::High => "high",
        AlertLevel::Medium => "medium",
        AlertLevel::Low => "low",
    })
    .bind(&alert.ip)
    .bind(alert.customer_id)
    .bind(&alert.details)
    .execute(pool)
    .await;

    // External notifications only for Critical/High
    if !alert.level.should_notify_externally() {
        return;
    }

    // Load webhook URLs from platform_settings
    let settings = load_alert_settings(pool).await;

    // Send to Slack
    if let Some(ref url) = settings.slack_webhook_url {
        send_slack_webhook(url, alert).await;
    }

    // Send to PagerDuty (Critical only)
    if alert.level == AlertLevel::Critical {
        if let Some(ref key) = settings.pagerduty_routing_key {
            send_pagerduty_event(key, alert).await;
        }
    }

    // Send to custom webhook
    if let Some(ref url) = settings.custom_webhook_url {
        send_custom_webhook(url, alert).await;
    }
}

/// Alert settings loaded from platform_settings
struct AlertSettings {
    slack_webhook_url: Option<String>,
    pagerduty_routing_key: Option<String>,
    custom_webhook_url: Option<String>,
}

async fn load_alert_settings(pool: &PgPool) -> AlertSettings {
    let rows: Vec<(String, String)> = sqlx::query_as(
        "SELECT key, value FROM platform_settings \
         WHERE key IN ('security_slack_webhook_url', 'security_pagerduty_routing_key', 'security_custom_webhook_url')"
    )
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let mut settings = AlertSettings {
        slack_webhook_url: None,
        pagerduty_routing_key: None,
        custom_webhook_url: None,
    };

    for (key, value) in rows {
        let value = value.trim_matches('"').to_string();
        if value.is_empty() { continue; }
        match key.as_str() {
            "security_slack_webhook_url" => settings.slack_webhook_url = Some(value),
            "security_pagerduty_routing_key" => settings.pagerduty_routing_key = Some(value),
            "security_custom_webhook_url" => settings.custom_webhook_url = Some(value),
            _ => {}
        }
    }

    settings
}

/// Send Slack webhook notification
async fn send_slack_webhook(url: &str, alert: &SecurityAlert) {
    let payload = serde_json::json!({
        "text": format!("{} Security Alert: {}", alert.level.emoji(), alert.title),
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": format!("{} {}", alert.level.emoji(), alert.title),
                    "emoji": true
                }
            },
            {
                "type": "section",
                "fields": [
                    { "type": "mrkdwn", "text": format!("*Severity:*\n{:?}", alert.level) },
                    { "type": "mrkdwn", "text": format!("*Event:*\n{}", alert.event_type) },
                    { "type": "mrkdwn", "text": format!("*IP:*\n{}", alert.ip.as_deref().unwrap_or("N/A")) },
                    { "type": "mrkdwn", "text": format!("*Time:*\n{}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC")) }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": &alert.body
                }
            }
        ]
    });

    let client = crate::http_client::get_client();
    let _ = client.post(url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await;
}

/// Send PagerDuty event
async fn send_pagerduty_event(routing_key: &str, alert: &SecurityAlert) {
    let payload = serde_json::json!({
        "routing_key": routing_key,
        "event_action": "trigger",
        "payload": {
            "summary": format!("[{}] {}", alert.level.emoji(), alert.title),
            "severity": match alert.level {
                AlertLevel::Critical => "critical",
                AlertLevel::High => "error",
                AlertLevel::Medium => "warning",
                AlertLevel::Low => "info",
            },
            "source": alert.ip.as_deref().unwrap_or("hooksniff-api"),
            "component": "security",
            "group": alert.event_type,
            "class": "security_incident",
            "custom_details": alert.details
        }
    });

    let client = crate::http_client::get_client();
    let _ = client.post("https://events.pagerduty.com/v2/enqueue")
        .header("Content-Type", "application/json")
        .json(&payload)
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await;
}

/// Send custom webhook notification
async fn send_custom_webhook(url: &str, alert: &SecurityAlert) {
    let payload = serde_json::json!({
        "level": format!("{:?}", alert.level).to_lowercase(),
        "event_type": alert.event_type,
        "title": alert.title,
        "body": alert.body,
        "ip": alert.ip,
        "customer_id": alert.customer_id,
        "details": alert.details,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    });

    let client = crate::http_client::get_client();
    let _ = client.post(url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await;
}
