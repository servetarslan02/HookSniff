//! Stage 2: Profile Engine
//!
//! Builds a behavioral profile for each endpoint using hourly stats.
//! Single query, all time windows (1h/24h/7d), cascade delete with endpoint.

use sqlx::PgPool;
use uuid::Uuid;

#[derive(sqlx::FromRow)]
struct ProfileRow {
    total_7d: i64,
    successful_7d: i64,
    failed_7d: i64,
    avg_lat: f64,
    p95_lat: f64,
    p99_lat: f64,
    lat_stddev: f64,
    total_24h: i64,
    successful_24h: i64,
    total_1h: i64,
    successful_1h: i64,
    avg_per_hour: f64,
    peak_per_hour: i32,
    hours_with_data: i32,
    busiest: Option<i32>,
    quietest: Option<i32>,
    weekday_avg: f64,
    weekend_avg: f64,
    dominant_error: Option<String>,
    error_dist: serde_json::Value,
}

/// Update profile for a single endpoint — one query, all windows.
pub async fn update_profile(pool: &PgPool, endpoint_id: Uuid) -> Result<(), sqlx::Error> {
    let stats = sqlx::query_as::<_, ProfileRow>(
        r#"
        WITH hourly_data AS (
            SELECT hour_start, total_deliveries, successful, failed,
                   avg_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown,
                   EXTRACT(HOUR FROM hour_start)::INT as hour_of_day,
                   EXTRACT(DOW FROM hour_start)::INT as day_of_week
            FROM endpoint_hourly_stats
            WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '7 days'
        ),
        windowed AS (
            SELECT
                SUM(total_deliveries)::BIGINT as total_7d,
                SUM(successful)::BIGINT as successful_7d,
                SUM(failed)::BIGINT as failed_7d,
                COALESCE(AVG(avg_latency_ms), 0)::FLOAT as avg_lat,
                COALESCE(AVG(p95_latency_ms), 0)::FLOAT as p95_lat,
                COALESCE(AVG(p99_latency_ms), 0)::FLOAT as p99_lat,
                COALESCE(STDDEV(avg_latency_ms), 0)::FLOAT as lat_stddev,
                COUNT(*)::INT as hours_with_data,
                COALESCE(SUM(total_deliveries) FILTER (WHERE hour_start > NOW() - INTERVAL '24 hours'), 0)::BIGINT as total_24h,
                COALESCE(SUM(successful) FILTER (WHERE hour_start > NOW() - INTERVAL '24 hours'), 0)::BIGINT as successful_24h,
                COALESCE(SUM(total_deliveries) FILTER (WHERE hour_start > NOW() - INTERVAL '1 hour'), 0)::BIGINT as total_1h,
                COALESCE(SUM(successful) FILTER (WHERE hour_start > NOW() - INTERVAL '1 hour'), 0)::BIGINT as successful_1h,
                COALESCE(AVG(total_deliveries), 0)::FLOAT as avg_per_hour,
                COALESCE(MAX(total_deliveries), 0)::INT as peak_per_hour,
                (SELECT hour_of_day FROM hourly_data ORDER BY total_deliveries DESC LIMIT 1) as busiest,
                (SELECT hour_of_day FROM hourly_data ORDER BY total_deliveries ASC LIMIT 1) as quietest
            FROM hourly_data
        ),
        weekday_weekend AS (
            SELECT
                COALESCE(AVG(total_deliveries) FILTER (WHERE day_of_week BETWEEN 1 AND 5), 0)::FLOAT as weekday_avg,
                COALESCE(AVG(total_deliveries) FILTER (WHERE day_of_week IN (0, 6)), 0)::FLOAT as weekend_avg
            FROM hourly_data
        ),
        error_dist AS (
            SELECT COALESCE(jsonb_object_agg(kv.key, total), '{}'::jsonb) as dist
            FROM (
                SELECT kv.key, SUM((kv.value::TEXT)::INT) as total
                FROM hourly_data h, LATERAL jsonb_each(h.error_breakdown) kv
                GROUP BY kv.key LIMIT 20
            ) sub
        ),
        dominant AS (
            SELECT COALESCE(NULLIF(kv.key, ''), 'success') as err_msg
            FROM hourly_data h, LATERAL jsonb_each(h.error_breakdown) kv
            GROUP BY kv.key ORDER BY SUM((kv.value::TEXT)::INT) DESC LIMIT 1
        )
        SELECT w.total_7d, w.successful_7d, w.failed_7d, w.avg_lat, w.p95_lat, w.p99_lat,
               w.lat_stddev, w.total_24h, w.successful_24h, w.total_1h, w.successful_1h,
               w.avg_per_hour, w.peak_per_hour, w.hours_with_data, w.busiest, w.quietest,
               ww.weekday_avg, ww.weekend_avg, d.err_msg, ed.dist
        FROM windowed w
        CROSS JOIN weekday_weekend ww
        CROSS JOIN error_dist ed
        LEFT JOIN dominant d ON true
        "#
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    let row = match stats {
        Some(r) => r,
        None => return Ok(()),
    };
    if row.total_7d == 0 { return Ok(()); }

    let sr7 = (row.successful_7d as f64 / row.total_7d as f64) * 100.0;
    let sr24 = if row.total_24h > 0 { (row.successful_24h as f64 / row.total_24h as f64) * 100.0 } else { sr7 };
    let sr1 = if row.total_1h > 0 { (row.successful_1h as f64 / row.total_1h as f64) * 100.0 } else { sr24 };
    let size_conf = (row.total_7d as f64 / 1000.0).min(1.0);
    let fresh_conf = (row.hours_with_data as f64 / 168.0).min(1.0);
    let confidence = (size_conf * 0.7 + fresh_conf * 0.3).min(1.0);

    sqlx::query(
        r#"
        INSERT INTO endpoint_profiles
            (endpoint_id, latency_p50, latency_p95, latency_p99, latency_stddev,
             success_rate_1h, success_rate_24h, success_rate_7d, baseline_success_rate,
             avg_deliveries_per_hour, peak_deliveries_per_hour, dominant_error_type,
             error_distribution, busiest_hour, quietest_hour, weekday_avg, weekend_avg,
             sample_size, confidence, last_updated, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW())
        ON CONFLICT (endpoint_id) DO UPDATE SET
            latency_p50=EXCLUDED.latency_p50, latency_p95=EXCLUDED.latency_p95,
            latency_p99=EXCLUDED.latency_p99, latency_stddev=EXCLUDED.latency_stddev,
            success_rate_1h=EXCLUDED.success_rate_1h, success_rate_24h=EXCLUDED.success_rate_24h,
            success_rate_7d=EXCLUDED.success_rate_7d, baseline_success_rate=EXCLUDED.baseline_success_rate,
            avg_deliveries_per_hour=EXCLUDED.avg_deliveries_per_hour,
            peak_deliveries_per_hour=EXCLUDED.peak_deliveries_per_hour,
            dominant_error_type=EXCLUDED.dominant_error_type, error_distribution=EXCLUDED.error_distribution,
            busiest_hour=EXCLUDED.busiest_hour, quietest_hour=EXCLUDED.quietest_hour,
            weekday_avg=EXCLUDED.weekday_avg, weekend_avg=EXCLUDED.weekend_avg,
            sample_size=EXCLUDED.sample_size, confidence=EXCLUDED.confidence,
            last_updated=NOW(), updated_at=NOW()
        "#
    )
    .bind(endpoint_id).bind(row.avg_lat as i32).bind(row.p95_lat as i32).bind(row.p99_lat as i32)
    .bind(row.lat_stddev).bind(sr1).bind(sr24).bind(sr7)
    .bind(row.avg_per_hour).bind(row.peak_per_hour)
    .bind(&row.dominant_error).bind(&row.error_dist)
    .bind(row.busiest).bind(row.quietest).bind(row.weekday_avg).bind(row.weekend_avg)
    .bind(row.total_7d as i32).bind(confidence)
    .execute(pool).await?;

    Ok(())
}

/// Update all active endpoint profiles.
pub async fn update_all_profiles(pool: &PgPool) -> Result<u64, sqlx::Error> {
    let endpoints: Vec<(Uuid,)> = sqlx::query_as(
        "SELECT DISTINCT ehs.endpoint_id FROM endpoint_hourly_stats ehs
         JOIN endpoints e ON e.id = ehs.endpoint_id WHERE e.is_active = true"
    ).fetch_all(pool).await?;

    let mut updated = 0u64;
    for (eid,) in endpoints {
        if update_profile(pool, eid).await.is_ok() { updated += 1; }
    }
    Ok(updated)
}
