//! Background job: push worker health metric to Grafana Cloud via OTLP every 60 seconds.
//!
//! Pushes `hooksniff_worker_healthy = 1` gauge. If the worker crashes,
//! the metric stops being pushed and goes stale → Grafana alert fires.

use serde_json::json;
use std::time::Duration;

/// Run the worker health metrics push loop. Call this once at startup via `tokio::spawn`.
pub async fn run() {
    // OTLP endpoint + auth from env (same as API config)
    let otlp_endpoint = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
        .unwrap_or_else(|_| "https://otlp-gateway-prod-eu-west-2.grafana.net".to_string());
    let otlp_headers = std::env::var("OTEL_EXPORTER_OTLP_HEADERS").unwrap_or_default();

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

    tracing::info!("📊 Worker metrics push started — pushing to {} every 60s", otlp_url);

    loop {
        tokio::time::sleep(Duration::from_secs(60)).await;

        let now_ns = chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0) as u64;

        let metrics = vec![
            gauge("hooksniff_worker_healthy", 1.0, now_ns),
        ];

        let payload = json!({
            "resourceMetrics": [{
                "resource": {
                    "attributes": [{
                        "key": "service.name",
                        "value": {"stringValue": "hooksniff-worker"}
                    }]
                },
                "scopeMetrics": [{
                    "scope": {"name": "hooksniff-worker-push"},
                    "metrics": metrics
                }]
            }]
        });

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
                    tracing::debug!("📊 Worker health pushed: hooksniff_worker_healthy=1");
                } else {
                    let status = resp.status();
                    let body = resp.text().await.unwrap_or_default();
                    tracing::warn!("📊 Worker metrics push failed: {} — {}", status, &body[..body.len().min(200)]);
                }
            }
            Err(e) => {
                tracing::warn!("📊 Worker metrics push error: {}", e);
            }
        }
    }
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
