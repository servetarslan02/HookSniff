package hooksniff.sdk.wrapper

/**
 * Pagination utilities for HookSniff SDK.
 */
object Pagination {
    const val DEFAULT_LIMIT = 50
    const val MAX_PAGES = 100

    /**
     * Collect all pages of results by repeatedly calling [fetchPage].
     *
     * @param limit   Page size passed to [fetchPage].
     * @param fetchPage Function that returns a page of results and a flag
     *                  indicating whether more pages exist.
     * @return All collected items across all pages.
     */
    fun <T> collectAll(
        limit: Int = DEFAULT_LIMIT,
        fetchPage: (limit: Int, offset: Int) -> Pair<List<T>, Boolean>
    ): List<T> {
        val all = mutableListOf<T>()
        var offset = 0
        var pages = 0
        while (pages < MAX_PAGES) {
            val (data, hasMore) = fetchPage(limit, offset)
            if (data.isEmpty()) break
            all.addAll(data)
            if (!hasMore) break
            offset += data.size
            pages++
        }
        return all
    }
}
