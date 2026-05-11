<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

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
     * List team members.
     *
     * @return array<int, array<string, mixed>>
     * @throws \HookSniff\ApiException
     */
    public function list(): array
    {
        $req = new Request('GET', '/v1/teams/members');
        return $req->send($this->ctx);
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
