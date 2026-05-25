//! SSO/SAML/OIDC Configuration & Login API

pub mod handlers;
pub mod config;
pub mod login;
pub mod saml_handler;
pub mod oidc_handler;
pub mod scim;
pub mod saml;
pub mod oidc;
pub mod helpers;

use axum::{
    routing::{delete, get, post},
    Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

// Re-export handler functions for router
use handlers::*;
use scim::*;
use login::{initiate_sso_login, list_sso_providers};
use saml_handler::saml_callback;
use oidc_handler::oidc_callback;

// Re-export config types used by other modules
pub use config::{SsoConfigRow, sso_config_to_json};

// ── Router ──────────────────────────────────────────────────

pub fn router() -> Router {
    Router::new()
        .route("/config", get(get_sso_config))
        .route("/config", post(upsert_sso_config))
        .route("/config", delete(delete_sso_config))
        .route("/test", post(test_sso_connection))
        .route("/verify-domain", post(initiate_domain_verification))
        .route("/verify-domain/check", post(check_domain_verification))
        .route("/login-attempts", get(get_login_attempts))
        .route("/scim/v2/Users", get(scim_list_users).post(scim_create_user))
        .route("/scim/v2/Users/{id}", get(scim_get_user).put(scim_update_user).patch(scim_patch_user).delete(scim_delete_user))
        .route("/scim/v2/Groups", get(scim_list_groups))
        .route("/scim/v2/ServiceProviderConfig", get(scim_service_provider_config))
        .route("/scim/v2/ResourceTypes", get(scim_resource_types))
        .route("/scim/v2/Schemas", get(scim_schemas))
}

pub fn public_router() -> Router {
    Router::new()
        .route("/login", get(initiate_sso_login))
        .route("/saml/callback", post(saml_callback))
        .route("/oidc/callback", get(oidc_callback))
        .route("/providers", get(list_sso_providers))
}

// ── Config Response ─────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct SsoConfigResponse {
    pub id: Uuid,
    pub provider: String,
    pub enabled: bool,
    pub metadata_url: Option<String>,
    pub entity_id: Option<String>,
    pub sso_url: Option<String>,
    pub certificate_set: bool,
    pub issuer_url: Option<String>,
    pub client_id: Option<String>,
    pub client_secret_set: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    // New fields
    pub role_mapping: Option<serde_json::Value>,
    pub team_mapping: Option<serde_json::Value>,
    pub scim_enabled: bool,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpsertSsoRequest {
    pub provider: Option<String>,
    pub enabled: Option<bool>,
    pub admin_bypass: Option<bool>,
    // Team scope
    pub team_id: Option<Uuid>,
    // Domain
    pub verified_domain: Option<String>,
    // SAML
    pub metadata_url: Option<String>,
    pub entity_id: Option<String>,
    pub sso_url: Option<String>,
    pub certificate: Option<String>,
    // OIDC
    pub issuer_url: Option<String>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    // Auto team join
    pub default_team_id: Option<String>,
    pub default_role: Option<String>,
    // Role & Team mapping
    pub role_mapping: Option<serde_json::Value>,
    pub team_mapping: Option<serde_json::Value>,
    // SCIM
    pub scim_enabled: Option<bool>,
    pub scim_token: Option<String>,
}

// ── OIDC Discovery Document ─────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct OidcDiscovery {
    pub authorization_endpoint: String,
    pub token_endpoint: String,
    pub issuer: String,
    pub jwks_uri: Option<String>,
}

// ── OIDC Token Response ─────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct OidcTokenResponse {
    #[allow(dead_code)]
    pub access_token: Option<String>,
    pub id_token: Option<String>,
    #[allow(dead_code)]
    pub token_type: Option<String>,
    #[allow(dead_code)]
    pub expires_in: Option<i64>,
}

// ── SAML Response Parsing ───────────────────────────────────

