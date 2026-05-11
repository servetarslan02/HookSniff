<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Health
 */
class Health
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * Check API health.
     *
     * @return array{status: string, db: array{status: string, latency_ms: float}, queue: array{status: string, latency_ms: float, pending: int}, uptime_seconds: float}
     * @throws \HookSniff\ApiException
     */
    public function check(): array
    {
        $req = new Request('GET', '/health');
        return $req->send($this->ctx);
    }
}
