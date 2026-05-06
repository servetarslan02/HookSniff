/**
 * Standard Webhooks verification for HookRelay.
 *
 * Compatible with the Standard Webhooks spec (https://www.standardwebhooks.com/)
 * and Svix's verification flow.
 *
 * @example
 * ```typescript
 * import { WebhookVerifier } from '@hookrelay/sdk/verify';
 *
 * const verifier = new WebhookVerifier('whsec_...');
 *
 * // Verify from request headers and body
 * const result = verifier.verify(
 *   req.body,
 *   req.headers['webhook-id'],
 *   req.headers['webhook-timestamp'],
 *   req.headers['webhook-signature'],
 * );
 *
 * if (result.valid) {
 *   console.log('Payload:', result.payload);
 * }
 * ```
 */

import * as crypto from "crypto";

const DEFAULT_TOLERANCE_SECS = 300; // 5 minutes

export interface VerificationResult {
  valid: boolean;
  payload?: unknown;
  error?: string;
}

/**
 * Webhook verifier that follows the Standard Webhooks spec.
 *
 * Compatible with Svix's verification flow — uses the same
 * header names (`webhook-id`, `webhook-timestamp`, `webhook-signature`)
 * and signature format (`v1,<base64(hmac)>`).
 */
export class WebhookVerifier {
  private secret: string;
  private toleranceSecs: number;

  /**
   * Create a new WebhookVerifier.
   *
   * @param secret - The endpoint's signing secret (with or without `whsec_` prefix)
   * @param toleranceSecs - Maximum age of webhook timestamp in seconds (default: 300)
   */
  constructor(secret: string, toleranceSecs = DEFAULT_TOLERANCE_SECS) {
    this.secret = secret;
    this.toleranceSecs = toleranceSecs;
  }

  /**
   * Verify a webhook request using Standard Webhooks headers.
   *
   * @param body - The raw request body as a string
   * @param msgId - The `webhook-id` header value
   * @param timestamp - The `webhook-timestamp` header value
   * @param signatureHeader - The `webhook-signature` header value
   * @returns VerificationResult with `valid` flag and parsed payload
   */
  verify(
    body: string,
    msgId: string | undefined,
    timestamp: string | undefined,
    signatureHeader: string | undefined
  ): VerificationResult {
    if (!msgId) {
      return { valid: false, error: "Missing webhook-id header" };
    }

    if (!timestamp) {
      return { valid: false, error: "Missing webhook-timestamp header" };
    }

    if (!signatureHeader) {
      return { valid: false, error: "Missing webhook-signature header" };
    }

    if (!body) {
      return { valid: false, error: "Missing request body" };
    }

    // Validate timestamp
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) {
      return { valid: false, error: "Invalid webhook timestamp" };
    }

    const now = Math.floor(Date.now() / 1000);
    const age = Math.abs(now - ts);

    if (age > this.toleranceSecs) {
      return {
        valid: false,
        error: `Webhook timestamp expired: ${age}s old (tolerance: ${this.toleranceSecs}s)`,
      };
    }

    // Compute expected signature
    const signedContent = `${msgId}.${timestamp}.${body}`;
    const secretBytes = this.decodeSecret(this.secret);

    const expectedSig = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    const expectedFull = `v1,${expectedSig}`;

    // Check each signature in the header (space-separated)
    const signatures = signatureHeader.split(" ");
    let verified = false;

    for (const sig of signatures) {
      const trimmed = sig.trim();
      if (!trimmed.startsWith("v1,")) continue;

      // Constant-time comparison
      if (
        trimmed.length === expectedFull.length &&
        crypto.timingSafeEqual(
          Buffer.from(trimmed),
          Buffer.from(expectedFull)
        )
      ) {
        verified = true;
        break;
      }
    }

    if (!verified) {
      return { valid: false, error: "Invalid webhook signature" };
    }

    // Parse the payload
    try {
      const parsed = JSON.parse(body);
      return { valid: true, payload: parsed };
    } catch {
      // Body is valid (signature matched) but not JSON
      return { valid: true, payload: body };
    }
  }

  /**
   * Decode a Standard Webhooks secret.
   *
   * Strips `whsec_` prefix and base64-decodes the remainder.
   * Falls back to raw bytes if decoding fails.
   */
  private decodeSecret(secret: string): Buffer {
    const stripped = secret.startsWith("whsec_")
      ? secret.slice(6)
      : secret;

    try {
      return Buffer.from(stripped, "base64");
    } catch {
      return Buffer.from(secret);
    }
  }
}

/**
 * Standalone verification function (Svix-compatible).
 *
 * This is a convenience wrapper that creates a verifier and
 * immediately verifies the request.
 *
 * @param secret - The endpoint's signing secret
 * @param body - The raw request body
 * @param headers - The request headers object
 * @returns VerificationResult
 *
 * @example
 * ```typescript
 * import { verifyWebhook } from '@hookrelay/sdk/verify';
 *
 * app.post('/webhook', (req, res) => {
 *   const result = verifyWebhook('whsec_...', req.body, req.headers);
 *   if (!result.valid) {
 *     return res.status(401).json({ error: result.error });
 *   }
 *   // Handle the event
 *   res.status(200).json({ received: true });
 * });
 * ```
 */
export function verifyWebhook(
  secret: string,
  body: string,
  headers: Record<string, string | string[] | undefined>,
  toleranceSecs?: number
): VerificationResult {
  const getHeader = (name: string): string | undefined => {
    const val = headers[name] || headers[name.toLowerCase()];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  // Try Standard Webhooks headers first, then Svix headers
  let msgId = getHeader("webhook-id");
  let timestamp = getHeader("webhook-timestamp");
  let signatureHeader = getHeader("webhook-signature");

  if (!msgId || !timestamp || !signatureHeader) {
    msgId = msgId || getHeader("svix-id");
    timestamp = timestamp || getHeader("svix-timestamp");
    signatureHeader = signatureHeader || getHeader("svix-signature");
  }

  const verifier = new WebhookVerifier(secret, toleranceSecs);

  return verifier.verify(body, msgId, timestamp, signatureHeader);
}
