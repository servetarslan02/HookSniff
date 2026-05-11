<?php

declare(strict_types=1);

namespace HookSniff\Test;

use HookSniff\Webhook;
use HookSniff\WebhookVerificationError;
use PHPUnit\Framework\TestCase;

class WebhookTest extends TestCase
{
    private string $testSecret;
    private string $testBody;
    private string $testMsgId;
    private int $testTimestamp;

    protected function setUp(): void
    {
        $this->testSecret = 'whsec_' . base64_encode('test-secret-key-for-hmac-verify');
        $this->testBody = '{"event":"order.created","data":{"order_id":"12345"}}';
        $this->testMsgId = 'msg_test123';
        $this->testTimestamp = time();
    }

    private function signPayload(string $secret, string $msgId, int $timestamp, string $body): string
    {
        $raw = str_starts_with($secret, 'whsec_') ? substr($secret, 6) : $secret;
        $decoded = base64_decode($raw, true) ?: $raw;
        $content = $msgId . '.' . $timestamp . '.' . $body;
        $hmac = base64_encode(hash_hmac('sha256', $content, $decoded, true));
        return 'v1,' . $hmac;
    }

    private function validHeaders(?string $msgId = null, ?int $timestamp = null): array
    {
        $mid = $msgId ?? $this->testMsgId;
        $ts = $timestamp ?? $this->testTimestamp;
        return [
            'webhook-id' => $mid,
            'webhook-timestamp' => (string) $ts,
            'webhook-signature' => $this->signPayload($this->testSecret, $mid, $ts, $this->testBody),
        ];
    }

    // Test 1: Valid signature verification
    public function testValidSignatureReturnsParsedJson(): void
    {
        $wh = new Webhook($this->testSecret);
        $result = $wh->verify($this->testBody, $this->validHeaders());
        $this->assertSame('order.created', $result['event']);
        $this->assertSame('12345', $result['data']['order_id']);
    }

    // Test 2: Invalid signature
    public function testInvalidSignatureThrowsError(): void
    {
        $wh = new Webhook($this->testSecret);
        $headers = $this->validHeaders();
        $headers['webhook-signature'] = 'v1,aW52YWxpZHNpZ25hdHVyZQ==';
        $this->expectException(WebhookVerificationError::class);
        $wh->verify($this->testBody, $headers);
    }

    // Test 3: Missing webhook-id header
    public function testMissingWebhookIdThrowsError(): void
    {
        $wh = new Webhook($this->testSecret);
        $headers = $this->validHeaders();
        unset($headers['webhook-id']);
        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Missing webhook-id');
        $wh->verify($this->testBody, $headers);
    }

    // Test 4: Missing webhook-timestamp header
    public function testMissingWebhookTimestampThrowsError(): void
    {
        $wh = new Webhook($this->testSecret);
        $headers = $this->validHeaders();
        unset($headers['webhook-timestamp']);
        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Missing webhook-timestamp');
        $wh->verify($this->testBody, $headers);
    }

    // Test 5: Missing webhook-signature header
    public function testMissingWebhookSignatureThrowsError(): void
    {
        $wh = new Webhook($this->testSecret);
        $headers = $this->validHeaders();
        unset($headers['webhook-signature']);
        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Missing webhook-signature');
        $wh->verify($this->testBody, $headers);
    }

    // Test 6: Expired timestamp (replay protection)
    public function testExpiredTimestampThrowsError(): void
    {
        $wh = new Webhook($this->testSecret);
        $oldTimestamp = time() - 600; // 10 minutes ago
        $headers = $this->validHeaders($this->testMsgId, $oldTimestamp);
        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('too old or too new');
        $wh->verify($this->testBody, $headers);
    }

    // Test 7: Svix-branded headers work
    public function testSvixBrandedHeadersWork(): void
    {
        $wh = new Webhook($this->testSecret);
        $ts = $this->testTimestamp;
        $sig = $this->signPayload($this->testSecret, $this->testMsgId, $ts, $this->testBody);
        $headers = [
            'svix-id' => $this->testMsgId,
            'svix-timestamp' => (string) $ts,
            'svix-signature' => $sig,
        ];
        $result = $wh->verify($this->testBody, $headers);
        $this->assertSame('order.created', $result['event']);
    }

