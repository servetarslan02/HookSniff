"""
HookSniff SDK — Health Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Health:
    """API health check."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def check(self) -> dict[str, Any]:
        """Check API health status."""
        req = HookSniffRequest("GET", "/v1/health")
        return req.send(self._config, lambda j: j)

    def status(self) -> dict[str, Any]:
        """Get detailed system status."""
        req = HookSniffRequest("GET", "/v1/status")
        return req.send(self._config, lambda j: j)
