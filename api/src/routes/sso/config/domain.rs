use axum::{
    extract::{Extension, Query},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;
use crate::routes::sso::{OidcDiscovery, TeamQuery};

use super::VerifyDomainRequest;

#[derive(Debug, Serialize)]
pub struct VerifyDomainResponse { pub txt_record: String, pub instructions: String }

// ── Login Attempts ──────────────────────────────────────────

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct LoginAttempt {
    id: Uuid,
    email: String,
    provider: String,
    success: bool,
    error_message: Option<String>,
    ip_address: Option<String>,
    created_at: DateTime<Utc>,
}

pub async fn get_login_attempts(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, AppError> {
    if !customer.is_admin {
        return Err(AppError::Forbidden);
    }

    let page: i64 = query.get("page").and_then(|p| p.parse().ok()).unwrap_or(1).max(1);
    let limit: i64 = query.get("limit").and_then(|l| l.parse().ok()).unwrap_or(50).min(200);
    let offset = (page - 1) * limit;

    let attempts = sqlx::query_as::<_, LoginAttempt>(
        "SELECT id, email, provider, success, error_message, ip_address, created_at
         FROM sso_login_attempts ORDER BY created_at DESC LIMIT $1 OFFSET $2"
    )
    .bind(limit).bind(offset)
    .fetch_all(&pool).await?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM sso_login_attempts")
        .fetch_one(&pool).await?;

    Ok(Json(serde_json::json!({
        "attempts": attempts, "total": total.0, "page": page, "limit": limit,
        "has_more": offset + limit < total.0,
    })))
}

pub async fn initiate_domain_verification(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<VerifyDomainRequest>,
) -> Result<Json<VerifyDomainResponse>, AppError> {
    let domain = req.domain.trim().to_lowercase();

    if domain.is_empty() || !domain.contains('.') || domain.contains(' ') {
        return Err(AppError::coded(ErrorCode::DomainInvalidFormat));
    }
    if !domain.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.') {
        return Err(AppError::coded(ErrorCode::DomainInvalidChars));
    }
    let blocked = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "protonmail.com", "mail.com"];
    if blocked.contains(&domain.as_str()) {
        return Err(AppError::coded(ErrorCode::DomainPublicDomain));
    }

    let verification_token = format!("hooksniff-verify-{}", Uuid::new_v4());

    sqlx::query(
        r#"INSERT INTO domain_verifications (customer_id, domain, txt_value, verified, created_at)
           VALUES ($1, $2, $3, false, NOW())
           ON CONFLICT (customer_id, domain) DO UPDATE SET txt_value = $3, verified = false, created_at = NOW()"#
    )
    .bind(customer.id).bind(&domain).bind(&verification_token)
    .execute(&pool).await?;

    tracing::info!("Domain verification initiated: {} for customer {}", domain, customer.id);

    Ok(Json(VerifyDomainResponse {
        txt_record: verification_token.clone(),
        instructions: format!("Add a TXT record to your DNS: name: _hooksniff.{} value: {}", domain, verification_token),
    }))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CheckDomainRequest { domain: String }

#[derive(Debug, Serialize)]
pub struct CheckDomainResponse { verified: bool, message: String }

pub async fn check_domain_verification(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CheckDomainRequest>,
) -> Result<Json<CheckDomainResponse>, AppError> {
    let domain = req.domain.trim().to_lowercase();

    let row: Option<(String,)> = sqlx::query_as(
        "SELECT txt_value FROM domain_verifications WHERE customer_id = $1 AND domain = $2"
    )
    .bind(customer.id).bind(&domain)
    .fetch_optional(&pool).await?;

    let (expected_txt,) = match row {
        Some(r) => r,
        None => return Err(AppError::BadRequest("No pending verification for this domain".into())),
    };

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
                                answer["data"].as_str().map_or(false, |data| data.trim_matches('"') == expected_clean)
                            })
                        } else { false }
                    }
                    Err(e) => { tracing::warn!("Failed to parse DNS response for {}: {}", txt_name, e); false }
                }
            }
            Ok(resp) => { tracing::warn!("DNS lookup returned HTTP {} for {}", resp.status(), txt_name); false }
            Err(e) => { tracing::warn!("DNS lookup failed for {}: {}", txt_name, e); false }
        }
    };

    if verified {
        sqlx::query("UPDATE domain_verifications SET verified = true, verified_at = NOW() WHERE customer_id = $1 AND domain = $2")
            .bind(customer.id).bind(&domain).execute(&pool).await?;

        sqlx::query("UPDATE sso_configs SET verified_domain = $1, updated_at = NOW() WHERE customer_id = $2")
            .bind(&domain).bind(customer.id).execute(&pool).await?;

        tracing::info!("Domain {} verified for customer {}", domain, customer.id);

        Ok(Json(CheckDomainResponse { verified: true, message: format!("Domain {} verified successfully!", domain) }))
    } else {
        Ok(Json(CheckDomainResponse {
            verified: false,
            message: format!("TXT record not found. Add a TXT record: name: _hooksniff.{} value: {}", domain, expected_txt),
        }))
    }
}

