use axum::extract::{Extension, Path};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{Team, TeamMember, TeamInvite, TeamResponse, TeamDetailResponse, MemberResponse, InviteResponse, CreateTeamRequest, InviteRequest, ChangeRoleRequest, AcceptInviteRequest};
use super::rbac::{role_level, validate_role, require_team_member, require_role, require_team_admin, require_team_developer, check_user_team_role, check_user_team_role_for_team, invalidate_permission_cache, log_rbac_action};

// ── Routes ───────────────────────────────────────────────────────────────────

// ── Handlers ─────────────────────────────────────────────────────────────────

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

    tracing::info!("✅ Team '{}' created by {}", req.name, customer.id);
    Ok(Json(team))
}

/// GET /v1/teams — List user's teams
pub async fn list_teams(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<TeamResponse>>, AppError> {
    // Single query with COUNT(*) OVER() to avoid N+1
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

/// POST /v1/teams/:id/invite — Invite by email
pub async fn invite_member(
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
pub async fn accept_invite(
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
        return Err(AppError::Forbidden);
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
pub async fn revoke_invite(
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
pub async fn resend_invite(
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
pub async fn list_members(
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
pub async fn remove_member(
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
        return Err(AppError::coded(ErrorCode::CannotRemoveOwner));
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
pub async fn change_role(
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

    // Get old role for audit
    let old_role: Option<String> = sqlx::query_scalar(
        "SELECT role FROM team_members WHERE team_id = $1 AND customer_id = $2"
    )
    .bind(team_id)
    .bind(uid)
    .fetch_optional(&pool)
    .await?;

    // Audit log — ROLE_CHANGE (enhanced)
    {
        let tid = team_id.to_string();
        let _ = crate::audit::log_action(&pool, customer.id, "ROLE_CHANGE", "team", Some(&tid),
            Some(serde_json::json!({"user_id": uid.to_string(), "new_role": &req.role})), None, None).await;

        // RBAC audit log
        let _ = log_rbac_action(
            &pool,
            customer.id,
            Some(uid),
            Some(team_id),
            "role_change",
            Some(serde_json::json!({"role": old_role})),
            Some(serde_json::json!({"role": &req.role})),
            None,
            None,
        ).await;
    }

    // Invalidate permission cache
    let _ = invalidate_permission_cache(&pool, uid, Some(team_id)).await;

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
pub async fn update_team(
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
        return Err(AppError::coded(ErrorCode::TeamNameRequired));
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

    tracing::info!("✅ Team '{}' ({}) deleted by {}", team.name, id, customer.id);

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
