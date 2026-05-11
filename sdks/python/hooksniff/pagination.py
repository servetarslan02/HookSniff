"""
HookSniff Pagination Utilities

Provides async-like pagination for list endpoints.
Python equivalent of Node.js pagination.ts.
"""

from typing import Any, Callable, Dict, Generator, Generic, List, Optional, TypeVar

T = TypeVar("T")


class Page(Generic[T]):
    """A single page of results."""

    def __init__(self, data: List[T], has_more: bool):
        self.data = data
        self.has_more = has_more


def paginate(
    fetch_page: Callable[[int, int], Page[T]],
    limit: int = 50,
    max_pages: int = 100,
) -> Generator[T, None, None]:
    """
    Iterate through all items using offset-based pagination.

    Args:
        fetch_page: Function that takes (limit, offset) and returns a Page.
        limit: Number of items per page (default: 50).
        max_pages: Maximum number of pages to fetch (safety limit).

    Yields:
        Individual items from all pages.

    Example:
        for endpoint in paginate(lambda l, o: client.endpoints.list(limit=l, offset=o)):
            print(endpoint)
    """
    offset = 0
    pages_fetched = 0

    while pages_fetched < max_pages:
        page = fetch_page(limit, offset)

        for item in page.data:
            yield item

        if not page.has_more:
            break

        offset += limit
        pages_fetched += 1


def collect_all(
    fetch_page: Callable[[int, int], Page[T]],
    limit: int = 50,
    max_pages: int = 100,
) -> List[T]:
    """
    Collect all items into a list.

    Args:
        fetch_page: Function that takes (limit, offset) and returns a Page.
        limit: Number of items per page (default: 50).
        max_pages: Maximum number of pages to fetch.

    Returns:
        List of all items.
    """
    return list(paginate(fetch_page, limit, max_pages))
