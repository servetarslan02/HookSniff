//! HookSniff Serialization Tests
//!
//! Tests for model serialization/deserialization round-trips.

use hooksniff::resources::alerts::{AlertNotification, AlertRule};
use hooksniff::resources::analytics::{DeliveryStats, LatencyOutput, SuccessRateOutput};
use hooksniff::resources::api_keys::{ApiKeyCreateInput, ApiKeyOutput};
use hooksniff::resources::auth::{AuthOutput, ForgotPasswordInput, LoginInput, MessageOutput, RegisterInput, TwoFactorInput};
use hooksniff::resources::billing::{PlanOutput, PortalOutput, UpgradeInput};
use hooksniff::resources::endpoints::{EndpointCreateInput, EndpointOutput, EndpointSecretOutput, EndpointUpdateInput};
use hooksniff::resources::health::HealthOutput;
use hooksniff::resources::search::SearchResult;
use hooksniff::resources::teams::{InviteInput, InviteOutput, TeamMember};
use hooksniff::resources::webhooks::{BatchError, BatchOutput, WebhookBatchInput, WebhookOutput, WebhookSendInput};
use serde_json::{json, Value};

// ── AlertRule ─────────────────────────────────────────────────────────

#[test]
fn test_alert_rule_round_trip() {
    let rule = AlertRule {
        id: "rule_123".into(),
        name: "High failure rate".into(),
        condition: "failure_rate > 0.1".into(),
        threshold: 0.1,
        enabled: true,
        created_at: "2024-01-01T00:00:00Z".into(),
    };
    let json = serde_json::to_string(&rule).unwrap();
    let back: AlertRule = serde_json::from_str(&json).unwrap();
    assert_eq!(back.id, "rule_123");
    assert_eq!(back.name, "High failure rate");
    assert!(back.enabled);
}

#[test]
fn test_alert_rule_deserialize_from_json() {
    let json = r#"{
        "id": "rule_456",
        "name": "Latency spike",
        "condition": "p99_ms > 5000",
        "threshold": 5000.0,
        "enabled": false,
        "created_at": "2024-06-15T12:00:00Z"
    }"#;
    let rule: AlertRule = serde_json::from_str(json).unwrap();
    assert_eq!(rule.id, "rule_456");
    assert!(!rule.enabled);
}

// ── AlertNotification ─────────────────────────────────────────────────

#[test]
fn test_alert_notification_round_trip() {
    let notif = AlertNotification {
        id: "notif_1".into(),
        rule_id: "rule_1".into(),
        message: "Failure rate exceeded threshold".into(),
        read: false,
        created_at: "2024-01-01T00:00:00Z".into(),
    };
    let json = serde_json::to_string(&notif).unwrap();
    let back: AlertNotification = serde_json::from_str(&json).unwrap();
    assert_eq!(back.id, "notif_1");
    assert!(!back.read);
}

// ── DeliveryStats ────────────────────────────────────────────────────

#[test]
fn test_delivery_stats_round_trip() {
    let stats = DeliveryStats {
        total: 1000,
        success: 950,
        failed: 50,
        pending: Some(10),
    };
    let json = serde_json::to_string(&stats).unwrap();
    let back: DeliveryStats = serde_json::from_str(&json).unwrap();
    assert_eq!(back.total, 1000);
    assert_eq!(back.success, 950);
    assert_eq!(back.pending, Some(10));
}

#[test]
fn test_delivery_stats_without_pending() {
    let json = r#"{"total": 100, "success": 90, "failed": 10}"#;
    let stats: DeliveryStats = serde_json::from_str(json).unwrap();
    assert_eq!(stats.total, 100);
    assert!(stats.pending.is_none());
}

#[test]
fn test_delivery_stats_pending_none_skipped() {
    let stats = DeliveryStats {
        total: 50,
        success: 50,
        failed: 0,
        pending: None,
    };
    let json = serde_json::to_string(&stats).unwrap();
    let parsed: Value = serde_json::from_str(&json).unwrap();
    assert!(parsed.get("pending").is_none());
}

// ── SuccessRateOutput ─────────────────────────────────────────────────

#[test]
fn test_success_rate_round_trip() {
    let sr = SuccessRateOutput {
        rate: 0.95,
        period: "7d".into(),
    };
    let json = serde_json::to_string(&sr).unwrap();
    let back: SuccessRateOutput = serde_json::from_str(&json).unwrap();
    assert!((back.rate - 0.95).abs() < f64::EPSILON);
    assert_eq!(back.period, "7d");
}

