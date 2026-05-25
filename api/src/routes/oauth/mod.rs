//! OAuth2 Social Login API — split into sub-modules
//!
//! - `google.rs` — Google OAuth login + callback
//! - `github.rs` — GitHub OAuth login + callback
//! - `helpers.rs` — PKCE, cookie helpers, customer management

mod google;
mod github;
pub mod helpers;

use axum::{routing::get, Router};

pub fn router() -> Router {
    Router::new()
        .route("/providers", get(helpers::list_providers))
        .route("/google", get(google::google_login))
        .route("/google/callback", get(google::google_callback))
        .route("/github", get(github::github_login))
        .route("/github/callback", get(github::github_callback))
}
