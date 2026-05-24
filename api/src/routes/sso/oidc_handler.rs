use axum::extract::{Extension, Query};
use axum::http::HeaderMap;
use axum::response::Redirect;
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{OidcCallbackQuery, OidcDiscovery, OidcTokenResponse, SsoLoginState, SsoStateStore};
use super::config::{SsoConfigRow, sso_config_to_json};
use super::oidc::{decode_oidc_id_token, verify_jwt_signature};
use super::helpers::{find_or_create_sso_customer, auto_join_team_direct, resolve_role_from_mapping, resolve_team_from_mapping, store_sso_user_attributes, sync_team_memberships, generate_sso_response, log_sso_attempt};

// ── OIDC Login: Redirect to authorization endpoint ──────────

pub async fn initiate_oidc_login(
    _pool: &PgPool,
    customer: &Customer,
    state: &str,
    issuer_url: &Option<String>,
    client_id: &Option<String>,
    client_secret_enc: &Option<String>,
    nonce: Option<&str>,
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
        .map_err(|e| {
            tracing::error!("Failed to fetch OIDC discovery from {}: {}", discovery_url, e);
            AppError::BadRequest(format!(
                "Cannot reach OIDC discovery endpoint ({}). Ensure the issuer URL is correct and the identity provider is running. Error: {}",
                discovery_url, e
            ))
        })?
        .json::<OidcDiscovery>()
        .await
        .map_err(|e| {
            tracing::error!("Invalid OIDC discovery document from {}: {}", discovery_url, e);
            AppError::BadRequest(format!(
                "OIDC discovery document from {} is invalid or unreachable. Verify the issuer URL points to a valid OIDC provider (e.g. Keycloak, Auth0, Google). Error: {}",
                discovery_url, e
            ))
        })?;

    let redirect_uri = format!(
        "{}/v1/sso/oidc/callback",
        std::env::var("API_URL").unwrap_or_else(|_| "https://hooksniff-api-1046140057667.europe-west1.run.app".to_string())
    );

    // Use the nonce from state (generated in initiate_sso_login) for replay protection
    let nonce_value = nonce.unwrap_or("");

    // Build authorization URL
    let auth_url = format!(
        "{}?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile&state={}&nonce={}&access_type=offline",
        discovery.authorization_endpoint,
        urlencoding::encode(client_id),
        urlencoding::encode(&redirect_uri),
        urlencoding::encode(state),
        urlencoding::encode(nonce_value),
    );

    tracing::info!("OIDC login redirect: customer={}, issuer={}", customer.id, issuer);

    let mut headers = HeaderMap::new();
    let header_val = axum::http::HeaderValue::from_str(&auth_url)
        .map_err(|e| AppError::BadRequest(format!("Invalid auth URL: {}", e)))?;
    headers.insert("location", header_val);
    Ok((headers, Redirect::temporary(&auth_url)))
}

// ── GET /sso/oidc/callback ──────────────────────────────────
// Handles OIDC callback from IdP

