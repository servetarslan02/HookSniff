<?php

declare(strict_types=1);

namespace HookSniff\Test\Resources;

/**
 * Test helper that captures Request method calls.
 *
 * Used by the mock Request class (defined in bootstrap) to record
 * what the resource methods actually do.
 */
class RequestCapture
{
    /** @var array<int, array{method: string, path: string, queryParams: array, body: ?string, headers: array}> */
    private static array $calls = [];

    /** @var array<int, array{method: string}> */
    private static array $voidCalls = [];

    public static function reset(): void
    {
        self::$calls = [];
        self::$voidCalls = [];
    }

    /**
     * Record a send() call.
     * @param array<string, string> $queryParams
     * @param array<string, string> $headers
     */
    public static function recordSend(string $method, string $path, array $queryParams, ?string $body, array $headers): void
    {
        self::$calls[] = [
            'method' => $method,
            'path' => $path,
            'queryParams' => $queryParams,
            'body' => $body,
            'headers' => $headers,
        ];
    }

    /**
     * Record a sendVoid() call.
     */
    public static function recordVoid(string $method, string $path, array $queryParams, ?string $body, array $headers): void
    {
        self::$voidCalls[] = [
            'method' => $method,
            'path' => $path,
            'queryParams' => $queryParams,
            'body' => $body,
            'headers' => $headers,
        ];
    }

    /** @return array<int, array{method: string, path: string, queryParams: array, body: ?string, headers: array}> */
    public static function getCalls(): array
    {
        return self::$calls;
    }

    /** @return array<int, array{method: string, path: string, queryParams: array, body: ?string, headers: array}> */
    public static function getVoidCalls(): array
    {
        return self::$voidCalls;
    }

    /** Get the first recorded send() call. */
    public static function firstCall(): ?array
    {
        return self::$calls[0] ?? null;
    }

    /** Get the first recorded sendVoid() call. */
    public static function firstVoidCall(): ?array
    {
        return self::$voidCalls[0] ?? null;
    }

    /** Total calls (send + sendVoid). */
    public static function totalCalls(): int
    {
        return count(self::$calls) + count(self::$voidCalls);
    }
}
