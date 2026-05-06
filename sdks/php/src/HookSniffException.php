<?php

declare(strict_types=1);

namespace HookSniff;

class HookSniffException extends \RuntimeException
{
    private string $errorCode;

    public function __construct(string $message, int $statusCode = 0, string $errorCode = 'UNKNOWN')
    {
        parent::__construct($message, $statusCode);
        $this->errorCode = $errorCode;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}

class AuthenticationException extends HookSniffException
{
    public function __construct(string $message = 'Unauthorized: invalid or missing API key')
    {
        parent::__construct($message, 401, 'UNAUTHORIZED');
    }
}

class NotFoundException extends HookSniffException
{
    public function __construct(string $message = 'Resource not found')
    {
        parent::__construct($message, 404, 'NOT_FOUND');
    }
}

class RateLimitException extends HookSniffException
{
    public function __construct(string $message = 'Rate limit exceeded')
    {
        parent::__construct($message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

class ValidationException extends HookSniffException
{
    public function __construct(string $message = 'Bad request')
    {
        parent::__construct($message, 400, 'BAD_REQUEST');
    }
}

class PayloadTooLargeException extends HookSniffException
{
    public function __construct(string $message = 'Payload too large')
    {
        parent::__construct($message, 413, 'PAYLOAD_TOO_LARGE');
    }
}
