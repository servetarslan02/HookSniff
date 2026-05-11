<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Billing
 */
class Billing
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * Get current plan info.
     *
     * @return array{plan: string, webhooks_remaining: int, webhooks_used: int, endpoints_remaining: int, current_period_end: string}
     * @throws \HookSniff\ApiException
     */
    public function getPlan(): array
    {
        $req = new Request('GET', '/v1/billing/plan');
        return $req->send($this->ctx);
    }

    /**
     * Upgrade plan.
     *
     * @return array{url: string}
     * @throws \HookSniff\ApiException
     */
    public function upgrade(string $plan, ?string $idempotencyKey = null): array
    {
        $req = new Request('POST', '/v1/billing/upgrade');
        if ($idempotencyKey !== null) {
            $req->setHeaderParam('idempotency-key', $idempotencyKey);
        }
        $req->setBody(['plan' => $plan]);
        return $req->send($this->ctx);
    }

    /**
     * Open customer portal.
     *
     * @return array{url: string}
     * @throws \HookSniff\ApiException
     */
    public function portal(): array
    {
        $req = new Request('POST', '/v1/billing/portal');
        return $req->send($this->ctx);
    }
}
