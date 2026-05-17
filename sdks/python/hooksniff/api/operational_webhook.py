import typing as t
from ..models import OperationalWebhookEndpointOut, OperationalWebhookEndpointIn, OperationalWebhookDeliveryOut
from .common import ApiBase

class OperationalWebhookAsync(ApiBase):
    async def list(self) -> t.List[OperationalWebhookEndpointOut]:
        response = await self._request_asyncio(method="get", path="/api/v1/operational-webhooks", path_params={})
        return [OperationalWebhookEndpointOut.model_validate(i) for i in response.json()]
    async def create(self, body: OperationalWebhookEndpointIn) -> OperationalWebhookEndpointOut:
        response = await self._request_asyncio(method="post", path="/api/v1/operational-webhooks", path_params={}, json_body=body.model_dump_json(exclude_unset=True, by_alias=True))
        return OperationalWebhookEndpointOut.model_validate(response.json())
    async def get(self, endpoint_id: str) -> OperationalWebhookEndpointOut:
        response = await self._request_asyncio(method="get", path="/api/v1/operational-webhooks/{id}", path_params={"id": endpoint_id})
        return OperationalWebhookEndpointOut.model_validate(response.json())
    async def update(self, endpoint_id: str, body: OperationalWebhookEndpointIn) -> OperationalWebhookEndpointOut:
        response = await self._request_asyncio(method="put", path="/api/v1/operational-webhooks/{id}", path_params={"id": endpoint_id}, json_body=body.model_dump_json(exclude_unset=True, by_alias=True))
        return OperationalWebhookEndpointOut.model_validate(response.json())
    async def delete(self, endpoint_id: str) -> None:
        await self._request_asyncio(method="delete", path="/api/v1/operational-webhooks/{id}", path_params={"id": endpoint_id})
    async def list_deliveries(self, endpoint_id: str) -> t.List[OperationalWebhookDeliveryOut]:
        response = await self._request_asyncio(method="get", path="/api/v1/operational-webhooks/{id}/deliveries", path_params={"id": endpoint_id})
        return [OperationalWebhookDeliveryOut.model_validate(i) for i in response.json()]

class OperationalWebhook(ApiBase):
    def list(self) -> t.List[OperationalWebhookEndpointOut]:
        response = self._request_sync(method="get", path="/api/v1/operational-webhooks", path_params={})
        return [OperationalWebhookEndpointOut.model_validate(i) for i in response.json()]
    def create(self, body: OperationalWebhookEndpointIn) -> OperationalWebhookEndpointOut:
        response = self._request_sync(method="post", path="/api/v1/operational-webhooks", path_params={}, json_body=body.model_dump_json(exclude_unset=True, by_alias=True))
        return OperationalWebhookEndpointOut.model_validate(response.json())
    def get(self, endpoint_id: str) -> OperationalWebhookEndpointOut:
        response = self._request_sync(method="get", path="/api/v1/operational-webhooks/{id}", path_params={"id": endpoint_id})
        return OperationalWebhookEndpointOut.model_validate(response.json())
    def update(self, endpoint_id: str, body: OperationalWebhookEndpointIn) -> OperationalWebhookEndpointOut:
        response = self._request_sync(method="put", path="/api/v1/operational-webhooks/{id}", path_params={"id": endpoint_id}, json_body=body.model_dump_json(exclude_unset=True, by_alias=True))
        return OperationalWebhookEndpointOut.model_validate(response.json())
    def delete(self, endpoint_id: str) -> None:
        self._request_sync(method="delete", path="/api/v1/operational-webhooks/{id}", path_params={"id": endpoint_id})
    def list_deliveries(self, endpoint_id: str) -> t.List[OperationalWebhookDeliveryOut]:
        response = self._request_sync(method="get", path="/api/v1/operational-webhooks/{id}/deliveries", path_params={"id": endpoint_id})
        return [OperationalWebhookDeliveryOut.model_validate(i) for i in response.json()]
