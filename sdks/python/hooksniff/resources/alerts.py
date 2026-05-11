"""
HookSniff API Resource: Alerts
"""

from typing import Any, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Alerts:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def list_rules(self) -> Any:
        """List alert rules."""
        req = HookSniffRequest("GET", "/v1/alerts/rules")
        return req.send(self._ctx)

    def list_notifications(self, limit: Optional[int] = None) -> Any:
        """List alert notifications."""
        req = HookSniffRequest("GET", "/v1/alerts/notifications")
        if limit is not None:
            req.set_query_params({"limit": limit})
        return req.send(self._ctx)
