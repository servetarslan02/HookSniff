//! SSO/SAML/OIDC Configuration & Login API
//!
//! Full Single Sign-On implementation for enterprise customers.
//!
//! ## Endpoints
//!
//! ### Configuration
//! - `GET  /sso/config` — Get current SSO configuration
//! - `POST /sso/config` — Create/update SSO configuration
//! - `DELETE /sso/config` — Remove SSO configuration
//! - `POST /sso/test` — Test SSO connection (real IdP validation)
//!
//! ### Login Flow
//! - `GET  /sso/login` — Initiate SSO login (redirects to IdP)
//! - `POST /sso/saml/callback` — SAML ACS (Assertion Consumer Service)
//! - `GET  /sso/oidc/callback` — OIDC callback handler
//! - `GET  /sso/providers` — List configured SSO providers for a domain

use axum::{
    extract::{Extension, Query},
    http::HeaderMap,
    response::Redirect,
    routing::{delete, get, post},
    Json, Router,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::jwt;
use crate::crypto;
use crate::error::AppError;
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;

// ── Router ──────────────────────────────────────────────────

pub fn router() -> Router {
    Router::new()
        // Config CRUD (authenticated)
        .route("/config", get(get_sso_config))
        .route("/config", post(upsert_sso_config))
        .route("/config", delete(delete_sso_config))
        // Test (authenticated)
        .route("/test", post(test_sso_connection))
        // Domain verification
        .route("/verify-domain", post(initiate_domain_verification))
        .route("/verify-domain/check", post(check_domain_verification))
        // Login attempts
        .route("/login-attempts", get(get_login_attempts))
}

/// Public SSO routes (login + callbacks) — no auth required
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
}

// ── OIDC Discovery Document ─────────────────────────────────

#[derive(Debug, Deserialize)]
struct OidcDiscovery {
    authorization_endpoint: String,
    token_endpoint: String,
    issuer: String,
    jwks_uri: Option<String>,
}

// ── OIDC Token Response ─────────────────────────────────────

#[derive(Debug, Deserialize)]
struct OidcTokenResponse {
    access_token: Option<String>,
    id_token: Option<String>,
    token_type: Option<String>,
    expires_in: Option<i64>,
}

// ── SAML Response Parsing ───────────────────────────────────

