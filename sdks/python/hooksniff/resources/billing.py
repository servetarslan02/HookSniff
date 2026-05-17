"""
HookSniff SDK — Billing Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Billing:
    """Billing & subscription management."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def get_subscription(self) -> dict[str, Any]:
        """Get current subscription details."""
        req = HookSniffRequest("GET", "/v1/billing/subscription")
        return req.send(self._config, lambda j: j)

    def upgrade(self, plan: str, payment_method: str | None = None) -> dict[str, Any]:
        """Upgrade to a paid plan."""
        req = HookSniffRequest("POST", "/v1/billing/upgrade")
        body: dict[str, Any] = {"plan": plan}
        if payment_method:
            body["payment_method"] = payment_method
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def get_usage(self) -> dict[str, Any]:
        """Get current billing period usage."""
        req = HookSniffRequest("GET", "/v1/billing/usage")
        return req.send(self._config, lambda j: j)

    def list_invoices(self) -> list[dict[str, Any]]:
        """List all invoices."""
        req = HookSniffRequest("GET", "/v1/billing/invoices")
        return req.send(self._config, lambda j: j)

    def open_portal(self) -> dict[str, Any]:
        """Open billing portal (Stripe/Polar)."""
        req = HookSniffRequest("POST", "/v1/billing/portal")
        return req.send(self._config, lambda j: j)

    def cancel(self) -> dict[str, Any]:
        """Cancel subscription at period end."""
        req = HookSniffRequest("POST", "/v1/billing/cancel")
        return req.send(self._config, lambda j: j)

    def resume(self) -> dict[str, Any]:
        """Resume cancelled subscription."""
        req = HookSniffRequest("POST", "/v1/billing/resume")
        return req.send(self._config, lambda j: j)
