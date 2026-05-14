"""
HookSniff API: Applications

Manage applications — create, list, update, delete.
"""

from typing import Optional, List
from ..api_client import ApiClient


class ApplicationsApi:
    """Applications API resource."""

    def __init__(self, client: ApiClient):
        self._client = client

    def list(self) -> List[dict]:
        """List all applications."""
        return self._client.get("/v1/applications")

    def get(self, application_id: str) -> dict:
        """Get a single application by ID."""
        return self._client.get(f"/v1/applications/{application_id}")

    def create(self, name: str, description: Optional[str] = None) -> dict:
        """Create a new application."""
        body = {"name": name}
        if description is not None:
            body["description"] = description
        return self._client.post("/v1/applications", body=body)

    def update(self, application_id: str, name: Optional[str] = None,
               description: Optional[str] = None, is_active: Optional[bool] = None) -> dict:
        """Update an application."""
        body = {}
        if name is not None:
            body["name"] = name
        if description is not None:
            body["description"] = description
        if is_active is not None:
            body["is_active"] = is_active
        return self._client.put(f"/v1/applications/{application_id}", body=body)

    def delete(self, application_id: str) -> dict:
        """Delete an application."""
        return self._client.delete(f"/v1/applications/{application_id}")
