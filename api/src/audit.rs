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
    sqlx::query(
        "INSERT INTO audit_log (customer_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)",
    )
    .bind(customer_id)
    .bind(action)
    .bind(resource_type)
    .bind(resource_id)
    .bind(details)
    .bind(ip_address)
    .bind(user_agent)
    .execute(pool)
    .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_audit_module_compiles() {
        // Module existence test — actual DB tests require integration setup
    }
}