pub async fn oidc_callback(
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

    let code = query.code.ok_or_else(|| AppError::coded(ErrorCode::OidcMissingCode))?;
    let state = query.state.ok_or_else(|| AppError::coded(ErrorCode::OidcMissingState))?;

    // Retrieve and validate login state
    let login_state = state_store.remove(&state).await
        .ok_or_else(|| AppError::coded(ErrorCode::SsoStateExpired))?;

    // Get SSO config — use sso_config_id for team-scoped SSO
    let config = sqlx::query_as::<_, (String, Option<String>, Option<String>, Option<String>, Option<String>)>(
        "SELECT provider, issuer_url, client_id, client_secret_encrypted, entity_id FROM sso_configs WHERE id = $1 LIMIT 1"
    )
    .bind(login_state.sso_config_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::coded(ErrorCode::SsoConfigNotFound))?;

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
        .map_err(|e| {
            tracing::error!("Failed to fetch OIDC discovery from {}: {}", discovery_url, e);
            AppError::BadRequest(format!(
                "Cannot reach OIDC discovery endpoint ({}). Ensure the issuer URL is correct and the identity provider is running. Error: {}",
                discovery_url, e
            ))
        })?
        .json::<OidcDiscovery>()
        .await
        .map_err(|e| {
            tracing::error!("Invalid OIDC discovery document from {}: {}", discovery_url, e);
            AppError::BadRequest(format!(
                "OIDC discovery document from {} is invalid or unreachable. Verify the issuer URL points to a valid OIDC provider. Error: {}",
                discovery_url, e
            ))
        })?;

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

    // Verify nonce — prevents replay attacks
    if let Some(ref expected_nonce) = login_state.nonce {
        let token_nonce = token_claims.get("nonce").and_then(|v| v.as_str());
        match token_nonce {
            Some(actual) if actual == expected_nonce => {
                tracing::debug!("OIDC nonce verified successfully");
            }
            Some(actual) => {
                tracing::warn!("OIDC nonce mismatch: expected={}, got={}", expected_nonce, actual);
                log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "oidc", false, Some("Nonce mismatch — possible replay attack"), &headers).await;
                return Err(AppError::BadRequest("SSO login failed: security token mismatch. Please try again.".into()));
            }
            None => {
                tracing::warn!("OIDC ID token missing nonce claim");
                // Some IdPs don't include nonce — log but don't block
                // Blocking would break compatibility with IdPs that strip nonces
            }
        }
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
    let email_domain = email.split('@').nth(1).unwrap_or("");
    let verified_domain: Option<String> = sqlx::query_scalar(
        "SELECT verified_domain FROM sso_configs WHERE customer_id = $1 AND verified_domain IS NOT NULL LIMIT 1"
    )
    .bind(login_state.customer_id)
    .fetch_optional(&pool)
    .await?
    .flatten();
    let domain_verified = verified_domain.as_deref() == Some(email_domain);
    let customer = find_or_create_sso_customer(&pool, email, &attributes, "oidc", domain_verified).await?;

    // Extract IdP attributes for role/team mapping
    let idp_groups: Vec<String> = attributes.get("groups")
        .or_else(|| attributes.get("memberOf"))
        .map(|s| s.split(',').map(|g| g.trim().to_string()).collect())
        .unwrap_or_default();
    let idp_roles: Vec<String> = attributes.get("role")
        .or_else(|| attributes.get("roles"))
        .map(|s| s.split(',').map(|r| r.trim().to_string()).collect())
        .unwrap_or_default();

    // Resolve role using role_mapping
    let resolved_role = resolve_role_from_mapping(
        &login_state.role_mapping,
        &idp_groups,
        &idp_roles,
        &login_state.default_role,
    );

    // Resolve team using team_mapping
    let resolved_team = resolve_team_from_mapping(
        &login_state.team_mapping,
        email,
        &login_state.auto_join_team_id,
    );

    // Store SSO user attributes
    let _ = store_sso_user_attributes(
        &pool,
        customer.id,
        login_state.sso_config_id,
        attributes.get("sub").or(attributes.get("uid")).map(|s| s.as_str()),
        &idp_groups,
        &idp_roles,
        &attributes,
    ).await;

    // Sync team memberships based on IdP groups
    let _ = sync_team_memberships(
        &pool,
        customer.id,
        &idp_groups,
        &login_state.team_mapping,
        &resolved_role,
    ).await;

    // Auto-join to team if configured
    if let Some(team_id) = resolved_team {
        let _ = auto_join_team_direct(&pool, customer.id, team_id, &resolved_role).await;
    }

    // Log attempt
    log_sso_attempt(&pool, Some(customer.id), email, "oidc", true, None, &headers).await;

    // Audit log for SSO login
    let _ = crate::audit::log_action(&pool, customer.id, "SSO_LOGIN", "auth", None,
        Some(serde_json::json!({"provider": "oidc", "auto_joined_team": resolved_team.is_some(), "role": resolved_role})),
        None, None).await;

    // Generate JWT tokens and redirect
    generate_sso_response(&pool, &customer, &cfg, login_state.redirect).await
}