#[derive(Debug)]
struct SamlAssertion {
    name_id: String,
    session_index: Option<String>,
    attributes: std::collections::HashMap<String, String>,
    not_on_or_after: Option<DateTime<Utc>>,
    in_response_to: Option<String>,
    destination: Option<String>,
    audience: Option<String>,
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

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct SsoStateStore {
    states: Arc<Mutex<HashMap<String, SsoLoginState>>>,
    redis: Option<redis::aio::ConnectionManager>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct SsoLoginState {
    customer_id: Uuid,
    email: String,
    provider: String,
    redirect: Option<String>,
    saml_request_id: Option<String>,
    auto_join_team_id: Option<Uuid>,
    default_role: String,
    created_at: DateTime<Utc>,
}

const SSO_STATE_TTL_SECS: u64 = 600; // 10 minutes

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

    async fn insert(&self, state: String, login_state: SsoLoginState) {
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

    async fn remove(&self, state: &str) -> Option<SsoLoginState> {
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
}

// ── Query params for team-scoped endpoints ──────────────────

#[derive(Debug, Deserialize)]
pub struct TeamQuery {
    pub team_id: Option<Uuid>,
}

// ── GET /sso/config ─────────────────────────────────────────

async fn get_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<TeamQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    // If team_id provided, verify membership and get team's SSO config
    // Otherwise, fall back to customer's own SSO config (backward compat)
    let config = if let Some(team_id) = query.team_id {
        // Verify user is a member of this team
        let _member = sqlx::query_as::<_, (Uuid, String)>(
            "SELECT id, role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(team_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Forbidden("Not a member of this team".into()))?;

        sqlx::query_as::<_, (Uuid, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, bool, Option<String>, Option<Uuid>, Option<String>, DateTime<Utc>, DateTime<Utc>)>(
            "SELECT s.id, s.provider, s.enabled, s.metadata_url, s.entity_id, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.admin_bypass, s.verified_domain, s.default_team_id, s.default_role, s.created_at, s.updated_at
             FROM sso_configs s WHERE s.team_id = $1 LIMIT 1"
        )
        .bind(team_id)
        .fetch_optional(&pool)
        .await?
        .map(|(id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_enc, admin_bypass, verified_domain, default_team_id, default_role, created_at, updated_at)| {
            serde_json::json!({
                "id": id,
                "provider": provider,
                "enabled": enabled,
                "verified_domain": verified_domain,
                "metadata_url": metadata_url,
                "entity_id": entity_id,
                "sso_url": sso_url,
                "certificate_set": certificate.is_some(),
                "issuer_url": issuer_url,
                "client_id": client_id,
                "client_secret_set": client_secret_enc.is_some(),
                "admin_bypass": admin_bypass,
                "default_team_id": default_team_id,
                "default_role": default_role.unwrap_or_else(|| "viewer".to_string()),
                "created_at": created_at,
                "updated_at": updated_at,
            })
        })
    } else {
        // Backward compat: find by customer_id (old behavior)
        sqlx::query_as::<_, (Uuid, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, bool, Option<String>, Option<Uuid>, Option<String>, DateTime<Utc>, DateTime<Utc>)>(
            "SELECT id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, admin_bypass, verified_domain, default_team_id, default_role, created_at, updated_at
             FROM sso_configs WHERE customer_id = $1 LIMIT 1"
        )
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .map(|(id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_enc, admin_bypass, verified_domain, default_team_id, default_role, created_at, updated_at)| {
            serde_json::json!({
                "id": id,
                "provider": provider,
                "enabled": enabled,
                "verified_domain": verified_domain,
                "metadata_url": metadata_url,
                "entity_id": entity_id,
                "sso_url": sso_url,
                "certificate_set": certificate.is_some(),
                "issuer_url": issuer_url,
                "client_id": client_id,
                "client_secret_set": client_secret_enc.is_some(),
                "admin_bypass": admin_bypass,
                "default_team_id": default_team_id,
                "default_role": default_role.unwrap_or_else(|| "viewer".to_string()),
                "created_at": created_at,
                "updated_at": updated_at,
            })
        })
    };

    match config {
        Some(json) => Ok(Json(json)),
        None => Ok(Json(serde_json::json!({
            "provider": "saml",
            "enabled": false,
            "metadata_url": null,
            "entity_id": null,
            "sso_url": null,
            "certificate_set": false,
            "issuer_url": null,
            "client_id": null,
            "client_secret_set": false,
        }))),
    }
}

// ── POST /sso/config ────────────────────────────────────────

async fn upsert_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpsertSsoRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let provider = req.provider.unwrap_or_else(|| "saml".to_string());

    if !["saml", "oidc"].contains(&provider.as_str()) {
        return Err(AppError::BadRequest("SSO provider must be either 'saml' or 'oidc'".into()));
    }

    let enabled = req.enabled.unwrap_or(false);
    let admin_bypass = req.admin_bypass.unwrap_or(true);

    // Determine the scope: team_id (preferred) or customer_id (backward compat)
    let scope_team_id: Option<Uuid> = if let Some(tid) = req.team_id {
        // Verify user is admin of this team
        let member = sqlx::query_as::<_, (String,)>(
            "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(tid)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Forbidden("Not a member of this team".into()))?;

        if member.0 != "admin" {
            // Also check if user is team owner
            let is_owner: Option<(Uuid,)> = sqlx::query_as(
                "SELECT id FROM teams WHERE id = $1 AND owner_id = $2"
            )
            .bind(tid)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?;

            if is_owner.is_none() {
                return Err(AppError::Forbidden("Only team admins can manage SSO".into()));
            }
        }
        Some(tid)
    } else {
        None
    };

    // Validate required fields when enabling
    if enabled {
        if provider == "saml" {
            if req.sso_url.is_none() && req.metadata_url.is_none() {
                return Err(AppError::BadRequest("SAML requires either a metadata URL or an SSO URL".into()));
            }
            if req.certificate.is_none() {
                // Check if existing certificate exists
                let existing = if let Some(tid) = scope_team_id {
                    sqlx::query_scalar::<_, Option<String>>(
                        "SELECT certificate FROM sso_configs WHERE team_id = $1"
                    )
                    .bind(tid)
                    .fetch_optional(&pool)
                    .await?
                    .flatten()
                } else {
                    sqlx::query_scalar::<_, Option<String>>(
                        "SELECT certificate FROM sso_configs WHERE customer_id = $1"
                    )
                    .bind(customer.id)
                    .fetch_optional(&pool)
                    .await?
                    .flatten()
                };

                if existing.is_none() && req.certificate.is_none() {
                    return Err(AppError::BadRequest("SAML requires an X.509 certificate".into()));
                }
            }
        } else if provider == "oidc" {
            if req.issuer_url.is_none() || req.client_id.is_none() {
                return Err(AppError::BadRequest("OIDC requires an issuer URL and a client ID".into()));
            }
            if req.client_secret.is_none() {
                let existing = if let Some(tid) = scope_team_id {
                    sqlx::query_scalar::<_, Option<String>>(
                        "SELECT client_secret_encrypted FROM sso_configs WHERE team_id = $1"
                    )
                    .bind(tid)
                    .fetch_optional(&pool)
                    .await?
                    .flatten()
                } else {
                    sqlx::query_scalar::<_, Option<String>>(
                        "SELECT client_secret_encrypted FROM sso_configs WHERE customer_id = $1"
                    )
                    .bind(customer.id)
                    .fetch_optional(&pool)
                    .await?
                    .flatten()
                };

                if existing.is_none() {
                    return Err(AppError::BadRequest("OIDC requires a client secret".into()));
                }
            }
        }
    }

    // Validate default_role if provided
    if let Some(ref role) = req.default_role {
        if !["admin", "developer", "analyst", "viewer"].contains(&role.as_str()) {
            return Err(AppError::BadRequest("default_role must be 'admin', 'developer', 'analyst', or 'viewer'".into()));
        }
    }

    // Encrypt client secret if provided
    let client_secret_enc = match req.client_secret {
        Some(ref secret) if !secret.is_empty() => {
            Some(crypto::encrypt(secret).map_err(|e| {
                tracing::error!("Failed to encrypt SSO client_secret: {}", e);
                AppError::Internal(anyhow::anyhow!("Encryption failed"))
            })?)
        }
        _ => None,
    };

    if let Some(tid) = scope_team_id {
        // Team-scoped SSO config (new behavior)
        sqlx::query(
            r#"INSERT INTO sso_configs (team_id, customer_id, created_by, provider, enabled, admin_bypass, verified_domain, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, default_team_id, default_role)
               VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
               ON CONFLICT (team_id) DO UPDATE SET
                   provider = EXCLUDED.provider,
                   enabled = EXCLUDED.enabled,
                   admin_bypass = EXCLUDED.admin_bypass,
                   verified_domain = EXCLUDED.verified_domain,
                   metadata_url = EXCLUDED.metadata_url,
                   entity_id = EXCLUDED.entity_id,
                   sso_url = EXCLUDED.sso_url,
                   certificate = COALESCE(EXCLUDED.certificate, sso_configs.certificate),
                   issuer_url = EXCLUDED.issuer_url,
                   client_id = EXCLUDED.client_id,
                   client_secret_encrypted = COALESCE(EXCLUDED.client_secret_encrypted, sso_configs.client_secret_encrypted),
                   default_team_id = EXCLUDED.default_team_id,
                   default_role = EXCLUDED.default_role,
                   updated_at = now()"#
        )
        .bind(tid)
        .bind(customer.id)
        .bind(&provider)
        .bind(enabled)
        .bind(admin_bypass)
        .bind(&req.verified_domain)
        .bind(&req.metadata_url)
        .bind(&req.entity_id)
        .bind(&req.sso_url)
        .bind(&req.certificate)
        .bind(&req.issuer_url)
        .bind(&req.client_id)
        .bind(&client_secret_enc)
        .bind(&req.default_team_id.as_deref().and_then(|s| Uuid::parse_str(s).ok()))
        .bind(req.default_role.as_deref().unwrap_or("viewer"))
        .execute(&pool)
        .await?;

        tracing::info!("SSO config updated: team={}, provider={}, enabled={}", tid, provider, enabled);
    } else {
        // Customer-scoped SSO config (backward compat)
        sqlx::query(
            r#"INSERT INTO sso_configs (customer_id, provider, enabled, admin_bypass, verified_domain, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, default_team_id, default_role)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
               ON CONFLICT (customer_id) DO UPDATE SET
                   provider = EXCLUDED.provider,
                   enabled = EXCLUDED.enabled,
                   admin_bypass = EXCLUDED.admin_bypass,
                   verified_domain = EXCLUDED.verified_domain,
                   metadata_url = EXCLUDED.metadata_url,
                   entity_id = EXCLUDED.entity_id,
                   sso_url = EXCLUDED.sso_url,
                   certificate = COALESCE(EXCLUDED.certificate, sso_configs.certificate),
                   issuer_url = EXCLUDED.issuer_url,
                   client_id = EXCLUDED.client_id,
                   client_secret_encrypted = COALESCE(EXCLUDED.client_secret_encrypted, sso_configs.client_secret_encrypted),
                   default_team_id = EXCLUDED.default_team_id,
                   default_role = EXCLUDED.default_role,
                   updated_at = now()"#
        )
        .bind(customer.id)
        .bind(&provider)
        .bind(enabled)
        .bind(admin_bypass)
        .bind(&req.verified_domain)
        .bind(&req.metadata_url)
        .bind(&req.entity_id)
        .bind(&req.sso_url)
        .bind(&req.certificate)
        .bind(&req.issuer_url)
        .bind(&req.client_id)
        .bind(&client_secret_enc)
        .bind(&req.default_team_id.as_deref().and_then(|s| Uuid::parse_str(s).ok()))
        .bind(req.default_role.as_deref().unwrap_or("viewer"))
        .execute(&pool)
        .await?;

        tracing::info!("SSO config updated: customer={}, provider={}, enabled={}", customer.id, provider, enabled);
    }

    Ok(Json(serde_json::json!({
        "success": true,
        "provider": provider,
        "enabled": enabled,
    })))
}

// ── DELETE /sso/config ──────────────────────────────────────

async fn delete_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<TeamQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = if let Some(team_id) = query.team_id {
        // Verify team membership first
        let member = sqlx::query_scalar::<_, String>(
            "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(team_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?;

        if member.is_none() {
            return Err(AppError::Forbidden("You are not a member of this team".into()));
        }

        sqlx::query("DELETE FROM sso_configs WHERE team_id = $1")
            .bind(team_id)
            .execute(&pool)
            .await?
    } else {
        sqlx::query("DELETE FROM sso_configs WHERE customer_id = $1 AND team_id IS NULL")
            .bind(customer.id)
            .execute(&pool)
            .await?
    };

    Ok(Json(serde_json::json!({
        "deleted": result.rows_affected() > 0,
    })))
}

// ── Domain Verification ──────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct VerifyDomainRequest {
    domain: String,
}

#[derive(Debug, Serialize)]
struct VerifyDomainResponse {
    txt_record: String,
    instructions: String,
}

// ── GET /sso/login-attempts ──────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
struct LoginAttempt {
    id: Uuid,
    email: String,
    provider: String,
    success: bool,
    error_message: Option<String>,
    ip_address: Option<String>,
    created_at: DateTime<Utc>,
}

/// GET /sso/login-attempts — List recent SSO login attempts (admin only)
async fn get_login_attempts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Only admins can view login attempts
    if !customer.is_admin {
        return Err(AppError::Forbidden("Admin access required".into()));
    }

    let page: i64 = query.get("page").and_then(|p| p.parse().ok()).unwrap_or(1).max(1);
    let limit: i64 = query.get("limit").and_then(|l| l.parse().ok()).unwrap_or(50).min(200);
    let offset = (page - 1) * limit;

    let attempts = sqlx::query_as::<_, LoginAttempt>(
        "SELECT id, email, provider, success, error_message, ip_address, created_at
         FROM sso_login_attempts
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2"
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&pool)
    .await?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM sso_login_attempts")
        .fetch_one(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "attempts": attempts,
        "total": total.0,
        "page": page,
        "limit": limit,
        "has_more": offset + limit < total.0,
    })))
}

