<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Exception\ApiException;
use HookSniff\Request\HookSniffHttpClient;

class Authentication
{
    public function __construct(
        private readonly HookSniffHttpClient $client,
    ) {
    }

    /**
     * Logout the current auth token.
     *
     * @throws ApiException
     */
    public function logout(): void
    {
        $request = $this->client->newReq('POST', '/api/v1/auth/logout');
        $this->client->sendNoResponseBody($request);
    }
}
