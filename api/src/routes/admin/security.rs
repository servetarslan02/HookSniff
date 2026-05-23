//! Admin security monitoring — view and manage security events.

use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::Customer;

use super::{require_admin, require_admin_write};

// ── Types ──────────────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct SecurityEvent {
    pub id: Uuid,
    pub event_type: String,
    pub severity: String,
    pub customer_id: Option<Uuid>,
    pub email: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub details: serde_json::Value,
    pub resolved: bool,
    pub resolved_by: Option<Uuid>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct SecurityEventFilters {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub severity: Option<String>,
    pub event_type: Option<String>,
    pub resolved: Option<bool>,
    pub ip: Option<String>,
    pub email: Option<String>,
    pub hours: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct SecurityEventListResponse {
    pub events: Vec<SecurityEvent>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

#[derive(Debug, Serialize)]
pub struct SecurityStats {
    pub total_events: i64,
    pub unresolved_events: i64,
    pub critical_events: i64,
    pub high_events: i64,
    pub events_by_type: Vec<EventTypeCount>,
    pub events_by_severity: Vec<SeverityCount>,
    pub top_ips: Vec<IpCount>,
    pub recent_brute_force: i64,
    pub recent_credential_stuffing: i64,
    pub recent_injection_attempts: i64,
}

#[derive(Debug, Serialize)]
pub struct EventTypeCount {
    pub event_type: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct SeverityCount {
    pub severity: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct IpCount {
    pub ip_address: String,
    pub count: i64,
}

// ── Handlers ───────────────────────────────────────────────

/// GET /v1/admin/security/events — List security events with filters.
pub async fn list_security_events(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<SecurityEventFilters>,
) -> Result<Json<SecurityEventListResponse>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;
    let hours = params.hours.unwrap_or(72); // default: last 3 days

    let mut conditions = vec!["created_at > NOW() - make_interval(hours => $1)".to_string()];
    let mut param_idx = 2;

    if params.severity.is_some() {
        conditions.push(format!("severity = ${}", param_idx));
        param_idx += 1;
    }
    if params.event_type.is_some() {
        conditions.push(format!("event_type = ${}", param_idx));
        param_idx += 1;
    }
    if params.resolved.is_some() {
        conditions.push(format!("resolved = ${}", param_idx));
        param_idx += 1;
    }
    if params.ip.is_some() {
        conditions.push(format!("ip_address = ${}", param_idx));
        param_idx += 1;
    }
    if params.email.is_some() {
        conditions.push(format!("email ILIKE ${}", param_idx));
        param_idx += 1;
    }

    let where_clause = format!("WHERE {}", conditions.join(" AND "));

    let query_sql = format!(
        "SELECT id, event_type, severity, customer_id, email, ip_address, user_agent, details, resolved, resolved_by, resolved_at, created_at
         FROM security_events {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
        where_clause, param_idx, param_idx + 1
    );

    let mut query = sqlx::query_as::<_, SecurityEvent>(&query_sql).bind(hours);
    if let Some(ref s) = params.severity { query = query.bind(s); }
    if let Some(ref t) = params.event_type { query = query.bind(t); }
    if let Some(r) = params.resolved { query = query.bind(r); }
    if let Some(ref ip) = params.ip { query = query.bind(ip); }
    if let Some(ref e) = params.email { query = query.bind(format!("%{}%", e)); }
    query = query.bind(per_page).bind(offset);

    let events = query.fetch_all(&pool).await?;

    let count_sql = format!("SELECT COUNT(*) FROM security_events {}", where_clause);
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql).bind(hours);
    if let Some(ref s) = params.severity { count_query = count_query.bind(s); }
    if let Some(ref t) = params.event_type { count_query = count_query.bind(t); }
    if let Some(r) = params.resolved { count_query = count_query.bind(r); }
    if let Some(ref ip) = params.ip { count_query = count_query.bind(ip); }
    if let Some(ref e) = params.email { count_query = count_query.bind(format!("%{}%", e)); }
    let total = count_query.fetch_one(&pool).await?;

    Ok(Json(SecurityEventListResponse { events, total, page, per_page }))
}

/// GET /v1/admin/security/stats — Security dashboard statistics.
pub async fn security_stats(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<SecurityStats>, AppError> {
    require_admin(&customer)?;

    // Single query instead of 10 separate queries
    let row = sqlx::query_as::<_, (i64, i64, i64, i64, i64, i64, i64)>(
        r#"SELECT
            COUNT(*) as total_events,
            COUNT(*) FILTER (WHERE resolved = false) as unresolved_events,
            COUNT(*) FILTER (WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '7 days') as critical_events,
            COUNT(*) FILTER (WHERE severity = 'high' AND created_at > NOW() - INTERVAL '7 days') as high_events,
            COUNT(*) FILTER (WHERE event_type IN ('brute_force_login', 'brute_force_api') AND created_at > NOW() - INTERVAL '24 hours') as recent_brute_force,
            COUNT(*) FILTER (WHERE event_type = 'credential_stuffing' AND created_at > NOW() - INTERVAL '24 hours') as recent_credential_stuffing,
            COUNT(*) FILTER (WHERE event_type IN ('sql_injection_attempt', 'xss_attempt', 'path_traversal_attempt') AND created_at > NOW() - INTERVAL '24 hours') as recent_injection_attempts
        FROM security_events"#
    ).fetch_one(&pool).await?;

    let (total_events, unresolved_events, critical_events, high_events, recent_brute_force, recent_credential_stuffing, recent_injection_attempts) = row;

    // Grouped queries (still needed but only 2 instead of 3)
    let events_by_type = sqlx::query_as::<_, (String, i64)>(
        "SELECT event_type, COUNT(*) as cnt FROM security_events WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY event_type ORDER BY cnt DESC LIMIT 10"
    ).fetch_all(&pool).await?;

    let events_by_severity = sqlx::query_as::<_, (String, i64)>(
        "SELECT severity, COUNT(*) as cnt FROM security_events WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY severity ORDER BY cnt DESC"
    ).fetch_all(&pool).await?;

    let top_ips = sqlx::query_as::<_, (String, i64)>(
        "SELECT ip_address, COUNT(*) as cnt FROM security_events WHERE ip_address IS NOT NULL AND created_at > NOW() - INTERVAL '7 days' GROUP BY ip_address ORDER BY cnt DESC LIMIT 10"
    ).fetch_all(&pool).await?;

    Ok(Json(SecurityStats {
        total_events,
        unresolved_events,
        critical_events,
        high_events,
        events_by_type: events_by_type.into_iter().map(|(t, c)| EventTypeCount { event_type: t, count: c }).collect(),
        events_by_severity: events_by_severity.into_iter().map(|(s, c)| SeverityCount { severity: s, count: c }).collect(),
        top_ips: top_ips.into_iter().map(|(ip, c)| IpCount { ip_address: ip, count: c }).collect(),
        recent_brute_force,
        recent_credential_stuffing,
        recent_injection_attempts,
    }))
}

/// PUT /v1/admin/security/events/:id/resolve — Mark event as resolved.
pub async fn resolve_security_event(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let result = sqlx::query(
        "UPDATE security_events SET resolved = true, resolved_by = $1, resolved_at = NOW() WHERE id = $2"
    )
    .bind(customer.id)
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "resolved": true })))
}

