<?php

namespace HookSniff\Api;

use HookSniff\HookSniffHttpClient;

class MessagePoller
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    /**
     * Poll for new messages since the consumer's cursor.
     */
    public function poll(string $consumerId, ?int $limit = null, ?string $endpointId = null, ?string $eventType = null, bool $includePayload = true): array
    {
        $params = ['consumer_id' => $consumerId, 'include_payload' => $includePayload];
        if ($limit !== null) $params['limit'] = $limit;
        if ($endpointId !== null) $params['endpoint_id'] = $endpointId;
        if ($eventType !== null) $params['event_type'] = $eventType;
        return $this->client->request('GET', '/api/v1/message-poller/poll', null, $params);
    }

    /**
     * Seek cursor to a specific message.
     */
    public function seek(string $consumerId, string $messageId, ?string $endpointId = null): array
    {
        $body = ['consumer_id' => $consumerId, 'message_id' => $messageId];
        if ($endpointId !== null) $body['endpoint_id'] = $endpointId;
        return $this->client->request('POST', '/api/v1/message-poller/seek', $body);
    }

    /**
     * Commit cursor — advance past a processed message.
     */
    public function commit(string $consumerId, string $messageId, ?string $endpointId = null): array
    {
        $body = ['consumer_id' => $consumerId, 'message_id' => $messageId];
        if ($endpointId !== null) $body['endpoint_id'] = $endpointId;
        return $this->client->request('POST', '/api/v1/message-poller/commit', $body);
    }
}
