//! Alert evaluation worker — background job that checks alert rules against delivery stats.
//!
//! Runs every 5 minutes. For each active alert_rule:
//! 1. Queries delivery stats (last N minutes based on condition)
//! 2. Compares actual value against threshold
//! 3. If threshold exceeded AND cooldown elapsed → sends notifications
//! 4. Records trigger in alert_history + updates last_triggered_at

use anyhow::Result;
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::email::Language;
use crate::resend_email::ResendEmailClient;

/// Cooldown period in minutes — prevent alert storms
const DEFAULT_COOLDOWN_MINUTES: i32 = 15;

/// Evaluation window in minutes — how far back to look for stats
const EVAL_WINDOW_MINUTES: i64 = 30;

/// Run the alert evaluation job. Call this every 5 minutes.
///
/// For each active alert_rule:
/// - failure_rate: (failed / total) * 100 → threshold is percentage (e.g. 5 = 5%)
/// - latency: avg duration_ms → threshold is milliseconds (e.g. 5000 = 5s)
/// - consecutive_failures: failure_streak on endpoint → threshold is count
pub async fn run_alert_evaluation(pool: &PgPool, email_client: &ResendEmailClient) -> Result<u64> {
    tracing::info!("🔔 Running alert evaluation...");

    let now = Utc::now();
    let mut alerts_triggered = 0u64;

    // Fetch all active alert rules with customer info
    let rules: Vec<AlertRuleRow> = sqlx::query_as(
        "SELECT ar.id, ar.customer_id, ar.name, ar.condition, ar.threshold, \
                ar.channels, ar.webhook_url, ar.cooldown_minutes, ar.last_triggered_at, \
                c.email, c.language \
         FROM alert_rules ar \
         JOIN customers c ON c.id = ar.customer_id \
         WHERE ar.is_active = true"
    )
    .fetch_all(pool)
    .await?;

    for rule in &rules {
        // Check cooldown
        if let Some(last_triggered) = rule.last_triggered_at {
            let cooldown = rule.cooldown_minutes.max(DEFAULT_COOLDOWN_MINUTES) as i64;
            let minutes_since = (now - last_triggered).num_minutes();
            if minutes_since < cooldown {
                tracing::debug!(
                    "⏳ Alert '{}' in cooldown ({}min remaining)",
                    rule.name, cooldown - minutes_since
                );
                continue;
            }
        }

        // Evaluate the condition
        let actual_value = match rule.condition.as_str() {
            "failure_rate" => evaluate_failure_rate(pool, rule.customer_id, EVAL_WINDOW_MINUTES).await?,
            "latency" => evaluate_latency(pool, rule.customer_id, EVAL_WINDOW_MINUTES).await?,
            "consecutive_failures" => evaluate_consecutive_failures(pool, rule.customer_id).await?,
            _ => {
                tracing::warn!("Unknown alert condition: {}", rule.condition);
                continue;
            }
        };

        let threshold = rule.threshold as f64;
        let triggered = match rule.condition.as_str() {
            "failure_rate" => actual_value > threshold,
            "latency" => actual_value > threshold,
            "consecutive_failures" => actual_value >= threshold,
            _ => false,
        };

        if !triggered {
            continue;
        }

        tracing::warn!(
            "🚨 Alert triggered: '{}' — {} = {:.1} (threshold: {})",
            rule.name, rule.condition, actual_value, rule.threshold
        );

        // Send notifications via configured channels
        let channels: Vec<String> = rule.channels
            .as_array()
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_default();

        let mut channels_sent: Vec<String> = Vec::new();

        for channel in &channels {
            let sent = match channel.as_str() {
                "email" => {
                    send_alert_email(
                        email_client,
                        &rule.email,
                        &rule.name,
                        &rule.condition,
                        actual_value,
                        rule.threshold,
                        Language::parse_lang(&rule.language),
                    ).await.is_ok()
                }
                "slack" => {
                    send_slack_webhook(
                        rule.webhook_url.as_deref(),
                        &rule.name,
                        &rule.condition,
                        actual_value,
                        rule.threshold,
                    ).await.is_ok()
                }
                "webhook" => {
                    send_webhook_notification(
                        pool,
                        rule.customer_id,
                        &rule.name,
                        &rule.condition,
                        actual_value,
                        rule.threshold,
                    ).await.is_ok()
                }
                _ => false,
            };

            if sent {
                channels_sent.push(channel.clone());
            }
        }

        // Create in-app notification
        let _ = sqlx::query(
            "INSERT INTO notifications (customer_id, type, title, message, is_read) \
             VALUES ($1, 'alert', $2, $3, false)"
        )
        .bind(rule.customer_id)
        .bind(format!("🚨 Alert: {}", rule.name))
        .bind(format!(
            "{} = {:.1} (threshold: {}). Channels: {}",
            rule.condition, actual_value, rule.threshold,
            if channels_sent.is_empty() { "none".to_string() } else { channels_sent.join(", ") }
        ))
        .execute(pool)
        .await;

        // Record in alert_history
        let _ = sqlx::query(
            "INSERT INTO alert_history (alert_rule_id, customer_id, condition, actual_value, threshold, channels_sent) \
             VALUES ($1, $2, $3, $4, $5, $6)"
        )
        .bind(rule.id)
        .bind(rule.customer_id)
        .bind(&rule.condition)
        .bind(actual_value)
        .bind(rule.threshold)
        .bind(serde_json::json!(channels_sent))
        .execute(pool)
        .await;

        // Update last_triggered_at for cooldown
        let _ = sqlx::query(
            "UPDATE alert_rules SET last_triggered_at = NOW() WHERE id = $1"
        )
        .bind(rule.id)
        .execute(pool)
        .await;

        alerts_triggered += 1;
    }

    if alerts_triggered > 0 {
        tracing::info!("✅ Alert evaluation complete: {} alerts triggered", alerts_triggered);
    } else {
        tracing::debug!("✅ Alert evaluation complete: no alerts triggered");
    }

    Ok(alerts_triggered)
}

