//! Audit logging module — insert helper for compliance and security monitoring.
//!
//! Provides the `log_action` function for inserting audit entries into the
//! `audit_log` table. Use from any handler after a critical operation succeeds.
//!
//! ## Usage
//!
//! ```ignore
//! // Basic
//! crate::audit::log_action(&pool, customer_id, "LOGIN", "auth", Some(&id), None, None, None).await;
//!
//! // With details + IP/UA
//! crate::audit::log_action(&pool, customer_id, "ENDPOINT_CREATE", "endpoint",
//!     Some(&eid), Some(serde_json::json!({"url": url})), Some(&ip), Some(&ua)).await;
//! ```

use sqlx::PgPool;
use uuid::Uuid;

/// Insert an audit log entry into the `audit_log` table.
///
/// Returns `Ok(())` on success. Callers should use `let _ =` to make audit
/// logging best-effort (audit failures must not break the main operation).
///
/// Details field is truncated to 8KB to prevent unbounded growth.
#[allow(clippy::too_many_arguments)]
pub async fn log_action(
    pool: &PgPool,
    customer_id: Uuid,
    action: &str,
    resource_type: &str,
    resource_id: Option<&str>,
    details: Option<serde_json::Value>,
    ip_address: Option<&str>,
    user_agent: Option<&str>,
) -> Result<(), sqlx::Error> {
    // Truncate details to 8KB to prevent unbounded JSONB growth
    let truncated_details = details.map(|d| {
        let s = d.to_string();
        if s.len() > 8192 {
            tracing::warn!("Audit log details truncated for action '{}' ({} bytes > 8KB)", action, s.len());
            // Safe UTF-8 truncation — find nearest char boundary before 4096
            let mut end = 4096.min(s.len());
            while end > 0 && !s.is_char_boundary(end) {
                end -= 1;
            }
            serde_json::json!({ "_truncated": true, "_original_bytes": s.len(), "preview": &s[..end] })
        } else {
            d
        }
    });

    let result = sqlx::query(
        "INSERT INTO audit_log (customer_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)",
    )
    .bind(customer_id)
    .bind(action)
    .bind(resource_type)
    .bind(resource_id)
    .bind(truncated_details)
    .bind(ip_address)
    .bind(user_agent)
    .execute(pool)
    .await;

    match result {
        Ok(_) => Ok(()),
        Err(e) => {
            tracing::error!("Audit log failed for action '{}': {e}", action);
            Err(e)
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_audit_module_compiles() {
        // Module existence test — actual DB tests require integration setup
    }
}
