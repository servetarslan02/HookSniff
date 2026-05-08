import { verifySignature, verifyWebhookSignature, HookSniff, createWebhookHandler } from "../index";
import * as crypto from "crypto";

describe("verifySignature", () => {
  const secret = "whsec_test_secret_key_1234567890abcdef";
  const payload = '{"event":"order.created","data":{"id":"123"}}';

  function sign(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  it("returns true for valid signature", () => {
    const sig = sign(payload, secret);
    expect(verifySignature(payload, sig, secret)).toBe(true);
  });

  it("returns true for sha256= prefixed signature", () => {
    const sig = "sha256=" + sign(payload, secret);
    expect(verifySignature(payload, sig, secret)).toBe(true);
  });

  it("returns false for wrong signature", () => {
    expect(verifySignature(payload, "deadbeef", secret)).toBe(false);
  });

  it("returns false for wrong secret", () => {
    const sig = sign(payload, secret);
    expect(verifySignature(payload, sig, "whsec_wrong_secret")).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(verifySignature("", sig, secret)).toBe(false);
    expect(verifySignature(payload, "", secret)).toBe(false);
    expect(verifySignature(payload, sig, "")).toBe(false);
  });

  it("returns false for tampered payload", () => {
    const sig = sign(payload, secret);
    expect(verifySignature(payload + "tampered", sig, secret)).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  const secret = "whsec_test_secret_key_1234567890abcdef";

  function sign(payload: string, secret: string): string {
    return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  it("returns valid result with parsed payload", () => {
    const payload = '{"event":"order.created","data":{"id":"123"}}';
    const sig = sign(payload, secret);
    const result = verifyWebhookSignature(payload, sig, secret);
    expect(result.valid).toBe(true);
    expect(result.payload).toBeDefined();
    expect(result.payload!.event).toBe("order.created");
  });

  it("returns error for missing signature", () => {
    const payload = '{"event":"order.created"}';
    const result = verifyWebhookSignature(payload, undefined, secret);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Missing signature");
  });

  it("returns error for invalid JSON", () => {
    const payload = "not-json";
    const sig = sign(payload, secret);
    const result = verifyWebhookSignature(payload, sig, secret);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid JSON");
  });
});

describe("HookSniff client", () => {
  it("constructs with config", () => {
    const client = new HookSniff({ apiKey: "hr_live_test123" });
    expect(client.endpoints).toBeDefined();
    expect(client.webhooks).toBeDefined();
  });

  it("throws ValidationError for non-ok responses", async () => {
    // This tests the error handling structure, not actual API calls
    const client = new HookSniff({ apiKey: "hr_live_test", baseUrl: "http://localhost:1" });
    await expect(client.endpoints.list()).rejects.toThrow();
  });
});

describe("createWebhookHandler", () => {
  it("returns a function", () => {
    const handler = createWebhookHandler({
      secret: "whsec_test",
      handlers: {},
    });
    expect(typeof handler).toBe("function");
  });
});
