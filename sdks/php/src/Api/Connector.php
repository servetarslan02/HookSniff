<?php

namespace HookSniff\Api;

use HookSniff\HookSniffHttpClient;

class Connector
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    public function list(): array
    {
        return $this->client->request('GET', '/api/v1/connectors');
    }

    public function get(string $id): array
    {
        return $this->client->request('GET', "/api/v1/connectors/{$id}");
    }

    public function listConfigs(): array
    {
        return $this->client->request('GET', '/api/v1/connectors/configs');
    }

    public function createConfig(array $body): array
    {
        return $this->client->request('POST', '/api/v1/connectors/configs', $body);
    }

    public function updateConfig(string $id, array $body): array
    {
        return $this->client->request('PUT', "/api/v1/connectors/configs/{$id}", $body);
    }

    public function deleteConfig(string $id): void
    {
        $this->client->request('DELETE', "/api/v1/connectors/configs/{$id}");
    }
}
