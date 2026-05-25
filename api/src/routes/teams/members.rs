//! Team member management: list, remove, change role.

use axum::extract::{Extension, Path};
use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, ErrorCode};
use crate::models::customer::Customer;

use super::{Team, MemberResponse};
use super::rbac::{require_team_member, require_team_admin, validate_role, invalidate_permission_cache, log_rbac_action};

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

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ChangeRoleRequest {
    pub role: String,
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
