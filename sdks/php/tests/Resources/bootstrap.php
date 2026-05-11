<?php

declare(strict_types=1);

/**
 * PHPUnit bootstrap for resource tests.
 *
 * Registers a mock HookSniff\Request class BEFORE the Composer autoloader
 * loads the real one. This lets resource tests intercept HTTP calls without
 * modifying production code.
 */

// Load the capture helper first (its own namespace, no conflict).
require_once __DIR__ . '/RequestCapture.php';

// Define the mock Request in the real namespace. Because this file is
// included before Composer's autoloader, PHP will use this definition
// when any code does `new HookSniff\Request(...)`.
namespace HookSniff;

class Request
{
    private string $method;
    private string $path;
    /** @var array<string, string> */
    private array $queryParams = [];
    /** @var array<string, string> */
    private array $headerParams = [];
    private ?string $body = null;

    /** @var mixed Next value to return from send() */
    private static mixed $nextResponse = null;

    /** @var list<mixed> Queue of responses for sequential send() calls */
    private static array $responseQueue = [];

    public function __construct(string $method, string $path)
    {
        $this->method = $method;
        $this->path = $path;
    }

    public function setPathParam(string $name, string $value): void
    {
        $this->path = str_replace('{' . $name . '}', $value, $this->path);
    }

    /**
     * @param array<string, string|int|bool|null> $params
     */
    public function setQueryParams(array $params): void
    {
        foreach ($params as $k => $v) {
            if ($v !== null) {
                $this->queryParams[$k] = (string) $v;
            }
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
     */
    public function send(array $ctx)
    {
        \HookSniff\Test\Resources\RequestCapture::recordSend(
            $this->method,
            $this->path,
            $this->queryParams,
            $this->body,
            $this->headerParams,
        );

        // Return from queue first, then fall back to static value
        if (!empty(self::$responseQueue)) {
            return array_shift(self::$responseQueue);
        }
        return self::$nextResponse ?? ['data' => [], 'has_more' => false];
    }

    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function sendVoid(array $ctx): void
    {
        \HookSniff\Test\Resources\RequestCapture::recordVoid(
            $this->method,
            $this->path,
            $this->queryParams,
            $this->body,
            $this->headerParams,
        );
    }

    /** Set the response that the next send() call will return. */
    public static function setNextResponse(mixed $response): void
    {
        self::$nextResponse = $response;
    }

    /**
     * Set a queue of responses for sequential send() calls.
     * Each call to send() pops the next response from the queue.
     * When the queue is empty, falls back to $nextResponse.
     *
     * @param list<mixed> $responses
     */
    public static function setResponseQueue(array $responses): void
    {
        self::$responseQueue = $responses;
    }
}

// ── Switch back to global namespace for the Composer autoloader ──
namespace;

// Now load Composer autoloader. Classes already defined above (Request)
// won't be overridden; everything else loads normally.
require_once __DIR__ . '/../../vendor/autoload.php';
