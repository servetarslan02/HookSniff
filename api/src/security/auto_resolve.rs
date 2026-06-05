//! Security Event Auto-Resolution Engine
//!
//! Cortex-powered automatic security event management.
//! Resolves stale events, groups duplicates, and handles false positives
//! without waiting for manual admin intervention.

use sqlx::PgPool;

/// Auto-resolve rules by severity
const LOW_EXPIRE_HOURS: i64 = 24;        // Low → auto-resolve after 1 day
const MEDIUM_EXPIRE_HOURS: i64 = 72;     // Medium → auto-resolve after 3 days
const HIGH_EXPIRE_HOURS: i64 = 168;      // High → auto-resolve after 7 days
const CRITICAL_EXPIRE_HOURS: i64 = 720;  // Critical → auto-resolve after 30 days

/// Auto-resolve by event type (faster than severity for known-safe types)
const QUICK_RESOLVE_TYPES: &[(&str, i64)] = &[
    ("scanner_detected", 6),           // Scanners → 6 hours
    ("suspicious_user_agent", 12),     // UA sniffing → 12 hours
    ("unusual_location", 48),          // Location anomaly → 2 days
    ("login_new_device", 72),          // New device → 3 days
    ("rate_limit_exceeded", 24),       // Rate limit → 1 day
    ("account_enumeration", 48),       // Enum attempt → 2 days
];

/// Run all auto-resolution rules. Returns total events resolved.
pub async fn run_auto_resolve(pool: &PgPool) -> Result<u64, sqlx::Error> {
    let mut total = 0u64;

    // 1. Quick-resolve known-safe event types
    for (event_type, hours) in QUICK_RESOLVE_TYPES {
        let r = sqlx::query(
            "UPDATE security_events
             SET resolved = true,
                 resolved_at = NOW(),
                 auto_resolved = true,
                 auto_resolve_reason = $2
             WHERE resolved = false
               AND event_type = $1
               AND created_at < NOW() - ($3 || ' hours')::INTERVAL"
        )
        .bind(event_type)
        .bind(format!("auto:{}_expired", event_type))
        .bind(hours)
        .execute(pool)
        .await?;

        if r.rows_affected() > 0 {
            tracing::info!(
                "🔒 Auto-resolved {} '{}' events (older than {}h)",
                r.rows_affected(), event_type, hours
            );
            total += r.rows_affected();
        }
    }

    // 2. Severity-based auto-resolution (catches everything not handled above)
    let severity_rules: Vec<(&str, i64)> = vec![
        ("low", LOW_EXPIRE_HOURS),
        ("medium", MEDIUM_EXPIRE_HOURS),
        ("high", HIGH_EXPIRE_HOURS),
        ("critical", CRITICAL_EXPIRE_HOURS),
    ];

    for (severity, hours) in severity_rules {
        let r = sqlx::query(
            "UPDATE security_events
             SET resolved = true,
                 resolved_at = NOW(),
                 auto_resolved = true,
                 auto_resolve_reason = $2
             WHERE resolved = false
               AND severity = $1
               AND auto_resolved = false
               AND created_at < NOW() - ($3 || ' hours')::INTERVAL"
        )
        .bind(severity)
        .bind(format!("auto:severity_{}_expired", severity))
        .bind(hours)
        .execute(pool)
        .await?;

        if r.rows_affected() > 0 {
            tracing::info!(
                "🔒 Auto-resolved {} '{}' events (older than {}h)",
                r.rows_affected(), severity, hours
            );
            total += r.rows_affected();
        }
    }

    // 3. Group duplicate events from same IP — keep newest, resolve older
    let r = sqlx::query(
        r#"UPDATE security_events se
           SET resolved = true,
               resolved_at = NOW(),
               auto_resolved = true,
               auto_resolve_reason = 'auto:duplicate_grouped'
           WHERE se.resolved = false
             AND se.auto_resolved = false
             AND se.id NOT IN (
                 SELECT DISTINCT ON (ip_address, event_type) id
                 FROM security_events
                 WHERE resolved = false
                 ORDER BY ip_address, event_type, created_at DESC
             )
             AND se.created_at < NOW() - INTERVAL '1 hour'"#
    )
    .execute(pool)
    .await?;

    if r.rows_affected() > 0 {
        tracing::info!("🔒 Auto-resolved {} duplicate events (grouped by IP)", r.rows_affected());
        total += r.rows_affected();
    }

    // 4. Auto-resolve events from IPs that have been blocked (no point keeping them open)
    let r = sqlx::query(
        r#"UPDATE security_events se
           SET resolved = true,
               resolved_at = NOW(),
               auto_resolved = true,
               auto_resolve_reason = 'auto:ip_blocked'
           WHERE se.resolved = false
             AND se.auto_resolved = false
             AND se.ip_address IN (
                 SELECT ip_address FROM ip_blocklist WHERE is_active = true
             )
             AND se.created_at < NOW() - INTERVAL '1 hour'"#
    )
    .execute(pool)
    .await?;

    if r.rows_affected() > 0 {
        tracing::info!("🔒 Auto-resolved {} events (IP already blocked)", r.rows_affected());
        total += r.rows_affected();
    }

    // 5. Cleanup: delete ancient resolved events (>180 days)
    let r = sqlx::query(
        "DELETE FROM security_events WHERE resolved = true AND resolved_at < NOW() - INTERVAL '180 days'"
    )
    .execute(pool)
    .await?;

    if r.rows_affected() > 0 {
        tracing::info!("🧹 Cleaned {} ancient resolved security events", r.rows_affected());
    }

    Ok(total)
}
