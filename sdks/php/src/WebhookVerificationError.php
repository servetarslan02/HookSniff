<?php

declare(strict_types=1);

namespace HookSniff;

/**
 * Webhook Verification Error
 */
class WebhookVerificationError extends \RuntimeException
{
    public function __construct(string $message)
    {
        parent::__construct($message);
    }
}
