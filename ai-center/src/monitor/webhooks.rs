use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct WebhookHealth {
    pub total_deliveries_1h: i64,
    pub successful_1h: i64,
    pub failed_1h: i64,
    pub pending_1h: i64,
    pub success_rate_1h: f64,
    pub avg_attempts: f64,
    pub dead_letters_1h: i64,
    pub slow_endpoints: Vec<SlowEndpoint>,
    pub failing_endpoints: Vec<FailingEndpoint>,
}

#[derive(Debug, Serialize)]
pub struct SlowEndpoint {
    pub endpoint_id: Uuid,
    pub url: String,
    pub avg_response_ms: f64,
}

#[derive(Debug, Serialize)]
pub struct FailingEndpoint {
    pub endpoint_id: Uuid,
    pub url: String,
    pub total: i64,
    pub failed: i64,
    pub failure_rate: f64,
}

pub async fn collect_webhook_health(pool: &PgPool) -> anyhow::Result<WebhookHealth> {
    // Overall stats for last hour
    let stats: (i64, i64, i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'delivered'),
            COUNT(*) FILTER (WHERE status = 'failed'),
            COUNT(*) FILTER (WHERE status = 'pending')
        FROM deliveries
        WHERE created_at > now() - INTERVAL '1 hour'
        "#,
    )
    .fetch_one(pool)
    .await?;

    let success_rate = if stats.0 > 0 {
        (stats.1 as f64 / stats.0 as f64) * 100.0
    } else {
        100.0
    };

    // Average attempts
    let avg_attempts: (Option<f64>,) = sqlx::query_as(
        "SELECT AVG(attempt_count) FROM deliveries WHERE created_at > now() - INTERVAL '1 hour'",
    )
    .fetch_one(pool)
    .await?;

    // Dead letters in last hour
    let dead_letters: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM dead_letters WHERE created_at > now() - INTERVAL '1 hour'",
    )
    .fetch_one(pool)
    .await?;

    // Slow endpoints (avg response > 5s in last hour)
    let slow = sqlx::query_as::<_, (Uuid, String, f64)>(
        r#"
        SELECT d.endpoint_id, e.url, AVG(da.duration_ms)::FLOAT as avg_ms
        FROM delivery_attempts da
        JOIN deliveries d ON da.delivery_id = d.id
        JOIN endpoints e ON d.endpoint_id = e.id
        WHERE da.created_at > now() - INTERVAL '1 hour'
          AND da.duration_ms IS NOT NULL
        GROUP BY d.endpoint_id, e.url
        HAVING AVG(da.duration_ms) > 5000
        ORDER BY avg_ms DESC
        LIMIT 10
        "#,
    )
    .fetch_all(pool)
    .await?;

    let slow_endpoints: Vec<SlowEndpoint> = slow
        .into_iter()
        .map(|(id, url, ms)| SlowEndpoint {
            endpoint_id: id,
            url,
            avg_response_ms: ms,
        })
        .collect();

    // Failing endpoints (>20% failure rate in last hour)
    let failing = sqlx::query_as::<_, (Uuid, String, i64, i64)>(
        r#"
        SELECT
            d.endpoint_id,
            e.url,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE d.status = 'failed') as failed
        FROM deliveries d
        JOIN endpoints e ON d.endpoint_id = e.id
        WHERE d.created_at > now() - INTERVAL '1 hour'
        GROUP BY d.endpoint_id, e.url
        HAVING COUNT(*) FILTER (WHERE d.status = 'failed')::FLOAT / COUNT(*)::FLOAT > 0.2
           AND COUNT(*) >= 5
        ORDER BY failed DESC
        LIMIT 10
        "#,
    )
    .fetch_all(pool)
    .await?;

    let failing_endpoints: Vec<FailingEndpoint> = failing
        .into_iter()
        .map(|(id, url, total, failed)| FailingEndpoint {
            endpoint_id: id,
            url,
            total,
            failed,
            failure_rate: if total > 0 {
                (failed as f64 / total as f64) * 100.0
            } else {
                0.0
            },
        })
        .collect();

    Ok(WebhookHealth {
        total_deliveries_1h: stats.0,
        successful_1h: stats.1,
        failed_1h: stats.2,
        pending_1h: stats.3,
        success_rate_1h: success_rate,
        avg_attempts: avg_attempts.0.unwrap_or(0.0),
        dead_letters_1h: dead_letters.0,
        slow_endpoints,
        failing_endpoints,
    })
}
