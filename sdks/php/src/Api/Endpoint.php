<?php

declare(strict_types=1);

namespace HookSniff\Api;

use HookSniff\Exception\ApiException;
use HookSniff\Models\EndpointHeadersIn;
use HookSniff\Models\EndpointHeadersOut;
use HookSniff\Models\EndpointHeadersPatchIn;
use HookSniff\Models\EndpointIn;
use HookSniff\Models\EndpointOut;
use HookSniff\Models\EndpointPatch;
use HookSniff\Models\EndpointSecretOut;
use HookSniff\Models\EndpointSecretRotateIn;
use HookSniff\Models\EndpointUpdate;
use HookSniff\Models\EventExampleIn;
use HookSniff\Models\ListResponseEndpointOut;
use HookSniff\Models\MessageOut;
use HookSniff\Request\HookSniffHttpClient;

class Endpoint
{
    public function __construct(
        private readonly HookSniffHttpClient $client,
    ) {
    }

    /**
     * List endpoints.
     *
     * @throws ApiException
     */
    public function list(
        ?EndpointListOptions $options = null,
    ): ListResponseEndpointOut {
        $request = $this->client->newReq('GET', '/api/v1/endpoint');
        if (null !== $options) {
            $request->setQueryParam('limit', $options->limit);
            $request->setQueryParam('iterator', $options->iterator);
            $request->setQueryParam('order', $options->order);
        }
        $res = $this->client->send($request);

        return ListResponseEndpointOut::fromJson($res);
    }

    /**
     * Create a new endpoint.
     *
     * @throws ApiException
     */
    public function create(
        EndpointIn $endpointIn,
        ?EndpointCreateOptions $options = null,
    ): EndpointOut {
        $request = $this->client->newReq('POST', '/api/v1/endpoint');
        if (null !== $options) {
            $request->setHeaderParam('idempotency-key', $options->idempotencyKey);
        }
        $request->setBody(json_encode($endpointIn));
        $res = $this->client->send($request);

        return EndpointOut::fromJson($res);
    }

    /**
     * Get an endpoint.
     *
     * @throws ApiException
     */
    public function get(
        string $endpointId,
    ): EndpointOut {
        $request = $this->client->newReq('GET', "/api/v1/endpoint/{$endpointId}");
        $res = $this->client->send($request);

        return EndpointOut::fromJson($res);
    }

    /**
     * Update an endpoint.
     *
     * @throws ApiException
     */
    public function update(
        string $endpointId,
        EndpointUpdate $endpointUpdate,
    ): EndpointOut {
        $request = $this->client->newReq('PUT', "/api/v1/endpoint/{$endpointId}");
        $request->setBody(json_encode($endpointUpdate));
        $res = $this->client->send($request);

        return EndpointOut::fromJson($res);
    }

    /**
     * Delete an endpoint.
     *
     * @throws ApiException
     */
    public function delete(
        string $endpointId,
    ): void {
        $request = $this->client->newReq('DELETE', "/api/v1/endpoint/{$endpointId}");
        $this->client->sendNoResponseBody($request);
    }

    /**
     * Partially update an endpoint.
     *
     * @throws ApiException
     */
    public function patch(
        string $endpointId,
        EndpointPatch $endpointPatch,
    ): EndpointOut {
        $request = $this->client->newReq('PATCH', "/api/v1/endpoint/{$endpointId}");
        $request->setBody(json_encode($endpointPatch));
        $res = $this->client->send($request);

        return EndpointOut::fromJson($res);
    }

    /**
     * Get the additional headers to be sent with the webhook.
     *
     * @throws ApiException
     */
    public function getHeaders(
        string $endpointId,
    ): EndpointHeadersOut {
        $request = $this->client->newReq('GET', "/api/v1/endpoint/{$endpointId}/headers");
        $res = $this->client->send($request);

        return EndpointHeadersOut::fromJson($res);
    }

    /**
     * Set the additional headers to be sent with the webhook.
     *
     * @throws ApiException
     */
    public function updateHeaders(
        string $endpointId,
        EndpointHeadersIn $endpointHeadersIn,
    ): void {
        $request = $this->client->newReq('PUT', "/api/v1/endpoint/{$endpointId}/headers");
        $request->setBody(json_encode($endpointHeadersIn));
        $this->client->sendNoResponseBody($request);
    }

    /**
     * Partially set the additional headers to be sent with the webhook.
     *
     * @throws ApiException
     */
    public function patchHeaders(
        string $endpointId,
        EndpointHeadersPatchIn $endpointHeadersPatchIn,
    ): void {
        $request = $this->client->newReq('PATCH', "/api/v1/endpoint/{$endpointId}/headers");
        $request->setBody(json_encode($endpointHeadersPatchIn));
        $this->client->sendNoResponseBody($request);
    }

    /**
     * Get the endpoint's signing secret.
     *
     * @throws ApiException
     */
    public function getSecret(
        string $endpointId,
    ): EndpointSecretOut {
        $request = $this->client->newReq('GET', "/api/v1/endpoint/{$endpointId}/secret");
        $res = $this->client->send($request);

        return EndpointSecretOut::fromJson($res);
    }

    /**
     * Rotate the endpoint's signing secret.
     *
     * The previous secret will remain valid for the next 24 hours.
     *
     * @throws ApiException
     */
    public function rotateSecret(
        string $endpointId,
        EndpointSecretRotateIn $endpointSecretRotateIn,
        ?EndpointRotateSecretOptions $options = null,
    ): void {
        $request = $this->client->newReq('POST', "/api/v1/endpoint/{$endpointId}/secret/rotate");
        if (null !== $options) {
            $request->setHeaderParam('idempotency-key', $options->idempotencyKey);
        }
        $request->setBody(json_encode($endpointSecretRotateIn));
        $this->client->sendNoResponseBody($request);
    }

    /**
     * Send an example message for an event.
     *
     * @throws ApiException
     */
    public function sendExample(
        string $endpointId,
        EventExampleIn $eventExampleIn,
    ): MessageOut {
        $request = $this->client->newReq('POST', "/api/v1/endpoint/{$endpointId}/send-example");
        $request->setBody(json_encode($eventExampleIn));
        $res = $this->client->send($request);

        return MessageOut::fromJson($res);
    }
}
