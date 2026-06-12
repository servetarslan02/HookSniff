//! Stage 9: Smart Routing
//!
//! Selects the best fallback URL based on historical performance.
//! Batch mode: fetches all data in 3 queries, processes in-memory.

use sqlx::PgPool;
use uuid::Uuid;

/// Batch smart routing: process ALL endpoints with routing config.
/// Returns count of routing decisions made.
pub async fn run_smart_routing_batch(pool: &PgPool) -> Result<u64, sqlx::Error> {
    // 1. BATCH: All endpoints with routing config + profile in ONE query
    let endpoints: Vec<(Uuid, serde_json::Value, f64, i32)> = sqlx::query_as(
        r#"
        SELECT e.id, e.routing_config,
               COALESCE(p.success_rate_1h, 100.0)::FLOAT as sr,
               COALESCE(p.latency_p95, 0) as p95
        FROM endpoints e
        LEFT JOIN endpoint_profiles p ON p.endpoint_id = e.id
        WHERE e.is_active = true
          AND e.routing_config IS NOT NULL
          AND (e.routing_config->>'fallback_urls') IS NOT NULL
          AND jsonb_array_length(e.routing_config->'fallback_urls') >= 2
        "#
    ).fetch_all(pool).await?;

    if endpoints.is_empty() { return Ok(0); }

    // 2. Filter to only degraded endpoints (SR < 95% or p95 > 5000ms)
    let degraded: Vec<(Uuid, serde_json::Value, f64, i32)> = endpoints
        .into_iter()
        .filter(|(_, _, sr, p95)| *sr < 95.0 || *p95 > 5000)
        .collect();

    if degraded.is_empty() { return Ok(0); }

    // 3. BATCH: Get delivery stats for ALL degraded endpoints in ONE query
    let endpoint_ids: Vec<Uuid> = degraded.iter().map(|(eid, _, _, _)| *eid).collect();
    let stats_rows: Vec<(Uuid, String, i64, i64, f64)> = sqlx::query_as(
        r#"
        SELECT d.endpoint_id,
               COALESCE(da.response_url, '') as url,
               COUNT(*) as total,
               COUNT(*) FILTER (WHERE da.status_code BETWEEN 200 AND 299) as success,
               COALESCE(AVG(da.duration_ms) FILTER (WHERE da.status_code BETWEEN 200 AND 299), 0.0) as avg_latency
        FROM delivery_attempts da
        JOIN deliveries d ON d.id = da.delivery_id
        WHERE d.endpoint_id = ANY($1)
          AND da.created_at > NOW() - INTERVAL '1 hour'
          AND da.response_url IS NOT NULL
          AND da.response_url != ''
        GROUP BY d.endpoint_id, da.response_url
        "#
    ).bind(&endpoint_ids).fetch_all(pool).await?;

    // Group stats by (endpoint_id, url)
    let mut stats_map: std::collections::HashMap<(Uuid, String), (i64, i64, f64)> =
        std::collections::HashMap::new();
    for (eid, url, total, success, avg_lat) in stats_rows {
        stats_map.insert((eid, url), (total, success, avg_lat));
    }

    // 4. Process each degraded endpoint in-memory
    let mut decisions = 0u64;
    for (endpoint_id, routing_config, sr, p95) in &degraded {
        let urls = match routing_config.get("fallback_urls").and_then(|v| v.as_array()) {
            Some(urls) => urls,
            None => continue,
        };

        let mut best_url = urls.first().and_then(|v| v.as_str()).unwrap_or("primary").to_string();
        let mut best_score = 0.0f64;
        let mut url_scores = Vec::new();

        for url_val in urls.iter() {
            let url = match url_val.as_str() {
                Some(u) => u,
                None => continue,
            };

            let score = if let Some((total, success, avg_lat)) = stats_map.get(&(*endpoint_id, url.to_string())) {
                if *total > 0 {
                    let url_sr = (*success as f64 / *total as f64) * 100.0;
                    let lat_penalty = (avg_lat / 10000.0).min(1.0);
                    url_sr * (1.0 - lat_penalty * 0.3)
                } else {
                    50.0
                }
            } else {
                50.0
            };

            url_scores.push(serde_json::json!({ "url": url, "score": score }));
            if score > best_score {
                best_score = score;
                best_url = url.to_string();
            }
        }

        // Record decision
        let _ = sqlx::query(
            "INSERT INTO cortex_routing_decisions (endpoint_id, recommended_url, reason, alternatives, created_at) \
             VALUES ($1, $2, $3, $4, NOW())"
        )
        .bind(endpoint_id)
        .bind(&best_url)
        .bind(format!("Current SR {:.1}%, p95 {}ms", sr, p95))
        .bind(serde_json::json!(url_scores))
        .execute(pool)
        .await;

        decisions += 1;
    }

    if decisions > 0 {
        super::CORTEX_METRICS.routing_decisions.fetch_add(decisions, std::sync::atomic::Ordering::Relaxed);
        tracing::info!("🔀 Smart routing: {} decisions for degraded endpoints", decisions);
    }

    Ok(decisions)
}

