<?php

declare(strict_types=1);

namespace HookSniff\Tests;

use PHPUnit\Framework\TestCase;
use HookSniff\Webhook;
use HookSniff\Exception\WebhookVerificationException;

class WebhookTest extends TestCase
{
    private const SECRET = 'whsec_dGVzdA==';
    private const MSG_ID = 'msg_test123';
    private const PAYLOAD = '{"event":"test"}';

    private function sign(string $secret, string $msgId, int $timestamp, string $payload): string
    {
        $decoded = base64_decode(str_replace('whsec_', '', $secret));
        $toSign = "{$msgId}.{$timestamp}.{$payload}";
        $sig = base64_encode(hash_hmac('sha256', $toSign, $decoded, true));
        return "v1,{$sig}";
    }

    public function testVerifyValidSignature(): void
    {
        $wh = new Webhook(self::SECRET);
        $timestamp = time();
        $sig = $this->sign(self::SECRET, self::MSG_ID, $timestamp, self::PAYLOAD);
        $headers = [
            'webhook-id' => self::MSG_ID,
            'webhook-timestamp' => (string) $timestamp,
            'webhook-signature' => $sig,
        ];
        $result = $wh->verify(self::PAYLOAD, $headers);
        $this->assertEquals(['event' => 'test'], $result);
    }

    public function testRejectInvalidSignature(): void
    {
        $wh = new Webhook(self::SECRET);
        $headers = [
            'webhook-id' => self::MSG_ID,
            'webhook-timestamp' => (string) time(),
            'webhook-signature' => 'v1,invalid',
        ];
        $this->expectException(WebhookVerificationException::class);
        $wh->verify(self::PAYLOAD, $headers);
    }

    public function testRejectOldTimestamp(): void
    {
        $wh = new Webhook(self::SECRET);
        $oldTs = time() - 600;
        $sig = $this->sign(self::SECRET, self::MSG_ID, $oldTs, self::PAYLOAD);
        $headers = [
            'webhook-id' => self::MSG_ID,
            'webhook-timestamp' => (string) $oldTs,
            'webhook-signature' => $sig,
        ];
        $this->expectException(WebhookVerificationException::class);
        $wh->verify(self::PAYLOAD, $headers);
    }

    public function testSvixBrandedHeaders(): void
    {
        $wh = new Webhook(self::SECRET);
        $timestamp = time();
        $sig = $this->sign(self::SECRET, self::MSG_ID, $timestamp, self::PAYLOAD);
        $headers = [
            'svix-id' => self::MSG_ID,
            'svix-timestamp' => (string) $timestamp,
            'svix-signature' => $sig,
        ];
        $result = $wh->verify(self::PAYLOAD, $headers);
        $this->assertEquals(['event' => 'test'], $result);
    }
}