// ── LatencyOutput ────────────────────────────────────────────────────

#[test]
fn test_latency_round_trip() {
    let lat = LatencyOutput {
        avg_ms: 120.5,
        p50_ms: 100.0,
        p95_ms: 250.0,
        p99_ms: 500.0,
        period: "24h".into(),
    };
    let json = serde_json::to_string(&lat).unwrap();
    let back: LatencyOutput = serde_json::from_str(&json).unwrap();
    assert!((back.avg_ms - 120.5).abs() < f64::EPSILON);
    assert!((back.p99_ms - 500.0).abs() < f64::EPSILON);
}

// ── ApiKeyCreateInput ─────────────────────────────────────────────────

#[test]
fn test_api_key_create_input_round_trip() {
    let input = ApiKeyCreateInput {
        name: "Production Key".into(),
        expires_at: Some("2025-12-31T23:59:59Z".into()),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ApiKeyCreateInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.name, "Production Key");
    assert!(back.expires_at.is_some());
}

#[test]
fn test_api_key_create_input_no_expiry() {
    let input = ApiKeyCreateInput {
        name: "Permanent".into(),
        expires_at: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let parsed: Value = serde_json::from_str(&json).unwrap();
    assert!(parsed.get("expires_at").is_none());
}

// ── ApiKeyOutput ──────────────────────────────────────────────────────

#[test]
fn test_api_key_output_round_trip() {
    let output = ApiKeyOutput {
        id: "key_123".into(),
        name: "Test Key".into(),
        key: "sk_live_abc123".into(),
        created_at: "2024-01-01T00:00:00Z".into(),
        expires_at: None,
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: ApiKeyOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.id, "key_123");
    assert_eq!(back.key, "sk_live_abc123");
}

// ── Auth models ──────────────────────────────────────────────────────

#[test]
fn test_register_input_round_trip() {
    let input = RegisterInput {
        email: "test@example.com".into(),
        password: "secure123".into(),
        name: "Test User".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: RegisterInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "test@example.com");
    assert_eq!(back.password, "secure123");
}

#[test]
fn test_login_input_round_trip() {
    let input = LoginInput {
        email: "user@test.com".into(),
        password: "pass123".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: LoginInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "user@test.com");
}

#[test]
fn test_auth_output_round_trip() {
    let output = AuthOutput {
        token: "jwt_abc123".into(),
        user: Some(json!({"id": "u1", "email": "test@test.com"})),
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: AuthOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.token, "jwt_abc123");
    assert!(back.user.is_some());
}

#[test]
fn test_auth_output_no_user() {
    let json = r#"{"token": "jwt_xyz"}"#;
    let output: AuthOutput = serde_json::from_str(json).unwrap();
    assert_eq!(output.token, "jwt_xyz");
    assert!(output.user.is_none());
}

#[test]
fn test_two_factor_input_round_trip() {
    let input = TwoFactorInput {
        code: "123456".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: TwoFactorInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.code, "123456");
}

#[test]
fn test_message_output_round_trip() {
    let output = MessageOutput {
        message: "Email sent successfully".into(),
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: MessageOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.message, "Email sent successfully");
}

#[test]
fn test_forgot_password_input_round_trip() {
    let input = ForgotPasswordInput {
        email: "forgot@test.com".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: ForgotPasswordInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "forgot@test.com");
}

// ── Billing models ────────────────────────────────────────────────────

#[test]
fn test_plan_output_round_trip() {
    let plan = PlanOutput {
        plan: "pro".into(),
        status: "active".into(),
        webhook_limit: Some(10000),
        endpoint_limit: Some(50),
        current_usage: Some(1234),
    };
    let json = serde_json::to_string(&plan).unwrap();
    let back: PlanOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.plan, "pro");
    assert_eq!(back.webhook_limit, Some(10000));
}

#[test]
fn test_plan_output_minimal() {
    let json = r#"{"plan": "free", "status": "active"}"#;
    let plan: PlanOutput = serde_json::from_str(json).unwrap();
    assert_eq!(plan.plan, "free");
    assert!(plan.webhook_limit.is_none());
}

#[test]
fn test_upgrade_input_round_trip() {
    let input = UpgradeInput {
        plan: "enterprise".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: UpgradeInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.plan, "enterprise");
}

