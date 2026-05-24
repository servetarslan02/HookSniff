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
fn scim_row_to_customer(r: &ScimUserRow) -> Customer {
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
fn scim_row_to_attrs(r: &ScimUserRow) -> SsoUserAttributesRow {
    SsoUserAttributesRow {
        idp_user_id: r.idp_user_id.clone(),
        idp_groups: r.idp_groups.clone(),
        idp_roles: r.idp_roles.clone(),
        raw_attributes: r.raw_attributes.clone(),
    }
}

// ── GET /scim/v2/Users — List users ────────────────────────

pub async fn scim_list_users(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    // Get customer_id from config to scope results
    let owner_id: Option<(Uuid,)> = sqlx::query_as(
        "SELECT customer_id FROM sso_configs WHERE id = $1"
    )
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    let owner_id = match owner_id {
        Some((id,)) => id,
        None => return Ok(Json(serde_json::json!({
            "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
            "totalResults": 0,
            "startIndex": 1,
            "itemsPerPage": 0,
            "Resources": []
        }))),
    };

    // Get all customers who logged in via this SSO config
    let rows: Vec<ScimUserRow> = sqlx::query_as(
        r#"SELECT c.*, sa.idp_user_id, sa.idp_groups, sa.idp_roles, sa.raw_attributes
           FROM customers c
           INNER JOIN sso_user_attributes sa ON sa.customer_id = c.id
           WHERE sa.sso_config_id = $1
           ORDER BY c.created_at DESC
           LIMIT 100"#
    )
    .bind(config_id)
    .fetch_all(&pool)
    .await?;

    let total = rows.len();
    let resources: Vec<serde_json::Value> = rows
        .iter()
        .map(|r| {
            let customer = scim_row_to_customer(r);
            let attrs = scim_row_to_attrs(r);
            scim_user_response(&customer, Some(&attrs))
        })
        .collect();

    Ok(Json(serde_json::json!({
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        "totalResults": total,
        "startIndex": 1,
        "itemsPerPage": total,
        "Resources": resources
    })))
}

// ── GET /scim/v2/Users/:id — Get user ──────────────────────

pub async fn scim_get_user(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    let customer_id = Uuid::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid user ID".into()))?;

    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let attrs: Option<SsoUserAttributesRow> = sqlx::query_as(
        "SELECT idp_user_id, idp_groups, idp_roles, raw_attributes FROM sso_user_attributes WHERE customer_id = $1 AND sso_config_id = $2"
    )
    .bind(customer_id)
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    Ok(Json(scim_user_response(&customer, attrs.as_ref())))
}

// ── POST /scim/v2/Users — Create user (provision) ──────────

pub async fn scim_create_user(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Json(body): Json<serde_json::Value>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    let email = body.get("userName")
        .or_else(|| body.get("emails").and_then(|e| e.as_array()?.first()?.get("value")))
        .and_then(|v| v.as_str())
        .ok_or(AppError::BadRequest("Missing userName or email".into()))?;

    let external_id = body.get("externalId").and_then(|v| v.as_str()).map(|s| s.to_string());
    let name = body.get("name").and_then(|n| n.get("formatted")).and_then(|v| v.as_str()).map(|s| s.to_string());
    let active = body.get("active").and_then(|v| v.as_bool()).unwrap_or(true);

    let idp_groups: Vec<String> = body.get("groups")
        .and_then(|g| g.as_array())
        .map(|arr| arr.iter().filter_map(|g| g.get("value")?.as_str().map(|s| s.to_string())).collect())
        .unwrap_or_default();

    // Get default role from SSO config
    let config = sqlx::query_as::<_, (Option<String>,)>(
        "SELECT default_role FROM sso_configs WHERE id = $1"
    )
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    let default_role = config.and_then(|(r,)| r).unwrap_or_else(|| "viewer".to_string());

    // Find or create customer
    let existing = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(&pool)
    .await?;

    let customer = if let Some(c) = existing {
        // Update existing
        sqlx::query(
            "UPDATE customers SET is_active = $1, name = COALESCE($2, name), updated_at = NOW() WHERE id = $3"
        )
        .bind(active)
        .bind(&name)
        .bind(c.id)
        .execute(&pool)
        .await?;
        c
    } else {
        // Create new
        let api_key = generate_api_key();
        let api_key_hash = hash_api_key(&api_key);
        let api_key_prefix = api_key[..15].to_string();

        sqlx::query_as::<_, Customer>(
            "INSERT INTO customers (email, api_key_hash, api_key_prefix, name, is_active, email_verified) VALUES ($1, $2, $3, $4, $5, true) RETURNING *"
        )
        .bind(email)
        .bind(&api_key_hash)
        .bind(&api_key_prefix)
        .bind(&name)
        .bind(active)
        .fetch_one(&pool)
        .await?
    };

    // Store SSO attributes
    let _ = store_sso_user_attributes(
        &pool,
        customer.id,
        config_id,
        external_id.as_deref(),
        &idp_groups,
        &[],
        &std::collections::HashMap::new(),
    ).await;

    // Auto-join to team if SSO config has a team
    let sso_team: Option<(Option<Uuid>, Option<String>)> = sqlx::query_as(
        "SELECT team_id, default_role FROM sso_configs WHERE id = $1"
    )
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    if let Some((Some(team_id), role_opt)) = sso_team {
        let role = role_opt.unwrap_or_else(|| "viewer".to_string());
        let _ = auto_join_team_direct(&pool, customer.id, team_id, &role).await;
    }

    // Log
    let _ = crate::audit::log_action(&pool, customer.id, "SCIM_CREATE_USER", "user",
        Some(&customer.id.to_string()),
        Some(serde_json::json!({"email": email, "active": active})),
        None, None).await;

    let attrs: Option<SsoUserAttributesRow> = sqlx::query_as(
        "SELECT idp_user_id, idp_groups, idp_roles, raw_attributes FROM sso_user_attributes WHERE customer_id = $1 AND sso_config_id = $2"
    )
    .bind(customer.id)
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(scim_user_response(&customer, attrs.as_ref()))))
}