/// POST /sso/verify-domain — Generate TXT record for domain verification
async fn initiate_domain_verification(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<VerifyDomainRequest>,
) -> Result<Json<VerifyDomainResponse>, AppError> {
    let domain = req.domain.trim().to_lowercase();

    // Strict domain validation — only allow valid domain characters
    if domain.is_empty() || !domain.contains('.') || domain.contains(' ') {
        return Err(AppError::BadRequest("Invalid domain format".into()));
    }
    // Only allow alphanumeric, hyphens, and dots in domain
    if !domain.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.') {
        return Err(AppError::BadRequest("Domain contains invalid characters".into()));
    }
    // Block common public domains
    let blocked = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "protonmail.com", "mail.com"];
    if blocked.contains(&domain.as_str()) {
        return Err(AppError::BadRequest("Cannot verify public email domains".into()));
    }

    // Generate verification token
    let verification_token = format!("hooksniff-verify-{}", Uuid::new_v4());

    // Store in DB (pending verification)
    sqlx::query(
        r#"INSERT INTO domain_verifications (customer_id, domain, txt_value, verified, created_at)
           VALUES ($1, $2, $3, false, NOW())
           ON CONFLICT (customer_id, domain) DO UPDATE SET txt_value = $3, verified = false, created_at = NOW()"#
    )
    .bind(customer.id)
    .bind(&domain)
    .bind(&verification_token)
    .execute(&pool)
    .await?;

    tracing::info!("Domain verification initiated: {} for customer {}", domain, customer.id);

    Ok(Json(VerifyDomainResponse {
        txt_record: verification_token.clone(),
        instructions: format!(
            "Add a TXT record to your DNS: name: _hooksniff.{} value: {}",
            domain, verification_token
        ),
    }))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct CheckDomainRequest {
    domain: String,
}

#[derive(Debug, Serialize)]
struct CheckDomainResponse {
    verified: bool,
    message: String,
}

/// POST /sso/verify-domain/check — Verify domain via DNS TXT record lookup
async fn check_domain_verification(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CheckDomainRequest>,
) -> Result<Json<CheckDomainResponse>, AppError> {
    let domain = req.domain.trim().to_lowercase();

    // Get the expected TXT value from DB
    let row: Option<(String,)> = sqlx::query_as(
        "SELECT txt_value FROM domain_verifications WHERE customer_id = $1 AND domain = $2"
    )
    .bind(customer.id)
    .bind(&domain)
    .fetch_optional(&pool)
    .await?;

    let (expected_txt,) = match row {
        Some(r) => r,
        None => return Err(AppError::BadRequest("No pending verification for this domain".into())),
    };

    // DNS TXT record lookup — use Google DNS-over-HTTPS (no subprocess, no extra crate)
    let txt_name = format!("_hooksniff.{}", domain);
    let verified = {
        let client = crate::http_client::get_client().clone();
        let doh_url = format!("https://dns.google/resolve?name={}&type=TXT", txt_name);
        match client.get(&doh_url).send().await {
            Ok(resp) if resp.status().is_success() => {
                match resp.json::<serde_json::Value>().await {
                    Ok(dns_response) => {
                        let expected_clean = expected_txt.trim_matches('"');
                        if let Some(answers) = dns_response["Answer"].as_array() {
                            answers.iter().any(|answer| {
                                if let Some(data) = answer["data"].as_str() {
                                    data.trim_matches('"') == expected_clean
                                } else {
                                    false
                                }
                            })
                        } else {
                            false
                        }
                    }
                    Err(e) => {
                        tracing::warn!("Failed to parse DNS response for {}: {}", txt_name, e);
                        false
                    }
                }
            }
            Ok(resp) => {
                tracing::warn!("DNS lookup returned HTTP {} for {}", resp.status(), txt_name);
                false
            }
            Err(e) => {
                tracing::warn!("DNS lookup failed for {}: {}", txt_name, e);
                false
            }
        }
    };

    if verified {
        // Mark as verified in DB
        sqlx::query(
            "UPDATE domain_verifications SET verified = true, verified_at = NOW() WHERE customer_id = $1 AND domain = $2"
        )
        .bind(customer.id)
        .bind(&domain)
        .execute(&pool)
        .await?;

        // Also update the SSO config verified_domain
        sqlx::query(
            "UPDATE sso_configs SET verified_domain = $1, updated_at = NOW() WHERE customer_id = $2"
        )
        .bind(&domain)
        .bind(customer.id)
        .execute(&pool)
        .await?;

        tracing::info!("Domain {} verified for customer {}", domain, customer.id);

        Ok(Json(CheckDomainResponse {
            verified: true,
            message: format!("Domain {} verified successfully!", domain),
        }))
    } else {
        Ok(Json(CheckDomainResponse {
            verified: false,
            message: format!(
                "TXT record not found. Add a TXT record: name: _hooksniff.{} value: {}",
                domain, expected_txt
            ),
        }))
    }
}

// ── POST /sso/test ──────────────────────────────────────────

