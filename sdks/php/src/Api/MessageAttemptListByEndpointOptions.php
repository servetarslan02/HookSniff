<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Models\MessageStatus;

class MessageAttemptListByEndpointOptions
{
    public function __construct(
        public readonly ?int $limit = null,
        public readonly ?string $iterator = null,
        public readonly ?MessageStatus $status = null,
        public readonly ?string $statusCodeClass = null,
        public readonly ?string $channel = null,
        public readonly ?string $tag = null,
        public readonly ?\DateTimeImmutable $before = null,
        public readonly ?\DateTimeImmutable $after = null,
        public readonly ?bool $withContent = null,
        public readonly ?bool $withMsg = null,
        public readonly ?bool $expandedStatuses = null,
        public readonly ?array $eventTypes = null,
    ) {
    }
}
