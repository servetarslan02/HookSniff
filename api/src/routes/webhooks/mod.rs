pub mod handlers;

use axum::routing::{get, post};
use axum::Router;
use serde::Deserialize;

use handlers::*;

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
pub(crate) struct ListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct ExportParams {
    pub format: Option<String>,
    pub status: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}
