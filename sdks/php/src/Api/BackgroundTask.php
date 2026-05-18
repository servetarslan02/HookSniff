<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Request\HookSniffHttpClient;

class BackgroundTask
{
    private HookSniffHttpClient $client;

    public function __construct(HookSniffHttpClient $client)
    {
        $this->client = $client;
    }

    public function list(): array
    {
        return $this->client->request('GET', '/api/v1/background-tasks');
    }

    public function get(string $taskId): array
    {
        return $this->client->request('GET', "/api/v1/background-tasks/{$taskId}");
    }

    public function cancel(string $taskId): array
    {
        return $this->client->request('PUT', "/api/v1/background-tasks/{$taskId}");
    }
}
