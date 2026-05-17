"""
HookSniff SDK — Analytics Resource
"""

import typing as t

from ..models import (
    StatsResponse,
    TrendResponse,
    SuccessRateResponse,
    LatencyResponse,
    DeliveryTrendResponse,
    TrendPoint,
)
from .common import ApiBase


class AnalyticsAsync(ApiBase):
    async def get_stats(self, period: str = "30d") -> StatsResponse:
        """Get overall stats for the given period."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/analytics/stats",
            query_params={"period": period},
        )
        return StatsResponse(**response.json())

    async def get_trends(self, metric: str = "deliveries", period: str = "30d") -> TrendResponse:
        """Get trend data for a metric."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/analytics/trends",
            query_params={"metric": metric, "period": period},
        )
        return TrendResponse(**response.json())

    async def get_success_rate(self, period: str = "30d") -> SuccessRateResponse:
        """Get success rate overall and by endpoint."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/analytics/success-rate",
            query_params={"period": period},
        )
        return SuccessRateResponse(**response.json())

    async def get_latency(self, period: str = "30d") -> LatencyResponse:
        """Get latency trends (p50, p95, p99)."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/analytics/latency",
            query_params={"period": period},
        )
        return LatencyResponse(**response.json())

    async def get_delivery_trends(self, period: str = "30d") -> DeliveryTrendResponse:
        """Get delivery volume trends."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/analytics/delivery-trends",
            query_params={"period": period},
        )
        return DeliveryTrendResponse(**response.json())


class Analytics(ApiBase):
    def get_stats(self, period: str = "30d") -> StatsResponse:
        """Get overall stats."""
        response = self._request_sync(
            method="get",
            path="/api/v1/analytics/stats",
            query_params={"period": period},
        )
        return StatsResponse(**response.json())

    def get_trends(self, metric: str = "deliveries", period: str = "30d") -> TrendResponse:
        """Get trend data."""
        response = self._request_sync(
            method="get",
            path="/api/v1/analytics/trends",
            query_params={"metric": metric, "period": period},
        )
        return TrendResponse(**response.json())

    def get_success_rate(self, period: str = "30d") -> SuccessRateResponse:
        """Get success rate."""
        response = self._request_sync(
            method="get",
            path="/api/v1/analytics/success-rate",
            query_params={"period": period},
        )
        return SuccessRateResponse(**response.json())

    def get_latency(self, period: str = "30d") -> LatencyResponse:
        """Get latency trends."""
        response = self._request_sync(
            method="get",
            path="/api/v1/analytics/latency",
            query_params={"period": period},
        )
        return LatencyResponse(**response.json())

    def get_delivery_trends(self, period: str = "30d") -> DeliveryTrendResponse:
        """Get delivery volume trends."""
        response = self._request_sync(
            method="get",
            path="/api/v1/analytics/delivery-trends",
            query_params={"period": period},
        )
        return DeliveryTrendResponse(**response.json())
