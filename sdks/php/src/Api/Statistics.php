<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Exception\ApiException;
use HookSniff\Request\HookSniffHttpClient;

class Statistics
{
    public function __construct(
        private readonly HookSniffHttpClient $client,
    ) {
    }

    /**
     * Get basic statistics for the app.
     *
     * @throws ApiException
     */
    public function aggregateAppStats(): array
    {
        $request = $this->client->newReq('GET', '/api/v1/stats/usage/app');
        $res = $this->client->send($request);

        return json_decode($res, true);
    }
}
