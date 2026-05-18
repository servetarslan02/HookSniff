import typing as t

from .. import models
from ..models import BackgroundTaskOut
from .common import ApiBase


class BackgroundTaskAsync(ApiBase):
    async def list(self) -> t.List[BackgroundTaskOut]:
        """List all background tasks for the authenticated customer."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/background-tasks",
            path_params={},
        )
        return [BackgroundTaskOut.model_validate(item) for item in response.json()]

    async def get(self, task_id: str) -> BackgroundTaskOut:
        """Get a background task by ID."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/background-tasks/{task_id}",
            path_params={"task_id": task_id},
        )
        return BackgroundTaskOut.model_validate(response.json())

    async def cancel(self, task_id: str) -> BackgroundTaskOut:
        """Cancel a pending or running background task."""
        response = await self._request_asyncio(
            method="put",
            path="/api/v1/background-tasks/{task_id}",
            path_params={"task_id": task_id},
        )
        return BackgroundTaskOut.model_validate(response.json())


class BackgroundTask(ApiBase):
    def list(self) -> t.List[BackgroundTaskOut]:
        """List all background tasks for the authenticated customer."""
        response = self._request_sync(
            method="get",
            path="/api/v1/background-tasks",
            path_params={},
        )
        return [BackgroundTaskOut.model_validate(item) for item in response.json()]

    def get(self, task_id: str) -> BackgroundTaskOut:
        """Get a background task by ID."""
        response = self._request_sync(
            method="get",
            path="/api/v1/background-tasks/{task_id}",
            path_params={"task_id": task_id},
        )
        return BackgroundTaskOut.model_validate(response.json())

    def cancel(self, task_id: str) -> BackgroundTaskOut:
        """Cancel a pending or running background task."""
        response = self._request_sync(
            method="put",
            path="/api/v1/background-tasks/{task_id}",
            path_params={"task_id": task_id},
        )
        return BackgroundTaskOut.model_validate(response.json())
