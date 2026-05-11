"""
HookSniff API Resource: Webhooks

Send, list, get, replay, and batch webhooks.
"""

from typing import Any, Dict, Generator, List, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.delivery import Delivery
from hooksniff.models.delivery_list_response import DeliveryListResponse
from hooksniff.models.batch_webhook_response import BatchWebhookResponse
from hooksniff.pagination import paginate, collect_all, Page


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
        """List deliveries (single page)."""
        req = HookSniffRequest("GET", "/v1/webhooks")
        if limit is not None:
            req.set_query_params({"limit": limit})
        if offset is not None:
            req.set_query_params({"offset": offset})
        return req.send(self._ctx, parser=DeliveryListResponse._from_json)

    def list_all(self, limit: int = 50, max_pages: int = 100) -> Generator[Delivery, None, None]:
        """Iterate through all deliveries with automatic pagination."""
        def fetch_page(lim, offset):
            req = HookSniffRequest("GET", "/v1/webhooks")
            req.set_query_params({"limit": lim, "offset": offset})
            resp = req.send(self._ctx, parser=DeliveryListResponse._from_json)
            return Page(
                data=resp.deliveries if hasattr(resp, 'deliveries') else [],
                has_more=resp.has_more if hasattr(resp, 'has_more') else False,
            )
        return paginate(fetch_page, limit=limit, max_pages=max_pages)

    def list_all_collect(self, limit: int = 50, max_pages: int = 100) -> List[Delivery]:
        """Collect all deliveries into a list. Alias for list_all_array."""
        return list(self.list_all(limit=limit, max_pages=max_pages))

    def list_all_array(self, limit: int = 50, max_pages: int = 100) -> List[Delivery]:
        """Collect all deliveries into a array (Node.js compatibility alias)."""
        return self.list_all_collect(limit=limit, max_pages=max_pages)

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
