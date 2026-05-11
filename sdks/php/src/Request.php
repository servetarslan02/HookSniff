<?php

declare(strict_types=1);

namespace HookSniff;

/**
 * HookSniff HTTP Request Helper
 *
 * Zero-dependency HTTP client using cURL.
 * Handles auth, retries, error mapping, and idempotency keys.
 */
class Request
{
    private const LIB_VERSION = '0.4.0';
    private const USER_AGENT = 'hooksniff-sdk/' . self::LIB_VERSION . '/php';

    /** @var array<string, mixed> */
    private array $queryParams = [];
    /** @var array<string, string> */
    private array $headerParams = [];
    private ?string $body = null;

    public function __construct(
        private readonly string $method,
        private string $path,
    ) {}

    public function setPathParam(string $name, string $value): void
    {
        $this->path = str_replace('{' . $name . '}', urlencode($value), $this->path);
    }

    /**
     * @param array<string, string|int|bool|null> $params
     */
    public function setQueryParams(array $params): void
    {
        foreach ($params as $name => $value) {
            if ($value === null) continue;
            $this->queryParams[$name] = (string) $value;
        }
    }

    public function setHeaderParam(string $name, ?string $value): void
    {
        if ($value !== null) {
            $this->headerParams[$name] = $value;
        }
    }

    /**
     * @param array<string, mixed> $value
     */
    public function setBody(array $value): void
    {
        $this->body = json_encode($value, JSON_THROW_ON_ERROR);
    }

    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     * @return mixed
     * @throws ApiException
     */
    public function send(array $ctx)
    {
        $response = $this->sendWithRetry($ctx);
        $statusCode = $response['status'];
        $body = $response['body'];

        if ($statusCode === 204) {
            return null;
        }

        return json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     * @throws ApiException
     */
    public function sendVoid(array $ctx): void
    {
        $this->sendWithRetry($ctx);
    }

    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     * @return array{status: int, body: string, headers: array<string, string>}
     * @throws ApiException
     */
    private function sendWithRetry(array $ctx): array
    {
        $url = $ctx['baseUrl'] . $this->path;
        if (!empty($this->queryParams)) {
            $url .= '?' . http_build_query($this->queryParams);
        }

        // Auto idempotency key for POST
        if (!isset($this->headerParams['idempotency-key']) && $this->method === 'POST') {
            $this->headerParams['idempotency-key'] = 'auto_' . bin2hex(random_bytes(16));
        }

        $maxRetries = $ctx['numRetries'] ?? 2;
        $lastException = null;

        for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
            try {
                $ch = curl_init();
                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => (int) (($ctx['timeout'] ?? 30000) / 1000),
                    CURLOPT_CONNECTTIMEOUT => 10,
                    CURLOPT_CUSTOMREQUEST => $this->method,
                    CURLOPT_HTTPHEADER => $this->buildHeaders($ctx['token']),
                    CURLOPT_HEADERFUNCTION => function ($ch, $header) use (&$responseHeaders) {
                        $len = strlen($header);
                        $parts = explode(':', $header, 2);
                        if (count($parts) === 2) {
                            $responseHeaders[trim($parts[0])] = trim($parts[1]);
                        }
                        return $len;
                    },
                ]);

                if ($this->body !== null) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $this->body);
                }

                $responseHeaders = [];
                $body = curl_exec($ch);
                $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $error = curl_error($ch);
                curl_close($ch);

                if ($body === false) {
                    throw new ApiException(0, $error ?: 'cURL error', []);
                }

                // Don't retry on 4xx
                if ($statusCode < 500) {
                    if ($statusCode >= 400) {
                        $parsed = json_decode($body, true);
                        throw new ApiException($statusCode, $parsed ?? $body, $responseHeaders);
                    }
                    return ['status' => $statusCode, 'body' => $body, 'headers' => $responseHeaders];
                }

                // 5xx — will retry
                $lastException = new ApiException($statusCode, $body, $responseHeaders);
            } catch (ApiException $e) {
                if ($e->getCode() < 500) {
                    throw $e;
                }
                $lastException = $e;
            } catch (\Throwable $e) {
                $lastException = new ApiException(0, $e->getMessage(), []);
            }

            // Exponential backoff
            if ($attempt < $maxRetries) {
                usleep((int) (50000 * pow(2, $attempt))); // 50ms, 100ms, 200ms
            }
        }

        throw $lastException ?? new ApiException(0, 'Request failed after retries', []);
    }

    /**
     * @return string[]
     */
    private function buildHeaders(string $token): array
    {
        $headers = [
            'accept: application/json',
            'authorization: Bearer ' . $token,
            'user-agent: ' . self::USER_AGENT,
        ];

        if ($this->body !== null) {
            $headers[] = 'content-type: application/json';
        }

        foreach ($this->headerParams as $name => $value) {
            $headers[] = $name . ': ' . $value;
        }

        return $headers;
    }
}
