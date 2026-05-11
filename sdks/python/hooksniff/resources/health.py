"""
HookSniff API Resource: Health
"""

from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.stats_response import StatsResponse


class Health:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def check(self) -> StatsResponse:
        """Check API health."""
        req = HookSniffRequest("GET", "/health")
        return req.send(self._ctx, parser=StatsResponse._from_json)
