<?php

namespace HookSniff\Tests;


use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Psr7\Request;
use PHPUnit\Framework\TestCase;
use HookSniff\Api\ApplicationCreateOptions;
use HookSniff\Api\ApplicationListOptions;
use HookSniff\Api\BackgroundTaskListOptions;
use HookSniff\Api\MessageAttemptListByEndpointOptions;
use HookSniff\Api\MessageListOptions;
use HookSniff\Models\ApplicationIn;
use HookSniff\Models\ApplicationPatch;
use HookSniff\Models\AppPortalAccessIn;
use HookSniff\Models\BackgroundTaskOut;
use HookSniff\Models\BackgroundTaskStatus;
use HookSniff\Models\BackgroundTaskType;
use HookSniff\Models\ConnectorIn;
use HookSniff\Models\ConnectorKind;
use HookSniff\Models\EnvironmentIn;
use HookSniff\Models\ListResponseApplicationOut;
use HookSniff\Models\MessageAttemptOut;
use HookSniff\Models\MessageAttemptTriggerType;
use HookSniff\Models\MessageIn;
use HookSniff\Models\MessageStatus;
use HookSniff\Models\Ordering;
use HookSniff\Models\ReplayIn;
use HookSniff\Models\StatusCodeClass;
use HookSniff\HookSniffClient;
use HookSniff\HookSniffOptions;
use HookSniff\Version;


const AppOut = '{"uid":"unique-identifier","name":"My first application","rateLimit":0,"id":"app_1srOrx2ZWZBpBUvZwXKQmoEYga2","createdAt":"2025-08-27T17:43:50+00:00","updatedAt":"2019-08-24T14:15:22Z","metadata":{"property1":"string","property2":"string"}}';
const ListResAppOut = '{"data":[{"uid":"unique-identifier","name":"My first application","rateLimit":0,"id":"app_1srOrx2ZWZBpBUvZwXKQmoEYga2","createdAt":"2025-08-27T17:43:50Z","updatedAt":"2019-08-24T14:15:22Z","metadata":{"property1":"string","property2":"string"}}],"iterator":"iterator","prevIterator":"-iterator","done":true}';
const MsgOut = '{"eventId":"unique-identifier","eventType":"user.signup","payload":{"email":"test@example.com","type":"user.created","username":"test_user"},"channels":["project_123","group_2"],"id":"msg_1srOrx2ZWZBpBUvZwXKQmoEYga2","timestamp":"2019-08-24T14:15:22Z","tags":["project_1337"]}';
const ListResMessageOut = '{"data":[{"eventId":"unique-identifier","eventType":"user.signup","payload":{"email":"test@example.com","type":"user.created","username":"test_user"},"channels":["project_123","group_2"],"id":"msg_1srOrx2ZWZBpBUvZwXKQmoEYga2","timestamp":"2019-08-24T14:15:22Z","tags":["project_1337"]}],"iterator":"iterator","prevIterator":"-iterator","done":true}';
const ListResMessageAttemptOut = '{"data":[{"url":"https://example.com/webhook/","response":"{}","responseStatusCode":200,"responseDurationMs":0,"status":0,"statusText":"success","triggerType":0,"msgId":"msg_1srOrx2ZWZBpBUvZwXKQmoEYga2","endpointId":"ep_1srOrx2ZWZBpBUvZwXKQmoEYga2","id":"atmpt_1srOrx2ZWZBpBUvZwXKQmoEYga2","timestamp":"2025-02-16T21:38:21.977Z","msg":{"eventId":"unique-identifier","eventType":"user.signup","payload":{"email":"test@example.com","type":"user.created","username":"test_user"},"channels":["project_123","group_2"],"id":"msg_1srOrx2ZWZBpBUvZwXKQmoEYga2","timestamp":"2025-02-16T21:38:21.977Z","tags":["project_1337"]}}],"iterator":"iterator","prevIterator":"-iterator","done":true}';
const ListResBackgroundTaskOut = '{"data":[{"data":{},"id":"qtask_1srOrx2ZWZBpBUvZwXKQmoEYga2","status":"running","task":"endpoint.replay","updatedAt":"2025-03-03T03:03:03.000000Z"}],"iterator":"iterator","prevIterator":"-iterator","done":true}';
const BackgroundTaskOut = '{"data":{},"id":"qtask_1srOrx2ZWZBpBUvZwXKQmoEYga2","status":"finished","task":"application.stats","updatedAt":"2025-03-03T03:03:03.000000Z"}';
const MessageAttemptOut = '{"url":"https://example.com/webhook/","response":"{}","responseStatusCode":200,"responseDurationMs":50,"status":2,"triggerType":1,"msgId":"msg_1srOrx2ZWZBpBUvZwXKQmoEYga2","endpointId":"ep_1srOrx2ZWZBpBUvZwXKQmoEYga2","id":"atmpt_1srOrx2ZWZBpBUvZwXKQmoEYga2","timestamp":"2025-02-16T21:38:21.977Z"}';
const ConnectorOut = '{"id":"conn_1srOrx2ZWZBpBUvZwXKQmoEYga2","name":"Test Connector","kind":"Slack","logo":"test-logo","transformation":"test-transformation","description":"Test description"}';
const IntegrationOut = '{"id":"integ_1srOrx2ZWZBpBUvZwXKQmoEYga2","name":"Test Integration"}';
const MessageOut = '{"eventId":"unique-identifier","eventType":"user.signup","payload":{"email":"test@example.com","type":"user.created","username":"test_user"},"channels":["project_123","group_2"],"id":"msg_1srOrx2ZWZBpBUvZwXKQmoEYga2","timestamp":"2019-08-24T14:15:22Z","tags":["project_1337"]}';
const ReplayOut = '{"id":"qtask_1srOrx2ZWZBpBUvZwXKQmoEYga2","status":"running","task":"endpoint.replay","updatedAt":"2025-03-03T03:03:03.000000Z"}';
const AppPortalAccessOut = '{"url": "https://app.hooksniff.com/login#key=eyJhcHBJZCI6ICJhcHBfMXRSdFl","token": "appsk_kV3ts5tKPNJN4Dl25cMTfUNdmabxbX0O"}';


