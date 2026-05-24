use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{Team, TeamMember};

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_ROLES: &[&str] = &["admin", "developer", "analyst", "viewer"];

/// Role hierarchy: higher number = more permissions.
/// Owner is not a stored role — it's derived from teams.owner_id.
/// "member" is a legacy role treated as "viewer" for backward compatibility.
pub fn role_level(role: &str) -> u8 {
    match role {
        "admin" => 40,
        "developer" => 30,
        "analyst" => 20,
        "viewer" | "member" => 10,
        _ => 0,
    }
}

pub fn validate_role(role: &str) -> Result<(), AppError> {
    if VALID_ROLES.contains(&role) {
        Ok(())
    } else {
        Err(AppError::BadRequest("Invalid role. Must be one of: admin, developer, analyst, viewer".into()))
    }
}

/// Check that the user is a member of the team and return their role.
pub async fn require_team_member(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
) -> Result<TeamMember, AppError> {
    sqlx::query_as::<_, TeamMember>(
        "SELECT id, team_id, customer_id, role, invited_at, joined_at FROM team_members WHERE team_id = $1 AND customer_id = $2",
    )
    .bind(team_id)
    .bind(customer_id)
    .fetch_optional(pool)
    .await?
    .ok_or(AppError::Forbidden)
}

/// Check that the user meets the minimum role level (or is the team owner).
/// Hierarchy: owner > admin > developer > analyst > viewer
pub async fn require_role(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
    min_role: &str,
) -> Result<(), AppError> {
    let team = sqlx::query_as::<_, Team>("SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1")
        .bind(team_id)
        .fetch_optional(pool)
        .await?
        .ok_or(AppError::NotFound)?;

    // Owner always has full access
    if team.owner_id == customer_id {
        return Ok(());
    }

    let member = require_team_member(pool, team_id, customer_id).await?;
    if role_level(&member.role) >= role_level(min_role) {
        Ok(())
    } else {
        Err(AppError::Forbidden)
    }
}

/// Check that the user is an admin or owner of the team.
pub async fn require_team_admin(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
) -> Result<(), AppError> {
    require_role(pool, team_id, customer_id, "admin").await
}

/// Check that the user is at least a developer (can manage endpoints, webhooks, etc.)
pub async fn require_team_developer(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
) -> Result<(), AppError> {
    require_role(pool, team_id, customer_id, "developer").await
}

/// Check that the user is at least an analyst (can view dashboards, analytics)
pub async fn require_team_analyst(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
) -> Result<(), AppError> {
    require_role(pool, team_id, customer_id, "analyst").await
}

/// Check if user has at least `min_role` in ANY team they belong to.
/// Returns Ok(()) if user has the role in any team, or is a team owner.
/// Returns Ok(()) for personal accounts (no team membership).
/// Returns Err if user belongs to teams but has insufficient role in all of them.
pub async fn check_user_team_role(
    pool: &PgPool,
    customer_id: Uuid,
    min_role: &str,
) -> Result<(), AppError> {
    // Get all teams the user belongs to with their roles
    let memberships: Vec<(Uuid, String)> = sqlx::query_as(
        "SELECT team_id, role FROM team_members WHERE customer_id = $1",
    )
    .bind(customer_id)
    .fetch_all(pool)
    .await?;

    if memberships.is_empty() {
        return Ok(()); // Personal account, no team — allow
    }

    // Check if user has the required role in ANY team
    let min_level = role_level(min_role);
    for (_team_id, role) in &memberships {
        if role_level(role) >= min_level {
            return Ok(());
        }
    }

    // Also check if user is owner of any team (owner always has full access)
    let owned: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM teams WHERE owner_id = $1",
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await?;

    if owned.is_some() {
        return Ok(());
    }

    Err(AppError::Forbidden)
}

