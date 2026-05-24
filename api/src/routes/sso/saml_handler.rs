use axum::extract::Extension;
use axum::http::HeaderMap;
use axum::response::Redirect;
use chrono::Utc;
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{SsoLoginState, SsoStateStore};
use super::config::{SsoConfigRow, sso_config_to_json};
use super::saml::{parse_saml_response, verify_saml_signature, xml_has_element};
use super::helpers::{find_or_create_sso_customer, auto_join_team_direct, resolve_role_from_mapping, resolve_team_from_mapping, store_sso_user_attributes, sync_team_memberships, generate_sso_response, log_sso_attempt};

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

