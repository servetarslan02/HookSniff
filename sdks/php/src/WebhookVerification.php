<?php

declare(strict_types=1);

namespace HookRelay;

/**
 * Webhook signature verification for HookRelay.
 *
 * Supports both simple HMAC-SHA256 verification and Standard Webheaders
 * (Svix-compatible) verification with timestamp tolerance.
 */
class WebhookVerification
{
    private const DEFAULT_TOLERANCE_SECS = 300;

    /**
     * Verify a webhook signature using HMAC-SHA256.
     *
     * @param string $payload   The raw request body
     * @param string $signature The signature from the X-Hookrelay-Signature header
     * @param string $secret    The endpoint's signing secret (starts with "whsec_")
     * @return bool true if the signature is valid
     */
    public static function verifySignature(string $payload, string $signature, string $secret): bool
    {
        if (empty($payload) || empty($signature) || empty($secret)) {
            return false;
        }

        $expectedHex = str_starts_with($signature, 'sha256=')
            ? substr($signature, 7)
            : $signature;

        $computed = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computed, $expectedHex);
    }

    /**
     * Verify a webhook using Standard Webheaders headers (Svix-compatible).
     *
     * @param string $payload         The raw request body
     * @param string|null $msgId      The webhook-id header
     * @param string|null $timestamp  The webhook-timestamp header
     * @param string|null $signatureHeader The webhook-signature header
     * @param string $secret          The endpoint's signing secret
     * @param int    $toleranceSecs   Max age in seconds (default: 300)
     * @return array{valid: bool, payload?: mixed, error?: string}
     */
    public static function verifyWebhook(
        string $payload,
        ?string $msgId,
        ?string $timestamp,
        ?string $signatureHeader,
        string $secret,
        int $toleranceSecs = self::DEFAULT_TOLERANCE_SECS
    ): array {
        if (empty($msgId)) {
            return ['valid' => false, 'error' => 'Missing webhook-id header'];
        }
        if (empty($timestamp)) {
            return ['valid' => false, 'error' => 'Missing webhook-timestamp header'];
        }
        if (empty($signatureHeader)) {
            return ['valid' => false, 'error' => 'Missing webhook-signature header'];
        }
        if (empty($payload)) {
            return ['valid' => false, 'error' => 'Missing request body'];
        }

        // Validate timestamp
        $ts = (int) $timestamp;
        if ($ts === 0) {
            return ['valid' => false, 'error' => 'Invalid webhook timestamp'];
        }

        $now = time();
        $age = abs($now - $ts);

        if ($age > $toleranceSecs) {
            return [
                'valid' => false,
                'error' => sprintf('Webhook timestamp expired: %ds old (tolerance: %ds)', $age, $toleranceSecs),
            ];
        }

        // Compute expected signature
        $signedContent = "{$msgId}.{$timestamp}.{$payload}";
        $secretBytes = self::decodeSecret($secret);

        $expectedSig = base64_encode(
            hash_hmac('sha256', $signedContent, $secretBytes, true)
        );
        $expectedFull = "v1,{$expectedSig}";

        // Check each signature in the header (space-separated)
        $signatures = explode(' ', $signatureHeader);
        $verified = false;

        foreach ($signatures as $sig) {
            $trimmed = trim($sig);
            if (!str_starts_with($trimmed, 'v1,')) continue;

            if (hash_equals($trimmed, $expectedFull)) {
                $verified = true;
                break;
            }
        }

        if (!$verified) {
            return ['valid' => false, 'error' => 'Invalid webhook signature'];
        }

        // Parse payload
        $parsed = json_decode($payload, true);
        if ($parsed !== null) {
            return ['valid' => true, 'payload' => $parsed];
        }

        return ['valid' => true, 'payload' => $payload];
    }

    /**
     * Decode a Standard Webhooks secret.
     */
    private static function decodeSecret(string $secret): string
    {
        $stripped = str_starts_with($secret, 'whsec_')
            ? substr($secret, 6)
            : $secret;

        $decoded = base64_decode($stripped, true);
        return $decoded !== false ? $decoded : $secret;
    }
}
