<?php

namespace HookSniff\Tests;

final class WebhookTest extends \PHPUnit\Framework\TestCase
{
    private const TOLERANCE = 5 * 60;

    public function testValidSignatureIsValidAndReturnsJson()
    {
        $testPayload = new TestPayload(time());

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $json = $wh->verify($testPayload->payload, $testPayload->header);

        $this->assertEquals(
            $json['test'],
            2432232315,
            "did not return expected json"
        );
    }

    public function testValidBrandlessSignatureIsValidAndReturnsJson()
    {
        $testPayload = new TestPayload(time());
        $unbrandedHeaders = array(
            "webhook-id" => $testPayload->header['hooksniff-id'],
            "webhook-signature" => $testPayload->header['hooksniff-signature'],
            "webhook-timestamp" => $testPayload->header['hooksniff-timestamp'],
        );
        $testPayload->header = $unbrandedHeaders;

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $json = $wh->verify($testPayload->payload, $testPayload->header);

        $this->assertEquals(
            $json['test'],
            2432232315,
            "did not return expected json"
        );
    }

    public function testInvalidSignatureThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("No matching signature found");

        $testPayload = new TestPayload(time());
        $testPayload->header['hooksniff-signature'] = 'v1,dawfeoifkpqwoekfpqoekf';

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testBadlyFormattedSignatureThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("No matching signature found");

        $testPayload = new TestPayload(time());
        $testPayload->header['hooksniff-signature'] = 'BAD_SIG_NATURE';

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testMissingIdThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("Missing required headers");

        $testPayload = new TestPayload(time());
        unset($testPayload->header['hooksniff-id']);

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testMissingTimestampThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("Missing required headers");

        $testPayload = new TestPayload(time());
        unset($testPayload->header['hooksniff-timestamp']);

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testMissingSignatureThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("Missing required headers");

        $testPayload = new TestPayload(time());
        unset($testPayload->header['hooksniff-signature']);

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testOldTimestampThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("Message timestamp too old");

        $testPayload = new TestPayload(time() - self::TOLERANCE - 1);

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testNewTimestampThrowsException()
    {
        $this->expectException(\HookSniff\Exception\WebhookVerificationException::class);
        $this->expectExceptionMessage("Message timestamp too new");

        $testPayload = new TestPayload(time() + self::TOLERANCE + 1);

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testMultiSigPayloadIsValid()
    {
        // We're checking that `verify()` doesn't throw an exception.
        // It doesn't return anything we can assert about.
        $this->expectNotToPerformAssertions();

        $testPayload = new TestPayload(time());
        $sigs = [
            "v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
            "v2,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
            $testPayload->header['hooksniff-signature'], // valid signature
            "v1,Ceo5qEr07ixe2NLpvHk3FH9bwy/WavXrAFQ/9tdO6mc=",
        ];
        $testPayload->header['hooksniff-signature'] = implode(" ", $sigs);

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testSignatureVerificationWithAndWithoutPrefix()
    {
        // We're checking that `verify()` doesn't throw an exception.
        // It doesn't return anything we can assert about.
        $this->expectNotToPerformAssertions();

        $testPayload = new TestPayload(time());

        $wh = new \HookSniff\Webhook($testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);


        $wh = new \HookSniff\Webhook("whsec_" . $testPayload->secret);
        $wh->verify($testPayload->payload, $testPayload->header);
    }

    public function testSignFunctionWorks()
    {
        $key = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
        $msgId = "msg_p5jXN8AQM9LWM0D4loKWxJek";
        $timestamp = 1614265330;
        $payload = '{"test": 2432232314}';
        $expected = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=";

        $wh = new \HookSniff\Webhook($key);

        $signature = $wh->sign($msgId, $timestamp, $payload);
        $this->assertEquals(
            $signature,
            $expected,
            "did not return expected signature"
        );
    }

    public function testInvalidFloatTimestamp()
    {
        $this->expectException(\HookSniff\Exception\WebhookSigningException::class);
        $key = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
        $msgId = "msg_p5jXN8AQM9LWM0D4loKWxJek";
        $timestamp = "161426533.0";
        $payload = '{"test": 2432232314}';
        $expected = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=";

        $wh = new \HookSniff\Webhook($key);

        $signature = $wh->sign($msgId, $timestamp, $payload);
    }

    public function testInvalidStringTimestamp()
    {
        $this->expectException(\HookSniff\Exception\WebhookSigningException::class);
        $key = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
        $msgId = "msg_p5jXN8AQM9LWM0D4loKWxJek";
        $timestamp = "invalid timestamp";
        $payload = '{"test": 2432232314}';
        $expected = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=";

        $wh = new \HookSniff\Webhook($key);

        $signature = $wh->sign($msgId, $timestamp, $payload);
    }

    public function testInvalidNegativeTimestamp()
    {
        $this->expectException(\HookSniff\Exception\WebhookSigningException::class);
        $key = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
        $msgId = "msg_p5jXN8AQM9LWM0D4loKWxJek";
        $timestamp = "-161426533";
        $payload = '{"test": 2432232314}';
        $expected = "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=";

        $wh = new \HookSniff\Webhook($key);

        $signature = $wh->sign($msgId, $timestamp, $payload);
    }
}