/// Check user's role in a SPECIFIC team (not any team).
/// This is the secure version — use this for team-scoped operations.
pub async fn check_user_team_role_for_team(
    pool: &PgPool,
    customer_id: Uuid,
    team_id: Uuid,
    min_role: &str,
) -> Result<(), AppError> {
    // Check if user is team owner (owner always has full access)
    let team: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM teams WHERE id = $1 AND owner_id = $2",
    )
    .bind(team_id)
    .bind(customer_id)
    .fetch_optional(pool)
    .await?;

    if team.is_some() {
        return Ok(());
    }

    // Check user's role in this specific team
    let member: Option<(String,)> = sqlx::query_as(
        "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2",
    )
    .bind(team_id)
    .bind(customer_id)
    .fetch_optional(pool)
    .await?;

    match member {
        Some((role,)) => {
            if role_level(&role) >= role_level(min_role) {
                Ok(())
            } else {
                Err(AppError::Forbidden)
            }
        }
        None => {
            // User is not a member of this team
            // Fall back to personal account check (no team = allow)
            let has_any_team: Option<(Uuid,)> = sqlx::query_as(
                "SELECT team_id FROM team_members WHERE customer_id = $1 LIMIT 1",
            )
            .bind(customer_id)
            .fetch_optional(pool)
            .await?;

            if has_any_team.is_none() {
                // Personal account, no team — allow
                Ok(())
            } else {
                Err(AppError::Forbidden)
            }
        }
    }
}

/// Get cached permissions or compute and cache them
/// Returns the user's role and permissions for a specific team
pub async fn get_cached_permissions(
    pool: &PgPool,
    customer_id: Uuid,
    team_id: Uuid,
) -> Result<(String, serde_json::Value), AppError> {
    // Try cache first
    let cached: Option<(String, serde_json::Value)> = sqlx::query_as(
        "SELECT role, permissions FROM permission_cache WHERE customer_id = $1 AND team_id = $2 AND expires_at > NOW()"
    )
    .bind(customer_id)
    .bind(team_id)
    .fetch_optional(pool)
    .await?;

    if let Some((role, perms)) = cached {
        return Ok((role, perms));
    }

    // Cache miss — compute permissions
    let role = get_user_role(pool, customer_id, team_id).await?;
    let permissions = compute_permissions(&role);

    // Cache for 5 minutes
    let _ = sqlx::query(
        r#"INSERT INTO permission_cache (customer_id, team_id, role, permissions, expires_at)
           VALUES ($1, $2, $3, $4, NOW() + INTERVAL '5 minutes')
           ON CONFLICT (customer_id, team_id) DO UPDATE SET
             role = EXCLUDED.role,
             permissions = EXCLUDED.permissions,
             cached_at = NOW(),
             expires_at = NOW() + INTERVAL '5 minutes'"#
    )
    .bind(customer_id)
    .bind(team_id)
    .bind(&role)
    .bind(&permissions)
    .execute(pool)
    .await?;

    Ok((role, permissions))
}

/// Get user's role in a specific team
async fn get_user_role(
    pool: &PgPool,
    customer_id: Uuid,
    team_id: Uuid,
) -> Result<String, AppError> {
    // Check if owner
    let is_owner: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM teams WHERE id = $1 AND owner_id = $2"
    )
    .bind(team_id)
    .bind(customer_id)
    .fetch_optional(pool)
    .await?;

    if is_owner.is_some() {
        return Ok("owner".to_string());
    }

    // Get role from team_members
    let member: Option<(String,)> = sqlx::query_as(
        "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
    )
    .bind(team_id)
    .bind(customer_id)
    .fetch_optional(pool)
    .await?;

    match member {
        Some((role,)) => Ok(role),
        None => Ok("viewer".to_string()), // Default for personal accounts
    }
}

