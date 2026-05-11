<?php

declare(strict_types=1);

namespace HookSniff;

use HookSniff\Pagination;

/**
 * HookSniff SDK — Main Entry Point
 *
 * Usage:
 *   $hs = new HookSniff('your-api-key');
 *
 *   // List endpoints
 *   $endpoints = $hs->endpoints->list();
 *
 *   // Send a webhook
 *   $delivery = $hs->webhooks->send([
 *       'endpoint_id' => 'ep_123',
 *       'event' => 'order.created',
 *       'data' => ['order_id' => '12345'],
 *   ]);
 *
 *   // Verify incoming webhook signature
 *   $payload = Webhook::verify('whsec_...', $rawBody, $headers);
 */
class HookSniff
{
    private const DEFAULT_BASE_URL = 'https://hooksniff-api-1046140057667.europe-west1.run.app';

    /** @var array{baseUrl: string, token: string, timeout: int, numRetries: int} */
    private array $ctx;

    public readonly Resources\Endpoints $endpoints;
    public readonly Resources\Webhooks $webhooks;
    public readonly Resources\Auth $auth;
    public readonly Resources\Analytics $analytics;
    public readonly Resources\ApiKeys $apiKeys;
    public readonly Resources\Alerts $alerts;
    public readonly Resources\Teams $teams;
    public readonly Resources\Search $search;
    public readonly Resources\Billing $billing;
    public readonly Resources\Health $health;

    /**
     * @param string $apiKey Your API key (JWT token or API key)
     * @param string $baseUrl Base URL of the HookSniff API
     * @param int $timeout Request timeout in milliseconds
     * @param int $numRetries Number of retries for 5xx errors
     */
    public function __construct(
        string $apiKey,
        string $baseUrl = self::DEFAULT_BASE_URL,
        int $timeout = 30000,
        int $numRetries = 2,
    ) {
        if (empty($apiKey)) {
            throw new \InvalidArgumentException('HookSniff: apiKey is required');
        }

        $this->ctx = [
            'baseUrl' => rtrim($baseUrl, '/'),
            'token' => $apiKey,
            'timeout' => $timeout,
            'numRetries' => $numRetries,
        ];

        $this->endpoints = new Resources\Endpoints($this->ctx);
        $this->webhooks = new Resources\Webhooks($this->ctx);
        $this->auth = new Resources\Auth($this->ctx);
        $this->analytics = new Resources\Analytics($this->ctx);
        $this->apiKeys = new Resources\ApiKeys($this->ctx);
        $this->alerts = new Resources\Alerts($this->ctx);
        $this->teams = new Resources\Teams($this->ctx);
        $this->search = new Resources\Search($this->ctx);
        $this->billing = new Resources\Billing($this->ctx);
        $this->health = new Resources\Health($this->ctx);
    }
}
