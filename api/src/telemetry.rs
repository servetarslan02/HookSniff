use std::collections::HashMap;
use tracing_subscriber::prelude::*;

/// Initialize the global tracing subscriber with OpenTelemetry + structured logging.
///
/// Call this once at startup. When `OTEL_ENABLED=true`, traces are exported via OTLP;
/// otherwise only structured logging is configured.
pub fn init(cfg: &crate::config::Config) {
    let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());
    let use_json = env == "production"
        || env == "prod"
        || std::env::var("LOG_FORMAT")
            .map(|v| v == "json")
            .unwrap_or(false);

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cfg.rust_log));

    if cfg.otel_enabled {
        init_otel(env_filter, use_json, cfg);
    } else {
        init_plain(env_filter, use_json, &env);
    }
}

/// Bootstrap the OpenTelemetry tracer and wire it into the tracing subscriber.
fn init_otel(
    env_filter: tracing_subscriber::EnvFilter,
    use_json: bool,
    cfg: &crate::config::Config,
) {
    use opentelemetry::global;
    use opentelemetry::trace::TracerProvider as _;
    use opentelemetry_otlp::WithExportConfig;
    use opentelemetry_sdk::trace::TracerProvider;

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

    let exporter = match opentelemetry_otlp::new_exporter()
        .http()
        .with_endpoint(otlp_endpoint)
        .with_headers(headers)
        .build_span_exporter()
    {
        Ok(exporter) => exporter,
        Err(e) => {
            tracing::warn!(
                "⚠️ Failed to build OTLP exporter ({}), falling back to plain logging",
                e
            );
            return init_plain(env_filter, use_json, "production");
        }
    };

    let provider = TracerProvider::builder()
        .with_simple_exporter(exporter)
        .build();

    global::set_tracer_provider(provider.clone());

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
