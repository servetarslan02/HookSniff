"""
HookSniff SDK — Main Client

Adapted from Svix SDK architecture.
"""

import typing as t
from dataclasses import dataclass, field

from .endpoint import Endpoint, EndpointAsync
from .authentication import Authentication, AuthenticationAsync
from .message import Message, MessageAsync
from .api_key import ApiKey, ApiKeyAsync
from .team import Team, TeamAsync
from .alert import Alert, AlertAsync
from .analytics import Analytics, AnalyticsAsync
from .billing import Billing, BillingAsync
from .health import Health, HealthAsync
from .search import Search, SearchAsync
from .notification import Notification, NotificationAsync
from .admin import Admin, AdminAsync
from .client import AuthenticatedClient

DEFAULT_SERVER_URL = "https://api.hooksniff.com"


@dataclass
class HookSniffOptions:
    debug: bool = False
    server_url: t.Optional[str] = None
    """
    The retry schedule, as seconds to wait after each failed request.

    The first entry is the time in seconds to wait between the first request
    failing and the first retry, and so on.
    Up to five retries are supported, passing a retry schedule with more than
    five entries will raise a `ValueError`.

    Defaults to [0.05, 0.1, 0.2]
    """
    retry_schedule: t.List[float] = field(default_factory=lambda: [0.05, 0.1, 0.2])

    """
    The maximum amount of time in seconds a request can take.

    Request methods will raise httpx.TimeoutException if this is exceeded.
    """
    timeout: float = 15.0

    proxy: t.Optional[str] = None


class ClientBase:
    _client: AuthenticatedClient

    def __init__(self, auth_token: str, options: HookSniffOptions = HookSniffOptions()) -> None:
        from .. import __version__

        if len(options.retry_schedule) > 5:
            raise ValueError("number of retries must not exceed 5")

        host = options.server_url or DEFAULT_SERVER_URL
        client = AuthenticatedClient(
            base_url=host,
            token=auth_token,
            headers={"user-agent": f"hooksniff-libs/{__version__}/python"},
            verify_ssl=True,
            retry_schedule=options.retry_schedule,
            timeout=options.timeout,
            follow_redirects=False,
            raise_on_unexpected_status=True,
            proxy=options.proxy,
        )
        self._client = client


class HookSniffAsync(ClientBase):
    @property
    def endpoint(self) -> EndpointAsync:
        return EndpointAsync(self._client)

    @property
    def authentication(self) -> AuthenticationAsync:
        return AuthenticationAsync(self._client)

    @property
    def message(self) -> MessageAsync:
        return MessageAsync(self._client)

    @property
    def api_key(self) -> ApiKeyAsync:
        return ApiKeyAsync(self._client)

    @property
    def team(self) -> TeamAsync:
        return TeamAsync(self._client)

    @property
    def alert(self) -> AlertAsync:
        return AlertAsync(self._client)

    @property
    def analytics(self) -> AnalyticsAsync:
        return AnalyticsAsync(self._client)

    @property
    def billing(self) -> BillingAsync:
        return BillingAsync(self._client)

    @property
    def health(self) -> HealthAsync:
        return HealthAsync(self._client)

    @property
    def search(self) -> SearchAsync:
        return SearchAsync(self._client)

    @property
    def notification(self) -> NotificationAsync:
        return NotificationAsync(self._client)

    @property
    def admin(self) -> AdminAsync:
        return AdminAsync(self._client)


class HookSniff(ClientBase):
    @property
    def endpoint(self) -> Endpoint:
        return Endpoint(self._client)

    @property
    def authentication(self) -> Authentication:
        return Authentication(self._client)

    @property
    def message(self) -> Message:
        return Message(self._client)

    @property
    def api_key(self) -> ApiKey:
        return ApiKey(self._client)

    @property
    def team(self) -> Team:
        return Team(self._client)

    @property
    def alert(self) -> Alert:
        return Alert(self._client)

    @property
    def analytics(self) -> Analytics:
        return Analytics(self._client)

    @property
    def billing(self) -> Billing:
        return Billing(self._client)

    @property
    def health(self) -> Health:
        return Health(self._client)

    @property
    def search(self) -> Search:
        return Search(self._client)

    @property
    def notification(self) -> Notification:
        return Notification(self._client)

    @property
    def admin(self) -> Admin:
        return Admin(self._client)
