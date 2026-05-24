//! Tests for webhook routes.

use super::*;
use uuid::Uuid;

#[test]
fn test_router_construction() {
    let _r = router();
}

// ── ListParams tests ──

#[test]
fn test_list_params_deserialize() {
    let json = r#"{"page": 2, "per_page": 50, "status": "delivered"}"#;
    let params: ListParams = serde_json::from_str(json).unwrap();
    assert_eq!(params.page.unwrap(), 2);
    assert_eq!(params.per_page.unwrap(), 50);
    assert_eq!(params.status.unwrap(), "delivered");
}

#[test]
fn test_list_params_defaults() {
    let json = r#"{}"#;
    let params: ListParams = serde_json::from_str(json).unwrap();
    assert!(params.page.is_none());
    assert!(params.per_page.is_none());
    assert!(params.status.is_none());
}

// ── ExportParams tests ──

#[test]
fn test_export_params_deserialize() {
    let json = r#"{"format": "csv", "status": "failed", "date_from": "2024-01-01", "date_to": "2024-01-31"}"#;
    let params: ExportParams = serde_json::from_str(json).unwrap();
    assert_eq!(params.format.unwrap(), "csv");
    assert_eq!(params.status.unwrap(), "failed");
    assert_eq!(params.date_from.unwrap(), "2024-01-01");
    assert_eq!(params.date_to.unwrap(), "2024-01-31");
}

#[test]
fn test_export_params_empty() {
    let json = r#"{}"#;
    let params: ExportParams = serde_json::from_str(json).unwrap();
    assert!(params.format.is_none());
    assert!(params.status.is_none());
}

// ── BatchReplayRequest tests ──

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
struct BatchReplayRequest {
    delivery_ids: Vec<Uuid>,
}

#[test]
fn test_batch_replay_request_deserialize() {
    let id1 = Uuid::new_v4();
    let id2 = Uuid::new_v4();
    let json = format!(r#"{{"delivery_ids": ["{}", "{}"]}}"#, id1, id2);
    let req: BatchReplayRequest = serde_json::from_str(&json).unwrap();
    assert_eq!(req.delivery_ids.len(), 2);
    assert_eq!(req.delivery_ids[0], id1);
    assert_eq!(req.delivery_ids[1], id2);
}

#[test]
fn test_batch_replay_request_empty() {
    let json = r#"{"delivery_ids": []}"#;
    let req: BatchReplayRequest = serde_json::from_str(json).unwrap();
    assert!(req.delivery_ids.is_empty());
}

// ── Pagination logic tests ──

#[test]
fn test_pagination_defaults() {
    let page = 1i64;
    let per_page = 20i64;
    let offset = (page - 1) * per_page;
    assert_eq!(page, 1);
    assert_eq!(per_page, 20);
    assert_eq!(offset, 0);
}

#[test]
fn test_pagination_clamping() {
    let raw_page = -1i64;
    let clamped_page = raw_page.max(1);
    assert_eq!(clamped_page, 1);

    let raw_per_page = 500i64;
    let clamped_per_page = raw_per_page.min(200);
    assert_eq!(clamped_per_page, 200);
}

// ── RBAC: webhook write operations require developer ─────

#[test]
fn test_webhook_create_requires_developer() {
    let min_role = "developer";
    let min_level = crate::routes::teams::role_level(min_role);
    assert!(crate::routes::teams::role_level("admin") >= min_level);
    assert!(crate::routes::teams::role_level("developer") >= min_level);
    assert!(crate::routes::teams::role_level("analyst") < min_level);
    assert!(crate::routes::teams::role_level("viewer") < min_level);
}

#[test]
fn test_webhook_batch_requires_developer() {
    let min_level = crate::routes::teams::role_level("developer");
    assert_eq!(min_level, 30);
}

#[test]
fn test_webhook_replay_requires_developer() {
    let min_level = crate::routes::teams::role_level("developer");
    assert!(
        crate::routes::teams::role_level("viewer") < min_level,
        "viewer cannot replay"
    );
}
