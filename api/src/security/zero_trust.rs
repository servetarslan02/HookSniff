//! Zero Trust Architecture
//!
//! "Never trust, always verify" — continuous authentication and authorization.

use sqlx::PgPool;
use uuid::Uuid;

/// Zero Trust verification result
pub struct ZtVerification {
    pub allowed: bool,
    pub reason: String,
    pub risk_score: f64,
}

/// Verify request against Zero Trust policies
pub async fn verify_request(
    pool: &PgPool,
    customer_id: Uuid,
    ip: &str,
    _user_agent: &str,
    path: &str,
    method: &str,
) -> ZtVerification {
    let mut risk_score: f64 = 0.0;
    let mut reasons = Vec::new();

    // 1. Check if customer account is active
    let account_active: Option<(bool, bool)> = sqlx::query_as(
        "SELECT COALESCE(is_active, true), COALESCE(is_admin, false) FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let (active, is_admin) = account_active.unwrap_or((true, false));

    if !active {
        return ZtVerification {
            allowed: false,
            reason: "Account disabled".to_string(),
            risk_score: 1.0,
        };
    }

    // Admin users bypass risk scoring — they've already passed auth
    if is_admin {
        return ZtVerification {
            allowed: true,
            reason: "Admin verified".to_string(),
            risk_score: 0.0,
        };
    }

    // 2. Check for recent suspicious activity
    let recent_events: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE customer_id = $1 AND severity IN ('high', 'critical') AND created_at > NOW() - INTERVAL '1 hour'"
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let events = recent_events.map(|(c,)| c).unwrap_or(0);
    if events > 5 {
        risk_score += 0.4;
        reasons.push(format!("{} high-severity events in 1h", events));
    }

    // 3. Check IP reputation
    let ip_blocked: Option<(bool,)> = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM ip_blocklist WHERE ip_address = $1 AND is_active = true)"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    if let Some((blocked,)) = ip_blocked {
        if blocked {
            return ZtVerification {
                allowed: false,
                reason: "IP is blocked".to_string(),
                risk_score: 1.0,
            };
        }
    }

    // 4. Admin path requires elevated verification (already checked above for admin bypass)
    if path.starts_with("/admin") || path.contains("/admin/") {
        // This check is redundant for admins (already bypassed above),
        // but protects against non-admin users accessing admin paths
        if !is_admin {
            return ZtVerification {
                allowed: false,
                reason: "Admin access required".to_string(),
                risk_score: 1.0,
            };
        }
    }

    // 5. Destructive operations require lower risk score
    if method == "DELETE" || method == "PUT" {
        if risk_score > 0.3 {
            return ZtVerification {
                allowed: false,
                reason: format!("Risk score too high for {}: {}", method, risk_score),
                risk_score,
            };
        }
    }

    ZtVerification {
        allowed: risk_score < 0.7,
        reason: if reasons.is_empty() { "Verified".to_string() } else { reasons.join("; ") },
        risk_score,
    }
}