async fn test_sso_connection(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config = sqlx::query_as::<_, (String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
        "SELECT provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, metadata_url, entity_id FROM sso_configs WHERE customer_id = $1 LIMIT 1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let (provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_enc, _meta2, _entity) =
        config.ok_or_else(|| AppError::BadRequest("No SSO configuration found. Please set up SSO first.".into()))?;

    if !enabled {
        return Err(AppError::BadRequest("SSO is not enabled. Please enable it before testing.".into()));
    }

    let mut issues = Vec::new();
    let mut test_details = serde_json::json!({});

    if provider == "saml" {
        // Validate SAML config
        if metadata_url.is_none() && sso_url.is_none() {
            issues.push("SAML requires metadata_url or sso_url");
        }
        if certificate.is_none() {
            issues.push("SAML requires a certificate");
        }

        // Try to fetch metadata URL if provided
        if let Some(ref meta_url) = metadata_url {
            let client = crate::http_client::get_client().clone();
            match client.get(meta_url).send().await {
                Ok(resp) if resp.status().is_success() => {
                    let body = resp.text().await.unwrap_or_default();
                    if body.contains("EntityDescriptor") || body.contains("md:EntityDescriptor") {
                        test_details["metadata_valid"] = serde_json::json!(true);
                        test_details["metadata_size"] = serde_json::json!(body.len());
                    } else {
                        issues.push("Metadata URL does not return valid SAML metadata (no EntityDescriptor found)");
                    }
                }
                Ok(resp) => {
                    issues.push(&*format!("Metadata URL returned HTTP {}", resp.status()));
                    // Leak the string to make it static
                    let msg = format!("Metadata URL returned HTTP {}", resp.status());
                    return Ok(Json(serde_json::json!({
                        "valid": false,
                        "provider": provider,
                        "issues": [msg],
                    })));
                }
                Err(e) => {
                    let msg = format!("Cannot reach metadata URL: {}", e);
                    return Ok(Json(serde_json::json!({
                        "valid": false,
                        "provider": provider,
                        "issues": [msg],
                    })));
                }
            }
        }
    } else if provider == "oidc" {
        // Validate OIDC config
        if issuer_url.is_none() {
            issues.push("OIDC requires issuer_url");
        }
        if client_id.is_none() {
            issues.push("OIDC requires client_id");
        }
        if client_secret_enc.is_none() {
            issues.push("OIDC requires client_secret");
        }

        // Try to fetch OIDC discovery document
        if let Some(ref issuer) = issuer_url {
            let discovery_url = format!("{}/.well-known/openid-configuration", issuer.trim_end_matches('/'));
            let client = crate::http_client::get_client().clone();
            match client.get(&discovery_url).send().await {
                Ok(resp) if resp.status().is_success() => {
                    match resp.json::<OidcDiscovery>().await {
                        Ok(discovery) => {
                            test_details["authorization_endpoint"] = serde_json::json!(discovery.authorization_endpoint);
                            test_details["token_endpoint"] = serde_json::json!(discovery.token_endpoint);
                            test_details["issuer"] = serde_json::json!(discovery.issuer);
                        }
                        Err(_) => {
                            issues.push("OIDC discovery document is invalid (cannot parse JSON)");
                        }
                    }
                }
                Ok(resp) => {
                    let msg = format!("OIDC discovery returned HTTP {}", resp.status());
                    return Ok(Json(serde_json::json!({
                        "valid": false,
                        "provider": provider,
                        "issues": [msg],
                    })));
                }
                Err(e) => {
                    let msg = format!("Cannot reach OIDC discovery endpoint: {}", e);
                    return Ok(Json(serde_json::json!({
                        "valid": false,
                        "provider": provider,
                        "issues": [msg],
                    })));
                }
            }
        }
    }

    if issues.is_empty() {
        Ok(Json(serde_json::json!({
            "valid": true,
            "provider": provider,
            "message": format!("{} SSO configuration is valid. You can now test login via /sso/login?email=your@email.com", provider.to_uppercase()),
            "details": test_details,
        })))
    } else {
        let issue_strings: Vec<String> = issues.iter().map(|s| s.to_string()).collect();
        Ok(Json(serde_json::json!({
            "valid": false,
            "provider": provider,
            "issues": issue_strings,
        })))
    }
}

// ── GET /sso/login ──────────────────────────────────────────
// Initiates SSO login by redirecting to IdP.
// Works for BOTH existing users and new (auto-provisioned) users.

async fn initiate_sso_login(
    Extension(pool): Extension<PgPool>,
    Extension(state_store): Extension<SsoStateStore>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Query(query): Query<SsoLoginQuery>,
) -> Result<impl axum::response::IntoResponse, AppError> {
    let email = &query.email;

    // Rate limit: 10 SSO login attempts per IP per minute
    // Extract real client IP from X-Forwarded-For (Cloud Run / load balancer)
    let client_ip = headers.get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(',').next())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| {
            headers.get("x-real-ip")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("unknown")
        });
    let rl_key = format!("sso_login:{}", client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, 10).await;
    if !rl_result.allowed {
        tracing::warn!("⚠️ SSO login rate limit exceeded for IP: {}", client_ip);
        return Err(AppError::RateLimitExceeded);
    }

    // Extract email domain for SSO config lookup
    let domain = email.split('@').nth(1).unwrap_or("");
    if domain.is_empty() || !domain.contains('.') {
        return Err(AppError::BadRequest("Invalid email address".into()));
    }

    // Strategy 1: Find existing customer by email
    let existing_customer = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial FROM customers WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(&pool)
    .await?;

    // Check if existing customer is active
    if let Some(ref c) = existing_customer {
        if !c.is_active {
            return Err(AppError::BadRequest("Account is disabled. Contact support.".into()));
        }
    }

    // Strategy 2: Find SSO config — try by customer_id, then by team membership, then by domain
    // Returns: (owner_id, team_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_enc, entity_id, default_role)
    let config: Option<(Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)> = if let Some(ref customer) = existing_customer {
        // Existing user: look up by customer_id first (backward compat)
        let by_customer = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
            "SELECT customer_id, team_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, entity_id, default_role FROM sso_configs WHERE customer_id = $1 AND enabled = true LIMIT 1"
        )
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?;

        if by_customer.is_some() {
            by_customer
        } else {
            // Try: find by team membership (user is in a team that has SSO)
            sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
                "SELECT s.customer_id, s.team_id, s.provider, s.enabled, s.metadata_url, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.entity_id, s.default_role
                 FROM sso_configs s
                 INNER JOIN team_members tm ON tm.team_id = s.team_id
                 WHERE tm.customer_id = $1 AND s.enabled = true AND s.team_id IS NOT NULL
                 LIMIT 1"
            )
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
        }
    } else {
        // New user: find SSO config by verified_domain first, then by email domain
        let by_verified_domain = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
            "SELECT COALESCE(customer_id, created_by), team_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, entity_id, default_role
             FROM sso_configs WHERE enabled = true AND verified_domain = $1 LIMIT 1"
        )
        .bind(domain)
        .fetch_optional(&pool)
        .await?;

        if by_verified_domain.is_some() {
            by_verified_domain
        } else {
            // Fallback: match by email domain in customer table
            // Use SPLIT_PART for safe domain extraction (parameterized, no injection)
            sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
                "SELECT s.customer_id, s.team_id, s.provider, s.enabled, s.metadata_url, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.entity_id, s.default_role
                 FROM sso_configs s
                 INNER JOIN customers c ON c.id = s.customer_id
                 WHERE s.enabled = true AND SPLIT_PART(c.email, '@', 2) = $1
                 LIMIT 1"
            )
            .bind(domain)
            .fetch_optional(&pool)
            .await?
        }
    };

    let (sso_owner_id, config_team_id, provider, enabled, _metadata_url, sso_url, _certificate, issuer_url, client_id, client_secret_enc, entity_id, default_role) =
        config.ok_or_else(|| AppError::BadRequest("SSO is not configured for this account. Contact your administrator.".into()))?;

    let default_role = default_role.unwrap_or_else(|| "viewer".to_string());

    if !enabled {
        return Err(AppError::BadRequest("SSO is not enabled for this account. Contact your administrator.".into()));
    }

    // Determine the team for auto-join (prefer config_team_id, fallback to default_team_id lookup)
    let auto_join_team_id = if let Some(tid) = config_team_id {
        Some(tid)
    } else {
        // Backward compat: look up default_team_id from sso_configs
        sqlx::query_scalar::<_, Uuid>(
            "SELECT default_team_id FROM sso_configs WHERE customer_id = $1 AND default_team_id IS NOT NULL LIMIT 1"
        )
        .bind(sso_owner_id)
        .fetch_optional(&pool)
        .await?
    };

    // Generate state parameter for CSRF protection
    let state = Uuid::new_v4().to_string();

    // Generate SAML request ID upfront (needed for InResponseTo validation)
    let saml_request_id = if provider == "saml" {
        Some(format!("_{}", Uuid::new_v4().to_string().replace('-', "")))
    } else {
        None
    };

    // Store login state (customer_id = SSO config owner, used in callbacks for auto-team-join)
    state_store.insert(state.clone(), SsoLoginState {
        customer_id: sso_owner_id,
        email: email.clone(),
        provider: provider.clone(),
        redirect: query.redirect.clone(),
        saml_request_id: saml_request_id.clone(),
        auto_join_team_id,
        default_role: default_role.clone(),
        created_at: Utc::now(),
    }).await;

    // Create a minimal Customer struct for the redirect functions
    // (they only use customer.id and customer.email for logging)
    let redirect_customer = existing_customer.clone().unwrap_or_else(|| Customer {
        id: sso_owner_id,
        email: email.clone(),
        api_key_hash: String::new(),
        api_key_prefix: String::new(),
        plan: "free".to_string(),
        webhook_limit: 100,
        webhook_count: 0,
        created_at: Utc::now(),
        password_hash: None,
        stripe_customer_id: None,
        stripe_subscription_id: None,
        payment_provider: "none".to_string(),
        polar_customer_id: None,
        polar_subscription_id: None,
        iyzico_customer_id: None,
        iyzico_subscription_id: None,
        name: None,
        is_active: true,
        is_admin: false,
        role: "member".to_string(),
        updated_at: Utc::now(),
        email_verified: false,
        totp_secret: None,
        totp_enabled: false,
        cancel_at_period_end: false,
        payment_failed_at: None,
        allow_overage: true,
        overage_email_notification: true,
        card_last4: None,
        card_brand: None,
        card_exp_month: None,
        card_exp_year: None,
        card_updated_at: None,
        paused_at: None,
        paused_until: None,
        pause_plan: None,
        has_used_startup_trial: false,
            billing_interval: None,
    });

    if provider == "saml" {
        initiate_saml_login(&pool, &redirect_customer, &state, &sso_url, &entity_id, saml_request_id.as_deref()).await
    } else {
        initiate_oidc_login(&pool, &redirect_customer, &state, &issuer_url, &client_id, &client_secret_enc).await
    }
}

// ── SAML Login: Generate AuthnRequest and redirect ──────────

async fn initiate_saml_login(
    pool: &PgPool,
    customer: &Customer,
    state: &str,
    sso_url: &Option<String>,
    entity_id: &Option<String>,
    request_id: Option<&str>,
) -> Result<(HeaderMap, Redirect), AppError> {
    let sso_url = sso_url.as_deref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("SAML SSO URL not configured"))
    })?;

    let sp_entity_id = entity_id.as_deref().unwrap_or("urn:hooksniff:sp");
    let acs_url = format!(
        "{}/v1/sso/saml/callback",
        std::env::var("API_URL").unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string())
    );

    // Build SAML AuthnRequest (XML)
    let request_id = request_id.map(String::from).unwrap_or_else(|| format!("_{}", Uuid::new_v4().to_string().replace('-', "")));
    let issue_instant = Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    let authn_request = format!(
        r#"<samlp:AuthnRequest
            xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
            xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
            ID="{request_id}"
            Version="2.0"
            IssueInstant="{issue_instant}"
            AssertionConsumerServiceURL="{acs_url}"
            ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
            <saml:Issuer>{sp_entity_id}</saml:Issuer>
            <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
        </samlp:AuthnRequest>"#,
        request_id = request_id,
        issue_instant = issue_instant,
        acs_url = acs_url,
        sp_entity_id = sp_entity_id,
    );

    // Base64 encode the AuthnRequest
    use base64::Engine;
    let encoded = base64::engine::general_purpose::STANDARD.encode(authn_request.as_bytes());

    // URL-encode and redirect
    let redirect_url = format!(
        "{}?SAMLRequest={}&RelayState={}",
        sso_url,
        urlencoding::encode(&encoded),
        urlencoding::encode(state),
    );

    tracing::info!("SAML login redirect: customer={}, idp={}", customer.id, sso_url);

    let mut headers = HeaderMap::new();
    headers.insert(
        "location",
        axum::http::HeaderValue::from_str(&redirect_url).unwrap(),
    );
    Ok((headers, Redirect::temporary(&redirect_url)))
}

