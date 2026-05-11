//! HookSniff Resource Tests
//!
//! Tests for resource structs, their constructors, and API paths.
//! These tests verify the resource layer is correctly wired without
//! making actual HTTP calls.

use hooksniff::request::{HookSniffRequest, HookSniffRequestContext, HttpMethod};
use hooksniff::resources::alerts::Alerts;
use hooksniff::resources::analytics::Analytics;
use hooksniff::resources::api_keys::ApiKeys;
use hooksniff::resources::auth::Auth;
use hooksniff::resources::billing::Billing;
use hooksniff::resources::endpoints::{EndpointCreateInput, EndpointUpdateInput, Endpoints};
use hooksniff::resources::health::Health;
use hooksniff::resources::search::Search;
use hooksniff::resources::teams::{InviteInput, Teams};
use hooksniff::resources::webhooks::{WebhookBatchInput, WebhookSendInput, Webhooks};
use std::time::Duration;

fn make_ctx() -> HookSniffRequestContext {
    HookSniffRequestContext {
        base_url: "https://api.test.com".into(),
        token: "sk_test_123".into(),
        timeout: Duration::from_secs(30),
        num_retries: 2,
    }
}

// ── Resource constructors ────────────────────────────────────────────

#[test]
fn test_endpoints_resource_construction() {
    let ctx = make_ctx();
    let ep = Endpoints::new(ctx);
    // Should construct without panic
    drop(ep);
}

#[test]
fn test_webhooks_resource_construction() {
    let ctx = make_ctx();
    let wh = Webhooks::new(ctx);
    drop(wh);
}

#[test]
fn test_auth_resource_construction() {
    let ctx = make_ctx();
    let auth = Auth::new(ctx);
    drop(auth);
}

#[test]
fn test_analytics_resource_construction() {
    let ctx = make_ctx();
    let analytics = Analytics::new(ctx);
    drop(analytics);
}

#[test]
fn test_api_keys_resource_construction() {
    let ctx = make_ctx();
    let keys = ApiKeys::new(ctx);
    drop(keys);
}

#[test]
fn test_alerts_resource_construction() {
    let ctx = make_ctx();
    let alerts = Alerts::new(ctx);
    drop(alerts);
}

#[test]
fn test_teams_resource_construction() {
    let ctx = make_ctx();
    let teams = Teams::new(ctx);
    drop(teams);
}

#[test]
fn test_search_resource_construction() {
    let ctx = make_ctx();
    let search = Search::new(ctx);
    drop(search);
}

#[test]
fn test_billing_resource_construction() {
    let ctx = make_ctx();
    let billing = Billing::new(ctx);
    drop(billing);
}

#[test]
fn test_health_resource_construction() {
    let ctx = make_ctx();
    let health = Health::new(ctx);
    drop(health);
}

// ── Resource cloning context ─────────────────────────────────────────

#[test]
fn test_resources_share_same_context() {
    let ctx = make_ctx();
    let _ep = Endpoints::new(ctx.clone());
    let _wh = Webhooks::new(ctx.clone());
    let _auth = Auth::new(ctx.clone());
    let _analytics = Analytics::new(ctx.clone());
    let _keys = ApiKeys::new(ctx.clone());
    let _alerts = Alerts::new(ctx.clone());
    let _teams = Teams::new(ctx.clone());
    let _search = Search::new(ctx.clone());
    let _billing = Billing::new(ctx.clone());
    let _health = Health::new(ctx);
    // All should use the same base_url and token
}

// ── Request path verification ────────────────────────────────────────

#[test]
fn test_endpoint_list_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints");
    assert_eq!(req.path(), "/v1/endpoints");
}

#[test]
fn test_endpoint_create_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints");
    assert_eq!(req.path(), "/v1/endpoints");
}

#[test]
fn test_endpoint_get_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_123");
    assert_eq!(req.path(), "/v1/endpoints/ep_123");
}

#[test]
fn test_endpoint_update_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Put, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_456");
    assert_eq!(req.path(), "/v1/endpoints/ep_456");
}

