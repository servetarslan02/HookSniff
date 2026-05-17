"""
HookSniff SDK — Analytics Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Analytics:
    """Analytics & stats."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def get_stats(self, period: str = "30d") -> dict[str, Any]:
        """Get overall stats for the given period."""
        req = HookSniffRequest("GET", "/v1/analytics/stats")
        req.set_query_param("period", period)
        return req.send(self._config, lambda j: j)

    def get_trends(
        self,
        metric: str = "deliveries",
        period: str = "30d",
    ) -> dict[str, Any]:
        """Get trend data for a metric."""
        req = HookSniffRequest("GET", "/v1/analytics/trends")
        req.set_query_params({"metric": metric, "period": period})
        return req.send(self._config, lambda j: j)

    def get_success_rate(self, period: str = "30d") -> dict[str, Any]:
        """Get success rate overall and by endpoint."""
        req = HookSniffRequest("GET", "/v1/analytics/success-rate")
        req.set_query_param("period", period)
        return req.send(self._config, lambda j: j)

    def get_latency(self, period: str = "30d") -> dict[str, Any]:
        """Get latency trends (p50, p95, p99)."""
        req = HookSniffRequest("GET", "/v1/analytics/latency")
        req.set_query_param("period", period)
        return req.send(self._config, lambda j: j)

    def get_delivery_trends(self, period: str = "30d") -> dict[str, Any]:
        """Get delivery volume trends."""
        req = HookSniffRequest("GET", "/v1/analytics/delivery-trends")
        req.set_query_param("period", period)
        return req.send(self._config, lambda j: j)