#[derive(Debug)]
pub struct SamlAssertion {
    pub name_id: String,
    #[allow(dead_code)]
    pub session_index: Option<String>,
    attributes: std::collections::HashMap<String, String>,
    pub not_on_or_after: Option<DateTime<Utc>>,
    pub in_response_to: Option<String>,
    pub destination: Option<String>,
    pub audience: Option<String>,
    pub certificate: Option<String>,
}

// ── SSO Login Query ─────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct SsoLoginQuery {
    pub email: String,
    pub redirect: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct OidcCallbackQuery {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SsoProviderQuery {
    pub domain: String,
}

// ── State Storage (in-memory for now, should be Redis) ──────


#[derive(Clone)]
pub struct SsoStateStore {
    pub states: Arc<Mutex<HashMap<String, SsoLoginState>>>,
    pub redis: Option<redis::aio::ConnectionManager>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SsoLoginState {
    pub customer_id: Uuid,
    pub email: String,
    pub provider: String,
    pub redirect: Option<String>,
    pub saml_request_id: Option<String>,
    pub auto_join_team_id: Option<Uuid>,
    pub default_role: String,
    pub nonce: Option<String>,
    pub created_at: DateTime<Utc>,
    // New fields for role/team mapping
    pub sso_config_id: Uuid,
    pub role_mapping: Option<serde_json::Value>,
    pub team_mapping: Option<serde_json::Value>,
}

pub const SSO_STATE_TTL_SECS: u64 = 600; // 10 minutes

impl SsoStateStore {
    pub fn new() -> Self {
        Self {
            states: Arc::new(Mutex::new(HashMap::new())),
            redis: None,
        }
    }

    pub fn with_redis(mut self, redis: redis::aio::ConnectionManager) -> Self {
        self.redis = Some(redis);
        self
    }

    pub async fn insert(&self, state: String, login_state: SsoLoginState) {
        // Always write to in-memory as fallback
        self.states.lock().await.insert(state.clone(), login_state.clone());
        // Also write to Redis if available
        if let Some(ref mut redis) = self.redis.clone() {
            match serde_json::to_string(&login_state) {
                Ok(json) => {
                    let key = format!("sso:state:{}", state);
                    let _: Result<(), _> = redis::cmd("SETEX")
                        .arg(&key)
                        .arg(SSO_STATE_TTL_SECS)
                        .arg(&json)
                        .query_async(redis)
                        .await;
                }
                Err(e) => tracing::warn!("Failed to serialize SSO state: {}", e),
            }
        }
    }

    pub async fn remove(&self, state: &str) -> Option<SsoLoginState> {
        // Try Redis first
        if let Some(ref mut redis) = self.redis.clone() {
            let key = format!("sso:state:{}", state);
            let result: Result<Option<String>, _> = redis::cmd("GET")
                .arg(&key)
                .query_async(redis)
                .await;
            if let Ok(Some(json)) = result {
                // Delete from Redis
                let _: Result<(), _> = redis::cmd("DEL")
                    .arg(&key)
                    .query_async(redis)
                    .await;
                // Also remove from in-memory
                self.states.lock().await.remove(state);
                return serde_json::from_str(&json).ok();
            }
        }
        // Fallback to in-memory
        self.states.lock().await.remove(state)
    }

    /// Remove expired states from in-memory store (call periodically)
    pub async fn cleanup_expired(&self) {
        let mut states = self.states.lock().await;
        let now = Utc::now();
        let before_count = states.len();
        states.retain(|_, state| {
            (now - state.created_at).num_seconds() < SSO_STATE_TTL_SECS as i64
        });
        let removed = before_count - states.len();
        if removed > 0 {
            tracing::info!("SSO state cleanup: removed {} expired states", removed);
        }
    }
}

// ── Query params for team-scoped endpoints ──────────────────

#[derive(Debug, Deserialize)]
pub struct TeamQuery {
    pub team_id: Option<Uuid>,
}



#[cfg(test)]
mod tests;
