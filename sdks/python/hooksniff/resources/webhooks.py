"""
HookSniff API Resource: Webhooks

Send, list, get, replay, and batch webhooks.
"""

from typing import Any, Dict, List, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.delivery import Delivery
from hooksniff.models.delivery_list_response import DeliveryListResponse
from hooksniff.models.batch_webhook_response import BatchWebhookResponse


class Webhooks:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def send(self, data: Dict[str, Any], idempotency_key: Optional[str] = None) -> Delivery:
        """Send a single webhook."""
        req = HookSniffRequest("POST", "/v1/webhooks")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body(data)
        return req.send(self._ctx, parser=Delivery._from_json)

    def batch(self, data: Dict[str, Any], idempotency_key: Optional[str] = None) -> BatchWebhookResponse:
        """Send batch webhooks."""
        req = HookSniffRequest("POST", "/v1/webhooks/batch")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body(data)
        return req.send(self._ctx, parser=BatchWebhookResponse._from_json)

    def list(self, limit: Optional[int] = None, offset: Optional[int] = None) -> DeliveryListResponse:
        """List deliveries."""
        req = HookSniffRequest("GET", "/v1/webhooks")
        if limit is not None:
            req.set_query_params({"limit": limit})
        if offset is not None:
            req.set_query_params({"offset": offset})
        return req.send(self._ctx, parser=DeliveryListResponse._from_json)

    def get(self, delivery_id: str) -> Delivery:
        """Get a specific delivery."""
        req = HookSniffRequest("GET", "/v1/webhooks/{id}")
        req.set_path_param("id", delivery_id)
        return req.send(self._ctx, parser=Delivery._from_json)

    def replay(self, delivery_id: str, idempotency_key: Optional[str] = None) -> Delivery:
        """Replay a delivery."""
        req = HookSniffRequest("POST", "/v1/webhooks/{id}/replay")
        req.set_path_param("id", delivery_id)
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        return req.send(self._ctx, parser=Delivery._from_json)
