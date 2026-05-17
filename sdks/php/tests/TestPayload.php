<?php

namespace HookSniff\Tests;

final class TestPayload
{
    private const DEFAULT_MSG_ID = "msg_test123";
    private const DEFAULT_PAYLOAD = '{"test": 2432232315}';
    private const DEFAULT_SECRET = "dGVzdC1zaWduaW5nLWtleS1mb3ItdW5pdC10ZXN0cy1vbmx5";

    public $id;
    public $timestamp;
    public $payload;
    public $secret;
    public $header;

    public function __construct(int $timestamp)
    {
        $this->id = self::DEFAULT_MSG_ID;
        $this->timestamp = strval($timestamp);

        $this->payload = self::DEFAULT_PAYLOAD;
        $this->secret = self::DEFAULT_SECRET;

        $toSign = "{$this->id}.{$this->timestamp}.{$this->payload}";
        $signature = base64_encode(pack('H*', hash_hmac('sha256', $toSign, base64_decode($this->secret))));

        $this->header = array(
            "hooksniff-id" => $this->id,
            "hooksniff-signature" => "v1,{$signature}",
            "hooksniff-timestamp" => $this->timestamp,
        );
    }
}
