<?php

declare(strict_types=1);

namespace HookSniff\Test\Resources;

use HookSniff\Resources\Webhooks;
use PHPUnit\Framework\TestCase;

class WebhooksTest extends TestCase
{
    private const CTX = [
        'baseUrl'    => 'https://api.hooksniff.test',
        'token'      => 'test_tok_xxx',
        'timeout'    => 5000,
        'numRetries' => 0,
    ];

    private Webhooks $webhooks;

    protected function setUp(): void
    {
        RequestCapture::reset();
        \HookSniff\Request::setNextResponse(null);
        \HookSniff\Request::setResponseQueue([]);
        $this->webhooks = new Webhooks(self::CTX);
    }

    // ── send() ──────────────────────────────────────────────────────

    public function testSendSendsPostToWebhooks(): void
    {
        $input = [
            'endpoint_id' => 'ep_1',
            'event'       => 'order.created',
            'data'        => ['order_id' => '99'],
        ];
        \HookSniff\Request::setNextResponse(['id' => 'wh_1', 'status' => 'queued']);
        $this->webhooks->send($input);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('POST', $call['method']);
        $this->assertSame('/v1/webhooks', $call['path']);

        $body = json_decode($call['body'], true);
        $this->assertSame('ep_1', $body['endpoint_id']);
        $this->assertSame('order.created', $body['event']);
        $this->assertSame('99', $body['data']['order_id']);
    }

    public function testSendWithIdempotencyKeySetsHeader(): void
    {
        \HookSniff\Request::setNextResponse(['id' => 'wh_2']);
        $this->webhooks->send(
            ['endpoint_id' => 'ep_1', 'event' => 'test', 'data' => []],
            'idem_key_123',
        );

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('idem_key_123', $call['headers']['idempotency-key']);
    }

    // ── batch() ─────────────────────────────────────────────────────

    public function testBatchSendsPostToWebhooksBatch(): void
    {
        $input = [
            'endpoint_id' => 'ep_1',
            'events'      => [
                ['event' => 'a', 'data' => []],
                ['event' => 'b', 'data' => []],
            ],
        ];
        \HookSniff\Request::setNextResponse(['batch_id' => 'batch_1', 'count' => 2]);
        $this->webhooks->batch($input);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('POST', $call['method']);
        $this->assertSame('/v1/webhooks/batch', $call['path']);

        $body = json_decode($call['body'], true);
        $this->assertSame('ep_1', $body['endpoint_id']);
        $this->assertCount(2, $body['events']);
    }

    public function testBatchWithIdempotencyKeySetsHeader(): void
    {
        \HookSniff\Request::setNextResponse(['batch_id' => 'b_2', 'count' => 1]);
        $this->webhooks->batch(
            ['endpoint_id' => 'ep_1', 'events' => []],
            'batch_idem',
        );

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('batch_idem', $call['headers']['idempotency-key']);
    }

    // ── list() ──────────────────────────────────────────────────────

    public function testListSendsGetToWebhooks(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->webhooks->list();

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/webhooks', $call['path']);
        $this->assertEmpty($call['queryParams']);
    }

    public function testListWithLimitAndOffsetSendsQueryParams(): void
    {
        \HookSniff\Request::setNextResponse(['data' => [], 'has_more' => false]);
        $this->webhooks->list(10, 20);

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('10', $call['queryParams']['limit']);
        $this->assertSame('20', $call['queryParams']['offset']);
    }

    // ── get() ───────────────────────────────────────────────────────

    public function testGetSendsGetWithPathParam(): void
    {
        \HookSniff\Request::setNextResponse(['id' => 'wh_55', 'status' => 'delivered']);
        $this->webhooks->get('wh_55');

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('GET', $call['method']);
        $this->assertSame('/v1/webhooks/wh_55', $call['path']);
    }

    // ── replay() ────────────────────────────────────────────────────

    public function testReplaySendsPostWithPathParam(): void
    {
        \HookSniff\Request::setNextResponse(['id' => 'wh_77', 'status' => 'replayed']);
        $this->webhooks->replay('wh_77');

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('POST', $call['method']);
        $this->assertSame('/v1/webhooks/wh_77/replay', $call['path']);
    }

    public function testReplayWithIdempotencyKeySetsHeader(): void
    {
        \HookSniff\Request::setNextResponse(['id' => 'wh_88']);
        $this->webhooks->replay('wh_88', 'replay_idem');

        $call = RequestCapture::firstCall();
        $this->assertNotNull($call);
        $this->assertSame('replay_idem', $call['headers']['idempotency-key']);
    }

    // ── listAll() ───────────────────────────────────────────────────

    public function testListAllPaginatesThroughAllPages(): void
    {
        \HookSniff\Request::setResponseQueue([
            ['data' => [['id' => 'wh_1'], ['id' => 'wh_2']], 'has_more' => true],
            ['data' => [['id' => 'wh_3']], 'has_more' => false],
        ]);

        $result = $this->webhooks->listAll(2);

        $this->assertCount(3, $result);
        $this->assertSame('wh_1', $result[0]['id']);
        $this->assertSame('wh_3', $result[2]['id']);

        $calls = RequestCapture::getCalls();
        $this->assertCount(2, $calls);
        $this->assertSame('0', $calls[0]['queryParams']['offset']);
        $this->assertSame('2', $calls[1]['queryParams']['offset']);
    }
}