/// Compute permissions based on role
fn compute_permissions(role: &str) -> serde_json::Value {
    match role {
        "owner" | "admin" => serde_json::json!({
            "can_manage_team": true,
            "can_manage_webhooks": true,
            "can_manage_api_keys": true,
            "can_manage_integrations": true,
            "can_manage_alerts": true,
            "can_manage_billing": true,
            "can_manage_domains": true,
            "can_manage_applications": true,
            "can_manage_operational_webhooks": true,
            "can_manage_background_tasks": true,
            "can_manage_routing": true,
            "can_manage_rate_limits": true,
            "can_view_observability": true,
            "can_view_devtools": true,
            "can_manage_settings": true,
        }),
        "developer" => serde_json::json!({
            "can_manage_team": false,
            "can_manage_webhooks": false,
            "can_manage_api_keys": false,
            "can_manage_integrations": false,
            "can_manage_alerts": false,
            "can_manage_billing": false,
            "can_manage_domains": false,
            "can_manage_applications": false,
            "can_manage_operational_webhooks": false,
            "can_manage_background_tasks": false,
            "can_manage_routing": false,
            "can_manage_rate_limits": false,
            "can_view_observability": true,
            "can_view_devtools": true,
            "can_manage_settings": true,
        }),
        "analyst" => serde_json::json!({
            "can_manage_team": false,
            "can_manage_webhooks": false,
            "can_manage_api_keys": false,
            "can_manage_integrations": false,
            "can_manage_alerts": false,
            "can_manage_billing": false,
            "can_manage_domains": false,
            "can_manage_applications": false,
            "can_manage_operational_webhooks": false,
            "can_manage_background_tasks": false,
            "can_manage_routing": false,
            "can_manage_rate_limits": false,
            "can_view_observability": true,
            "can_view_devtools": false,
            "can_manage_settings": true,
        }),
        _ => serde_json::json!({
            "can_manage_team": false,
            "can_manage_webhooks": false,
            "can_manage_api_keys": false,
            "can_manage_integrations": false,
            "can_manage_alerts": false,
            "can_manage_billing": false,
            "can_manage_domains": false,
            "can_manage_applications": false,
            "can_manage_operational_webhooks": false,
            "can_manage_background_tasks": false,
            "can_manage_routing": false,
            "can_manage_rate_limits": false,
            "can_view_observability": false,
            "can_view_devtools": false,
            "can_manage_settings": true,
        }),
    }
}

/// Invalidate permission cache for a user
pub async fn invalidate_permission_cache(
    pool: &PgPool,
    customer_id: Uuid,
    team_id: Option<Uuid>,
) -> Result<(), AppError> {
    if let Some(tid) = team_id {
        sqlx::query("DELETE FROM permission_cache WHERE customer_id = $1 AND team_id = $2")
            .bind(customer_id)
            .bind(tid)
            .execute(pool)
            .await?;
    } else {
        sqlx::query("DELETE FROM permission_cache WHERE customer_id = $1")
            .bind(customer_id)
            .execute(pool)
            .await?;
    }
    Ok(())
}

/// Check rate limit for user's role
pub async fn check_role_rate_limit(
    pool: &PgPool,
    customer_id: Uuid,
    team_id: Uuid,
    rate_limiter: &crate::rate_limit::RateLimiter,
) -> Result<(), AppError> {
    let role = get_user_role(pool, customer_id, team_id).await?;
    
    let limits: Option<(i32, i32, i32)> = sqlx::query_as(
        "SELECT requests_per_minute, requests_per_hour, burst_size FROM role_rate_limits WHERE team_id = $1 AND role = $2"
    )
    .bind(team_id)
    .bind(&role)
    .fetch_optional(pool)
    .await?;

    if let Some((per_min, _per_hour, _burst)) = limits {
        let key = format!("rbac:{}:{}", team_id, customer_id);
        let result = rate_limiter.check_with_headers(&key, per_min as u32).await;
        if !result.allowed {
            tracing::warn!("⚠️ Rate limit exceeded for {} (role: {}): {}/min", customer_id, role, per_min);
            return Err(AppError::RateLimitExceeded);
        }
        tracing::debug!("Rate limit check for {} (role: {}): {}/min OK", customer_id, role, per_min);
    }

    Ok(())
}

/// Log RBAC action to audit trail
pub async fn log_rbac_action(
    pool: &PgPool,
    actor_id: Uuid,
    target_id: Option<Uuid>,
    team_id: Option<Uuid>,
    action: &str,
    old_value: Option<serde_json::Value>,
    new_value: Option<serde_json::Value>,
    ip_address: Option<&str>,
    user_agent: Option<&str>,
) -> Result<(), AppError> {
    sqlx::query(
        r#"INSERT INTO rbac_audit_log (actor_id, target_id, team_id, action, old_value, new_value, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7::inet, $8)"#
    )
    .bind(actor_id)
    .bind(target_id)
    .bind(team_id)
    .bind(action)
    .bind(old_value.unwrap_or_default())
    .bind(new_value.unwrap_or_default())
    .bind(ip_address)
    .bind(user_agent)
    .execute(pool)
    .await?;

    Ok(())
}

