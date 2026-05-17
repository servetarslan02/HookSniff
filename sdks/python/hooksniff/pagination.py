"""
HookSniff SDK — Auto-pagination

Provides automatic pagination over list endpoints.

Usage:
    for ep in hs.endpoints.list_all():
        print(ep["url"])
"""

from __future__ import annotations

from typing import Any, Callable, Generator, Generic, Optional, TypeVar

T = TypeVar("T")


class Page(Generic[T]):
    """Represents a single page of results."""

    def __init__(self, data: list[T], iterator: str | None = None, done: bool = False):
        self.data = data
        self.iterator = iterator
        self.done = done


def paginate(
    fetch_page: Callable[..., dict[str, Any]],
    limit: int | None = None,
    iterator: str | None = None,
) -> Generator[dict[str, Any], None, None]:
    """
    Auto-paginate through all items from a list endpoint.

    Args:
        fetch_page: Function that fetches a single page
        limit: Items per page
        iterator: Starting iterator

    Yields:
        Individual items from all pages
    """
    current_iterator = iterator
    done = False

    while not done:
        params: dict[str, Any] = {}
        if limit is not None:
            params["limit"] = limit
        if current_iterator is not None:
            params["iterator"] = current_iterator

        response = fetch_page(**params)
        data = response.get("data", [])

        for item in data:
            yield item

        if response.get("done") is True or not response.get("iterator") or not data:
            done = True
        else:
            current_iterator = response["iterator"]


def collect_all(
    fetch_page: Callable[..., dict[str, Any]],
    limit: int | None = None,
) -> list[dict[str, Any]]:
    """
    Collect all items from a paginated endpoint into a list.

    Args:
        fetch_page: Function that fetches a single page
        limit: Items per page

    Returns:
        List of all items
    """
    return list(paginate(fetch_page, limit=limit))
