"""Message Poller — Cursor-based message polling."""

import typing as t
from .common import ApiBase


class MessagePollerAsync(ApiBase):
    async def poll(
        self,
        consumer_id: str,
        *,
        limit: t.Optional[int] = None,
        endpoint_id: t.Optional[str] = None,
        event_type: t.Optional[str] = None,
        include_payload: bool = True,
    ) -> dict:
        params: dict = {"consumer_id": consumer_id, "include_payload": include_payload}
        if limit is not None:
            params["limit"] = limit
        if endpoint_id is not None:
            params["endpoint_id"] = endpoint_id
        if event_type is not None:
            params["event_type"] = event_type
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/message-poller/poll",
            path_params={},
            query_params=params,
        )
        return response.json()

    async def seek(
        self,
        consumer_id: str,
        message_id: str,
        *,
        endpoint_id: t.Optional[str] = None,
    ) -> dict:
        body: dict = {"consumer_id": consumer_id, "message_id": message_id}
        if endpoint_id is not None:
            body["endpoint_id"] = endpoint_id
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/message-poller/seek",
            path_params={},
            json_body=body,
        )
        return response.json()

    async def commit(
        self,
        consumer_id: str,
        message_id: str,
        *,
        endpoint_id: t.Optional[str] = None,
    ) -> dict:
        body: dict = {"consumer_id": consumer_id, "message_id": message_id}
        if endpoint_id is not None:
            body["endpoint_id"] = endpoint_id
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/message-poller/commit",
            path_params={},
            json_body=body,
        )
        return response.json()


class MessagePoller(ApiBase):
    def poll(
        self,
        consumer_id: str,
        *,
        limit: t.Optional[int] = None,
        endpoint_id: t.Optional[str] = None,
        event_type: t.Optional[str] = None,
        include_payload: bool = True,
    ) -> dict:
        params: dict = {"consumer_id": consumer_id, "include_payload": include_payload}
        if limit is not None:
            params["limit"] = limit
        if endpoint_id is not None:
            params["endpoint_id"] = endpoint_id
        if event_type is not None:
            params["event_type"] = event_type
        response = self._request_sync(
            method="get",
            path="/api/v1/message-poller/poll",
            path_params={},
            query_params=params,
        )
        return response.json()

    def seek(
        self,
        consumer_id: str,
        message_id: str,
        *,
        endpoint_id: t.Optional[str] = None,
    ) -> dict:
        body: dict = {"consumer_id": consumer_id, "message_id": message_id}
        if endpoint_id is not None:
            body["endpoint_id"] = endpoint_id
        response = self._request_sync(
            method="post",
            path="/api/v1/message-poller/seek",
            path_params={},
            json_body=body,
        )
        return response.json()

    def commit(
        self,
        consumer_id: str,
        message_id: str,
        *,
        endpoint_id: t.Optional[str] = None,
    ) -> dict:
        body: dict = {"consumer_id": consumer_id, "message_id": message_id}
        if endpoint_id is not None:
            body["endpoint_id"] = endpoint_id
        response = self._request_sync(
            method="post",
            path="/api/v1/message-poller/commit",
            path_params={},
            json_body=body,
        )
        return response.json()