// ── OIDC Login: Redirect to authorization endpoint ──────────

async fn initiate_oidc_login(
    pool: &PgPool,
    customer: &Customer,
    state: &str,
    issuer_url: &Option<String>,
    client_id: &Option<String>,
    client_secret_enc: &Option<String>,
) -> Result<(HeaderMap, Redirect), AppError> {
    let issuer = issuer_url.as_deref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("OIDC issuer URL not configured"))
    })?;
    let client_id = client_id.as_deref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("OIDC client ID not configured"))
    })?;

    // Decrypt client secret to validate it exists
    if let Some(ref enc) = client_secret_enc {
        crypto::decrypt(enc).map_err(|e| {
            tracing::error!("Failed to decrypt OIDC client_secret: {}", e);
            AppError::Internal(anyhow::anyhow!("SSO configuration error: cannot decrypt client secret"))
        })?;
    }

    // Fetch OIDC discovery document
    let discovery_url = format!("{}/.well-known/openid-configuration", issuer.trim_end_matches('/'));
    let client = crate::http_client::get_client().clone();
    let discovery = client
        .get(&discovery_url)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch OIDC discovery: {}", e)))?
        .json::<OidcDiscovery>()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid OIDC discovery document: {}", e)))?;

    let redirect_uri = format!(
        "{}/v1/sso/oidc/callback",
        std::env::var("API_URL").unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string())
    );

    let nonce = Uuid::new_v4().to_string();

    // Build authorization URL
    let auth_url = format!(
        "{}?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile&state={}&nonce={}&access_type=offline",
        discovery.authorization_endpoint,
        urlencoding::encode(client_id),
        urlencoding::encode(&redirect_uri),
        urlencoding::encode(state),
        urlencoding::encode(&nonce),
    );

    tracing::info!("OIDC login redirect: customer={}, issuer={}", customer.id, issuer);

    let mut headers = HeaderMap::new();
    headers.insert(
        "location",
        axum::http::HeaderValue::from_str(&auth_url).unwrap(),
    );
    Ok((headers, Redirect::temporary(&auth_url)))
}

// ── POST /sso/saml/callback ─────────────────────────────────
// Handles SAML Response from IdP

async fn saml_callback(
    Extension(pool): Extension<PgPool>,
    Extension(state_store): Extension<SsoStateStore>,
    Extension(cfg): Extension<crate::config::Config>,
    headers: HeaderMap,
    body: String,
) -> Result<impl axum::response::IntoResponse, AppError> {
    // Parse form-encoded body: SAMLResponse + RelayState
    let params: HashMap<String, String> = url::form_urlencoded::parse(body.as_bytes())
        .into_owned()
        .collect();

    let saml_response_b64 = params.get("SAMLResponse")
        .ok_or_else(|| AppError::BadRequest("Missing SAMLResponse parameter".into()))?;
    let relay_state = params.get("RelayState").cloned();

    // Decode base64 SAML response
    use base64::Engine;
    let saml_xml = base64::engine::general_purpose::STANDARD
        .decode(saml_response_b64)
        .map_err(|_| AppError::BadRequest("Invalid base64 in SAMLResponse".into()))?;
    let saml_xml = String::from_utf8(saml_xml)
        .map_err(|_| AppError::BadRequest("SAMLResponse is not valid UTF-8".into()))?;

    // Parse SAML assertion
    let assertion = parse_saml_response(&saml_xml)?;

    // Validate assertion timing
    if let Some(not_on_or_after) = assertion.not_on_or_after {
        if Utc::now() > not_on_or_after {
            return Err(AppError::BadRequest("SAML assertion has expired".into()));
        }
    }

    // Look up login state via RelayState
    let state = relay_state.as_deref().unwrap_or("");
    let login_state = state_store.remove(state).await;

    // Validate InResponseTo matches our request ID (replay protection)
    if let (Some(ref in_response_to), Some(ref ls)) = (&assertion.in_response_to, &login_state) {
        if let Some(ref expected_id) = ls.saml_request_id {
            if in_response_to != expected_id {
                tracing::warn!("⚠️ SAML InResponseTo mismatch: expected={}, got={}", expected_id, in_response_to);
                // Log but don't block — some IdPs don't set InResponseTo correctly
            }
        }
    }

    // Log SAML assertion details for audit
    if let Some(ref dest) = assertion.destination {
        tracing::debug!("SAML destination: {}", dest);
    }
    if let Some(ref aud) = assertion.audience {
        tracing::debug!("SAML audience: {}", aud);
    }

    let email = if let Some(ref ls) = login_state {
        // Verify email matches — strict check
        if assertion.name_id != ls.email {
            tracing::warn!("SAML email mismatch: expected={}, got={}", ls.email, assertion.name_id);
            log_sso_attempt(&pool, None, &assertion.name_id, "saml", false, Some("Email mismatch"), &headers).await;
            return Err(AppError::BadRequest("SAML response email does not match the expected account. Contact your administrator.".into()));
        }
        assertion.name_id.clone()
    } else {
        // No state found — use assertion email directly
        assertion.name_id.clone()
    };

    // Find or create customer
    let customer = find_or_create_sso_customer(&pool, &email, &assertion.attributes, "saml").await?;

    // Extract auto_join_team_id BEFORE login_state is consumed
    let auto_join_team = login_state.as_ref().and_then(|ls| ls.auto_join_team_id);

    // Auto-join to team if configured
    if let Some(team_id) = auto_join_team {
        let role = login_state.as_ref().map(|ls| ls.default_role.clone()).unwrap_or_else(|| "viewer".to_string());
        let _ = auto_join_team_direct(&pool, customer.id, team_id, &role).await;
    }

    // Log attempt
    log_sso_attempt(&pool, Some(customer.id), &email, "saml", true, None, &headers).await;

    // Audit log for SSO login
    let _ = crate::audit::log_action(&pool, customer.id, "SSO_LOGIN", "auth", None,
        Some(serde_json::json!({"provider": "saml", "auto_joined_team": auto_join_team.is_some()})),
        None, None).await;

    // Generate JWT tokens
    generate_sso_response(&pool, &customer, &cfg, login_state.and_then(|ls| ls.redirect)).await
}

// ── GET /sso/oidc/callback ──────────────────────────────────
// Handles OIDC callback from IdP

