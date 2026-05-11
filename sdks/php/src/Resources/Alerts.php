<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;
use HookSniff\Pagination;

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
     * List alert rules (paginated).
     *
     * @return array{data: array<int, array<string, mixed>>, has_more: bool}
     * @throws \HookSniff\ApiException
     */
    public function listRules(?int $limit = null, ?int $offset = null): array
    {
        $req = new Request('GET', '/v1/alerts/rules');
        $params = [];
        if ($limit !== null) $params['limit'] = $limit;
        if ($offset !== null) $params['offset'] = $offset;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * List all alert rules (auto-paginate).
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function listAllRules(int $limit = Pagination::DEFAULT_LIMIT): array
    {
        return Pagination::collectAll(function ($l, $o) {
            return $this->listRules($l, $o);
        }, $limit);
    }

    /**
     * List alert notifications (paginated).
     *
     * @return array{data: array<int, array<string, mixed>>, has_more: bool}
     * @throws \HookSniff\ApiException
     */
    public function listNotifications(?int $limit = null, ?int $offset = null): array
    {
        $req = new Request('GET', '/v1/alerts/notifications');
        $params = [];
        if ($limit !== null) $params['limit'] = $limit;
        if ($offset !== null) $params['offset'] = $offset;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * List all alert notifications (auto-paginate).
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function listAllNotifications(int $limit = Pagination::DEFAULT_LIMIT): array
    {
        return Pagination::collectAll(function ($l, $o) {
            return $this->listNotifications($l, $o);
        }, $limit);
    }
}
