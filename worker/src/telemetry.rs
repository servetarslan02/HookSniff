use tracing_subscriber::prelude::*;

/// Initialize the global tracing subscriber with OpenTelemetry + structured logging.
///
/// Reads `OTEL_ENABLED`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`
/// from the environment (via `WorkerConfig` or directly).
pub fn init(otel_enabled: bool, endpoint: Option<&str>, headers: Option<&str>) {
    let env = std::env::var("APP_ENV").unwrap_or_else(|_| "development".into());
    let use_json = env == "production"
        || env == "prod"
        || std::env::var("LOG_FORMAT")
            .map(|v| v == "json")
            .unwrap_or(false);

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));

    if otel_enabled {
        init_otel(env_filter, use_json, endpoint, headers);
    } else {
        init_plain(env_filter, use_json, &env);
    }
}

/// Bootstrap the OpenTelemetry tracer and wire it into the tracing subscriber.
fn init_otel(
    env_filter: tracing_subscriber::EnvFilter,
    use_json: bool,
    endpoint: Option<&str>,
    headers: Option<&str>,
) {
    use opentelemetry::global;
    use opentelemetry::trace::TracerProvider as _;
    use opentelemetry_otlp::WithExportConfig;
    use opentelemetry_sdk::trace::TracerProvider;

    let otlp_endpoint = endpoint.unwrap_or("http://localhost:4317");

    let mut metadata = tonic::metadata::MetadataMap::new();
    if let Some(hdrs) = headers {
        for header in hdrs.split(',') {
            if let Some((key, value)) = header
                .trim()
                .split_once(':')
                .or_else(|| header.trim().split_once('='))
            {
                if let (Ok(name), Ok(val)) = (
                    tonic::metadata::MetadataKey::from_bytes(key.trim().to_lowercase().as_bytes()),
                    tonic::metadata::MetadataValue::try_from(value.trim()),
                ) {
                    metadata.insert(name, val);
                }
            }
        }
    }

    let exporter = opentelemetry_otlp::new_exporter()
        .tonic()
        .with_endpoint(otlp_endpoint)
        .with_metadata(metadata)
        .build_span_exporter()
        .expect("Failed to build OTLP exporter");

    let provider = TracerProvider::builder()
        .with_simple_exporter(exporter)
        .build();

    global::set_tracer_provider(provider.clone());

    if use_json {
        let tracer = provider.tracer("hooksniff-worker");
        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().json())
            .with(otel_layer)
            .init();
    } else {
        let tracer = provider.tracer("hooksniff-worker");
        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        let _ = tracing_subscriber::registry()
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
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer().json())
            .init();
        tracing::info!("Logging format: JSON (env={})", env);
    } else {
        let _ = tracing_subscriber::registry()
            .with(env_filter)
            .with(tracing_subscriber::fmt::layer())
            .init();
        tracing::info!("Logging format: text (env={})", env);
    }
}

/// Extract the hex trace-id from the active OpenTelemetry span context.
///
/// Returns `None` when OTel is not enabled or the span context is invalid.
pub fn current_trace_id() -> Option<String> {
    use opentelemetry::trace::TraceContextExt;
    use tracing_opentelemetry::OpenTelemetrySpanExt;

    let span = tracing::Span::current();
    let ctx = span.context();
    let otel_span = ctx.span();
    let span_ctx = otel_span.span_context();

    if span_ctx.is_valid() {
        Some(format!("{:032x}", span_ctx.trace_id()))
    } else {
        None
    }
}
