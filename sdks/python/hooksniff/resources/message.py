"""
HookSniff SDK — Message (Webhook) Resource

Sending webhooks and managing deliveries.
"""

import typing as t
from dataclasses import dataclass

from .. import models
from ..models import (
    MessageIn,
    MessageOut,
    BatchMessageIn,
    BatchMessageResponse,
    MessageAttemptOut,
    ListResponseMessageOut,
    ListResponseMessageAttemptOut,
)
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class MessageCreateOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params({"idempotency-key": self.idempotency_key})


@dataclass
class MessageListOptions(BaseOptions):
    iterator: t.Optional[str] = None
    limit: t.Optional[int] = None
    event: t.Optional[str] = None
    endpoint_id: t.Optional[str] = None
    status: t.Optional[str] = None

    def _query_params(self) -> t.Dict[str, str]:
        return serialize_params({
            "iterator": self.iterator,
            "limit": self.limit,
            "event": self.event,
            "endpoint_id": self.endpoint_id,
            "status": self.status,
        })


class MessageAsync(ApiBase):
    async def create(
        self, message_in: MessageIn, options: MessageCreateOptions = MessageCreateOptions()
    ) -> MessageOut:
        """Send a single webhook."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/messages",
            header_params=options._header_params(),
            json_body=message_in.__dict__,
        )
        return MessageOut(**response.json())

    async def create_batch(
        self, batch_in: BatchMessageIn, options: MessageCreateOptions = MessageCreateOptions()
    ) -> BatchMessageResponse:
        """Send multiple webhooks in a single request."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/messages/batch",
            header_params=options._header_params(),
            json_body={"messages": [m.__dict__ for m in batch_in.messages]},
        )
        return BatchMessageResponse(**response.json())

    async def list(
        self, options: MessageListOptions = MessageListOptions()
    ) -> ListResponseMessageOut:
        """List messages."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/messages",
            query_params=options._query_params(),
        )
        return ListResponseMessageOut(**response.json())

    async def get(self, message_id: str) -> MessageOut:
        """Get a message by ID."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/messages/{message_id}",
            path_params={"message_id": message_id},
        )
        return MessageOut(**response.json())

    async def list_attempts(
        self, message_id: str, options: MessageListOptions = MessageListOptions()
    ) -> ListResponseMessageAttemptOut:
        """List delivery attempts for a message."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/messages/{message_id}/attempts",
            path_params={"message_id": message_id},
            query_params=options._query_params(),
        )
        return ListResponseMessageAttemptOut(**response.json())

    async def resend(self, message_id: str) -> None:
        """Resend a message."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/messages/{message_id}/resend",
            path_params={"message_id": message_id},
        )


class Message(ApiBase):
    def create(
        self, message_in: MessageIn, options: MessageCreateOptions = MessageCreateOptions()
    ) -> MessageOut:
        """Send a single webhook."""
        response = self._request_sync(
            method="post",
            path="/api/v1/messages",
            header_params=options._header_params(),
            json_body=message_in.__dict__,
        )
        return MessageOut(**response.json())

    def create_batch(
        self, batch_in: BatchMessageIn, options: MessageCreateOptions = MessageCreateOptions()
    ) -> BatchMessageResponse:
        """Send multiple webhooks in a single request."""
        response = self._request_sync(
            method="post",
            path="/api/v1/messages/batch",
            header_params=options._header_params(),
            json_body={"messages": [m.__dict__ for m in batch_in.messages]},
        )
        return BatchMessageResponse(**response.json())

    def list(
        self, options: MessageListOptions = MessageListOptions()
    ) -> ListResponseMessageOut:
        """List messages."""
        response = self._request_sync(
            method="get",
            path="/api/v1/messages",
            query_params=options._query_params(),
        )
        return ListResponseMessageOut(**response.json())

    def get(self, message_id: str) -> MessageOut:
        """Get a message by ID."""
        response = self._request_sync(
            method="get",
            path="/api/v1/messages/{message_id}",
            path_params={"message_id": message_id},
        )
        return MessageOut(**response.json())

    def list_attempts(
        self, message_id: str, options: MessageListOptions = MessageListOptions()
    ) -> ListResponseMessageAttemptOut:
        """List delivery attempts for a message."""
        response = self._request_sync(
            method="get",
            path="/api/v1/messages/{message_id}/attempts",
            path_params={"message_id": message_id},
            query_params=options._query_params(),
        )
        return ListResponseMessageAttemptOut(**response.json())

    def resend(self, message_id: str) -> None:
        """Resend a message."""
        self._request_sync(
            method="post",
            path="/api/v1/messages/{message_id}/resend",
            path_params={"message_id": message_id},
        )
