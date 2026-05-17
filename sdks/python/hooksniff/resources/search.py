"""
HookSniff SDK — Search Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Search:
    """Search across all resources."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def search(
        self,
        query: str,
        type: str | None = None,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        """Search endpoints, deliveries, teams, etc."""
        req = HookSniffRequest("GET", "/v1/search")
        req.set_query_params({
            "q": query,
            "type": type,
            "limit": limit,
        })
        return req.send(self._config, lambda j: j)
