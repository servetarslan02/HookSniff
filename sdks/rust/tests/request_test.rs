//! HookSniff Request Builder Tests
//!
//! Tests for the HookSniffRequest builder — path params, query params,
//! headers, body, and combined usage.

use hooksniff::request::{HookSniffRequest, HttpMethod};
use serde::Serialize;
use std::collections::HashMap;

// ── Path params ──────────────────────────────────────────────────────

#[test]
fn test_simple_path() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    assert_eq!(req.path(), "/v1/webhooks");
}

#[test]
fn test_path_param_substitution_single() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks/{id}");
    req.set_path_param("id", "wh_abc123");
    assert_eq!(req.path(), "/v1/webhooks/wh_abc123");
}

#[test]
fn test_path_param_substitution_multiple() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/teams/{team_id}/members/{member_id}");
    req.set_path_param("team_id", "team_1");
    req.set_path_param("member_id", "mem_42");
    assert_eq!(req.path(), "/v1/teams/team_1/members/mem_42");
}

#[test]
fn test_path_param_same_name_used_twice() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/{id}/sub/{id}");
    req.set_path_param("id", "replaced");
    assert_eq!(req.path(), "/v1/replaced/sub/replaced");
}

#[test]
fn test_path_with_no_params() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_path_param("unused", "value");
    assert_eq!(req.path(), "/v1/webhooks");
}

#[test]
fn test_path_param_with_special_chars() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_123-456_abc");
    assert_eq!(req.path(), "/v1/endpoints/ep_123-456_abc");
}

#[test]
fn test_path_param_with_url_encoding_chars() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/search/{query}");
    req.set_query_param("q", "hello world&foo=bar");
    // Query param value is stored as-is (caller should encode)
    assert_eq!(req.query_params().get("q").unwrap(), "hello world&foo=bar");
}

#[test]
fn test_path_param_empty_value() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/{id}");
    req.set_path_param("id", "");
    assert_eq!(req.path(), "/v1/");
}

#[test]
fn test_path_param_long_value() {
    let long_id = "a".repeat(500);
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/{id}");
    req.set_path_param("id", &long_id);
    assert!(req.path().contains(&long_id));
}

#[test]
fn test_path_no_params_preserved() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/analytics/deliveries");
    assert_eq!(req.path(), "/v1/analytics/deliveries");
}

// ── Query params ─────────────────────────────────────────────────────

#[test]
fn test_query_params_empty_by_default() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    assert!(req.query_params().is_empty());
}

#[test]
fn test_set_single_query_param() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    req.set_query_param("limit", "50");
    assert_eq!(req.query_params().get("limit").unwrap(), "50");
}

#[test]
fn test_set_multiple_query_params() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    req.set_query_param("limit", "50");
    req.set_query_param("offset", "100");
    req.set_query_param("event", "order.created");
    assert_eq!(req.query_params().len(), 3);
}

#[test]
fn test_query_param_overwrite() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    req.set_query_param("limit", "10");
    req.set_query_param("limit", "50");
    assert_eq!(req.query_params().get("limit").unwrap(), "50");
    assert_eq!(req.query_params().len(), 1);
}

#[test]
fn test_query_param_empty_value() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/search");
    req.set_query_param("q", "");
    assert_eq!(req.query_params().get("q").unwrap(), "");
}

#[test]
fn test_query_param_special_values() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/search");
    req.set_query_param("filter", "status:active AND type:webhook");
    assert_eq!(
        req.query_params().get("filter").unwrap(),
        "status:active AND type:webhook"
    );
}

#[test]
fn test_query_param_numeric_string() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    req.set_query_param("offset", "0");
    req.set_query_param("limit", "100");
    assert_eq!(req.query_params().get("offset").unwrap(), "0");
    assert_eq!(req.query_params().get("limit").unwrap(), "100");
}

// ── Header params ────────────────────────────────────────────────────

#[test]
fn test_header_params_empty_by_default() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    assert!(req.header_params().is_empty());
}

#[test]
fn test_set_header_param() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_header_param("idempotency-key", "my-key-123");
    assert_eq!(req.header_params().get("idempotency-key").unwrap(), "my-key-123");
}

#[test]
fn test_set_multiple_header_params() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    req.set_header_param("idempotency-key", "key1");
    req.set_header_param("x-request-id", "req_123");
    req.set_header_param("if-match", "\"etag\"");
    assert_eq!(req.header_params().len(), 3);
}

#[test]
fn test_header_param_overwrite() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    req.set_header_param("x-custom", "v1");
    req.set_header_param("x-custom", "v2");
    assert_eq!(req.header_params().get("x-custom").unwrap(), "v2");
}

#[test]
fn test_header_param_empty_value() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    req.set_header_param("x-empty", "");
    assert_eq!(req.header_params().get("x-empty").unwrap(), "");
}

// ── Body serialization ───────────────────────────────────────────────

#[test]
fn test_body_none_by_default() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    assert!(req.body_str().is_none());
}

