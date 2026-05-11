<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Analytics
 */
class Analytics
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * Get delivery trend data.
     *
     * @return array{data: array<int, array{date: string, total: int, delivered: int, failed: int}>}
     * @throws \HookSniff\ApiException
     */
    public function trends(?string $since = null, ?string $until = null): array
    {
        $req = new Request('GET', '/v1/analytics/deliveries');
        $params = [];
        if ($since !== null) $params['since'] = $since;
        if ($until !== null) $params['until'] = $until;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * Get success rate metrics.
     *
     * @return array{rate: float, total: int, delivered: int, failed: int}
     * @throws \HookSniff\ApiException
     */
    public function successRate(?string $since = null, ?string $until = null): array
    {
        $req = new Request('GET', '/v1/analytics/success-rate');
        $params = [];
        if ($since !== null) $params['since'] = $since;
        if ($until !== null) $params['until'] = $until;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * Get latency metrics.
     *
     * @return array{p50: float, p95: float, p99: float, avg: float}
     * @throws \HookSniff\ApiException
     */
    public function latency(?string $since = null, ?string $until = null): array
    {
        $req = new Request('GET', '/v1/analytics/latency');
        $params = [];
        if ($since !== null) $params['since'] = $since;
        if ($until !== null) $params['until'] = $until;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }
}
