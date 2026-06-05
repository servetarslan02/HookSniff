//! Zero Trust Middleware — wraps verify_request into an axum middleware layer
//!
//! Runs AFTER auth_middleware (which sets the Customer extension).
//! Checks: account active, recent security events, IP reputation, admin gating.

use axum::{extract::Extension, extract::Request, middleware::Next, response::Response};
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::security::zero_trust;

/// Axum middleware: verify every authenticated request against Zero Trust policies.
pub async fn zero_trust_middleware(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let ip = request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .split(',')
        .next()
        .unwrap_or("unknown")
        .trim()
        .to_string();

    let ua = request
        .headers()
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    let path = request.uri().path();
    let method = request.method().as_str();

    let result = zero_trust::verify_request(
        &pool,
        customer.id,
        &ip,
        &ua,
        path,
        method,
    )
    .await;

    if !result.allowed {
        tracing::warn!(
            customer_id = %customer.id,
            ip = %ip,
            reason = %result.reason,
            risk_score = result.risk_score,
            "🔒 Zero Trust blocked request"
        );
        return Err(AppError::Forbidden);
    }

    if result.risk_score > 0.3 {
        tracing::info!(
            customer_id = %customer.id,
            risk_score = result.risk_score,
            reason = %result.reason,
            "⚠️ Zero Trust elevated risk"
        );
    }

    // Skip threat detection for admin users — they already passed auth.
    // Only run threat detection for non-admin or when risk is already elevated.
    let is_admin_path = path.starts_with("/admin") || path.contains("/admin/");
    
    if !is_admin_path && result.risk_score < 0.3 {
        // Run threat detection only for non-admin paths and low-risk requests
        let threat = crate::security::threat_detector::analyze_request(
            &pool,
            &ip,
            Some(customer.id),
            path,
            method,
        )
        .await;

        if threat.is_threat {
            // Block if action is Block AND confidence is very high
            // But NEVER block admin users — they're verified by Zero Trust above
            if !is_admin {
                let should_block = matches!(threat.action, crate::security::threat_detector::ThreatAction::Block)
                    && threat.confidence > 0.8
                    && result.risk_score < 0.5;

                if should_block {
                    tracing::warn!(
                        customer_id = %customer.id,
                        threat_type = ?threat.threat_type,
                        confidence = threat.confidence,
                        details = %threat.details,
                        "🔒 Threat detected — blocking request"
                    );
                    return Err(AppError::Forbidden);
                }
            }
            // Admin or lower severity: warn + continue
            tracing::warn!(
                customer_id = %customer.id,
                threat_type = ?threat.threat_type,
                confidence = threat.confidence,
                details = %threat.details,
                "⚠️ Threat detected — logged, request allowed"
            );
        }
    } else {
        tracing::debug!(
            customer_id = %customer.id,
            path = %path,
            "Admin path — skipping threat detection (Zero Trust already verified)"
        );
    }

    Ok(next.run(request).await)
}
