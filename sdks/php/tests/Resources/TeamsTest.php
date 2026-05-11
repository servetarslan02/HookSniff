<?php

declare(strict_types=1);

namespace HookSniff\Test\Resources;

use HookSniff\Resources\Teams;
use PHPUnit\Framework\TestCase;

class TeamsTest extends TestCase
{
    private const CTX = [
        'baseUrl'    => 'https://api.hooksniff.test',
        'token'      => 'test_tok_xxx',
        'timeout'    => 5000,
        'numRetries' => 0,
    ];

    private Teams $teams;

    protected function setUp(): void
    {
        RequestCapture::reset();
        \HookSniff\Request::setNextResponse(null);
        \HookSniff\Request::setResponseQueue([]);
        $this->teams = new Teams(self::CTX);
    }

    // ── list() (team members) ───────────────────────────────────────

    public function testListMembersSendsGetToTeamsMembers(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->teams->list();

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/teams/members', $call['path']);
        $this->assertEmpty($call['queryParams']);
    }

    public function testListMembersWithLimitAndOffsetSendsQueryParams(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->teams->list(10, 5);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/teams/members', $call['path']);
        $this->assertSame('10', $call['queryParams']['limit']);
        $this->assertSame('5', $call['queryParams']['offset']);
    }

    // ── invite() ────────────────────────────────────────────────────

    public function testInviteSendsPostToTeamsInvite(): void
    {
        $this->teams->invite('alice@example.com', 'admin');

        $call = RequestCapture::firstVoidCall();
        $this->assertNotNull($call);
        $this->assertSame('POST', $call['method']);
        $this->assertSame('/v1/teams/invite', $call['path']);

        $body = json_decode($call['body'], true);
        $this->assertSame('alice@example.com', $body['email']);
        $this->assertSame('admin', $body['role']);
    }

    public function testInviteWithIdempotencyKeySetsHeader(): void
    {
        $this->teams->invite('bob@example.com', 'member', 'invite_idem_key');

        $call = RequestCapture::firstVoidCall();
        $this->assertNotNull($call);
        $this->assertSame('invite_idem_key', $call['headers']['idempotency-key']);
    }

    // ── remove() ────────────────────────────────────────────────────

    public function testRemoveMemberSendsDeleteWithPathParam(): void
    {
        $this->teams->remove('member_xyz');

        $call = RequestCapture::firstVoidCall();
        $this->assertNotNull($call);
        $this->assertSame('DELETE', $call['method']);
        $this->assertSame('/v1/teams/members/member_xyz', $call['path']);
    }

    // ── listAll() ───────────────────────────────────────────────────

    public function testListAllPaginatesThroughAllPages(): void
    {
        \HookSniff\Request::setResponseQueue([
            ['data' => [['id' => 'm1'], ['id' => 'm2']], 'has_more' => true],
            ['data' => [['id' => 'm3']], 'has_more' => false],
        ]);

        $result = $this->teams->listAll(2);

        $this->assertCount(3, $result);
        $this->assertSame('m1', $result[0]['id']);
        $this->assertSame('m3', $result[2]['id']);

        $calls = RequestCapture::getCalls();
        $this->assertCount(2, $calls);
        $this->assertSame('/v1/teams/members', $calls[0]['path']);
        $this->assertSame('/v1/teams/members', $calls[1]['path']);
    }
}
