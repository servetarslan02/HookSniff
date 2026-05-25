pub mod crud;
pub mod create;
pub mod replay;
mod helpers;
mod tests;

use axum::routing::{get, post};
use axum::Router;
use serde::Deserialize;

// Re-export all handler functions
pub use crud::{list_deliveries, get_delivery, get_delivery_attempts, export_deliveries};
pub use create::{create_webhook, batch_webhooks};
pub use replay::{replay_webhook, batch_replay};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_deliveries).post(create_webhook))
        .route("/batch", post(batch_webhooks))
        .route("/batch/replay", post(batch_replay))
        .route("/export", get(export_deliveries))
        .route("/{id}", get(get_delivery))
        .route("/{id}/replay", post(replay_webhook))
        .route("/{id}/attempts", get(get_delivery_attempts))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExportParams {
    pub format: Option<String>,
    pub status: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}
