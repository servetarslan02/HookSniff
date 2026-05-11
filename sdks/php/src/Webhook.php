<?php

declare(strict_types=1);

namespace HookSniff;

/**
 * HookSniff Webhook Signature Verification
 *
 * Verifies incoming webhook signatures using HMAC-SHA256.
 * Compatible with Standard Webhooks format (whsec_ prefix secrets).
 *
 * Usage:
 *   $payload = Webhook::verify('whsec_...', $rawBody, $headers);
 */
class Webhook
{
    private const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes

    private string $secret;

    /**
     * Create a new Webhook verifier.
     *
     * @param string $secret The endpoint's signing secret (e.g., "whsec_base64encoded...")
     */
    public function __construct(string $secret)
    {
        $this->secret = self::decodeSecret($secret);
    }

    /**
     * Verify a webhook payload against its signature headers.
     *
     * @param string $payload The raw request body
     * @param array<string, string> $headers The request headers
     * @return mixed The parsed payload if verification succeeds
     * @throws WebhookVerificationError if verification fails
     */
    public function verify(string $payload, array $headers): mixed
    {
        // Normalize headers to lowercase
        $normalized = [];
        foreach ($headers as $key => $value) {
            $normalized[strtolower($key)] = $value;
        }

        // Support both svix- and webhook- prefixed headers
        $msgId = $normalized['svix-id'] ?? $normalized['webhook-id'] ?? null;
        $timestamp = $normalized['svix-timestamp'] ?? $normalized['webhook-timestamp'] ?? null;
        $signature = $normalized['svix-signature'] ?? $normalized['webhook-signature'] ?? null;

        if ($msgId === null) {
            throw new WebhookVerificationError('Missing webhook-id header');
        }
        if ($timestamp === null) {
            throw new WebhookVerificationError('Missing webhook-timestamp header');
        }
        if ($signature === null) {
            throw new WebhookVerificationError('Missing webhook-signature header');
        }

        // Validate timestamp (prevent replay attacks)
        $timestampNum = (int) $timestamp;
        if ($timestampNum === 0 && $timestamp !== '0') {
            throw new WebhookVerificationError('Invalid webhook-timestamp header');
        }

        $now = (int) time();
        if (abs($now - $timestampNum) > self::TIMESTAMP_TOLERANCE_SECONDS) {
            throw new WebhookVerificationError(
                sprintf('Webhook timestamp is too old or too new (tolerance: %ds)', self::TIMESTAMP_TOLERANCE_SECONDS)
            );
        }

        // Compute expected signature
        $content = $msgId . '.' . $timestamp . '.' . $payload;
        $expectedSig = base64_encode(hash_hmac('sha256', $content, $this->secret, true));
        $expected = 'v1,' . $expectedSig;

        // Timing-safe comparison
        if (!self::verifySignature($expected, $signature)) {
            throw new WebhookVerificationError('Invalid webhook signature');
        }

        // Parse and return payload
        $decoded = json_decode($payload, true);
        return $decoded !== null ? $decoded : $payload;
    }

    /**
     * Sign a payload (for testing or server-side webhook sending).
     *
     * @param string $msgId The message ID
     * @param int $timestamp Unix timestamp
     * @param string $payload The payload to sign
     * @return string The signature string (e.g., "v1,base64hmac")
     */
    public function sign(string $msgId, int $timestamp, string $payload): string
    {
        $content = $msgId . '.' . $timestamp . '.' . $payload;
        $hmac = base64_encode(hash_hmac('sha256', $content, $this->secret, true));
        return 'v1,' . $hmac;
    }

    /**
     * Static convenience method for one-shot verification.
     *
     * @param string $secret The signing secret
     * @param string $payload The raw request body
     * @param array<string, string> $headers The request headers
     * @return mixed The parsed payload
     * @throws WebhookVerificationError
     */
    public static function verifyWithSecret(string $secret, string $payload, array $headers): mixed
    {
        $wh = new self($secret);
        return $wh->verify($payload, $headers);
    }

    /**
     * Decode a whsec_ prefixed secret to raw bytes.
     */
    private static function decodeSecret(string $secret): string
    {
        // Strip whsec_ prefix if present
        $raw = str_starts_with($secret, 'whsec_') ? substr($secret, 6) : $secret;

        // Try base64 decode
        $decoded = base64_decode($raw, true);
        return $decoded !== false ? $decoded : $raw;
    }

    /**
     * Verify that a signature matches using timing-safe comparison.
     */
    private static function verifySignature(string $expected, string $actual): bool
    {
        // Each signature can be comma-separated (v1 sig1, v1 sig2, ...)
        $signatures = array_map('trim', explode(',', $actual));

        foreach ($signatures as $sig) {
            // Strip version prefix
            $parts = explode(',', $sig, 2);
            $signaturePart = count($parts) > 1 ? $parts[1] : $parts[0];

            // Strip version prefix from expected too
            $expectedParts = explode(',', $expected, 2);
            $expectedSig = count($expectedParts) > 1 ? $expectedParts[1] : $expectedParts[0];

            // Length check before timing-safe compare
            if (strlen($expectedSig) !== strlen($signaturePart)) {
                continue;
            }

            if (hash_equals($expectedSig, $signaturePart)) {
                return true;
            }
        }

        return false;
    }
}
