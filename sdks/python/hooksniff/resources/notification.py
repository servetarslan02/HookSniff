"""
HookSniff SDK — Notification Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import (
    NotificationOut,
    NotificationListResponse,
    DeviceTokenIn,
    DeviceTokenOut,
    NotificationPreferences,
    NotificationPreferencesUpdate,
)
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class NotificationListOptions(BaseOptions):
    limit: t.Optional[int] = None
    unread_only: t.Optional[bool] = None

    def _query_params(self) -> t.Dict[str, str]:
        return serialize_params({"limit": self.limit, "unread_only": self.unread_only})


class NotificationAsync(ApiBase):
    async def list(
        self, options: NotificationListOptions = NotificationListOptions()
    ) -> NotificationListResponse:
        """List notifications."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/notifications",
            query_params=options._query_params(),
        )
        return NotificationListResponse(**response.json())

    async def mark_read(self, notification_id: str) -> None:
        """Mark a notification as read."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/notifications/{notification_id}/read",
            path_params={"notification_id": notification_id},
        )

    async def mark_all_read(self) -> None:
        """Mark all notifications as read."""
        await self._request_asyncio(method="post", path="/api/v1/notifications/read-all")

    async def register_device(self, device_in: DeviceTokenIn) -> DeviceTokenOut:
        """Register a push notification device."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/notifications/devices",
            json_body=device_in.__dict__,
        )
        return DeviceTokenOut(**response.json())

    async def remove_device(self, device_id: str) -> None:
        """Remove a push notification device."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/notifications/devices/{device_id}",
            path_params={"device_id": device_id},
        )

    async def get_preferences(self) -> NotificationPreferences:
        """Get notification preferences."""
        response = await self._request_asyncio(
            method="get", path="/api/v1/notifications/preferences"
        )
        return NotificationPreferences(**response.json())

    async def update_preferences(
        self, prefs: NotificationPreferencesUpdate
    ) -> NotificationPreferences:
        """Update notification preferences."""
        response = await self._request_asyncio(
            method="patch",
            path="/api/v1/notifications/preferences",
            json_body=prefs.__dict__,
        )
        return NotificationPreferences(**response.json())


class Notification(ApiBase):
    def list(
        self, options: NotificationListOptions = NotificationListOptions()
    ) -> NotificationListResponse:
        """List notifications."""
        response = self._request_sync(
            method="get",
            path="/api/v1/notifications",
            query_params=options._query_params(),
        )
        return NotificationListResponse(**response.json())

    def mark_read(self, notification_id: str) -> None:
        """Mark a notification as read."""
        self._request_sync(
            method="post",
            path="/api/v1/notifications/{notification_id}/read",
            path_params={"notification_id": notification_id},
        )

    def mark_all_read(self) -> None:
        """Mark all as read."""
        self._request_sync(method="post", path="/api/v1/notifications/read-all")

    def register_device(self, device_in: DeviceTokenIn) -> DeviceTokenOut:
        """Register a push device."""
        response = self._request_sync(
            method="post",
            path="/api/v1/notifications/devices",
            json_body=device_in.__dict__,
        )
        return DeviceTokenOut(**response.json())

    def remove_device(self, device_id: str) -> None:
        """Remove a push device."""
        self._request_sync(
            method="delete",
            path="/api/v1/notifications/devices/{device_id}",
            path_params={"device_id": device_id},
        )

    def get_preferences(self) -> NotificationPreferences:
        """Get preferences."""
        response = self._request_sync(method="get", path="/api/v1/notifications/preferences")
        return NotificationPreferences(**response.json())

    def update_preferences(self, prefs: NotificationPreferencesUpdate) -> NotificationPreferences:
        """Update preferences."""
        response = self._request_sync(
            method="patch",
            path="/api/v1/notifications/preferences",
            json_body=prefs.__dict__,
        )
        return NotificationPreferences(**response.json())
