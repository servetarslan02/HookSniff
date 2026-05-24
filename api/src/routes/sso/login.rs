//! SSO Login Flow & Callback Handlers
//!
//! Handles SSO login initiation, SAML/OIDC callbacks, and provider listing.

use axum::{
    extract::{Extension, Query},
    http::HeaderMap,
    response::Redirect,
    Json,
};
use chrono::{DateTime, Duration, Utc};
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::auth::jwt;
use crate::crypto;
use crate::error::{AppError, ErrorCode};
use crate::middleware::{create_auth_cookie, create_refresh_token_cookie, generate_api_key, hash_api_key};
use crate::models::customer::Customer;

use super::{OidcCallbackQuery, OidcDiscovery, OidcTokenResponse, SsoLoginQuery, SsoLoginState, SsoProviderQuery, SsoStateStore};
use super::saml::{parse_saml_response, xml_has_element, verify_saml_signature};
use super::oidc::{decode_oidc_id_token, verify_jwt_signature};
use super::helpers::{find_or_create_sso_customer, auto_join_team_direct, resolve_role_from_mapping, resolve_team_from_mapping, store_sso_user_attributes, sync_team_memberships, generate_sso_response, log_sso_attempt};


// ── GET /sso/login ──────────────────────────────────────────
// Initiates SSO login by redirecting to IdP.
// Works for BOTH existing users and new (auto-provisioned) users.

