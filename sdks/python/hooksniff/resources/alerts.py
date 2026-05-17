"""
HookSniff SDK — Alerts Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Alerts:
    """Alert rules management."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def list(self) -> list[dict[str, Any]]:
        """List all alert rules."""
        req = HookSniffRequest("GET", "/v1/alerts")
        return req.send(self._config, lambda j: j)

    def create(
        self,
        name: str,
        condition: str,
        threshold: float,
        window_minutes: int,
        notification_channels: list[str] | None = None,
    ) -> dict[str, Any]:
        """Create a new alert rule."""
        req = HookSniffRequest("POST", "/v1/alerts")
        body: dict[str, Any] = {
            "name": name,
            "condition": condition,
            "threshold": threshold,
            "window_minutes": window_minutes,
        }
        if notification_channels:
            body["notification_channels"] = notification_channels
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def get(self, alert_id: str) -> dict[str, Any]:
        """Get an alert rule by ID."""
        req = HookSniffRequest("GET", "/v1/alerts/{id}")
        req.set_path_param("id", alert_id)
        return req.send(self._config, lambda j: j)

    def update(self, alert_id: str, **kwargs: Any) -> dict[str, Any]:
        """Update an alert rule."""
        req = HookSniffRequest("PATCH", "/v1/alerts/{id}")
        req.set_path_param("id", alert_id)
        req.set_body({k: v for k, v in kwargs.items() if v is not None})
        return req.send(self._config, lambda j: j)

    def delete(self, alert_id: str) -> None:
        """Delete an alert rule."""
        req = HookSniffRequest("DELETE", "/v1/alerts/{id}")
        req.set_path_param("id", alert_id)
        req.send_no_body(self._config)
