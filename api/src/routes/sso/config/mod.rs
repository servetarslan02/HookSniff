//! SSO Configuration Endpoints
//!
//! CRUD operations for SSO configuration, domain verification, login attempts,
//! and SSO connection testing.

use axum::{
    extract::{Extension, Query},
    Json,
};
use chrono::{DateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, ErrorCode};
use crate::crypto;
use crate::middleware::hash_api_key;
use crate::models::customer::Customer;

use super::{TeamQuery, UpsertSsoRequest};

// ── GET /sso/config ─────────────────────────────────────────

/// Row struct for get_sso_config queries (19 fields — too many for tuple)
#[derive(sqlx::FromRow)]
pub struct SsoConfigRow {
    id: Uuid,
    provider: String,
    enabled: bool,
    metadata_url: Option<String>,
    entity_id: Option<String>,
    sso_url: Option<String>,
    certificate: Option<String>,
    issuer_url: Option<String>,
    client_id: Option<String>,
    client_secret_encrypted: Option<String>,
    admin_bypass: bool,
    verified_domain: Option<String>,
    default_team_id: Option<Uuid>,
    default_role: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    role_mapping: Option<serde_json::Value>,
    team_mapping: Option<serde_json::Value>,
    scim_enabled: bool,
}

pub fn sso_config_to_json(r: &SsoConfigRow) -> serde_json::Value {
    serde_json::json!({
        "id": r.id, "provider": &r.provider, "enabled": r.enabled,
        "verified_domain": &r.verified_domain, "metadata_url": &r.metadata_url,
        "entity_id": &r.entity_id, "sso_url": &r.sso_url,
        "certificate_set": r.certificate.is_some(), "issuer_url": &r.issuer_url,
        "client_id": &r.client_id, "client_secret_set": r.client_secret_encrypted.is_some(),
        "admin_bypass": r.admin_bypass, "default_team_id": r.default_team_id,
        "default_role": r.default_role.as_deref().unwrap_or("viewer"),
        "created_at": r.created_at, "updated_at": r.updated_at,
        "role_mapping": &r.role_mapping, "team_mapping": &r.team_mapping,
        "scim_enabled": r.scim_enabled,
    })
}

