"""
HookSniff API Resource: Billing
"""

from typing import Any, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Billing:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def get_plan(self) -> Any:
        """Get current plan info."""
        req = HookSniffRequest("GET", "/v1/billing/plan")
        return req.send(self._ctx)

    def upgrade(self, plan: str, idempotency_key: Optional[str] = None) -> Any:
        """Upgrade plan."""
        req = HookSniffRequest("POST", "/v1/billing/upgrade")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body({"plan": plan})
        return req.send(self._ctx)

    def portal(self) -> Any:
        """Open customer portal."""
        req = HookSniffRequest("POST", "/v1/billing/portal")
        return req.send(self._ctx)
