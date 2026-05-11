"""
HookSniff API Resource: Billing
"""

from typing import Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.subscription_response import SubscriptionResponse
from hooksniff.models.billing_portal_response import BillingPortalResponse


class Billing:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def get_plan(self) -> SubscriptionResponse:
        """Get current plan info."""
        req = HookSniffRequest("GET", "/v1/billing/plan")
        return req.send(self._ctx, parser=SubscriptionResponse._from_json)

    def upgrade(self, plan: str, idempotency_key: Optional[str] = None) -> BillingPortalResponse:
        """Upgrade plan."""
        req = HookSniffRequest("POST", "/v1/billing/upgrade")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body({"plan": plan})
        return req.send(self._ctx, parser=BillingPortalResponse._from_json)

    def portal(self) -> BillingPortalResponse:
        """Open customer portal."""
        req = HookSniffRequest("POST", "/v1/billing/portal")
        return req.send(self._ctx, parser=BillingPortalResponse._from_json)