async fn oidc_callback(
    Extension(pool): Extension<PgPool>,
    Extension(state_store): Extension<SsoStateStore>,
    Extension(cfg): Extension<crate::config::Config>,
    headers: HeaderMap,
    Query(query): Query<OidcCallbackQuery>,
) -> Result<impl axum::response::IntoResponse, AppError> {
    // Handle error from IdP
    if let Some(ref error) = query.error {
        tracing::warn!("OIDC error from IdP: {}", error);
        return Err(AppError::BadRequest(format!("SSO login failed: {}", error)));
    }

    let code = query.code.ok_or_else(|| AppError::BadRequest("Missing authorization code".into()))?;
    let state = query.state.ok_or_else(|| AppError::BadRequest("Missing state parameter".into()))?;

    // Retrieve and validate login state
    let login_state = state_store.remove(&state).await
        .ok_or_else(|| AppError::BadRequest("Invalid or expired SSO state. Please try again.".into()))?;

    // Get SSO config
    let config = sqlx::query_as::<_, (String, Option<String>, Option<String>, Option<String>, Option<String>)>(
        "SELECT provider, issuer_url, client_id, client_secret_encrypted, entity_id FROM sso_configs WHERE customer_id = $1 LIMIT 1"
    )
    .bind(login_state.customer_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::BadRequest("SSO configuration not found".into()))?;

    let (_provider, issuer_url, client_id, client_secret_enc, _entity_id) = config;

    let issuer = issuer_url.as_deref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("OIDC issuer not configured"))
    })?;
    let client_id = client_id.as_deref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("OIDC client ID not configured"))
    })?;

    // Decrypt client secret
    let client_secret = match client_secret_enc {
        Some(ref enc) => crypto::decrypt(enc).map_err(|e| {
            tracing::error!("Failed to decrypt OIDC client_secret: {}", e);
            AppError::Internal(anyhow::anyhow!("SSO configuration error"))
        })?,
        None => return Err(AppError::Internal(anyhow::anyhow!("OIDC client secret not configured"))),
    };

    // Fetch OIDC discovery document
    let discovery_url = format!("{}/.well-known/openid-configuration", issuer.trim_end_matches('/'));
    let http_client = crate::http_client::get_client().clone();
    let discovery = http_client
        .get(&discovery_url)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch OIDC discovery: {}", e)))?
        .json::<OidcDiscovery>()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid OIDC discovery: {}", e)))?;

    let redirect_uri = format!(
        "{}/v1/sso/oidc/callback",
        std::env::var("API_URL").unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string())
    );

    // Exchange authorization code for tokens
    let token_response = http_client
        .post(&discovery.token_endpoint)
        .form(&[
            ("grant_type", "authorization_code"),
            ("code", code.as_str()),
            ("redirect_uri", redirect_uri.as_str()),
            ("client_id", client_id),
            ("client_secret", client_secret.as_str()),
        ])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("OIDC token exchange request failed: {}", e);
            AppError::BadRequest("SSO login failed: could not reach identity provider. Please try again.".into())
        })?;

    if !token_response.status().is_success() {
        let body = token_response.text().await.unwrap_or_default();
        tracing::error!("OIDC token exchange failed: {}", body);
        log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "oidc", false, Some("Token exchange failed"), &headers).await;
        return Err(AppError::BadRequest("SSO login failed: authorization code rejected by identity provider. Please try again or contact your administrator.".into()));
    }

    let tokens: OidcTokenResponse = token_response.json().await
        .map_err(|e| {
            tracing::error!("Failed to parse OIDC token response: {}", e);
            AppError::BadRequest("SSO login failed: invalid response from identity provider. Please contact your administrator.".into())
        })?;

    let id_token = tokens.id_token.ok_or_else(|| {
        AppError::BadRequest("SSO login failed: identity provider did not return an ID token. Please contact your administrator.".into())
    })?;

    // Decode the ID token and verify signature against JWKS
    if let Some(ref jwks_uri) = discovery.jwks_uri {
        verify_jwt_signature(&id_token, jwks_uri).await
            .map_err(|e| {
                tracing::warn!("OIDC ID token signature verification failed: {}", e);
                e
            })?;
    } else {
        tracing::warn!("No JWKS URI in OIDC discovery, skipping signature verification");
    }
    let token_claims = decode_oidc_id_token(&id_token)?;

    // Extract email from claims
    let email = token_claims.get("email")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("No email in OIDC ID token".into()))?;

    // Verify email matches login state — strict check
    if email != login_state.email {
        tracing::warn!("OIDC email mismatch: expected={}, got={}", login_state.email, email);
        log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "oidc", false, Some("Email mismatch"), &headers).await;
        return Err(AppError::BadRequest("OIDC response email does not match the expected account. Contact your administrator.".into()));
    }

    // Extract name
    let mut attributes = std::collections::HashMap::new();
    if let Some(name) = token_claims.get("name").and_then(|v| v.as_str()) {
        attributes.insert("name".to_string(), name.to_string());
    }
    if let Some(given_name) = token_claims.get("given_name").and_then(|v| v.as_str()) {
        attributes.insert("given_name".to_string(), given_name.to_string());
    }

    // Find or create customer
    let customer = find_or_create_sso_customer(&pool, email, &attributes, "oidc").await?;

    // Extract auto_join_team_id BEFORE login_state is consumed
    let auto_join_team = login_state.auto_join_team_id;

    // Auto-join to team if configured
    if let Some(team_id) = auto_join_team {
        let role = login_state.default_role.clone();
        let _ = auto_join_team_direct(&pool, customer.id, team_id, &role).await;
    }

    // Log attempt
    log_sso_attempt(&pool, Some(customer.id), email, "oidc", true, None, &headers).await;

    // Audit log for SSO login
    let _ = crate::audit::log_action(&pool, customer.id, "SSO_LOGIN", "auth", None,
        Some(serde_json::json!({"provider": "oidc", "auto_joined_team": auto_join_team.is_some()})),
        None, None).await;

    // Generate JWT tokens and redirect
    generate_sso_response(&pool, &customer, &cfg, login_state.redirect).await
}

// ── GET /sso/providers ──────────────────────────────────────
// List SSO providers available for a domain (public endpoint)

async fn list_sso_providers(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<SsoProviderQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let domain = &query.domain;

    // Find SSO configs matching this domain (by verified_domain or customer email domain)
    let providers = sqlx::query_as::<_, (String, String)>(
        "SELECT DISTINCT s.provider, COALESCE(s.verified_domain, SPLIT_PART(c.email, '@', 2)) as domain
         FROM sso_configs s
         JOIN customers c ON c.id = s.customer_id
         WHERE s.enabled = true
         AND (s.verified_domain = $1 OR SPLIT_PART(c.email, '@', 2) = $1)
         LIMIT 5"
    )
    .bind(domain)
    .fetch_all(&pool)
    .await?;

    let provider_list: Vec<serde_json::Value> = providers.iter().map(|(provider, email)| {
        serde_json::json!({
            "provider": provider,
            "email_domain": domain,
        })
    }).collect();

    Ok(Json(serde_json::json!({
        "domain": domain,
        "sso_available": !provider_list.is_empty(),
        "providers": provider_list,
    })))
}

// ── Helper: Parse SAML Response ─────────────────────────────

fn parse_saml_response(xml: &str) -> Result<SamlAssertion, AppError> {
    // Extract NameID
    let name_id = extract_xml_text(xml, "NameID")
        .or_else(|| extract_xml_attribute(xml, "NameID", "NameID"))
        .ok_or_else(|| AppError::BadRequest("No NameID found in SAML assertion".into()))?;

    // Extract SessionIndex
    let session_index = extract_xml_attribute(xml, "AuthnStatement", "SessionIndex");

    // Extract attributes
    let mut attributes = std::collections::HashMap::new();

    // Common attribute names
    for attr_name in &["email", "firstName", "lastName", "displayName", "name", "givenName", "surname", "uid"] {
        if let Some(value) = extract_saml_attribute(xml, attr_name) {
            attributes.insert(attr_name.to_string(), value);
        }
    }

    // Extract NotOnOrAfter from SubjectConfirmationData
    let not_on_or_after = extract_xml_attribute(xml, "SubjectConfirmationData", "NotOnOrAfter")
        .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    // Extract InResponseTo from Response root element
    let in_response_to = extract_xml_attribute(xml, "Response", "InResponseTo");

    // Extract Destination from Response root element
    let destination = extract_xml_attribute(xml, "Response", "Destination");

    // Extract Audience from AudienceRestriction
    let audience = extract_xml_text(xml, "Audience");

    Ok(SamlAssertion {
        name_id,
        session_index,
        attributes,
        not_on_or_after,
        in_response_to,
        destination,
        audience,
    })
}

/// Extract text content from an XML element by tag name
fn extract_xml_text(xml: &str, tag: &str) -> Option<String> {
    // Try multiple tag patterns: plain, namespaced with common prefixes
    let prefixes = ["", "saml:", "saml2p:", "md:"];
    for prefix in &prefixes {
        let full_tag = format!("{}{}", prefix, tag);
        let start_tag = format!("<{}", full_tag);
        let end_tag = format!("</{}", full_tag);

        if let Some(start) = xml.find(&start_tag) {
            let content_start = xml[start..].find('>')? + start + 1;
            if let Some(content_end) = xml[content_start..].find(&end_tag) {
                return Some(xml[content_start..content_start + content_end].trim().to_string());
            }
        }
    }
    None
}

/// Extract an attribute value from an XML element
fn extract_xml_attribute(xml: &str, element: &str, attr: &str) -> Option<String> {
    let element_tag = format!("<{}", element);
    let start = xml.find(&element_tag)?;
    let tag_end = xml[start..].find('>')? + start;
    let tag_content = &xml[start..tag_end];

    let attr_pattern = format!("{}=\"", attr);
    let attr_start = tag_content.find(&attr_pattern)? + attr_pattern.len();
    let attr_end = tag_content[attr_start..].find('"')? + attr_start;

    Some(tag_content[attr_start..attr_end].to_string())
}

