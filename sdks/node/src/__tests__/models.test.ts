/**
 * HookSniff SDK — Serialization Model Tests
 *
 * Tests for all models: serialization, deserialization, validation, edge cases.
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

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  assert(ok, ok ? message : `${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertThrows(fn: () => void, message: string) {
  try {
    fn();
    assert(false, `${message} (should have thrown)`);
  } catch {
    assert(true, message);
  }
}

// ─── Endpoint ───────────────────────────────────────────────────────────────

function testEndpointModel() {
  console.log("EndpointModel:");

  const input = { url: "https://example.com", description: "test", rate_limit: 100, active: true };
  const json = EndpointModel._toJsonObject(input);
  assertEqual(json.url, "https://example.com", "_toJsonObject serializes url");
  assertEqual(json.description, "test", "_toJsonObject serializes description");
  assertEqual(json.rate_limit, 100, "_toJsonObject serializes rate_limit");
  assertEqual(json.active, true, "_toJsonObject serializes active");

  const partial = { url: "https://example.com" };
  const partialJson = EndpointModel._toJsonObject(partial);
  assertEqual(partialJson.url, "https://example.com", "_toJsonObject partial — url set");
  assert(partialJson.description === undefined, "_toJsonObject partial — description omitted");

  // Validation: url required when creating (object has url key)
  assertThrows(
    () => EndpointModel._toJsonObject({ url: undefined } as unknown as Parameters<typeof EndpointModel._toJsonObject>[0]),
    "_toJsonObject rejects create with undefined url"
  );

  // Empty object is update (no required fields) — should not throw
  const updateJson = EndpointModel._toJsonObject({});
  assert(Object.keys(updateJson).length === 0, "_toJsonObject empty object = valid update (no fields)");

  const output = EndpointModel._fromJsonObject({
    id: "ep_123",
    url: "https://example.com",
    description: "test ep",
    rate_limit: 50,
    active: false,
    created_at: "2026-01-01",
    updated_at: "2026-01-02",
  });
  assertEqual(output.id, "ep_123", "_fromJsonObject parses id");
  assertEqual(output.url, "https://example.com", "_fromJsonObject parses url");
  assertEqual(output.description, "test ep", "_fromJsonObject parses description");
  assertEqual(output.rate_limit, 50, "_fromJsonObject parses rate_limit");
  assertEqual(output.active, false, "_fromJsonObject parses active");

  const withDefaults = EndpointModel._fromJsonObject({ id: "ep_1", url: "https://x.com" });
  assertEqual(withDefaults.description, "", "_fromJsonObject defaults empty description");
  assertEqual(withDefaults.active, true, "_fromJsonObject defaults active to true");
  assertEqual(withDefaults.rate_limit, 0, "_fromJsonObject defaults rate_limit to 0");

  assertThrows(
    () => EndpointModel._fromJsonObject({}),
    "_fromJsonObject rejects missing id"
  );
  assertThrows(
    () => EndpointModel._fromJsonObject({ id: "ep_1" }),
    "_fromJsonObject rejects missing url"
  );
}

function testEndpointSecretModel() {
  console.log("\nEndpointSecretModel:");
  const output = EndpointSecretModel._fromJsonObject({ key: "whsec_abc123" });
  assertEqual(output.key, "whsec_abc123", "_fromJsonObject parses key");

  assertThrows(
    () => EndpointSecretModel._fromJsonObject({}),
    "_fromJsonObject rejects missing key"
  );
}

// ─── Webhook / Delivery ─────────────────────────────────────────────────────

function testWebhookModel() {
  console.log("\nWebhookModel:");

  const sendInput = { endpoint_id: "ep_1", event: "order.created", data: { id: 1 } };
  const json = WebhookModel._toJsonObject(sendInput);
  assertEqual(json.endpoint_id, "ep_1", "_toJsonObject serializes endpoint_id");
  assertEqual(json.event, "order.created", "_toJsonObject serializes event");
  assertEqual((json.data as Record<string, unknown>).id, 1, "_toJsonObject serializes data");

  assertThrows(
    () => WebhookModel._toJsonObject({ endpoint_id: "ep_1", event: "e" } as unknown as Parameters<typeof WebhookModel._toJsonObject>[0]),
    "_toJsonObject rejects missing data"
  );

  const batchInput = { endpoint_id: "ep_1", events: [{ event: "e1", data: {} }] };
  const batchJson = WebhookModel._toBatchJsonObject(batchInput);
  assertEqual(batchJson.endpoint_id, "ep_1", "_toBatchJsonObject serializes endpoint_id");
  assert(Array.isArray(batchJson.events), "_toBatchJsonObject serializes events array");
}

function testDeliveryModel() {
  console.log("\nDeliveryModel:");

  const output = DeliveryModel._fromJsonObject({
    id: "dlv_1",
    endpoint_id: "ep_1",
    event: "order.created",
    status: "delivered",
    response_code: 200,
    response_body: '{"ok":true}',
    created_at: "2026-01-01",
    delivered_at: "2026-01-01T00:01:00Z",
    attempt_count: 1,
  });
  assertEqual(output.id, "dlv_1", "_fromJsonObject parses id");
  assertEqual(output.status, "delivered", "_fromJsonObject parses status");
  assertEqual(output.delivered_at, "2026-01-01T00:01:00Z", "_fromJsonObject parses delivered_at");

  const nullDelivery = DeliveryModel._fromJsonObject({
    id: "dlv_2",
    endpoint_id: "ep_1",
    event: "e",
    delivered_at: null,
  });
  assertEqual(nullDelivery.delivered_at, null, "_fromJsonObject handles null delivered_at");
  assertEqual(nullDelivery.status, "unknown", "_fromJsonObject defaults status");
  assertEqual(nullDelivery.response_code, 0, "_fromJsonObject defaults response_code");

  assertThrows(
    () => DeliveryModel._fromJsonObject({}),
    "_fromJsonObject rejects missing id"
  );
}

function testDeliveryListModel() {
  console.log("\nDeliveryListModel:");

  const output = DeliveryListModel._fromJsonObject({
    data: [
      { id: "dlv_1", endpoint_id: "ep_1", event: "e1" },
      { id: "dlv_2", endpoint_id: "ep_1", event: "e2" },
    ],
    has_more: true,
  });
  assertEqual(output.data.length, 2, "_fromJsonObject parses array length");
  assertEqual(output.data[0].id, "dlv_1", "_fromJsonObject parses nested delivery");
  assertEqual(output.has_more, true, "_fromJsonObject parses has_more");

  const empty = DeliveryListModel._fromJsonObject({});
  assertEqual(empty.data.length, 0, "_fromJsonObject handles missing data array");
  assertEqual(empty.has_more, false, "_fromJsonObject defaults has_more to false");

  assertThrows(
    () => DeliveryListModel._fromJsonObject({ data: ["not-an-object"] }),
    "_fromJsonObject rejects non-object items in data array"
  );

  assertThrows(
    () => DeliveryListModel._fromJsonObject({ data: [42] }),
    "_fromJsonObject rejects number items in data array"
  );
}

function testBatchModel() {
  console.log("\nBatchModel:");

  const output = BatchModel._fromJsonObject({ batch_id: "batch_1", count: 5 });
  assertEqual(output.batch_id, "batch_1", "_fromJsonObject parses batch_id");
  assertEqual(output.count, 5, "_fromJsonObject parses count");

  assertThrows(
    () => BatchModel._fromJsonObject({}),
    "_fromJsonObject rejects missing batch_id"
  );
}

// ─── Auth ───────────────────────────────────────────────────────────────────

function testAuthModel() {
  console.log("\nAuthModel:");

  const regJson = AuthModel._toRegisterJsonObject({ email: "a@b.com", password: "p" });
  assertEqual(regJson.email, "a@b.com", "_toRegisterJsonObject serializes email");
  assertEqual(regJson.password, "p", "_toRegisterJsonObject serializes password");

  assertThrows(
    () => AuthModel._toRegisterJsonObject({ email: "a@b.com" } as unknown as Parameters<typeof AuthModel._toRegisterJsonObject>[0]),
    "_toRegisterJsonObject rejects missing password"
  );

  const loginJson = AuthModel._toLoginJsonObject({ email: "a@b.com", password: "p", totp_code: "123" });
  assertEqual(loginJson.totp_code, "123", "_toLoginJsonObject includes totp_code");

  const noTotp = AuthModel._toLoginJsonObject({ email: "a@b.com", password: "p" });
  assert(noTotp.totp_code === undefined, "_toLoginJsonObject omits undefined totp_code");

  // Empty string totp_code should be included (not treated as falsy)
  const emptyTotp = AuthModel._toLoginJsonObject({ email: "a@b.com", password: "p", totp_code: "" });
  assertEqual(emptyTotp.totp_code, "", "_toLoginJsonObject includes empty string totp_code");

  const output = AuthModel._fromJsonObject({
    token: "jwt_123",
    user_id: "u_1",
    email: "a@b.com",
    plan: "pro",
    is_admin: true,
  });
  assertEqual(output.token, "jwt_123", "_fromJsonObject parses token");
  assertEqual(output.plan, "pro", "_fromJsonObject parses plan");
  assertEqual(output.is_admin, true, "_fromJsonObject parses is_admin");

  const defaults = AuthModel._fromJsonObject({ token: "t", user_id: "u", email: "e" });
  assertEqual(defaults.plan, "free", "_fromJsonObject defaults plan to free");
  assertEqual(defaults.is_admin, false, "_fromJsonObject defaults is_admin to false");

  assertThrows(
    () => AuthModel._fromJsonObject({}),
    "_fromJsonObject rejects missing token"
  );

  const twoFa = AuthModel._from2faJsonObject({ secret: "s1", qr_code_url: "https://qr" });
  assertEqual(twoFa.secret, "s1", "_from2faJsonObject parses secret");
  assertEqual(twoFa.qr_code_url, "https://qr", "_from2faJsonObject parses qr_code_url");
}

// ─── Analytics ──────────────────────────────────────────────────────────────

function testAnalytics() {
  console.log("\nAnalytics:");

  const point = TrendPointModel._fromJsonObject({ date: "2026-01-01", total: 100, delivered: 95, failed: 5 });
  assertEqual(point.date, "2026-01-01", "_fromJsonObject parses trend point date");
  assertEqual(point.total, 100, "_fromJsonObject parses trend point total");

  const trend = TrendResponseModel._fromJsonObject({
    data: [
      { date: "2026-01-01", total: 10, delivered: 9, failed: 1 },
      { date: "2026-01-02", total: 20, delivered: 18, failed: 2 },
    ],
  });
  assertEqual(trend.data.length, 2, "_fromJsonObject parses trend array");
  assertEqual(trend.data[1].total, 20, "_fromJsonObject parses nested trend");

  assertThrows(
    () => TrendResponseModel._fromJsonObject({ data: [42] }),
    "_fromJsonObject rejects non-object items in trend data"
  );

  const emptyTrend = TrendResponseModel._fromJsonObject({});
  assertEqual(emptyTrend.data.length, 0, "_fromJsonObject handles missing data");

  const rate = SuccessRateModel._fromJsonObject({ rate: 99.5, total: 1000, delivered: 995, failed: 5 });
  assertEqual(rate.rate, 99.5, "_fromJsonObject parses rate");
  assertEqual(rate.total, 1000, "_fromJsonObject parses total");

  const latency = LatencyModel._fromJsonObject({ p50: 10, p95: 50, p99: 100, avg: 25 });
  assertEqual(latency.p99, 100, "_fromJsonObject parses p99");
  assertEqual(latency.avg, 25, "_fromJsonObject parses avg");

  // NaN protection
  const badRate = SuccessRateModel._fromJsonObject({ rate: "abc", total: "xyz" });
  assertEqual(badRate.rate, 0, "_fromJsonObject NaN rate defaults to 0");
  assertEqual(badRate.total, 0, "_fromJsonObject NaN total defaults to 0");
}

// ─── API Keys ───────────────────────────────────────────────────────────────

function testApiKeyModel() {
  console.log("\nApiKeyModel:");

  const json = ApiKeyModel._toJsonObject({ name: "test-key", expires_at: "2026-12-31" });
  assertEqual(json.name, "test-key", "_toJsonObject serializes name");
  assertEqual(json.expires_at, "2026-12-31", "_toJsonObject includes expires_at");

  // Empty string expires_at should be included
  const emptyExp = ApiKeyModel._toJsonObject({ name: "k", expires_at: "" });
  assertEqual(emptyExp.expires_at, "", "_toJsonObject includes empty string expires_at");

  assertThrows(
    () => ApiKeyModel._toJsonObject({} as unknown as Parameters<typeof ApiKeyModel._toJsonObject>[0]),
    "_toJsonObject rejects missing name"
  );

  const output = ApiKeyModel._fromJsonObject({
    id: "ak_1",
    name: "my-key",
    key: "sk_live_abc",
    created_at: "2026-01-01",
    expires_at: "2026-12-31",
    last_used_at: null,
  });
  assertEqual(output.id, "ak_1", "_fromJsonObject parses id");
  assertEqual(output.expires_at, "2026-12-31", "_fromJsonObject handles expires_at");
  assertEqual(output.last_used_at, null, "_fromJsonObject handles null last_used_at");

  const nullExpiry = ApiKeyModel._fromJsonObject({ id: "ak_2", name: "k", key: "sk_abc", expires_at: null });
  assertEqual(nullExpiry.expires_at, null, "_fromJsonObject handles null expires_at");
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

function testAlerts() {
  console.log("\nAlerts:");

  const rule = AlertRuleModel._fromJsonObject({
    id: "ar_1",
    name: "High error rate",
    condition: "error_rate > 5",
    threshold: 5,
    enabled: true,
    created_at: "2026-01-01",
  });
  assertEqual(rule.id, "ar_1", "_fromJsonObject parses alert rule id");
  assertEqual(rule.name, "High error rate", "_fromJsonObject parses name");
  assertEqual(rule.threshold, 5, "_fromJsonObject parses threshold");
  assertEqual(rule.enabled, true, "_fromJsonObject parses enabled");

  const defaults = AlertRuleModel._fromJsonObject({ id: "ar_2", name: "r" });
  assertEqual(defaults.enabled, true, "_fromJsonObject defaults enabled to true");
  assertEqual(defaults.threshold, 0, "_fromJsonObject defaults threshold to 0");

  const notif = AlertNotificationModel._fromJsonObject({
    id: "an_1",
    rule_id: "ar_1",
    message: "Error rate is 8%",
    severity: "critical",
    created_at: "2026-01-01",
    read: false,
  });
  assertEqual(notif.severity, "critical", "_fromJsonObject parses severity");
  assertEqual(notif.read, false, "_fromJsonObject parses read status");

  const notifDefaults = AlertNotificationModel._fromJsonObject({ id: "an_2", rule_id: "ar_1", message: "m" });
  assertEqual(notifDefaults.severity, "info", "_fromJsonObject defaults severity to info");
  assertEqual(notifDefaults.read, false, "_fromJsonObject defaults read to false");
}

// ─── Billing ────────────────────────────────────────────────────────────────

function testBilling() {
  console.log("\nBilling:");

  const plan = PlanInfoModel._fromJsonObject({
    plan: "pro",
    webhooks_remaining: 9000,
    webhooks_used: 1000,
    endpoints_remaining: 45,
    current_period_end: "2026-02-01",
  });
  assertEqual(plan.plan, "pro", "_fromJsonObject parses plan");
  assertEqual(plan.webhooks_remaining, 9000, "_fromJsonObject parses remaining");
  assertEqual(plan.webhooks_used, 1000, "_fromJsonObject parses used");

  const defaults = PlanInfoModel._fromJsonObject({});
  assertEqual(defaults.plan, "free", "_fromJsonObject defaults plan to free");
  assertEqual(defaults.webhooks_remaining, 0, "_fromJsonObject defaults remaining to 0");

  const portal = PortalModel._fromJsonObject({ url: "https://billing.polar.sh/portal" });
  assertEqual(portal.url, "https://billing.polar.sh/portal", "_fromJsonObject parses portal url");

  assertThrows(
    () => PortalModel._fromJsonObject({}),
    "_fromJsonObject rejects missing url"
  );
}

// ─── Health ─────────────────────────────────────────────────────────────────

function testHealth() {
  console.log("\nHealthModel:");

  const output = HealthModel._fromJsonObject({
    status: "ok",
    db: { status: "ok", latency_ms: 5 },
    queue: { status: "ok", latency_ms: 3, pending: 0 },
    otel: { enabled: true, endpoint: "https://otel.example.com", headers_configured: true },
    uptime_seconds: 3600,
  });
  assertEqual(output.status, "ok", "_fromJsonObject parses status");
  assertEqual(output.db.latency_ms, 5, "_fromJsonObject parses db latency");
  assertEqual(output.queue.pending, 0, "_fromJsonObject parses queue pending");
  assertEqual(output.otel?.enabled, true, "_fromJsonObject parses otel");
  assertEqual(output.uptime_seconds, 3600, "_fromJsonObject parses uptime");

  const noOtel = HealthModel._fromJsonObject({
    status: "ok",
    db: { status: "ok", latency_ms: 1 },
    queue: { status: "ok", latency_ms: 1, pending: 0 },
  });
  assertEqual(noOtel.otel, undefined, "_fromJsonObject handles missing otel");
  assertEqual(noOtel.uptime_seconds, 0, "_fromJsonObject defaults uptime");

  // Nested object safety: non-object db should not crash
  const badNested = HealthModel._fromJsonObject({
    status: "ok",
    db: "not-an-object",
    queue: 42,
  });
  assertEqual(badNested.db.status, "unknown", "_fromJsonObject handles non-object db");
  assertEqual(badNested.queue.status, "unknown", "_fromJsonObject handles non-object queue");
}

// ─── Search ─────────────────────────────────────────────────────────────────

function testSearch() {
  console.log("\nSearchModel:");

  const output = SearchModel._fromJsonObject({ id: "s_1", type: "delivery", data: { event: "e" }, score: 0.95 });
  assertEqual(output.id, "s_1", "_fromJsonObject parses search result id");
  assertEqual(output.type, "delivery", "_fromJsonObject parses type");
  assertEqual(output.score, 0.95, "_fromJsonObject parses score");

  assertThrows(
    () => SearchModel._fromJsonObject({}),
    "_fromJsonObject rejects missing id"
  );
}

// ─── Teams ──────────────────────────────────────────────────────────────────

function testTeams() {
  console.log("\nTeamMemberModel:");

  const output = TeamMemberModel._fromJsonObject({
    id: "tm_1",
    email: "dev@example.com",
    role: "admin",
    joined_at: "2026-01-01",
  });
  assertEqual(output.id, "tm_1", "_fromJsonObject parses id");
  assertEqual(output.email, "dev@example.com", "_fromJsonObject parses email");
  assertEqual(output.role, "admin", "_fromJsonObject parses role");

  const defaults = TeamMemberModel._fromJsonObject({ id: "tm_2", email: "e@e.com" });
  assertEqual(defaults.role, "member", "_fromJsonObject defaults role to member");
}

// ─── NaN Protection ─────────────────────────────────────────────────────────

function testNanProtection() {
  console.log("\nNaN Protection:");

  const output = EndpointModel._fromJsonObject({
    id: "ep_1",
    url: "https://x.com",
    rate_limit: "not-a-number",
  });
  assertEqual(output.rate_limit, 0, "NaN rate_limit defaults to 0");

  const delivery = DeliveryModel._fromJsonObject({
    id: "dlv_1",
    endpoint_id: "ep_1",
    event: "e",
    response_code: "abc",
    attempt_count: "xyz",
  });
  assertEqual(delivery.response_code, 0, "NaN response_code defaults to 0");
  assertEqual(delivery.attempt_count, 0, "NaN attempt_count defaults to 0");
}

// ─── Run all ────────────────────────────────────────────────────────────────

console.log("🪝 HookSniff SDK — Serialization Model Tests\n");

testEndpointModel();
testEndpointSecretModel();
testWebhookModel();
testDeliveryModel();
testDeliveryListModel();
testBatchModel();
testAuthModel();
testAnalytics();
testApiKeyModel();
testAlerts();
testBilling();
testHealth();
testSearch();
testTeams();
testNanProtection();

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Some tests failed! ❌");
  process.exit(1);
} else {
  console.log("All tests passed! 🎉");
}
