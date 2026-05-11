/**
 * HookSniff Webhook Signature Verification
 *
 * Verifies incoming webhook signatures using HMAC-SHA256.
 * Compatible with Standard Webhooks format (whsec_ prefix secrets).
 *
 * Usage:
 *   import { Webhook } from 'hooksniff-sdk';
 *
 *   const wh = new Webhook('whsec_...');
 *   const isValid = wh.verify(payload, headers);
 */

import { createHmac, timingSafeEqual } from "crypto";

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

export interface WebhookHeaders {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
}

export interface WebhookSvixHeaders {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
}

type IncomingHeaders = WebhookHeaders | WebhookSvixHeaders | Record<string, string>;

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes

/**
 * Decode a whsec_ prefixed secret to raw bytes.
 * Supports both base64-encoded whsec_ secrets and raw strings.
 */
function decodeSecret(secret: string | Uint8Array): Buffer {
  if (secret instanceof Uint8Array) {
    return Buffer.from(secret);
  }

  // Strip whsec_ prefix if present
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;

  // Try base64 decode
  try {
    return Buffer.from(raw, "base64");
  } catch {
    return Buffer.from(raw, "utf-8");
  }
}

/**
 * Build the signed content string per Standard Webhooks spec:
 * `{msgId}.{timestamp}.{body}`
 */
function buildSignedContent(msgId: string, timestamp: string, body: string | Buffer): string {
  return `${msgId}.${timestamp}.${typeof body === "string" ? body : body.toString("utf-8")}`;
}

/**
 * Compute HMAC-SHA256 signature and return in Standard Webhooks format.
 */
function sign(secret: Buffer, msgId: string, timestamp: Date, body: string | Buffer): string {
  const ts = Math.floor(timestamp.getTime() / 1000).toString();
  const content = buildSignedContent(msgId, ts, body);
  const hmac = createHmac("sha256", secret).update(content).digest("base64");
  return `v1,${hmac}`;
}

/**
 * Verify that a signature matches the expected signature using timing-safe comparison.
 */
function verifySignature(expected: string, actual: string): boolean {
  // Each signature can be comma-separated (v1 sig1, v1 sig2, ...)
  const signatures = actual.split(",").map((s) => s.trim());

  for (const sig of signatures) {
    // Strip version prefix (e.g., "v1,abc" → "abc")
    const parts = sig.split(",", 2);
    const signaturePart = parts.length > 1 ? parts[1] : parts[0];

    // Strip version prefix from expected too
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
  constructor(secret: string | Uint8Array) {
    this.secret = decodeSecret(secret);
  }

  /**
   * Verify a webhook payload against its signature headers.
   *
   * @param payload - The raw request body (string or Buffer)
   * @param headers - The request headers containing webhook-id, webhook-timestamp, webhook-signature
   * @returns The parsed payload if verification succeeds
   * @throws WebhookVerificationError if verification fails
   */
  verify<T = unknown>(payload: string | Buffer, headers: IncomingHeaders): T {
    // Normalize headers to lowercase
    const normalizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value;
    }

    // Support both svix- and webhook- prefixed headers
    const msgId = normalizedHeaders["svix-id"] ?? normalizedHeaders["webhook-id"];
    const timestamp = normalizedHeaders["svix-timestamp"] ?? normalizedHeaders["webhook-timestamp"];
    const signature = normalizedHeaders["svix-signature"] ?? normalizedHeaders["webhook-signature"];

    if (!msgId) {
      throw new WebhookVerificationError("Missing webhook-id header");
    }
    if (!timestamp) {
      throw new WebhookVerificationError("Missing webhook-timestamp header");
    }
    if (!signature) {
      throw new WebhookVerificationError("Missing webhook-signature header");
    }

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
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload) as T;
      } catch {
        return payload as unknown as T;
      }
    }

    try {
      return JSON.parse(payload.toString("utf-8")) as T;
    } catch {
      return payload as unknown as T;
    }
  }

  /**
   * Sign a payload (for testing or server-side webhook sending).
   *
   * @param msgId - The message ID
   * @param timestamp - The timestamp
   * @param payload - The payload to sign
   * @returns The signature string (e.g., "v1,base64hmac")
   */
  sign(msgId: string, timestamp: Date, payload: string | Buffer): string {
    return sign(this.secret, msgId, timestamp, payload);
  }
}
