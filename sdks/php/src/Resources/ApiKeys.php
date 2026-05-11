<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;
use HookSniff\Pagination;

/**
 * HookSniff API Resource: API Keys
 */
class ApiKeys
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * List API keys (paginated).
     *
     * @return array{data: array<int, array<string, mixed>>, has_more: bool}
     * @throws \HookSniff\ApiException
     */
    public function list(?int $limit = null, ?int $offset = null): array
    {
        $req = new Request('GET', '/v1/api-keys');
        $params = [];
        if ($limit !== null) $params['limit'] = $limit;
        if ($offset !== null) $params['offset'] = $offset;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * List all API keys (auto-paginate).
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function listAll(int $limit = Pagination::DEFAULT_LIMIT): array
    {
        return Pagination::collectAll(function ($l, $o) {
            return $this->list($l, $o);
        }, $limit);
    }

    /**
     * Create a new API key.
     *
     * @param array{name: string, expires_at?: string} $input
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function create(array $input, ?string $idempotencyKey = null): array
    {
        $req = new Request('POST', '/v1/api-keys');
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * Delete an API key.
     *
     * @throws \HookSniff\ApiException
     */
    public function delete(string $id): void
    {
        $req = new Request('DELETE', '/v1/api-keys/{id}');
        $req->setPathParam('id', $id);
        $req->sendVoid($this->ctx);
    }
}
