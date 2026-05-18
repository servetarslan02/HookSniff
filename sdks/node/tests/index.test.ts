import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { HookSniff } from "../src/index.js";
import { Webhook } from "../src/webhook.js";
import {
  HookSniffError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
  createErrorFromStatus,
} from "../src/errors.js";

describe("HookSniff", () => {
  it("should create a client with default options", () => {
    const hs = new HookSniff("test_token");
    assert.ok(hs);
    assert.ok(hs.endpoint);
    assert.ok(hs.message);
    assert.ok(hs.messageAttempt);
    assert.ok(hs.eventType);
    assert.ok(hs.authentication);
    assert.ok(hs.statistics);
    assert.ok(hs.health);
  });

  it("should throw if no token provided", () => {
    assert.throws(() => new HookSniff(""), {
      message: /token/i,
    });
  });
});

describe("Webhook", () => {
  const secret = "whsec_dGVzdA=="; // base64("test")
  const msgId = "msg_test123";
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = '{"event":"test"}';

  it("should verify a valid webhook signature", () => {
    const wh = new Webhook(secret);
    const signature = wh.sign(msgId, timestamp, payload);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.deepEqual(result, { event: "test" });
  });

  it("should reject invalid signature", () => {
    const wh = new Webhook(secret);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": "v1,invalid_signature",
    };

    assert.throws(() => wh.verify(payload, headers), {
      name: "WebhookVerificationError",
    });
  });

  it("should reject old timestamp", () => {
    const wh = new Webhook(secret);
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const signature = wh.sign(msgId, oldTimestamp, payload);

    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(oldTimestamp),
      "webhook-signature": `v1,${signature}`,
    };

    assert.throws(() => wh.verify(payload, headers), {
      name: "WebhookVerificationError",
    });
  });

  it("should accept svix-branded headers (backward compat)", () => {
    const wh = new Webhook(secret);
    const signature = wh.sign(msgId, timestamp, payload);

    const headers = {
      "svix-id": msgId,
      "svix-timestamp": String(timestamp),
      "svix-signature": `v1,${signature}`,
    };

    const result = wh.verify(payload, headers);
    assert.deepEqual(result, { event: "test" });
  });
});

describe("Errors", () => {
  it("should create BadRequestError for 400", () => {
    const err = createErrorFromStatus(400, { detail: "Invalid input" });
    assert.ok(err instanceof BadRequestError);
    assert.equal(err.statusCode, 400);
    assert.equal(err.message, "Invalid input");
  });

  it("should create UnauthorizedError for 401", () => {
    const err = createErrorFromStatus(401, {});
    assert.ok(err instanceof UnauthorizedError);
    assert.equal(err.statusCode, 401);
  });

  it("should create NotFoundError for 404", () => {
    const err = createErrorFromStatus(404, {});
    assert.ok(err instanceof NotFoundError);
    assert.equal(err.statusCode, 404);
  });

  it("should create RateLimitError for 429 with retry-after", () => {
    const err = createErrorFromStatus(429, {}, { "retry-after": "30" });
    assert.ok(err instanceof RateLimitError);
    assert.equal(err.statusCode, 429);
    assert.equal(err.retryAfter, 30);
  });

  it("should create generic HookSniffError for unknown status", () => {
    const err = createErrorFromStatus(418, { detail: "I'm a teapot" });
    assert.ok(err instanceof HookSniffError);
    assert.equal(err.statusCode, 418);
  });
});
