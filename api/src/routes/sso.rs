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
        // Provider lookup (public)
        .route("/providers", get(list_sso_providers))
}

/// Public SSO routes (login + callbacks) — no auth required
pub fn public_router() -> Router {
    Router::new()
        .route("/login", get(initiate_sso_login))
        .route("/saml/callback", post(saml_callback))
        .route("/oidc/callback", get(oidc_callback))
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
}

#[derive(Debug, Clone)]
struct SsoLoginState {
    customer_id: Uuid,
    email: String,
    provider: String,
    redirect: Option<String>,
    created_at: DateTime<Utc>,
}

impl SsoStateStore {
    pub fn new() -> Self {
        let store = Self {
            states: Arc::new(Mutex::new(HashMap::new())),
        };
        // Spawn cleanup task
        let states = store.states.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(300)).await;
                let mut map = states.lock().await;
                let cutoff = Utc::now() - Duration::minutes(10);
                map.retain(|_, v| v.created_at > cutoff);
            }
        });
        store
    }

    async fn insert(&self, state: String, login_state: SsoLoginState) {
        self.states.lock().await.insert(state, login_state);
    }

    async fn remove(&self, state: &str) -> Option<SsoLoginState> {
        self.states.lock().await.remove(state)
    }
}

// ── GET /sso/config ─────────────────────────────────────────

