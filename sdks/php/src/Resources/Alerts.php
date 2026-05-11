<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Alerts
 */
class Alerts
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * List alert rules.
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function listRules(): array
    {
        $req = new Request('GET', '/v1/alerts/rules');
        return $req->send($this->ctx);
    }

    /**
     * List alert notifications.
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function listNotifications(?int $limit = null): array
    {
        $req = new Request('GET', '/v1/alerts/notifications');
        if ($limit !== null) {
            $req->setQueryParams(['limit' => $limit]);
        }
        return $req->send($this->ctx);
    }
}
