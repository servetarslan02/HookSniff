<?php

declare(strict_types=1);

namespace HookSniff\Test\Resources;

use HookSniff\Resources\Endpoints;
use PHPUnit\Framework\TestCase;

class EndpointsTest extends TestCase
{
    private const CTX = [
        'baseUrl'    => 'https://api.hooksniff.test',
        'token'      => 'test_tok_xxx',
        'timeout'    => 5000,
        'numRetries' => 0,
    ];

    private Endpoints $endpoints;

    protected function setUp(): void
    {
        RequestCapture::reset();
        \HookSniff\Request::setNextResponse(null);
        \HookSniff\Request::setResponseQueue([]);
        $this->endpoints = new Endpoints(self::CTX);
    }

    // ── list() ──────────────────────────────────────────────────────

    public function testListSendsGetToEndpoints(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->endpoints->list();

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/endpoints', $call['path']);
    }

    public function testListWithLimitAndOffsetSendsQueryParams(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->endpoints->list(25, 50);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/endpoints', $call['path']);
        $this->assertSame('25', $call['queryParams']['limit']);
        $this->assertSame('50', $call['queryParams']['offset']);
    }

    public function testListWithoutParamsSendsNoQueryParams(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->endpoints->list();

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertEmpty($call['queryParams']);
    }

    // ── create() ────────────────────────────────────────────────────

    public function testCreateSendsPostWithBody(): void
    {
        $input = ['url' => 'https://example.com/hook', 'description' => 'Test endpoint'];
        \HookSniff\Request::setNextResponse(['id' => 'ep_123', 'url' => $input['url']]);
        $this->endpoints->create($input);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('POST', $call['method']);
        $this->assertSame('/v1/endpoints', $call['path']);

        $body = json_decode($call['body'], true);
        $this->assertSame($input['url'], $body['url']);
        $this->assertSame($input['description'], $body['description']);
    }

    public function testCreateWithIdempotencyKeySetsHeader(): void
    {
        \HookSniff\Request::setNextResponse(['id' => 'ep_456']);
        $this->endpoints->create(['url' => 'https://a.com'], 'idem_abc');

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('idem_abc', $call['headers']['idempotency-key']);
    }

    // ── get() ───────────────────────────────────────────────────────

    public function testGetSendsGetWithPathParam(): void
    {
        \HookSniff\Request::setNextResponse(['id' => 'ep_999', 'url' => 'https://x.com']);
        $this->endpoints->get('ep_999');

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/endpoints/ep_999', $call['path']);
    }

    // ── delete() ────────────────────────────────────────────────────

    public function testDeleteSendsDeleteWithPathParam(): void
    {
        $this->endpoints->delete('ep_del');

        $call = RequestCapture::firstVoidCall();
        $this->assertNotNull($call);
        $this->assertSame('DELETE', $call['method']);
        $this->assertSame('/v1/endpoints/ep_del', $call['path']);
    }

    // ── rotateSecret() ──────────────────────────────────────────────

    public function testRotateSecretSendsPostToCorrectPath(): void
    {
        \HookSniff\Request::setNextResponse(['key' => 'whsec_new_key']);
        $this->endpoints->rotateSecret('ep_rotate');

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('POST', $call['method']);
        $this->assertSame('/v1/endpoints/ep_rotate/rotate-secret', $call['path']);
    }

    // ── update() ────────────────────────────────────────────────────

    public function testUpdateSendsPutWithBody(): void
    {
        $input = ['description' => 'Updated'];
        \HookSniff\Request::setNextResponse(['id' => 'ep_up']);
        $this->endpoints->update('ep_up', $input);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('PUT', $call['method']);
        $this->assertSame('/v1/endpoints/ep_up', $call['path']);

        $body = json_decode($call['body'], true);
        $this->assertSame('Updated', $body['description']);
    }

    // ── listAll() ───────────────────────────────────────────────────

    public function testListAllPaginatesThroughAllPages(): void
    {
        // Simulate 3 pages via response queue
        \HookSniff\Request::setResponseQueue([
            ['data' => [['id' => 'ep_1'], ['id' => 'ep_2']], 'has_more' => true],
            ['data' => [['id' => 'ep_3'], ['id' => 'ep_4']], 'has_more' => true],
            ['data' => [['id' => 'ep_5']], 'has_more' => false],
        ]);

        $result = $this->endpoints->listAll(2);

        // Should merge all pages
        $this->assertCount(5, $result);
        $this->assertSame('ep_1', $result[0]['id']);
        $this->assertSame('ep_5', $result[4]['id']);

        // Should have made 3 GET calls
        $calls = RequestCapture::getCalls();
        $this->assertCount(3, $calls);

        // Verify offsets: 0, 2, 4
        $this->assertSame('0', $calls[0]['queryParams']['offset']);
        $this->assertSame('2', $calls[1]['queryParams']['offset']);
        $this->assertSame('4', $calls[2]['queryParams']['offset']);

        // All calls go to the same path
        foreach ($calls as $call) {
            $this->assertSame('GET', $call['method']);
            $this->assertSame('/v1/endpoints', $call['path']);
            $this->assertSame('2', $call['queryParams']['limit']);
        }
    }

    public function testListAllSinglePage(): void
    {
        \HookSniff\Request::setNextResponse([
            'data' => [['id' => 'ep_a']],
            'has_more' => false,
        ]);

        $result = $this->endpoints->listAll(50);

        $this->assertCount(1, $result);
        $this->assertSame('ep_a', $result[0]['id']);

        // Only 1 call
        $calls = RequestCapture::getCalls();
        $this->assertCount(1, $calls);
        $this->assertSame('0', $calls[0]['queryParams']['offset']);
    }

    public function testListAllEmptyResult(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);

        $result = $this->endpoints->listAll();

        $this->assertSame([], $result);
    }
}
