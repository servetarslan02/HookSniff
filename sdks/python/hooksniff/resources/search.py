"""
HookSniff API Resource: Search
"""

from typing import Any, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Search:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def query(self, q: str, limit: Optional[int] = None) -> Any:
        """Search webhook deliveries."""
        req = HookSniffRequest("GET", "/v1/search")
        params = {"q": q}
        if limit is not None:
            params["limit"] = limit
        req.set_query_params(params)
        return req.send(self._ctx)