    // Test 8: Multiple comma-separated signatures
    public function testMultipleSignaturesWork(): void
    {
        $wh = new Webhook($this->testSecret);
        $ts = $this->testTimestamp;
        $realSig = $this->signPayload($this->testSecret, $this->testMsgId, $ts, $this->testBody);
        $combinedSig = 'v1,aW52YWxpZA==,' . $realSig;
        $headers = $this->validHeaders();
        $headers['webhook-signature'] = $combinedSig;
        $result = $wh->verify($this->testBody, $headers);
        $this->assertSame('order.created', $result['event']);
    }

    // Test 9: sign() produces verifiable signature
    public function testSignProducesVerifiableSignature(): void
    {
        $wh = new Webhook($this->testSecret);
        $ts = $this->testTimestamp;
        $sig = $wh->sign($this->testMsgId, $ts, $this->testBody);
        $this->assertStringStartsWith('v1,', $sig);

        $headers = [
            'webhook-id' => $this->testMsgId,
            'webhook-timestamp' => (string) $ts,
            'webhook-signature' => $sig,
        ];
        $result = $wh->verify($this->testBody, $headers);
        $this->assertSame('order.created', $result['event']);
    }

    // Test 10: Secret with and without whsec_ prefix
    public function testSecretWithAndWithoutPrefix(): void
    {
        $rawSecret = base64_encode('test-secret-key-for-hmac-verify');
        $prefixed = 'whsec_' . $rawSecret;

        $whPrefixed = new Webhook($prefixed);
        $whRaw = new Webhook($rawSecret);

        $ts = $this->testTimestamp;
        $sig = $whRaw->sign($this->testMsgId, $ts, $this->testBody);
        $headers = [
            'webhook-id' => $this->testMsgId,
            'webhook-timestamp' => (string) $ts,
            'webhook-signature' => $sig,
        ];

        $result1 = $whPrefixed->verify($this->testBody, $headers);
        $result2 = $whRaw->verify($this->testBody, $headers);
        $this->assertSame('order.created', $result1['event']);
        $this->assertSame('order.created', $result2['event']);
    }

    // Test 11: Invalid timestamp format
    public function testInvalidTimestampFormatThrowsError(): void
    {
        $wh = new Webhook($this->testSecret);
        $headers = $this->validHeaders();
        $headers['webhook-timestamp'] = 'not_a_number';
        $this->expectException(WebhookVerificationError::class);
        $this->expectExceptionMessage('Invalid webhook-timestamp');
        $wh->verify($this->testBody, $headers);
    }

    // Test 12: verifyWithSecret static convenience
    public function testVerifyWithSecretStaticMethod(): void
    {
        $ts = $this->testTimestamp;
        $sig = $this->signPayload($this->testSecret, $this->testMsgId, $ts, $this->testBody);
        $headers = [
            'webhook-id' => $this->testMsgId,
            'webhook-timestamp' => (string) $ts,
            'webhook-signature' => $sig,
        ];
        $result = Webhook::verifyWithSecret($this->testSecret, $this->testBody, $headers);
        $this->assertSame('order.created', $result['event']);
    }

    // Test 13: Non-JSON payload returns raw string
    public function testNonJsonPayloadReturnsRawString(): void
    {
        $wh = new Webhook($this->testSecret);
        $rawBody = 'not json';
        $ts = $this->testTimestamp;
        $sig = $this->signPayload($this->testSecret, $this->testMsgId, $ts, $rawBody);
        $headers = [
            'webhook-id' => $this->testMsgId,
            'webhook-timestamp' => (string) $ts,
            'webhook-signature' => $sig,
        ];
        $result = $wh->verify($rawBody, $headers);
        $this->assertSame('not json', $result);
    }
}
