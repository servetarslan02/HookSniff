<?php

namespace HookSniff\Api;

use HookSniff\HookSniffHttpClient;

class Stream
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    public function listChannels(): array
    {
        return $this->client->request('GET', '/api/v1/stream/channels');
    }

    public function getChannel(string $id): array
    {
        return $this->client->request('GET', "/api/v1/stream/channels/{$id}");
    }

    public function createChannel(array $body): array
    {
        return $this->client->request('POST', '/api/v1/stream/channels', $body);
    }

    public function updateChannel(string $id, array $body): array
    {
        return $this->client->request('PUT', "/api/v1/stream/channels/{$id}", $body);
    }

    public function deleteChannel(string $id): void
    {
        $this->client->request('DELETE', "/api/v1/stream/channels/{$id}");
    }

    public function listMessages(string $id, array $params = []): array
    {
        return $this->client->request('GET', "/api/v1/stream/channels/{$id}/messages", null, $params);
    }

    public function listSubscriptions(): array
    {
        return $this->client->request('GET', '/api/v1/stream/subscriptions');
    }

    public function disconnectSubscription(string $id): void
    {
        $this->client->request('DELETE', "/api/v1/stream/subscriptions/{$id}");
    }

    public function publish(array $body): array
    {
        return $this->client->request('POST', '/api/v1/stream/publish', $body);
    }
}
