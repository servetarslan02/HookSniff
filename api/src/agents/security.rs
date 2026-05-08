use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ============ Audit Log ============

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub agent_id: Uuid,
    pub customer_id: Uuid,
    pub action: String,
    pub details: serde_json::Value,
    pub ip_address: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct AuditLogQuery {
    pub agent_id: Option<Uuid>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

/// Audit log kaydı oluştur
pub async fn log_action(
    pool: &sqlx::PgPool,
    agent_id: Uuid,
    customer_id: Uuid,
    action: &str,
    details: serde_json::Value,
    ip_address: Option<String>,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"INSERT INTO agent_audit_log (agent_id, customer_id, action, details, ip_address)
           VALUES ($1, $2, $3, $4, $5)"#
    )
    .bind(agent_id)
    .bind(customer_id)
    .bind(action)
    .bind(details)
    .bind(ip_address)
    .execute(pool)
    .await?;
    Ok(())
}

/// Anomali tespiti — basit kural tabanlı
pub async fn check_anomaly(
    pool: &sqlx::PgPool,
    agent_id: Uuid,
) -> Result<Vec<String>, sqlx::Error> {
    let mut warnings = Vec::new();

    // Son 1 dakikadaki event sayısı
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND created_at > now() - INTERVAL '1 minute'"
    )
    .bind(agent_id)
    .fetch_one(pool)
    .await?;

    if count.0 > 100 {
        warnings.push(format!("⚠️ Son 1 dakikada {} event — anormal trafik", count.0));
    }

    // Son 1 saatteki hata oranı
    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND created_at > now() - INTERVAL '1 hour'"
    )
    .bind(agent_id)
    .fetch_one(pool)
    .await?;

    let failed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND status = 'failed' AND created_at > now() - INTERVAL '1 hour'"
    )
    .bind(agent_id)
    .fetch_one(pool)
    .await?;

    if total.0 > 0 && (failed.0 as f64 / total.0 as f64) > 0.5 {
        warnings.push(format!(
            "🔴 Son 1 saatte hata oranı: %{:.0} ({}/{})",
            (failed.0 as f64 / total.0 as f64) * 100.0,
            failed.0,
            total.0
        ));
    }

    // Agent son görülme kontrolü — 24 saatten fazla sessiz
    let agent = sqlx::query_as::<_, crate::agents::models::Agent>(
        "SELECT * FROM agents WHERE id = $1"
    )
    .bind(agent_id)
    .fetch_optional(pool)
    .await?;

    if let Some(a) = agent {
        if let Some(last_seen) = a.last_seen_at {
            let hours_since = (Utc::now() - last_seen).num_hours();
            if hours_since > 24 {
                warnings.push(format!("⏰ Agent {} saattir sessiz", hours_since));
            }
        } else {
            warnings.push("⏰ Agent henuz hic baglanmadi".to_string());
        }
    }

    Ok(warnings)
}

/// Rate limit durumunu kontrol et
pub async fn check_rate_limit(
    pool: &sqlx::PgPool,
    agent_id: Uuid,
) -> Result<RateLimitStatus, sqlx::Error> {
    let rl = sqlx::query_as::<_, crate::agents::models::AgentRateLimit>(
        "SELECT * FROM agent_rate_limits WHERE agent_id = $1"
    )
    .bind(agent_id)
    .fetch_optional(pool)
    .await?;

    match rl {
        Some(limit) => {
            let minute_count: (i64,) = sqlx::query_as(
                "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND created_at > now() - INTERVAL '1 minute'"
            )
            .bind(agent_id)
            .fetch_one(pool)
            .await?;

            let hour_count: (i64,) = sqlx::query_as(
                "SELECT COUNT(*) FROM agent_events WHERE agent_id = $1 AND created_at > now() - INTERVAL '1 hour'"
            )
            .bind(agent_id)
            .fetch_one(pool)
            .await?;

            Ok(RateLimitStatus {
                agent_id,
                minute_used: minute_count.0 as i32,
                minute_limit: limit.max_events_per_minute,
                hour_used: hour_count.0 as i32,
                hour_limit: limit.max_events_per_hour,
                minute_remaining: (limit.max_events_per_minute - minute_count.0 as i32).max(0),
                hour_remaining: (limit.max_events_per_hour - hour_count.0 as i32).max(0),
            })
        }
        None => Ok(RateLimitStatus {
            agent_id,
            minute_used: 0,
            minute_limit: 60,
            hour_used: 0,
            hour_limit: 1000,
            minute_remaining: 60,
            hour_remaining: 1000,
        }),
    }
}

#[derive(Debug, Serialize)]
pub struct RateLimitStatus {
    pub agent_id: Uuid,
    pub minute_used: i32,
    pub minute_limit: i32,
    pub hour_used: i32,
    pub hour_limit: i32,
    pub minute_remaining: i32,
    pub hour_remaining: i32,
}
