<?php

declare(strict_types=1);

namespace HookSniff;

use HookSniff\Models;

/**
 * Official PHP client for the HookSniff webhook delivery service.
 *
 * @example
 * ```php
 * $client = new HookSniffClient('hr_live_...');
 *
 * $endpoint = $client->endpoints()->create('https://myapp.com/webhook', 'Orders');
 *
 * $delivery = $client->webhooks()->send($endpoint['id'], 'order.created', [
 *     'orderId' => '12345',
 *     'amount' => 99.99,
 * ]);
 * ```
 */
class HookSniffClient
{
    private const DEFAULT_BASE_URL = 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';
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
    public function getStats(): Models\Stats
    {
        $resp = $this->request('GET', '/stats');
        return Models\Stats::fromArray($resp);
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
                'User-Agent: hooksniff-php/0.1.0',
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
            throw new HookSniffException("cURL error: {$error}", 0, 'NETWORK_ERROR');
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
            default => throw new HookSniffException($message, $statusCode, 'UNKNOWN'),
        };
    }
}

/**
 * Endpoints resource — CRUD operations for webhook endpoints.
 */
class EndpointsResource
{
    public function __construct(private HookSniffClient $client) {}

    /**
     * Create a new endpoint.
     */
    public function create(string $url, ?string $description = null, ?array $retryPolicy = null): Models\Endpoint
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
        return Models\Endpoint::fromArray($resp);
    }

    /**
     * Get an endpoint by ID.
     */
    public function get(string $endpointId): Models\Endpoint
    {
        $resp = $this->client->request('GET', "/endpoints/{$endpointId}");
        return Models\Endpoint::fromArray($resp);
    }

    /**
     * List all endpoints with pagination.
     *
     * @return array{endpoints: Models\Endpoint[], total: int, page: int, per_page: int}
     */
    public function list(int $page = 1, int $perPage = 20): array
    {
        $params = http_build_query(['page' => $page, 'per_page' => $perPage]);
        $resp = $this->client->request('GET', "/endpoints?{$params}");
        return [
            'endpoints' => array_map(fn($e) => Models\Endpoint::fromArray($e), $resp['endpoints'] ?? $resp),
            'total' => $resp['total'] ?? 0,
            'page' => $resp['page'] ?? $page,
            'per_page' => $resp['per_page'] ?? $perPage,
        ];
    }

    /**
     * Delete an endpoint.
     */
    public function delete(string $endpointId): bool
    {
        $resp = $this->client->request('DELETE', "/endpoints/{$endpointId}");
        return $resp['deleted'] ?? true;
    }

    /**
     * Rotate the signing secret for an endpoint.
     */
    public function rotateSecret(string $endpointId): array
    {
        return $this->client->request('POST', "/endpoints/{$endpointId}/rotate-secret");
    }
}

/**
 * Webhooks resource — send, list, replay, batch, and inspect webhooks.
 */
class WebhooksResource
{
    public function __construct(private HookSniffClient $client) {}

    /**
     * Send a webhook.
     */
    public function send(string $endpointId, ?string $event = null, array $data = []): Models\Delivery
    {
        $body = ['endpoint_id' => $endpointId, 'data' => $data];
        if ($event !== null) $body['event'] = $event;
        $resp = $this->client->request('POST', '/webhooks', $body);
        return Models\Delivery::fromArray($resp);
    }

    /**
     * Get a delivery by ID.
     */
    public function get(string $deliveryId): Models\Delivery
    {
        $resp = $this->client->request('GET', "/webhooks/{$deliveryId}");
        return Models\Delivery::fromArray($resp);
    }

    /**
     * List deliveries with optional filters.
     */
    public function list(?string $status = null, int $page = 1, int $perPage = 20): Models\DeliveryList
    {
        $params = http_build_query([
            'page' => $page,
            'per_page' => $perPage,
            'status' => $status,
        ]);
        $resp = $this->client->request('GET', "/webhooks?{$params}");
        return Models\DeliveryList::fromArray($resp);
    }

    /**
     * Replay a delivery.
     */
    public function replay(string $deliveryId): Models\Delivery
    {
        $resp = $this->client->request('POST', "/webhooks/{$deliveryId}/replay");
        return Models\Delivery::fromArray($resp);
    }

    /**
     * Send multiple webhooks in a batch.
     */
    public function batch(array $webhooks): Models\BatchResult
    {
        $body = ['webhooks' => array_map(function ($w) {
            $item = ['endpoint_id' => $w['endpoint_id'], 'data' => $w['data']];
            if (isset($w['event'])) $item['event'] = $w['event'];
            return $item;
        }, $webhooks)];

        $resp = $this->client->request('POST', '/webhooks/batch', $body);
        return Models\BatchResult::fromArray($resp);
    }

    /**
     * Get delivery attempts.
     *
     * @return Models\DeliveryAttempt[]
     */
    public function attempts(string $deliveryId): array
    {
        $resp = $this->client->request('GET', "/webhooks/{$deliveryId}/attempts");
        return array_map(fn($a) => Models\DeliveryAttempt::fromArray($a), $resp);
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
        return array_map(fn($d) => Models\Delivery::fromArray($d), $resp);
    }
}
