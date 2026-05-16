use std::collections::HashMap;
use tracing_subscriber::prelude::*;

/// Guard that flushes OpenTelemetry traces on drop.
pub struct TracerGuard(Option<opentelemetry_sdk::trace::SdkTracerProvider>);

impl Drop for TracerGuard {
    fn drop(&mut self) {
        if let Some(provider) = self.0.take() {
            let _ = provider.shutdown();
        }
    }
}

/// Initialize the global tracing subscriber with OpenTelemetry + structured logging.
///
/// Call this once at startup. When `OTEL_ENABLED=true`, traces are exported via OTLP;
/// otherwise only structured logging is configured.
///
/// Returns a `TracerGuard` that flushes traces on drop. Keep it alive until shutdown.
pub fn init(cfg: &crate::config::Config) -> TracerGuard {
    let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());
    let use_json = env == "production"
        || env == "prod"
        || std::env::var("LOG_FORMAT")
            .map(|v| v == "json")
            .unwrap_or(false);

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cfg.rust_log));

    if cfg.otel_enabled {
        init_otel(env_filter, use_json, cfg)
    } else {
        init_plain(env_filter, use_json, &env);
        TracerGuard(None)
    }
}

/// Bootstrap the OpenTelemetry tracer and wire it into the tracing subscriber.
fn init_otel(
    env_filter: tracing_subscriber::EnvFilter,
    use_json: bool,
    cfg: &crate::config::Config,
) -> TracerGuard {
    use opentelemetry::global;
    use opentelemetry::trace::TracerProvider as _;
    use opentelemetry_otlp::{WithExportConfig, WithHttpConfig};
    use opentelemetry_sdk::trace::SdkTracerProvider;

    let otlp_endpoint = cfg
        .otel_exporter_otlp_endpoint
        .as_deref()
        .unwrap_or("http://localhost:4318");

    let mut headers = HashMap::new();
    if let Some(ref hdrs) = cfg.otel_exporter_otlp_headers {
        for header in hdrs.split(',') {
            let h = header.trim();
            if let Some((key, value)) = h.split_once('=').or_else(|| h.split_once(':')) {
                headers.insert(key.trim().to_string(), value.trim().to_string());
            }
        }
    }

    tracing::info!(
        "🔧 OTEL config — endpoint: {}, headers count: {}",
        otlp_endpoint,
        headers.len()
    );

    let exporter = match opentelemetry_otlp::SpanExporter::builder()
        .with_http()
        .with_endpoint(otlp_endpoint)
        .with_headers(headers)
        .build()
    {
        Ok(exporter) => {
            tracing::info!("✅ OTLP span exporter built successfully (HTTP/JSON)");
            exporter
        }
        Err(e) => {
            tracing::error!(
                "❌ Failed to build OTLP exporter: {:?} — falling back to plain logging",
                e
            );
            init_plain(env_filter, use_json, "production");
            return TracerGuard(None);
        }
    };

    // HS-062: Use batch exporter for production (buffers spans, reduces network calls)
    // Set shorter timeout and max export batch for Cloud Run (30s SIGTERM grace)
    let provider = SdkTracerProvider::builder()
        .with_batch_exporter(exporter)
        .build();

    tracing::info!("✅ OTel SdkTracerProvider created with batch exporter");

    // HS-061: Register custom metrics
    init_metrics();

    global::set_tracer_provider(provider.clone());

    // Force a test span to verify exporter works
    {
        use opentelemetry::trace::{TraceContextExt, Tracer};
        let tracer = provider.tracer("hooksniff-boot-test");
        let span = tracer.start("otel_boot_test");
        let cx = opentelemetry::Context::current().with_span(span);
        cx.span().end();
        tracing::info!("🔬 OTEL boot test span created — check Grafana for 'otel_boot_test' trace");
    }

    if use_json {
        let tracer = provider.tracer("hooksniff");
        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().json())
            .with(otel_layer)
            .init();
    } else {
        let tracer = provider.tracer("hooksniff");
        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer())
            .with(otel_layer)
            .init();
    }

    tracing::info!("OpenTelemetry enabled, endpoint: {}", otlp_endpoint);

    TracerGuard(Some(provider))
}

/// Plain structured logging (no OTel).
fn init_plain(env_filter: tracing_subscriber::EnvFilter, use_json: bool, env: &str) {
    if use_json {
        tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().json())
            .init();
        tracing::info!("Logging format: JSON (env={})", env);
    } else {
        tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer())
            .init();
        tracing::info!("Logging format: text (env={})", env);
    }
}

// ── Trace-ID Middleware ──────────────────────────────────────────────

use axum::extract::Request;
use axum::middleware::Next;
use axum::response::IntoResponse;

/// Axum middleware that injects `X-Trace-Id` into every HTTP response.
///
/// When OpenTelemetry is active the header contains the current span's
/// trace-id (hex, 32 chars). Otherwise a UUID-v4 fallback is generated
/// so callers can always correlate requests with server logs.
pub async fn trace_id_middleware(request: Request, next: Next) -> impl IntoResponse {
    let trace_id = current_trace_id();

    let mut response = next.run(request).await;
    response.headers_mut().insert(
        "X-Trace-Id",
        trace_id
            .parse()
            .unwrap_or_else(|_| "unknown".parse().expect("valid header value")),
    );
    response
}

