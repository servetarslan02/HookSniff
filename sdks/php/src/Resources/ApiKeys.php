<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

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
     * List all API keys.
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function list(): array
    {
        $req = new Request('GET', '/v1/api-keys');
        return $req->send($this->ctx);
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