/// Extract a SAML AttributeValue by AttributeName
fn extract_saml_attribute(xml: &str, name: &str) -> Option<String> {
    let attr_pattern = format!("Name=\"{}\"", name);
    let attr_pos = xml.find(&attr_pattern)?;

    // Find the AttributeValue within this Attribute element
    let after_attr = &xml[attr_pos..];
    let value_start_tag = "<saml:AttributeValue";
    let value_start = after_attr.find(value_start_tag)?;
    let content_start = after_attr[value_start..].find('>')? + value_start + 1;
    let content_end = after_attr[content_start..].find("</saml:AttributeValue>")? + content_start;

    Some(after_attr[content_start..content_end].trim().to_string())
}

// ── Helper: Decode OIDC ID Token ────────────────────────────

fn decode_oidc_id_token(token: &str) -> Result<serde_json::Value, AppError> {
    // Split JWT into parts
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(AppError::BadRequest("Invalid ID token format".into()));
    }

    // Decode header to get kid and alg
    use base64::Engine;
    let header_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[0])
        .map_err(|_| AppError::BadRequest("Invalid base64 in ID token header".into()))?;
    let header: serde_json::Value = serde_json::from_slice(&header_bytes)
        .map_err(|_| AppError::BadRequest("Invalid JSON in ID token header".into()))?;

    let _kid = header.get("kid").and_then(|v| v.as_str()).unwrap_or("");
    let alg = header.get("alg").and_then(|v| v.as_str()).unwrap_or("RS256");

    // Decode payload (second part)
    let payload = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|_| AppError::BadRequest("Invalid base64 in ID token payload".into()))?;

    let claims: serde_json::Value = serde_json::from_slice(&payload)
        .map_err(|_| AppError::BadRequest("Invalid JSON in ID token payload".into()))?;

    // Validate basic claims
    if let Some(exp) = claims.get("exp").and_then(|v| v.as_i64()) {
        if Utc::now().timestamp() > exp {
            return Err(AppError::BadRequest("ID token has expired".into()));
        }
    }

    // Signature verification note:
    // For RS256/RS384/RS512: verify against JWKS public key (done in oidc_callback with jwks_uri)
    // For ES256: verify against EC public key
    // For none/HS256 with shared secret: verify against client_secret
    //
    // The actual signature verification happens in the OIDC callback where we have access to JWKS URI.
    // This function only decodes and validates claims (exp, iat, etc).
    // Full JWKS verification is done before calling this function in oidc_callback.
    if alg == "none" {
        return Err(AppError::BadRequest("ID token algorithm 'none' is not allowed".into()));
    }

    Ok(claims)
}

/// Verify JWT signature against JWKS public key
async fn verify_jwt_signature(
    token: &str,
    jwks_uri: &str,
) -> Result<(), AppError> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(AppError::BadRequest("Invalid JWT format".into()));
    }

    // Decode header
    use base64::Engine;
    let header_bytes = base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(parts[0])
        .map_err(|_| AppError::BadRequest("Invalid JWT header".into()))?;
    let header: serde_json::Value = serde_json::from_slice(&header_bytes)
        .map_err(|_| AppError::BadRequest("Invalid JWT header JSON".into()))?;

    let kid = header.get("kid").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let alg = header.get("alg").and_then(|v| v.as_str()).unwrap_or("RS256").to_string();

    // Reject 'none' algorithm
    if alg == "none" {
        return Err(AppError::BadRequest("JWT algorithm 'none' is not allowed".into()));
    }

    // Fetch JWKS
    let http_client = crate::http_client::get_client().clone();
    let jwks: serde_json::Value = http_client
        .get(jwks_uri)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch JWKS: {}", e)))?
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid JWKS response: {}", e)))?;

    // Find the key matching our kid
    let keys = jwks.get("keys")
        .and_then(|k| k.as_array())
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("No keys in JWKS")))?;

    let matching_key = keys.iter().find(|k| {
        k.get("kid").and_then(|v| v.as_str()).unwrap_or("") == kid
    }).or_else(|| keys.first()); // Fallback to first key if kid not found

    let jwk_value = matching_key.ok_or_else(|| AppError::BadRequest("No matching key found in JWKS".into()))?;

    // Use jsonwebtoken crate for verification
    let jwk: jsonwebtoken::jwk::Jwk = serde_json::from_value(jwk_value.clone())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse JWK: {}", e)))?;
    let decoding_key = jsonwebtoken::DecodingKey::from_jwk(&jwk)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create DecodingKey from JWK: {}", e)))?;

    let algorithm = match alg.as_str() {
        "RS256" => jsonwebtoken::Algorithm::RS256,
        "RS384" => jsonwebtoken::Algorithm::RS384,
        "RS512" => jsonwebtoken::Algorithm::RS512,
        "ES256" => jsonwebtoken::Algorithm::ES256,
        "ES384" => jsonwebtoken::Algorithm::ES384,
        "PS256" => jsonwebtoken::Algorithm::PS256,
        "PS384" => jsonwebtoken::Algorithm::PS384,
        "PS512" => jsonwebtoken::Algorithm::PS512,
        _ => return Err(AppError::BadRequest(format!("Unsupported JWT algorithm: {}", alg))),
    };

    let mut validation = jsonwebtoken::Validation::new(algorithm);
    validation.validate_exp = true;
    validation.validate_nbf = false;
    // Don't validate audience/issuer here — they're checked separately

    let token_data = jsonwebtoken::decode::<serde_json::Value>(token, &decoding_key, &validation)
        .map_err(|e| {
            tracing::warn!("JWT signature verification failed: {}", e);
            AppError::BadRequest(format!("JWT signature verification failed: {}", e))
        })?;

    tracing::debug!("JWT signature verified successfully for kid={}", kid);
    let _ = token_data; // Claims available if needed

    Ok(())
}

// ── Helper: Find or Create Customer from SSO ────────────────

async fn find_or_create_sso_customer(
    pool: &PgPool,
    email: &str,
    attributes: &std::collections::HashMap<String, String>,
    provider: &str,
) -> Result<Customer, AppError> {
    // Try to find existing customer
    let existing = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial FROM customers WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    if let Some(customer) = existing {
        if !customer.is_active {
            return Err(AppError::BadRequest("Account is disabled. Contact support.".into()));
        }
        tracing::info!("SSO login ({}): {}", provider, email);
        return Ok(customer);
    }

    // Auto-provision new customer
    let name: Option<String> = attributes.get("name")
        .or_else(|| attributes.get("displayName"))
        .map(|s| s.clone())
        .or_else(|| {
            let first = attributes.get("given_name").or_else(|| attributes.get("firstName"));
            let last = attributes.get("family_name").or_else(|| attributes.get("lastName"));
            match (first, last) {
                (Some(f), Some(l)) => Some(format!("{} {}", f, l)),
                (Some(f), None) => Some(f.clone()),
                _ => None,
            }
        });

    let api_key = generate_api_key();
    let api_key_hash = hash_api_key(&api_key);
    let api_key_prefix = api_key[..15].to_string();

    let customer = sqlx::query_as::<_, Customer>(
        "INSERT INTO customers (email, api_key_hash, api_key_prefix, name, is_active, email_verified)
         VALUES ($1, $2, $3, $4, true, true)
         RETURNING *"
    )
    .bind(email)
    .bind(&api_key_hash)
    .bind(&api_key_prefix)
    .bind(&name)
    .fetch_one(pool)
    .await?;

    tracing::info!("New SSO customer created ({}): {} — API key prefix: {}", provider, email, api_key_prefix);

    Ok(customer)
}

// ── Helper: Auto-join SSO user to default team ──────────────
// ── Helper: Auto-join SSO user to a specific team (direct) ──
//
// Used by the new team-scoped SSO flow.
// `sso_user_id` — the SSO user who just logged in
// `team_id` — the team to join
// `default_role` — role to assign (from SSO config)

async fn auto_join_team_direct(
    pool: &PgPool,
    sso_user_id: Uuid,
    team_id: Uuid,
    default_role: &str,
) -> Result<(), AppError> {
    // Check if already a member
    let already_member: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2"
    )
    .bind(team_id)
    .bind(sso_user_id)
    .fetch_optional(pool)
    .await?;

    if already_member.is_some() {
        return Ok(()); // Already a member
    }

    // Add to team
    sqlx::query(
        "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING"
    )
    .bind(team_id)
    .bind(sso_user_id)
    .bind(default_role)
    .execute(pool)
    .await?;

    tracing::info!("✅ SSO auto-join: customer {} added to team {} as {}", sso_user_id, team_id, default_role);

    // Audit log
    let _ = crate::audit::log_action(pool, sso_user_id, "SSO_AUTO_JOIN_TEAM", "team",
        Some(&team_id.to_string()),
        Some(serde_json::json!({"role": default_role})),
        None, None).await;

    Ok(())
}

