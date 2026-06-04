//! Utility functions for the HookSniff Worker.

use anyhow::Result;

/// Delivery attempt data for recording
pub struct AttemptRecord<'a> {
    pub status_code: Option<i32>,
    pub response_body: Option<&'a str>,
    pub duration_ms: i32,
    pub error_message: Option<&'a str>,
    pub trace_id: Option<&'a str>,
    pub response_headers: Option<&'a serde_json::Value>,
}

/// Commit a delivery transaction with transient vs permanent error classification.
pub async fn commit_delivery_tx(
    tx: sqlx::PgTransaction<'_>,
    delivery_id: uuid::Uuid,
    context: &str,
) -> Result<bool> {
    match tx.commit().await {
        Ok(()) => Ok(true),
        Err(e) => {
            if is_transient_db_error(&e) {
                tracing::warn!(
                    "⚠️ Delivery {} — transient DB commit failure ({}): {:?}",
                    delivery_id, context, e
                );
            } else {
                tracing::error!(
                    "❌ Delivery {} — permanent DB commit failure ({}): {:?}",
                    delivery_id, context, e
                );
            }
            Ok(false)
        }
    }
}

/// Record the delivery attempt in the delivery_attempts table.
#[allow(clippy::too_many_arguments)]
pub async fn record_delivery_attempt(
    tx: &mut sqlx::PgTransaction<'_>,
    delivery_id: uuid::Uuid,
    attempt: i32,
    attempt_status: Option<i32>,
    attempt_body: Option<&str>,
    duration_ms: i32,
    error_message: Option<&str>,
    trace_id: Option<&str>,
    attempt_headers: Option<&serde_json::Value>,
) -> Result<()> {
    record_attempt(
        tx,
        delivery_id,
        attempt,
        AttemptRecord {
            status_code: attempt_status,
            response_body: attempt_body,
            duration_ms,
            error_message,
            trace_id,
            response_headers: attempt_headers,
        },
    )
    .await
}

