<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Exception\ApiException;
use HookSniff\Models\ListResponseMessageAttemptOut;
use HookSniff\Models\MessageAttemptOut;
use HookSniff\Request\HookSniffHttpClient;

class MessageAttempt
{
    public function __construct(
        private readonly HookSniffHttpClient $client,
    ) {
    }

    /**
     * List attempts by endpoint id.
     *
     * @throws ApiException
     */
    public function listByEndpoint(
        string $endpointId,
        ?MessageAttemptListByEndpointOptions $options = null,
    ): ListResponseMessageAttemptOut {
        $request = $this->client->newReq('GET', "/api/v1/attempt/endpoint/{$endpointId}");
        if (null !== $options) {
            $request->setQueryParam('limit', $options->limit);
            $request->setQueryParam('iterator', $options->iterator);
            $request->setQueryParam('status', $options->status);
            $request->setQueryParam('channel', $options->channel);
            $request->setQueryParam('tag', $options->tag);
            $request->setQueryParam('before', $options->before);
            $request->setQueryParam('after', $options->after);
            $request->setQueryParam('with_content', $options->withContent);
            $request->setQueryParam('event_types', $options->eventTypes);
        }
        $res = $this->client->send($request);

        return ListResponseMessageAttemptOut::fromJson($res);
    }

    /**
     * List attempts by message ID.
     *
     * @throws ApiException
     */
    public function listByMsg(
        string $msgId,
        ?MessageAttemptListByMsgOptions $options = null,
    ): ListResponseMessageAttemptOut {
        $request = $this->client->newReq('GET', "/api/v1/attempt/msg/{$msgId}");
        if (null !== $options) {
            $request->setQueryParam('limit', $options->limit);
            $request->setQueryParam('iterator', $options->iterator);
            $request->setQueryParam('status', $options->status);
            $request->setQueryParam('channel', $options->channel);
            $request->setQueryParam('tag', $options->tag);
            $request->setQueryParam('endpoint_id', $options->endpointId);
            $request->setQueryParam('before', $options->before);
            $request->setQueryParam('after', $options->after);
            $request->setQueryParam('with_content', $options->withContent);
            $request->setQueryParam('event_types', $options->eventTypes);
        }
        $res = $this->client->send($request);

        return ListResponseMessageAttemptOut::fromJson($res);
    }

    /**
     * Get a message attempt by ID.
     *
     * @throws ApiException
     */
    public function get(
        string $msgId,
        string $attemptId,
    ): MessageAttemptOut {
        $request = $this->client->newReq('GET', "/api/v1/msg/{$msgId}/attempt/{$attemptId}");
        $res = $this->client->send($request);

        return MessageAttemptOut::fromJson($res);
    }

    /**
     * Resend a message to the specified endpoint.
     *
     * @throws ApiException
     */
    public function resend(
        string $msgId,
        string $endpointId,
    ): void {
        $request = $this->client->newReq('POST', "/api/v1/msg/{$msgId}/endpoint/{$endpointId}/resend");
        $this->client->sendNoResponseBody($request);
    }
}
