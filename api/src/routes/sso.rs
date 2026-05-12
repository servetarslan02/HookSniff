//! SSO/SAML/OIDC Configuration API
//!
//! Allows enterprise customers to configure Single Sign-On.
//!
//! ## Endpoints
//!
//! - `GET /sso/config` — Get current SSO configuration
//! - `POST /sso/config` — Create/update SSO configuration
//! - `DELETE /sso/config` — Remove SSO configuration
//! - `POST /sso/test` — Test SSO connection

use axum::{
    extract::Extension,
    routing::{delete, get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/config", get(get_sso_config))
        .route("/config", post(upsert_sso_config))
        .route("/config", delete(delete_sso_config))
        .route("/test", post(test_sso_connection))
}

/// SSO configuration response
#[derive(Debug, Serialize)]
pub struct SsoConfigResponse {
    pub id: Uuid,
    pub provider: String,
    pub enabled: bool,
    // SAML
    pub metadata_url: Option<String>,
    pub entity_id: Option<String>,
    pub sso_url: Option<String>,
    pub certificate_set: bool,
    // OIDC
    pub issuer_url: Option<String>,
    pub client_id: Option<String>,
    pub client_secret_set: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// SSO configuration create/update request
#[derive(Debug, Deserialize)]
pub struct UpsertSsoRequest {
    pub provider: Option<String>,
    pub enabled: Option<bool>,
    // SAML
    pub metadata_url: Option<String>,
    pub entity_id: Option<String>,
    pub sso_url: Option<String>,
    pub certificate: Option<String>,
    // OIDC
    pub issuer_url: Option<String>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
}

/// GET /sso/config — Get SSO configuration for the authenticated customer
async fn get_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config = sqlx::query_as::<_, (Uuid, String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>, DateTime<Utc>, DateTime<Utc>)>(
        "SELECT id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted, created_at, updated_at
         FROM sso_configs WHERE customer_id = $1 LIMIT 1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    match config {
        Some((
            id,
            provider,
            enabled,
            metadata_url,
            entity_id,
            sso_url,
            certificate,
            issuer_url,
            client_id,
            client_secret_enc,
            created_at,
            updated_at,
        )) => Ok(Json(serde_json::json!({
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
            "created_at": created_at,
            "updated_at": updated_at,
        }))),
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

/// POST /sso/config — Create or update SSO configuration
async fn upsert_sso_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpsertSsoRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let provider = req.provider.unwrap_or_else(|| "saml".to_string());

    if !["saml", "oidc"].contains(&provider.as_str()) {
        return Err(AppError::BadRequest(
            "SSO provider must be either 'saml' or 'oidc'".into(),
        ));
    }

    let enabled = req.enabled.unwrap_or(false);

    // If enabling, validate required fields
    if enabled {
        if provider == "saml" {
            if req.sso_url.is_none() && req.metadata_url.is_none() {
                return Err(AppError::BadRequest(
                    "SAML SSO requires either a metadata URL or an SSO URL".into(),
                ));
            }
        } else if provider == "oidc" && (req.issuer_url.is_none() || req.client_id.is_none()) {
            return Err(AppError::BadRequest(
                "OIDC SSO requires an issuer URL and a client ID".into(),
            ));
        }
    }

    // Encrypt client secret using AES-256-GCM
    let client_secret_enc = match req.client_secret {
        Some(ref secret) if !secret.is_empty() => {
            Some(crate::crypto::encrypt(secret).map_err(|e| {
                tracing::error!("Failed to encrypt SSO client_secret: {}", e);
                AppError::Internal(anyhow::anyhow!("Encryption failed"))
            })?)
        }
        _ => None,
    };

    sqlx::query(
        r#"INSERT INTO sso_configs (customer_id, provider, enabled, metadata_url, entity_id, sso_url, certificate, issuer_url, client_id, client_secret_encrypted)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (customer_id) DO UPDATE SET
               provider = EXCLUDED.provider,
               enabled = EXCLUDED.enabled,
               metadata_url = EXCLUDED.metadata_url,
               entity_id = EXCLUDED.entity_id,
               sso_url = EXCLUDED.sso_url,
               certificate = COALESCE(EXCLUDED.certificate, sso_configs.certificate),
               issuer_url = EXCLUDED.issuer_url,
               client_id = EXCLUDED.client_id,
               client_secret_encrypted = COALESCE(EXCLUDED.client_secret_encrypted, sso_configs.client_secret_encrypted),
               updated_at = now()"#
    )
    .bind(customer.id)
    .bind(&provider)
    .bind(enabled)
    .bind(&req.metadata_url)
    .bind(&req.entity_id)
    .bind(&req.sso_url)
    .bind(&req.certificate)
    .bind(&req.issuer_url)
    .bind(&req.client_id)
    .bind(&client_secret_enc)
    .execute(&pool)
    .await?;

    tracing::info!(
        "✅ SSO config updated for customer {} (provider={}, enabled={})",
        customer.id,
        provider,
        enabled
    );

    Ok(Json(serde_json::json!({
        "updated": true,
        "provider": provider,
        "enabled": enabled,
    })))
}

/// DELETE /sso/config — Remove SSO configuration
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

/// POST /sso/test — Test SSO connection (validates configuration)
async fn test_sso_connection(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config = sqlx::query_as::<_, (String, bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)>(
        "SELECT provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id FROM sso_configs WHERE customer_id = $1 LIMIT 1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let (provider, enabled, metadata_url, sso_url, certificate, issuer_url, client_id) =
        config.ok_or(AppError::BadRequest("No SSO configuration found".into()))?;

    if !enabled {
        return Err(AppError::BadRequest(
            "SSO is not enabled. Enable it first.".into(),
        ));
    }

    let mut issues = Vec::new();

    if provider == "saml" {
        if metadata_url.is_none() && sso_url.is_none() {
            issues.push("SAML requires metadata_url or sso_url");
        }
        if certificate.is_none() {
            issues.push("SAML requires a certificate");
        }
    } else if provider == "oidc" {
        if issuer_url.is_none() {
            issues.push("OIDC requires issuer_url");
        }
        if client_id.is_none() {
            issues.push("OIDC requires client_id");
        }
    }

    if issues.is_empty() {
        Ok(Json(serde_json::json!({
            "valid": true,
            "provider": provider,
            "message": "SSO configuration looks valid. Test by logging in via SSO.",
        })))
    } else {
        Ok(Json(serde_json::json!({
            "valid": false,
            "provider": provider,
            "issues": issues,
        })))
    }
}

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
    fn test_upsert_sso_request_saml() {
        let json = r#"{"provider":"saml","enabled":true,"sso_url":"https://idp.example.com/sso","certificate":"MIID..."}"#;
        let req: UpsertSsoRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.provider.unwrap(), "saml");
        assert!(req.enabled.unwrap());
    }

    #[test]
    fn test_sso_config_response_serialization() {
        let resp = SsoConfigResponse {
            id: Uuid::new_v4(),
            provider: "saml".to_string(),
            enabled: true,
            metadata_url: Some("https://idp.example.com/metadata".to_string()),
            entity_id: Some("hooksniff".to_string()),
            sso_url: Some("https://idp.example.com/sso".to_string()),
            certificate_set: true,
            issuer_url: None,
            client_id: None,
            client_secret_set: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["provider"], "saml");
        assert!(json["certificate_set"].as_bool().unwrap());
    }
}
