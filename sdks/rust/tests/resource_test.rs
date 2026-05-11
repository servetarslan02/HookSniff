use hooksniff::request::{HookSniffRequest, HttpMethod};
use serde::Serialize;
use std::collections::HashMap;

// ── Path building ────────────────────────────────────────────────────

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
    // String::replace replaces ALL occurrences
    assert_eq!(req.path(), "/v1/replaced/sub/replaced");
}

#[test]
fn test_path_with_no_params() {
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_path_param("unused", "value");
    // Unrelated param doesn't change path
    assert_eq!(req.path(), "/v1/webhooks");
}

#[test]
fn test_path_param_with_special_chars() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/endpoints/{id}");
    req.set_path_param("id", "ep_123-456_abc");
    assert_eq!(req.path(), "/v1/endpoints/ep_123-456_abc");
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
    assert_eq!(req.query_params().get("limit").unwrap(), "50");
    assert_eq!(req.query_params().get("offset").unwrap(), "100");
    assert_eq!(req.query_params().get("event").unwrap(), "order.created");
}

#[test]
fn test_query_param_overwrite() {
    let mut req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    req.set_query_param("limit", "10");
    req.set_query_param("limit", "50");
    assert_eq!(req.query_params().get("limit").unwrap(), "50");
    assert_eq!(req.query_params().len(), 1);
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

// ── Body serialization ───────────────────────────────────────────────

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
fn test_body_none_by_default() {
    let req = HookSniffRequest::new(HttpMethod::Get, "/v1/webhooks");
    assert!(req.body_str().is_none());
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
        #[serde(skip_serializing_if = "Option::is_none")]
        tags: Option<Vec<String>>,
    }

    // With None values — should be omitted
    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints");
    req.set_body(&WithOptionals {
        name: "test".into(),
        description: None,
        tags: None,
    });
    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert!(parsed.get("description").is_none());
    assert!(parsed.get("tags").is_none());
    assert_eq!(parsed["name"], "test");

    // With Some values — should be included
    let mut req2 = HookSniffRequest::new(HttpMethod::Post, "/v1/endpoints");
    req2.set_body(&WithOptionals {
        name: "test".into(),
        description: Some("a desc".into()),
        tags: Some(vec!["a".into(), "b".into()]),
    });
    let body2 = req2.body_str().unwrap();
    let parsed2: serde_json::Value = serde_json::from_str(body2).unwrap();
    assert_eq!(parsed2["description"], "a desc");
    assert_eq!(parsed2["tags"], serde_json::json!(["a", "b"]));
}

#[test]
fn test_body_with_hashmap() {
    let mut headers = HashMap::new();
    headers.insert("X-Custom".to_string(), "value1".to_string());
    headers.insert("X-Other".to_string(), "value2".to_string());

    let mut req = HookSniffRequest::new(HttpMethod::Post, "/v1/webhooks");
    req.set_body(&headers);

    let body = req.body_str().unwrap();
    let parsed: serde_json::Value = serde_json::from_str(body).unwrap();
    assert_eq!(parsed["X-Custom"], "value1");
    assert_eq!(parsed["X-Other"], "value2");
}

// ── HttpMethod variants ──────────────────────────────────────────────

#[test]
fn test_all_http_methods() {
    let get = HookSniffRequest::new(HttpMethod::Get, "/v1/test");
    let post = HookSniffRequest::new(HttpMethod::Post, "/v1/test");
    let put = HookSniffRequest::new(HttpMethod::Put, "/v1/test");
    let delete = HookSniffRequest::new(HttpMethod::Delete, "/v1/test");

    // Just verify they construct without panic
    assert_eq!(get.path(), "/v1/test");
    assert_eq!(post.path(), "/v1/test");
    assert_eq!(put.path(), "/v1/test");
    assert_eq!(delete.path(), "/v1/test");
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
    assert_eq!(body["description"], "updated endpoint");
}