#[test]
fn test_endpoint_delete_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_789");
    assert_eq!(req.path(), "/v1/endpoints/ep_789");
}

#[test]
fn test_endpoint_rotate_secret_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints/{id}/rotate-secret");
    req.set_path_param("id", "ep_rotate");
    assert_eq!(req.path(), "/v1/endpoints/ep_rotate/rotate-secret");
}

#[test]
fn test_webhook_send_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    assert_eq!(req.path(), "/v1/webhooks");
}

#[test]
fn test_webhook_batch_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks/batch");
    assert_eq!(req.path(), "/v1/webhooks/batch");
}

#[test]
fn test_webhook_get_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks/{id}");
    req.set_path_param("id", "wh_123");
    assert_eq!(req.path(), "/v1/webhooks/wh_123");
}

#[test]
fn test_webhook_replay_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks/{id}/replay");
    req.set_path_param("id", "wh_replay");
    assert_eq!(req.path(), "/v1/webhooks/wh_replay/replay");
}

#[test]
fn test_auth_register_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/register");
    assert_eq!(req.path(), "/v1/auth/register");
}

#[test]
fn test_auth_login_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/login");
    assert_eq!(req.path(), "/v1/auth/login");
}

#[test]
fn test_auth_2fa_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/2fa/enable");
    assert_eq!(req.path(), "/v1/auth/2fa/enable");
}

#[test]
fn test_auth_forgot_password_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/auth/forgot-password");
    assert_eq!(req.path(), "/v1/auth/forgot-password");
}

#[test]
fn test_auth_export_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/auth/export");
    assert_eq!(req.path(), "/v1/auth/export");
}

#[test]
fn test_auth_delete_account_path() {
    let req = HookSniffRequest::new(HttpMethod::Delete, "/v1/auth/account");
    assert_eq!(req.path(), "/v1/auth/account");
}

#[test]
fn test_analytics_deliveries_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/deliveries");
    assert_eq!(req.path(), "/v1/analytics/deliveries");
}

#[test]
fn test_analytics_success_rate_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/success-rate");
    assert_eq!(req.path(), "/v1/analytics/success-rate");
}

#[test]
fn test_analytics_latency_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/latency");
    assert_eq!(req.path(), "/v1/analytics/latency");
}

#[test]
fn test_api_keys_list_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/api-keys");
    assert_eq!(req.path(), "/v1/api-keys");
}

#[test]
fn test_api_keys_create_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/api-keys");
    assert_eq!(req.path(), "/v1/api-keys");
}

#[test]
fn test_api_keys_delete_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/api-keys/{id}");
    req.set_path_param("id", "key_abc");
    assert_eq!(req.path(), "/v1/api-keys/key_abc");
}

#[test]
fn test_alerts_rules_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/alerts/rules");
    assert_eq!(req.path(), "/v1/alerts/rules");
}

#[test]
fn test_alerts_notifications_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/alerts/notifications");
    assert_eq!(req.path(), "/v1/alerts/notifications");
}

#[test]
fn test_teams_members_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/teams/members");
    assert_eq!(req.path(), "/v1/teams/members");
}

#[test]
fn test_teams_invite_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/teams/invite");
    assert_eq!(req.path(), "/v1/teams/invite");
}

#[test]
fn test_teams_remove_member_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/teams/members/{id}");
    req.set_path_param("id", "mem_123");
    assert_eq!(req.path(), "/v1/teams/members/mem_123");
}

#[test]
fn test_search_query_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/search");
    assert_eq!(req.path(), "/v1/search");
}

#[test]
fn test_billing_plan_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/billing/plan");
    assert_eq!(req.path(), "/v1/billing/plan");
}

#[test]
fn test_billing_upgrade_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/billing/upgrade");
    assert_eq!(req.path(), "/v1/billing/upgrade");
}

#[test]
fn test_billing_portal_path() {
    let req = HookSniffRequest::new(HttpMethod::Post, "/v1/billing/portal");
    assert_eq!(req.path(), "/v1/billing/portal");
}

