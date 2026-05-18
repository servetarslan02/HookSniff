"""Integrations — Connect connectors to endpoints with event routing."""

import typing as t
from .common import ApiBase


class IntegrationAsync(ApiBase):
    async def list(self) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/integrations", path_params={})
        return response.json()

    async def get(self, integration_id: str) -> dict:
        response = await self._request_asyncio(method="get", path="/api/v1/integrations/{id}", path_params={"id": integration_id})
        return response.json()

    async def create(self, body: dict) -> dict:
        response = await self._request_asyncio(method="post", path="/api/v1/integrations", path_params={}, json_body=body)
        return response.json()

    async def update(self, integration_id: str, body: dict) -> dict:
        response = await self._request_asyncio(method="put", path="/api/v1/integrations/{id}", path_params={"id": integration_id}, json_body=body)
        return response.json()

    async def delete(self, integration_id: str) -> None:
        await self._request_asyncio(method="delete", path="/api/v1/integrations/{id}", path_params={"id": integration_id})

    async def test(self, integration_id: str) -> dict:
        response = await self._request_asyncio(method="post", path="/api/v1/integrations/{id}/test", path_params={"id": integration_id})
        return response.json()

    async def list_events(self, integration_id: str, **params) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/integrations/{id}/events", path_params={"id": integration_id}, query_params=params)
        return response.json()

    async def get_stats(self, integration_id: str) -> dict:
        response = await self._request_asyncio(method="get", path="/api/v1/integrations/{id}/stats", path_params={"id": integration_id})
        return response.json()


class Integration(ApiBase):
    def list(self) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/integrations", path_params={})
        return response.json()

    def get(self, integration_id: str) -> dict:
        response = self._request_sync(method="get", path="/api/v1/integrations/{id}", path_params={"id": integration_id})
        return response.json()

    def create(self, body: dict) -> dict:
        response = self._request_sync(method="post", path="/api/v1/integrations", path_params={}, json_body=body)
        return response.json()

    def update(self, integration_id: str, body: dict) -> dict:
        response = self._request_sync(method="put", path="/api/v1/integrations/{id}", path_params={"id": integration_id}, json_body=body)
        return response.json()

    def delete(self, integration_id: str) -> None:
        self._request_sync(method="delete", path="/api/v1/integrations/{id}", path_params={"id": integration_id})

    def test(self, integration_id: str) -> dict:
        response = self._request_sync(method="post", path="/api/v1/integrations/{id}/test", path_params={"id": integration_id})
        return response.json()

    def list_events(self, integration_id: str, **params) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/integrations/{id}/events", path_params={"id": integration_id}, query_params=params)
        return response.json()

    def get_stats(self, integration_id: str) -> dict:
        response = self._request_sync(method="get", path="/api/v1/integrations/{id}/stats", path_params={"id": integration_id})
        return response.json()