// ── PUT /scim/v2/Users/:id — Update user ───────────────────

pub async fn scim_update_user(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    let customer_id = Uuid::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid user ID".into()))?;

    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let active = body.get("active").and_then(|v| v.as_bool());
    let name = body.get("name").and_then(|n| n.get("formatted")).and_then(|v| v.as_str()).map(|s| s.to_string());
    let external_id = body.get("externalId").and_then(|v| v.as_str()).map(|s| s.to_string());

    let idp_groups: Vec<String> = body.get("groups")
        .and_then(|g| g.as_array())
        .map(|arr| arr.iter().filter_map(|g| g.get("value")?.as_str().map(|s| s.to_string())).collect())
        .unwrap_or_default();

    // Update customer
    sqlx::query(
        "UPDATE customers SET is_active = COALESCE($1, is_active), name = COALESCE($2, name), updated_at = NOW() WHERE id = $3"
    )
    .bind(active)
    .bind(&name)
    .bind(customer_id)
    .execute(&pool)
    .await?;

    // Update SSO attributes
    let _ = store_sso_user_attributes(
        &pool,
        customer_id,
        config_id,
        external_id.as_deref(),
        &idp_groups,
        &[],
        &std::collections::HashMap::new(),
    ).await;

    // Log
    let _ = crate::audit::log_action(&pool, customer_id, "SCIM_UPDATE_USER", "user",
        Some(&customer_id.to_string()),
        Some(serde_json::json!({"active": active, "name": name})),
        None, None).await;

    let attrs: Option<SsoUserAttributesRow> = sqlx::query_as(
        "SELECT idp_user_id, idp_groups, idp_roles, raw_attributes FROM sso_user_attributes WHERE customer_id = $1 AND sso_config_id = $2"
    )
    .bind(customer_id)
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    let updated_customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(scim_user_response(&updated_customer, attrs.as_ref())))
}

// ── PATCH /scim/v2/Users/:id — Partial update ──────────────

