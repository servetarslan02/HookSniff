/**
 * HookSniff SDK — Serialization Model Tests
 *
 * Tests _toJsonObject and _fromJsonObject for all models.
 */

import {
  EndpointModel,
  EndpointSecretModel,
  WebhookModel,
  DeliveryModel,
  DeliveryListModel,
  BatchModel,
  AuthModel,
  TrendPointModel,
  TrendResponseModel,
  SuccessRateModel,
  LatencyModel,
  ApiKeyModel,
  AlertRuleModel,
  AlertNotificationModel,
  PlanInfoModel,
  PortalModel,
  HealthModel,
  SearchModel,
  TeamMemberModel,
} from "../models";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, name: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, name);
}

console.log("🪝 HookSniff SDK — Serialization Model Tests\n");

// ─── EndpointModel ──────────────────────────────────────────────────────────

console.log("EndpointModel:");

assertDeepEqual(
  EndpointModel._toJsonObject({ url: "https://example.com", description: "test", rate_limit: 100, active: true }),
  { url: "https://example.com", description: "test", rate_limit: 100, active: true },
  "_toJsonObject serializes all fields"
);

assertDeepEqual(
  EndpointModel._toJsonObject({ url: "https://example.com" }),
  { url: "https://example.com" },
  "_toJsonObject skips undefined fields"
);

const endpointOut = EndpointModel._fromJsonObject({
  id: "ep_123",
  url: "https://example.com",
  description: "test",
  rate_limit: 100,
  active: true,
  created_at: "2024-01-01",
  updated_at: "2024-01-02",
});
assert(endpointOut.id === "ep_123", "_fromJsonObject parses id");
assert(endpointOut.url === "https://example.com", "_fromJsonObject parses url");
assert(endpointOut.rate_limit === 100, "_fromJsonObject parses rate_limit");

const endpointDefaults = EndpointModel._fromJsonObject({ id: "ep_1", url: "https://x.com" });
assert(endpointDefaults.description === "", "_fromJsonObject defaults empty description");
assert(endpointDefaults.active === true, "_fromJsonObject defaults active to true");
assert(endpointDefaults.rate_limit === 0, "_fromJsonObject defaults rate_limit to 0");

// ─── EndpointSecretModel ────────────────────────────────────────────────────

console.log("\nEndpointSecretModel:");

const secret = EndpointSecretModel._fromJsonObject({ key: "whsec_abc123" });
assert(secret.key === "whsec_abc123", "_fromJsonObject parses key");

// ─── WebhookModel ───────────────────────────────────────────────────────────

console.log("\nWebhookModel:");

assertDeepEqual(
  WebhookModel._toJsonObject({ endpoint_id: "ep_1", event: "order.created", data: { id: 1 } }),
  { endpoint_id: "ep_1", event: "order.created", data: { id: 1 } },
  "_toJsonObject serializes webhook send input"
);

assertDeepEqual(
  WebhookModel._toBatchJsonObject({ endpoint_id: "ep_1", events: [{ event: "test", data: {} }] }),
  { endpoint_id: "ep_1", events: [{ event: "test", data: {} }] },
  "_toBatchJsonObject serializes batch input"
);

// ─── DeliveryModel ──────────────────────────────────────────────────────────

console.log("\nDeliveryModel:");

const delivery = DeliveryModel._fromJsonObject({
  id: "del_123",
  endpoint_id: "ep_1",
  event: "order.created",
  status: "delivered",
  response_code: 200,
  response_body: "OK",
  created_at: "2024-01-01",
  delivered_at: "2024-01-01T00:01:00Z",
  attempt_count: 1,
});
assert(delivery.id === "del_123", "_fromJsonObject parses delivery id");
assert(delivery.status === "delivered", "_fromJsonObject parses status");
assert(delivery.delivered_at === "2024-01-01T00:01:00Z", "_fromJsonObject parses delivered_at");

const deliveryNull = DeliveryModel._fromJsonObject({
  id: "del_456",
  endpoint_id: "ep_1",
  event: "test",
  delivered_at: null,
});
assert(deliveryNull.delivered_at === null, "_fromJsonObject handles null delivered_at");

// ─── DeliveryListModel ──────────────────────────────────────────────────────

