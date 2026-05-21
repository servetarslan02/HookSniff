//! Background job: push business metrics to Grafana Cloud via OTLP every 60 seconds.
//!
//! This replaces the external `monitor.sh` script by running inside the API process.
//! It queries the DB for delivery/customer/endpoint stats and pushes them as OTLP gauges.

use serde_json::json;
use sqlx::PgPool;
use std::time::Duration;

/// Run the metrics push loop. Call this once at startup via `tokio::spawn`.
pub async fn run(pool: PgPool) {
    // Use dedicated GRAFANA_OTLP_ENDPOINT if available, otherwise fall back to OTEL endpoint
    // Note: OTEL_EXPORTER_OTLP_ENDPOINT may point to Sentry (for traces), not Grafana (for metrics)
    let otlp_endpoint = match std::env::var("GRAFANA_OTLP_ENDPOINT") {
        Ok(v) => v,
        Err(_) => match std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT") {
            Ok(v) => {
                // If the OTEL endpoint is Sentry, metrics push won't work — skip it
                if v.contains("sentry.io") || v.contains("ingest") {
                    tracing::info!("📊 Metrics push disabled — OTEL endpoint is Sentry (not Grafana). Set GRAFANA_OTLP_ENDPOINT to enable.");
                    loop {
                        tokio::time::sleep(Duration::from_secs(3600)).await;
                    }
                }
                v
            }
            Err(_) => "https://otlp-gateway-prod-eu-west-2.grafana.net".to_string(),
        },
    };
    let otlp_headers = std::env::var("GRAFANA_OTLP_HEADERS")
        .or_else(|_| std::env::var("OTEL_EXPORTER_OTLP_HEADERS"))
        .unwrap_or_default();

    // If no auth headers available, metrics push will fail — disable gracefully
    if otlp_headers.is_empty() {
        tracing::info!("📊 Metrics push disabled — no OTLP auth headers set. Set GRAFANA_OTLP_HEADERS or OTEL_EXPORTER_OTLP_HEADERS to enable.");
        loop {
            tokio::time::sleep(Duration::from_secs(3600)).await;
        }
    }

    // Parse OTLP headers (format: "key1=value1,key2=value2")
    let mut auth_header = String::new();
    let mut extra_headers: Vec<(String, String)> = Vec::new();
    for header in otlp_headers.split(',') {
        let h = header.trim();
        if let Some((key, value)) = h.split_once('=').or_else(|| h.split_once(':')) {
            let k = key.trim().to_string();
            let v = value.trim().to_string();
            if k.eq_ignore_ascii_case("authorization") {
                auth_header = v;
            } else if k.eq_ignore_ascii_case("x-sentry-auth") {
                extra_headers.push((k, v));
            }
        }
    }

    // If no auth header from env, try to build from instance ID + token
    if auth_header.is_empty() {
        if let (Ok(inst_id), Ok(token)) = (
            std::env::var("GRAFANA_INSTANCE_ID"),
            std::env::var("GRAFANA_OTLP_TOKEN"),
        ) {
            use base64::Engine;
            let encoded = base64::engine::general_purpose::STANDARD
                .encode(format!("{}:{}", inst_id, token));
            auth_header = format!("Basic {}", encoded);
        }
    }

    let otlp_url = format!("{}/v1/metrics", otlp_endpoint.trim_end_matches('/'));
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .expect("reqwest client");

    tracing::info!("📊 Metrics push job started — pushing to {} every 60s", otlp_url);

    loop {
        tokio::time::sleep(Duration::from_secs(60)).await;

        // Collect DB stats
        match collect_db_stats(&pool).await {
            Ok(stats) => {
                // Fetch cache metrics from /metrics endpoint (localhost)
                let (cache_hits, cache_misses, cache_hit_rate, active_conns) =
                    fetch_cache_metrics(&client).await;

                // Compute success rate
                let deliveries_1h = stats.get("deliveries_1h").and_then(|v| v.as_f64()).unwrap_or(0.0);
                let delivered_1h = stats.get("delivered_1h").and_then(|v| v.as_f64()).unwrap_or(0.0);
                let success_rate_1h = if deliveries_1h > 0.0 {
                    (delivered_1h / deliveries_1h) * 100.0
                } else {
                    100.0
                };

                // Check API health
                let api_ok = check_api_health(&client).await;
                let (db_latency, queue_pending, queue_failed, queue_latency) =
                    fetch_health_stats(&client).await;

                // Build OTLP payload
                let now_ns = chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0) as u64;
                let metrics = vec![
                    gauge("hooksniff_api_healthy", if api_ok { 1.0 } else { 0.0 }, now_ns),
                    gauge("hooksniff_db_latency_ms", db_latency, now_ns),
                    gauge("hooksniff_queue_pending", queue_pending, now_ns),
                    gauge(
                        "hooksniff_queue_processing",
                        stats.get("queue_processing").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_queue_delivered",
                        stats.get("queue_delivered").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge("hooksniff_queue_failed_1h", queue_failed, now_ns),
                    gauge("hooksniff_queue_latency_ms", queue_latency, now_ns),
                    gauge("hooksniff_deliveries_1h", deliveries_1h, now_ns),
                    gauge("hooksniff_delivered_1h", delivered_1h, now_ns),
                    gauge(
                        "hooksniff_failed_1h",
                        stats.get("failed_1h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_deliveries_24h",
                        stats.get("deliveries_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_delivered_24h",
                        stats.get("delivered_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_failed_24h",
                        stats.get("failed_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge("hooksniff_success_rate_1h", success_rate_1h, now_ns),
                    gauge(
                        "hooksniff_endpoints_total",
                        stats.get("total_endpoints").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_endpoints_new_24h",
                        stats.get("new_endpoints_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_customers_total",
                        stats.get("total_customers").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_customers_new_24h",
                        stats.get("new_customers_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_customers_new_7d",
                        stats.get("new_customers_7d").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_active_users_24h",
                        stats.get("active_users_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_plan_free",
                        stats.get("plan_free").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_plan_developer",
                        stats.get("plan_developer").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_plan_startup",
                        stats.get("plan_startup").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_plan_pro",
                        stats.get("plan_pro").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_plan_enterprise",
                        stats.get("plan_enterprise").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_logins_1h",
                        stats.get("logins_1h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_failed_actions_1h",
                        stats.get("failed_actions_1h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_audit_events_24h",
                        stats.get("audit_events_24h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge(
                        "hooksniff_rate_limited_1h",
                        stats.get("rate_limited_1h").and_then(|v| v.as_f64()).unwrap_or(0.0),
                        now_ns,
                    ),
                    gauge("hooksniff_cache_hits", cache_hits, now_ns),
                    gauge("hooksniff_cache_misses", cache_misses, now_ns),
                    gauge("hooksniff_cache_hit_rate", cache_hit_rate, now_ns),
                    gauge("hooksniff_active_connections", active_conns, now_ns),
                ];

                let payload = json!({
                    "resourceMetrics": [{
                        "resource": {
                            "attributes": [{
                                "key": "service.name",
                                "value": {"stringValue": "hooksniff"}
                            }]
                        },
                        "scopeMetrics": [{
                            "scope": {"name": "hooksniff-api-push"},
                            "metrics": metrics
                        }]
                    }]
                });

                // Push to Grafana Cloud
                let mut req = client
                    .post(&otlp_url)
                    .header("Content-Type", "application/json");

                if !auth_header.is_empty() {
                    req = req.header("Authorization", &auth_header);
                }
                for (k, v) in &extra_headers {
                    req = req.header(k.as_str(), v.as_str());
                }

                match req.json(&payload).send().await {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            tracing::debug!(
                                "📊 Metrics pushed — ep={} cu={} deliveries_1h={} rate={:.1}%",
                                stats.get("total_endpoints").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                stats.get("total_customers").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                deliveries_1h,
                                success_rate_1h,
                            );
                        } else {
                            let status = resp.status();
                            let body = resp.text().await.unwrap_or_default();
                            tracing::warn!("📊 Metrics push failed: {} — {}", status, &body[..body.len().min(200)]);
                        }
                    }
                    Err(e) => {
                        tracing::warn!("📊 Metrics push error: {}", e);
                    }
                }
            }
            Err(e) => {
                tracing::warn!("📊 DB stats collection failed: {}", e);
            }
        }
    }
}

/// Query the DB for business metrics (same queries as scripts/metrics.js).
async fn collect_db_stats(pool: &PgPool) -> Result<serde_json::Value, sqlx::Error> {
    use sqlx::Row;

    let row = sqlx::query(
        r#"
        SELECT
            (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '1 hour')::bigint as deliveries_1h,
            (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '1 hour' AND status='delivered')::bigint as delivered_1h,
            (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '1 hour' AND status='failed')::bigint as failed_1h,
            (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '24 hours')::bigint as deliveries_24h,
            (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '24 hours' AND status='delivered')::bigint as delivered_24h,
            (SELECT COUNT(*) FROM deliveries WHERE created_at > now() - interval '24 hours' AND status='failed')::bigint as failed_24h,
            (SELECT COUNT(*) FROM webhook_queue WHERE status='pending')::bigint as queue_pending,
            (SELECT COUNT(*) FROM webhook_queue WHERE status='processing')::bigint as queue_processing,
            (SELECT COUNT(*) FROM webhook_queue WHERE status='delivered')::bigint as queue_delivered,
            (SELECT COUNT(*) FROM endpoints)::bigint as total_endpoints,
            (SELECT COUNT(*) FROM endpoints WHERE created_at > now() - interval '24 hours')::bigint as new_endpoints_24h,
            (SELECT COUNT(*) FROM customers)::bigint as total_customers,
            (SELECT COUNT(*) FROM customers WHERE created_at > now() - interval '24 hours')::bigint as new_customers_24h,
            (SELECT COUNT(*) FROM customers WHERE created_at > now() - interval '7 days')::bigint as new_customers_7d,
            (SELECT COUNT(*) FROM customers WHERE created_at > now() - interval '24 hours')::bigint as active_users_24h,
            (SELECT COUNT(*) FROM customers WHERE plan='free')::bigint as plan_free,
            (SELECT COUNT(*) FROM customers WHERE plan='developer')::bigint as plan_developer,
            (SELECT COUNT(*) FROM customers WHERE plan='startup')::bigint as plan_startup,
            (SELECT COUNT(*) FROM customers WHERE plan='pro')::bigint as plan_pro,
            (SELECT COUNT(*) FROM customers WHERE plan='enterprise')::bigint as plan_enterprise,
            (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '1 hour' AND action LIKE '%login%')::bigint as logins_1h,
            (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '1 hour' AND action LIKE '%fail%')::bigint as failed_actions_1h,
            (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '24 hours')::bigint as audit_events_24h,
            (SELECT COUNT(*) FROM audit_log WHERE created_at > now() - interval '1 hour' AND action LIKE '%rate%')::bigint as rate_limited_1h
        "#,
    )
    .fetch_one(pool)
    .await?;

    let g = |col: &str| -> f64 {
        row.try_get::<i64, _>(col).unwrap_or(0) as f64
    };

    Ok(serde_json::json!({
        "deliveries_1h": g("deliveries_1h"),
        "delivered_1h": g("delivered_1h"),
        "failed_1h": g("failed_1h"),
        "deliveries_24h": g("deliveries_24h"),
        "delivered_24h": g("delivered_24h"),
        "failed_24h": g("failed_24h"),
        "queue_pending": g("queue_pending"),
        "queue_processing": g("queue_processing"),
        "queue_delivered": g("queue_delivered"),
        "total_endpoints": g("total_endpoints"),
        "new_endpoints_24h": g("new_endpoints_24h"),
        "total_customers": g("total_customers"),
        "new_customers_24h": g("new_customers_24h"),
        "new_customers_7d": g("new_customers_7d"),
        "active_users_24h": g("active_users_24h"),
        "plan_free": g("plan_free"),
        "plan_developer": g("plan_developer"),
        "plan_startup": g("plan_startup"),
        "plan_pro": g("plan_pro"),
        "plan_enterprise": g("plan_enterprise"),
        "logins_1h": g("logins_1h"),
        "failed_actions_1h": g("failed_actions_1h"),
        "audit_events_24h": g("audit_events_24h"),
        "rate_limited_1h": g("rate_limited_1h"),
    }))
}

/// Fetch cache metrics from the API's own /metrics endpoint.
async fn fetch_cache_metrics(client: &reqwest::Client) -> (f64, f64, f64, f64) {
    let metrics_secret =
        std::env::var("METRICS_SECRET").unwrap_or_default();
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    let url = format!("http://127.0.0.1:{}/metrics", port);
    let mut req = client.get(url);
    if !metrics_secret.is_empty() {
        req = req.header(
            "Authorization",
            format!("Bearer {}", metrics_secret),
        );
    }

    let mut cache_hits = 0.0f64;
    let mut cache_misses = 0.0f64;
    let mut cache_hit_rate = 0.0f64;
    let mut active_conns = 0.0f64;

    if let Ok(resp) = req.send().await {
        if let Ok(text) = resp.text().await {
            for line in text.lines() {
                if line.starts_with("cache_hits_total") {
                    if let Some(val) = line.split_whitespace().last() {
                        cache_hits = val.parse().unwrap_or(0.0);
                    }
                } else if line.starts_with("cache_misses_total") {
                    if let Some(val) = line.split_whitespace().last() {
                        cache_misses = val.parse().unwrap_or(0.0);
                    }
                } else if line.starts_with("cache_hit_rate_percent") {
                    if let Some(val) = line.split_whitespace().last() {
                        cache_hit_rate = val.parse().unwrap_or(0.0);
                    }
                } else if line.starts_with("active_connections ") {
                    if let Some(val) = line.split_whitespace().last() {
                        active_conns = val.parse().unwrap_or(0.0);
                    }
                }
            }
        }
    }

    (cache_hits, cache_misses, cache_hit_rate, active_conns)
}

/// Check if the API is healthy.
async fn check_api_health(client: &reqwest::Client) -> bool {
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let url = format!("http://127.0.0.1:{}/health", port);

    if let Ok(resp) = client
        .get(&url)
        .timeout(Duration::from_secs(5))
        .send()
        .await
    {
        if let Ok(body) = resp.json::<serde_json::Value>().await {
            return body.get("status")
                .and_then(|s| s.as_str())
                .map(|s| s == "healthy" || s == "operational")
                .unwrap_or(false);
        }
    }
    false
}

/// Fetch health stats (db latency, queue info) from /health.
async fn fetch_health_stats(client: &reqwest::Client) -> (f64, f64, f64, f64) {
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let url = format!("http://127.0.0.1:{}/health", port);

    let mut db_latency = 0.0f64;
    let mut queue_pending = 0.0f64;
    let mut queue_failed = 0.0f64;
    let mut queue_latency = 0.0f64;

    if let Ok(resp) = client
        .get(&url)
        .timeout(Duration::from_secs(5))
        .send()
        .await
    {
        if let Ok(body) = resp.json::<serde_json::Value>().await {
            db_latency = body
                .pointer("/checks/database/latency_ms")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            queue_pending = body
                .pointer("/checks/queue_detail/pending")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            queue_failed = body
                .pointer("/checks/queue_detail/failed_last_hour")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            queue_latency = body
                .pointer("/checks/queue/latency_ms")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
        }
    }

    (db_latency, queue_pending, queue_failed, queue_latency)
}

/// Build an OTLP gauge metric JSON object.
fn gauge(name: &str, value: f64, time_ns: u64) -> serde_json::Value {
    json!({
        "name": name,
        "gauge": {
            "dataPoints": [{
                "timeUnixNano": time_ns.to_string(),
                "asDouble": value
            }]
        }
    })
}
