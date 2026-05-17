"""
HookSniff SDK — Alert Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import AlertRuleOut, AlertRuleIn
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class AlertCreateOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params({"idempotency-key": self.idempotency_key})


class AlertAsync(ApiBase):
    async def list(self) -> t.List[AlertRuleOut]:
        """List all alert rules."""
        response = await self._request_asyncio(method="get", path="/api/v1/alerts")
        return [AlertRuleOut(**item) for item in response.json()]

    async def create(
        self, alert_in: AlertRuleIn, options: AlertCreateOptions = AlertCreateOptions()
    ) -> AlertRuleOut:
        """Create a new alert rule."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/alerts",
            header_params=options._header_params(),
            json_body=alert_in.__dict__,
        )
        return AlertRuleOut(**response.json())

    async def get(self, alert_id: str) -> AlertRuleOut:
        """Get an alert rule by ID."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/alerts/{alert_id}",
            path_params={"alert_id": alert_id},
        )
        return AlertRuleOut(**response.json())

    async def update(self, alert_id: str, **kwargs: t.Any) -> AlertRuleOut:
        """Update an alert rule."""
        response = await self._request_asyncio(
            method="patch",
            path="/api/v1/alerts/{alert_id}",
            path_params={"alert_id": alert_id},
            json_body={k: v for k, v in kwargs.items() if v is not None},
        )
        return AlertRuleOut(**response.json())

    async def delete(self, alert_id: str) -> None:
        """Delete an alert rule."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/alerts/{alert_id}",
            path_params={"alert_id": alert_id},
        )


class Alert(ApiBase):
    def list(self) -> t.List[AlertRuleOut]:
        """List all alert rules."""
        response = self._request_sync(method="get", path="/api/v1/alerts")
        return [AlertRuleOut(**item) for item in response.json()]

    def create(
        self, alert_in: AlertRuleIn, options: AlertCreateOptions = AlertCreateOptions()
    ) -> AlertRuleOut:
        """Create a new alert rule."""
        response = self._request_sync(
            method="post",
            path="/api/v1/alerts",
            header_params=options._header_params(),
            json_body=alert_in.__dict__,
        )
        return AlertRuleOut(**response.json())

    def get(self, alert_id: str) -> AlertRuleOut:
        """Get an alert rule by ID."""
        response = self._request_sync(
            method="get",
            path="/api/v1/alerts/{alert_id}",
            path_params={"alert_id": alert_id},
        )
        return AlertRuleOut(**response.json())

    def update(self, alert_id: str, **kwargs: t.Any) -> AlertRuleOut:
        """Update an alert rule."""
        response = self._request_sync(
            method="patch",
            path="/api/v1/alerts/{alert_id}",
            path_params={"alert_id": alert_id},
            json_body={k: v for k, v in kwargs.items() if v is not None},
        )
        return AlertRuleOut(**response.json())

    def delete(self, alert_id: str) -> None:
        """Delete an alert rule."""
        self._request_sync(
            method="delete",
            path="/api/v1/alerts/{alert_id}",
            path_params={"alert_id": alert_id},
        )
