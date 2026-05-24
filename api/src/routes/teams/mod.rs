pub mod rbac;
pub mod handlers;

#[cfg(test)]
mod tests;

// Re-export RBAC functions for backward compatibility
pub use rbac::{role_level, require_team_member, require_role, require_team_admin, require_team_developer, require_team_analyst, check_user_team_role, check_user_team_role_for_team, get_cached_permissions, invalidate_permission_cache, check_role_rate_limit, log_rbac_action};

use axum::routing::{delete, get, post, put};
use axum::Router;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// Re-export handler functions for router
use handlers::*;

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
pub struct InviteRequest {
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