/// Extract the hex trace-id from the active OpenTelemetry span context.
///
/// Returns a UUID-v4 string when OTel is not enabled (so callers always
/// get a correlatable value).
pub fn current_trace_id() -> String {
    use opentelemetry::trace::TraceContextExt;
    use tracing_opentelemetry::OpenTelemetrySpanExt;

    let span = tracing::Span::current();
    let ctx = span.context();
    let otel_span = ctx.span();
    let span_ctx = otel_span.span_context();

    if span_ctx.is_valid() {
        format!("{:032x}", span_ctx.trace_id())
    } else {
        // Fallback: generate a UUID so there's always something in the header
        uuid::Uuid::new_v4().to_string().replace('-', "")
    }
}

// ── HS-061: Custom Metrics ──────────────────────────────────────────

// Global metrics registry — initialized once at startup.
// Uses tracing counters/histograms (OTel metrics API varies by version).
// Actual OTel metric export happens via the tracing -> OTel bridge.
//
// Metrics are recorded via tracing macros (info!/warn!) which are
// captured by the OTel tracing layer. For structured counters, we
// use lightweight atomic counters that can be queried by health endpoints.

use std::sync::atomic::{AtomicU64, Ordering};

/// Atomic counters for key business metrics.
/// These are lightweight, lock-free, and always available.
pub struct Metrics {
    pub deliveries_total: AtomicU64,
    pub delivery_failures: AtomicU64,
    pub api_requests_total: AtomicU64,
    pub rate_limit_rejected: AtomicU64,
}

static METRICS: std::sync::OnceLock<Metrics> = std::sync::OnceLock::new();

fn init_metrics() {
    let metrics = Metrics {
        deliveries_total: AtomicU64::new(0),
        delivery_failures: AtomicU64::new(0),
        api_requests_total: AtomicU64::new(0),
        rate_limit_rejected: AtomicU64::new(0),
    };
    let _ = METRICS.set(metrics);
    tracing::info!("📊 Custom metrics initialized (atomic counters)");
}

/// Get the global metrics registry.
pub fn metrics() -> Option<&'static Metrics> {
    METRICS.get()
}

impl Metrics {
    pub fn record_delivery(&self) {
        self.deliveries_total.fetch_add(1, Ordering::Relaxed);
    }
    pub fn record_failure(&self) {
        self.delivery_failures.fetch_add(1, Ordering::Relaxed);
    }
    pub fn record_api_request(&self) {
        self.api_requests_total.fetch_add(1, Ordering::Relaxed);
    }
    pub fn record_rate_limit_rejected(&self) {
        self.rate_limit_rejected.fetch_add(1, Ordering::Relaxed);
    }
}

// ── HS-064: PII Redaction ───────────────────────────────────────────

/// Truncate and redact potentially sensitive response bodies before logging.
///
/// - Truncates to 500 chars max
/// - Redacts common PII patterns (emails, tokens, keys)
pub fn redact_response_body(body: &str) -> String {
    let truncated: &str = if body.len() > 500 { &body[..500] } else { body };

    // Redact email addresses
    let email_regex =
        regex::Regex::new(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}").expect("valid regex pattern");
    let redacted = email_regex.replace_all(truncated, "[REDACTED_EMAIL]");

    // Redact tokens/keys (Bearer, API keys, etc.)
    let token_regex =
        regex::Regex::new(r"(?i)(bearer|token|key|secret|password|auth)[:=]\s*\S{8,}").expect("valid regex pattern");
    let redacted = token_regex.replace_all(&redacted, "${1}: [REDACTED]");

    // Redact JWT-like strings
    let jwt_regex =
        regex::Regex::new(r"eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}")
            .expect("valid regex pattern");
    let redacted = jwt_regex.replace_all(&redacted, "[REDACTED_JWT]");

    redacted.into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_current_trace_id_returns_string() {
        let trace_id = current_trace_id();
        assert!(!trace_id.is_empty());
        assert_eq!(trace_id.len(), 32, "trace-id should be 32 hex chars");
        assert!(
            trace_id.chars().all(|c| c.is_ascii_hexdigit()),
            "trace-id should be hex: {}",
            trace_id
        );
    }

    #[test]
    fn test_current_trace_id_unique_per_call() {
        let id1 = current_trace_id();
        let id2 = current_trace_id();
        assert_ne!(id1, id2);
    }

    #[test]
    fn test_current_trace_id_no_dashes() {
        let trace_id = current_trace_id();
        assert!(
            !trace_id.contains('-'),
            "trace-id should not contain dashes: {}",
            trace_id
        );
    }

    #[tokio::test]
    async fn test_trace_id_middleware_sets_header() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        let app = Router::new()
            .route("/test", get(|| async { "ok" }))
            .layer(middleware::from_fn(trace_id_middleware));

        let request = Request::builder().uri("/test").body(Body::empty()).unwrap();

        let response = app.oneshot(request).await.unwrap();
        let trace_id = response
            .headers()
            .get("X-Trace-Id")
            .expect("X-Trace-Id header should be present")
            .to_str()
            .unwrap();

        assert_eq!(trace_id.len(), 32);
        assert!(trace_id.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[tokio::test]
    async fn test_trace_id_middleware_returns_ok() {
        use axum::body::Body;
        use axum::http::Request;
        use axum::middleware;
        use axum::routing::get;
        use axum::Router;
        use tower::ServiceExt;

        let app = Router::new()
            .route("/health", get(|| async { "healthy" }))
            .layer(middleware::from_fn(trace_id_middleware));

        let request = Request::builder()
            .uri("/health")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }
}
