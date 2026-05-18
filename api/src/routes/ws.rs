//! WebSocket endpoint for real-time event streaming.
//!
//! GET /v1/ws — WebSocket upgrade with JWT auth

use axum::extract::ws::WebSocketUpgrade;
use axum::extract::Extension;
use axum::http::{HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::get;
use axum::Router;
use std::sync::Arc;

use crate::models::customer::Customer;
use crate::ws::WsGateway;
use crate::ws::handler::{handle_connection, WsHandlerConfig};

pub fn router() -> Router {
    Router::new().route("/", get(ws_handler))
}

/// WebSocket upgrade handler with JWT auth and origin validation.
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    headers: HeaderMap,
    Extension(customer): Extension<Customer>,
    Extension(gateway): Extension<Arc<WsGateway>>,
) -> impl IntoResponse {
    // Origin validation
    if let Err(status) = validate_origin(&headers) {
        return (status, "Unauthorized origin").into_response();
    }

    let config = WsHandlerConfig::default();

    ws.on_upgrade(move |socket| {
        handle_connection(socket, gateway, customer.id, vec![], config)
    })
}

/// Origin header validation — only allow trusted domains.
fn validate_origin(headers: &HeaderMap) -> Result<(), StatusCode> {
    let mut allowed_origins = vec![
        "https://hooksniff.vercel.app",
        "https://www.hooksniff.vercel.app",
    ];

    // Localhost sadece debug modunda izinli
    #[cfg(debug_assertions)]
    {
        allowed_origins.extend([
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]);
    }

    match headers.get("origin") {
        Some(origin) => {
            let origin_str = origin.to_str().unwrap_or("");
            if allowed_origins.iter().any(|&o| o == origin_str) {
                Ok(())
            } else {
                tracing::warn!(origin = origin_str, "Rejected WS connection: unauthorized origin");
                Err(StatusCode::FORBIDDEN)
            }
        }
        None => {
            // Origin header yoksa reddet (WS handshake'te olmalı)
            tracing::warn!("Rejected WS connection: missing origin header");
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