#[test]
fn test_portal_output_round_trip() {
    let output = PortalOutput {
        url: "https://billing.stripe.com/session/abc123".into(),
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: PortalOutput = serde_json::from_str(&json).unwrap();
    assert!(back.url.contains("stripe.com"));
}

// ── Endpoint models ──────────────────────────────────────────────────

#[test]
fn test_endpoint_output_round_trip() {
    let ep = EndpointOutput {
        id: "ep_123".into(),
        url: "https://example.com/webhook".into(),
        description: "Test endpoint".into(),
        rate_limit: 100,
        active: true,
        created_at: "2024-01-01T00:00:00Z".into(),
        updated_at: "2024-01-01T00:00:00Z".into(),
    };
    let json = serde_json::to_string(&ep).unwrap();
    let back: EndpointOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.id, "ep_123");
    assert!(back.active);
    assert_eq!(back.rate_limit, 100);
}

#[test]
fn test_endpoint_create_input_full() {
    let input = EndpointCreateInput {
        url: "https://example.com/hook".into(),
        description: Some("Production".into()),
        rate_limit: Some(50),
        active: Some(true),
    };
    let json = serde_json::to_string(&input).unwrap();
    let parsed: Value = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed["url"], "https://example.com/hook");
    assert_eq!(parsed["description"], "Production");
    assert_eq!(parsed["rate_limit"], 50);
}

#[test]
fn test_endpoint_create_input_minimal() {
    let input = EndpointCreateInput {
        url: "https://example.com/hook".into(),
        description: None,
        rate_limit: None,
        active: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let parsed: Value = serde_json::from_str(&json).unwrap();
    assert!(parsed.get("description").is_none());
    assert!(parsed.get("rate_limit").is_none());
}

#[test]
fn test_endpoint_update_input_round_trip() {
    let input = EndpointUpdateInput {
        url: Some("https://new-url.com".into()),
        description: Some("Updated".into()),
        rate_limit: None,
        active: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: EndpointUpdateInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.url.unwrap(), "https://new-url.com");
    assert!(back.rate_limit.is_none());
}

#[test]
fn test_endpoint_secret_round_trip() {
    let secret = EndpointSecretOutput {
        key: "whsec_dGVzdA==".into(),
    };
    let json = serde_json::to_string(&secret).unwrap();
    let back: EndpointSecretOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.key, "whsec_dGVzdA==");
}

// ── Health model ──────────────────────────────────────────────────────

#[test]
fn test_health_output_round_trip() {
    let health = HealthOutput {
        status: "ok".into(),
        version: Some("1.0.0".into()),
        uptime: Some(86400),
    };
    let json = serde_json::to_string(&health).unwrap();
    let back: HealthOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.status, "ok");
    assert_eq!(back.uptime, Some(86400));
}

#[test]
fn test_health_output_minimal() {
    let json = r#"{"status": "degraded"}"#;
    let health: HealthOutput = serde_json::from_str(json).unwrap();
    assert_eq!(health.status, "degraded");
    assert!(health.version.is_none());
}

// ── SearchResult ──────────────────────────────────────────────────────

#[test]
fn test_search_result_round_trip() {
    let result = SearchResult {
        id: "sr_1".into(),
        endpoint_id: "ep_1".into(),
        event: "order.created".into(),
        status: "delivered".into(),
        created_at: "2024-01-01T00:00:00Z".into(),
        data: Some(json!({"order_id": "12345"})),
    };
    let json = serde_json::to_string(&result).unwrap();
    let back: SearchResult = serde_json::from_str(&json).unwrap();
    assert_eq!(back.event, "order.created");
    assert!(back.data.is_some());
}

#[test]
fn test_search_result_no_data() {
    let json = r#"{
        "id": "sr_2",
        "endpoint_id": "ep_2",
        "event": "payment.received",
        "status": "pending",
        "created_at": "2024-01-01T00:00:00Z"
    }"#;
    let result: SearchResult = serde_json::from_str(json).unwrap();
    assert!(result.data.is_none());
}

// ── Team models ───────────────────────────────────────────────────────

#[test]
fn test_team_member_round_trip() {
    let member = TeamMember {
        id: "mem_1".into(),
        email: "dev@team.com".into(),
        name: "Dev".into(),
        role: "admin".into(),
        joined_at: "2024-01-01T00:00:00Z".into(),
    };
    let json = serde_json::to_string(&member).unwrap();
    let back: TeamMember = serde_json::from_str(&json).unwrap();
    assert_eq!(back.role, "admin");
}

