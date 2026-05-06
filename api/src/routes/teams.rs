use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_teams).post(create_team))
        .route("/{id}", get(get_team))
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
pub struct CreateTeamRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct InviteRequest {
    pub email: String,
    pub role: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ChangeRoleRequest {
    pub role: String,
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

#[derive(Debug, Serialize)]
pub struct MemberResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub role: String,
    pub invited_at: DateTime<Utc>,
    pub joined_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
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
        Err(AppError::BadRequest(format!(
            "Invalid role '{}'. Must be one of: {}",
            role,
            VALID_ROLES.join(", ")
        )))
    }
}

/// Check that the user is a member of the team and return their role.
async fn require_team_member(
    pool: &PgPool,
    team_id: Uuid,
    customer_id: Uuid,
) -> Result<TeamMember, AppError> {
    sqlx::query_as::<_, TeamMember>(
        "SELECT * FROM team_members WHERE team_id = $1 AND customer_id = $2",
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
    let team = sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
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

    let team = sqlx::query_as::<_, Team>(
        "INSERT INTO teams (name, owner_id) VALUES ($1, $2) RETURNING *",
    )
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
           ORDER BY t.updated_at DESC"#,
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let mut result = Vec::with_capacity(teams.len());
    for team in teams {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM team_members WHERE team_id = $1",
        )
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

    let team = sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
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
           ORDER BY tm.invited_at ASC"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    // Pending invites
    let invites = sqlx::query_as::<_, InviteResponse>(
        r#"SELECT id, email, role, expires_at, created_at
           FROM team_invites
           WHERE team_id = $1 AND expires_at > NOW()
           ORDER BY created_at DESC"#,
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

    // Check if user is already a member
    let existing_customer: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM customers WHERE email = $1")
            .bind(&req.email)
            .fetch_optional(&pool)
            .await?;

    if let Some((cust_id,)) = existing_customer {
        let already_member: Option<(Uuid,)> = sqlx::query_as(
            "SELECT id FROM team_members WHERE team_id = $1 AND customer_id = $2",
        )
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

    Ok(Json(serde_json::json!({
        "id": invite.id,
        "email": invite.email,
        "role": invite.role,
        "token": invite.token,
        "expires_at": invite.expires_at,
        "message": "Invitation created successfully"
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
           ORDER BY tm.invited_at ASC"#,
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
    let team = sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
        .bind(team_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    if uid == team.owner_id {
        return Err(AppError::BadRequest(
            "Cannot remove the team owner".into(),
        ));
    }

    let result = sqlx::query(
        "DELETE FROM team_members WHERE team_id = $1 AND customer_id = $2",
    )
    .bind(team_id)
    .bind(uid)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✅ Member {} removed from team {}", uid, team_id);
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
    let team = sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
        .bind(team_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound)?;

    if uid == team.owner_id {
        return Err(AppError::BadRequest(
            "Cannot change the team owner's role".into(),
        ));
    }

    let result = sqlx::query(
        "UPDATE team_members SET role = $1 WHERE team_id = $2 AND customer_id = $3",
    )
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
        req.role, uid, team_id
    );

    Ok(Json(serde_json::json!({
        "role": req.role,
        "message": "Role updated successfully"
    })))
}
