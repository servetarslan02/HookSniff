"""Streaming — Real-time event streaming with channels and SSE."""

import typing as t
from .common import ApiBase


class StreamAsync(ApiBase):
    async def list_channels(self) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/stream/channels", path_params={})
        return response.json()

    async def get_channel(self, channel_id: str) -> dict:
        response = await self._request_asyncio(method="get", path="/api/v1/stream/channels/{id}", path_params={"id": channel_id})
        return response.json()

    async def create_channel(self, body: dict) -> dict:
        response = await self._request_asyncio(method="post", path="/api/v1/stream/channels", path_params={}, json_body=body)
        return response.json()

    async def update_channel(self, channel_id: str, body: dict) -> dict:
        response = await self._request_asyncio(method="put", path="/api/v1/stream/channels/{id}", path_params={"id": channel_id}, json_body=body)
        return response.json()

    async def delete_channel(self, channel_id: str) -> None:
        await self._request_asyncio(method="delete", path="/api/v1/stream/channels/{id}", path_params={"id": channel_id})

    async def list_messages(self, channel_id: str, **params) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/stream/channels/{id}/messages", path_params={"id": channel_id}, query_params=params)
        return response.json()

    async def list_subscriptions(self) -> t.List[dict]:
        response = await self._request_asyncio(method="get", path="/api/v1/stream/subscriptions", path_params={})
        return response.json()

    async def disconnect_subscription(self, sub_id: str) -> None:
        await self._request_asyncio(method="delete", path="/api/v1/stream/subscriptions/{id}", path_params={"id": sub_id})

    async def publish(self, body: dict) -> dict:
        response = await self._request_asyncio(method="post", path="/api/v1/stream/publish", path_params={}, json_body=body)
        return response.json()


class Stream(ApiBase):
    def list_channels(self) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/stream/channels", path_params={})
        return response.json()

    def get_channel(self, channel_id: str) -> dict:
        response = self._request_sync(method="get", path="/api/v1/stream/channels/{id}", path_params={"id": channel_id})
        return response.json()

    def create_channel(self, body: dict) -> dict:
        response = self._request_sync(method="post", path="/api/v1/stream/channels", path_params={}, json_body=body)
        return response.json()

    def update_channel(self, channel_id: str, body: dict) -> dict:
        response = self._request_sync(method="put", path="/api/v1/stream/channels/{id}", path_params={"id": channel_id}, json_body=body)
        return response.json()

    def delete_channel(self, channel_id: str) -> None:
        self._request_sync(method="delete", path="/api/v1/stream/channels/{id}", path_params={"id": channel_id})

    def list_messages(self, channel_id: str, **params) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/stream/channels/{id}/messages", path_params={"id": channel_id}, query_params=params)
        return response.json()

    def list_subscriptions(self) -> t.List[dict]:
        response = self._request_sync(method="get", path="/api/v1/stream/subscriptions", path_params={})
        return response.json()

    def disconnect_subscription(self, sub_id: str) -> None:
        self._request_sync(method="delete", path="/api/v1/stream/subscriptions/{id}", path_params={"id": sub_id})

    def publish(self, body: dict) -> dict:
        response = self._request_sync(method="post", path="/api/v1/stream/publish", path_params={}, json_body=body)
        return response.json()