pub async fn scim_patch_user(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    let customer_id = Uuid::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid user ID".into()))?;

    // Handle SCIM PATCH operations
    if let Some(operations) = body.get("Operations").and_then(|o| o.as_array()) {
        for op in operations {
            let op_type = op.get("op").and_then(|v| v.as_str()).unwrap_or("");
            let path = op.get("path").and_then(|v| v.as_str()).unwrap_or("");
            let value = op.get("value");

            match (op_type, path) {
                ("replace", "active") => {
                    if let Some(active) = value.and_then(|v| v.as_bool()) {
                        sqlx::query("UPDATE customers SET is_active = $1, updated_at = NOW() WHERE id = $2")
                            .bind(active)
                            .bind(customer_id)
                            .execute(&pool)
                            .await?;

                        let _ = crate::audit::log_action(&pool, customer_id, "SCIM_PATCH_USER", "user",
                            Some(&customer_id.to_string()),
                            Some(serde_json::json!({"field": "active", "value": active})),
                            None, None).await;
                    }
                }
                ("replace", "name.formatted") => {
                    if let Some(name) = value.and_then(|v| v.as_str()) {
                        sqlx::query("UPDATE customers SET name = $1, updated_at = NOW() WHERE id = $2")
                            .bind(name)
                            .bind(customer_id)
                            .execute(&pool)
                            .await?;
                    }
                }
                ("add", "groups") | ("replace", "groups") => {
                    if let Some(groups) = value.and_then(|v| v.as_array()) {
                        let group_list: Vec<String> = groups.iter()
                            .filter_map(|g| g.get("value")?.as_str().map(|s| s.to_string()))
                            .collect();

                        // Update groups in sso_user_attributes
                        sqlx::query(
                            "UPDATE sso_user_attributes SET idp_groups = $1, last_synced_at = NOW() WHERE customer_id = $2 AND sso_config_id = $3"
                        )
                        .bind(&group_list)
                        .bind(customer_id)
                        .bind(config_id)
                        .execute(&pool)
                        .await?;
                    }
                }
                ("remove", "groups") => {
                    if let Some(groups) = value.and_then(|v| v.as_array()) {
                        let group_list: Vec<String> = groups.iter()
                            .filter_map(|g| g.get("value")?.as_str().map(|s| s.to_string()))
                            .collect();

                        // Remove specific groups
                        let current: Option<(Option<Vec<String>>,)> = sqlx::query_as(
                            "SELECT idp_groups FROM sso_user_attributes WHERE customer_id = $1 AND sso_config_id = $2"
                        )
                        .bind(customer_id)
                        .bind(config_id)
                        .fetch_optional(&pool)
                        .await?;

                        if let Some((Some(mut existing),)) = current {
                            existing.retain(|g| !group_list.contains(g));
                            sqlx::query(
                                "UPDATE sso_user_attributes SET idp_groups = $1, last_synced_at = NOW() WHERE customer_id = $2 AND sso_config_id = $3"
                            )
                            .bind(&existing)
                            .bind(customer_id)
                            .bind(config_id)
                            .execute(&pool)
                            .await?;
                        }
                    }
                }
                _ => {
                    tracing::warn!("SCIM PATCH: unsupported operation '{}' on path '{}'", op_type, path);
                }
            }
        }
    }

    let customer = sqlx::query_as::<_, Customer>(
        "SELECT * FROM customers WHERE id = $1"
    )
    .bind(customer_id)
    .fetch_one(&pool)
    .await?;

    let attrs: Option<SsoUserAttributesRow> = sqlx::query_as(
        "SELECT idp_user_id, idp_groups, idp_roles, raw_attributes FROM sso_user_attributes WHERE customer_id = $1 AND sso_config_id = $2"
    )
    .bind(customer_id)
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    Ok(Json(scim_user_response(&customer, attrs.as_ref())))
}

// ── DELETE /scim/v2/Users/:id — Deactivate user ────────────

pub async fn scim_delete_user(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    let customer_id = Uuid::parse_str(&id)
        .map_err(|_| AppError::BadRequest("Invalid user ID".into()))?;

    // Soft delete — deactivate instead of hard delete
    sqlx::query("UPDATE customers SET is_active = false, updated_at = NOW() WHERE id = $1")
        .bind(customer_id)
        .execute(&pool)
        .await?;

    let _ = crate::audit::log_action(&pool, customer_id, "SCIM_DEACTIVATE_USER", "user",
        Some(&customer_id.to_string()),
        Some(serde_json::json!({"config_id": config_id})),
        None, None).await;

    tracing::info!("SCIM: deactivated user {}", customer_id);

    Ok(StatusCode::NO_CONTENT)
}

// ── GET /scim/v2/Groups — List groups (team-based) ─────────

