<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;
use HookSniff\Pagination;

/**
 * HookSniff API Resource: Teams
 */
class Teams
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * List team members (paginated).
     *
     * @return array{data: array<int, array<string, mixed>>, has_more: bool}
     * @throws \HookSniff\ApiException
     */
    public function list(?int $limit = null, ?int $offset = null): array
    {
        $req = new Request('GET', '/v1/teams/members');
        $params = [];
        if ($limit !== null) $params['limit'] = $limit;
        if ($offset !== null) $params['offset'] = $offset;
        if (!empty($params)) $req->setQueryParams($params);
        return $req->send($this->ctx);
    }

    /**
     * List all team members (auto-paginate).
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
     * Invite a team member.
     *
     * @throws \HookSniff\ApiException
     */
    public function invite(string $email, string $role, ?string $idempotencyKey = null): void
    {
        $req = new Request('POST', '/v1/teams/invite');
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        $req->setBody(['email' => $email, 'role' => $role]);
        $req->sendVoid($this->ctx);
    }

    /**
     * Remove a team member.
     *
     * @throws \HookSniff\ApiException
     */
    public function remove(string $memberId): void
    {
        $req = new Request('DELETE', '/v1/teams/members/{id}');
        $req->setPathParam('id', $memberId);
        $req->sendVoid($this->ctx);
    }
}