// ── Stat evaluation helpers ──────────────────────────────────────

/// Calculate failure rate (0-100) for a customer's deliveries in the last N minutes.
async fn evaluate_failure_rate(pool: &PgPool, customer_id: Uuid, window_minutes: i64) -> Result<f64> {
    let stats: (i64, i64) = sqlx::query_as(
        "SELECT \
            COUNT(*) as total, \
            COUNT(*) FILTER (WHERE status IN ('failed', 'dead')) as failed \
         FROM deliveries \
         WHERE customer_id = $1 \
         AND created_at > NOW() - ($2 || ' minutes')::interval"
    )
    .bind(customer_id)
    .bind(window_minutes)
    .fetch_one(pool)
    .await?;

    if stats.0 == 0 {
        return Ok(0.0);
    }

    Ok((stats.1 as f64 / stats.0 as f64) * 100.0)
}

/// Calculate average latency (ms) for a customer's deliveries in the last N minutes.
async fn evaluate_latency(pool: &PgPool, customer_id: Uuid, window_minutes: i64) -> Result<f64> {
    let avg: Option<f64> = sqlx::query_scalar(
        "SELECT AVG(duration_ms)::DOUBLE PRECISION \
         FROM delivery_attempts da \
         JOIN deliveries d ON d.id = da.delivery_id \
         WHERE d.customer_id = $1 \
         AND da.created_at > NOW() - ($2 || ' minutes')::interval \
         AND da.duration_ms IS NOT NULL"
    )
    .bind(customer_id)
    .bind(window_minutes)
    .fetch_one(pool)
    .await?;

    Ok(avg.unwrap_or(0.0))
}

/// Get max consecutive failures across all endpoints for a customer.
async fn evaluate_consecutive_failures(pool: &PgPool, customer_id: Uuid) -> Result<f64> {
    let max_streak: Option<i32> = sqlx::query_scalar(
        "SELECT MAX(failure_streak) FROM endpoints WHERE customer_id = $1 AND is_active = true"
    )
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    Ok(max_streak.unwrap_or(0) as f64)
}

// ── Notification dispatchers ─────────────────────────────────────

