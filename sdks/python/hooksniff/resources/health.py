"""
HookSniff API Resource: Health
"""

from typing import Any
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Health:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def check(self) -> Any:
        """Check API health."""
        req = HookSniffRequest("GET", "/health")
        return req.send(self._ctx)
