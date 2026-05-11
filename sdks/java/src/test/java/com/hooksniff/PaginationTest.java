package com.hooksniff;

import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for Pagination utility — single page, multi page, empty, max pages, default limit.
 */
public class PaginationTest {

    // ─── Helpers ────────────────────────────────────────────────────────

    /** Build a page response map */
    private static Map<String, Object> page(List<?> data, boolean hasMore) {
        Map<String, Object> m = new HashMap<>();
        m.put("data", data);
        m.put("has_more", hasMore);
        return m;
    }

    // ─── Single page ────────────────────────────────────────────────────

    @Test
    void collectAllSinglePage() {
        List<String> items = List.of("a", "b", "c");
        List<String> result = Pagination.collectAll(
                (limit, offset) -> page(items, false), 10);
        assertEquals(3, result.size());
        assertEquals(List.of("a", "b", "c"), result);
    }

    // ─── Multi page ────────────────────────────────────────────────────

    @Test
    void collectAllMultiplePages() {
        // 3 pages of 2 items each
        List<List<String>> pages = List.of(
                List.of("a", "b"),
                List.of("c", "d"),
                List.of("e")  // last page, has_more = false
        );
        int[] callCount = {0};

        List<String> result = Pagination.collectAll((limit, offset) -> {
            int idx = callCount[0]++;
            if (idx < 2) return page(pages.get(idx), true);
            return page(pages.get(idx), false);
        }, 2);

        assertEquals(5, result.size());
        assertEquals("a", result.get(0));
        assertEquals("e", result.get(4));
        assertEquals(3, callCount[0]);
    }

    // ─── Empty page (no data at all) ───────────────────────────────────

    @Test
    void collectAllEmptyFirstPage() {
        int[] callCount = {0};
        List<String> result = Pagination.collectAll((limit, offset) -> {
            callCount[0]++;
            return page(Collections.emptyList(), false);
        }, 10);

        assertTrue(result.isEmpty());
        assertEquals(1, callCount[0]); // only one call needed
    }

    @Test
    void collectAllNullDataPage() {
        int[] callCount = {0};
        List<String> result = Pagination.collectAll((limit, offset) -> {
            callCount[0]++;
            Map<String, Object> m = new HashMap<>();
            m.put("data", null);
            m.put("has_more", true);
            return m;
        }, 10);

        assertTrue(result.isEmpty());
        assertEquals(1, callCount[0]);
    }

    // ─── Max pages limit ───────────────────────────────────────────────

    @Test
    void collectAllStopsAtMaxPages() {
        int[] callCount = {0};
        List<String> result = Pagination.collectAll((limit, offset) -> {
            callCount[0]++;
            // Always return 1 item with has_more = true — should stop at MAX_PAGES
            return page(List.of("item-" + callCount[0]), true);
        }, 1);

        assertEquals(Pagination.MAX_PAGES, result.size());
        assertEquals(Pagination.MAX_PAGES, callCount[0]);
        assertEquals("item-1", result.get(0));
        assertEquals("item-" + Pagination.MAX_PAGES, result.get(Pagination.MAX_PAGES - 1));
    }

    // ─── Default limit ─────────────────────────────────────────────────

    @Test
    void collectAllDefaultLimitUsesDefaultLimit() {
        int[] capturedLimit = {-1};
        List<String> result = Pagination.collectAll((limit, offset) -> {
            capturedLimit[0] = limit;
            return page(List.of("x"), false);
        });

        assertEquals(Pagination.DEFAULT_LIMIT, capturedLimit[0]);
        assertEquals(1, result.size());
    }

    @Test
    void defaultLimitIs50() {
        assertEquals(50, Pagination.DEFAULT_LIMIT);
    }

    @Test
    void maxPagesIs100() {
        assertEquals(100, Pagination.MAX_PAGES);
    }

    // ─── Offset tracking ───────────────────────────────────────────────

    @Test
    void collectAllTracksOffsetCorrectly() {
        List<Integer> offsets = new ArrayList<>();
        int[] callIdx = {0};
        List<List<String>> pages = List.of(
                List.of("a", "b", "c"),
                List.of("d", "e")
        );

        Pagination.collectAll((limit, offset) -> {
            offsets.add(offset);
            int idx = callIdx[0]++;
            return page(pages.get(idx), idx == 0);
        }, 3);

        assertEquals(0, offsets.get(0));
        assertEquals(3, offsets.get(1)); // offset = previous page size
    }

    // ─── Type generic works with maps ──────────────────────────────────

    @Test
    void collectAllWorksWithMapType() {
        Map<String, Object> item1 = Map.of("id", "ep-1", "url", "https://a.example.com");
        Map<String, Object> item2 = Map.of("id", "ep-2", "url", "https://b.example.com");

        List<Map<String, Object>> result = Pagination.collectAll((limit, offset) ->
                page(List.of(item1, item2), false), 10);

        assertEquals(2, result.size());
        assertEquals("ep-1", result.get(0).get("id"));
        assertEquals("ep-2", result.get(1).get("id"));
    }
}
