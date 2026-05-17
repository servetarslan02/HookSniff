"""
HookSniff SDK — Main Client

Usage:
    from hooksniff import HookSniff

    hs = HookSniff(api_key="hooksniff_xxx")

    # List endpoints
    endpoints = hs.endpoints.list()

    # Auto-paginate
    for ep in hs.endpoints.list_all():
        print(ep["url"])

    # Send a webhook
    delivery = hs.webhooks.send({
        "endpoint_id": "ep_123",
        "event": "order.created",
        "data": {"order_id": "12345"},
    })

    # Verify incoming webhook
    from hooksniff import Webhook
    wh = Webhook("whsec_...")
    payload = wh.verify(raw_body, headers)
"""

from __future__ import annotations

from .request import RequestConfig, DEFAULT_BASE_URL
from .resources import (
    Endpoints,
    Webhooks,
    Auth,
    ApiKeys,
    Teams,
    Alerts,
    Analytics,
    Billing,
    Health,
    Search,
    Notifications,
    Admin,
)


class HookSniff:
    """
    HookSniff API Client.

    Args:
        api_key: Your HookSniff API key (starts with "hooksniff_")
        server_url: API base URL (defaults to production)
        timeout: Request timeout in seconds
        num_retries: Number of retries on 5xx errors (default: 2)
        debug: Enable debug logging

    Example:
        hs = HookSniff(api_key="hooksniff_xxx")
        endpoints = hs.endpoints.list()
    """

    def __init__(
        self,
        api_key: str,
        server_url: str = DEFAULT_BASE_URL,
        timeout: float | None = 30.0,
        num_retries: int = 2,
        debug: bool = False,
    ):
        self._config = RequestConfig(
            base_url=server_url,
            token=api_key,
            timeout=timeout,
            num_retries=num_retries,
            debug=debug,
        )

        self.endpoints = Endpoints(self._config)
        self.webhooks = Webhooks(self._config)
        self.auth = Auth(self._config)
        self.api_keys = ApiKeys(self._config)
        self.teams = Teams(self._config)
        self.alerts = Alerts(self._config)
        self.analytics = Analytics(self._config)
        self.billing = Billing(self._config)
        self.health = Health(self._config)
        self.search = Search(self._config)
        self.notifications = Notifications(self._config)
        self.admin = Admin(self._config)