/// POST /v1/admin/security/resolve-all — Resolve all events of a type.
pub async fn resolve_all_security_events(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<ResolveAllRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let result = sqlx::query(
        "UPDATE security_events SET resolved = true, resolved_by = $1, resolved_at = NOW()
         WHERE resolved = false AND ($2::text IS NULL OR event_type = $2) AND ($3::text IS NULL OR severity = $3)"
    )
    .bind(customer.id)
    .bind(req.event_type.as_deref())
    .bind(req.severity.as_deref())
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "resolved_count": result.rows_affected(),
        "event_type": req.event_type,
        "severity": req.severity,
    })))
}

#[derive(Debug, Deserialize)]
pub struct ResolveAllRequest {
    pub event_type: Option<String>,
    pub severity: Option<String>,
}

// ── IP Blocklist ───────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct IpBlockEntry {
    pub id: Uuid,
    pub ip_address: String,
    pub reason: Option<String>,
    pub blocked_by: Option<Uuid>,
    pub auto_blocked: bool,
    pub event_id: Option<Uuid>,
    pub is_active: bool,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct BlockIpRequest {
    pub ip_address: String,
    pub reason: Option<String>,
    pub expires_hours: Option<i64>,  // NULL = permanent
}

#[derive(Debug, Deserialize)]
pub struct IpBlocklistFilters {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct IpBlocklistResponse {
    pub entries: Vec<IpBlockEntry>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

/// GET /v1/admin/security/blocklist — List IP blocklist.
pub async fn list_ip_blocklist(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(params): Query<IpBlocklistFilters>,
) -> Result<Json<IpBlocklistResponse>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let active_filter = params.is_active;

    let where_sql = if active_filter.is_some() {
        "WHERE is_active = $1"
    } else {
        ""
    };

