# Adapted from Svix SDK for HookSniff

import typing as t
from dataclasses import dataclass, field

from .authentication import Authentication, AuthenticationAsync
from .client import AuthenticatedClient
from .endpoint import Endpoint, EndpointAsync
from .environment import Environment, EnvironmentAsync
from .event_type import EventType, EventTypeAsync
from .message import Message, MessageAsync
from .message_attempt import MessageAttempt, MessageAttemptAsync
from .statistics import Statistics, StatisticsAsync

DEFAULT_SERVER_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app"


@dataclass
class HookSniffOptions:
    debug: bool = False
    server_url: t.Optional[str] = None
    retry_schedule: t.List[float] = field(default_factory=lambda: [0.05, 0.1, 0.2])
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
    def authentication(self) -> AuthenticationAsync:
        return AuthenticationAsync(self._client)

    @property
    def endpoint(self) -> EndpointAsync:
        return EndpointAsync(self._client)

    @property
    def environment(self) -> EnvironmentAsync:
        return EnvironmentAsync(self._client)

    @property
    def event_type(self) -> EventTypeAsync:
        return EventTypeAsync(self._client)

    @property
    def message(self) -> MessageAsync:
        return MessageAsync(self._client)

    @property
    def message_attempt(self) -> MessageAttemptAsync:
        return MessageAttemptAsync(self._client)

    @property
    def statistics(self) -> StatisticsAsync:
        return StatisticsAsync(self._client)


class HookSniff(ClientBase):
    @property
    def authentication(self) -> Authentication:
        return Authentication(self._client)

    @property
    def endpoint(self) -> Endpoint:
        return Endpoint(self._client)

    @property
    def environment(self) -> Environment:
        return Environment(self._client)

    @property
    def event_type(self) -> EventType:
        return EventType(self._client)

    @property
    def message(self) -> Message:
        return Message(self._client)

    @property
    def message_attempt(self) -> MessageAttempt:
        return MessageAttempt(self._client)

    @property
    def statistics(self) -> Statistics:
        return Statistics(self._client)
