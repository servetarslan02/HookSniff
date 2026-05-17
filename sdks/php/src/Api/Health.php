<?php

// this file is @generated
declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Exception\ApiException;
use HookSniff\Request\HookSniffHttpClient;

class Health
{
    public function __construct(
        private readonly HookSniffHttpClient $client,
    ) {
    }

    /**
     * Verify the API server is up and running.
     *
     * @throws ApiException
     */
    public function get(
    ): void {
        $request = $this->client->newReq('GET', '/api/v1/health');
        $res = $this->client->sendNoResponseBody($request);
    }
}
