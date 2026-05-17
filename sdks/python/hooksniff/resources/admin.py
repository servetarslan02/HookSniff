"""
HookSniff SDK — Admin Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Admin:
    """Admin operations (requires admin API key)."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def list_users(
        self,
        limit: int | None = None,
        offset: int | None = None,
        search: str | None = None,
    ) -> dict[str, Any]:
        """List all users (admin)."""
        req = HookSniffRequest("GET", "/v1/admin/users")
        req.set_query_params({
            "limit": limit,
            "offset": offset,
            "search": search,
        })
        return req.send(self._config, lambda j: j)

    def get_user(self, user_id: str) -> dict[str, Any]:
        """Get user details (admin)."""
        req = HookSniffRequest("GET", "/v1/admin/users/{id}")
        req.set_path_param("id", user_id)
        return req.send(self._config, lambda j: j)

    def update_user_plan(self, user_id: str, plan: str) -> dict[str, Any]:
        """Update a user's plan (admin)."""
        req = HookSniffRequest("PUT", "/v1/admin/users/{id}/plan")
        req.set_path_param("id", user_id)
        req.set_body({"plan": plan})
        return req.send(self._config, lambda j: j)

    def update_user_status(self, user_id: str, is_active: bool) -> dict[str, Any]:
        """Activate/deactivate a user (admin)."""
        req = HookSniffRequest("PUT", "/v1/admin/users/{id}/status")
        req.set_path_param("id", user_id)
        req.set_body({"is_active": is_active})
        return req.send(self._config, lambda j: j)

    def get_stats(self) -> dict[str, Any]:
        """Get admin dashboard stats."""
        req = HookSniffRequest("GET", "/v1/admin/stats")
        return req.send(self._config, lambda j: j)

    def get_revenue(self, period: str = "30d") -> dict[str, Any]:
        """Get revenue data."""
        req = HookSniffRequest("GET", "/v1/admin/revenue")
        req.set_query_param("period", period)
        return req.send(self._config, lambda j: j)

    def get_audit_log(
        self,
        limit: int | None = None,
        offset: int | None = None,
    ) -> dict[str, Any]:
        """Get audit log entries."""
        req = HookSniffRequest("GET", "/v1/admin/audit-log")
        req.set_query_params({
            "limit": limit,
            "offset": offset,
        })
        return req.send(self._config, lambda j: j)

    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        html: bool = True,
    ) -> dict[str, Any]:
        """Send an email (admin)."""
        req = HookSniffRequest("POST", "/v1/admin/email")
        req.set_body({
            "to": to,
            "subject": subject,
            "body": body,
            "html": html,
        })
        return req.send(self._config, lambda j: j)

    def send_bulk_email(
        self,
        recipients: list[str],
        subject: str,
        body: str,
        plan_filter: str | None = None,
    ) -> dict[str, Any]:
        """Send bulk email (admin)."""
        req = HookSniffRequest("POST", "/v1/admin/email/bulk")
        body_data: dict[str, Any] = {
            "recipients": recipients,
            "subject": subject,
            "body": body,
        }
        if plan_filter:
            body_data["plan_filter"] = plan_filter
        req.set_body(body_data)
        return req.send(self._config, lambda j: j)
