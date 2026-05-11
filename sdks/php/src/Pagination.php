<?php

declare(strict_types=1);

namespace HookSniff;

/**
 * Pagination utilities for HookSniff SDK.
 */
class Pagination
{
    const DEFAULT_LIMIT = 50;
    const MAX_PAGES = 100;

    /**
     * Collect all items from a paginated endpoint.
     *
     * @param callable $fetchPage Function that takes (limit, offset) and returns ['data' => [...], 'has_more' => bool]
     * @param int $limit Items per page
     * @return array All items
     */
    public static function collectAll(callable $fetchPage, int $limit = self::DEFAULT_LIMIT): array
    {
        $all = [];
        $offset = 0;
        $pages = 0;

        while ($pages < self::MAX_PAGES) {
            $page = $fetchPage($limit, $offset);
            $data = $page['data'] ?? [];
            $hasMore = $page['has_more'] ?? false;

            if (empty($data)) break;
            $all = array_merge($all, $data);
            if (!$hasMore) break;

            $offset += count($data);
            $pages++;
        }

        return $all;
    }

    /**
     * Create a generator for lazy pagination.
     *
     * @param callable $fetchPage Function that takes (limit, offset) and returns ['data' => [...], 'has_more' => bool]
     * @param int $limit Items per page
     * @return \Generator
     */
    public static function paginate(callable $fetchPage, int $limit = self::DEFAULT_LIMIT): \Generator
    {
        $offset = 0;
        $pages = 0;

        while ($pages < self::MAX_PAGES) {
            $page = $fetchPage($limit, $offset);
            $data = $page['data'] ?? [];
            $hasMore = $page['has_more'] ?? false;

            if (empty($data)) break;
            foreach ($data as $item) {
                yield $item;
            }
            if (!$hasMore) break;

            $offset += count($data);
            $pages++;
        }
    }
}
