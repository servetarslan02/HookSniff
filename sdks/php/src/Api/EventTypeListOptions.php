<?php

declare(strict_types=1);

namespace HookSniff\Api;

class EventTypeListOptions
{
    public function __construct(
        public readonly ?int $limit = null,
        public readonly ?string $iterator = null,
        public readonly ?string $order = null,
        public readonly ?bool $includeArchived = null,
        public readonly ?bool $withContent = null,
    ) {
    }
}
