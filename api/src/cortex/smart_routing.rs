//! Stage 9: Smart Routing
//!
//! Selects the best fallback URL based on historical performance.

/// Make a smart routing decision for an endpoint.
/// If the endpoint has routing config with fallback URLs, picks the best one.
pub async fn decide_routing(
    pool: &sqlx::PgPool,
    endpoint_id: uuid::Uuid,
) -> Result<Option<serde_json::Value>, sqlx::Error> {
    // Get endpoint's routing config
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

    // Get current endpoint profile
    let profile: Option<(f64, i32)> = sqlx::query_as(
        "SELECT success_rate_1h, latency_p95 FROM endpoint_profiles WHERE endpoint_id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let (sr, p95) = profile.unwrap_or((100.0, 0));

    // If current performance is degraded, find the best fallback
    if sr < 95.0 || p95 > 5000 {
        // Score each fallback URL based on available data
        let mut best_url = urls.first().and_then(|v| v.as_str()).unwrap_or("primary").to_string();
        let mut best_score = 0.0f64;
        let mut url_scores = Vec::new();

        for url_val in urls.iter() {
            let url = match url_val.as_str() {
                Some(u) => u,
                None => continue,
            };

            // Look for recent deliveries to this URL in delivery_attempts
            // Use the endpoint's delivery data as a proxy since we track by endpoint_id
            let url_stats: Option<(i64, i64, f64)> = sqlx::query_as(
                r#"
                SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status_code BETWEEN 200 AND 299) as success,
                    COALESCE(AVG(duration_ms) FILTER (WHERE status_code BETWEEN 200 AND 299), 0.0) as avg_latency
                FROM delivery_attempts
                WHERE endpoint_id = $1
                  AND created_at > NOW() - INTERVAL '1 hour'
                  AND response_url = $2
                "#
            ).bind(endpoint_id).bind(url).fetch_optional(pool).await.unwrap_or(None);

            let score = if let Some((total, success, avg_lat)) = url_stats {
                if total > 0 {
                    let url_sr = (success as f64 / total as f64) * 100.0;
                    let lat_penalty = (avg_lat / 10000.0).min(1.0); // normalize: 10s = max penalty
                    url_sr * (1.0 - lat_penalty * 0.3) // SR weighted 70%, latency 30%
                } else {
                    50.0 // unknown URL gets neutral score
                }
            } else {
                50.0 // no data = neutral
            };

            url_scores.push(serde_json::json!({
                "url": url,
                "score": score,
            }));

            if score > best_score {
                best_score = score;
                best_url = url.to_string();
            }
        }

        super::CORTEX_METRICS.routing_decisions.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

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
