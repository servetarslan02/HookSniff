//! Team invitation management: invite, accept, revoke, resend.

use axum::extract::{Extension, Path};
use axum::Json;
use chrono::Utc;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{TeamInvite, InviteRequest, AcceptInviteRequest};
use super::rbac::require_team_admin;

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
    super::rbac::validate_role(role)?;

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
    let expires_at = Utc::now() + chrono::Duration::days(7);

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

    // Audit log
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

    tracing::info!("✅ {} accepted invite to team {}", customer.id, invite.team_id);

    // Notify team owner about the new member
    {
        let pool_clone = pool.clone();
        let team_id = invite.team_id;
        let member_name = customer.name.clone().unwrap_or_else(|| customer.email.clone());
        let member_id = customer.id;
        tokio::spawn(async move {
            if let Ok(Some((team_name, owner_id))) = sqlx::query_as::<_, (String, uuid::Uuid)>(
                "SELECT name, owner_id FROM teams WHERE id = $1"
            )
            .bind(team_id)
            .fetch_optional(&pool_clone)
            .await
            {
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
    let invite = sqlx::query_as::<_, TeamInvite>(
        "SELECT id, team_id, email, role, token, expires_at, created_at FROM team_invites WHERE id = $1"
    )
    .bind(invite_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    require_team_admin(&pool, invite.team_id, customer.id).await?;

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
    let invite = sqlx::query_as::<_, TeamInvite>(
        "SELECT id, team_id, email, role, token, expires_at, created_at FROM team_invites WHERE id = $1"
    )
    .bind(invite_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

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
