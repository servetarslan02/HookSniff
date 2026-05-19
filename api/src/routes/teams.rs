use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_teams).post(create_team))
        .route("/accept-invite", post(accept_invite))
        .route("/invites/{invite_id}", delete(revoke_invite).post(resend_invite))
        .route("/{id}", get(get_team).delete(delete_team).patch(update_team))
        .route("/{id}/leave", post(leave_team))
        .route("/{id}/transfer", post(transfer_ownership))
        .route("/{id}/invite", post(invite_member))
        .route("/{id}/members", get(list_members))
        .route("/{id}/members/{uid}", delete(remove_member))
        .route("/{id}/members/{uid}/role", put(change_role))
}

// ── Models ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct Team {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct TeamMember {
    pub id: Uuid,
    pub team_id: Uuid,
    pub customer_id: Uuid,
    pub role: String,
    pub invited_at: DateTime<Utc>,
    pub joined_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct TeamInvite {
    pub id: Uuid,
    pub team_id: Uuid,
    pub email: String,
    pub role: String,
    pub token: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateTeamRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct InviteRequest {
    pub email: String,
    pub role: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChangeRoleRequest {
    pub role: String,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AcceptInviteRequest {
    pub token: String,
}

#[derive(Debug, Serialize)]
pub struct TeamResponse {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,
    pub member_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct TeamDetailResponse {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,
    pub members: Vec<MemberResponse>,
    pub invites: Vec<InviteResponse>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MemberResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub role: String,
    pub invited_at: DateTime<Utc>,
    pub joined_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct InviteResponse {
    pub id: Uuid,
    pub email: String,
    pub role: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_ROLES: &[&str] = &["admin", "editor", "viewer"];

fn validate_role(role: &str) -> Result<(), AppError> {
    if VALID_ROLES.contains(&role) {
        Ok(())
    } else {
        Err(AppError::BadRequest("Invalid role".into()))
    }
}

/// Check that the user is a member of the team and return their role.
async fn require_team_member(
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
    .ok_or(AppError::Forbidden("Not a member of this team".into()))
}

/// Check that the user is an admin or owner of the team.
async fn require_team_admin(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
) -> Result<(), AppError> {
    let team = sqlx::query_as::<_, Team>("SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1")
        .bind(team_id)
        .fetch_optional(pool)
        .await?
        .ok_or(AppError::NotFound)?;

    if team.owner_id == customer_id {
        return Ok(());
    }

    let member = require_team_member(pool, team_id, customer_id).await?;
    if member.role == "admin" {
        Ok(())
    } else {
        Err(AppError::Forbidden(
            "Admin role required for this action".into(),
        ))
    }
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// POST /v1/teams — Create team
async fn create_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateTeamRequest>,
) -> Result<Json<Team>, AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::BadRequest("Team name cannot be empty".into()));
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

    tracing::info!("✅ Team '{}' created by {}", req.name, customer.id);
    Ok(Json(team))
}

/// GET /v1/teams — List user's teams
async fn list_teams(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<TeamResponse>>, AppError> {
    let teams = sqlx::query_as::<_, Team>(
        r#"SELECT t.* FROM teams t
           INNER JOIN team_members tm ON tm.team_id = t.id
           WHERE tm.customer_id = $1
           ORDER BY t.updated_at DESC LIMIT 100"#,
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let mut result = Vec::with_capacity(teams.len());
    for team in teams {
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM team_members WHERE team_id = $1")
            .bind(team.id)
            .fetch_one(&pool)
            .await?;

        result.push(TeamResponse {
            id: team.id,
            name: team.name,
            owner_id: team.owner_id,
            member_count: count.0,
            created_at: team.created_at,
            updated_at: team.updated_at,
        });
    }

    Ok(Json(result))
}

/// GET /v1/teams/:id — Team detail with members and pending invites
async fn get_team(
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

/// POST /v1/teams/:id/invite — Invite by email
async fn invite_member(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<InviteRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_team_admin(&pool, id, customer.id).await?;

    if !req.email.contains('@') {
        return Err(AppError::BadRequest("Invalid email".into()));
    }

    let role = req.role.as_deref().unwrap_or("viewer");
    validate_role(role)?;

    // Plan-based team member limit check
    let plan = Plan::parse_str(&customer.plan);
    let max_members = plan.max_team_members();

    let member_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM team_members WHERE team_id = $1",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    if member_count.0 as u32 >= max_members {
        return Err(AppError::BadRequest(format!(
            "Team member limit reached ({max_members}). Upgrade your plan for more members."
        )));
    }

    // Check if user is already a member
    let existing_customer: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM customers WHERE email = $1")
            .bind(&req.email)
            .fetch_optional(&pool)
            .await?;

    if let Some((cust_id,)) = existing_customer.as_ref() {
        let already_member: Option<(Uuid,)> =
            sqlx::query_as("SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2")
                .bind(id)
                .bind(cust_id)
                .fetch_optional(&pool)
                .await?;

        if already_member.is_some() {
            return Err(AppError::BadRequest(
                "User is already a member of this team".into(),
            ));
        }
    }

    // Check for existing pending invite
    let pending: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM team_invites WHERE team_id = $1 AND email = $2 AND expires_at > NOW()",
    )
    .bind(id)
    .bind(&req.email)
    .fetch_optional(&pool)
    .await?;

    if pending.is_some() {
        return Err(AppError::BadRequest(
            "An active invite already exists for this email".into(),
        ));
    }

    let token = format!("inv_{}", Uuid::new_v4().to_string().replace('-', ""));
    let expires_at = chrono::Utc::now() + chrono::Duration::days(7);

    let invite = sqlx::query_as::<_, TeamInvite>(
        "INSERT INTO team_invites (team_id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    )
    .bind(id)
    .bind(&req.email)
    .bind(role)
    .bind(&token)
    .bind(expires_at)
    .fetch_one(&pool)
    .await?;

    tracing::info!("✅ Invite sent to {} for team {}", req.email, id);

    // Audit log — MEMBER_INVITE
    {
        let tid = id.to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "MEMBER_INVITE", "team", Some(&tid),
            Some(serde_json::json!({"email": &req.email, "role": role})), None, None).await;
    }

    // Send in-app notification to the invited user (if registered)
    if let Some((invited_customer_id,)) = existing_customer {
        let team_name: Option<(String,)> =
            sqlx::query_as("SELECT name FROM teams WHERE id = $1")
                .bind(id)
                .fetch_optional(&pool)
                .await
                .unwrap_or(None);

        let team_name_str = team_name.map(|(n,)| n).unwrap_or_else(|| "a team".to_string());
        let inviter_name = customer.name.clone().unwrap_or_else(|| customer.email.clone());

        let invite_link = format!("/organization?invite_token={}", token);

        let _ = sqlx::query(
            r#"INSERT INTO notifications (customer_id, type, title, message, link)
               VALUES ($1, 'team_invite', $2, $3, $4)"#,
        )
        .bind(invited_customer_id)
        .bind(format!("{} seni {} ekibine davet etti", inviter_name, team_name_str))
        .bind(format!("Rol: {}. Daveti kabul etmek için tıklayın.", role))
        .bind(&invite_link)
        .execute(&pool)
        .await;
    }

    // Build invite link for frontend
    let invite_link = format!("/organization?invite_token={}", token);

    Ok(Json(serde_json::json!({
        "id": invite.id,
        "email": invite.email,
        "role": invite.role,
        "expires_at": invite.expires_at,
        "invite_link": invite_link,
        "message": "Invitation sent successfully"
    })))
}

/// POST /v1/teams/accept-invite — Accept a team invitation
async fn accept_invite(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<AcceptInviteRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Find the invite by token — also check expiry in query for safety
    let invite = sqlx::query_as::<_, TeamInvite>(
        "SELECT id, team_id, email, role, token, expires_at, created_at FROM team_invites WHERE token = $1 AND expires_at > NOW()",
    )
    .bind(&req.token)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check email matches
    if invite.email != customer.email {
        return Err(AppError::Forbidden(
            "This invitation was sent to a different email address".into(),
        ));
    }

    // Check not already a member
    let already_member: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2")
            .bind(invite.team_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?;

    if already_member.is_some() {
        // Delete the invite since they're already in
        let _ = sqlx::query("DELETE FROM team_invites WHERE id = $1")
            .bind(invite.id)
            .execute(&pool)
            .await;
        return Err(AppError::BadRequest(
            "You are already a member of this team".into(),
        ));
    }

    // Add as team member
    sqlx::query(
        "INSERT INTO team_members (team_id, customer_id, role, joined_at) VALUES ($1, $2, $3, NOW())",
    )
    .bind(invite.team_id)
    .bind(customer.id)
    .bind(&invite.role)
    .execute(&pool)
    .await?;

    // Delete the invite
    sqlx::query("DELETE FROM team_invites WHERE id = $1")
        .bind(invite.id)
        .execute(&pool)
        .await?;

    // Mark related notifications as read
    let _ = sqlx::query(
        r#"UPDATE notifications SET is_read = TRUE
           WHERE customer_id = $1 AND type = 'team_invite' AND is_read = FALSE"#,
    )
    .bind(customer.id)
    .execute(&pool)
    .await;

    tracing::info!(
        "✅ {} accepted invite to team {}",
        customer.id,
        invite.team_id
    );

    // Notify team owner about the new member
    {
        let pool_clone = pool.clone();
        let team_id = invite.team_id;
        let member_name = customer.name.clone().unwrap_or_else(|| customer.email.clone());
        let member_id = customer.id;
        tokio::spawn(async move {
            // Get team info
            if let Ok(Some((team_name, owner_id))) = sqlx::query_as::<_, (String, uuid::Uuid)>(
                "SELECT name, owner_id FROM teams WHERE id = $1"
            )
            .bind(team_id)
            .fetch_optional(&pool_clone)
            .await
            {
                // Don't notify if the new member is the owner themselves
                if owner_id != member_id {
                    crate::notifications::helpers::member_joined(&pool_clone, owner_id, &member_name, &team_name).await;
                }
            }
        });
    }

    // Audit log
    {
        let tid = invite.team_id.to_string();
        let _ = crate::audit::log_action(
            &pool, customer.id, "MEMBER_JOIN", "team", Some(&tid),
            Some(serde_json::json!({"role": &invite.role})), None, None,
        ).await;
    }

    Ok(Json(serde_json::json!({
        "team_id": invite.team_id,
        "role": invite.role,
        "message": "Successfully joined the team"
    })))
}

/// DELETE /v1/teams/invites/:invite_id — Revoke a pending invite
async fn revoke_invite(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(invite_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Find the invite
    let invite = sqlx::query_as::<_, TeamInvite>(
        "SELECT id, team_id, email, role, token, expires_at, created_at FROM team_invites WHERE id = $1"
    )
    .bind(invite_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check that the user is admin of the team
    require_team_admin(&pool, invite.team_id, customer.id).await?;

    // Delete the invite
    sqlx::query("DELETE FROM team_invites WHERE id = $1")
        .bind(invite_id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ Invite {} revoked by {}", invite_id, customer.id);

    let _ = crate::audit::log_action(&pool, customer.id, "INVITE_REVOKE", "team",
        Some(&invite.team_id.to_string()),
        Some(serde_json::json!({"email": &invite.email})), None, None).await;

    Ok(Json(serde_json::json!({"revoked": true})))
}

/// POST /v1/teams/invites/:invite_id/resend — Resend a pending invite (extends expiry)
async fn resend_invite(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(invite_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Find the invite
    let invite = sqlx::query_as::<_, TeamInvite>(
        "SELECT id, team_id, email, role, token, expires_at, created_at FROM team_invites WHERE id = $1"
    )
    .bind(invite_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check that the user is admin of the team
    require_team_admin(&pool, invite.team_id, customer.id).await?;

    // Extend expiry by 7 days
    let new_expires_at = Utc::now() + chrono::Duration::days(7);
    sqlx::query("UPDATE team_invites SET expires_at = $1 WHERE id = $2")
        .bind(new_expires_at)
        .bind(invite_id)
        .execute(&pool)
        .await?;

    let invite_link = format!("/organization?invite_token={}", invite.token);

    tracing::info!("✅ Invite {} resent by {} (expires: {})", invite_id, customer.id, new_expires_at);

    let _ = crate::audit::log_action(&pool, customer.id, "INVITE_RESEND", "team",
        Some(&invite.team_id.to_string()),
        Some(serde_json::json!({"email": &invite.email})), None, None).await;

    Ok(Json(serde_json::json!({
        "id": invite.id,
        "email": invite.email,
        "role": invite.role,
        "expires_at": new_expires_at,
        "invite_link": invite_link,
        "message": "Invitation resent successfully"
    })))
}

/// GET /v1/teams/:id/members — List members
async fn list_members(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<MemberResponse>>, AppError> {
    require_team_member(&pool, id, customer.id).await?;

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

    Ok(Json(members))
}

/// DELETE /v1/teams/:id/members/:uid — Remove member
async fn remove_member(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((team_id, uid)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_team_admin(&pool, team_id, customer.id).await?;

    // Cannot remove the owner
    let team = sqlx::query_as::<_, Team>("SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1")
        .bind(team_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    if uid == team.owner_id {
        return Err(AppError::BadRequest("Cannot remove the team owner".into()));
    }

    let result = sqlx::query("DELETE FROM team_members WHERE team_id = $1 AND customer_id = $2")
        .bind(team_id)
        .bind(uid)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✅ Member {} removed from team {}", uid, team_id);

    // Notify the removed member
    {
        let pool_clone = pool.clone();
        let team_name = team.name.clone();
        let removed_id = uid;
        tokio::spawn(async move {
            // Get removed user's name
            let member_name: String = sqlx::query_scalar("SELECT COALESCE(name, email) FROM customers WHERE id = $1")
                .bind(removed_id)
                .fetch_optional(&pool_clone)
                .await
                .ok()
                .flatten()
                .unwrap_or_else(|| "Bir üye".to_string());
            crate::notifications::helpers::member_removed(&pool_clone, removed_id, &member_name, &team_name).await;
        });
    }

    // Audit log — MEMBER_REMOVE
    {
        let tid = team_id.to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "MEMBER_REMOVE", "team", Some(&tid),
            Some(serde_json::json!({"removed_user_id": uid.to_string()})), None, None).await;
    }

    Ok(Json(serde_json::json!({"removed": true})))
}

/// PUT /v1/teams/:id/members/:uid/role — Change role
async fn change_role(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((team_id, uid)): Path<(Uuid, Uuid)>,
    Json(req): Json<ChangeRoleRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_team_admin(&pool, team_id, customer.id).await?;
    validate_role(&req.role)?;

    // Cannot change owner's role
    let team = sqlx::query_as::<_, Team>("SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1")
        .bind(team_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    if uid == team.owner_id {
        return Err(AppError::BadRequest(
            "Cannot change the team owner's role".into(),
        ));
    }

    let result =
        sqlx::query("UPDATE team_members SET role = $1 WHERE team_id = $2 AND customer_id = $3")
            .bind(&req.role)
            .bind(team_id)
            .bind(uid)
            .execute(&pool)
            .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!(
        "✅ Role changed to '{}' for member {} in team {}",
        req.role,
        uid,
        team_id
    );

    // Audit log — ROLE_CHANGE
    {
        let tid = team_id.to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "ROLE_CHANGE", "team", Some(&tid),
            Some(serde_json::json!({"user_id": uid.to_string(), "new_role": &req.role})), None, None).await;
    }

    Ok(Json(serde_json::json!({
        "role": req.role,
        "message": "Role updated successfully"
    })))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateTeamRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}

/// PATCH /v1/teams/:id — Update team name/description (admin only)
async fn update_team(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateTeamRequest>,
) -> Result<Json<Team>, AppError> {
    require_team_admin(&pool, id, customer.id).await?;

    let team = sqlx::query_as::<_, Team>(
        "SELECT id, name, owner_id, created_at, updated_at FROM teams WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let new_name = req.name.as_deref().unwrap_or(&team.name);
    if new_name.trim().is_empty() {
        return Err(AppError::BadRequest("Team name cannot be empty".into()));
    }

    // Check if description column exists (it might not in older schemas)
    let updated = sqlx::query_as::<_, Team>(
        "UPDATE teams SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
    )
    .bind(new_name.trim())
    .bind(id)
    .fetch_one(&pool)
    .await?;

    tracing::info!("✅ Team '{}' ({}) updated by {}", new_name, id, customer.id);

    let _ = crate::audit::log_action(&pool, customer.id, "TEAM_UPDATE", "team", Some(&id.to_string()),
        Some(serde_json::json!({"name": new_name})), None, None).await;

    Ok(Json(updated))
}

/// DELETE /v1/teams/:id — Delete team (owner only)
async fn delete_team(
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
        return Err(AppError::Forbidden("Only the team owner can delete the team".into()));
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

    tracing::info!("✅ Team '{}' ({}) deleted by {}", team.name, id, customer.id);

    let _ = crate::audit::log_action(&pool, customer.id, "TEAM_DELETE", "team", Some(&id.to_string()),
        Some(serde_json::json!({"team_name": &team.name})), None, None).await;

    Ok(Json(serde_json::json!({"deleted": true})))
}

/// POST /v1/teams/:id/leave — Leave team (non-owner only)
async fn leave_team(
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

    tracing::info!("✅ {} left team {}", customer.id, id);

    let _ = crate::audit::log_action(&pool, customer.id, "MEMBER_LEAVE", "team", Some(&id.to_string()),
        None, None, None).await;

    Ok(Json(serde_json::json!({"left": true})))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TransferOwnershipRequest {
    pub new_owner_id: Uuid,
}

/// POST /v1/teams/:id/transfer — Transfer team ownership (owner only)
async fn transfer_ownership(
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
        return Err(AppError::Forbidden("Only the team owner can transfer ownership".into()));
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

    // Demote old owner to editor (they're no longer the owner)
    sqlx::query("UPDATE team_members SET role = 'editor' WHERE team_id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    tracing::info!("✅ Team '{}' ownership transferred from {} to {}", team.name, customer.id, req.new_owner_id);

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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    // ── Team ────────────────────────────────────────────────

    #[test]
    fn test_team_construction_and_serialization() {
        let team = Team {
            id: Uuid::new_v4(),
            name: "Engineering".to_string(),
            owner_id: Uuid::new_v4(),
            created_at: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap(),
            updated_at: Utc.with_ymd_and_hms(2024, 6, 1, 12, 0, 0).unwrap(),
        };
        let json = serde_json::to_value(&team).unwrap();
        assert_eq!(json["name"], "Engineering");
        assert!(json.get("id").is_some());
    }

    #[test]
    fn test_team_clone() {
        let team = Team {
            id: Uuid::new_v4(),
            name: "Test".to_string(),
            owner_id: Uuid::new_v4(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let cloned = team.clone();
        assert_eq!(cloned.name, team.name);
        assert_eq!(cloned.id, team.id);
    }

    #[test]
    fn test_team_debug() {
        let team = Team {
            id: Uuid::new_v4(),
            name: "Debug".to_string(),
            owner_id: Uuid::new_v4(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let _ = format!("{:?}", team);
    }

    // ── TeamMember ──────────────────────────────────────────

    #[test]
    fn test_team_member_serialization() {
        let member = TeamMember {
            id: Uuid::new_v4(),
            team_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            role: "admin".to_string(),
            invited_at: Utc::now(),
            joined_at: Some(Utc::now()),
        };
        let json = serde_json::to_value(&member).unwrap();
        assert_eq!(json["role"], "admin");
        assert!(json["joined_at"].is_string());
    }

    #[test]
    fn test_team_member_no_joined_at() {
        let member = TeamMember {
            id: Uuid::new_v4(),
            team_id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            role: "viewer".to_string(),
            invited_at: Utc::now(),
            joined_at: None,
        };
        let json = serde_json::to_value(&member).unwrap();
        assert!(json["joined_at"].is_null());
    }

    // ── TeamInvite ──────────────────────────────────────────

    #[test]
    fn test_team_invite_serialization() {
        let invite = TeamInvite {
            id: Uuid::new_v4(),
            team_id: Uuid::new_v4(),
            email: "invite@example.com".to_string(),
            role: "editor".to_string(),
            token: "inv_abc123".to_string(),
            expires_at: Utc::now() + chrono::Duration::days(7),
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&invite).unwrap();
        assert_eq!(json["email"], "invite@example.com");
        assert_eq!(json["role"], "editor");
    }

    // ── CreateTeamRequest ───────────────────────────────────

    #[test]
    fn test_create_team_request_deserialization() {
        let json = r#"{"name":"My Team"}"#;
        let req: CreateTeamRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "My Team");
    }

    // ── InviteRequest ───────────────────────────────────────

    #[test]
    fn test_invite_request_with_role() {
        let json = r#"{"email":"a@b.com","role":"editor"}"#;
        let req: InviteRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "a@b.com");
        assert_eq!(req.role, Some("editor".to_string()));
    }

    #[test]
    fn test_invite_request_without_role() {
        let json = r#"{"email":"a@b.com"}"#;
        let req: InviteRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "a@b.com");
        assert!(req.role.is_none());
    }

    // ── ChangeRoleRequest ───────────────────────────────────

    #[test]
    fn test_change_role_request_deserialization() {
        let json = r#"{"role":"admin"}"#;
        let req: ChangeRoleRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.role, "admin");
    }

    // ── AcceptInviteRequest ──────────────────────────────────

    #[test]
    fn test_accept_invite_request_deserialization() {
        let json = r#"{"token":"inv_abc123"}"#;
        let req: AcceptInviteRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.token, "inv_abc123");
    }

    #[test]
    fn test_accept_invite_request_missing_token() {
        let json = r#"{}"#;
        let result: Result<AcceptInviteRequest, _> = serde_json::from_str(json);
        assert!(result.is_err());
    }

    // ── TeamResponse ────────────────────────────────────────

    #[test]
    fn test_team_response_serialization() {
        let resp = TeamResponse {
            id: Uuid::new_v4(),
            name: "My Team".to_string(),
            owner_id: Uuid::new_v4(),
            member_count: 5,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["name"], "My Team");
        assert_eq!(json["member_count"], 5);
    }

    // ── TeamDetailResponse ──────────────────────────────────

    #[test]
    fn test_team_detail_response_serialization() {
        let resp = TeamDetailResponse {
            id: Uuid::new_v4(),
            name: "Detail Team".to_string(),
            owner_id: Uuid::new_v4(),
            members: vec![],
            invites: vec![],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["name"], "Detail Team");
        assert!(json["members"].as_array().unwrap().is_empty());
        assert!(json["invites"].as_array().unwrap().is_empty());
    }

    // ── MemberResponse ──────────────────────────────────────

    #[test]
    fn test_member_response_serialization() {
        let resp = MemberResponse {
            id: Uuid::new_v4(),
            customer_id: Uuid::new_v4(),
            email: "member@team.com".to_string(),
            name: Some("Member Name".to_string()),
            role: "editor".to_string(),
            invited_at: Utc::now(),
            joined_at: Some(Utc::now()),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["email"], "member@team.com");
        assert_eq!(json["role"], "editor");
    }

    // ── InviteResponse ──────────────────────────────────────

    #[test]
    fn test_invite_response_serialization() {
        let resp = InviteResponse {
            id: Uuid::new_v4(),
            email: "pending@invite.com".to_string(),
            role: "viewer".to_string(),
            expires_at: Utc::now() + chrono::Duration::days(7),
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["email"], "pending@invite.com");
        assert_eq!(json["role"], "viewer");
    }

    // ── VALID_ROLES constant ────────────────────────────────

    #[test]
    fn test_valid_roles_contains_expected() {
        assert!(VALID_ROLES.contains(&"admin"));
        assert!(VALID_ROLES.contains(&"editor"));
        assert!(VALID_ROLES.contains(&"viewer"));
        assert!(!VALID_ROLES.contains(&"owner"));
        assert!(!VALID_ROLES.contains(&"superadmin"));
    }

    // ── validate_role ───────────────────────────────────────

    #[test]
    fn test_validate_role_valid() {
        assert!(validate_role("admin").is_ok());
        assert!(validate_role("editor").is_ok());
        assert!(validate_role("viewer").is_ok());
    }

    #[test]
    fn test_validate_role_invalid() {
        assert!(validate_role("owner").is_err());
        assert!(validate_role("superadmin").is_err());
        assert!(validate_role("").is_err());
    }

    // ── Router construction ─────────────────────────────────

    #[test]
    fn test_teams_router_construction() {
        let _router = router();
    }
}