    let query_sql = format!(
        "SELECT id, ip_address, reason, blocked_by, auto_blocked, event_id, is_active, expires_at, created_at, updated_at
         FROM ip_blocklist {} ORDER BY created_at DESC LIMIT ${} OFFSET ${}",
        where_sql,
        if active_filter.is_some() { 2 } else { 1 },
        if active_filter.is_some() { 3 } else { 2 }
    );

    let mut query = sqlx::query_as::<_, IpBlockEntry>(&query_sql);
    if let Some(active) = active_filter {
        query = query.bind(active);
    }
    query = query.bind(per_page).bind(offset);
    let entries = query.fetch_all(&pool).await?;

    let count_sql = format!("SELECT COUNT(*) FROM ip_blocklist {}", where_sql);
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
    if let Some(active) = active_filter {
        count_query = count_query.bind(active);
    }
    let total = count_query.fetch_one(&pool).await?;

    Ok(Json(IpBlocklistResponse { entries, total, page, per_page }))
}

/// POST /v1/admin/security/blocklist — Block an IP address.
pub async fn block_ip(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<BlockIpRequest>,
) -> Result<Json<IpBlockEntry>, AppError> {
    require_admin_write(&customer)?;

    // Validate IP format (basic check)
    if req.ip_address.trim().is_empty() || req.ip_address.len() > 45 {
        return Err(AppError::coded(ErrorCode::InvalidIpAddress));
    }

    let expires_at = req.expires_hours.map(|h| {
        chrono::Utc::now() + chrono::Duration::hours(h)
    });

    let entry = sqlx::query_as::<_, IpBlockEntry>(
        "INSERT INTO ip_blocklist (ip_address, reason, blocked_by, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (ip_address) DO UPDATE SET
            is_active = true,
            reason = COALESCE(EXCLUDED.reason, ip_blocklist.reason),
            blocked_by = EXCLUDED.blocked_by,
            expires_at = EXCLUDED.expires_at,
            updated_at = NOW()
         RETURNING id, ip_address, reason, blocked_by, auto_blocked, event_id, is_active, expires_at, created_at, updated_at"
    )
    .bind(req.ip_address.trim())
    .bind(req.reason.as_deref())
    .bind(customer.id)
    .bind(expires_at)
    .fetch_one(&pool)
    .await?;

    tracing::info!("🚫 Admin blocked IP: {} (reason: {:?})", entry.ip_address, entry.reason);

    Ok(Json(entry))
}

/// DELETE /v1/admin/security/blocklist/:id — Unblock an IP (soft delete).
pub async fn unblock_ip(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let result = sqlx::query(
        "UPDATE ip_blocklist SET is_active = false, updated_at = NOW() WHERE id = $1"
    )
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✅ Admin unblocked IP blocklist entry: {}", id);

    Ok(Json(serde_json::json!({ "unblocked": true })))
}

/// POST /v1/admin/security/blocklist/check — Check if an IP is blocked.
pub async fn check_ip_blocked(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let ip = req["ip_address"].as_str().unwrap_or("");

    let blocked: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM ip_blocklist WHERE ip_address = $1 AND is_active = true AND (expires_at IS NULL OR expires_at > NOW()))"
    )
    .bind(ip)
    .fetch_one(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "ip_address": ip,
        "is_blocked": blocked
    })))
}

// ── Tests ──────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_event_serialization() {
        let event = SecurityEvent {
            id: Uuid::new_v4(),
            event_type: "brute_force_login".to_string(),
            severity: "high".to_string(),
            customer_id: None,
            email: Some("test@example.com".to_string()),
            ip_address: Some("192.168.1.1".to_string()),
            user_agent: Some("Mozilla/5.0".to_string()),
            details: serde_json::json!({"failed_attempts": 5}),
            resolved: false,
            resolved_by: None,
            resolved_at: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&event).unwrap();
        assert_eq!(json["event_type"], "brute_force_login");
        assert_eq!(json["severity"], "high");
        assert!(!json["resolved"].as_bool().unwrap());
    }

    #[test]
    fn test_security_stats_serialization() {
        let stats = SecurityStats {
            total_events: 100,
            unresolved_events: 25,
            critical_events: 5,
            high_events: 10,
            events_by_type: vec![],
            events_by_severity: vec![],
            top_ips: vec![],
            recent_brute_force: 3,
            recent_credential_stuffing: 1,
            recent_injection_attempts: 0,
        };
        let json = serde_json::to_value(&stats).unwrap();
        assert_eq!(json["total_events"], 100);
        assert_eq!(json["unresolved_events"], 25);
    }
}