#[test]
fn test_invite_input_round_trip() {
    let input = InviteInput {
        email: "new@team.com".into(),
        role: "member".into(),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: InviteInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.email, "new@team.com");
}

#[test]
fn test_invite_output_round_trip() {
    let output = InviteOutput {
        message: "Invitation sent".into(),
        invite_id: Some("inv_123".into()),
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: InviteOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.invite_id, Some("inv_123".into()));
}

#[test]
fn test_invite_output_no_id() {
    let json = r#"{"message": "Sent"}"#;
    let output: InviteOutput = serde_json::from_str(json).unwrap();
    assert!(output.invite_id.is_none());
}

// ── Webhook models ────────────────────────────────────────────────────

#[test]
fn test_webhook_send_input_round_trip() {
    let input = WebhookSendInput {
        endpoint_id: "ep_1".into(),
        event: "order.created".into(),
        data: json!({"order_id": "12345", "total": 99.99}),
        headers: None,
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: WebhookSendInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.event, "order.created");
    assert_eq!(back.data["order_id"], "12345");
}

#[test]
fn test_webhook_send_input_with_headers() {
    let mut headers = std::collections::HashMap::new();
    headers.insert("X-Custom".into(), "value".into());

    let input = WebhookSendInput {
        endpoint_id: "ep_1".into(),
        event: "test".into(),
        data: json!({}),
        headers: Some(headers),
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: WebhookSendInput = serde_json::from_str(&json).unwrap();
    assert!(back.headers.is_some());
    assert_eq!(back.headers.unwrap()["X-Custom"], "value");
}

#[test]
fn test_webhook_output_round_trip() {
    let output = WebhookOutput {
        id: "wh_1".into(),
        endpoint_id: "ep_1".into(),
        event: "order.created".into(),
        data: json!({"key": "value"}),
        status: "delivered".into(),
        created_at: "2024-01-01T00:00:00Z".into(),
        response_code: Some(200),
        response_body: Some("OK".into()),
        attempts: Some(1),
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: WebhookOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.status, "delivered");
    assert_eq!(back.response_code, Some(200));
}

#[test]
fn test_webhook_output_minimal() {
    let json = r#"{
        "id": "wh_2",
        "endpoint_id": "ep_2",
        "event": "test",
        "data": {},
        "status": "pending",
        "created_at": "2024-01-01T00:00:00Z"
    }"#;
    let output: WebhookOutput = serde_json::from_str(json).unwrap();
    assert!(output.response_code.is_none());
    assert!(output.attempts.is_none());
}

#[test]
fn test_batch_output_round_trip() {
    let output = BatchOutput {
        webhook_ids: vec!["wh_1".into(), "wh_2".into()],
        errors: None,
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: BatchOutput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.webhook_ids.len(), 2);
}

#[test]
fn test_batch_output_with_errors() {
    let output = BatchOutput {
        webhook_ids: vec!["wh_1".into()],
        errors: Some(vec![BatchError {
            index: 1,
            error: "Invalid endpoint".into(),
        }]),
    };
    let json = serde_json::to_string(&output).unwrap();
    let back: BatchOutput = serde_json::from_str(&json).unwrap();
    assert!(back.errors.is_some());
    assert_eq!(back.errors.unwrap()[0].index, 1);
}

#[test]
fn test_batch_error_round_trip() {
    let error = BatchError {
        index: 5,
        error: "Rate limited".into(),
    };
    let json = serde_json::to_string(&error).unwrap();
    let back: BatchError = serde_json::from_str(&json).unwrap();
    assert_eq!(back.index, 5);
    assert_eq!(back.error, "Rate limited");
}

#[test]
fn test_webhook_batch_input_round_trip() {
    let input = WebhookBatchInput {
        webhooks: vec![
            WebhookSendInput {
                endpoint_id: "ep_1".into(),
                event: "a".into(),
                data: json!({}),
                headers: None,
            },
            WebhookSendInput {
                endpoint_id: "ep_2".into(),
                event: "b".into(),
                data: json!({"x": 1}),
                headers: None,
            },
        ],
    };
    let json = serde_json::to_string(&input).unwrap();
    let back: WebhookBatchInput = serde_json::from_str(&json).unwrap();
    assert_eq!(back.webhooks.len(), 2);
    assert_eq!(back.webhooks[1].event, "b");
}
