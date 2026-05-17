"""
HookSniff SDK — API Key Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import ApiTokenOut, ApiTokenCreateOut
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class ApiKeyCreateOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params({"idempotency-key": self.idempotency_key})


class ApiKeyAsync(ApiBase):
    async def list(self) -> t.List[ApiTokenOut]:
        """List all API keys."""
        response = await self._request_asyncio(method="get", path="/api/v1/api-keys")
        return [ApiTokenOut(**item) for item in response.json()]

    async def create(
        self, name: str, scopes: t.Optional[t.List[str]] = None,
        options: ApiKeyCreateOptions = ApiKeyCreateOptions()
    ) -> ApiTokenCreateOut:
        """Create a new API key. Returns the full key only once."""
        body: t.Dict[str, t.Any] = {"name": name}
        if scopes:
            body["scopes"] = scopes
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/api-keys",
            header_params=options._header_params(),
            json_body=body,
        )
        return ApiTokenCreateOut(**response.json())

    async def get(self, key_id: str) -> ApiTokenOut:
        """Get API key info by ID."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/api-keys/{key_id}",
            path_params={"key_id": key_id},
        )
        return ApiTokenOut(**response.json())

    async def delete(self, key_id: str) -> None:
        """Delete an API key."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/api-keys/{key_id}",
            path_params={"key_id": key_id},
        )


class ApiKey(ApiBase):
    def list(self) -> t.List[ApiTokenOut]:
        """List all API keys."""
        response = self._request_sync(method="get", path="/api/v1/api-keys")
        return [ApiTokenOut(**item) for item in response.json()]

    def create(
        self, name: str, scopes: t.Optional[t.List[str]] = None,
        options: ApiKeyCreateOptions = ApiKeyCreateOptions()
    ) -> ApiTokenCreateOut:
        """Create a new API key."""
        body: t.Dict[str, t.Any] = {"name": name}
        if scopes:
            body["scopes"] = scopes
        response = self._request_sync(
            method="post",
            path="/api/v1/api-keys",
            header_params=options._header_params(),
            json_body=body,
        )
        return ApiTokenCreateOut(**response.json())

    def get(self, key_id: str) -> ApiTokenOut:
        """Get API key info by ID."""
        response = self._request_sync(
            method="get",
            path="/api/v1/api-keys/{key_id}",
            path_params={"key_id": key_id},
        )
        return ApiTokenOut(**response.json())

    def delete(self, key_id: str) -> None:
        """Delete an API key."""
        self._request_sync(
            method="delete",
            path="/api/v1/api-keys/{key_id}",
            path_params={"key_id": key_id},
        )