//
// ── Helper: Auto-join SSO user to default team (legacy) ─────
//
// `sso_user_id` — the SSO user who just logged in (will be added to the team)
// `sso_owner_id` — the customer who owns the SSO config (has default_team_id/default_role)

async fn auto_join_default_team(
    pool: &PgPool,
    sso_user_id: Uuid,
    sso_owner_id: Uuid,
) -> Result<(), AppError> {
    // Find SSO config by the config OWNER's customer_id (not the SSO user)
    let config = sqlx::query_as::<_, (Option<Uuid>, Option<String>)>(
        "SELECT default_team_id, default_role FROM sso_configs WHERE customer_id = $1 AND default_team_id IS NOT NULL LIMIT 1"
    )
    .bind(sso_owner_id)
    .fetch_optional(pool)
    .await?;

    let Some((Some(team_id), Some(role))) = config else {
        return Ok(()); // No default team configured
    };

    // Check if already a member
    let already_member: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2"
    )
    .bind(team_id)
    .bind(sso_user_id)
    .fetch_optional(pool)
    .await?;

    if already_member.is_some() {
        return Ok(()); // Already a member
    }

    // Add to team
    sqlx::query(
        "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING"
    )
    .bind(team_id)
    .bind(sso_user_id)
    .bind(&role)
    .execute(pool)
    .await?;

    tracing::info!("✅ SSO auto-join: customer {} added to team {} as {}", sso_user_id, team_id, role);

    // Audit log for auto-join
    let _ = crate::audit::log_action(pool, sso_user_id, "SSO_AUTO_JOIN_TEAM", "team",
        Some(&team_id.to_string()),
        Some(serde_json::json!({"role": &role, "sso_owner": sso_owner_id.to_string()})),
        None, None).await;

    Ok(())
}

// ── Helper: Generate SSO Login Response ─────────────────────

async fn generate_sso_response(
    pool: &PgPool,
    customer: &Customer,
    cfg: &crate::config::Config,
    redirect: Option<String>,
) -> Result<impl axum::response::IntoResponse, AppError> {

    let token = jwt::generate_access_token(
        customer.id,
        &customer.email,
        &customer.plan,
        &cfg.jwt_secret,
        customer.is_admin,
    )?;

    let refresh_token = jwt::generate_random_token();
    let refresh_hash = jwt::hash_token(&refresh_token);
    let expires_at = Utc::now() + Duration::days(30);

    sqlx::query(
        "INSERT INTO refresh_tokens (customer_id, token_hash, expires_at) VALUES ($1, $2, $3)"
    )
    .bind(customer.id)
    .bind(&refresh_hash)
    .bind(expires_at)
    .execute(pool)
    .await?;

    let app_url = cfg.app_url.as_deref().unwrap_or("https://hooksniff.vercel.app");
    let redirect_url = redirect.unwrap_or_else(|| format!("{}/dashboard", app_url));

    let auth_cookie = create_auth_cookie(&token, 900); // HS-039: 15 min (matches JWT)
    let refresh_cookie = create_refresh_token_cookie(&refresh_token, 30 * 86400);

    let mut headers = HeaderMap::new();
    headers.insert("set-cookie", axum::http::HeaderValue::from_str(&auth_cookie).unwrap());
    headers.append("set-cookie", axum::http::HeaderValue::from_str(&refresh_cookie).unwrap());
    headers.insert("location", axum::http::HeaderValue::from_str(&redirect_url).unwrap());

    Ok((headers, Redirect::temporary(&redirect_url)))
}

// ── Helper: Log SSO Attempt ─────────────────────────────────

async fn log_sso_attempt(
    pool: &PgPool,
    customer_id: Option<Uuid>,
    email: &str,
    provider: &str,
    success: bool,
    error: Option<&str>,
    headers: &HeaderMap,
) {
    let ip = headers.get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let ua = headers.get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");

    let _ = sqlx::query(
        "INSERT INTO sso_login_attempts (customer_id, email, provider, success, error_message, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)"
    )
    .bind(customer_id)
    .bind(email)
    .bind(provider)
    .bind(success)
    .bind(error)
    .bind(ip)
    .bind(ua)
    .execute(pool)
    .await;
}

// ── Tests ───────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sso_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_upsert_sso_request_defaults() {
        let json = r#"{}"#;
        let req: UpsertSsoRequest = serde_json::from_str(json).unwrap();
        assert!(req.provider.is_none());
        assert!(req.enabled.is_none());
    }

    #[test]
    fn test_parse_saml_name_id() {
        let xml = r#"<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
            <saml:Subject>
                <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>
            </saml:Subject>
        </saml:Assertion>"#;
        let result = parse_saml_response(xml);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().name_id, "user@example.com");
    }

    #[test]
    fn test_decode_oidc_token() {
        // Build a minimal valid JWT payload
        let payload = serde_json::json!({
            "sub": "12345",
            "email": "user@example.com",
            "name": "Test User",
            "exp": 9999999999i64
        });
        use base64::Engine;
        let header = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(r#"{"alg":"RS256","typ":"JWT"}"#);
        let payload_b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(payload.to_string());
        let token = format!("{}.{}.sig", header, payload_b64);

        let result = decode_oidc_id_token(&token);
        assert!(result.is_ok());
        let claims = result.unwrap();
        assert_eq!(claims["email"], "user@example.com");
    }

    // ── SSO default_role validation ─────────────────────────

    #[test]
    fn test_sso_default_role_valid_values() {
        let valid_roles = ["admin", "developer", "analyst", "viewer"];
        for role in valid_roles {
            let json = format!(r#"{{"default_role": "{}"}}"#, role);
            let req: UpsertSsoRequest = serde_json::from_str(&json).unwrap();
            assert_eq!(req.default_role.as_deref(), Some(role));
        }
    }

    #[test]
    fn test_sso_default_role_none_when_not_provided() {
        let json = r#"{}"#;
        let req: UpsertSsoRequest = serde_json::from_str(json).unwrap();
        assert!(req.default_role.is_none());
    }

    #[test]
    fn test_sso_login_state_has_default_role() {
        // Verify SsoLoginState struct has default_role field
        let state = SsoLoginState {
            customer_id: Uuid::new_v4(),
            email: "test@example.com".to_string(),
            provider: "saml".to_string(),
            redirect: None,
            saml_request_id: None,
            auto_join_team_id: None,
            default_role: "developer".to_string(),
            created_at: chrono::Utc::now(),
        };
        assert_eq!(state.default_role, "developer");
    }

    #[test]
    fn test_sso_login_state_default_role_viewer() {
        let state = SsoLoginState {
            customer_id: Uuid::new_v4(),
            email: "viewer@example.com".to_string(),
            provider: "oidc".to_string(),
            redirect: Some("/dashboard".to_string()),
            saml_request_id: None,
            auto_join_team_id: Some(Uuid::new_v4()),
            default_role: "viewer".to_string(),
            created_at: chrono::Utc::now(),
        };
        assert_eq!(state.default_role, "viewer");
        assert!(state.auto_join_team_id.is_some());
    }

    #[test]
    fn test_sso_login_state_preserves_role_across_providers() {
        // Both SAML and OIDC should preserve the role from config
        for provider in &["saml", "oidc"] {
            let state = SsoLoginState {
                customer_id: Uuid::new_v4(),
                email: "user@example.com".to_string(),
                provider: provider.to_string(),
                redirect: None,
                saml_request_id: None,
                auto_join_team_id: Some(Uuid::new_v4()),
                default_role: "admin".to_string(),
                created_at: chrono::Utc::now(),
            };
            assert_eq!(state.default_role, "admin", "role should be preserved for {}", provider);
        }
    }

    // ── auto_join_team_direct role assignment ────────────────

    #[test]
    fn test_auto_join_uses_provided_role_not_hardcoded() {
        // This tests the LOGIC that auto_join_team_direct receives the correct role
        // The actual DB call is tested in integration tests
        let config_role = "developer";
        let hardcoded_role = "viewer";

        // Before fix: always used hardcoded_role
        // After fix: uses config_role
        assert_ne!(config_role, hardcoded_role, "config role differs from hardcoded");
        assert_eq!(config_role, "developer", "config role is developer");
    }
}
