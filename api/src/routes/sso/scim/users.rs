use axum::{
    extract::{Extension, Path, Query},
    http::{HeaderMap, StatusCode},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, ErrorCode};
use crate::middleware::{generate_api_key, hash_api_key};
use crate::models::customer::Customer;

use super::{
    auto_join_team_direct, scim_row_to_attrs, scim_row_to_customer, scim_user_response,
    store_sso_user_attributes, validate_scim_token, ScimUserRow, SsoUserAttributesRow,
};

// ── GET /scim/v2/Users — List users ────────────────────────

pub async fn scim_list_users(
    Extension(pool): Extension<PgPool>,
    headers: HeaderMap,
    Query(_query): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, AppError> {
    let config_id = validate_scim_token(&pool, &headers).await?;

    // Get customer_id from config to scope results
    let owner_id: Option<(Uuid,)> = sqlx::query_as(
        "SELECT customer_id FROM sso_configs WHERE id = $1"
    )
    .bind(config_id)
    .fetch_optional(&pool)
    .await?;

    let _owner_id = match owner_id {
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
        .map_err(|_| AppError::coded(ErrorCode::InvalidUserId))?;

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

    let _default_role = config.and_then(|(r,)| r).unwrap_or_else(|| "viewer".to_string());

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
        .map_err(|_| AppError::coded(ErrorCode::InvalidUserId))?;

    let _customer = sqlx::query_as::<_, Customer>(
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
        .map_err(|_| AppError::coded(ErrorCode::InvalidUserId))?;

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
        .map_err(|_| AppError::coded(ErrorCode::InvalidUserId))?;

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
