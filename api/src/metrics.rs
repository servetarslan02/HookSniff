use prometheus::{
    Encoder, Gauge, Histogram, HistogramOpts, IntCounterVec, Opts, Registry, TextEncoder,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct Metrics {
    pub registry: Registry,
    // ── HTTP metrics ──
    pub http_requests_total: IntCounterVec,
    pub http_request_duration_seconds: Histogram,
    pub active_connections: Gauge,
    // ── Webhook delivery metrics ──
    pub webhook_deliveries_total: IntCounterVec,
    pub delivery_count: IntCounterVec,
    pub delivery_latency_seconds: Histogram,
    pub error_count: IntCounterVec,
    pub active_endpoints: Gauge,
    // ── Infrastructure metrics ──
    pub queue_publish_latency_seconds: Histogram,
    pub db_query_duration_seconds: Histogram,
    // ── Cache metrics ──
    pub cache_hits_total: IntCounterVec,
    pub cache_misses_total: IntCounterVec,
}

impl Default for Metrics {
    fn default() -> Self {
        Self::new()
    }
}

impl Metrics {
    pub fn new() -> Self {
        let registry = Registry::new();

        let http_requests_total = IntCounterVec::new(
            Opts::new("http_requests_total", "Total number of HTTP requests"),
            &["method", "path", "status"],
        )
        .expect("valid metric definition");

        let http_request_duration_seconds = Histogram::with_opts(
            HistogramOpts::new(
                "http_request_duration_seconds",
                "HTTP request duration in seconds",
            )
            .buckets(vec![
                0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0,
            ]),
        )
        .expect("valid metric definition");

        let active_connections = Gauge::with_opts(Opts::new(
            "active_connections",
            "Number of active connections",
        ))
        .expect("valid metric definition");

        let webhook_deliveries_total = IntCounterVec::new(
            Opts::new(
                "webhook_deliveries_total",
                "Total webhook deliveries by status",
            ),
            &["status"],
        )
        .expect("valid metric definition");

        // ── Per-endpoint delivery count ──
        let delivery_count = IntCounterVec::new(
            Opts::new(
                "delivery_count",
                "Webhook delivery count by endpoint and status",
            ),
            &["endpoint_id", "status"],
        )
        .expect("valid metric definition");

        // ── Delivery latency histogram ──
        let delivery_latency_seconds = Histogram::with_opts(
            HistogramOpts::new(
                "delivery_latency_seconds",
                "Webhook delivery latency in seconds",
            )
            .buckets(vec![0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]),
        )
        .expect("valid metric definition");

        // ── Error counter by type ──
        let error_count = IntCounterVec::new(
            Opts::new("error_count", "Error count by type"),
            &["error_type"],
        )
        .expect("valid metric definition");

        // ── Active endpoints gauge ──
        let active_endpoints = Gauge::with_opts(Opts::new(
            "active_endpoints",
            "Number of active webhook endpoints",
        ))
        .expect("valid metric definition");

        let queue_publish_latency_seconds = Histogram::with_opts(
            HistogramOpts::new(
                "queue_publish_latency_seconds",
                "Queue publish latency in seconds",
            )
            .buckets(vec![0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]),
        )
        .expect("valid metric definition");

        let db_query_duration_seconds = Histogram::with_opts(
            HistogramOpts::new(
                "db_query_duration_seconds",
                "Database query duration in seconds",
            )
            .buckets(vec![0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]),
        )
        .expect("valid metric definition");

        // ── Cache metrics ──
        let cache_hits_total = IntCounterVec::new(
            Opts::new("cache_hits_total", "Cache hits by resource type"),
            &["resource"],
        )
        .expect("valid metric definition");

        let cache_misses_total = IntCounterVec::new(
            Opts::new("cache_misses_total", "Cache misses by resource type"),
            &["resource"],
        )
        .expect("valid metric definition");

        registry
            .register(Box::new(http_requests_total.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(http_request_duration_seconds.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(active_connections.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(webhook_deliveries_total.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(delivery_count.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(delivery_latency_seconds.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(error_count.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(active_endpoints.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(queue_publish_latency_seconds.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(db_query_duration_seconds.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(cache_hits_total.clone()))
            .expect("valid metric definition");
        registry
            .register(Box::new(cache_misses_total.clone()))
            .expect("valid metric definition");

        Self {
            registry,
            http_requests_total,
            http_request_duration_seconds,
            active_connections,
            webhook_deliveries_total,
            delivery_count,
            delivery_latency_seconds,
            error_count,
            active_endpoints,
            queue_publish_latency_seconds,
            db_query_duration_seconds,
            cache_hits_total,
            cache_misses_total,
        }
    }

    pub fn render(&self) -> String {
        let encoder = TextEncoder::new();
        let metric_families = self.registry.gather();
        let mut buffer = Vec::new();
        encoder
            .encode(&metric_families, &mut buffer)
            .expect("valid metric definition");
        let mut output = String::from_utf8(buffer).expect("prometheus output is valid UTF-8");

        // Append cache statistics from the cache module (atomic counters)
        let (cache_hits, cache_misses) = crate::cache::cache_stats();
        let cache_hit_rate = crate::cache::cache_hit_rate();
        output.push_str("# HELP cache_hits_total Total cache hits\n");
        output.push_str("# TYPE cache_hits_total counter\n");
        output.push_str(&format!("cache_hits_total {{resource=\"all\"}} {cache_hits}\n"));
        output.push_str("# HELP cache_misses_total Total cache misses\n");
        output.push_str("# TYPE cache_misses_total counter\n");
        output.push_str(&format!("cache_misses_total {{resource=\"all\"}} {cache_misses}\n"));
        output.push_str("# HELP cache_hit_rate_percent Cache hit rate percentage\n");
        output.push_str("# TYPE cache_hit_rate_percent gauge\n");
        output.push_str(&format!("cache_hit_rate_percent {cache_hit_rate:.2}\n"));

        // Append Cortex metrics
        output.push_str(&crate::cortex::CORTEX_METRICS.to_prometheus());

        output
    }
}

/// Axum middleware that records HTTP request metrics
pub async fn metrics_middleware(
    axum::extract::Extension(metrics): axum::extract::Extension<Arc<Metrics>>,
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    let start = std::time::Instant::now();
    let method = req.method().to_string();
    let path = req.uri().path().to_string();

    metrics.active_connections.inc();

    let response = next.run(req).await;

    metrics.active_connections.dec();

    let duration = start.elapsed().as_secs_f64();
    let status = response.status().as_u16().to_string();

    metrics
        .http_requests_total
        .with_label_values(&[&method, &path, &status])
        .inc();
    metrics.http_request_duration_seconds.observe(duration);

    response
}

/// GET /metrics endpoint handler
/// If METRICS_SECRET env var is set, requires `Authorization: Bearer <token>`.
/// If METRICS_SECRET is not set, allows access (backward compat for dev).
pub async fn metrics_handler(
    axum::extract::Extension(metrics): axum::extract::Extension<Arc<Metrics>>,
    axum::extract::RawQuery(query): axum::extract::RawQuery,
    headers: axum::http::HeaderMap,
) -> Result<String, (axum::http::StatusCode, String)> {
    // Check if METRICS_SECRET is configured
    if let Ok(secret) = std::env::var("METRICS_SECRET") {
        if !secret.is_empty() {
            // Try Authorization header first
            let token_from_header = headers
                .get("authorization")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.strip_prefix("Bearer "))
                .unwrap_or("");

            // Also support ?token= query param for Prometheus scrapers
            let token_from_query = query
                .as_ref()
                .and_then(|q| {
                    q.split('&')
                        .find(|p| p.starts_with("token="))
                        .and_then(|p| p.strip_prefix("token="))
                })
                .unwrap_or("");

            if token_from_header != secret && token_from_query != secret {
                return Err((
                    axum::http::StatusCode::UNAUTHORIZED,
                    "Unauthorized: invalid or missing metrics token".to_string(),
                ));
            }
        }
    }

    Ok(metrics.render())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metrics_new() {
        let m = Metrics::new();
        // Use each metric at least once so they appear in gather()
        m.http_requests_total
            .with_label_values(&["GET", "/", "200"])
            .inc();
        m.http_request_duration_seconds.observe(0.01);
        m.active_connections.inc();
        m.webhook_deliveries_total.with_label_values(&["ok"]).inc();
        m.delivery_count.with_label_values(&["ep-1", "ok"]).inc();
        m.delivery_latency_seconds.observe(0.01);
        m.error_count.with_label_values(&["timeout"]).inc();
        m.active_endpoints.set(1.0);
        m.queue_publish_latency_seconds.observe(0.01);
        m.db_query_duration_seconds.observe(0.01);

        // Should have all expected metric families registered
        let families = m.registry.gather();
        let names: Vec<&str> = families.iter().map(|f| f.name()).collect();
        assert!(
            names.contains(&"http_requests_total"),
            "missing http_requests_total, got: {:?}",
            names
        );
        assert!(names.contains(&"http_request_duration_seconds"));
        assert!(names.contains(&"active_connections"));
        assert!(names.contains(&"webhook_deliveries_total"));
        assert!(names.contains(&"delivery_count"));
        assert!(names.contains(&"delivery_latency_seconds"));
        assert!(names.contains(&"error_count"));
        assert!(names.contains(&"active_endpoints"));
        assert!(names.contains(&"queue_publish_latency_seconds"));
        assert!(names.contains(&"db_query_duration_seconds"));
    }

    #[test]
    fn test_metrics_default() {
        let m = Metrics::default();
        // Use at least one metric so gather() has data
        m.active_connections.inc();
        let families = m.registry.gather();
        assert!(!families.is_empty());
    }

    #[test]
    fn test_metrics_clone() {
        let m = Metrics::new();
        // Use at least one metric
        m.active_connections.inc();
        let m2 = m.clone();
        // Both should share the same registry (Arc inside prometheus types)
        let families1 = m.registry.gather();
        let families2 = m2.registry.gather();
        assert_eq!(families1.len(), families2.len());
    }

    #[test]
    fn test_render_empty() {
        let m = Metrics::new();
        // render() produces empty output when no metrics have been used
        let empty_output = m.render();
        assert!(empty_output.is_empty() || !empty_output.contains("http_requests_total"));
        // After using at least one metric, it should appear
        m.http_requests_total
            .with_label_values(&["GET", "/", "200"])
            .inc();
        let output = m.render();
        assert!(!output.is_empty());
        assert!(output.contains("http_requests_total"));
    }

    #[test]
    fn test_render_with_data() {
        let m = Metrics::new();
        // Record some HTTP request metrics
        m.http_requests_total
            .with_label_values(&["GET", "/api/health", "200"])
            .inc();
        m.http_requests_total
            .with_label_values(&["GET", "/api/health", "200"])
            .inc();
        m.http_request_duration_seconds.observe(0.05);

        let output = m.render();
        assert!(output.contains("http_requests_total"));
        // Should have our labels
        assert!(output.contains("GET"));
        assert!(output.contains("/api/health"));
    }

    #[test]
    fn test_active_connections_gauge() {
        let m = Metrics::new();
        assert_eq!(m.active_connections.get(), 0.0);
        m.active_connections.inc();
        assert_eq!(m.active_connections.get(), 1.0);
        m.active_connections.inc();
        assert_eq!(m.active_connections.get(), 2.0);
        m.active_connections.dec();
        assert_eq!(m.active_connections.get(), 1.0);
    }

    #[test]
    fn test_active_endpoints_gauge() {
        let m = Metrics::new();
        m.active_endpoints.set(5.0);
        assert_eq!(m.active_endpoints.get(), 5.0);
        m.active_endpoints.set(0.0);
        assert_eq!(m.active_endpoints.get(), 0.0);
    }

    #[test]
    fn test_webhook_deliveries_counter() {
        let m = Metrics::new();
        m.webhook_deliveries_total
            .with_label_values(&["success"])
            .inc();
        m.webhook_deliveries_total
            .with_label_values(&["success"])
            .inc();
        m.webhook_deliveries_total
            .with_label_values(&["failed"])
            .inc();

        let output = m.render();
        assert!(output.contains("webhook_deliveries_total"));
        assert!(output.contains("success"));
        assert!(output.contains("failed"));
    }

    #[test]
    fn test_delivery_count_counter() {
        let m = Metrics::new();
        m.delivery_count
            .with_label_values(&["ep-123", "delivered"])
            .inc();
        m.delivery_count
            .with_label_values(&["ep-123", "delivered"])
            .inc_by(3);

        let output = m.render();
        assert!(output.contains("delivery_count"));
        assert!(output.contains("ep-123"));
    }

    #[test]
    fn test_delivery_latency_histogram() {
        let m = Metrics::new();
        m.delivery_latency_seconds.observe(0.1);
        m.delivery_latency_seconds.observe(0.5);
        m.delivery_latency_seconds.observe(2.0);

        let output = m.render();
        assert!(output.contains("delivery_latency_seconds"));
    }

    #[test]
    fn test_error_count_counter() {
        let m = Metrics::new();
        m.error_count.with_label_values(&["timeout"]).inc();
        m.error_count.with_label_values(&["dns"]).inc();

        let output = m.render();
        assert!(output.contains("error_count"));
        assert!(output.contains("timeout"));
        assert!(output.contains("dns"));
    }

    #[test]
    fn test_queue_publish_latency_histogram() {
        let m = Metrics::new();
        m.queue_publish_latency_seconds.observe(0.01);
        m.queue_publish_latency_seconds.observe(0.05);

        let output = m.render();
        assert!(output.contains("queue_publish_latency_seconds"));
    }

    #[test]
    fn test_db_query_duration_histogram() {
        let m = Metrics::new();
        m.db_query_duration_seconds.observe(0.005);
        m.db_query_duration_seconds.observe(0.1);

        let output = m.render();
        assert!(output.contains("db_query_duration_seconds"));
    }

    #[test]
    fn test_render_contains_help_and_type() {
        let m = Metrics::new();
        // Use metrics so they appear in gather/render output
        m.http_requests_total
            .with_label_values(&["GET", "/", "200"])
            .inc();
        m.http_request_duration_seconds.observe(0.01);
        m.active_connections.inc();
        m.active_endpoints.set(1.0);
        let output = m.render();
        // Prometheus format includes HELP and TYPE lines
        assert!(
            output.contains("# HELP http_requests_total"),
            "missing HELP for http_requests_total"
        );
        assert!(
            output.contains("# TYPE http_requests_total counter"),
            "missing TYPE for http_requests_total"
        );
        assert!(output.contains("# TYPE http_request_duration_seconds histogram"));
        assert!(output.contains("# TYPE active_connections gauge"));
    }

    #[test]
    fn test_metrics_handler_sync() {
        let m = Metrics::new();
        m.http_requests_total
            .with_label_values(&["POST", "/webhooks", "201"])
            .inc();
        let output = m.render();
        assert!(output.contains("http_requests_total"));
        assert!(output.contains("POST"));
    }

    #[test]
    fn test_arc_metrics() {
        let m = Arc::new(Metrics::new());
        let m2 = Arc::clone(&m);
        m.http_requests_total
            .with_label_values(&["GET", "/", "200"])
            .inc();
        // Shared state through Arc
        let output = m2.render();
        assert!(output.contains("http_requests_total"));
    }
}
