"""
HookSniff SDK — Billing Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import (
    SubscriptionOut,
    UpgradeRequest,
    UpgradeResponse,
    UsageOut,
    InvoiceOut,
    BillingPortalResponse,
)
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class BillingUpgradeOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params({"idempotency-key": self.idempotency_key})


class BillingAsync(ApiBase):
    async def get_subscription(self) -> SubscriptionOut:
        """Get current subscription details."""
        response = await self._request_asyncio(method="get", path="/api/v1/billing/subscription")
        return SubscriptionOut(**response.json())

    async def upgrade(
        self, upgrade_in: UpgradeRequest, options: BillingUpgradeOptions = BillingUpgradeOptions()
    ) -> UpgradeResponse:
        """Upgrade to a paid plan."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/billing/upgrade",
            header_params=options._header_params(),
            json_body=upgrade_in.__dict__,
        )
        return UpgradeResponse(**response.json())

    async def get_usage(self) -> UsageOut:
        """Get current billing period usage."""
        response = await self._request_asyncio(method="get", path="/api/v1/billing/usage")
        return UsageOut(**response.json())

    async def list_invoices(self) -> t.List[InvoiceOut]:
        """List all invoices."""
        response = await self._request_asyncio(method="get", path="/api/v1/billing/invoices")
        return [InvoiceOut(**item) for item in response.json()]

    async def open_portal(self) -> BillingPortalResponse:
        """Open billing portal."""
        response = await self._request_asyncio(method="post", path="/api/v1/billing/portal")
        return BillingPortalResponse(**response.json())

    async def cancel(self) -> SubscriptionOut:
        """Cancel subscription at period end."""
        response = await self._request_asyncio(method="post", path="/api/v1/billing/cancel")
        return SubscriptionOut(**response.json())

    async def resume(self) -> SubscriptionOut:
        """Resume cancelled subscription."""
        response = await self._request_asyncio(method="post", path="/api/v1/billing/resume")
        return SubscriptionOut(**response.json())


class Billing(ApiBase):
    def get_subscription(self) -> SubscriptionOut:
        """Get current subscription."""
        response = self._request_sync(method="get", path="/api/v1/billing/subscription")
        return SubscriptionOut(**response.json())

    def upgrade(
        self, upgrade_in: UpgradeRequest, options: BillingUpgradeOptions = BillingUpgradeOptions()
    ) -> UpgradeResponse:
        """Upgrade to a paid plan."""
        response = self._request_sync(
            method="post",
            path="/api/v1/billing/upgrade",
            header_params=options._header_params(),
            json_body=upgrade_in.__dict__,
        )
        return UpgradeResponse(**response.json())

    def get_usage(self) -> UsageOut:
        """Get usage."""
        response = self._request_sync(method="get", path="/api/v1/billing/usage")
        return UsageOut(**response.json())

    def list_invoices(self) -> t.List[InvoiceOut]:
        """List invoices."""
        response = self._request_sync(method="get", path="/api/v1/billing/invoices")
        return [InvoiceOut(**item) for item in response.json()]

    def open_portal(self) -> BillingPortalResponse:
        """Open billing portal."""
        response = self._request_sync(method="post", path="/api/v1/billing/portal")
        return BillingPortalResponse(**response.json())

    def cancel(self) -> SubscriptionOut:
        """Cancel subscription."""
        response = self._request_sync(method="post", path="/api/v1/billing/cancel")
        return SubscriptionOut(**response.json())

    def resume(self) -> SubscriptionOut:
        """Resume subscription."""
        response = self._request_sync(method="post", path="/api/v1/billing/resume")
        return SubscriptionOut(**response.json())