console.log("\nDeliveryListModel:");

const deliveryList = DeliveryListModel._fromJsonObject({
  data: [
    { id: "del_1", endpoint_id: "ep_1", event: "test" },
    { id: "del_2", endpoint_id: "ep_1", event: "test2" },
  ],
  has_more: true,
});
assert(deliveryList.data.length === 2, "_fromJsonObject parses array");
assert(deliveryList.data[0].id === "del_1", "_fromJsonObject parses nested delivery");
assert(deliveryList.has_more === true, "_fromJsonObject parses has_more");

const emptyList = DeliveryListModel._fromJsonObject({});
assert(emptyList.data.length === 0, "_fromJsonObject handles missing data array");
assert(emptyList.has_more === false, "_fromJsonObject defaults has_more to false");

// ─── BatchModel ─────────────────────────────────────────────────────────────

console.log("\nBatchModel:");

const batch = BatchModel._fromJsonObject({ batch_id: "batch_1", count: 5 });
assert(batch.batch_id === "batch_1", "_fromJsonObject parses batch_id");
assert(batch.count === 5, "_fromJsonObject parses count");

// ─── AuthModel ──────────────────────────────────────────────────────────────

console.log("\nAuthModel:");

assertDeepEqual(
  AuthModel._toRegisterJsonObject({ email: "test@test.com", password: "pass123" }),
  { email: "test@test.com", password: "pass123" },
  "_toRegisterJsonObject serializes"
);

assertDeepEqual(
  AuthModel._toLoginJsonObject({ email: "test@test.com", password: "pass123", totp_code: "123456" }),
  { email: "test@test.com", password: "pass123", totp_code: "123456" },
  "_toLoginJsonObject includes totp_code"
);

assertDeepEqual(
  AuthModel._toLoginJsonObject({ email: "test@test.com", password: "pass123" }),
  { email: "test@test.com", password: "pass123" },
  "_toLoginJsonObject omits undefined totp_code"
);

const authOut = AuthModel._fromJsonObject({
  token: "jwt_123",
  user_id: "usr_1",
  email: "test@test.com",
  plan: "pro",
  is_admin: false,
});
assert(authOut.token === "jwt_123", "_fromJsonObject parses token");
assert(authOut.plan === "pro", "_fromJsonObject parses plan");

const authDefaults = AuthModel._fromJsonObject({ token: "t", user_id: "u", email: "e" });
assert(authDefaults.plan === "free", "_fromJsonObject defaults plan to free");
assert(authDefaults.is_admin === false, "_fromJsonObject defaults is_admin to false");

const twoFa = AuthModel._from2faJsonObject({ secret: "ABC", qr_code_url: "https://qr.test" });
assert(twoFa.secret === "ABC", "_from2faJsonObject parses secret");

// ─── Analytics ──────────────────────────────────────────────────────────────

console.log("\nAnalytics:");

const trendPoint = TrendPointModel._fromJsonObject({ date: "2024-01-01", total: 100, delivered: 95, failed: 5 });
assert(trendPoint.total === 100, "_fromJsonObject parses trend point");

const trendResponse = TrendResponseModel._fromJsonObject({
  data: [{ date: "2024-01-01", total: 10, delivered: 8, failed: 2 }],
});
assert(trendResponse.data.length === 1, "_fromJsonObject parses trend array");
assert(trendResponse.data[0].total === 10, "_fromJsonObject parses nested trend");

const emptyTrend = TrendResponseModel._fromJsonObject({});
assert(emptyTrend.data.length === 0, "_fromJsonObject handles missing data");

const successRate = SuccessRateModel._fromJsonObject({ rate: 0.95, total: 100, delivered: 95, failed: 5 });
assert(successRate.rate === 0.95, "_fromJsonObject parses rate");

const latency = LatencyModel._fromJsonObject({ p50: 100, p95: 200, p99: 500, avg: 150 });
assert(latency.p99 === 500, "_fromJsonObject parses p99");

// ─── API Keys ───────────────────────────────────────────────────────────────

console.log("\nApiKeyModel:");

assertDeepEqual(
  ApiKeyModel._toJsonObject({ name: "test-key" }),
  { name: "test-key" },
  "_toJsonObject serializes name"
);

