"""
HookSniff API Resource: Analytics
"""

from typing import Any, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Analytics:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def deliveries(self, since: Optional[str] = None, until: Optional[str] = None) -> Any:
        """Get delivery trend data."""
        req = HookSniffRequest("GET", "/v1/analytics/deliveries")
        params = {}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        if params:
            req.set_query_params(params)
        return req.send(self._ctx)

    def success_rate(self, since: Optional[str] = None, until: Optional[str] = None) -> Any:
        """Get success rate metrics."""
        req = HookSniffRequest("GET", "/v1/analytics/success-rate")
        params = {}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        if params:
            req.set_query_params(params)
        return req.send(self._ctx)

    def latency(self, since: Optional[str] = None, until: Optional[str] = None) -> Any:
        """Get latency metrics."""
        req = HookSniffRequest("GET", "/v1/analytics/latency")
        params = {}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        if params:
            req.set_query_params(params)
        return req.send(self._ctx)
