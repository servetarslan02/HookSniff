"""
HookSniff API Resource: Search
"""

from typing import List, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.search_result import SearchResult


class Search:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def query(self, q: str, limit: Optional[int] = None) -> List[SearchResult]:
        """Search webhook deliveries."""
        req = HookSniffRequest("GET", "/v1/search")
        params = {"q": q}
        if limit is not None:
            params["limit"] = limit
        req.set_query_params(params)
        return req.send(self._ctx, parser=lambda data: [SearchResult._from_json(item) for item in data] if isinstance(data, list) else [])
