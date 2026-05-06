use anyhow::Result;

#[derive(Debug, Clone)]
pub struct WorkerConfig {
    pub database_url: String,
    /// OpenTelemetry: enable OTLP exporter
    pub otel_enabled: bool,
    /// OpenTelemetry: OTLP collector endpoint (e.g. http://localhost:4317)
    pub otel_exporter_otlp_endpoint: Option<String>,
    /// OpenTelemetry: OTLP headers (comma-separated key=value pairs)
    pub otel_exporter_otlp_headers: Option<String>,
}

impl WorkerConfig {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        let otel_enabled = std::env::var("OTEL_ENABLED")
            .map(|v| v == "true" || v == "1")
            .unwrap_or(false);
        let otel_exporter_otlp_endpoint = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT").ok();
        let otel_exporter_otlp_headers = std::env::var("OTEL_EXPORTER_OTLP_HEADERS").ok();

        Ok(Self {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| {
                    "postgresql://hooksniff:hooksniff_local@localhost:5432/hooksniff?sslmode=disable".into()
                }),
            otel_enabled,
            otel_exporter_otlp_endpoint,
            otel_exporter_otlp_headers,
        })
    }
}
