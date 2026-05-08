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
        }
    }

    pub fn render(&self) -> String {
        let encoder = TextEncoder::new();
        let metric_families = self.registry.gather();
        let mut buffer = Vec::new();
        encoder
            .encode(&metric_families, &mut buffer)
            .expect("valid metric definition");
        String::from_utf8(buffer).expect("prometheus output is valid UTF-8")
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
pub async fn metrics_handler(
    axum::extract::Extension(metrics): axum::extract::Extension<Arc<Metrics>>,
) -> String {
    metrics.render()
}
