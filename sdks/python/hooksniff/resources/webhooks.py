"""
HookSniff SDK — Webhooks Resource
"""

from __future__ import annotations

from typing import Any, Generator

from ..request import HookSniffRequest, RequestConfig
from ..pagination import paginate
from ..models import (
    CreateWebhookRequest,
    BatchWebhookRequest,
    Delivery,
    DeliveryListResponse,
    BatchResponse,
    DeliveryAttempt,
    BatchReplayRequest,
)


class Webhooks:
    """Webhook sending & delivery management."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def send(self, body: CreateWebhookRequest | dict[str, Any]) -> dict[str, Any]:
        """Send a single webhook."""
        req = HookSniffRequest("POST", "/v1/webhooks")
        data = body.__dict__ if isinstance(body, CreateWebhookRequest) else body
        req.set_body({k: v for k, v in data.items() if v is not None})
        return req.send(self._config, lambda j: j)

    def send_batch(self, body: BatchWebhookRequest | dict[str, Any]) -> dict[str, Any]:
        """Send multiple webhooks in a single request."""
        req = HookSniffRequest("POST", "/v1/webhooks/batch")
        data = body.__dict__ if isinstance(body, BatchWebhookRequest) else body
        req.set_body(data)
        return req.send(self._config, lambda j: j)

    def get_delivery(self, delivery_id: str) -> dict[str, Any]:
        """Get a delivery by ID."""
        req = HookSniffRequest("GET", "/v1/deliveries/{id}")
        req.set_path_param("id", delivery_id)
        return req.send(self._config, lambda j: j)

    def list_deliveries(
        self,
        endpoint_id: str | None = None,
        status: str | None = None,
        limit: int | None = None,
        iterator: str | None = None,
    ) -> dict[str, Any]:
        """List deliveries."""
        req = HookSniffRequest("GET", "/v1/deliveries")
        req.set_query_params({
            "endpoint_id": endpoint_id,
            "status": status,
            "limit": limit,
            "iterator": iterator,
        })
        return req.send(self._config, lambda j: j)

    def list_deliveries_all(
        self,
        endpoint_id: str | None = None,
        status: str | None = None,
        limit: int | None = None,
    ) -> Generator[dict[str, Any], None, None]:
        """Auto-paginate through all deliveries."""
        return paginate(
            lambda **kw: self.list_deliveries(endpoint_id=endpoint_id, status=status, **kw),
            limit=limit,
        )

    def get_attempts(self, delivery_id: str) -> list[dict[str, Any]]:
        """Get all attempts for a delivery."""
        req = HookSniffRequest("GET", "/v1/deliveries/{id}/attempts")
        req.set_path_param("id", delivery_id)
        return req.send(self._config, lambda j: j)

    def replay(self, body: BatchReplayRequest | dict[str, Any]) -> dict[str, Any]:
        """Replay failed deliveries."""
        req = HookSniffRequest("POST", "/v1/deliveries/replay")
        data = body.__dict__ if isinstance(body, BatchReplayRequest) else body
        req.set_body(data)
        return req.send(self._config, lambda j: j)

    def test(self, endpoint_id: str, event: str | None = None, data: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send a test webhook to an endpoint."""
        req = HookSniffRequest("POST", "/v1/webhooks/test")
        body: dict[str, Any] = {"endpoint_id": endpoint_id}
        if event:
            body["event"] = event
        if data:
            body["data"] = data
        req.set_body(body)
        return req.send(self._config, lambda j: j)
