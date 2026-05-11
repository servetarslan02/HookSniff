<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Webhooks
 *
 * Send, list, get, replay, and batch webhooks.
 */
class Webhooks
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * Send a single webhook.
     *
     * @param array{endpoint_id: string, event: string, data: array<string, mixed>} $input
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function send(array $input, ?string $idempotencyKey = null): array
    {
        $req = new Request('POST', '/v1/webhooks');
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * Send batch webhooks.
     *
     * @param array{endpoint_id: string, events: array<int, array{event: string, data: array<string, mixed>}>} $input
     * @return array{batch_id: string, count: int}
     * @throws \HookSniff\ApiException
     */
    public function batch(array $input, ?string $idempotencyKey = null): array
    {
        $req = new Request('POST', '/v1/webhooks/batch');
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * List deliveries.
     *
     * @return array{data: array<int, array<string, mixed>>, has_more: bool}
     * @throws \HookSniff\ApiException
     */
    public function list(?int $limit = null, ?int $offset = null): array
    {
        $req = new Request('GET', '/v1/webhooks');
        $params = [];
        if ($limit !== null) $params['limit'] = $limit;
        if ($offset !== null) $params['offset'] = $offset;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * Get a specific delivery.
     *
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function get(string $id): array
    {
        $req = new Request('GET', '/v1/webhooks/{id}');
        $req->setPathParam('id', $id);
        return $req->send($this->ctx);
    }

    /**
     * Replay a delivery.
     *
     * @return array<string, mixed>
     * @throws \HookSniff\ApiException
     */
    public function replay(string $id, ?string $idempotencyKey = null): array
    {
        $req = new Request('POST', '/v1/webhooks/{id}/replay');
        $req->setPathParam('id', $id);
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        return $req->send($this->ctx);
    }
}
