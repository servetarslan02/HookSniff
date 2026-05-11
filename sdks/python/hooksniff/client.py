"""
HookSniff SDK — Main Client

Usage:
    from hooksniff import HookSniff

    hs = HookSniff(api_key="your-api-key")
    endpoints = hs.endpoints.list()
"""

from hooksniff.request import HookSniffRequestContext
from hooksniff.resources.endpoints import Endpoints
from hooksniff.resources.webhooks import Webhooks
from hooksniff.resources.auth import Auth
from hooksniff.resources.analytics import Analytics
from hooksniff.resources.api_keys import ApiKeys
from hooksniff.resources.alerts import Alerts
from hooksniff.resources.teams import Teams
from hooksniff.resources.search import Search
from hooksniff.resources.billing import Billing
from hooksniff.resources.health import Health

DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app"


class HookSniff:
    """
    HookSniff API client.

    Args:
        api_key: Your API key or JWT token.
        base_url: Base URL of the HookSniff API (default: production).
        timeout: Request timeout in milliseconds (default: 30000).
        num_retries: Number of retries for 5xx errors (default: 2).
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: int = 30000,
        num_retries: int = 2,
    ):
        if not api_key:
            raise ValueError("HookSniff: api_key is required")

        self._ctx = HookSniffRequestContext(
            base_url=base_url,
            token=api_key,
            timeout=timeout,
            num_retries=num_retries,
        )

        self.endpoints = Endpoints(self._ctx)
        self.webhooks = Webhooks(self._ctx)
        self.auth = Auth(self._ctx)
        self.analytics = Analytics(self._ctx)
        self.api_keys = ApiKeys(self._ctx)
        self.alerts = Alerts(self._ctx)
        self.teams = Teams(self._ctx)
        self.search = Search(self._ctx)
        self.billing = Billing(self._ctx)
        self.health = Health(self._ctx)
