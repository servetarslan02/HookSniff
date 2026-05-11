<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;
use HookSniff\Pagination;

/**
 * HookSniff API Resource: Endpoints
 *
 * Manage webhook endpoints — create, list, update, delete, rotate secrets.
 */
class Endpoints
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * List endpoints (paginated).
     *
     * @return array{data: array<int, array<string, mixed>>, has_more: bool}
     * @throws \HookSniff\ApiException
     */
    public function list(?int $limit = null, ?int $offset = null): array
    {
        $req = new Request('GET', '/v1/endpoints');
        $params = [];
        if ($limit !== null) $params['limit'] = $limit;
        if ($offset !== null) $params['offset'] = $offset;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * List all endpoints (auto-paginate).
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
     * Create a new endpoint.
     *
     * @param array{url: string, description?: string, rate_limit?: int, active?: bool} $input
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function create(array $input, ?string $idempotencyKey = null): array
    {
        $req = new Request('POST', '/v1/endpoints');
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * Get an endpoint by ID.
     *
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function get(string $id): array
    {
        $req = new Request('GET', '/v1/endpoints/{id}');
        $req->setPathParam('id', $id);
        return $req->send($this->ctx);
    }

    /**
     * Update an endpoint.
     *
     * @param array{url?: string, description?: string, rate_limit?: int, active?: bool} $input
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function update(string $id, array $input): array
    {
        $req = new Request('PUT', '/v1/endpoints/{id}');
        $req->setPathParam('id', $id);
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * Delete an endpoint.
     *
     * @throws \HookSniff\ApiException
     */
    public function delete(string $id): void
    {
        $req = new Request('DELETE', '/v1/endpoints/{id}');
        $req->setPathParam('id', $id);
        $req->sendVoid($this->ctx);
    }

    /**
     * Rotate the signing secret for an endpoint.
     *
     * @return array{key: string}
     * @throws \HookSniff\ApiException
     */
    public function rotateSecret(string $id): array
    {
        $req = new Request('POST', '/v1/endpoints/{id}/rotate-secret');
        $req->setPathParam('id', $id);
        return $req->send($this->ctx);
    }
}
