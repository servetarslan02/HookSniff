"""
HookSniff SDK — Admin Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import (
    CustomerResponse,
    AdminAuditLogResponse,
    AdminRevenueResponse,
    SystemStatus,
)
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class AdminListOptions(BaseOptions):
    limit: t.Optional[int] = None
    offset: t.Optional[int] = None
    search: t.Optional[str] = None

    def _query_params(self) -> t.Dict[str, str]:
        return serialize_params({
            "limit": self.limit,
            "offset": self.offset,
            "search": self.search,
        })


class AdminAsync(ApiBase):
    async def list_users(
        self, options: AdminListOptions = AdminListOptions()
    ) -> t.Dict[str, t.Any]:
        """List all users (admin)."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/admin/users",
            query_params=options._query_params(),
        )
        return response.json()

    async def get_user(self, user_id: str) -> CustomerResponse:
        """Get user details (admin)."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/admin/users/{user_id}",
            path_params={"user_id": user_id},
        )
        return CustomerResponse(**response.json())

    async def update_user_plan(self, user_id: str, plan: str) -> CustomerResponse:
        """Update a user's plan (admin)."""
        response = await self._request_asyncio(
            method="put",
            path="/api/v1/admin/users/{user_id}/plan",
            path_params={"user_id": user_id},
            json_body={"plan": plan},
        )
        return CustomerResponse(**response.json())

    async def update_user_status(self, user_id: str, is_active: bool) -> CustomerResponse:
        """Activate/deactivate a user (admin)."""
        response = await self._request_asyncio(
            method="put",
            path="/api/v1/admin/users/{user_id}/status",
            path_params={"user_id": user_id},
            json_body={"is_active": is_active},
        )
        return CustomerResponse(**response.json())

    async def get_stats(self) -> SystemStatus:
        """Get admin dashboard stats."""
        response = await self._request_asyncio(method="get", path="/api/v1/admin/stats")
        return SystemStatus(**response.json())

    async def get_revenue(self, period: str = "30d") -> AdminRevenueResponse:
        """Get revenue data."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/admin/revenue",
            query_params={"period": period},
        )
        return AdminRevenueResponse(**response.json())

    async def get_audit_log(
        self, options: AdminListOptions = AdminListOptions()
    ) -> AdminAuditLogResponse:
        """Get audit log entries."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/admin/audit-log",
            query_params=options._query_params(),
        )
        return AdminAuditLogResponse(**response.json())

    async def send_email(
        self, to: str, subject: str, body: str, html: bool = True
    ) -> None:
        """Send an email (admin)."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/admin/email",
            json_body={"to": to, "subject": subject, "body": body, "html": html},
        )

    async def send_bulk_email(
        self,
        recipients: t.List[str],
        subject: str,
        body: str,
        plan_filter: t.Optional[str] = None,
    ) -> None:
        """Send bulk email (admin)."""
        payload: t.Dict[str, t.Any] = {
            "recipients": recipients,
            "subject": subject,
            "body": body,
        }
        if plan_filter:
            payload["plan_filter"] = plan_filter
        await self._request_asyncio(
            method="post",
            path="/api/v1/admin/email/bulk",
            json_body=payload,
        )


class Admin(ApiBase):
    def list_users(self, options: AdminListOptions = AdminListOptions()) -> t.Dict[str, t.Any]:
        """List all users."""
        response = self._request_sync(
            method="get",
            path="/api/v1/admin/users",
            query_params=options._query_params(),
        )
        return response.json()

    def get_user(self, user_id: str) -> CustomerResponse:
        """Get user details."""
        response = self._request_sync(
            method="get",
            path="/api/v1/admin/users/{user_id}",
            path_params={"user_id": user_id},
        )
        return CustomerResponse(**response.json())

    def update_user_plan(self, user_id: str, plan: str) -> CustomerResponse:
        """Update user plan."""
        response = self._request_sync(
            method="put",
            path="/api/v1/admin/users/{user_id}/plan",
            path_params={"user_id": user_id},
            json_body={"plan": plan},
        )
        return CustomerResponse(**response.json())

    def update_user_status(self, user_id: str, is_active: bool) -> CustomerResponse:
        """Activate/deactivate user."""
        response = self._request_sync(
            method="put",
            path="/api/v1/admin/users/{user_id}/status",
            path_params={"user_id": user_id},
            json_body={"is_active": is_active},
        )
        return CustomerResponse(**response.json())

    def get_stats(self) -> SystemStatus:
        """Get admin stats."""
        response = self._request_sync(method="get", path="/api/v1/admin/stats")
        return SystemStatus(**response.json())

    def get_revenue(self, period: str = "30d") -> AdminRevenueResponse:
        """Get revenue data."""
        response = self._request_sync(
            method="get",
            path="/api/v1/admin/revenue",
            query_params={"period": period},
        )
        return AdminRevenueResponse(**response.json())

    def get_audit_log(self, options: AdminListOptions = AdminListOptions()) -> AdminAuditLogResponse:
        """Get audit log."""
        response = self._request_sync(
            method="get",
            path="/api/v1/admin/audit-log",
            query_params=options._query_params(),
        )
        return AdminAuditLogResponse(**response.json())

    def send_email(self, to: str, subject: str, body: str, html: bool = True) -> None:
        """Send an email."""
        self._request_sync(
            method="post",
            path="/api/v1/admin/email",
            json_body={"to": to, "subject": subject, "body": body, "html": html},
        )

    def send_bulk_email(
        self,
        recipients: t.List[str],
        subject: str,
        body: str,
        plan_filter: t.Optional[str] = None,
    ) -> None:
        """Send bulk email."""
        payload: t.Dict[str, t.Any] = {
            "recipients": recipients,
            "subject": subject,
            "body": body,
        }
        if plan_filter:
            payload["plan_filter"] = plan_filter
        self._request_sync(
            method="post",
            path="/api/v1/admin/email/bulk",
            json_body=payload,
        )
