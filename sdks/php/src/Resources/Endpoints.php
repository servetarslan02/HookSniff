<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

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
     * List all endpoints.
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function list(): array
    {
        $req = new Request('GET', '/v1/endpoints');
        return $req->send($this->ctx);
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