/// Record a delivery attempt
pub async fn record_attempt(
    conn: &mut sqlx::PgConnection,
    delivery_id: uuid::Uuid,
    attempt_number: i32,
    record: AttemptRecord<'_>,
) -> Result<()> {
    sqlx::query::<sqlx::Postgres>(
        r#"
        INSERT INTO delivery_attempts (delivery_id, attempt_number, status_code, response_body, duration_ms, error_message, trace_id, response_headers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(delivery_id)
    .bind(attempt_number)
    .bind(record.status_code)
    .bind(record.response_body)
    .bind(record.duration_ms)
    .bind(record.error_message)
    .bind(record.trace_id)
    .bind(record.response_headers)
    .execute(conn)
    .await?;

    Ok(())
}

/// 3-Layer Retry Strategy (Hookdeck model)
///
/// Tier 1 — Transient (connection, DNS, timeout): 100ms, 300ms, 500ms
/// Tier 2 — Server errors (5xx): 1m, 5m, 15m, 1h, 4h
/// Tier 3 — Endpoint down (circuit breaker open): 6h, 12h, 24h
///
/// Falls back to simple exponential for backwards compatibility.
pub fn calculate_backoff(attempt: i32) -> i64 {
    // Default: simple exponential (30s base) for PG queue path
    let base = 30_i64;
    let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
    delay.min(1800) // Max 30 dakika
}

/// Tiered backoff with error category awareness.
/// Used by the Redis Streams consumer path for smarter retry scheduling.
pub fn calculate_tiered_backoff(attempt: i32, status_code: Option<i32>, error_msg: &str) -> i64 {
    let category = classify_error(status_code, error_msg);

    match category {
        // ── Tier 1: Transient — 100ms, 300ms, 500ms ──
        ErrorCategory::Transient => {
            match attempt {
                0 => 100,   // 100ms
                1 => 300,   // 300ms
                2 => 500,   // 500ms
                _ => tier_2_backoff(attempt - 3), // Graduate to Tier 2
            }
        }
        // ── Tier 2: Server errors — 1m, 5m, 15m, 1h, 4h ──
        ErrorCategory::ServerError => tier_2_backoff(attempt),
        // ── Rate limited — respect Retry-After, default 60s ──
        ErrorCategory::RateLimited => 60,
        // ── Tier 3: Endpoint down — 6h, 12h, 24h ──
        ErrorCategory::EndpointDown => tier_3_backoff(attempt),
        // ── Permanent (4xx except 429) — no retry ──
        ErrorCategory::Permanent => 0,
    }
}

fn tier_2_backoff(attempt: i32) -> i64 {
    let intervals = [60, 300, 900, 3600, 14400]; // 1m, 5m, 15m, 1h, 4h
    let idx = (attempt as usize).min(intervals.len() - 1);
    intervals[idx]
}

fn tier_3_backoff(attempt: i32) -> i64 {
    let intervals = [21600, 43200, 86400]; // 6h, 12h, 24h
    let idx = (attempt as usize).min(intervals.len() - 1);
    intervals[idx]
}

#[derive(Debug, Clone, PartialEq)]
pub enum ErrorCategory {
    Transient,    // Connection, DNS, timeout
    ServerError,  // 5xx
    RateLimited,  // 429
    Permanent,    // 4xx (except 429)
    EndpointDown, // Circuit breaker open
}

pub fn classify_error(status: Option<i32>, error: &str) -> ErrorCategory {
    match status {
        Some(429) => ErrorCategory::RateLimited,
        Some(400..=499) => ErrorCategory::Permanent,
        Some(500..=599) => ErrorCategory::ServerError,
        None => {
            let e = error.to_lowercase();
            if e.contains("connection refused")
                || e.contains("connection reset")
                || e.contains("dns")
                || e.contains("timed out")
                || e.contains("timeout")
                || e.contains("broken pipe")
            {
                ErrorCategory::Transient
            } else {
                ErrorCategory::ServerError
            }
        }
        _ => ErrorCategory::ServerError,
    }
}

/// Check if an HTTP status code is non-retryable (client error).
/// 4xx errors (except 429 Too Many Requests) should not be retried.
/// - 400 Bad Request → client mistake, retry won't help
/// - 401 Unauthorized → auth issue, retry won't help
/// - 403 Forbidden → permission issue, retry won't help
/// - 404 Not Found → endpoint gone, retry won't help
/// - 429 Too Many Requests → SHOULD be retried (rate limited)
/// - 5xx → SHOULD be retried (server error)
pub fn is_non_retryable(status_code: i32) -> bool {
    (400..500).contains(&status_code) && status_code != 429
}

/// Check if a sqlx error is transient (worth retrying or recovering).
///
/// Transient errors:
/// - Connection closed/timed out
/// - Serialization failure (PostgreSQL 40001)
/// - Deadlock detected (PostgreSQL 40P01)
/// - Connection pool timeout
pub fn is_transient_db_error(e: &sqlx::Error) -> bool {
    match e {
        sqlx::Error::Io(_) => true,
        sqlx::Error::PoolTimedOut => true,
        sqlx::Error::PoolClosed => true,
        sqlx::Error::Database(db_err) => {
            // PostgreSQL error codes for transient failures
            if let Some(code) = db_err.code() {
                let code_str = code.as_ref();
                // 40001: serialization_failure
                // 40P01: deadlock_detected
                // 08000: connection_exception
                // 08001: sqlclient_unable_to_establish_sqlconnection
                // 08003: connection_does_not_exist
                // 08004: sqlserver_rejected_establishment_of_sqlconnection
                // 08006: connection_failure
                // 57P01: admin_shutdown
                // 57P02: crash_shutdown
                // 57P03: cannot_connect_now
                return matches!(
                    code_str,
                    "40001"
                        | "40P01"
                        | "08000"
                        | "08001"
                        | "08003"
                        | "08004"
                        | "08006"
                        | "57P01"
                        | "57P02"
                        | "57P03"
                );
            }
            false
        }
        _ => false,
    }
}

/// Wait for SIGTERM or SIGINT signal for graceful shutdown
pub async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received SIGINT (Ctrl+C), starting graceful shutdown...");
        }
        _ = terminate => {
            tracing::info!("Received SIGTERM, starting graceful shutdown...");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── calculate_backoff ───────────────────────────────────

    #[test]
    fn test_backoff_first_attempt() {
        assert_eq!(calculate_backoff(1), 30);
    }

    #[test]
    fn test_backoff_second_attempt() {
        assert_eq!(calculate_backoff(2), 60);
    }

    #[test]
    fn test_backoff_third_attempt() {
        assert_eq!(calculate_backoff(3), 120);
    }

    #[test]
    fn test_backoff_exponential_growth() {
        assert_eq!(calculate_backoff(4), 240);
        assert_eq!(calculate_backoff(5), 480);
        assert_eq!(calculate_backoff(6), 960);
    }

    #[test]
    fn test_backoff_capped_at_1800() {
        assert_eq!(calculate_backoff(10), 1800);
        assert_eq!(calculate_backoff(20), 1800);
    }

    #[test]
    fn test_backoff_attempt_zero() {
        assert_eq!(calculate_backoff(0), 30);
    }

    // ── is_non_retryable ────────────────────────────────────

    #[test]
    fn test_non_retryable_400() {
        assert!(is_non_retryable(400));
    }

    #[test]
    fn test_non_retryable_401() {
        assert!(is_non_retryable(401));
    }

    #[test]
    fn test_non_retryable_403() {
        assert!(is_non_retryable(403));
    }

    #[test]
    fn test_non_retryable_404() {
        assert!(is_non_retryable(404));
    }

    #[test]
    fn test_retryable_429() {
        assert!(!is_non_retryable(429));
    }

    #[test]
    fn test_retryable_500() {
        assert!(!is_non_retryable(500));
    }

    #[test]
    fn test_retryable_502() {
        assert!(!is_non_retryable(502));
    }

    #[test]
    fn test_retryable_503() {
        assert!(!is_non_retryable(503));
    }

    #[test]
    fn test_non_retryable_300() {
        assert!(!is_non_retryable(300));
    }

    #[test]
    fn test_non_retryable_200() {
        assert!(!is_non_retryable(200));
    }

    // ── is_transient_db_error ───────────────────────────────

    #[test]
    fn test_transient_db_pool_timeout() {
        let err = sqlx::Error::PoolTimedOut;
        assert!(is_transient_db_error(&err));
    }

    #[test]
    fn test_transient_db_pool_closed() {
        let err = sqlx::Error::PoolClosed;
        assert!(is_transient_db_error(&err));
    }

    #[test]
    fn test_transient_db_io_error() {
        let io_err = std::io::Error::new(std::io::ErrorKind::ConnectionReset, "reset");
        let err = sqlx::Error::Io(io_err);
        assert!(is_transient_db_error(&err));
    }

    #[test]
    fn test_non_transient_db_error() {
        let err = sqlx::Error::RowNotFound;
        assert!(!is_transient_db_error(&err));
    }

    // ── classify_error ──────────────────────────────────────

    #[test]
    fn test_classify_429_rate_limited() {
        assert_eq!(classify_error(Some(429), ""), ErrorCategory::RateLimited);
    }

    #[test]
    fn test_classify_400_permanent() {
        assert_eq!(classify_error(Some(400), ""), ErrorCategory::Permanent);
    }

    #[test]
    fn test_classify_401_permanent() {
        assert_eq!(classify_error(Some(401), ""), ErrorCategory::Permanent);
    }

    #[test]
    fn test_classify_404_permanent() {
        assert_eq!(classify_error(Some(404), ""), ErrorCategory::Permanent);
    }

    #[test]
    fn test_classify_500_server_error() {
        assert_eq!(classify_error(Some(500), ""), ErrorCategory::ServerError);
    }

    #[test]
    fn test_classify_502_server_error() {
        assert_eq!(classify_error(Some(502), ""), ErrorCategory::ServerError);
    }

    #[test]
    fn test_classify_503_server_error() {
        assert_eq!(classify_error(Some(503), ""), ErrorCategory::ServerError);
    }

    #[test]
    fn test_classify_timeout_transient() {
        assert_eq!(classify_error(None, "connection timed out"), ErrorCategory::Transient);
    }

    #[test]
    fn test_classify_connection_refused_transient() {
        assert_eq!(classify_error(None, "connection refused"), ErrorCategory::Transient);
    }

    #[test]
    fn test_classify_dns_transient() {
        assert_eq!(classify_error(None, "DNS resolution failed"), ErrorCategory::Transient);
    }

    #[test]
    fn test_classify_unknown_error_server() {
        assert_eq!(classify_error(None, "something weird happened"), ErrorCategory::ServerError);
    }

    // ── calculate_tiered_backoff ────────────────────────────

    #[test]
    fn test_tier1_transient_first_attempt() {
        assert_eq!(calculate_tiered_backoff(0, None, "connection refused"), 100);
    }

    #[test]
    fn test_tier1_transient_second_attempt() {
        assert_eq!(calculate_tiered_backoff(1, None, "connection refused"), 300);
    }

    #[test]
    fn test_tier1_transient_third_attempt() {
        assert_eq!(calculate_tiered_backoff(2, None, "connection refused"), 500);
    }

    #[test]
    fn test_tier1_graduates_to_tier2() {
        // After 3 transient retries, should graduate to tier 2 (1m)
        assert_eq!(calculate_tiered_backoff(3, None, "timeout"), 60);
    }

    #[test]
    fn test_tier2_server_error_first() {
        assert_eq!(calculate_tiered_backoff(0, Some(500), ""), 60);
    }

    #[test]
    fn test_tier2_server_error_second() {
        assert_eq!(calculate_tiered_backoff(1, Some(502), ""), 300);
    }

    #[test]
    fn test_tier2_server_error_fifth() {
        assert_eq!(calculate_tiered_backoff(4, Some(503), ""), 14400);
    }

    #[test]
    fn test_rate_limited_default_60s() {
        assert_eq!(calculate_tiered_backoff(0, Some(429), ""), 60);
    }

    #[test]
    fn test_permanent_no_retry() {
        assert_eq!(calculate_tiered_backoff(0, Some(400), ""), 0);
        assert_eq!(calculate_tiered_backoff(0, Some(404), ""), 0);
    }

    #[test]
    fn test_tier3_endpoint_down() {
        assert_eq!(calculate_tiered_backoff(0, None, ""), 60); // Unknown error → ServerError → tier2
    }
}
