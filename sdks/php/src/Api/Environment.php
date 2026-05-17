<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Request\HookSniffHttpClient;

class Environment
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    public function list(): array
    {
        return $this->client->request('GET', '/api/v1/environments');
    }

    public function create(array $environmentIn): array
    {
        return $this->client->request('POST', '/api/v1/environments', $environmentIn);
    }

    public function get(string $environmentId): array
    {
        return $this->client->request('GET', "/api/v1/environments/{$environmentId}");
    }

    public function update(string $environmentId, array $environmentPatch): array
    {
        return $this->client->request('PUT', "/api/v1/environments/{$environmentId}", $environmentPatch);
    }

    public function delete(string $environmentId): void
    {
        $this->client->request('DELETE', "/api/v1/environments/{$environmentId}");
    }

    public function listVariables(string $environmentId): array
    {
        return $this->client->request('GET', "/api/v1/environments/{$environmentId}/variables");
    }

    public function getVariable(string $environmentId, string $variableId): array
    {
        return $this->client->request('GET', "/api/v1/environments/{$environmentId}/variables/{$variableId}");
    }

    public function createVariable(string $environmentId, array $variableIn): array
    {
        return $this->client->request('POST', "/api/v1/environments/{$environmentId}/variables", $variableIn);
    }

    public function updateVariable(string $environmentId, string $variableId, array $variableIn): array
    {
        return $this->client->request('PUT', "/api/v1/environments/{$environmentId}/variables/{$variableId}", $variableIn);
    }

    public function deleteVariable(string $environmentId, string $variableId): void
    {
        $this->client->request('DELETE', "/api/v1/environments/{$environmentId}/variables/{$variableId}");
    }

    public function bulkUpsertVariables(string $environmentId, array $bulkIn): array
    {
        return $this->client->request('POST', "/api/v1/environments/{$environmentId}/variables/bulk", $bulkIn);
    }
}
