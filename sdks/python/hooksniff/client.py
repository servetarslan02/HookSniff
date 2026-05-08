"""HookSniff API client."""

from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import requests

from .exceptions import (
    AuthenticationError,
    HookSniffError,
    NotFoundError,
    PayloadTooLargeError,
    RateLimitError,
    ValidationError,
)
from .models import (
    AiAction,
    AiEvent,
    AiStatus,
    BatchResult,
    Delivery,
    DeliveryAttempt,
    DeliveryList,
    Endpoint,
    RetryPolicy,
    RiskScore,
    Stats,
)


class _EndpointsResource:
    """Endpoints CRUD operations."""

    def __init__(self, client: "HookSniffClient"):
        self._client = client

    def create(
        self,
        url: str,
        description: Optional[str] = None,
        retry_policy: Optional[RetryPolicy] = None,
    ) -> Endpoint:
        """Create a new webhook endpoint."""
        data: Dict[str, Any] = {"url": url}
        if description is not None:
            data["description"] = description
        if retry_policy is not None:
            data["retry_policy"] = retry_policy.to_dict()

        resp = self._client._request("POST", "/endpoints", json=data)
        return Endpoint.from_dict(resp)

    def get(self, endpoint_id: str) -> Endpoint:
        """Get an endpoint by ID."""
        resp = self._client._request("GET", f"/endpoints/{endpoint_id}")
        return Endpoint.from_dict(resp)

    def list(self, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """List endpoints with pagination."""
        params = {"page": page, "per_page": per_page}
        resp = self._client._request("GET", "/endpoints", params=params)
        return {
            "endpoints": [Endpoint.from_dict(e) for e in (resp.get("endpoints", resp) if isinstance(resp, dict) else resp)],
            "total": resp.get("total", 0) if isinstance(resp, dict) else len(resp),
            "page": resp.get("page", page) if isinstance(resp, dict) else page,
            "per_page": resp.get("per_page", per_page) if isinstance(resp, dict) else per_page,
        }

    def delete(self, endpoint_id: str) -> bool:
        """Delete an endpoint."""
        resp = self._client._request("DELETE", f"/endpoints/{endpoint_id}")
        return resp.get("deleted", False)

    def rotate_secret(self, endpoint_id: str) -> Dict[str, Any]:
        """Rotate the signing secret for an endpoint."""
        return self._client._request("POST", f"/endpoints/{endpoint_id}/rotate-secret")


class _WebhooksResource:
    """Webhooks operations."""

    def __init__(self, client: "HookSniffClient"):
        self._client = client

    def send(
        self,
        endpoint_id: str,
        event: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> Delivery:
        """Send a webhook."""
        payload: Dict[str, Any] = {"endpoint_id": endpoint_id, "data": data or {}}
        if event is not None:
            payload["event"] = event

        resp = self._client._request("POST", "/webhooks", json=payload)
        return Delivery.from_dict(resp)

    def get(self, delivery_id: str) -> Delivery:
        """Get a delivery by ID."""
        resp = self._client._request("GET", f"/webhooks/{delivery_id}")
        return Delivery.from_dict(resp)

    def list(
        self,
        status: Optional[str] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> DeliveryList:
        """List deliveries with optional filters."""
        params: Dict[str, Any] = {"page": page, "per_page": per_page}
        if status is not None:
            params["status"] = status

        resp = self._client._request("GET", "/webhooks", params=params)
        return DeliveryList.from_dict(resp)

    def replay(self, delivery_id: str) -> Delivery:
        """Replay a webhook delivery."""
        resp = self._client._request("POST", f"/webhooks/{delivery_id}/replay")
        return Delivery.from_dict(resp)

    def batch(self, webhooks: List[Dict[str, Any]]) -> BatchResult:
        """Send multiple webhooks in a batch."""
        resp = self._client._request(
            "POST", "/webhooks/batch", json={"webhooks": webhooks}
        )
        return BatchResult.from_dict(resp)

    def attempts(self, delivery_id: str) -> List[DeliveryAttempt]:
        """Get delivery attempts for a webhook."""
        resp = self._client._request("GET", f"/webhooks/{delivery_id}/attempts")
        return [DeliveryAttempt.from_dict(a) for a in resp]

    def export(
        self,
        format: str = "json",
        status: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> Any:
        """Export webhook logs."""
        params: Dict[str, Any] = {"format": format}
        if status is not None:
            params["status"] = status
        if date_from is not None:
            params["date_from"] = date_from
        if date_to is not None:
            params["date_to"] = date_to

        resp = self._client._request("GET", "/webhooks/export", params=params)
        return resp



class HookSniffClient:
    """
    HookSniff API client.

    Usage:
        from hooksniff import HookSniffClient

        client = HookSniffClient(api_key="hr_live_...")

        # Create endpoint
        endpoint = client.endpoints.create(url="https://myapp.com/webhook")

        # Send webhook
        delivery = client.webhooks.send(
            endpoint_id=endpoint.id,
            event="order.created",
            data={"order_id": "12345"}
        )

        # AI Center
        status = client.ai.status()
        events = client.ai.events(severity="critical")
        risks = client.ai.risks()
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1",
        timeout: int = 30,
    ):
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._session = requests.Session()
        self._session.headers.update(
            {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "hooksniff-python/0.4.0",
            }
        )

        self.endpoints = _EndpointsResource(self)
        self.webhooks = _WebhooksResource(self)

    def _request(
        self,
        method: str,
        path: str,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """Make an API request."""
        url = urljoin(self._base_url + "/", path.lstrip("/"))

        try:
            response = self._session.request(
                method=method,
                url=url,
                json=json,
                params=params,
                timeout=self._timeout,
            )
        except requests.RequestException as e:
            raise HookSniffError(f"Request failed: {e}") from e

        if response.status_code == 200:
            # Handle CSV export
            content_type = response.headers.get("content-type", "")
            if "text/csv" in content_type:
                return response.text
            return response.json()

        # Handle errors
        try:
            error_body = response.json()
            message = error_body.get("error", {}).get("message", response.text)
        except (ValueError, KeyError):
            message = response.text or f"HTTP {response.status_code}"

        if response.status_code == 400:
            raise ValidationError(message)
        elif response.status_code == 401:
            raise AuthenticationError(message)
        elif response.status_code == 404:
            raise NotFoundError(message)
        elif response.status_code == 413:
            raise PayloadTooLargeError(message)
        elif response.status_code == 429:
            raise RateLimitError(message)
        else:
            raise HookSniffError(
                message,
                status_code=response.status_code,
            )

    def get_stats(self) -> Stats:
        """Get delivery statistics."""
        resp = self._request("GET", "/stats")
        return Stats.from_dict(resp)
