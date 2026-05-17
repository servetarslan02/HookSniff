import itertools
import uuid
from typing import Any, Dict, List, Optional

import pytest
from pytest_httpserver import HTTPServer
from werkzeug import Request, Response

from hooksniff.api import (
    ApplicationIn,
    ApplicationOut,
    EndpointIn,
    EndpointOut,
    EventTypeIn,
    EventTypeOut,
    MessageIn,
    HookSniff,
)
from hooksniff.webhooks import Webhook


def _gen_uuid(name: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, name))


@pytest.fixture
def hooksniff_app_name() -> str:
    return "hooksniff_python_tests"


@pytest.fixture
def event_type_schema() -> Dict[str, Any]:
    return {
        "type": "object",
        "title": "event.test",
        "description": "A dummy event type",
        "properties": {
            "value": {
                "type": "string",
                "description": "A simple string value",
            }
        },
        "required": ["value"],
    }


@pytest.fixture
def endpoint_url() -> str:
    return "http://localhost/webhook/receiver"


def create_hooksniff_app(
    hooksniff_api: HookSniff, hooksniff_app_name: str, hooksniff_app_uid: str
) -> ApplicationOut:
    return hooksniff_api.application.get_or_create(
        ApplicationIn(name=hooksniff_app_name, uid=hooksniff_app_uid)
    )


def create_hooksniff_event_type(
    hooksniff_api: HookSniff, event_type_schema: Dict[str, Any]
) -> EventTypeOut:
    return hooksniff_api.event_type.create(
        EventTypeIn(
            name=event_type_schema["title"],
            description=event_type_schema["description"],
            schemas={"1": event_type_schema},
        )
    )


def create_hooksniff_endpoint(
    hooksniff_api: HookSniff,
    app_uid: str,
    event_type_name: str,
    endpoint_url: str,
    endpoint_uid: str,
    channel: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    secret: Optional[str] = None,
) -> EndpointOut:
    return hooksniff_api.endpoint.create(
        app_uid,
        EndpointIn(
            url=endpoint_url,
            uid=endpoint_uid,
            version=1,
            filter_types=[event_type_name],
            channels=[channel] if channel else None,
            metadata=metadata,
            secret=secret,
        ),
    )


def test_hooksniff_application_create(hooksniff_api: HookSniff, hooksniff_app_name: str) -> None:
    hooksniff_app_uid = _gen_uuid(hooksniff_app_name)
    app = create_hooksniff_app(hooksniff_api, hooksniff_app_name, hooksniff_app_uid)
    assert app.name == hooksniff_app_name
    assert app.uid == hooksniff_app_uid


def test_hooksniff_event_type_create(
    hooksniff_api: HookSniff, event_type_schema: Dict[str, Any]
) -> None:
    event_type = create_hooksniff_event_type(hooksniff_api, event_type_schema)
    assert event_type.name == event_type_schema["title"]
    assert event_type.description == event_type_schema["description"]
    assert event_type.schemas == {"1": event_type_schema}


def hooksniff_endpoint_create_test_params_ids() -> List[str]:
    ids = []
    for params in itertools.product([False, True], repeat=3):
        with_channel, with_metadata, with_secret = params
        ids.append(
            "/".join(
                [
                    ("with" if with_channel else "without") + " channel",
                    ("with" if with_metadata else "without") + " metadata",
                    ("with" if with_secret else "without") + " secret",
                ]
            )
        )
    return ids


@pytest.mark.parametrize(
    "with_channel,with_metadata,with_secret",
    list(itertools.product([False, True], repeat=3)),
    ids=hooksniff_endpoint_create_test_params_ids(),
)
def test_hooksniff_endpoint_create(
    hooksniff_api: HookSniff,
    hooksniff_app_name: str,
    event_type_schema: Dict[str, Any],
    endpoint_url: str,
    with_channel: bool,
    with_metadata: bool,
    with_secret: bool,
) -> None:
    hooksniff_app_uid = _gen_uuid(hooksniff_app_name)
    app = create_hooksniff_app(hooksniff_api, hooksniff_app_name, hooksniff_app_uid)
    event_type = create_hooksniff_event_type(hooksniff_api, event_type_schema)
    endpoint_uid = _gen_uuid(endpoint_url)
    channel = "test" if with_channel else None
    metadata = {"test": "test"} if with_metadata else None
    secret = "whsec_" + "e" * 32 if with_secret else None
    assert app.uid
    endpoint = create_hooksniff_endpoint(
        hooksniff_api,
        app.uid,
        event_type.name,
        endpoint_url,
        endpoint_uid,
        channel,
        metadata,
        secret,
    )
    assert endpoint.url == endpoint_url
    assert endpoint.uid == endpoint_uid
    assert endpoint.filter_types == [event_type.name]
    if with_channel:
        assert endpoint.channels == [channel]
    if with_metadata:
        assert endpoint.metadata == metadata
    if with_secret:
        assert hooksniff_api.endpoint.get_secret(app.uid, endpoint_uid).key == secret


@pytest.mark.parametrize(
    "with_channel", [False, True], ids=["without channel", "with channel"]
)
def test_hooksniff_message_create(
    hooksniff_api: HookSniff,
    hooksniff_app_name: str,
    event_type_schema: Dict[str, Any],
    httpserver: HTTPServer,
    with_channel: bool,
) -> None:
    hooksniff_app_uid = _gen_uuid(hooksniff_app_name)
    create_hooksniff_app(hooksniff_api, hooksniff_app_name, hooksniff_app_uid)
    event_type = create_hooksniff_event_type(hooksniff_api, event_type_schema)

    channel = "test" if with_channel else None
    endpoint_path = "/webhook/receiver/"
    endpoint_url = httpserver.url_for(endpoint_path)
    endpoint_uid = _gen_uuid(endpoint_url)
    create_hooksniff_endpoint(
        hooksniff_api,
        hooksniff_app_uid,
        event_type.name,
        endpoint_url,
        endpoint_uid,
        channel=channel,
    )
    secret = hooksniff_api.endpoint.get_secret(hooksniff_app_uid, endpoint_uid).key

    payload = {"value": "test"}

    def webhook_handler(request: Request) -> Response:
        assert "HookSniff-Id" in request.headers
        assert "HookSniff-Timestamp" in request.headers
        assert "HookSniff-Signature" in request.headers

        webhook = Webhook(secret)
        headers: dict[str, str] = dict(request.headers.items())
        received_payload = webhook.verify(request.data, headers)
        assert received_payload == payload

        return Response("OK")

    httpserver.expect_oneshot_request(
        endpoint_path,
        method="POST",
        json=payload,
    ).respond_with_handler(webhook_handler)

    # send message and check it is received by local http server
    with httpserver.wait() as waiting:
        message_out = hooksniff_api.message.create(
            hooksniff_app_uid,
            MessageIn(
                event_type=event_type.name,
                payload=payload,
                channels=[channel] if channel else None,
            ),
        )

    assert waiting.result

    httpserver.check()  # type: ignore[no-untyped-call]

    assert message_out.event_type == event_type.name
    assert message_out.event_type == event_type.name
    if with_channel:
        assert message_out.channels == [channel]