assertDeepEqual(
  ApiKeyModel._toJsonObject({ name: "test-key", expires_at: "2025-01-01" }),
  { name: "test-key", expires_at: "2025-01-01" },
  "_toJsonObject includes expires_at"
);

const apiKey = ApiKeyModel._fromJsonObject({
  id: "key_1",
  name: "test",
  key: "sk_abc",
  created_at: "2024-01-01",
  expires_at: null,
  last_used_at: null,
});
assert(apiKey.id === "key_1", "_fromJsonObject parses id");
assert(apiKey.expires_at === null, "_fromJsonObject handles null expires_at");

// ─── Alerts ─────────────────────────────────────────────────────────────────

console.log("\nAlerts:");

const alertRule = AlertRuleModel._fromJsonObject({
  id: "rule_1",
  name: "High Error Rate",
  condition: "error_rate > 0.05",
  threshold: 0.05,
  enabled: true,
  created_at: "2024-01-01",
});
assert(alertRule.name === "High Error Rate", "_fromJsonObject parses alert rule");

const alertNotif = AlertNotificationModel._fromJsonObject({
  id: "notif_1",
  rule_id: "rule_1",
  message: "Error rate exceeded",
  severity: "critical",
  created_at: "2024-01-01",
  read: false,
});
assert(alertNotif.severity === "critical", "_fromJsonObject parses severity");
assert(alertNotif.read === false, "_fromJsonObject parses read status");

// ─── Billing ────────────────────────────────────────────────────────────────

console.log("\nBilling:");

const planInfo = PlanInfoModel._fromJsonObject({
  plan: "pro",
  webhooks_remaining: 9000,
  webhooks_used: 1000,
  endpoints_remaining: 45,
  current_period_end: "2024-02-01",
});
assert(planInfo.plan === "pro", "_fromJsonObject parses plan");
assert(planInfo.webhooks_remaining === 9000, "_fromJsonObject parses remaining");

const portal = PortalModel._fromJsonObject({ url: "https://billing.polar.sh/portal" });
assert(portal.url.includes("polar.sh"), "_fromJsonObject parses portal url");

// ─── Health ─────────────────────────────────────────────────────────────────

console.log("\nHealthModel:");

const health = HealthModel._fromJsonObject({
  status: "ok",
  db: { status: "ok", latency_ms: 23 },
  queue: { status: "ok", latency_ms: 22, pending: 0 },
  otel: { enabled: true, endpoint: "https://otel.example.com", headers_configured: true },
  uptime_seconds: 86400,
});
assert(health.status === "ok", "_fromJsonObject parses status");
assert(health.db.latency_ms === 23, "_fromJsonObject parses db latency");
assert(health.queue.pending === 0, "_fromJsonObject parses queue pending");
assert(health.otel?.enabled === true, "_fromJsonObject parses otel");

const healthNoOtel = HealthModel._fromJsonObject({
  status: "ok",
  db: { status: "ok", latency_ms: 10 },
  queue: { status: "ok", latency_ms: 5, pending: 0 },
  uptime_seconds: 100,
});
assert(healthNoOtel.otel === undefined, "_fromJsonObject handles missing otel");

// ─── Search ─────────────────────────────────────────────────────────────────

console.log("\nSearchModel:");

const searchResult = SearchModel._fromJsonObject({
  id: "sr_1",
  type: "delivery",
  data: { event: "test" },
  score: 0.95,
});
assert(searchResult.id === "sr_1", "_fromJsonObject parses search result");
assert(searchResult.score === 0.95, "_fromJsonObject parses score");

// ─── Teams ──────────────────────────────────────────────────────────────────

console.log("\nTeamMemberModel:");

const member = TeamMemberModel._fromJsonObject({
  id: "usr_1",
  email: "admin@test.com",
  role: "admin",
  joined_at: "2024-01-01",
});
assert(member.role === "admin", "_fromJsonObject parses role");

const memberDefaults = TeamMemberModel._fromJsonObject({ id: "u", email: "e@e.com" });
assert(memberDefaults.role === "member", "_fromJsonObject defaults role to member");

// ─── Results ────────────────────────────────────────────────────────────────

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All tests passed! 🎉");
}
