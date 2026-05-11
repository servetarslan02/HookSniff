/**
 * HookSniff SDK — Webhook Signature Tests
 *
 * Run: npx tsx src/__tests__/webhook.test.ts
 */

import { createHmac } from "crypto";
import { Webhook, WebhookVerificationError } from "../webhook";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

function assertThrows(fn: () => void, message: string) {
  try {
    fn();
    failed++;
    console.log(`  ❌ ${message} (expected error, none thrown)`);
  } catch {
    passed++;
    console.log(`  ✅ ${message}`);
  }
}

// Test helper: create a signed payload
function signPayload(secret: string, msgId: string, timestamp: number, body: string) {
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const secretBytes = Buffer.from(rawSecret, "base64");
  const content = `${msgId}.${timestamp}.${body}`;
  const signature = createHmac("sha256", secretBytes).update(content).digest("base64");
  return {
    "webhook-id": msgId,
    "webhook-timestamp": String(timestamp),
    "webhook-signature": `v1,${signature}`,
  };
}

// Generate a valid secret
const TEST_SECRET = "whsec_" + Buffer.from("test-secret-key-for-hmac").toString("base64");
const TEST_BODY = JSON.stringify({ event: "order.created", data: { order_id: "12345" } });
const TEST_MSG_ID = "msg_test123";
const TEST_TIMESTAMP = Math.floor(Date.now() / 1000);

console.log("\n🪝 HookSniff SDK — Webhook Signature Tests\n");

// ===== Test 1: Valid signature verification =====
console.log("Test 1: Valid signature verification");
{
  const wh = new Webhook(TEST_SECRET);
  const headers = signPayload(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_BODY);
  const result = wh.verify(TEST_BODY, headers);
  assert(typeof result === "object", "Returns parsed JSON object");
  assert((result as any).event === "order.created", "Event field is correct");
  assert((result as any).data.order_id === "12345", "Data field is correct");
}

// ===== Test 2: Invalid signature =====
console.log("\nTest 2: Invalid signature");
{
  const wh = new Webhook(TEST_SECRET);
  const headers = signPayload(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_BODY);
  headers["webhook-signature"] = "v1,invalid_signature_here";
  assertThrows(
    () => wh.verify(TEST_BODY, headers),
    "Throws WebhookVerificationError on invalid signature"
  );
}

// ===== Test 3: Missing headers =====
console.log("\nTest 3: Missing headers");
{
  const wh = new Webhook(TEST_SECRET);
  assertThrows(
    () => wh.verify(TEST_BODY, {}),
    "Throws on missing webhook-id"
  );
  assertThrows(
    () => wh.verify(TEST_BODY, { "webhook-id": "msg_1" }),
    "Throws on missing webhook-timestamp"
  );
  assertThrows(
    () => wh.verify(TEST_BODY, { "webhook-id": "msg_1", "webhook-timestamp": String(TEST_TIMESTAMP) }),
    "Throws on missing webhook-signature"
  );
}

// ===== Test 4: Expired timestamp =====
console.log("\nTest 4: Expired timestamp (replay protection)");
{
  const wh = new Webhook(TEST_SECRET);
  const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
  const headers = signPayload(TEST_SECRET, TEST_MSG_ID, oldTimestamp, TEST_BODY);
  assertThrows(
    () => wh.verify(TEST_BODY, headers),
    "Throws on timestamp older than 5 minutes"
  );
}

// ===== Test 5: Svix-branded headers =====
console.log("\nTest 5: Svix-branded headers (svix-id, svix-timestamp, svix-signature)");
{
  const wh = new Webhook(TEST_SECRET);
  const standardHeaders = signPayload(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_BODY);
  const svixHeaders = {
    "svix-id": standardHeaders["webhook-id"],
    "svix-timestamp": standardHeaders["webhook-timestamp"],
    "svix-signature": standardHeaders["webhook-signature"],
  };
  const result = wh.verify(TEST_BODY, svixHeaders);
  assert(typeof result === "object", "Accepts svix-branded headers");
}

// ===== Test 6: Multiple signatures (comma-separated) =====
console.log("\nTest 6: Multiple signatures");
{
  const wh = new Webhook(TEST_SECRET);
  const headers = signPayload(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_BODY);
  // Add a second (wrong) signature before the correct one
  headers["webhook-signature"] = `v1,wrong_sig,${headers["webhook-signature"].split(",")[1]}`;
  const result = wh.verify(TEST_BODY, headers);
  assert(typeof result === "object", "Verifies with multiple comma-separated signatures");
}

// ===== Test 7: Buffer payload =====
console.log("\nTest 7: Buffer payload");
{
  const wh = new Webhook(TEST_SECRET);
  const bodyBuffer = Buffer.from(TEST_BODY);
  const headers = signPayload(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_BODY);
  const result = wh.verify(bodyBuffer, headers);
  assert(typeof result === "object", "Accepts Buffer payload");
}

// ===== Test 8: sign() method =====
console.log("\nTest 8: sign() method");
{
  const wh = new Webhook(TEST_SECRET);
  const timestamp = new Date(TEST_TIMESTAMP * 1000);
  const sig = wh.sign(TEST_MSG_ID, timestamp, TEST_BODY);
  assert(sig.startsWith("v1,"), "Returns v1-prefixed signature");

  // Verify the signed payload
  const headers = {
    "webhook-id": TEST_MSG_ID,
    "webhook-timestamp": String(TEST_TIMESTAMP),
    "webhook-signature": sig,
  };
  const result = wh.verify(TEST_BODY, headers);
  assert(typeof result === "object", "Signed payload can be verified");
}

// ===== Test 9: whsec_ prefix handling =====
console.log("\nTest 9: Secret prefix handling");
{
  // Without prefix
  const rawSecret = Buffer.from("test-secret-key-for-hmac").toString("base64");
  const wh1 = new Webhook(rawSecret);
  const wh2 = new Webhook(TEST_SECRET);
  const headers = signPayload(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_BODY);

  const result1 = wh1.verify(TEST_BODY, headers);
  const result2 = wh2.verify(TEST_BODY, headers);
  assert(
    typeof result1 === "object" && typeof result2 === "object",
    "Works with and without whsec_ prefix"
  );
}

// ===== Summary =====
console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("All tests passed! 🎉\n");
}