class MockTest extends TestCase
{
    private array $requestHistory = [];
    private MockHandler $mockHandler;
    private Client $httpClient;

    protected function setUp(): void
    {
        $this->requestHistory = [];
        $this->mockHandler = new MockHandler();

        $handlerStack = HandlerStack::create($this->mockHandler);

        // Add history middleware to capture all requests
        $handlerStack->push(Middleware::history($this->requestHistory));

        $this->httpClient = new Client(['handler' => $handlerStack]);
    }

    public function testMsgCreate(): void
    {
        $this->mockHandler->append(new Response(200, [], MsgOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);


        $svx->message->create(
            "app",
            MessageIn::create("event-type", ['id' => 'one', 'value' => 'value1'])
        );

        $req = $this->requestHistory[0]['request'];
        $rawBody = $req->getBody()->getContents();
        $this->assertEquals('{"eventType":"event-type","payload":{"id":"one","value":"value1"}}', $rawBody);
    }

    public function testBasicHeaders(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResAppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);


        $svx->application->list();

        $getReq = $this->requestHistory[0]['request'];
        $this->assertEquals('hooksniff-libs/' . Version::VERSION . '/php', $getReq->getHeaderLine('User-Agent'));
        $this->assertEquals('Bearer super_secret', $getReq->getHeaderLine('Authorization'));
        $this->assertIsString($getReq->getHeaderLine('hooksniff-req-id'));
    }

