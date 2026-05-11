"""
HookSniff API Resource: Analytics
"""

from typing import Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.analytics_trend_response import AnalyticsTrendResponse
from hooksniff.models.success_rate_response import SuccessRateResponse
from hooksniff.models.latency_response import LatencyResponse


class Analytics:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def deliveries(self, since: Optional[str] = None, until: Optional[str] = None) -> AnalyticsTrendResponse:
        """Get delivery trend data."""
        req = HookSniffRequest("GET", "/v1/analytics/deliveries")
        params = {}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        if params:
            req.set_query_params(params)
        return req.send(self._ctx, parser=AnalyticsTrendResponse._from_json)

    def success_rate(self, since: Optional[str] = None, until: Optional[str] = None) -> SuccessRateResponse:
        """Get success rate metrics."""
        req = HookSniffRequest("GET", "/v1/analytics/success-rate")
        params = {}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        if params:
            req.set_query_params(params)
        return req.send(self._ctx, parser=SuccessRateResponse._from_json)

    def latency(self, since: Optional[str] = None, until: Optional[str] = None) -> LatencyResponse:
        """Get latency metrics."""
        req = HookSniffRequest("GET", "/v1/analytics/latency")
        params = {}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        if params:
            req.set_query_params(params)
        return req.send(self._ctx, parser=LatencyResponse._from_json)