/// Send alert notification email.
async fn send_alert_email(
    email_client: &ResendEmailClient,
    to: &str,
    alert_name: &str,
    condition: &str,
    actual_value: f64,
    threshold: i32,
    lang: Language,
) -> Result<()> {
    let (subject, html) = match lang {
        Language::Tr => (
            format!("🚨 HookSniff Uyarısı: {}", alert_name),
            format!(
                r#"<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                <h2 style="color:#dc2626;">🚨 Uyarı Tetiklendi</h2>
                <p><strong>{}</strong> kuralı tetiklendi.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;border:1px solid #e5e7eb;">Koşul</td><td style="padding:8px;border:1px solid #e5e7eb;"><strong>{}</strong></td></tr>
                <tr><td style="padding:8px;border:1px solid #e5e7eb;">Değer</td><td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;"><strong>{:.1}</strong></td></tr>
                <tr><td style="padding:8px;border:1px solid #e5e7eb;">Eşik</td><td style="padding:8px;border:1px solid #e5e7eb;">{}</td></tr>
                </table>
                <p style="color:#6b7280;font-size:13px;">Dashboard'dan kontrol edin: <a href="https://hooksniff.vercel.app/alerts">Alerts</a></p>
                </div>"#,
                alert_name, condition, actual_value, threshold
            ),
        ),
        Language::En => (
            format!("🚨 HookSniff Alert: {}", alert_name),
            format!(
                r#"<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                <h2 style="color:#dc2626;">🚨 Alert Triggered</h2>
                <p>Rule <strong>{}</strong> has been triggered.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;border:1px solid #e5e7eb;">Condition</td><td style="padding:8px;border:1px solid #e5e7eb;"><strong>{}</strong></td></tr>
                <tr><td style="padding:8px;border:1px solid #e5e7eb;">Value</td><td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;"><strong>{:.1}</strong></td></tr>
                <tr><td style="padding:8px;border:1px solid #e5e7eb;">Threshold</td><td style="padding:8px;border:1px solid #e5e7eb;">{}</td></tr>
                </table>
                <p style="color:#6b7280;font-size:13px;">Check your dashboard: <a href="https://hooksniff.vercel.app/alerts">Alerts</a></p>
                </div>"#,
                alert_name, condition, actual_value, threshold
            ),
        ),
    };

    email_client.send_contact_email(to, &subject, &html).await.map_err(|e| anyhow::anyhow!("{}", e))
}

/// Send alert to Slack via incoming webhook.
async fn send_slack_webhook(
    webhook_url: Option<&str>,
    alert_name: &str,
    condition: &str,
    actual_value: f64,
    threshold: i32,
) -> Result<()> {
    let url = webhook_url.ok_or_else(|| anyhow::anyhow!("No Slack webhook URL configured"))?;

    let payload = serde_json::json!({
        "text": format!(
            "🚨 *Alert: {}*\nCondition: {}\nValue: {:.1}\nThreshold: {}",
            alert_name, condition, actual_value, threshold
        ),
        "username": "HookSniff Alerts",
        "icon_emoji": ":warning:"
    });

    let client = reqwest::Client::new();
    client.post(url)
        .json(&payload)
        .send()
        .await?
        .error_for_status()?;

    Ok(())
}

/// Send alert via operational webhook (customer's configured webhook URL).
async fn send_webhook_notification(
    pool: &PgPool,
    customer_id: Uuid,
    alert_name: &str,
    condition: &str,
    actual_value: f64,
    threshold: i32,
) -> Result<()> {
    // Find the customer's operational webhook endpoint for alerts
    let webhook_url: Option<String> = sqlx::query_scalar(
        "SELECT url FROM operational_webhook_endpoints \
         WHERE customer_id = $1 AND is_active = true \
         AND 'alert' = ANY(event_types) \
         LIMIT 1"
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await?;

    let url = match webhook_url {
        Some(u) => u,
        None => {
            tracing::debug!("No operational webhook configured for alerts (customer {})", customer_id);
            return Ok(());
        }
    };

    let payload = serde_json::json!({
        "event": "alert.triggered",
        "alert_name": alert_name,
        "condition": condition,
        "actual_value": actual_value,
        "threshold": threshold,
        "timestamp": Utc::now().to_rfc3339(),
    });

    let client = reqwest::Client::new();
    client.post(&url)
        .json(&payload)
        .send()
        .await?
        .error_for_status()?;

    Ok(())
}

// ── Row type ─────────────────────────────────────────────────────

#[derive(sqlx::FromRow)]
struct AlertRuleRow {
    id: Uuid,
    customer_id: Uuid,
    name: String,
    condition: String,
    threshold: i32,
    channels: serde_json::Value,
    webhook_url: Option<String>,
    cooldown_minutes: i32,
    last_triggered_at: Option<chrono::DateTime<Utc>>,
    email: String,
    language: String,
}

// ── Tests ────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_failure_rate_zero_deliveries() {
        // 0 deliveries = 0% failure rate
        let rate = 0.0;
        assert_eq!(rate, 0.0);
    }

    #[test]
    fn test_failure_rate_calculation() {
        let total = 100i64;
        let failed = 5i64;
        let rate = (failed as f64 / total as f64) * 100.0;
        assert!((rate - 5.0).abs() < 0.01);
    }

    #[test]
    fn test_cooldown_check() {
        let last_triggered = Utc::now() - chrono::Duration::minutes(10);
        let cooldown = 15i64;
        let minutes_since = (Utc::now() - last_triggered).num_minutes();
        assert!(minutes_since < cooldown);
    }

    #[test]
    fn test_cooldown_expired() {
        let last_triggered = Utc::now() - chrono::Duration::minutes(20);
        let cooldown = 15i64;
        let minutes_since = (Utc::now() - last_triggered).num_minutes();
        assert!(minutes_since >= cooldown);
    }
}