    public function testIdempotencyKey(): void
    {
        $this->mockHandler->append(new Response(200, [], AppOut), new Response(200, [], AppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        // first request auto generated idempotency-key
        $svx->application->create(ApplicationIn::create("asd"));
        // second req user specified key
        $svx->application->create(ApplicationIn::create("asd"), new ApplicationCreateOptions("test-key"));

        $req1 = $this->requestHistory[0]['request'];
        $req2 = $this->requestHistory[1]['request'];

        $this->assertStringStartsWith("auto_", $req1->getHeaderLine('idempotency-key'));
        $this->assertEquals("test-key", $req2->getHeaderLine('idempotency-key'));
    }

    public function testDateInQueryParam(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResMessageAttemptOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        // first request auto generated idempotency-key
        $svx->messageAttempt->listByEndpoint(
            'app',
            'endp',
            new MessageAttemptListByEndpointOptions(
                channel: 'asd',
                after: new \DateTimeImmutable('2025-08-27T17:43:50+00:00'),
                eventTypes: ['ev1', 'eventtype-2']
            )
        );

        $req1 = $this->requestHistory[0]['request'];
        $query = $req1->getUri()->getQuery();
        // channel=asd&after=2025-08-27T17:43:50+00:00&event_types=ev1,eventtype-2
        $this->assertEquals('channel=asd&after=2025-08-27T17%3A43%3A50%2B00%3A00&event_types=ev1%2Ceventtype-2', $query);
    }

    public function testDateSerialization(): void
    {
        $this->mockHandler->append(new Response(200, [], ReplayOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->endpoint->replayMissing('app', 'endp', ReplayIn::create(
            new \DateTimeImmutable('2025-08-27T17:43:50+00:00'),
        ));


        $req1 = $this->requestHistory[0]['request'];
        $body = $req1->getBody()->getContents();
        $this->assertEquals('{"since":"2025-08-27T17:43:50+00:00"}', $body);
    }

    public function testDateDeserialization(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResAppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $apps = $svx->application->list();
        $createdAt = $apps->data[0]->createdAt->getTimestamp();;
        $this->assertEquals(1756316630, $createdAt);
    }


    public function testCorrectContentTypeHeader(): void
    {
        $this->mockHandler->append(
            new Response(200, [], ListResAppOut),
            new Response(200, [], AppOut),
            new Response(200, [], AppOut),
            new Response(200, [], AppOut)


        );

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        // GET
        $svx->application->list();
        // POST
        $svx->application->create(ApplicationIn::create('asd'));
        // PUT
        $svx->application->update('app_id', ApplicationIn::create('asd'));
        // PATCH
        $svx->application->patch('app_id', ApplicationPatch::create()->withName('asd'));



        $getReq = $this->requestHistory[0]['request'];
        $postReq = $this->requestHistory[1]['request'];
        $putReq = $this->requestHistory[2]['request'];
        $patchReq = $this->requestHistory[3]['request'];


        $this->assertFalse($getReq->hasHeader('content-type'));
        $this->assertEquals('application/json', $postReq->getHeaderLine('content-type'));
        $this->assertEquals('application/json', $putReq->getHeaderLine('content-type'));
        $this->assertEquals('application/json', $patchReq->getHeaderLine('content-type'));
    }

    public function testEnumAsQueryParam(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResAppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->application->list(new ApplicationListOptions(
            limit: 10,
            order: Ordering::DESCENDING
        ));

        $req = $this->requestHistory[0]['request'];
        $query = $req->getUri()->getQuery();
        $this->assertEquals('limit=10&order=descending', $query);
    }

    public function testListResponseOutDeserializesCorrectly(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResAppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $response = $svx->application->list();

        $this->assertInstanceOf(ListResponseApplicationOut::class, $response);
        $this->assertEquals('iterator', $response->iterator);
        $this->assertEquals('-iterator', $response->prevIterator);
        $this->assertTrue($response->done);


        $this->assertCount(1, $response->data);

        $app = $response->data[0];
        $this->assertEquals('unique-identifier', $app->uid);
        $this->assertEquals('My first application', $app->name);
        $this->assertEquals(0, $app->rateLimit);
        $this->assertEquals('app_1srOrx2ZWZBpBUvZwXKQmoEYga2', $app->id);

        $this->assertInstanceOf(\DateTimeImmutable::class, $app->createdAt);
        $this->assertInstanceOf(\DateTimeImmutable::class, $app->updatedAt);
        $this->assertEquals('2025-08-27T17:43:50+00:00', $app->createdAt->format('c'));
        $this->assertEquals('2019-08-24T14:15:22+00:00', $app->updatedAt->format('c'));

        $this->assertIsArray($app->metadata);
        $this->assertEquals('string', $app->metadata['property1']);
        $this->assertEquals('string', $app->metadata['property2']);
    }

    public function testStringEnumAsQueryParam(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResBackgroundTaskOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->backgroundTask->list(new BackgroundTaskListOptions(
            status: BackgroundTaskStatus::RUNNING,
            task: BackgroundTaskType::ENDPOINT_REPLAY
        ));

        $req = $this->requestHistory[0]['request'];
        $query = $req->getUri()->getQuery();
        $this->assertEquals('status=running&task=endpoint.replay', $query);
    }

    public function testIntegerEnumAsQueryParam(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResMessageAttemptOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->messageAttempt->listByEndpoint(
            'app_id',
            'endpoint_id',
            new MessageAttemptListByEndpointOptions(
                status: MessageStatus::SUCCESS,
                statusCodeClass: StatusCodeClass::CODE2XX
            )
        );

        $req = $this->requestHistory[0]['request'];
        $query = $req->getUri()->getQuery();
        $this->assertEquals('status=0&status_code_class=200', $query);
    }

    public function testStringEnumBodySerialization(): void
    {
        $this->mockHandler->append(new Response(200, []));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);


        $connectorIn = ConnectorIn::create('test-logo', 'Test Connector', 'test-transformation')
            ->withKind(ConnectorKind::SLACK)
            ->withDescription('Test description');


        $environmentIn = EnvironmentIn::create()->withConnectors([$connectorIn]);

        $svx->environment->import($environmentIn);


        $req = $this->requestHistory[0]['request'];
        $requestBody = $req->getBody()->getContents();
        $this->assertStringContainsString('"kind":"Slack"', $requestBody);

        $this->mockHandler->append(new Response(200, [], BackgroundTaskOut));
        $backgroundTask = $svx->backgroundTask->get('qtask_1srOrx2ZWZBpBUvZwXKQmoEYga2');

        $this->assertInstanceOf(BackgroundTaskOut::class, $backgroundTask);
        $this->assertEquals(BackgroundTaskStatus::FINISHED, $backgroundTask->status);
        $this->assertEquals(BackgroundTaskType::APPLICATION_STATS, $backgroundTask->task);
    }

    public function testIntegerEnumBodySerialization(): void
    {
        // Test integer enum deserialization from response body
        $this->mockHandler->append(new Response(200, [], ListResMessageAttemptOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $attemptList = $svx->messageAttempt->listByEndpoint('app_id', 'endpoint_id');
        $messageAttempt = $attemptList->data[0];

        $this->assertInstanceOf(MessageAttemptOut::class, $messageAttempt);
        $this->assertEquals(MessageStatus::SUCCESS, $messageAttempt->status);
        $this->assertEquals(MessageAttemptTriggerType::SCHEDULED, $messageAttempt->triggerType);

        $this->mockHandler->append(new Response(200, [], MessageOut));
    }

    public function testApplicationPatch(): void
    {
        $this->mockHandler->append(new Response(200, [], AppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $applicationPatch = ApplicationPatch::create()
            ->withName('Updated Application Name')
            ->withRateLimit(null);

        $svx->application->patch('app_1srOrx2ZWZBpBUvZwXKQmoEYga2', $applicationPatch);

        $req = $this->requestHistory[0]['request'];
        $requestBody = $req->getBody()->getContents();

        $this->assertEquals('PATCH', $req->getMethod());

        $this->assertEquals('{"name":"Updated Application Name","rateLimit":null}', $requestBody);
    }

    public function testOctothorpeInUrlQuery(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResMessageOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->message->list('app_123', new MessageListOptions(
            tag: 'test#test'
        ));

        $req = $this->requestHistory[0]['request'];
        $query = $req->getUri()->getQuery();

        // Verify that # is properly URL encoded as %23
        $this->assertStringContainsString('tag=test%23test', $query);
    }

    public function testServerUrlAutoDetection(): void
    {
        $this->mockHandler->append(new Response(200, [], ListResAppOut));
        $svxUs = new \HookSniff\HookSniff("token.part.us", httpClient: $this->httpClient);
        $svxUs->application->list();
        $usRequest = $this->requestHistory[0]['request'];
        $this->assertEquals('https://api.us.hooksniff.com/api/v1/app', $usRequest->getUri()->__toString());

        $this->requestHistory = [];
        $this->mockHandler->append(new Response(200, [], ListResAppOut));
        $svxEu = new \HookSniff\HookSniff("token.part.eu", httpClient: $this->httpClient);
        $svxEu->application->list();
        $euRequest = $this->requestHistory[0]['request'];
        $this->assertEquals('https://api.eu.hooksniff.com/api/v1/app', $euRequest->getUri()->__toString());

        $this->requestHistory = [];
        $this->mockHandler->append(new Response(200, [], ListResAppOut));
        $svxDefault = new \HookSniff\HookSniff("token.part.unknown", httpClient: $this->httpClient);
        $svxDefault->application->list();
        $defaultRequest = $this->requestHistory[0]['request'];
        $this->assertEquals('https://api.hooksniff.com/api/v1/app', $defaultRequest->getUri()->__toString());

        $this->requestHistory = [];
        $this->mockHandler->append(new Response(200, [], ListResAppOut));
        $options = new \HookSniff\HookSniffOptions(serverUrl: 'https://custom.hooksniff.com');
        $svxCustom = new \HookSniff\HookSniff("token.part.us", $options, $this->httpClient);
        $svxCustom->application->list();
        $customRequest = $this->requestHistory[0]['request'];
        $this->assertEquals('https://custom.hooksniff.com/api/v1/app', $customRequest->getUri()->__toString());
    }

    public function testRetryOn500Response(): void
    {
        // Queue 3 x 500 responses to trigger retries, then a final 500 that should throw
        $this->mockHandler->append(
            new Response(500, [], '{"error": "Internal Server Error"}'),
            new Response(500, [], '{"error": "Internal Server Error"}'),
            new Response(500, [], '{"error": "Internal Server Error"}')
        );

        $svx = new \HookSniff\HookSniff("super_secret", new HookSniffOptions(debug: true),  httpClient: $this->httpClient);

        // Expect an ApiException to be thrown after all retries are exhausted
        $this->expectException(\HookSniff\Exception\ApiException::class);
        $this->expectExceptionCode(500);

        try {
            $svx->application->list();
        } catch (\HookSniff\Exception\ApiException $e) {
            // Verify that exactly 3 requests were made (1 initial + 2 retries)
            $this->assertCount(3, $this->requestHistory, 'Expected exactly 3 requests (1 initial + 2 retries)');

            // Verify all requests were to the same endpoint
            foreach ($this->requestHistory as $index => $transaction) {
                $request = $transaction['request'];
                $this->assertEquals('GET', $request->getMethod(), "Request $index should be GET");
                $this->assertStringContainsString('/api/v1/app', $request->getUri()->getPath(), "Request $index should be to /api/v1/app");
            }

            // Re-throw the exception to satisfy the expectException assertion
            throw $e;
        }
    }

    public function testEmptyAppPortalAccessInBody(): void
    {
        $this->mockHandler->append(new Response(200, [], AppPortalAccessOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $emptyAppPortalAccess = AppPortalAccessIn::create();

        $svx->authentication->appPortalAccess('app_123', $emptyAppPortalAccess);

        $req = $this->requestHistory[0]['request'];
        $rawBody = $req->getBody()->getContents();

        $this->assertEquals('{}', $rawBody);
    }

    public function testGetOrCreate(): void
    {
        $this->mockHandler->append(new Response(200, [], AppOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->application->getOrCreate(ApplicationIn::create("asd"));

        $req = $this->requestHistory[0]['request'];

        $this->assertEquals('get_if_exists=true', $req->getUri()->getQuery());
    }


    public function testMessageInRaw(): void
    {
        $this->mockHandler->append(new Response(200, [], MessageOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $svx->message->create("app_1", MessageIn::createRaw("user.signup", "<xml> not json</xml>"));

        $req = $this->requestHistory[0]['request'];
        $rawBody = $req->getBody()->getContents();

        $this->assertEquals('{"eventType":"user.signup","payload":{},"transformationsParams":{"rawPayload":"<xml> not json<\/xml>"}}', $rawBody);
    }

    public function testWithTransformationsParamsMerges(): void
    {
        $this->mockHandler->append(new Response(200, [], MessageOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $msg = MessageIn::createRaw("user.signup", "<xml> not json</xml>")
            ->withTransformationsParams(['newParam' => 'newValue', 'rawPayload' => 'overwritten']);

        $svx->message->create("app_1", $msg);

        $req = $this->requestHistory[0]['request'];
        $rawBody = $req->getBody()->getContents();

        $this->assertEquals('{"eventType":"user.signup","payload":{},"transformationsParams":{"rawPayload":"overwritten","newParam":"newValue"}}', $rawBody);
    }

    public function testWithTransformationsParamsPreservesRawPayload(): void
    {
        $this->mockHandler->append(new Response(200, [], MessageOut));

        $svx = new \HookSniff\HookSniff("super_secret", httpClient: $this->httpClient);

        $msg = MessageIn::createRaw("user.signup", "<xml> not json</xml>")
            ->withTransformationsParams([
                'headers' => ['content-type' => 'application/xml'],
            ]);

        $svx->message->create("app_1", $msg);

        $req = $this->requestHistory[0]['request'];
        $rawBody = $req->getBody()->getContents();

        $this->assertEquals('{"eventType":"user.signup","payload":{},"transformationsParams":{"rawPayload":"<xml> not json<\/xml>","headers":{"content-type":"application\/xml"}}}', $rawBody);
    }
}