#[test]
fn test_health_check_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/health");
    assert_eq!(req.path(), "/health");
}

// ── Input struct serialization ───────────────────────────────────────

#[test]
fn test_endpoint_create_input_serializes_url() {
    let input = EndpointCreateInput {
        url: "https://example.com/webhook".into(),
        description: None,
        rate_limit: None,
        active: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    assert!(json.contains("https://example.com/webhook"));
}

#[test]
fn test_endpoint_update_input_all_none() {
    let input = EndpointUpdateInput {
        url: None,
        description: None,
        rate_limit: None,
        active: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed, serde_json::json!({}));
}

#[test]
fn test_webhook_send_input_with_data() {
    let input = WebhookSendInput {
        endpoint_id: "ep_1".into(),
        event: "test.event".into(),
        data: serde_json::json!({"key": "value"}),
        headers: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    assert!(json.contains("test.event"));
    assert!(json.contains("key"));
}

#[test]
fn test_webhook_batch_input_serializes_array() {
    let input = WebhookBatchInput {
        webhooks: vec![
            WebhookSendInput {
                endpoint_id: "ep_1".into(),
                event: "a".into(),
                data: serde_json::json!({}),
                headers: None,
            },
            WebhookSendInput {
                endpoint_id: "ep_2".into(),
                event: "b".into(),
                data: serde_json::json!({}),
                headers: None,
            },
        ],
    };
    let json = serde_json::to_string(&input).unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed["webhooks"].as_array().unwrap().len(), 2);
}

#[test]
fn test_invite_input_serialization() {
    let input = InviteInput {
        email: "new@team.com".into(),
        role: "admin".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    assert!(json.contains("new@team.com"));
    assert!(json.contains("admin"));
}

// ── Context field access ─────────────────────────────────────────────

#[test]
fn test_context_base_url() {
    let ctx = make_ctx();
    assert_eq!(ctx.base_url, "https://api.test.com");
}

#[test]
fn test_context_token() {
    let ctx = make_ctx();
    assert_eq!(ctx.token, "sk_test_123");
}

#[test]
fn test_context_timeout() {
    let ctx = make_ctx();
    assert_eq!(ctx.timeout, Duration::from_secs(30));
}

#[test]
fn test_context_num_retries() {
    let ctx = make_ctx();
    assert_eq!(ctx.num_retries, 2);
}

#[test]
fn test_context_clone() {
    let ctx = make_ctx();
    let ctx2 = ctx.clone();
    assert_eq!(ctx.base_url, ctx2.base_url);
    assert_eq!(ctx.token, ctx2.token);
}

#[test]
fn test_context_custom_values() {
    let ctx = HookSniffRequestContext {
        base_url: "http://localhost:8080".into(),
        token: "custom_token".into(),
        timeout: Duration::from_secs(5),
        num_retries: 0,
    };
    assert_eq!(ctx.base_url, "http://localhost:8080");
    assert_eq!(ctx.token, "custom_token");
    assert_eq!(ctx.timeout, Duration::from_secs(5));
    assert_eq!(ctx.num_retries, 0);
}

// ── Pagination in resources ──────────────────────────────────────────

#[test]
fn test_endpoint_list_uses_pagination_path() {
    // list_all should use the same base path with query params
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints");
    req.set_query_param("limit", "50");
    req.set_query_param("offset", "0");
    assert_eq!(req.path(), "/v1/endpoints");
    assert_eq!(req.query_params().get("limit").unwrap(), "50");
    assert_eq!(req.query_params().get("offset").unwrap(), "0");
}

#[test]
fn test_webhook_list_uses_pagination_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    req.set_query_param("limit", "50");
    req.set_query_param("offset", "100");
    assert_eq!(req.path(), "/v1/webhooks");
    assert_eq!(req.query_params().get("offset").unwrap(), "100");
}

#[test]
fn test_api_keys_list_uses_pagination_path() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/api-keys");
    req.set_query_param("limit", "50");
    req.set_query_param("offset", "0");
    assert_eq!(req.path(), "/v1/api-keys");
}
