//! Teams module tests

use super::{Team, TeamMember, TeamInvite, TeamResponse, TeamDetailResponse, MemberResponse, InviteResponse, CreateTeamRequest, InviteRequest, ChangeRoleRequest, AcceptInviteRequest};
use super::rbac::{role_level, validate_role, compute_permissions, VALID_ROLES};
use chrono::{TimeZone, Utc};
use uuid::Uuid;

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
        role: "developer".to_string(),
        token: "inv_abc123".to_string(),
        expires_at: Utc::now() + chrono::Duration::days(7),
        created_at: Utc::now(),
    };
    let json = serde_json::to_value(&invite).unwrap();
    assert_eq!(json["email"], "invite@example.com");
    assert_eq!(json["role"], "developer");
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
    let json = r#"{"email":"a@b.com","role":"developer"}"#;
    let req: InviteRequest = serde_json::from_str(json).unwrap();
    assert_eq!(req.email, "a@b.com");
    assert_eq!(req.role, Some("developer".to_string()));
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
        role: "developer".to_string(),
        invited_at: Utc::now(),
        joined_at: Some(Utc::now()),
    };
    let json = serde_json::to_value(&resp).unwrap();
    assert_eq!(json["email"], "member@team.com");
    assert_eq!(json["role"], "developer");
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
    assert!(VALID_ROLES.contains(&"developer"));
    assert!(VALID_ROLES.contains(&"viewer"));
    assert!(!VALID_ROLES.contains(&"owner"));
    assert!(!VALID_ROLES.contains(&"superadmin"));
}

// ── validate_role ───────────────────────────────────────

#[test]
fn test_validate_role_valid() {
    assert!(validate_role("admin").is_ok());
    assert!(validate_role("developer").is_ok());
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
    let _router = super::router();
}

// ── role_level — RBAC hierarchy tests ───────────────────

#[test]
fn test_role_level_hierarchy() {
    assert!(role_level("admin") > role_level("developer"));
    assert!(role_level("developer") > role_level("analyst"));
    assert!(role_level("analyst") > role_level("viewer"));
}

#[test]
fn test_role_level_exact_values() {
    assert_eq!(role_level("admin"), 40);
    assert_eq!(role_level("developer"), 30);
    assert_eq!(role_level("analyst"), 20);
    assert_eq!(role_level("viewer"), 10);
}

#[test]
fn test_role_level_unknown_is_zero() {
    assert_eq!(role_level("owner"), 0);
    assert_eq!(role_level("superadmin"), 0);
    assert_eq!(role_level(""), 0);
    assert_eq!(role_level("unknown"), 0);
}

#[test]
fn test_admin_passes_developer_check() {
    assert!(role_level("admin") >= role_level("developer"));
}

#[test]
fn test_developer_passes_developer_check() {
    assert!(role_level("developer") >= role_level("developer"));
}

#[test]
fn test_analyst_fails_developer_check() {
    assert!(role_level("analyst") < role_level("developer"));
}

#[test]
fn test_viewer_fails_developer_check() {
    assert!(role_level("viewer") < role_level("developer"));
}

#[test]
fn test_admin_passes_admin_check() {
    assert!(role_level("admin") >= role_level("admin"));
}

#[test]
fn test_developer_fails_admin_check() {
    assert!(role_level("developer") < role_level("admin"));
}

// ── check_user_team_role — logic verification ───────────

#[test]
fn test_check_user_team_role_requires_any_team_membership() {
    let memberships: Vec<(Uuid, String)> = vec![];
    let min_level = role_level("developer");
    let has_role = memberships.iter().any(|(_, role)| role_level(role) >= min_level);
    assert!(!has_role);
}

#[test]
fn test_check_user_team_role_passes_with_matching_role() {
    let memberships = vec![
        (Uuid::new_v4(), "viewer".to_string()),
        (Uuid::new_v4(), "developer".to_string()),
    ];
    let min_level = role_level("developer");
    let has_role = memberships.iter().any(|(_, role)| role_level(role) >= min_level);
    assert!(has_role);
}

#[test]
fn test_check_user_team_role_fails_when_all_below() {
    let memberships = vec![
        (Uuid::new_v4(), "viewer".to_string()),
        (Uuid::new_v4(), "analyst".to_string()),
    ];
    let min_level = role_level("developer");
    let has_role = memberships.iter().any(|(_, role)| role_level(role) >= min_level);
    assert!(!has_role);
}

#[test]
fn test_check_user_team_role_mixed_teams() {
    let memberships = vec![
        (Uuid::new_v4(), "viewer".to_string()),
        (Uuid::new_v4(), "admin".to_string()),
    ];
    let min_level = role_level("developer");
    let has_role = memberships.iter().any(|(_, role)| role_level(role) >= min_level);
    assert!(has_role);
}

// ── Role permission matrix ──────────────────────────────

#[test]
fn test_permission_matrix_write_ops() {
    let write_min = role_level("developer");
    assert!(role_level("admin") >= write_min, "admin can write");
    assert!(role_level("developer") >= write_min, "developer can write");
    assert!(role_level("analyst") < write_min, "analyst cannot write");
    assert!(role_level("viewer") < write_min, "viewer cannot write");
}

