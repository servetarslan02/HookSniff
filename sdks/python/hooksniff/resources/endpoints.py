"""
HookSniff API Resource: Endpoints

Manage webhook endpoints — create, list, update, delete, rotate secrets.
"""

from typing import Any, Dict, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.endpoint import Endpoint
from hooksniff.models.endpoint_list_response import EndpointListResponse
from hooksniff.models.create_endpoint_request import CreateEndpointRequest
from hooksniff.models.endpoints_id_rotate_secret_post200_response import EndpointsIdRotateSecretPost200Response


class Endpoints:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def list(self) -> EndpointListResponse:
        """List all endpoints."""
        req = HookSniffRequest("GET", "/v1/endpoints")
        return req.send(self._ctx, parser=EndpointListResponse._from_json)

    def create(self, data: Dict[str, Any], idempotency_key: Optional[str] = None) -> Endpoint:
        """Create a new endpoint."""
        req = HookSniffRequest("POST", "/v1/endpoints")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body(data)
        return req.send(self._ctx, parser=Endpoint._from_json)

    def get(self, endpoint_id: str) -> Endpoint:
        """Get an endpoint by ID."""
        req = HookSniffRequest("GET", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        return req.send(self._ctx, parser=Endpoint._from_json)

    def update(self, endpoint_id: str, data: Dict[str, Any]) -> Endpoint:
        """Update an endpoint."""
        req = HookSniffRequest("PUT", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        req.set_body(data)
        return req.send(self._ctx, parser=Endpoint._from_json)

    def delete(self, endpoint_id: str) -> None:
        """Delete an endpoint."""
        req = HookSniffRequest("DELETE", "/v1/endpoints/{id}")
        req.set_path_param("id", endpoint_id)
        req.send_void(self._ctx)

    def rotate_secret(self, endpoint_id: str) -> EndpointsIdRotateSecretPost200Response:
        """Rotate the signing secret for an endpoint."""
        req = HookSniffRequest("POST", "/v1/endpoints/{id}/rotate-secret")
        req.set_path_param("id", endpoint_id)
        return req.send(self._ctx, parser=EndpointsIdRotateSecretPost200Response._from_json)
