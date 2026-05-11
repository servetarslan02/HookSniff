<?php

declare(strict_types=1);

namespace HookSniff\Tests;

use PHPUnit\Framework\TestCase;
use HookSniff\Webhook;
use HookSniff\WebhookVerificationError;

class WebhookTest extends TestCase
{
    private const TEST_SECRET = 'whsec_' . 'dGVzdC1zZWNyZXQta2V5LWZvci1obWFj'; // base64 of "test-secret-key-for-hmac"
    private const TEST_BODY = '{"event":"order.created","data":{"order_id":"12345"}}';
    private const TEST_MSG_ID = 'msg_test123';

    /**
     * Helper: create a signed payload.
     */
    private function signPayload(string $secret, string $msgId, int $timestamp, string $body): array
    {
        $raw = str_starts_with($secret, 'whsec_') ? substr($secret, 6) : $secret;
        $secretBytes = base64_decode($raw, true) ?: $raw;
        $content = $msgId . '.' . $timestamp . '.' . $body;
        $signature = base64_encode(hash_hmac('sha256', $content, $secretBytes, true));

        return [
            'webhook-id' => $msgId,
            'webhook-timestamp' => (string) $timestamp,
            'webhook-signature' => 'v1,' . $signature,
        ];
    }

    // ===== Test 1: Valid signature verification =====
    public function testValidSignatureVerification(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);

        $result = $wh->verify(self::TEST_BODY, $headers);

        $this->assertIsArray($result);
        $this->assertEquals('order.created', $result['event']);
        $this->assertEquals('12345', $result['data']['order_id']);
    }

    // ===== Test 2: Invalid signature =====
    public function testInvalidSignature(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);
        $headers['webhook-signature'] = 'v1,invalid_signature_here';

        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Invalid webhook signature');
        $wh->verify(self::TEST_BODY, $headers);
    }

    // ===== Test 3: Missing webhook-id header =====
    public function testMissingWebhookId(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);

        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Missing webhook-id header');
        $wh->verify(self::TEST_BODY, []);
    }

    // ===== Test 4: Missing webhook-timestamp header =====
    public function testMissingWebhookTimestamp(): void
    {
        $wh = new Webhook(self::TEST_SECRET);

        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Missing webhook-timestamp header');
        $wh->verify(self::TEST_BODY, ['webhook-id' => 'msg_1']);
    }

    // ===== Test 5: Missing webhook-signature header =====
    public function testMissingWebhookSignature(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);

        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Missing webhook-signature header');
        $wh->verify(self::TEST_BODY, [
            'webhook-id' => 'msg_1',
            'webhook-timestamp' => (string) $timestamp,
        ]);
    }

    // ===== Test 6: Expired timestamp (replay protection) =====
    public function testExpiredTimestamp(): void
    {
        $oldTimestamp = time() - 600; // 10 minutes ago
        $wh = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $oldTimestamp, self::TEST_BODY);

        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('too old or too new');
        $wh->verify(self::TEST_BODY, $headers);
    }

    // ===== Test 7: Svix-branded headers =====
    public function testSvixBrandedHeaders(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);
        $standardHeaders = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);
        $svixHeaders = [
            'svix-id' => $standardHeaders['webhook-id'],
            'svix-timestamp' => $standardHeaders['webhook-timestamp'],
            'svix-signature' => $standardHeaders['webhook-signature'],
        ];

        $result = $wh->verify(self::TEST_BODY, $svixHeaders);
        $this->assertIsArray($result);
    }

    // ===== Test 8: Multiple comma-separated signatures =====
    public function testMultipleSignatures(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);
        // Add a wrong signature before the correct one
        $headers['webhook-signature'] = 'v1,wrong_sig,' . explode(',', $headers['webhook-signature'])[1];

        $result = $wh->verify(self::TEST_BODY, $headers);
        $this->assertIsArray($result);
    }

    // ===== Test 9: sign() method =====
    public function testSignMethod(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);
        $sig = $wh->sign(self::TEST_MSG_ID, $timestamp, self::TEST_BODY);

        $this->assertStringStartsWith('v1,', $sig);

        // Verify the signed payload
        $headers = [
            'webhook-id' => self::TEST_MSG_ID,
            'webhook-timestamp' => (string) $timestamp,
            'webhook-signature' => $sig,
        ];
        $result = $wh->verify(self::TEST_BODY, $headers);
        $this->assertIsArray($result);
    }

    // ===== Test 10: whsec_ prefix handling =====
    public function testSecretPrefixHandling(): void
    {
        $timestamp = time();
        // Without prefix
        $rawSecret = base64_encode('test-secret-key-for-hmac');
        $wh1 = new Webhook($rawSecret);
        $wh2 = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);

        $result1 = $wh1->verify(self::TEST_BODY, $headers);
        $result2 = $wh2->verify(self::TEST_BODY, $headers);

        $this->assertIsArray($result1);
        $this->assertIsArray($result2);
    }

    // ===== Test 11: Case-insensitive headers =====
    public function testCaseInsensitiveHeaders(): void
    {
        $timestamp = time();
        $wh = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);

        // Use mixed-case header keys
        $mixedHeaders = [
            'Webhook-Id' => $headers['webhook-id'],
            'Webhook-Timestamp' => $headers['webhook-timestamp'],
            'Webhook-Signature' => $headers['webhook-signature'],
        ];

        $result = $wh->verify(self::TEST_BODY, $mixedHeaders);
        $this->assertIsArray($result);
    }

    // ===== Test 12: Invalid timestamp format =====
    public function testInvalidTimestampFormat(): void
    {
        $wh = new Webhook(self::TEST_SECRET);

        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Invalid webhook-timestamp');
        $wh->verify(self::TEST_BODY, [
            'webhook-id' => 'msg_1',
            'webhook-timestamp' => 'not-a-number',
            'webhook-signature' => 'v1,abc',
        ]);
    }

    // ===== Test 13: verifyWithSecret static method =====
    public function testVerifyWithSecretStatic(): void
    {
        $timestamp = time();
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, self::TEST_BODY);

        $result = Webhook::verifyWithSecret(self::TEST_SECRET, self::TEST_BODY, $headers);
        $this->assertIsArray($result);
        $this->assertEquals('order.created', $result['event']);
    }

    // ===== Test 14: JSON payload parsed correctly =====
    public function testJsonPayloadParsed(): void
    {
        $timestamp = time();
        $body = '{"nested":{"deep":{"value":42}},"array":[1,2,3]}';
        $wh = new Webhook(self::TEST_SECRET);
        $headers = $this->signPayload(self::TEST_SECRET, self::TEST_MSG_ID, $timestamp, $body);

        $result = $wh->verify($body, $headers);
        $this->assertIsArray($result);
        $this->assertEquals(42, $result['nested']['deep']['value']);
        $this->assertEquals([1, 2, 3], $result['array']);
    }
}
