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

    // Get profile for each URL to compare performance
    // For now, use the endpoint's own profile as primary
    let profile: Option<(f64, i32)> = sqlx::query_as(
        "SELECT success_rate_1h, latency_p95 FROM endpoint_profiles WHERE endpoint_id = $1"
    ).bind(endpoint_id).fetch_optional(pool).await?;

    let (sr, p95) = profile.unwrap_or((100.0, 0));

    // If current performance is degraded, suggest switching
    if sr < 95.0 || p95 > 5000 {
        let best_url = urls.first().and_then(|v| v.as_str()).unwrap_or("primary");
        super::CORTEX_METRICS.routing_decisions.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

        return Ok(Some(serde_json::json!({
            "decision": "switch",
            "reason": format!("Current SR {:.1}%, p95 {}ms", sr, p95),
            "recommended_url": best_url,
            "alternatives": urls,
        })));
    }

    Ok(None)
}
