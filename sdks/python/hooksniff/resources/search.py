"""
HookSniff SDK — Search Resource
"""

import typing as t

from ..models import SearchResult
from .common import ApiBase


class SearchAsync(ApiBase):
    async def search(
        self,
        query: str,
        type: t.Optional[str] = None,
        limit: t.Optional[int] = None,
    ) -> t.List[SearchResult]:
        """Search endpoints, deliveries, teams, etc."""
        params: t.Dict[str, t.Any] = {"q": query}
        if type:
            params["type"] = type
        if limit:
            params["limit"] = limit
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/search",
            query_params={k: str(v) for k, v in params.items()},
        )
        return [SearchResult(**item) for item in response.json()]


class Search(ApiBase):
    def search(
        self,
        query: str,
        type: t.Optional[str] = None,
        limit: t.Optional[int] = None,
    ) -> t.List[SearchResult]:
        """Search endpoints, deliveries, teams, etc."""
        params: t.Dict[str, t.Any] = {"q": query}
        if type:
            params["type"] = type
        if limit:
            params["limit"] = limit
        response = self._request_sync(
            method="get",
            path="/api/v1/search",
            query_params={k: str(v) for k, v in params.items()},
        )
        return [SearchResult(**item) for item in response.json()]
