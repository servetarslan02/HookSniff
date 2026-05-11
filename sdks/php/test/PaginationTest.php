<?php

declare(strict_types=1);

namespace HookSniff\Test;

use HookSniff\Pagination;
use PHPUnit\Framework\TestCase;

class PaginationTest extends TestCase
{
    // Test 1: collectAll with single page
    public function testCollectAllSinglePage(): void
    {
        $items = ['a', 'b', 'c'];
        $fetchPage = function (int $limit, int $offset) use ($items): array {
            return ['data' => $items, 'has_more' => false];
        };

        $result = Pagination::collectAll($fetchPage);
        $this->assertSame($items, $result);
    }

    // Test 2: collectAll with multiple pages
    public function testCollectAllMultiplePages(): void
    {
        $pages = [
            ['data' => [1, 2], 'has_more' => true],
            ['data' => [3, 4], 'has_more' => true],
            ['data' => [5], 'has_more' => false],
        ];
        $callCount = 0;
        $fetchPage = function (int $limit, int $offset) use (&$pages, &$callCount): array {
            return $pages[$callCount++];
        };

        $result = Pagination::collectAll($fetchPage, 2);
        $this->assertSame([1, 2, 3, 4, 5], $result);
    }

    // Test 3: collectAll with empty result
    public function testCollectAllEmptyResult(): void
    {
        $fetchPage = function (int $limit, int $offset): array {
            return ['data' => [], 'has_more' => false];
        };

        $result = Pagination::collectAll($fetchPage);
        $this->assertSame([], $result);
    }

    // Test 4: collectAll respects limit parameter
    public function testCollectAllPassesLimit(): void
    {
        $receivedLimits = [];
        $fetchPage = function (int $limit, int $offset) use (&$receivedLimits): array {
            $receivedLimits[] = $limit;
            return ['data' => [1], 'has_more' => false];
        };

        Pagination::collectAll($fetchPage, 25);
        $this->assertSame([25], $receivedLimits);
    }

    // Test 5: collectAll tracks offset correctly
    public function testCollectAllTracksOffset(): void
    {
        $receivedOffsets = [];
        $pages = [
            ['data' => [1, 2], 'has_more' => true],
            ['data' => [3, 4], 'has_more' => true],
            ['data' => [5], 'has_more' => false],
        ];
        $callCount = 0;
        $fetchPage = function (int $limit, int $offset) use (&$pages, &$callCount, &$receivedOffsets): array {
            $receivedOffsets[] = $offset;
            return $pages[$callCount++];
        };

        Pagination::collectAll($fetchPage, 2);
        $this->assertSame([0, 2, 4], $receivedOffsets);
    }

    // Test 6: paginate generator yields items
    public function testPaginateGeneratorYieldsItems(): void
    {
        $pages = [
            ['data' => ['a', 'b'], 'has_more' => true],
            ['data' => ['c'], 'has_more' => false],
        ];
        $callCount = 0;
        $fetchPage = function (int $limit, int $offset) use (&$pages, &$callCount): array {
            return $pages[$callCount++];
        };

        $items = iterator_to_array(Pagination::paginate($fetchPage, 2));
        $this->assertSame(['a', 'b', 'c'], $items);
    }

    // Test 7: paginate generator handles empty pages
    public function testPaginateGeneratorHandlesEmpty(): void
    {
        $fetchPage = function (int $limit, int $offset): array {
            return ['data' => [], 'has_more' => false];
        };

        $items = iterator_to_array(Pagination::paginate($fetchPage));
        $this->assertSame([], $items);
    }

    // Test 8: collectAll with has_more true but empty data stops
    public function testCollectAllStopsOnEmptyDataEvenWithHasMore(): void
    {
        $fetchPage = function (int $limit, int $offset): array {
            return ['data' => [], 'has_more' => true];
        };

        $result = Pagination::collectAll($fetchPage);
        $this->assertSame([], $result);
    }

    // Test 9: Default limit is 50
    public function testDefaultLimitIs50(): void
    {
        $this->assertSame(50, Pagination::DEFAULT_LIMIT);
    }

    // Test 10: Max pages is 100
    public function testMaxPagesIs100(): void
    {
        $this->assertSame(100, Pagination::MAX_PAGES);
    }

    // Test 11: collectAll stops at max pages
    public function testCollectAllStopsAtMaxPages(): void
    {
        $pageCount = 0;
        $fetchPage = function (int $limit, int $offset) use (&$pageCount): array {
            $pageCount++;
            return ['data' => [$pageCount], 'has_more' => true];
        };

        $result = Pagination::collectAll($fetchPage, 1);
        $this->assertCount(100, $result);
        $this->assertSame(100, $pageCount);
    }

    // Test 12: collectAll with missing has_more defaults to false
    public function testCollectAllMissingHasMoreDefaultsFalse(): void
    {
        $callCount = 0;
        $fetchPage = function (int $limit, int $offset) use (&$callCount): array {
            $callCount++;
            // Return array without has_more key
            return ['data' => [$callCount]];
        };

        $result = Pagination::collectAll($fetchPage);
        $this->assertSame([1], $result);
        $this->assertSame(1, $callCount);
    }
}
