<?php

declare(strict_types=1);

namespace HookRelay;

/**
 * Official PHP client for the HookRelay webhook delivery service.
 *
 * @example
 * ```php
 * $client = new HookRelayClient('hr_live_...');
 *
 * $endpoint = $client->endpoints()->create('https://myapp.com/webhook', 'Orders');
 *
 * $delivery = $client->webhooks()->send($endpoint['id'], 'order.created', [
 *     'orderId' => '12345',
 *     'amount' => 99.99,
 * ]);
 * ```
 */
class HookRelayClient
{
    private const DEFAULT_BASE_URL = 'http://localhost:3000/v1';
    private const DEFAULT_TIMEOUT = 30;

    private string $apiKey;
    private string $baseUrl;
    private int $timeout;

    private EndpointsResource $endpoints;
    private WebhooksResource $webhooks;

    public function __construct(string $apiKey, ?string $baseUrl = null, int $timeout = 0)
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl ?? self::DEFAULT_BASE_URL, '/');
        $this->timeout = $timeout > 0 ? $timeout : self::DEFAULT_TIMEOUT;
        $this->endpoints = new EndpointsResource($this);
        $this->webhooks = new WebhooksResource($this);
    }

    public function endpoints(): EndpointsResource
    {
        return $this->endpoints;
    }

    public function webhooks(): WebhooksResource
    {
        return $this->webhooks;
    }

    /**
     * Get platform statistics.
     */
    public function getStats(): array
    {
        $resp = $this->request('GET', '/stats');
        return [
            'total_deliveries' => $resp['total_deliveries'],
            'delivered' => $resp['delivered'],
            'failed' => $resp['failed'],
            'pending' => $resp['pending'],
            'success_rate' => $resp['success_rate'],
            'endpoints_count' => $resp['endpoints_count'],
        ];
    }

    /**
     * @internal Make an API request.
     */
    public function request(string $method, string $path, ?array $body = null): mixed
    {
        $url = $this->baseUrl . $path;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => $this->timeout,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'User-Agent: hookrelay-php/0.1.0',
            ],
        ]);

        if ($body !== null && in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new HookRelayException("cURL error: {$error}", 0, 'NETWORK_ERROR');
        }

        if ($statusCode >= 200 && $statusCode < 300) {
            if (str_contains($contentType ?? '', 'text/csv')) {
                return $response;
            }
            return json_decode($response, true);
        }

        $message = "HTTP {$statusCode}";
        $decoded = json_decode($response, true);
        if ($decoded && isset($decoded['error']['message'])) {
            $message = $decoded['error']['message'];
        }

        return match ($statusCode) {
            400 => throw new ValidationException($message),
            401 => throw new AuthenticationException($message),
            404 => throw new NotFoundException($message),
            413 => throw new PayloadTooLargeException($message),
            429 => throw new RateLimitException($message),
            default => throw new HookRelayException($message, $statusCode, 'UNKNOWN'),
        };
    }
}

/**
 * Endpoints resource — CRUD operations for webhook endpoints.
 */
class EndpointsResource
{
    public function __construct(private HookRelayClient $client) {}

    /**
     * Create a new endpoint.
     */
    public function create(string $url, ?string $description = null, ?array $retryPolicy = null): array
    {
        $body = ['url' => $url];
        if ($description !== null) $body['description'] = $description;
        if ($retryPolicy !== null) {
            $rp = [];
            if (isset($retryPolicy['max_attempts'])) $rp['max_attempts'] = $retryPolicy['max_attempts'];
            if (isset($retryPolicy['backoff'])) $rp['backoff'] = $retryPolicy['backoff'];
            if (isset($retryPolicy['initial_delay_secs'])) $rp['initial_delay_secs'] = $retryPolicy['initial_delay_secs'];
            if (isset($retryPolicy['max_delay_secs'])) $rp['max_delay_secs'] = $retryPolicy['max_delay_secs'];
            $body['retry_policy'] = $rp;
        }

        $resp = $this->client->request('POST', '/endpoints', $body);
        return $this->mapEndpoint($resp);
    }

    /**
     * Get an endpoint by ID.
     */
    public function get(string $endpointId): array
    {
        $resp = $this->client->request('GET', "/endpoints/{$endpointId}");
        return $this->mapEndpoint($resp);
    }

    /**
     * List all endpoints.
     */
    public function list(): array
    {
        $resp = $this->client->request('GET', '/endpoints');
        return array_map([$this, 'mapEndpoint'], $resp);
    }

    /**
     * Delete an endpoint.
     */
    public function delete(string $endpointId): bool
    {
        $resp = $this->client->request('DELETE', "/endpoints/{$endpointId}");
        return $resp['deleted'] ?? true;
    }

