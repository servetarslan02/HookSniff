"""
HookSniff API Resource: Endpoints

Manage webhook endpoints — create, list, update, delete, rotate secrets.
"""

from typing import Any, Dict, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Endpoints:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def list(self) -> Any:
        """List all endpoints."""
        req = HookSniffRequest("GET", "/v1/endpoints")
        return req.send(self._ctx)

    def create(self, data: Dict[str, Any], idempotency_key: Optional[str] = None) -> Any:
        """Create a new endpoint."""
        req = HookSniffRequest("POST", "/v1/endpoints")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body(data)
        return req.send(self._ctx)

    def get(self, endpoint_id: str) -> Any:
        """Get an endpoint by ID."""
        req = HookSniffRequest("GET", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        return req.send(self._ctx)

    def update(self, endpoint_id: str, data: Dict[str, Any]) -> Any:
        """Update an endpoint."""
        req = HookSniffRequest("PUT", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        req.set_body(data)
        return req.send(self._ctx)

    def delete(self, endpoint_id: str) -> None:
        """Delete an endpoint."""
        req = HookSniffRequest("DELETE", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        req.send_void(self._ctx)

    def rotate_secret(self, endpoint_id: str) -> Any:
        """Rotate the signing secret for an endpoint."""
        req = HookSniffRequest("POST", "/v1/endpoints/{id}/rotate-secret")
        req.set_path_param("id", endpoint_id)
        return req.send(self._ctx)
