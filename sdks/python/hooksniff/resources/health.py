"""
HookSniff SDK — Health Resource
"""

import typing as t

from ..models import HealthCheck, SystemStatus
from .common import ApiBase


class HealthAsync(ApiBase):
    async def check(self) -> HealthCheck:
        """Check API health status."""
        response = await self._request_asyncio(method="get", path="/api/v1/health")
        return HealthCheck(**response.json())

    async def status(self) -> SystemStatus:
        """Get detailed system status."""
        response = await self._request_asyncio(method="get", path="/api/v1/status")
        return SystemStatus(**response.json())


class Health(ApiBase):
    def check(self) -> HealthCheck:
        """Check API health."""
        response = self._request_sync(method="get", path="/api/v1/health")
        return HealthCheck(**response.json())

    def status(self) -> SystemStatus:
        """Get system status."""
        response = self._request_sync(method="get", path="/api/v1/status")
        return SystemStatus(**response.json())
