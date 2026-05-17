"""
HookSniff SDK — API Keys Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class ApiKeys:
    """API key management."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def list(self) -> list[dict[str, Any]]:
        """List all API keys."""
        req = HookSniffRequest("GET", "/v1/api-keys")
        return req.send(self._config, lambda j: j)

    def create(self, name: str, scopes: list[str] | None = None) -> dict[str, Any]:
        """Create a new API key. Returns the full key only once."""
        req = HookSniffRequest("POST", "/v1/api-keys")
        body: dict[str, Any] = {"name": name}
        if scopes:
            body["scopes"] = scopes
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def get(self, key_id: str) -> dict[str, Any]:
        """Get API key info by ID."""
        req = HookSniffRequest("GET", "/v1/api-keys/{id}")
        req.set_path_param("id", key_id)
        return req.send(self._config, lambda j: j)

    def delete(self, key_id: str) -> None:
        """Delete an API key."""
        req = HookSniffRequest("DELETE", "/v1/api-keys/{id}")
        req.set_path_param("id", key_id)
        req.send_no_body(self._config)
