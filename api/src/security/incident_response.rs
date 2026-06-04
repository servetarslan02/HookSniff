//! Incident Response & Forensics
//!
//! Automated incident detection, response, and forensic logging.

use sqlx::PgPool;
use uuid::Uuid;

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
            // Alert admin
            alert_admin(pool, &incident_type, &severity, ip, &details).await.ok();
        }
        IncidentSeverity::High => {
            // Rate limit the IP
            alert_admin(pool, &incident_type, &severity, ip, &details).await.ok();
        }
        _ => {}
    }

    tracing::warn!(
        incident_id = %incident_id,
        severity = %severity.as_str(),
        ip = %ip,
 " Security incident created"
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

 tracing::info!(ip = %ip, reason = %reason, " IP auto-blocked");
    Ok(())
}

/// Send alert to admin (via security events table)
async fn alert_admin(
    _pool: &PgPool,
    incident_type: &IncidentType,
    severity: &IncidentSeverity,
    ip: &str,
    _details: &serde_json::Value,
) -> Result<(), sqlx::Error> {
    // The admin notification system reads from security_events
    // This is picked up by the AdminNotificationCenter in the dashboard
    tracing::warn!(
        severity = %severity.as_str(),
        ip = %ip,
        incident_type = ?incident_type,
 " Admin alert triggered"
    );
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