#[test]
fn test_set_body_serializes_json() {
    #[derive(Serialize)]
    struct Payload {
        event: String,
        data: String,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_body(&Payload {
        event: "order.created".into(),
        data: "test".into(),
    });

    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert_eq!(parsed["event"], "order.created");
    assert_eq!(parsed["data"], "test");
}

#[test]
fn test_body_with_nested_json() {
    #[derive(Serialize)]
    struct Inner {
        order_id: String,
        amount: f64,
    }
    #[derive(Serialize)]
    struct Outer {
        event: String,
        data: Inner,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_body(&Outer {
        event: "payment.received".into(),
        data: Inner {
            order_id: "ord_999".into(),
            amount: 42.50,
        },
    });

    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert_eq!(parsed["data"]["order_id"], "ord_999");
    assert_eq!(parsed["data"]["amount"], 42.50);
}

#[test]
fn test_body_with_optional_fields() {
    #[derive(Serialize)]
    struct WithOptionals {
        name: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        description: Option<String>,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints");
    req.set_body(&WithOptionals {
        name: "test".into(),
        description: None,
    });
    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert!(parsed.get("description").is_none());
    assert_eq!(parsed["name"], "test");
}

#[test]
fn test_body_with_hashmap() {
    let mut map = HashMap::new();
    map.insert("key1".to_string(), "value1".to_string());

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    req.set_body(&map);

    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert_eq!(parsed["key1"], "value1");
}

#[test]
fn test_body_empty_struct() {
    #[derive(Serialize)]
    struct Empty {}

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    req.set_body(&Empty {});
    let body = req.body_str().unwrap();
    assert_eq!(body, "{}");
}

#[test]
fn test_body_with_vec() {
    let items = vec!["a", "b", "c"];
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/batch");
    req.set_body(&items);
    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert_eq!(parsed, serde_json::json!(["a", "b", "c"]));
}

#[test]
fn test_body_with_null_values() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    req.set_body(&serde_json::json!({"key": null}));
    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert!(parsed["key"].is_null());
}

// ── HttpMethod variants ──────────────────────────────────────────────

#[test]
fn test_all_http_methods() {
    let get = HookSniffRequest::new(HttpMethod::Get, "/v1/test");
    let post = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    let put = HookSniffRequest::new(HttpMethod::Put, "/v1/test");
    let delete = HookSniffRequest::new(HttpMethod::Delete, "/v1/test");

    assert_eq!(get.path(), "/v1/test");
    assert_eq!(post.path(), "/v1/test");
    assert_eq!(put.path(), "/v1/test");
    assert_eq!(delete.path(), "/v1/test");
}

#[test]
fn test_get_request_builder() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints");
    req.set_query_param("limit", "10");
    req.set_query_param("offset", "0");
    assert_eq!(req.path(), "/v1/endpoints");
    assert_eq!(req.query_params().len(), 2);
    assert!(req.body_str().is_none());
}

#[test]
fn test_post_request_builder() {
    #[derive(Serialize)]
    struct Input {
        url: String,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints");
    req.set_header_param("idempotency-key", "idem_123");
    req.set_body(&Input {
        url: "https://example.com".into(),
    });
    assert_eq!(req.path(), "/v1/endpoints");
    assert!(req.body_str().is_some());
    assert_eq!(
        req.header_params().get("idempotency-key").unwrap(),
        "idem_123"
    );
}

#[test]
fn test_delete_request_builder() {
    let mut req = HookSniffRequest::new(HttpMethod::Delete, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_123");
    assert_eq!(req.path(), "/v1/endpoints/ep_123");
    assert!(req.body_str().is_none());
}

#[test]
fn test_put_request_builder() {
    #[derive(Serialize)]
    struct Update {
        url: String,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Put, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_456");
    req.set_body(&Update {
        url: "https://updated.com".into(),
    });
    assert_eq!(req.path(), "/v1/endpoints/ep_456");
}

// ── Combined path + query + body ─────────────────────────────────────

#[test]
fn test_full_request_builder() {
    #[derive(Serialize)]
    struct UpdateEndpoint {
        url: String,
        description: String,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Put, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_xyz");
    req.set_query_param("team_id", "team_1");
    req.set_header_param("if-match", "\"etag123\"");
    req.set_body(&UpdateEndpoint {
        url: "https://new.example.com".into(),
        description: "updated endpoint".into(),
    });

    assert_eq!(req.path(), "/v1/endpoints/ep_xyz");
    assert_eq!(req.query_params().get("team_id").unwrap(), "team_1");
    assert_eq!(req.header_params().get("if-match").unwrap(), "\"etag123\"");

    let body: serde_json::Value = serde_json::from_str(req.body_str().unwrap()).unwrap();
    assert_eq!(body["url"], "https://new.example.com");
}

#[test]
fn test_complex_path_with_query() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/teams/{team_id}/members");
    req.set_path_param("team_id", "team_abc");
    req.set_query_param("role", "admin");
    req.set_query_param("limit", "25");

    assert_eq!(req.path(), "/v1/teams/team_abc/members");
    assert_eq!(req.query_params().len(), 2);
}

#[test]
fn test_webhook_send_request_shape() {
    #[derive(Serialize)]
    struct WebhookInput {
        endpoint_id: String,
        event: String,
        data: serde_json::Value,
    }

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_header_param("idempotency-key", "idem_webhook_001");
    req.set_body(&WebhookInput {
        endpoint_id: "ep_1".into(),
        event: "order.created".into(),
        data: serde_json::json!({"order_id": "12345"}),
    });

    let body: serde_json::Value = serde_json::from_str(req.body_str().unwrap()).unwrap();
    assert_eq!(body["endpoint_id"], "ep_1");
    assert_eq!(body["event"], "order.created");
    assert_eq!(body["data"]["order_id"], "12345");
}
