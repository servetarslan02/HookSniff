"""Connectors — Manage external service integrations."""

import typing as t
from .common import ApiBase


class ConnectorAsync(ApiBase):
    async def list(self) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/connectors", path_params={})
        return response.json()

    async def get(self, connector_id: str) -> dict:
        response = await self._request_asyncio(method="get", path="/api/v1/connectors/{id}", path_params={"id": connector_id})
        return response.json()

    async def list_configs(self) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/connectors/configs", path_params={})
        return response.json()

    async def create_config(self, body: dict) -> dict:
        response = await self._request_asyncio(method="post", path="/api/v1/connectors/configs", path_params={}, json_body=body)
        return response.json()

    async def update_config(self, config_id: str, body: dict) -> dict:
        response = await self._request_asyncio(method="put", path="/api/v1/connectors/configs/{id}", path_params={"id": config_id}, json_body=body)
        return response.json()

    async def delete_config(self, config_id: str) -> None:
        await self._request_asyncio(method="delete", path="/api/v1/connectors/configs/{id}", path_params={"id": config_id})


class Connector(ApiBase):
    def list(self) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/connectors", path_params={})
        return response.json()

    def get(self, connector_id: str) -> dict:
        response = self._request_sync(method="get", path="/api/v1/connectors/{id}", path_params={"id": connector_id})
        return response.json()

    def list_configs(self) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/connectors/configs", path_params={})
        return response.json()

    def create_config(self, body: dict) -> dict:
        response = self._request_sync(method="post", path="/api/v1/connectors/configs", path_params={}, json_body=body)
        return response.json()

    def update_config(self, config_id: str, body: dict) -> dict:
        response = self._request_sync(method="put", path="/api/v1/connectors/configs/{id}", path_params={"id": config_id}, json_body=body)
        return response.json()

    def delete_config(self, config_id: str) -> None:
        self._request_sync(method="delete", path="/api/v1/connectors/configs/{id}", path_params={"id": config_id})
