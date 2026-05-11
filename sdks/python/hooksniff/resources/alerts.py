"""
HookSniff API Resource: Alerts
"""

from typing import Any, List, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.alert_rule import AlertRule
from hooksniff.models.notification import Notification


class Alerts:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def list_rules(self) -> List[AlertRule]:
        """List alert rules."""
        req = HookSniffRequest("GET", "/v1/alerts/rules")
        return req.send(self._ctx, parser=lambda data: [AlertRule._from_json(item) for item in data] if isinstance(data, list) else [])

    def list_notifications(self, limit: Optional[int] = None) -> List[Notification]:
        """List alert notifications."""
        req = HookSniffRequest("GET", "/v1/alerts/notifications")
        if limit is not None:
            req.set_query_params({"limit": limit})
        return req.send(self._ctx, parser=lambda data: [Notification._from_json(item) for item in data] if isinstance(data, list) else [])
