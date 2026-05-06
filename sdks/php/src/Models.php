<?php

declare(strict_types=1);

namespace HookSniff\Models;

class Endpoint
{
    public function __construct(
        public readonly string $id,
        public readonly string $url,
        public readonly ?string $description,
        public readonly bool $isActive,
        public readonly ?RetryPolicy $retryPolicy,
        public readonly ?string $createdAt,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            url: $data['url'],
            description: $data['description'] ?? null,
            isActive: $data['is_active'] ?? false,
            retryPolicy: isset($data['retry_policy']) ? RetryPolicy::fromArray($data['retry_policy']) : null,
            createdAt: $data['created_at'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'description' => $this->description,
            'is_active' => $this->isActive,
            'retry_policy' => $this->retryPolicy?->toArray(),
            'created_at' => $this->createdAt,
        ];
    }
}

class RetryPolicy
{
    public function __construct(
        public readonly ?int $maxAttempts,
        public readonly ?string $backoff,
        public readonly ?int $initialDelaySecs,
        public readonly ?int $maxDelaySecs,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            maxAttempts: $data['max_attempts'] ?? null,
            backoff: $data['backoff'] ?? null,
            initialDelaySecs: $data['initial_delay_secs'] ?? null,
            maxDelaySecs: $data['max_delay_secs'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'max_attempts' => $this->maxAttempts,
            'backoff' => $this->backoff,
            'initial_delay_secs' => $this->initialDelaySecs,
            'max_delay_secs' => $this->maxDelaySecs,
        ], fn($v) => $v !== null);
    }
}

class Delivery
{
    public function __construct(
        public readonly string $id,
        public readonly ?string $endpointId,
        public readonly ?string $event,
        public readonly ?string $status,
        public readonly int $attemptCount,
        public readonly ?int $responseStatus,
        public readonly int $replayCount,
        public readonly ?string $createdAt,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            endpointId: $data['endpoint_id'] ?? null,
            event: $data['event'] ?? null,
            status: $data['status'] ?? null,
            attemptCount: $data['attempt_count'] ?? 0,
            responseStatus: $data['response_status'] ?? null,
            replayCount: $data['replay_count'] ?? 0,
            createdAt: $data['created_at'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'endpoint_id' => $this->endpointId,
            'event' => $this->event,
            'status' => $this->status,
            'attempt_count' => $this->attemptCount,
            'response_status' => $this->responseStatus,
            'replay_count' => $this->replayCount,
            'created_at' => $this->createdAt,
        ];
    }
}

class DeliveryAttempt
{
    public function __construct(
        public readonly string $id,
        public readonly int $attemptNumber,
        public readonly ?int $statusCode,
        public readonly ?string $responseBody,
        public readonly ?int $durationMs,
        public readonly ?string $errorMessage,
        public readonly ?string $createdAt,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            attemptNumber: $data['attempt_number'] ?? 0,
            statusCode: $data['status_code'] ?? null,
            responseBody: $data['response_body'] ?? null,
            durationMs: $data['duration_ms'] ?? null,
            errorMessage: $data['error_message'] ?? null,
            createdAt: $data['created_at'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'attempt_number' => $this->attemptNumber,
            'status_code' => $this->statusCode,
            'response_body' => $this->responseBody,
            'duration_ms' => $this->durationMs,
            'error_message' => $this->errorMessage,
            'created_at' => $this->createdAt,
        ];
    }
}

class DeliveryList
{
    public function __construct(
        public readonly array $deliveries,
        public readonly int $total,
        public readonly int $page,
        public readonly int $perPage,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            deliveries: array_map(fn($d) => Delivery::fromArray($d), $data['deliveries'] ?? []),
            total: $data['total'] ?? 0,
            page: $data['page'] ?? 1,
            perPage: $data['per_page'] ?? 20,
        );
    }
}

class BatchResult
{
    public function __construct(
        public readonly array $deliveries,
        public readonly array $errors,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            deliveries: array_map(fn($d) => Delivery::fromArray($d), $data['deliveries'] ?? []),
            errors: $data['errors'] ?? [],
        );
    }
}

class Stats
{
    public function __construct(
        public readonly int $totalDeliveries,
        public readonly int $delivered,
        public readonly int $failed,
        public readonly int $pending,
        public readonly float $successRate,
        public readonly int $endpointsCount,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            totalDeliveries: $data['total_deliveries'] ?? 0,
            delivered: $data['delivered'] ?? 0,
            failed: $data['failed'] ?? 0,
            pending: $data['pending'] ?? 0,
            successRate: $data['success_rate'] ?? 0.0,
            endpointsCount: $data['endpoints_count'] ?? 0,
        );
    }
}
