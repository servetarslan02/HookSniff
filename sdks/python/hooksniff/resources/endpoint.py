"""
HookSniff SDK — Endpoint Resource

Adapted from Svix SDK architecture.
"""

import typing as t
from dataclasses import dataclass

from .. import models
from ..models import (
    EndpointIn,
    EndpointOut,
    EndpointUpdate,
    EndpointSecretOut,
    EndpointStats,
    EndpointHealth,
    ListResponseEndpointOut,
)
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class EndpointListOptions(BaseOptions):
    limit: t.Optional[int] = None
    """Limit the number of returned items"""
    iterator: t.Optional[str] = None
    """The iterator returned from a prior invocation"""
    order: t.Optional[models.Ordering] = None
    """The sorting order of the returned items"""
    is_active: t.Optional[bool] = None
    """Filter by active status"""

    def _query_params(self) -> t.Dict[str, str]:
        return serialize_params(
            {
                "limit": self.limit,
                "iterator": self.iterator,
                "order": self.order,
                "is_active": self.is_active,
            }
        )


@dataclass
class EndpointCreateOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params(
            {
                "idempotency-key": self.idempotency_key,
            }
        )


class EndpointAsync(ApiBase):
    async def list(
        self, options: EndpointListOptions = EndpointListOptions()
    ) -> ListResponseEndpointOut:
        """List all endpoints for the authenticated user."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/endpoints",
            query_params=options._query_params(),
        )
        return ListResponseEndpointOut(**response.json())

    async def create(
        self, endpoint_in: EndpointIn, options: EndpointCreateOptions = EndpointCreateOptions()
    ) -> EndpointOut:
        """Create a new endpoint."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/endpoints",
            header_params=options._header_params(),
            json_body=endpoint_in.to_dict() if hasattr(endpoint_in, "to_dict") else endpoint_in.__dict__,
        )
        return EndpointOut(**response.json())

    async def get(self, endpoint_id: str) -> EndpointOut:
        """Get an endpoint by ID."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointOut(**response.json())

    async def update(self, endpoint_id: str, endpoint_update: EndpointUpdate) -> EndpointOut:
        """Update an endpoint."""
        response = await self._request_asyncio(
            method="put",
            path="/api/v1/endpoints/{endpoint_id}",
            path_params={"endpoint_id": endpoint_id},
            json_body=endpoint_update.__dict__,
        )
        return EndpointOut(**response.json())

    async def delete(self, endpoint_id: str) -> None:
        """Delete an endpoint."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/endpoints/{endpoint_id}",
            path_params={"endpoint_id": endpoint_id},
        )

    async def get_secret(self, endpoint_id: str) -> EndpointSecretOut:
        """Get the signing secret for an endpoint."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}/secret",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointSecretOut(**response.json())

    async def rotate_secret(
        self, endpoint_id: str, options: EndpointCreateOptions = EndpointCreateOptions()
    ) -> EndpointSecretOut:
        """Rotate the signing secret for an endpoint."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/endpoints/{endpoint_id}/rotate-secret",
            path_params={"endpoint_id": endpoint_id},
            header_params=options._header_params(),
        )
        return EndpointSecretOut(**response.json())

    async def get_stats(self, endpoint_id: str) -> EndpointStats:
        """Get delivery stats for an endpoint."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}/stats",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointStats(**response.json())

    async def get_health(self, endpoint_id: str) -> EndpointHealth:
        """Get health info for an endpoint."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}/health",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointHealth(**response.json())


class Endpoint(ApiBase):
    def list(
        self, options: EndpointListOptions = EndpointListOptions()
    ) -> ListResponseEndpointOut:
        """List all endpoints for the authenticated user."""
        response = self._request_sync(
            method="get",
            path="/api/v1/endpoints",
            query_params=options._query_params(),
        )
        return ListResponseEndpointOut(**response.json())

    def create(
        self, endpoint_in: EndpointIn, options: EndpointCreateOptions = EndpointCreateOptions()
    ) -> EndpointOut:
        """Create a new endpoint."""
        response = self._request_sync(
            method="post",
            path="/api/v1/endpoints",
            header_params=options._header_params(),
            json_body=endpoint_in.to_dict() if hasattr(endpoint_in, "to_dict") else endpoint_in.__dict__,
        )
        return EndpointOut(**response.json())

    def get(self, endpoint_id: str) -> EndpointOut:
        """Get an endpoint by ID."""
        response = self._request_sync(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointOut(**response.json())

    def update(self, endpoint_id: str, endpoint_update: EndpointUpdate) -> EndpointOut:
        """Update an endpoint."""
        response = self._request_sync(
            method="put",
            path="/api/v1/endpoints/{endpoint_id}",
            path_params={"endpoint_id": endpoint_id},
            json_body=endpoint_update.__dict__,
        )
        return EndpointOut(**response.json())

    def delete(self, endpoint_id: str) -> None:
        """Delete an endpoint."""
        self._request_sync(
            method="delete",
            path="/api/v1/endpoints/{endpoint_id}",
            path_params={"endpoint_id": endpoint_id},
        )

    def get_secret(self, endpoint_id: str) -> EndpointSecretOut:
        """Get the signing secret for an endpoint."""
        response = self._request_sync(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}/secret",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointSecretOut(**response.json())

    def rotate_secret(
        self, endpoint_id: str, options: EndpointCreateOptions = EndpointCreateOptions()
    ) -> EndpointSecretOut:
        """Rotate the signing secret for an endpoint."""
        response = self._request_sync(
            method="post",
            path="/api/v1/endpoints/{endpoint_id}/rotate-secret",
            path_params={"endpoint_id": endpoint_id},
            header_params=options._header_params(),
        )
        return EndpointSecretOut(**response.json())

    def get_stats(self, endpoint_id: str) -> EndpointStats:
        """Get delivery stats for an endpoint."""
        response = self._request_sync(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}/stats",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointStats(**response.json())

    def get_health(self, endpoint_id: str) -> EndpointHealth:
        """Get health info for an endpoint."""
        response = self._request_sync(
            method="get",
            path="/api/v1/endpoints/{endpoint_id}/health",
            path_params={"endpoint_id": endpoint_id},
        )
        return EndpointHealth(**response.json())
