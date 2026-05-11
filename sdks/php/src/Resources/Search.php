<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Search
 */
class Search
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * Search webhook deliveries.
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function query(string $q, ?int $limit = null): array
    {
        $req = new Request('GET', '/v1/search');
        $params = ['q' => $q];
        if ($limit !== null) $params['limit'] = $limit;
        $req->setQueryParams($params);
        return $req->send($this->ctx);
    }
}
