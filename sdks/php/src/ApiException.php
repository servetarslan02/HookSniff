<?php

declare(strict_types=1);

namespace HookSniff;

/**
 * HookSniff API Exception
 */
class ApiException extends \RuntimeException
{
    /** @var array<string, string> */
    public array $headers;

    /**
     * @param mixed $body
     * @param array<string, string> $headers
     */
    public function __construct(
        public readonly int $code,
        public readonly mixed $body,
        array $headers = [],
    ) {
        $message = sprintf('HookSniff API Error %d: %s', $code, is_string($body) ? $body : json_encode($body));
        parent::__construct($message, $code);
        $this->headers = $headers;
    }
}
