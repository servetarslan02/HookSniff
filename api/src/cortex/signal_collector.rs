//! Stage 1: Hourly Stats Aggregator
//!
//! Aggregates delivery data into hourly summaries per endpoint.
//! Runs every hour at XX:01. Uses only existing tables (deliveries + delivery_attempts).

use chrono::{DateTime, Utc};

/// Aggregate hourly stats for a specific hour window.
/// Counts DISTINCT deliveries (not attempts), uses only latest attempt's latency.
pub async fn aggregate_hourly_stats(
    pool: &sqlx::PgPool,
    hour_start: DateTime<Utc>,
) -> Result<u64, sqlx::Error> {
    let hour_end = hour_start + chrono::Duration::hours(1);
    let result = sqlx::query(
        r#"
        INSERT INTO endpoint_hourly_stats
            (endpoint_id, hour_start, total_deliveries, successful, failed,
             avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown)
        WITH latest_attempts AS (
            SELECT DISTINCT ON (da.delivery_id)
                da.delivery_id,
                da.duration_ms,
                da.error_message,
                da.status_code
            FROM delivery_attempts da
            JOIN deliveries d ON d.id = da.delivery_id
            WHERE d.created_at >= $1 AND d.created_at < $2
            ORDER BY da.delivery_id, da.attempt_number DESC
        ),
        endpoint_stats AS (
            SELECT
                d.endpoint_id,
                COUNT(DISTINCT d.id) as total,
                COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'delivered') as ok,
                COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('failed', 'dead_letter')) as fail,
                COALESCE(AVG(la.duration_ms), 0)::INT as avg_lat,
                COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p50,
                COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p95,
                COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p99
            FROM deliveries d
            LEFT JOIN latest_attempts la ON la.delivery_id = d.id
            WHERE d.created_at >= $1 AND d.created_at < $2
            GROUP BY d.endpoint_id
        ),
        error_stats AS (
            SELECT
                d_sub.endpoint_id,
                COALESCE(jsonb_object_agg(
                    COALESCE(NULLIF(la_sub.err_msg, ''), 'success'),
                    la_sub.cnt
                ), '{}'::jsonb) as breakdown
            FROM (
                SELECT DISTINCT endpoint_id FROM deliveries
                WHERE created_at >= $1 AND created_at < $2
            ) d_sub
            LEFT JOIN (
                SELECT
                    d2.endpoint_id,
                    la2.error_message as err_msg,
                    COUNT(*) as cnt
                FROM deliveries d2
                JOIN latest_attempts la2 ON la2.delivery_id = d2.id
                WHERE d2.created_at >= $1 AND d2.created_at < $2
                GROUP BY d2.endpoint_id, la2.error_message
            ) la_sub ON la_sub.endpoint_id = d_sub.endpoint_id
            GROUP BY d_sub.endpoint_id
        )
        SELECT
            es.endpoint_id,
            $1,
            es.total,
            es.ok,
            es.fail,
            es.avg_lat,
            es.p50,
            es.p95,
            es.p99,
            COALESCE(err.breakdown, '{}'::jsonb)
        FROM endpoint_stats es
        LEFT JOIN error_stats err ON err.endpoint_id = es.endpoint_id
        ON CONFLICT (endpoint_id, hour_start) DO UPDATE SET
            total_deliveries = EXCLUDED.total_deliveries,
            successful = EXCLUDED.successful,
            failed = EXCLUDED.failed,
            avg_latency_ms = EXCLUDED.avg_latency_ms,
            p50_latency_ms = EXCLUDED.p50_latency_ms,
            p95_latency_ms = EXCLUDED.p95_latency_ms,
            p99_latency_ms = EXCLUDED.p99_latency_ms,
            error_breakdown = EXCLUDED.error_breakdown
        "#
    )
    .bind(hour_start)
    .bind(hour_end)
    .execute(pool)
    .await?;
    Ok(result.rows_affected())
}