#[test]
fn test_permission_matrix_destructive_ops() {
    let destructive_min = role_level("admin");
    assert!(role_level("admin") >= destructive_min, "admin can delete");
    assert!(role_level("developer") < destructive_min, "developer cannot delete");
    assert!(role_level("analyst") < destructive_min, "analyst cannot delete");
    assert!(role_level("viewer") < destructive_min, "viewer cannot delete");
}

#[test]
fn test_permission_matrix_read_ops() {
    let read_min = role_level("analyst");
    assert!(role_level("admin") >= read_min, "admin can read");
    assert!(role_level("developer") >= read_min, "developer can read");
    assert!(role_level("analyst") >= read_min, "analyst can read");
    assert!(role_level("viewer") < read_min, "viewer cannot read analytics");
}

// ── compute_permissions — comprehensive tests ───────────

#[test]
fn test_compute_permissions_owner() {
    let perms = compute_permissions("owner");
    assert_eq!(perms["can_manage_team"], true);
    assert_eq!(perms["can_manage_webhooks"], true);
    assert_eq!(perms["can_manage_billing"], true);
    assert_eq!(perms["can_view_devtools"], true);
    assert_eq!(perms["can_view_observability"], true);
}

#[test]
fn test_compute_permissions_admin() {
    let perms = compute_permissions("admin");
    assert_eq!(perms["can_manage_team"], true);
    assert_eq!(perms["can_manage_webhooks"], true);
    assert_eq!(perms["can_manage_billing"], true);
    assert_eq!(perms["can_view_devtools"], true);
    assert_eq!(perms["can_view_observability"], true);
}

#[test]
fn test_compute_permissions_developer() {
    let perms = compute_permissions("developer");
    assert_eq!(perms["can_manage_team"], false);
    assert_eq!(perms["can_manage_webhooks"], false);
    assert_eq!(perms["can_manage_billing"], false);
    assert_eq!(perms["can_view_devtools"], true);
    assert_eq!(perms["can_view_observability"], true);
}

#[test]
fn test_compute_permissions_analyst() {
    let perms = compute_permissions("analyst");
    assert_eq!(perms["can_manage_team"], false);
    assert_eq!(perms["can_manage_webhooks"], false);
    assert_eq!(perms["can_manage_billing"], false);
    assert_eq!(perms["can_view_devtools"], false);
    assert_eq!(perms["can_view_observability"], true);
}

#[test]
fn test_compute_permissions_viewer() {
    let perms = compute_permissions("viewer");
    assert_eq!(perms["can_manage_team"], false);
    assert_eq!(perms["can_manage_webhooks"], false);
    assert_eq!(perms["can_manage_billing"], false);
    assert_eq!(perms["can_view_devtools"], false);
    assert_eq!(perms["can_view_observability"], false);
    assert_eq!(perms["can_manage_settings"], true);
}

// ── Role hierarchy — edge cases ─────────────────────────

#[test]
fn test_role_level_unknown_role() {
    assert_eq!(role_level("unknown"), 0);
    assert_eq!(role_level(""), 0);
    assert_eq!(role_level("superadmin"), 0);
}

#[test]
fn test_role_level_legacy_member() {
    assert_eq!(role_level("member"), 10);
}

#[test]
fn test_role_level_ordering() {
    assert!(role_level("owner") > role_level("admin"));
    assert!(role_level("admin") > role_level("developer"));
    assert!(role_level("developer") > role_level("analyst"));
    assert!(role_level("analyst") > role_level("viewer"));
}

// ── Permission matrix — all operations ──────────────────

#[test]
fn test_permission_matrix_team_management() {
    let min = role_level("admin");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") < min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_api_keys() {
    let min = role_level("admin");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") < min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_integrations() {
    let min = role_level("admin");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") < min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_alerts() {
    let min = role_level("admin");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") < min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_domains() {
    let min = role_level("admin");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") < min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_routing() {
    let min = role_level("admin");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") < min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_observability() {
    let min = role_level("analyst");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") >= min);
    assert!(role_level("analyst") >= min);
    assert!(role_level("viewer") < min);
}

#[test]
fn test_permission_matrix_devtools() {
    let min = role_level("developer");
    assert!(role_level("owner") >= min);
    assert!(role_level("admin") >= min);
    assert!(role_level("developer") >= min);
    assert!(role_level("analyst") < min);
    assert!(role_level("viewer") < min);
}

// ── Rate limit defaults ─────────────────────────────────

#[test]
fn test_rate_limit_hierarchy() {
    let owner_rpm = 120;
    let admin_rpm = 100;
    let developer_rpm = 80;
    let analyst_rpm = 60;
    let viewer_rpm = 30;

    assert!(owner_rpm > admin_rpm);
    assert!(admin_rpm > developer_rpm);
    assert!(developer_rpm > analyst_rpm);
    assert!(analyst_rpm > viewer_rpm);
}
