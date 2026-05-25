use axum::{
    extract::Extension,
    http::{HeaderMap, StatusCode},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;

use super::validate_scim_token;

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
