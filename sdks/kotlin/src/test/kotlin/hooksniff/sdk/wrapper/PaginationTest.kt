package hooksniff.sdk.wrapper

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class PaginationTest {

    // ──────────────────────────────────────────────
    // collectAll — single page
    // ──────────────────────────────────────────────
    @Test
    fun `single page returns all items`() {
        val items = listOf("a", "b", "c")
        val result = Pagination.collectAll<String>(limit = 10) { _, _ ->
            Pair(items, false) // hasMore = false
        }
        assertEquals(items, result)
    }

    @Test
    fun `single page with default limit`() {
        // Verify the default limit constant is used when none specified
        var capturedLimit = 0
        Pagination.collectAll<String> { limit, _ ->
            capturedLimit = limit
            Pair(listOf("x"), false)
        }
        assertEquals(Pagination.DEFAULT_LIMIT, capturedLimit)
    }

    // ──────────────────────────────────────────────
    // collectAll — multi page
    // ──────────────────────────────────────────────
    @Test
    fun `multi page collects all items across pages`() {
        val page1 = listOf("a", "b")
        val page2 = listOf("c", "d")
        val page3 = listOf("e")
        var callCount = 0

        val result = Pagination.collectAll<String>(limit = 2) { _, offset ->
            callCount++
            when (offset) {
                0 -> Pair(page1, true)
                2 -> Pair(page2, true)
                4 -> Pair(page3, false)
                else -> Pair(emptyList(), false)
            }
        }
        assertEquals(listOf("a", "b", "c", "d", "e"), result)
        assertEquals(3, callCount)
    }

    @Test
    fun `multi page passes correct offset to fetch`() {
        val offsets = mutableListOf<Int>()

        Pagination.collectAll<String>(limit = 5) { _, offset ->
            offsets.add(offset)
            when (offset) {
                0 -> Pair(listOf("a", "b", "c", "d", "e"), true)
                5 -> Pair(listOf("f"), false)
                else -> Pair(emptyList(), false)
            }
        }
        assertEquals(listOf(0, 5), offsets)
    }

    // ──────────────────────────────────────────────
    // collectAll — empty page
    // ──────────────────────────────────────────────
    @Test
    fun `empty first page returns empty list`() {
        val result = Pagination.collectAll<String>(limit = 10) { _, _ ->
            Pair(emptyList(), true) // hasMore=true but empty data → should break
        }
        assertTrue(result.isEmpty())
    }

    @Test
    fun `empty result when fetch returns empty immediately`() {
        var callCount = 0
        val result = Pagination.collectAll<Int>(limit = 5) { _, _ ->
            callCount++
            Pair(emptyList(), false)
        }
        assertTrue(result.isEmpty())
        assertEquals(1, callCount) // called once, then broke on empty
    }

    // ──────────────────────────────────────────────
    // collectAll — max pages limit
    // ──────────────────────────────────────────────
    @Test
    fun `stops at MAX_PAGES limit`() {
        var callCount = 0
        val result = Pagination.collectAll<Int>(limit = 1) { _, _ ->
            callCount++
            Pair(listOf(callCount), true) // always hasMore
        }
        assertEquals(Pagination.MAX_PAGES, callCount)
        assertEquals(Pagination.MAX_PAGES, result.size)
    }

    @Test
    fun `MAX_PAGES constant is 100`() {
        assertEquals(100, Pagination.MAX_PAGES)
    }

    @Test
    fun `DEFAULT_LIMIT constant is 50`() {
        assertEquals(50, Pagination.DEFAULT_LIMIT)
    }

    // ──────────────────────────────────────────────
    // collectAll — edge cases
    // ──────────────────────────────────────────────
    @Test
    fun `passes limit parameter to fetch function`() {
        var capturedLimit = 0
        Pagination.collectAll<String>(limit = 25) { limit, _ ->
            capturedLimit = limit
            Pair(listOf("a"), false)
        }
        assertEquals(25, capturedLimit)
    }

    @Test
    fun `works with different types`() {
        // Int type
        val ints = Pagination.collectAll<Int>(limit = 3) { _, _ ->
            Pair(listOf(1, 2, 3), false)
        }
        assertEquals(listOf(1, 2, 3), ints)

        // Custom data class
        data class Item(val id: Int, val name: String)
        val items = Pagination.collectAll<Item>(limit = 2) { _, _ ->
            Pair(listOf(Item(1, "a"), Item(2, "b")), false)
        }
        assertEquals(2, items.size)
        assertEquals("a", items[0].name)
    }

    @Test
    fun `last page with hasMore true but empty data stops`() {
        var callCount = 0
        val result = Pagination.collectAll<String>(limit = 2) { _, offset ->
            callCount++
            when (offset) {
                0 -> Pair(listOf("a", "b"), true)
                2 -> Pair(emptyList(), true) // hasMore but empty → break
                else -> Pair(emptyList(), false)
            }
        }
        assertEquals(listOf("a", "b"), result)
        assertEquals(2, callCount)
    }
}
