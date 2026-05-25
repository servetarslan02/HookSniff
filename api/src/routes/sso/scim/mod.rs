//! SCIM 2.0 Endpoints
//!
//! System for Cross-domain Identity Management (SCIM) 2.0 implementation
//! for automated user provisioning and deprovisioning.

use axum::{
    extract::{Extension, Path, Query},
    http::{HeaderMap, StatusCode},
    Json,
};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::Customer;

use super::helpers::{auto_join_team_direct, store_sso_user_attributes};

// ── SCIM Types ──────────────────────────────────────────────

#[derive(sqlx::FromRow)]
pub struct SsoUserAttributesRow {
    pub idp_user_id: Option<String>,
    pub idp_groups: Option<Vec<String>>,
    pub idp_roles: Option<Vec<String>>,
    pub raw_attributes: Option<serde_json::Value>,
}

/// Combined row for SCIM list query (Customer + SSO attributes)
#[derive(sqlx::FromRow)]
pub struct ScimUserRow {
    // Customer fields
    pub id: Uuid,
    pub email: String,
    pub api_key_hash: String,
    pub api_key_prefix: String,
    pub plan: String,
    pub webhook_limit: i64,
    pub webhook_count: i64,
    pub created_at: DateTime<Utc>,
    pub password_hash: Option<String>,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    pub payment_provider: String,
    pub polar_customer_id: Option<String>,
    pub polar_subscription_id: Option<String>,
    pub iyzico_customer_id: Option<String>,
    pub iyzico_subscription_id: Option<String>,
    pub name: Option<String>,
    pub is_active: bool,
    pub is_admin: bool,
    pub role: String,
    pub updated_at: DateTime<Utc>,
    pub email_verified: bool,
    pub totp_secret: Option<String>,
    pub totp_enabled: bool,
    pub cancel_at_period_end: bool,
    pub payment_failed_at: Option<DateTime<Utc>>,
    pub current_period_end: Option<DateTime<Utc>>,
    pub allow_overage: bool,
    pub overage_email_notification: bool,
    pub card_last4: Option<String>,
    pub card_brand: Option<String>,
    pub card_exp_month: Option<i16>,
    pub card_exp_year: Option<i16>,
    pub card_updated_at: Option<DateTime<Utc>>,
    pub paused_at: Option<DateTime<Utc>>,
    pub paused_until: Option<DateTime<Utc>>,
    pub pause_plan: Option<String>,
    pub billing_interval: Option<String>,
    pub has_used_startup_trial: bool,
    pub avatar_url: Option<String>,
    // SSO attribute fields
    pub idp_user_id: Option<String>,
    pub idp_groups: Option<Vec<String>>,
    pub idp_roles: Option<Vec<String>>,
    pub raw_attributes: Option<serde_json::Value>,
}

// ── SCIM Token Validation ───────────────────────────────────

/// Validate SCIM bearer token and return sso_config_id
pub async fn validate_scim_token(
    pool: &PgPool,
    headers: &HeaderMap,
) -> Result<Uuid, AppError> {
    let auth = headers.get("authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(AppError::Unauthorized)?;

    let token = auth.strip_prefix("Bearer ").unwrap_or(auth);
    let token_hash = hash_api_key(token);

    let config_id: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM sso_configs WHERE scim_enabled = true AND scim_token_hash = $1"
    )
    .bind(&token_hash)
    .fetch_optional(pool)
    .await?;

    config_id
        .map(|(id,)| id)
        .ok_or(AppError::Unauthorized)
}

// ── SCIM User Response Builder ──────────────────────────────

/// SCIM User response builder
pub fn scim_user_response(customer: &Customer, attributes: Option<&SsoUserAttributesRow>) -> serde_json::Value {
    let groups = attributes
        .and_then(|a| a.idp_groups.as_ref())
        .cloned()
        .unwrap_or_default();

    serde_json::json!({
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
        "id": customer.id.to_string(),
        "externalId": attributes.and_then(|a| a.idp_user_id.clone()),
        "userName": customer.email,
        "name": {
            "formatted": customer.name,
        },
        "emails": [{
            "value": customer.email,
            "primary": true,
            "type": "work"
        }],
        "active": customer.is_active,
        "groups": groups.iter().map(|g| serde_json::json!({"value": g, "display": g})).collect::<Vec<_>>(),
        "meta": {
            "resourceType": "User",
            "created": customer.created_at.to_rfc3339(),
            "lastModified": customer.updated_at.to_rfc3339(),
            "location": format!("/v1/sso/scim/v2/Users/{}", customer.id)
        }
    })
}

/// Helper to build Customer from ScimUserRow
pub fn scim_row_to_customer(r: &ScimUserRow) -> Customer {
    Customer {
        id: r.id, email: r.email.clone(), api_key_hash: r.api_key_hash.clone(),
        api_key_prefix: r.api_key_prefix.clone(), plan: r.plan.clone(),
        webhook_limit: r.webhook_limit, webhook_count: r.webhook_count,
        created_at: r.created_at, password_hash: r.password_hash.clone(),
        stripe_customer_id: r.stripe_customer_id.clone(), stripe_subscription_id: r.stripe_subscription_id.clone(),
        payment_provider: r.payment_provider.clone(), polar_customer_id: r.polar_customer_id.clone(),
        polar_subscription_id: r.polar_subscription_id.clone(), iyzico_customer_id: r.iyzico_customer_id.clone(),
        iyzico_subscription_id: r.iyzico_subscription_id.clone(), name: r.name.clone(),
        is_active: r.is_active, is_admin: r.is_admin, role: r.role.clone(),
        updated_at: r.updated_at, email_verified: r.email_verified,
        totp_secret: r.totp_secret.clone(), totp_enabled: r.totp_enabled,
        cancel_at_period_end: r.cancel_at_period_end, payment_failed_at: r.payment_failed_at,
        current_period_end: r.current_period_end, allow_overage: r.allow_overage,
        overage_email_notification: r.overage_email_notification, card_last4: r.card_last4.clone(),
        card_brand: r.card_brand.clone(), card_exp_month: r.card_exp_month,
        card_exp_year: r.card_exp_year, card_updated_at: r.card_updated_at,
        paused_at: r.paused_at, paused_until: r.paused_until, pause_plan: r.pause_plan.clone(),
        billing_interval: r.billing_interval.clone(), has_used_startup_trial: r.has_used_startup_trial,
        avatar_url: r.avatar_url.clone(),
    }
}

/// Helper to build SsoUserAttributesRow from ScimUserRow
pub fn scim_row_to_attrs(r: &ScimUserRow) -> SsoUserAttributesRow {
    SsoUserAttributesRow {
        idp_user_id: r.idp_user_id.clone(),
        idp_groups: r.idp_groups.clone(),
        idp_roles: r.idp_roles.clone(),
        raw_attributes: r.raw_attributes.clone(),
    }
}


pub mod users;
pub mod groups;

// Re-export all handlers so sso/mod.rs `use scim::*` works
pub use users::*;
pub use groups::*;