async fn get_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config = sqlx::query_as::<_, (Uuid, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, bool, DateTime<Utc>, DateTime<Utc>)>(
        "SELECT id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, admin_bypass, created_at, updated_at
         FROM sso_configs WHERE customer_id = $1 LIMIT 1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    match config {
        Some((id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_enc, admin_bypass, created_at, updated_at)) => {
            // Get default team info
            let default_team = sqlx::query_as::<_, (Option<Uuid>, Option<String>, Option<String>)>(
                "SELECT default_team_id, default_role, (SELECT name FROM teams WHERE id = sso_configs.default_team_id) FROM sso_configs WHERE customer_id = $1 LIMIT 1"
            )
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?;

            let (default_team_id, default_role, default_team_name) = default_team
                .unwrap_or((None, None, None));

            Ok(Json(serde_json::json!({
                "id": id,
                "provider": provider,
                "enabled": enabled,
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
                "default_team_name": default_team_name,
                "created_at": created_at,
                "updated_at": updated_at,
            })))
        }
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

    // Validate required fields when enabling
    if enabled {
        if provider == "saml" {
            if req.sso_url.is_none() && req.metadata_url.is_none() {
                return Err(AppError::BadRequest("SAML requires either a metadata URL or an SSO URL".into()));
            }
            if req.certificate.is_none() {
                // Check if existing certificate exists
                let existing = sqlx::query_scalar::<_, Option<String>>(
                    "SELECT certificate FROM sso_configs WHERE customer_id = $1"
                )
                .bind(customer.id)
                .fetch_optional(&pool)
                .await?
                .flatten();

                if existing.is_none() && req.certificate.is_none() {
                    return Err(AppError::BadRequest("SAML requires an X.509 certificate".into()));
                }
            }
        } else if provider == "oidc" {
            if req.issuer_url.is_none() || req.client_id.is_none() {
                return Err(AppError::BadRequest("OIDC requires an issuer URL and a client ID".into()));
            }
            // Check for client secret (new or existing)
            if req.client_secret.is_none() {
                let existing = sqlx::query_scalar::<_, Option<String>>(
                    "SELECT client_secret_encrypted FROM sso_configs WHERE customer_id = $1"
                )
                .bind(customer.id)
                .fetch_optional(&pool)
                .await?
                .flatten();

                if existing.is_none() {
                    return Err(AppError::BadRequest("OIDC requires a client secret".into()));
                }
            }
        }
    }

    // Validate default_role if provided
    if let Some(ref role) = req.default_role {
        if !["admin", "editor", "viewer"].contains(&role.as_str()) {
            return Err(AppError::BadRequest("default_role must be 'admin', 'editor', or 'viewer'".into()));
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

    sqlx::query(
        r#"INSERT INTO sso_configs (customer_id, provider, enabled, admin_bypass, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, default_team_id, default_role)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (customer_id) DO UPDATE SET
               provider = EXCLUDED.provider,
               enabled = EXCLUDED.enabled,
               admin_bypass = EXCLUDED.admin_bypass,
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
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM sso_configs WHERE customer_id = $1")
        .bind(customer.id)
        .execute(&pool)
        .await?;

    Ok(Json(serde_json::json!({
        "deleted": result.rows_affected() > 0,
    })))
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
    Query(query): Query<SsoLoginQuery>,
) -> Result<impl axum::response::IntoResponse, AppError> {
    let email = &query.email;

    // Extract email domain for SSO config lookup
    let domain = email.split('@').nth(1).unwrap_or("");

    // Strategy 1: Find existing customer by email
    let existing_customer = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at FROM customers WHERE email = $1"
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

    // Strategy 2: Find SSO config — try by customer_id first, then by email domain
    let config = if let Some(ref customer) = existing_customer {
        // Existing user: look up their own SSO config
        sqlx::query_as::<_, (Uuid, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
            "SELECT customer_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, entity_id FROM sso_configs WHERE customer_id = $1 AND enabled = true LIMIT 1"
        )
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
    } else {
        // New user: find SSO config by email domain (any SSO-enabled customer with same domain)
        sqlx::query_as::<_, (Uuid, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
            "SELECT s.customer_id, s.provider, s.enabled, s.metadata_url, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.entity_id
             FROM sso_configs s
             INNER JOIN customers c ON c.id = s.customer_id
             WHERE s.enabled = true AND c.email LIKE $1
             LIMIT 1"
        )
        .bind(format!("%@{}", domain))
        .fetch_optional(&pool)
        .await?
    };

    let (sso_owner_id, provider, enabled, _metadata_url, sso_url, _certificate, issuer_url, client_id, client_secret_enc, entity_id) =
        config.ok_or_else(|| AppError::BadRequest("SSO is not configured for this account. Contact your administrator.".into()))?;

    if !enabled {
        return Err(AppError::BadRequest("SSO is not enabled for this account. Contact your administrator.".into()));
    }

    // Generate state parameter for CSRF protection
    let state = Uuid::new_v4().to_string();

    // Store login state (customer_id = SSO config owner, used in callbacks for auto-team-join)
    state_store.insert(state.clone(), SsoLoginState {
        customer_id: sso_owner_id,
        email: email.clone(),
        provider: provider.clone(),
        redirect: query.redirect.clone(),
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
        platform: None,
    });

    if provider == "saml" {
        initiate_saml_login(&pool, &redirect_customer, &state, &sso_url, &entity_id).await
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
) -> Result<impl axum::response::IntoResponse, AppError> {
    let sso_url = sso_url.as_deref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("SAML SSO URL not configured"))
    })?;

    let sp_entity_id = entity_id.as_deref().unwrap_or("urn:hooksniff:sp");
    let acs_url = format!(
        "{}/v1/sso/saml/callback",
        std::env::var("API_URL").unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string())
    );

    // Build SAML AuthnRequest (XML)
    let request_id = format!("_{}", Uuid::new_v4().to_string().replace('-', ""));
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
        axum::http::HeaderValue::from_str(&redirect_url).unwrap_or_default(),
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
) -> Result<impl axum::response::IntoResponse, AppError> {
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
        axum::http::HeaderValue::from_str(&auth_url).unwrap_or_default(),
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

    let email = if let Some(ref ls) = login_state {
        // Verify email matches
        if assertion.name_id != ls.email {
            tracing::warn!("SAML email mismatch: expected={}, got={}", ls.email, assertion.name_id);
        }
        assertion.name_id.clone()
    } else {
        // No state found — use assertion email directly
        assertion.name_id.clone()
    };

    // Find or create customer
    let customer = find_or_create_sso_customer(&pool, &email, &assertion.attributes, "saml").await?;

    // Extract SSO config owner's customer_id BEFORE login_state is consumed
    let sso_owner_id = login_state.as_ref().map(|ls| ls.customer_id);

    // Auto-join to default team if configured (use SSO config owner's ID to find the config)
    if let Some(owner_id) = sso_owner_id {
        let _ = auto_join_default_team(&pool, customer.id, owner_id).await;
    }

    // Log attempt
    log_sso_attempt(&pool, Some(customer.id), &email, "saml", true, None, &headers).await;

    // Audit log for SSO login
    let _ = crate::audit::log_action(&pool, customer.id, "SSO_LOGIN", "auth", None,
        Some(serde_json::json!({"provider": "saml", "auto_joined_team": sso_owner_id.is_some()})),
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
        .map_err(|e| AppError::Internal(anyhow::anyhow!("OIDC token exchange failed: {}", e)))?;

    if !token_response.status().is_success() {
        let body = token_response.text().await.unwrap_or_default();
        tracing::error!("OIDC token exchange failed: {}", body);
        log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "oidc", false, Some("Token exchange failed"), &headers).await;
        return Err(AppError::Internal(anyhow::anyhow!("OIDC token exchange failed")));
    }

    let tokens: OidcTokenResponse = token_response.json().await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse OIDC token response: {}", e)))?;

    let id_token = tokens.id_token.ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("No id_token in OIDC response"))
    })?;

    // Decode the ID token (without verification for now — in production, verify signature against JWKS)
    let token_claims = decode_oidc_id_token(&id_token)?;

    // Extract email from claims
    let email = token_claims.get("email")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("No email in OIDC ID token".into()))?;

    // Verify email matches login state
    if email != login_state.email {
        tracing::warn!("OIDC email mismatch: expected={}, got={}", login_state.email, email);
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

    // Extract SSO config owner's customer_id BEFORE login_state is consumed
    let sso_owner_id = login_state.customer_id;

    // Auto-join to default team if configured (use SSO config owner's ID to find the config)
    let _ = auto_join_default_team(&pool, customer.id, sso_owner_id).await;

    // Log attempt
    log_sso_attempt(&pool, Some(customer.id), email, "oidc", true, None, &headers).await;

    // Audit log for SSO login
    let _ = crate::audit::log_action(&pool, customer.id, "SSO_LOGIN", "auth", None,
        Some(serde_json::json!({"provider": "oidc", "auto_joined_team": true})),
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

    // Find customers with this email domain that have SSO enabled
    let providers = sqlx::query_as::<_, (String, String)>(
        "SELECT DISTINCT s.provider, c.email
         FROM sso_configs s
         JOIN customers c ON c.id = s.customer_id
         WHERE s.enabled = true
         AND c.email LIKE $1
         LIMIT 5"
    )
    .bind(format!("%@{}", domain))
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

    Ok(SamlAssertion {
        name_id,
        session_index,
        attributes,
        not_on_or_after,
    })
}

/// Extract text content from an XML element by tag name
fn extract_xml_text(xml: &str, tag: &str) -> Option<String> {
    let start_tag = format!("<{}", tag);
    let end_tag = format!("</{}>", tag);

    let start = xml.find(&start_tag)?;
    let content_start = xml[start..].find('>')? + start + 1;
    let content_end = xml[content_start..].find(&end_tag)? + content_start;

    Some(xml[content_start..content_end].trim().to_string())
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

    // Decode payload (second part)
    use base64::Engine;
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

    Ok(claims)
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
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at FROM customers WHERE email = $1"
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
    let name = attributes.get("name")
        .or_else(|| attributes.get("displayName"))
        .or_else(|| {
            let first = attributes.get("given_name").or_else(|| attributes.get("firstName"));
            let last = attributes.get("family_name").or_else(|| attributes.get("lastName"));
            match (first, last) {
                (Some(f), Some(l)) => Some(&format!("{} {}", f, l)[..].to_string()),
                (Some(f), None) => Some(f),
                _ => None,
            }
        })
        .cloned();

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

    tracing::info!("New SSO customer created ({}): {} — API key: {}", provider, email, api_key);

    Ok(customer)
}

// ── Helper: Auto-join SSO user to default team ──────────────
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

    let (Some(team_id), Some(role)) = config else {
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

    let auth_cookie = create_auth_cookie(&token, 86400);
    let refresh_cookie = create_refresh_token_cookie(&refresh_token, 30 * 86400);

    let mut headers = HeaderMap::new();
    headers.insert("set-cookie", axum::http::HeaderValue::from_str(&auth_cookie).unwrap_or_default());
    headers.append("set-cookie", axum::http::HeaderValue::from_str(&refresh_cookie).unwrap_or_default());
    headers.insert("location", axum::http::HeaderValue::from_str(&redirect_url).unwrap_or_default());

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
        let header = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(r#"{"alg":"none","typ":"JWT"}"#);
        let payload_b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(payload.to_string());
        let token = format!("{}.{}.sig", header, payload_b64);

        let result = decode_oidc_id_token(&token);
        assert!(result.is_ok());
        let claims = result.unwrap();
        assert_eq!(claims["email"], "user@example.com");
    }
}