pub async fn scim_list_groups(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    // Get the SSO config owner to find all their teams
    let owner_id: Option<(Uuid,)> = sqlx::query_as(
        "SELECT COALESCE(customer_id, created_by) FROM sso_configs WHERE id = $1"
    )
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    let owner_uuid = owner_id.map(|(id,)| id);

    let teams: Vec<(Uuid, String)> = if let Some(oid) = owner_uuid {
        // Return all teams where the owner is a member or owner
        sqlx::query_as(
            "SELECT DISTINCT t.id, t.name FROM teams t
             LEFT JOIN team_members tm ON tm.team_id = t.id
             WHERE t.owner_id = $1 OR tm.customer_id = $1
             ORDER BY t.name"
        )
        .bind(oid)
        .fetch_all(&pool)
        .await?
    } else {
        vec![]
    };

    let resources: Vec<serde_json::Value> = teams
        .iter()
        .map(|(id, name)| serde_json::json!({
            "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
            "id": id.to_string(),
            "displayName": name,
            "meta": {
                "resourceType": "Group",
                "location": format!("/v1/sso/scim/v2/Groups/{}", id)
            }
        }))
        .collect();

    Ok(Json(serde_json::json!({
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        "totalResults": resources.len(),
        "Resources": resources
    })))
}

// ── SCIM Service Provider Config ────────────────────────────

pub async fn scim_service_provider_config() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
        "patch": {"supported": true},
        "bulk": {"supported": false},
        "filter": {"supported": true, "maxResults": 100},
        "changePassword": {"supported": false},
        "sort": {"supported": false},
        "etag": {"supported": false},
        "authenticationSchemes": [{
            "type": "oauthbearertoken",
            "name": "OAuth Bearer Token",
            "description": "Authentication scheme using the OAuth Bearer Token Standard",
            "specUri": "https://www.rfc-editor.org/info/rfc6750",
            "primary": true
        }]
    }))
}

// ── SCIM Resource Types ─────────────────────────────────────

pub async fn scim_resource_types() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        "totalResults": 2,
        "Resources": [
            {
                "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
                "id": "User",
                "name": "User",
                "endpoint": "/scim/v2/Users",
                "schema": "urn:ietf:params:scim:schemas:core:2.0:User",
                "meta": {"resourceType": "ResourceType"}
            },
            {
                "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
                "id": "Group",
                "name": "Group",
                "endpoint": "/scim/v2/Groups",
                "schema": "urn:ietf:params:scim:schemas:core:2.0:Group",
                "meta": {"resourceType": "ResourceType"}
            }
        ]
    }))
}

// ── SCIM Schemas ────────────────────────────────────────────

pub async fn scim_schemas() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        "totalResults": 2,
        "Resources": [
            {
                "id": "urn:ietf:params:scim:schemas:core:2.0:User",
                "name": "User",
                "attributes": [
                    {"name": "id", "type": "string", "readOnly": true},
                    {"name": "externalId", "type": "string"},
                    {"name": "userName", "type": "string", "required": true},
                    {"name": "name", "type": "complex", "subAttributes": [
                        {"name": "formatted", "type": "string"},
                        {"name": "familyName", "type": "string"},
                        {"name": "givenName", "type": "string"}
                    ]},
                    {"name": "emails", "type": "complex", "multiValued": true, "subAttributes": [
                        {"name": "value", "type": "string"},
                        {"name": "type", "type": "string"},
                        {"name": "primary", "type": "boolean"}
                    ]},
                    {"name": "active", "type": "boolean"},
                    {"name": "groups", "type": "complex", "multiValued": true, "readOnly": true, "subAttributes": [
                        {"name": "value", "type": "string"},
                        {"name": "display", "type": "string"}
                    ]}
                ],
                "meta": {"resourceType": "Schema"}
            },
            {
                "id": "urn:ietf:params:scim:schemas:core:2.0:Group",
                "name": "Group",
                "attributes": [
                    {"name": "id", "type": "string", "readOnly": true},
                    {"name": "displayName", "type": "string"},
                    {"name": "members", "type": "complex", "multiValued": true, "subAttributes": [
                        {"name": "value", "type": "string"},
                        {"name": "$ref", "type": "reference"}
                    ]}
                ],
                "meta": {"resourceType": "Schema"}
            }
        ]
    }))
}
