"""
HookSniff API: Service Tokens

Manage service tokens for API access — create, list, update, delete, reveal.
"""

from typing import Optional, List
from ..api_client import ApiClient


class ServiceTokensApi:
    """Service Tokens API resource."""

    def __init__(self, client: ApiClient):
        self._client = client

    def list(self) -> List[dict]:
        """List all service tokens."""
        return self._client.get("/v1/service-tokens")

    def create(self, name: str) -> dict:
        """Create a new service token (full token shown only once)."""
        return self._client.post("/v1/service-tokens", body={"name": name})

    def update(self, token_id: str, name: Optional[str] = None) -> dict:
        """Update a service token (e.g. rename)."""
        body = {}
        if name is not None:
            body["name"] = name
        return self._client.put(f"/v1/service-tokens/{token_id}", body=body)

    def delete(self, token_id: str) -> dict:
        """Delete a service token."""
        return self._client.delete(f"/v1/service-tokens/{token_id}")

    def reveal(self, token_id: str) -> dict:
        """Reveal the full token value (only available once after creation)."""
        return self._client.post(f"/v1/service-tokens/{token_id}/reveal")
