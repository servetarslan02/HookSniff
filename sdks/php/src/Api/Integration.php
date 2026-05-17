<?php

namespace HookSniff\Api;

use HookSniff\HookSniffHttpClient;

class Integration
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    public function list(): array
    {
        return $this->client->request('GET', '/api/v1/integrations');
    }

    public function get(string $id): array
    {
        return $this->client->request('GET', "/api/v1/integrations/{$id}");
    }

    public function create(array $body): array
    {
        return $this->client->request('POST', '/api/v1/integrations', $body);
    }

    public function update(string $id, array $body): array
    {
        return $this->client->request('PUT', "/api/v1/integrations/{$id}", $body);
    }

    public function delete(string $id): void
    {
        $this->client->request('DELETE', "/api/v1/integrations/{$id}");
    }

    public function test(string $id): array
    {
        return $this->client->request('POST', "/api/v1/integrations/{$id}/test");
    }

    public function listEvents(string $id, array $params = []): array
    {
        return $this->client->request('GET', "/api/v1/integrations/{$id}/events", null, $params);
    }

    public function getStats(string $id): array
    {
        return $this->client->request('GET', "/api/v1/integrations/{$id}/stats");
    }
}
