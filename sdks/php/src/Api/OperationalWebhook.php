<?php
declare(strict_types=1);
namespace HookSniff\Api;
use HookSniff\Request\HookSniffHttpClient;

class OperationalWebhook {
    private HookSniffHttpClient $client;
    public function __construct(HookSniffHttpClient $client) { $this->client = $client; }
    public function list(): array { return $this->client->request('GET', '/api/v1/operational-webhooks'); }
    public function create(array $body): array { return $this->client->request('POST', '/api/v1/operational-webhooks', $body); }
    public function get(string $id): array { return $this->client->request('GET', "/api/v1/operational-webhooks/{$id}"); }
    public function update(string $id, array $body): array { return $this->client->request('PUT', "/api/v1/operational-webhooks/{$id}", $body); }
    public function delete(string $id): void { $this->client->request('DELETE', "/api/v1/operational-webhooks/{$id}"); }
    public function listDeliveries(string $id): array { return $this->client->request('GET', "/api/v1/operational-webhooks/{$id}/deliveries"); }
}
