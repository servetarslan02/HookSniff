//! Audit logging module — macro and insert helper.
//!
//! Provides the `audit_log!` macro for convenient audit trail recording
//! and the `log_action` function for direct database insertion.
//!
//! ## Usage
//!
//! ```ignore
//! // Basic (5 args — resource_id is Option<&str>)
//! audit_log!(pool, customer_id, "LOGIN", "auth", Some(&id_str))?;
//!
//! // With details JSON
//! audit_log!(pool, customer_id, "ENDPOINT_CREATE", "endpoint", Some(&eid),
//!     serde_json::json!({"url": "https://example.com"}))?;
//! ```

use sqlx::PgPool;
use uuid::Uuid;

/// Insert an audit log entry into the `audit_log` table.
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

/// Convenience macro for audit logging.
///
/// Expands to an `.await` expression that returns `Result<(), sqlx::Error>`.
///
/// # Variants
///
/// - 5 args: `audit_log!(pool, customer_id, action, resource_type, resource_id)`
/// - 6 args: `audit_log!(pool, customer_id, action, resource_type, resource_id, details_json)`
#[macro_export]
macro_rules! audit_log {
    ($pool:expr, $customer_id:expr, $action:expr, $resource_type:expr, $resource_id:expr) => {
        $crate::audit::log_action(
            &$pool,
            $customer_id,
            $action,
            $resource_type,
            $resource_id,
            None,
            None,
            None,
        )
        .await
    };
    ($pool:expr, $customer_id:expr, $action:expr, $resource_type:expr, $resource_id:expr, $details:expr) => {
        $crate::audit::log_action(
            &$pool,
            $customer_id,
            $action,
            $resource_type,
            $resource_id,
            Some($details),
            None,
            None,
        )
        .await
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_log_action_fn_exists() {
        // Verify the function signature compiles — actual DB tests need integration setup
        fn _assert_sig(
            pool: &PgPool,
            cid: Uuid,
            action: &str,
            rt: &str,
            rid: Option<&str>,
            details: Option<serde_json::Value>,
            ip: Option<&str>,
            ua: Option<&str>,
        ) -> impl std::future::Future<Output = Result<(), sqlx::Error>> + '_ {
            log_action(pool, cid, action, rt, rid, details, ip, ua)
        }
        // Just assert the function exists with the right signature
        let _ = _assert_sig as fn(_, _, _, _, _, _, _, _) -> _;
    }
}