    private function mapEndpoint(array $data): array
    {
        $rp = $data['retry_policy'] ?? null;
        return [
            'id' => $data['id'],
            'url' => $data['url'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? false,
            'retry_policy' => $rp ? [
                'max_attempts' => $rp['max_attempts'] ?? null,
                'backoff' => $rp['backoff'] ?? null,
                'initial_delay_secs' => $rp['initial_delay_secs'] ?? null,
                'max_delay_secs' => $rp['max_delay_secs'] ?? null,
            ] : null,
            'created_at' => $data['created_at'] ?? null,
        ];
    }
}

/**
 * Webhooks resource — send, list, replay, batch, and inspect webhooks.
 */
class WebhooksResource
{
    public function __construct(private HookRelayClient $client) {}

    /**
     * Send a webhook.
     */
    public function send(string $endpointId, array $data, ?string $event = null): array
    {
        $body = ['endpoint_id' => $endpointId, 'data' => $data];
        if ($event !== null) $body['event'] = $event;
        $resp = $this->client->request('POST', '/webhooks', $body);
        return $this->mapDelivery($resp);
    }

    /**
     * Get a delivery by ID.
     */
    public function get(string $deliveryId): array
    {
        $resp = $this->client->request('GET', "/webhooks/{$deliveryId}");
        return $this->mapDelivery($resp);
    }

    /**
     * List deliveries with optional filters.
     */
    public function list(?string $status = null, int $page = 1, int $perPage = 20): array
    {
        $params = http_build_query([
            'page' => $page,
            'per_page' => $perPage,
            'status' => $status,
        ]);
        $resp = $this->client->request('GET', "/webhooks?{$params}");
        return [
            'deliveries' => array_map([$this, 'mapDelivery'], $resp['deliveries'] ?? []),
            'total' => $resp['total'] ?? 0,
            'page' => $resp['page'] ?? $page,
            'per_page' => $resp['per_page'] ?? $perPage,
        ];
    }

    /**
     * Replay a delivery.
     */
    public function replay(string $deliveryId): array
    {
        $resp = $this->client->request('POST', "/webhooks/{$deliveryId}/replay");
        return $this->mapDelivery($resp);
    }

    /**
     * Send multiple webhooks in a batch.
     */
    public function batch(array $webhooks): array
    {
        $body = ['webhooks' => array_map(function ($w) {
            $item = ['endpoint_id' => $w['endpoint_id'], 'data' => $w['data']];
            if (isset($w['event'])) $item['event'] = $w['event'];
            return $item;
        }, $webhooks)];

        $resp = $this->client->request('POST', '/webhooks/batch', $body);
        return [
            'deliveries' => array_map([$this, 'mapDelivery'], $resp['deliveries'] ?? []),
            'errors' => $resp['errors'] ?? [],
        ];
    }

    /**
     * Get delivery attempts.
     */
    public function attempts(string $deliveryId): array
    {
        $resp = $this->client->request('GET', "/webhooks/{$deliveryId}/attempts");
        return array_map([$this, 'mapAttempt'], $resp);
    }

    /**
     * Export deliveries.
     */
    public function export(?string $format = null, ?string $status = null,
                           ?string $dateFrom = null, ?string $dateTo = null): mixed
    {
        $params = array_filter([
            'format' => $format,
            'status' => $status,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ], fn($v) => $v !== null);
        $query = http_build_query($params);
        $resp = $this->client->request('GET', "/webhooks/export?{$query}");

        if ($format === 'csv') return $resp;
        return array_map([$this, 'mapDelivery'], $resp);
    }

    private function mapDelivery(array $data): array
    {
        return [
            'id' => $data['id'],
            'endpoint_id' => $data['endpoint_id'] ?? null,
            'event' => $data['event'] ?? null,
            'status' => $data['status'] ?? null,
            'attempt_count' => $data['attempt_count'] ?? 0,
            'response_status' => $data['response_status'] ?? null,
            'replay_count' => $data['replay_count'] ?? 0,
            'created_at' => $data['created_at'] ?? null,
        ];
    }

    private function mapAttempt(array $data): array
    {
        return [
            'id' => $data['id'],
            'attempt_number' => $data['attempt_number'] ?? 0,
            'status_code' => $data['status_code'] ?? null,
            'response_body' => $data['response_body'] ?? null,
            'duration_ms' => $data['duration_ms'] ?? null,
            'error_message' => $data['error_message'] ?? null,
            'created_at' => $data['created_at'] ?? null,
        ];
    }
}