pub async fn initiate_sso_login(
    Extension(pool): Extension<PgPool>,
    Extension(state_store): Extension<SsoStateStore>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: HeaderMap,
    Query(query): Query<SsoLoginQuery>,
) -> Result<impl axum::response::IntoResponse, AppError> {
    let email = &query.email;

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

    // Rate limit: 10 SSO login attempts per email+IP per minute
    // Using email+IP combo prevents one user from blocking others on same IP
    let rl_key = format!("sso_login:{}:{}", email, client_ip);
    let rl_result = rate_limiter.check_with_headers(&rl_key, 10).await;
    if !rl_result.allowed {
        tracing::warn!("⚠️ SSO login rate limit exceeded for email={} IP={}", email, client_ip);
        return Err(AppError::RateLimitExceeded);
    }

    // Extract email domain for SSO config lookup
    let domain = email.split('@').nth(1).unwrap_or("");
    if domain.is_empty() || !domain.contains('.') {
        return Err(AppError::BadRequest("Invalid email address".into()));
    }

    // Strategy 1: Find existing customer by email
    let existing_customer = sqlx::query_as::<_, Customer>(
        "SELECT id, email, api_key_hash, api_key_prefix, plan, webhook_limit, webhook_count, created_at, password_hash, stripe_customer_id, stripe_subscription_id, payment_provider, polar_customer_id, polar_subscription_id, iyzico_customer_id, iyzico_subscription_id, name, is_active, is_admin, role, updated_at, email_verified, totp_secret, totp_enabled, cancel_at_period_end, payment_failed_at, current_period_end, allow_overage, overage_email_notification, card_last4, card_brand, card_exp_month, card_exp_year, card_updated_at, paused_at, paused_until, pause_plan, billing_interval, has_used_startup_trial, avatar_url FROM customers WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(&pool)
    .await?;

    // Check if existing customer is active
    if let Some(ref c) = existing_customer {
        if !c.is_active {
            return Err(AppError::coded(ErrorCode::AccountDisabled));
        }
    }

    // Strategy 2: Find SSO config — try by customer_id, then by team membership, then by domain
    // Returns: (owner_id, team_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_enc, entity_id, default_role, sso_config_id, role_mapping, team_mapping)
    let config: Option<(Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Uuid, Option<serde_json::Value>, Option<serde_json::Value>)> = if let Some(ref customer) = existing_customer {
        // Existing user: look up by customer_id first (backward compat)
        let by_customer = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Uuid, Option<serde_json::Value>, Option<serde_json::Value>)>(
            "SELECT customer_id, team_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, entity_id, default_role, id, role_mapping, team_mapping FROM sso_configs WHERE customer_id = $1 AND enabled = true LIMIT 1"
        )
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?;

        if by_customer.is_some() {
            by_customer
        } else {
            // Try: find by team membership (user is in a team that has SSO)
            sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Uuid, Option<serde_json::Value>, Option<serde_json::Value>)>(
                "SELECT s.customer_id, s.team_id, s.provider, s.enabled, s.metadata_url, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.entity_id, s.default_role, s.id, s.role_mapping, s.team_mapping
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
        let by_verified_domain = sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Uuid, Option<serde_json::Value>, Option<serde_json::Value>)>(
            "SELECT COALESCE(customer_id, created_by), team_id, provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, entity_id, default_role, id, role_mapping, team_mapping
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
            sqlx::query_as::<_, (Uuid, Option<Uuid>, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Uuid, Option<serde_json::Value>, Option<serde_json::Value>)>(
                "SELECT s.customer_id, s.team_id, s.provider, s.enabled, s.metadata_url, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.entity_id, s.default_role, s.id, s.role_mapping, s.team_mapping
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

    let (sso_owner_id, config_team_id, provider, enabled, _metadata_url, sso_url, _certificate, issuer_url, client_id, client_secret_enc, entity_id, default_role, sso_config_id, role_mapping, team_mapping) =
        config.ok_or_else(|| AppError::coded(ErrorCode::SsoNotConfigured))?;

    let default_role = default_role.unwrap_or_else(|| "viewer".to_string());

    if !enabled {
        return Err(AppError::coded(ErrorCode::SsoNotEnabled));
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

    // Generate OIDC nonce upfront (for replay attack prevention)
    let oidc_nonce = if provider == "oidc" {
        Some(Uuid::new_v4().to_string())
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
        nonce: oidc_nonce.clone(),
        created_at: Utc::now(),
        sso_config_id,
        role_mapping: role_mapping.clone(),
        team_mapping: team_mapping.clone(),
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
        current_period_end: None,
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
            avatar_url: None,
    });

    if provider == "saml" {
        initiate_saml_login(&pool, &redirect_customer, &state, &sso_url, &entity_id, saml_request_id.as_deref()).await
    } else {
        initiate_oidc_login(&pool, &redirect_customer, &state, &issuer_url, &client_id, &client_secret_enc, oidc_nonce.as_deref()).await
    }
}

// ── SAML Login: Generate AuthnRequest and redirect ──────────

pub async fn initiate_saml_login(
    _pool: &PgPool,
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
    let header_val = axum::http::HeaderValue::from_str(&redirect_url)
        .map_err(|e| AppError::BadRequest(format!("Invalid redirect URL: {}", e)))?;
    headers.insert("location", header_val);
    Ok((headers, Redirect::temporary(&redirect_url)))
}

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

// ── POST /sso/saml/callback ─────────────────────────────────
// Handles SAML Response from IdP

pub async fn saml_callback(
    Extension(pool): Extension<PgPool>,
    Extension(state_store): Extension<SsoStateStore>,
    Extension(cfg): Extension<crate::config::Config>,
    headers: HeaderMap,
    body: String,
) -> Result<impl axum::response::IntoResponse, AppError> {
    // Body size limit: 1MB (SAML responses can be large but shouldn't exceed this)
    if body.len() > 1_048_576 {
        tracing::warn!("SAML callback body too large: {} bytes", body.len());
        return Err(AppError::coded(ErrorCode::SamlResponseTooLarge));
    }

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
        .map_err(|_| AppError::coded(ErrorCode::SamlInvalidBase64))?;
    let saml_xml = String::from_utf8(saml_xml)
        .map_err(|_| AppError::coded(ErrorCode::SamlInvalidEncoding))?;

    // Parse SAML assertion
    let assertion = parse_saml_response(&saml_xml)?;

    // Verify SAML response has a signature element
    let has_signature = xml_has_element(&saml_xml, "Signature");
    if !has_signature {
        tracing::warn!("SAML response missing digital signature");
        log_sso_attempt(&pool, None, &assertion.name_id, "saml", false, Some("Missing signature"), &headers).await;
        return Err(AppError::coded(ErrorCode::SamlNotSigned));
    }

    // Validate assertion timing
    if let Some(not_on_or_after) = assertion.not_on_or_after {
        if Utc::now() > not_on_or_after {
            return Err(AppError::coded(ErrorCode::SamlAssertionExpired));
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

    // Verify SAML response certificate against configured IdP certificate
    // Use sso_config_id for team-scoped SSO (not customer_id)
    if let Some(ref login_state) = login_state {
        let configured_cert: Option<String> = sqlx::query_scalar(
            "SELECT certificate FROM sso_configs WHERE id = $1 LIMIT 1"
        )
        .bind(login_state.sso_config_id)
        .fetch_optional(&pool)
        .await?
        .flatten();

        if let (Some(ref expected_cert), Some(ref response_cert)) = (&configured_cert, &assertion.certificate) {
            // Normalize both certificates for comparison (strip headers, whitespace)
            let normalize = |s: &String| -> String {
                s.replace("-----BEGIN CERTIFICATE-----", "")
                 .replace("-----END CERTIFICATE-----", "")
                 .replace('\n', "")
                 .replace('\r', "")
                 .replace(' ', "")
                 .trim()
                 .to_string()
            };
            let expected_norm = normalize(expected_cert);
            let response_norm = normalize(response_cert);

            if expected_norm != response_norm {
                tracing::warn!("⚠️ SAML certificate mismatch: response certificate does not match configured IdP certificate");
                log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "saml", false, Some("Certificate mismatch — possible tampering"), &headers).await;
                return Err(AppError::coded(ErrorCode::SamlCertMismatch));
            }
            tracing::debug!("SAML certificate verified successfully");

            // Verify cryptographic signature (RSA-SHA256)
            if let Err(e) = verify_saml_signature(&saml_xml, expected_cert) {
                tracing::warn!("⚠️ SAML cryptographic signature verification failed: {}", e);
                log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "saml", false, Some("Signature verification failed"), &headers).await;
                return Err(e);
            }
            tracing::debug!("SAML cryptographic signature verified successfully");
        } else if configured_cert.is_some() && assertion.certificate.is_none() {
            // Assertion doesn't include cert — try verification with configured cert
            tracing::info!("SAML response missing embedded certificate, attempting verification with configured IdP certificate");
            if let Some(ref expected_cert) = configured_cert {
                if let Err(e) = verify_saml_signature(&saml_xml, expected_cert) {
                    tracing::warn!("⚠️ SAML signature verification failed (using configured cert): {}", e);
                    log_sso_attempt(&pool, Some(login_state.customer_id), &login_state.email, "saml", false, Some("Signature verification failed with configured cert"), &headers).await;
                    return Err(e);
                }
                tracing::debug!("SAML cryptographic signature verified using configured IdP certificate");
            }
        }
    }

    let login_state = login_state.ok_or_else(|| {
        tracing::warn!("SAML callback: no valid state found (expired or invalid RelayState)");
        AppError::coded(ErrorCode::SsoSessionExpired)
    })?;

    // Verify email matches — strict check
    if assertion.name_id != login_state.email {
        tracing::warn!("SAML email mismatch: expected={}, got={}", login_state.email, assertion.name_id);
        log_sso_attempt(&pool, Some(login_state.customer_id), &assertion.name_id, "saml", false, Some("Email mismatch"), &headers).await;
        return Err(AppError::coded(ErrorCode::SamlEmailMismatch));
    }
    let email = assertion.name_id.clone();

    // Check if SSO config has verified domain matching user's email
    let email_domain = email.split('@').nth(1).unwrap_or("");
    let verified_domain: Option<String> = sqlx::query_scalar(
        "SELECT verified_domain FROM sso_configs WHERE customer_id = $1 AND verified_domain IS NOT NULL LIMIT 1"
    )
    .bind(login_state.customer_id)
    .fetch_optional(&pool)
    .await?
    .flatten();
    let domain_verified = verified_domain.as_deref() == Some(email_domain);

    // Find or create customer
    let customer = find_or_create_sso_customer(&pool, &email, &assertion.attributes, "saml", domain_verified).await?;

    // Extract IdP attributes for role/team mapping
    let idp_groups: Vec<String> = assertion.attributes.get("groups")
        .or_else(|| assertion.attributes.get("memberOf"))
        .map(|s| s.split(',').map(|g| g.trim().to_string()).collect())
        .unwrap_or_default();
    let idp_roles: Vec<String> = assertion.attributes.get("role")
        .or_else(|| assertion.attributes.get("roles"))
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
        &email,
        &login_state.auto_join_team_id,
    );

    // Store SSO user attributes
    let _ = store_sso_user_attributes(
        &pool,
        customer.id,
        login_state.sso_config_id,
        assertion.attributes.get("uid").or(assertion.attributes.get("user_id")).map(|s| s.as_str()),
        &idp_groups,
        &idp_roles,
        &assertion.attributes,
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
    log_sso_attempt(&pool, Some(customer.id), &email, "saml", true, None, &headers).await;

    // Audit log for SSO login
    let _ = crate::audit::log_action(&pool, customer.id, "SSO_LOGIN", "auth", None,
        Some(serde_json::json!({"provider": "saml", "auto_joined_team": resolved_team.is_some(), "role": resolved_role})),
        None, None).await;

    // Generate JWT tokens
    generate_sso_response(&pool, &customer, &cfg, login_state.redirect).await
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

// ── GET /sso/providers ──────────────────────────────────────
// List SSO providers available for a domain (public endpoint)

pub async fn list_sso_providers(
    Extension(pool): Extension<PgPool>,
    Query(query): Query<SsoProviderQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let domain = &query.domain;

    // Find SSO configs matching this domain (by verified_domain, team membership, or customer email domain)
    let providers = sqlx::query_as::<_, (String, String)>(
        "SELECT DISTINCT s.provider, COALESCE(s.verified_domain, SPLIT_PART(c.email, '@', 2)) as domain
         FROM sso_configs s
         JOIN customers c ON c.id = s.customer_id
         WHERE s.enabled = true
         AND (
             s.verified_domain = $1
             OR SPLIT_PART(c.email, '@', 2) = $1
             OR s.team_id IN (
                 SELECT tm.team_id FROM team_members tm
                 JOIN customers c2 ON c2.id = tm.customer_id
                 WHERE SPLIT_PART(c2.email, '@', 2) = $1
             )
         )
         LIMIT 5"
    )
    .bind(domain)
    .fetch_all(&pool)
    .await?;

    let provider_list: Vec<serde_json::Value> = providers.iter().map(|(provider, _email)| {
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
