/**
 * HookSniff SDK — Webhook Signature Verification
 *
 * Verifies incoming webhook signatures using HMAC-SHA256.
 * Compatible with Standard Webhooks format (whsec_ prefix secrets).
 * Based on Svix SDK architecture (MIT License).
 *
 * Usage:
 *   import { Webhook } from 'hooksniff-sdk';
 *
 *   const wh = new Webhook('whsec_...');
 *   const payload = wh.verify(rawBody, headers);
 */

import { createHmac, timingSafeEqual } from "crypto";

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

export interface WebhookRequiredHeaders {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
}

export interface WebhookUnbrandedRequiredHeaders {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
}

export interface WebhookOptions {
  format?: "raw";
}

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes

function decodeSecret(secret: string | Uint8Array): Buffer {
  if (secret instanceof Uint8Array) {
    return Buffer.from(secret);
  }
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  try {
    return Buffer.from(raw, "base64");
  } catch {
    return Buffer.from(raw, "utf-8");
  }
}

function buildSignedContent(msgId: string, timestamp: string, body: string | Buffer): string {
  return `${msgId}.${timestamp}.${typeof body === "string" ? body : body.toString("utf-8")}`;
}

function sign(secret: Buffer, msgId: string, timestamp: Date, body: string | Buffer): string {
  const ts = Math.floor(timestamp.getTime() / 1000).toString();
  const content = buildSignedContent(msgId, ts, body);
  const hmac = createHmac("sha256", secret).update(content).digest("base64");
  return `v1,${hmac}`;
}

function verifySignature(expected: string, actual: string): boolean {
  const signatures = actual.split(",").map((s) => s.trim());

  for (const sig of signatures) {
    const parts = sig.split(",", 2);
    const signaturePart = parts.length > 1 ? parts[1] : parts[0];

    const expectedParts = expected.split(",", 2);
    const expectedSig = expectedParts.length > 1 ? expectedParts[1] : expectedParts[0];

    if (expectedSig.length !== signaturePart.length) continue;

    try {
      if (timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signaturePart))) {
        return true;
      }
    } catch {
      // length mismatch after encoding — skip
    }
  }

  return false;
}

export class Webhook {
  private readonly secret: Buffer;

  /**
   * Create a new Webhook verifier.
   *
   * @param secret - The endpoint's signing secret (e.g., "whsec_base64encoded...")
   */
  constructor(secret: string | Uint8Array, options?: WebhookOptions) {
    this.secret = decodeSecret(secret);
  }

  /**
   * Verify a webhook payload against its signature headers.
   *
   * Supports both Standard Webhooks (`webhook-id`, `webhook-timestamp`, `webhook-signature`)
   * and Svix-style headers (`svix-id`, `svix-timestamp`, `svix-signature`).
   *
   * @param payload - The raw request body (string or Buffer)
   * @param headers - The request headers containing webhook signature info
   * @returns The parsed payload if verification succeeds
   * @throws WebhookVerificationError if verification fails
   */
  verify<T = unknown>(
    payload: string | Buffer,
    headers_:
      | WebhookRequiredHeaders
      | WebhookUnbrandedRequiredHeaders
      | Record<string, string>
  ): T {
    const headers: Record<string, string> = {};
    for (const key of Object.keys(headers_)) {
      headers[key.toLowerCase()] = (headers_ as Record<string, string>)[key];
    }

    // Support both svix- and webhook- prefixed headers
    const msgId = headers["svix-id"] ?? headers["webhook-id"];
    const timestamp = headers["svix-timestamp"] ?? headers["webhook-timestamp"];
    const signature = headers["svix-signature"] ?? headers["webhook-signature"];

    if (!msgId) throw new WebhookVerificationError("Missing webhook-id header");
    if (!timestamp) throw new WebhookVerificationError("Missing webhook-timestamp header");
    if (!signature) throw new WebhookVerificationError("Missing webhook-signature header");

    // Validate timestamp (prevent replay attacks)
    const timestampNum = parseInt(timestamp, 10);
    if (isNaN(timestampNum)) {
      throw new WebhookVerificationError("Invalid webhook-timestamp header");
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampNum) > TIMESTAMP_TOLERANCE_SECONDS) {
      throw new WebhookVerificationError(
        `Webhook timestamp is too old or too new (tolerance: ${TIMESTAMP_TOLERANCE_SECONDS}s)`
      );
    }

    // Compute expected signature
    const content = buildSignedContent(msgId, timestamp, payload);
    const expectedSig = createHmac("sha256", this.secret).update(content).digest("base64");
    const expected = `v1,${expectedSig}`;

    // Timing-safe comparison
    if (!verifySignature(expected, signature)) {
      throw new WebhookVerificationError("Invalid webhook signature");
    }

    // Parse and return payload
    const raw = typeof payload === "string" ? payload : payload.toString("utf-8");
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  /**
   * Sign a payload (for testing or server-side webhook sending).
   */
  sign(msgId: string, timestamp: Date, payload: string | Buffer): string {
    return sign(this.secret, msgId, timestamp, payload);
  }
}
