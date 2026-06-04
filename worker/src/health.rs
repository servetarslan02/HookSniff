//! Health check server for the HookSniff Worker.
//!
//! Provides Kubernetes-compatible health endpoints:
//! - `/health`  — legacy Cloud Run health check (always 200)
//! - `/livez`   — liveness probe: process is alive (always 200)
//! - `/readyz`  — readiness probe: ready to serve traffic (checks DB connectivity)

/// Shared readiness state — set to true once DB pool is connected.
pub static READY: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Start health server with a pre-bound listener (for Cloud Run startup probe).
pub async fn start_health_server(listener: tokio::net::TcpListener) {
    use axum::{routing::get, Router};

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/livez", get(|| async { "ok" }))
        .route(
            "/readyz",
            get(|| async {
                if READY.load(std::sync::atomic::Ordering::Relaxed) {
                    (axum::http::StatusCode::OK, "ready")
                } else {
                    (axum::http::StatusCode::SERVICE_UNAVAILABLE, "not ready")
                }
            }),
        )
        .route(
            "/",
            get(|| async { "HookSniff Worker 🐝" }),
        );

    if let Err(e) = axum::serve(listener, app).await {
        tracing::error!("❌ Health server error: {}", e);
    }
}