pub async fn get_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<TeamQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config = if let Some(team_id) = query.team_id {
        let _member = sqlx::query_as::<_, (Uuid, String)>(
            "SELECT id, role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(team_id)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Forbidden)?;

        sqlx::query_as::<_, SsoConfigRow>(
            "SELECT s.id, s.provider, s.enabled, s.metadata_url, s.entity_id, s.sso_url, s.certificate, s.issuer_url, s.client_id, s.client_secret_encrypted, s.admin_bypass, s.verified_domain, s.default_team_id, s.default_role, s.created_at, s.updated_at, s.role_mapping, s.team_mapping, s.scim_enabled
             FROM sso_configs s WHERE s.team_id = $1 LIMIT 1"
        )
        .bind(team_id)
        .fetch_optional(&pool)
        .await?
        .map(|r| sso_config_to_json(&r))
    } else {
        sqlx::query_as::<_, SsoConfigRow>(
            "SELECT id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, admin_bypass, verified_domain, default_team_id, default_role, created_at, updated_at, role_mapping, team_mapping, scim_enabled
             FROM sso_configs WHERE customer_id = $1 LIMIT 1"
        )
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .map(|r| sso_config_to_json(&r))
    };

    match config {
        Some(json) => Ok(Json(json)),
        None => Ok(Json(serde_json::json!({
            "provider": "saml",
            "enabled": false,
            "admin_bypass": true,
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

pub async fn upsert_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpsertSsoRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let provider = req.provider.unwrap_or_else(|| "saml".to_string());

    if !["saml", "oidc"].contains(&provider.as_str()) {
        return Err(AppError::coded(ErrorCode::SsoInvalidProvider));
    }

    let enabled = req.enabled.unwrap_or(false);
    let admin_bypass = req.admin_bypass.unwrap_or(true);

    let scope_team_id: Option<Uuid> = if let Some(tid) = req.team_id {
        let member = sqlx::query_as::<_, (String,)>(
            "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(tid)
        .bind(customer.id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::Forbidden)?;

        if member.0 != "admin" {
            let is_owner: Option<(Uuid,)> = sqlx::query_as(
                "SELECT id FROM teams WHERE id = $1 AND owner_id = $2"
            )
            .bind(tid)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?;

            if is_owner.is_none() {
                return Err(AppError::Forbidden);
            }
        }
        Some(tid)
    } else {
        None
    };

    if enabled {
        if provider == "saml" {
            if req.sso_url.is_none() && req.metadata_url.is_none() {
                return Err(AppError::coded(ErrorCode::SamlMissingUrl));
            }
            if req.certificate.is_none() {
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
                    return Err(AppError::coded(ErrorCode::SamlMissingCertificate));
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

    if let Some(ref role) = req.default_role {
        if !["admin", "developer", "analyst", "viewer"].contains(&role.as_str()) {
            return Err(AppError::coded(ErrorCode::InvalidRole));
        }
    }

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
        let scim_token_hash = req.scim_token.as_ref().map(|t| hash_api_key(t));

        sqlx::query(
            r#"INSERT INTO sso_configs (team_id, customer_id, created_by, provider, enabled, admin_bypass, verified_domain, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, default_team_id, default_role, role_mapping, team_mapping, scim_enabled, scim_token_hash)
               VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
               ON CONFLICT (team_id) DO UPDATE SET
                   provider = EXCLUDED.provider, enabled = EXCLUDED.enabled, admin_bypass = EXCLUDED.admin_bypass,
                   verified_domain = EXCLUDED.verified_domain, metadata_url = EXCLUDED.metadata_url, entity_id = EXCLUDED.entity_id,
                   sso_url = EXCLUDED.sso_url, certificate = COALESCE(EXCLUDED.certificate, sso_configs.certificate),
                   issuer_url = EXCLUDED.issuer_url, client_id = EXCLUDED.client_id,
                   client_secret_encrypted = COALESCE(EXCLUDED.client_secret_encrypted, sso_configs.client_secret_encrypted),
                   default_team_id = EXCLUDED.default_team_id, default_role = EXCLUDED.default_role,
                   role_mapping = EXCLUDED.role_mapping, team_mapping = EXCLUDED.team_mapping,
                   scim_enabled = EXCLUDED.scim_enabled, scim_token_hash = COALESCE(EXCLUDED.scim_token_hash, sso_configs.scim_token_hash),
                   updated_at = now()"#
        )
        .bind(tid).bind(customer.id).bind(&provider).bind(enabled).bind(admin_bypass)
        .bind(&req.verified_domain).bind(&req.metadata_url).bind(&req.entity_id).bind(&req.sso_url)
        .bind(&req.certificate).bind(&req.issuer_url).bind(&req.client_id).bind(&client_secret_enc)
        .bind(&req.default_team_id.as_deref().and_then(|s| Uuid::parse_str(s).ok()))
        .bind(req.default_role.as_deref().unwrap_or("viewer"))
        .bind(&req.role_mapping).bind(&req.team_mapping)
        .bind(req.scim_enabled.unwrap_or(false)).bind(&scim_token_hash)
        .execute(&pool).await?;

        tracing::info!("SSO config updated: team={}, provider={}, enabled={}", tid, provider, enabled);
    } else {
        let scim_token_hash = req.scim_token.as_ref().map(|t| hash_api_key(t));

        sqlx::query(
            r#"INSERT INTO sso_configs (customer_id, provider, enabled, admin_bypass, verified_domain, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, default_team_id, default_role, role_mapping, team_mapping, scim_enabled, scim_token_hash)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
               ON CONFLICT (customer_id) WHERE team_id IS NULL DO UPDATE SET
                   provider = EXCLUDED.provider, enabled = EXCLUDED.enabled, admin_bypass = EXCLUDED.admin_bypass,
                   verified_domain = EXCLUDED.verified_domain, metadata_url = EXCLUDED.metadata_url, entity_id = EXCLUDED.entity_id,
                   sso_url = EXCLUDED.sso_url, certificate = COALESCE(EXCLUDED.certificate, sso_configs.certificate),
                   issuer_url = EXCLUDED.issuer_url, client_id = EXCLUDED.client_id,
                   client_secret_encrypted = COALESCE(EXCLUDED.client_secret_encrypted, sso_configs.client_secret_encrypted),
                   default_team_id = EXCLUDED.default_team_id, default_role = EXCLUDED.default_role,
                   role_mapping = EXCLUDED.role_mapping, team_mapping = EXCLUDED.team_mapping,
                   scim_enabled = EXCLUDED.scim_enabled, scim_token_hash = COALESCE(EXCLUDED.scim_token_hash, sso_configs.scim_token_hash),
                   updated_at = now()"#
        )
        .bind(customer.id).bind(&provider).bind(enabled).bind(admin_bypass)
        .bind(&req.verified_domain).bind(&req.metadata_url).bind(&req.entity_id).bind(&req.sso_url)
        .bind(&req.certificate).bind(&req.issuer_url).bind(&req.client_id).bind(&client_secret_enc)
        .bind(&req.default_team_id.as_deref().and_then(|s| Uuid::parse_str(s).ok()))
        .bind(req.default_role.as_deref().unwrap_or("viewer"))
        .bind(&req.role_mapping).bind(&req.team_mapping)
        .bind(req.scim_enabled.unwrap_or(false)).bind(&scim_token_hash)
        .execute(&pool).await?;

        tracing::info!("SSO config updated: customer={}, provider={}, enabled={}", customer.id, provider, enabled);
    }

    Ok(Json(serde_json::json!({
        "success": true, "provider": provider, "enabled": enabled,
    })))
}

// ── DELETE /sso/config ──────────────────────────────────────

pub async fn delete_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Query(query): Query<TeamQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = if let Some(team_id) = query.team_id {
        let member = sqlx::query_scalar::<_, String>(
            "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
        )
        .bind(team_id).bind(customer.id)
        .fetch_optional(&pool).await?;

        if member.is_none() {
            return Err(AppError::Forbidden);
        }

        sqlx::query("DELETE FROM sso_configs WHERE team_id = $1")
            .bind(team_id).execute(&pool).await?
    } else {
        sqlx::query("DELETE FROM sso_configs WHERE customer_id = $1 AND team_id IS NULL")
            .bind(customer.id).execute(&pool).await?
    };

    Ok(Json(serde_json::json!({ "deleted": result.rows_affected() > 0 })))
}

// ── Domain Verification ────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct VerifyDomainRequest { pub domain: String }

pub mod domain;
pub use domain::*;