/// Single-endpoint routing decision (used by healing engine for fallback_url_switch).
pub async fn decide_routing(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<Option<serde_json::Value>, sqlx::Error> {
    let routing: Option<(serde_json::Value,)> = sqlx::query_as(
        "SELECT routing_config FROM endpoints WHERE id = $1 AND routing_config IS NOT NULL"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let config = match routing {
        Some((c,)) => c,
        None => return Ok(None),
    };

    let urls = match config.get("fallback_urls").and_then(|v| v.as_array()) {
        Some(urls) => urls,
        None => return Ok(None),
    };
    if urls.len() < 2 { return Ok(None); }

    let profile: Option<(f64, i32)> = sqlx::query_as(
        "SELECT success_rate_1h, latency_p95 FROM endpoint_profiles WHERE endpoint_id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let (sr, p95) = profile.unwrap_or((100.0, 0));

    if sr < 95.0 || p95 > 5000 {
        let mut best_url = urls.first().and_then(|v| v.as_str()).unwrap_or("primary").to_string();
        let mut best_score = 0.0f64;
        let mut url_scores = Vec::new();

        for url_val in urls.iter() {
            let url = match url_val.as_str() {
                Some(u) => u,
                None => continue,
            };

            let url_stats: Option<(i64, i64, f64)> = sqlx::query_as(
                "SELECT COUNT(*), COUNT(*) FILTER (WHERE da.status_code BETWEEN 200 AND 299), \
                 COALESCE(AVG(da.duration_ms) FILTER (WHERE da.status_code BETWEEN 200 AND 299), 0.0) \
                 FROM delivery_attempts da JOIN deliveries d ON d.id = da.delivery_id \
                 WHERE d.endpoint_id = $1 AND da.created_at > NOW() - INTERVAL '1 hour' AND da.response_url = $2"
            ).bind(endpoint_id).bind(url).fetch_optional(pool).await.unwrap_or(None);

            let score = if let Some((total, success, avg_lat)) = url_stats {
                if total > 0 {
                    let url_sr = (success as f64 / total as f64) * 100.0;
                    let lat_penalty = (avg_lat / 10000.0).min(1.0);
                    url_sr * (1.0 - lat_penalty * 0.3)
                } else { 50.0 }
            } else { 50.0 };

            url_scores.push(serde_json::json!({ "url": url, "score": score }));
            if score > best_score {
                best_score = score;
                best_url = url.to_string();
            }
        }

        let _ = sqlx::query(
            "INSERT INTO cortex_routing_decisions (endpoint_id, recommended_url, reason, alternatives, created_at) \
             VALUES ($1, $2, $3, $4, NOW())"
        )
        .bind(endpoint_id).bind(&best_url)
        .bind(format!("Current SR {:.1}%, p95 {}ms", sr, p95))
        .bind(serde_json::json!(url_scores))
        .execute(pool).await;

        return Ok(Some(serde_json::json!({
            "decision": "switch",
            "reason": format!("Current SR {:.1}%, p95 {}ms", sr, p95),
            "recommended_url": best_url,
            "recommended_score": best_score,
            "alternatives": url_scores,
        })));
    }

    Ok(None)
}
