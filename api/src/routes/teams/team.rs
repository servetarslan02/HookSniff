//! Team CRUD handlers: create, list, get, update, delete.

use axum::extract::{Extension, Path};
use axum::Json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{Team, TeamResponse, TeamDetailResponse, MemberResponse, InviteResponse, CreateTeamRequest};
use super::rbac::require_team_member;

/// POST /v1/teams — Create team
pub async fn create_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateTeamRequest>,
) -> Result<Json<Team>, AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::coded(ErrorCode::TeamNameRequired));
    }

    let mut tx = pool.begin().await?;

    let team =
        sqlx::query_as::<_, Team>("INSERT INTO teams (name, owner_id) VALUES ($1, $2) RETURNING *")
            .bind(&req.name)
            .bind(customer.id)
            .fetch_one(&mut *tx)
            .await?;

    // Add owner as admin member
    sqlx::query(
        "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, 'admin', NOW())",
    )
    .bind(team.id)
    .bind(customer.id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

 tracing::info!(" Team '{}' created by {}", req.name, customer.id);
    Ok(Json(team))
}

/// GET /v1/teams — List user's teams
pub async fn list_teams(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<TeamResponse>>, AppError> {
    let teams = sqlx::query_as::<_, (Uuid, String, Uuid, i64, chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>(
        r#"SELECT t.id, t.name, t.owner_id,
                  COUNT(tm2.customer_id) OVER (PARTITION BY t.id) AS member_count,
                  t.created_at, t.updated_at
           FROM teams t
           INNER JOIN team_members tm ON tm.team_id = t.id AND tm.customer_id = $1
           LEFT JOIN team_members tm2 ON tm2.team_id = t.id
           ORDER BY t.updated_at DESC
           LIMIT 100"#,
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    // Deduplicate (LEFT JOIN can multiply rows)
    let mut seen = std::collections::HashSet::new();
    let mut result = Vec::with_capacity(teams.len());
    for (id, name, owner_id, member_count, created_at, updated_at) in teams {
        if seen.insert(id) {
            result.push(TeamResponse {
                id,
                name,
                owner_id,
                member_count,
                created_at,
                updated_at,
            });
        }
    }

    Ok(Json(result))
}

/// GET /v1/teams/:id — Team detail with members and pending invites
pub async fn get_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<TeamDetailResponse>, AppError> {
    require_team_member(&pool, id, customer.id).await?;

    let team = sqlx::query_as::<_, Team>("SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    // Members with email and name
    let members = sqlx::query_as::<_, MemberResponse>(
        r#"SELECT tm.id, tm.customer_id, c.email, c.name, tm.role, tm.invited_at, tm.joined_at
           FROM team_members tm
           INNER JOIN customers c ON c.id = tm.customer_id
           WHERE tm.team_id = $1
           ORDER BY tm.invited_at ASC LIMIT 500"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    // Pending invites
    let invites = sqlx::query_as::<_, InviteResponse>(
        r#"SELECT id, email, role, expires_at, created_at
           FROM team_invites
           WHERE team_id = $1 AND expires_at > NOW()
           ORDER BY created_at DESC
           LIMIT 100"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(TeamDetailResponse {
        id: team.id,
        name: team.name,
        owner_id: team.owner_id,
        members,
        invites,
        created_at: team.created_at,
        updated_at: team.updated_at,
    }))
}

#[derive(Debug, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateTeamRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}

/// PATCH /v1/teams/:id — Update team name/description (admin only)
pub async fn update_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateTeamRequest>,
) -> Result<Json<Team>, AppError> {
    super::rbac::require_team_admin(&pool, id, customer.id).await?;

    let team = sqlx::query_as::<_, Team>(
        "SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let new_name = req.name.as_deref().unwrap_or(&team.name);
    if new_name.trim().is_empty() {
        return Err(AppError::coded(ErrorCode::TeamNameRequired));
    }

    let updated = sqlx::query_as::<_, Team>(
        "UPDATE teams SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
    )
    .bind(new_name.trim())
    .bind(id)
    .fetch_one(&pool)
    .await?;

 tracing::info!(" Team '{}' ({}) updated by {}", new_name, id, customer.id);

    let _ = crate::audit::log_action(&pool, customer.id, "TEAM_UPDATE", "team", Some(&id.to_string()),
        Some(serde_json::json!({"name": new_name})), None, None).await;

    Ok(Json(updated))
}

/// DELETE /v1/teams/:id — Delete team (owner only)
pub async fn delete_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let team = sqlx::query_as::<_, Team>(
        "SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Only owner can delete
    if team.owner_id != customer.id {
        return Err(AppError::Forbidden);
    }

    // Check if SSO config references this team as default
    let sso_refs: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM sso_configs WHERE default_team_id = $1"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    if sso_refs.0 > 0 {
        return Err(AppError::BadRequest(
            "This team is used as the default SSO auto-join team. Remove the SSO reference first.".into()
        ));
    }

    // Delete team (CASCADE will remove members and invites)
    sqlx::query("DELETE FROM teams WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

 tracing::info!(" Team '{}' ({}) deleted by {}", team.name, id, customer.id);

    let _ = crate::audit::log_action(&pool, customer.id, "TEAM_DELETE", "team", Some(&id.to_string()),
        Some(serde_json::json!({"team_name": &team.name})), None, None).await;

    Ok(Json(serde_json::json!({"deleted": true})))
}

/// POST /v1/teams/:id/leave — Leave team (non-owner only)
pub async fn leave_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let team = sqlx::query_as::<_, Team>(
        "SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Owner cannot leave — must transfer ownership first
    if team.owner_id == customer.id {
        return Err(AppError::BadRequest(
            "Team owner cannot leave. Transfer ownership first.".into()
        ));
    }

    let result = sqlx::query(
        "DELETE FROM team_members WHERE team_id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

 tracing::info!(" {} left team {}", customer.id, id);

    let _ = crate::audit::log_action(&pool, customer.id, "MEMBER_LEAVE", "team", Some(&id.to_string()),
        None, None, None).await;

    Ok(Json(serde_json::json!({"left": true})))
}

#[derive(Debug, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TransferOwnershipRequest {
    pub new_owner_id: Uuid,
}

/// POST /v1/teams/:id/transfer — Transfer team ownership (owner only)
pub async fn transfer_ownership(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<TransferOwnershipRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let team = sqlx::query_as::<_, Team>(
        "SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Only owner can transfer
    if team.owner_id != customer.id {
        return Err(AppError::Forbidden);
    }

    // New owner must be a team member
    let new_owner_member = require_team_member(&pool, id, req.new_owner_id).await?;

    // Update team owner
    sqlx::query("UPDATE teams SET owner_id = $1, updated_at = NOW() WHERE id = $2")
        .bind(req.new_owner_id)
        .bind(id)
        .execute(&pool)
        .await?;

    // Promote new owner to admin if not already
    if new_owner_member.role != "admin" {
        sqlx::query("UPDATE team_members SET role = 'admin' WHERE team_id = $1 AND customer_id = $2")
            .bind(id)
            .bind(req.new_owner_id)
            .execute(&pool)
            .await?;
    }

    // Demote old owner to developer (they're no longer the owner)
    sqlx::query("UPDATE team_members SET role = 'developer' WHERE team_id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

 tracing::info!(" Team '{}' ownership transferred from {} to {}", team.name, customer.id, req.new_owner_id);

    // Notify the new owner
    {
        let pool_clone = pool.clone();
        let team_name = team.name.clone();
        let new_owner = req.new_owner_id;
        let old_owner_name = customer.name.clone().unwrap_or_else(|| customer.email.clone());
        tokio::spawn(async move {
            crate::notifications::helpers::ownership_transferred(&pool_clone, new_owner, &team_name, &old_owner_name).await;
        });
    }

    let _ = crate::audit::log_action(&pool, customer.id, "TEAM_TRANSFER", "team", Some(&id.to_string()),
        Some(serde_json::json!({"new_owner": req.new_owner_id.to_string()})), None, None).await;

    Ok(Json(serde_json::json!({
        "transferred": true,
        "new_owner_id": req.new_owner_id,
        "message": "Ownership transferred successfully"
    })))
}
