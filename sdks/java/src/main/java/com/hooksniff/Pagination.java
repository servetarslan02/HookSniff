package com.hooksniff;

import java.util.*;
import java.util.function.BiFunction;

/**
 * Pagination utilities for HookSniff SDK.
 * Iterates through offset-based paginated endpoints.
 */
public class Pagination {
    public static final int DEFAULT_LIMIT = 50;
    public static final int MAX_PAGES = 100;

    /**
     * Collect all items from a paginated endpoint.
     *
     * @param fetchPage Function that takes (limit, offset) and returns a Map with "data" (List) and "has_more" (Boolean)
     * @param limit     Items per page
     * @return List of all items
     */
    @SuppressWarnings("unchecked")
    public static <T> List<T> collectAll(BiFunction<Integer, Integer, Map<String, Object>> fetchPage, int limit) {
        List<T> all = new ArrayList<>();
        int offset = 0;
        int pages = 0;
        while (pages < MAX_PAGES) {
            Map<String, Object> page = fetchPage.apply(limit, offset);
            List<T> data = (List<T>) page.get("data");
            boolean hasMore = Boolean.TRUE.equals(page.get("has_more"));
            if (data == null || data.isEmpty()) break;
            all.addAll(data);
            if (!hasMore) break;
            offset += data.size();
            pages++;
        }
        return all;
    }

    public static <T> List<T> collectAll(BiFunction<Integer, Integer, Map<String, Object>> fetchPage) {
        return collectAll(fetchPage, DEFAULT_LIMIT);
    }
}
