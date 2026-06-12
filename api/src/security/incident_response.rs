//! Incident Response & Forensics
//!
//! Automated incident detection, response, and forensic logging.

use sqlx::PgPool;
use uuid::Uuid;

use super::alerting::{self, SecurityAlert, AlertLevel};

/// Incident severity levels
#[derive(Debug, Clone, PartialEq)]
pub enum IncidentSeverity {
    Low,
    Medium,
    High,
    Critical,
}

impl IncidentSeverity {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Medium => "medium",
            Self::High => "high",
            Self::Critical => "critical",
        }
    }
}

/// Incident types
#[derive(Debug)]
pub enum IncidentType {
    BruteForceAttack,
    CredentialStuffing,
    DataExfiltration,
    DDoSAttack,
    UnauthorizedAccess,
    AccountTakeover,
    SuspiciousAdminActivity,
    ApiKeyCompromise,
}

/// Create an incident and trigger automated response
pub async fn create_incident(
    pool: &PgPool,
    incident_type: IncidentType,
    severity: IncidentSeverity,
    ip: &str,
    customer_id: Option<Uuid>,
    details: serde_json::Value,
) -> Result<Uuid, sqlx::Error> {
    let incident_id = Uuid::new_v4();

    // Record the incident
    sqlx::query(
        r#"
        INSERT INTO security_events (event_type, severity, ip_address, customer_id, details)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(format!("incident_{:?}", incident_type).to_lowercase())
    .bind(severity.as_str())
    .bind(ip)
    .bind(customer_id)
    .bind(&details)
    .execute(pool)
    .await?;

    // Automated response based on severity
    match severity {
        IncidentSeverity::Critical => {
            // Auto-block IP for critical incidents
            auto_block_ip(pool, ip, "Critical incident auto-block").await.ok();
            // Send real-time alert via all channels
            alerting::send_alert(pool, &SecurityAlert {
                level: AlertLevel::Critical,
                title: format!("Critical: {:?}", incident_type),
                body: format!("IP {} triggered critical incident. Auto-blocked.", ip),
                ip: Some(ip.to_string()),
                customer_id,
                event_type: format!("incident_{:?}", incident_type).to_lowercase(),
                details: details.clone(),
            }).await;
        }
        IncidentSeverity::High => {
            // Send alert via Slack + dashboard
            alerting::send_alert(pool, &SecurityAlert {
                level: AlertLevel::High,
                title: format!("High: {:?}", incident_type),
                body: format!("IP {} triggered high-severity incident.", ip),
                ip: Some(ip.to_string()),
                customer_id,
                event_type: format!("incident_{:?}", incident_type).to_lowercase(),
                details: details.clone(),
            }).await;
        }
        IncidentSeverity::Medium => {
            alerting::send_alert(pool, &SecurityAlert {
                level: AlertLevel::Medium,
                title: format!("Medium: {:?}", incident_type),
                body: format!("IP {} triggered medium-severity event.", ip),
                ip: Some(ip.to_string()),
                customer_id,
                event_type: format!("incident_{:?}", incident_type).to_lowercase(),
                details: details.clone(),
            }).await;
        }
        _ => {}
    }

    tracing::warn!(
        incident_id = %incident_id,
        severity = %severity.as_str(),
        ip = %ip,
        "🚨 Security incident created"
    );

    Ok(incident_id)
}

/// Auto-block an IP address
async fn auto_block_ip(pool: &PgPool, ip: &str, reason: &str) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO ip_blocklist (ip_address, reason, auto_blocked, is_active)
        VALUES ($1, $2, true, true)
        ON CONFLICT (ip_address) DO UPDATE SET is_active = true, reason = $2
        "#,
    )
    .bind(ip)
    .bind(reason)
    .execute(pool)
    .await?;

    tracing::info!(ip = %ip, reason = %reason, "🚫 IP auto-blocked");
    Ok(())
}

/// Get recent incidents for admin dashboard
pub async fn get_recent_incidents(
    pool: &PgPool,
    limit: i64,
) -> Result<Vec<serde_json::Value>, sqlx::Error> {
    let rows: Vec<(String, String, String, Option<String>, serde_json::Value, chrono::NaiveDateTime)> = sqlx::query_as(
        r#"
        SELECT event_type, severity, ip_address, customer_id::TEXT, details, created_at
        FROM security_events
        WHERE event_type LIKE 'incident_%'
        ORDER BY created_at DESC
        LIMIT $1
        "#,
    )
    .bind(limit)
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().map(|(event_type, severity, ip, customer_id, details, created_at)| {
        serde_json::json!({
            "event_type": event_type,
            "severity": severity,
            "ip_address": ip,
            "customer_id": customer_id,
            "details": details,
            "created_at": created_at,
        })
    }).collect())
}
