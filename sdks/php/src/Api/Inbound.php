<?php

namespace HookSniff\Api;

use HookSniff\HookSniffHttpClient;

class Inbound
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    public function listConfigs(): array
    {
        return $this->client->request('GET', '/api/v1/inbound/configs');
    }

    public function createConfig(array $body): array
    {
        return $this->client->request('POST', '/api/v1/inbound/configs', $body);
    }

    public function updateConfig(string $id, array $body): array
    {
        return $this->client->request('PUT', "/api/v1/inbound/configs/{$id}", $body);
    }

    public function deleteConfig(string $id): void
    {
        $this->client->request('DELETE', "/api/v1/inbound/configs/{$id}");
    }
}
