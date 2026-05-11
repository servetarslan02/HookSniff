"""
HookSniff API Resource: API Keys
"""

from typing import Any, Dict, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class ApiKeys:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def list(self) -> Any:
        """List all API keys."""
        req = HookSniffRequest("GET", "/v1/api-keys")
        return req.send(self._ctx)

    def create(self, data: Dict[str, Any], idempotency_key: Optional[str] = None) -> Any:
        """Create a new API key."""
        req = HookSniffRequest("POST", "/v1/api-keys")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body(data)
        return req.send(self._ctx)

    def delete(self, key_id: str) -> None:
        """Delete an API key."""
        req = HookSniffRequest("DELETE", "/v1/api-keys/{id}")
        req.set_path_param("id", key_id)
        req.send_void(self._ctx)
