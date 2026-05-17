"""
HookSniff SDK — Notifications Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Notifications:
    """Notifications & push devices."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def list(self, limit: int | None = None, unread_only: bool = False) -> dict[str, Any]:
        """List notifications."""
        req = HookSniffRequest("GET", "/v1/notifications")
        req.set_query_params({
            "limit": limit,
            "unread_only": unread_only,
        })
        return req.send(self._config, lambda j: j)

    def mark_read(self, notification_id: str) -> dict[str, Any]:
        """Mark a notification as read."""
        req = HookSniffRequest("POST", "/v1/notifications/{id}/read")
        req.set_path_param("id", notification_id)
        return req.send(self._config, lambda j: j)

    def mark_all_read(self) -> None:
        """Mark all notifications as read."""
        req = HookSniffRequest("POST", "/v1/notifications/read-all")
        req.send_no_body(self._config)

    def register_device(self, token: str, platform: str, device_name: str | None = None) -> dict[str, Any]:
        """Register a push notification device."""
        req = HookSniffRequest("POST", "/v1/notifications/devices")
        body: dict[str, Any] = {"token": token, "platform": platform}
        if device_name:
            body["device_name"] = device_name
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def remove_device(self, device_id: str) -> None:
        """Remove a push notification device."""
        req = HookSniffRequest("DELETE", "/v1/notifications/devices/{id}")
        req.set_path_param("id", device_id)
        req.send_no_body(self._config)

    def get_preferences(self) -> dict[str, Any]:
        """Get notification preferences."""
        req = HookSniffRequest("GET", "/v1/notifications/preferences")
        return req.send(self._config, lambda j: j)

    def update_preferences(self, **kwargs: Any) -> dict[str, Any]:
        """Update notification preferences."""
        req = HookSniffRequest("PATCH", "/v1/notifications/preferences")
        req.set_body({k: v for k, v in kwargs.items() if v is not None})
        return req.send(self._config, lambda j: j)
