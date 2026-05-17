"""
HookSniff SDK — Endpoints Resource
"""

from __future__ import annotations

from typing import Any, Generator

from ..request import HookSniffRequest, RequestConfig
from ..pagination import paginate
from ..models import (
    Endpoint,
    EndpointListResponse,
    CreateEndpointRequest,
    UpdateEndpointRequest,
    RotateSecretResponse,
    EndpointHealth,
)


class Endpoints:
    """Endpoints CRUD operations."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def list(
        self,
        limit: int | None = None,
        iterator: str | None = None,
        is_active: bool | None = None,
    ) -> dict[str, Any]:
        """List all endpoints for the authenticated user."""
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.set_query_params({
            "limit": limit,
            "iterator": iterator,
            "is_active": is_active,
        })
        return req.send(self._config, lambda j: j)

    def list_all(
        self,
        limit: int | None = None,
        is_active: bool | None = None,
    ) -> Generator[dict[str, Any], None, None]:
        """Auto-paginate through all endpoints."""
        return paginate(
            lambda **kw: self.list(is_active=is_active, **kw),
            limit=limit,
        )

    def get(self, endpoint_id: str) -> dict[str, Any]:
        """Get a single endpoint by ID."""
        req = HookSniffRequest("GET", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        return req.send(self._config, lambda j: j)

    def create(self, body: CreateEndpointRequest | dict[str, Any]) -> dict[str, Any]:
        """Create a new endpoint."""
        req = HookSniffRequest("POST", "/v1/endpoints")
        data = body.__dict__ if isinstance(body, CreateEndpointRequest) else body
        req.set_body({k: v for k, v in data.items() if v is not None})
        return req.send(self._config, lambda j: j)

    def update(self, endpoint_id: str, body: UpdateEndpointRequest | dict[str, Any]) -> dict[str, Any]:
        """Update an existing endpoint."""
        req = HookSniffRequest("PUT", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        data = body.__dict__ if isinstance(body, UpdateEndpointRequest) else body
        req.set_body({k: v for k, v in data.items() if v is not None})
        return req.send(self._config, lambda j: j)

    def delete(self, endpoint_id: str) -> None:
        """Delete an endpoint."""
        req = HookSniffRequest("DELETE", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        req.send_no_body(self._config)

    def rotate_secret(
        self,
        endpoint_id: str,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        """Rotate the signing secret for an endpoint."""
        req = HookSniffRequest("POST", "/v1/endpoints/{id}/rotate-secret")
        req.set_path_param("id", endpoint_id)
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        return req.send(self._config, lambda j: j)

    def health(self, endpoint_id: str) -> dict[str, Any]:
        """Get health info for an endpoint."""
        req = HookSniffRequest("GET", "/v1/endpoints/{id}/health")
        req.set_path_param("id", endpoint_id)
        return req.send(self._config, lambda j: j)