// ── POST /sso/test ──────────────────────────────────────────

pub async fn test_sso_connection(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<TeamQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config = if let Some(team_id) = query.team_id {
        let _member = sqlx::query_scalar::<_, String>(
            "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(team_id).bind(customer.id)
        .fetch_optional(&pool).await?
        .ok_or(AppError::Forbidden)?;

        sqlx::query_as::<_, (String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
            "SELECT provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, metadata_url, entity_id FROM sso_configs WHERE team_id = $1 LIMIT 1"
        )
        .bind(team_id).fetch_optional(&pool).await?
    } else {
        sqlx::query_as::<_, (String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
            "SELECT provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, metadata_url, entity_id FROM sso_configs WHERE customer_id = $1 LIMIT 1"
        )
        .bind(customer.id).fetch_optional(&pool).await?
    };

    let (provider, _enabled, metadata_url, sso_url, certificate, issuer_url, client_id, client_secret_enc, _meta2, _entity) =
        config.ok_or_else(|| AppError::BadRequest("No SSO configuration found. Please set up SSO first.".into()))?;

    let mut issues = Vec::new();
    let mut test_details = serde_json::json!({});

    if provider == "saml" {
        if metadata_url.is_none() && sso_url.is_none() {
            issues.push("SAML requires metadata_url or sso_url");
        }
        if certificate.is_none() {
            issues.push("SAML requires a certificate");
        }

        if let Some(ref meta_url) = metadata_url {
            let client = crate::http_client::get_client().clone();
            match client.get(meta_url).send().await {
                Ok(resp) if resp.status().is_success() => {
                    let body = resp.text().await.unwrap_or_default();
                    if body.contains("EntityDescriptor") || body.contains("md:EntityDescriptor") {
                        test_details["metadata_valid"] = serde_json::json!(true);
                        test_details["metadata_size"] = serde_json::json!(body.len());
                    } else {
                        issues.push("Metadata URL does not return valid SAML metadata");
                    }
                }
                Ok(resp) => {
                    return Ok(Json(serde_json::json!({
                        "valid": false, "provider": provider,
                        "issues": [format!("Metadata URL returned HTTP {}", resp.status())],
                    })));
                }
                Err(e) => {
                    return Ok(Json(serde_json::json!({
                        "valid": false, "provider": provider,
                        "issues": [format!("Cannot reach metadata URL: {}", e)],
                    })));
                }
            }
        }
    } else if provider == "oidc" {
        if issuer_url.is_none() { issues.push("OIDC requires issuer_url"); }
        if client_id.is_none() { issues.push("OIDC requires client_id"); }
        if client_secret_enc.is_none() { issues.push("OIDC requires client_secret"); }

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
                        Err(_) => { issues.push("OIDC discovery document is invalid"); }
                    }
                }
                Ok(resp) => {
                    return Ok(Json(serde_json::json!({
                        "valid": false, "provider": provider,
                        "issues": [format!("OIDC discovery returned HTTP {}", resp.status())],
                    })));
                }
                Err(e) => {
                    return Ok(Json(serde_json::json!({
                        "valid": false, "provider": provider,
                        "issues": [format!("Cannot reach OIDC discovery endpoint: {}", e)],
                    })));
                }
            }
        }
    }

    if issues.is_empty() {
        Ok(Json(serde_json::json!({
            "valid": true, "provider": provider,
            "message": format!("{} SSO configuration is valid.", provider.to_uppercase()),
            "details": test_details,
        })))
    } else {
        let issue_strings: Vec<String> = issues.iter().map(|s| s.to_string()).collect();
        Ok(Json(serde_json::json!({ "valid": false, "provider": provider, "issues": issue_strings })))
    }
}
