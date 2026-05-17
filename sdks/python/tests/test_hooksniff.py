"""
HookSniff SDK — Tests
"""
import pytest
import respx
import httpx

from hooksniff import HookSniff, HookSniffOptions, Webhook, WebhookVerificationError
from hooksniff.models import EndpointIn, MessageIn


@respx.mock
class TestEndpoint:
    def test_list_endpoints(self):
        respx.get("/api/v1/endpoints").mock(
            return_value=httpx.Response(200, json={
                "data": [{"id": "ep_1", "url": "https://example.com", "is_active": True}],
                "done": True,
            })
        )
        hs = HookSniff("test_key", options=HookSniffOptions(server_url="https://api.test.com"))
        result = hs.endpoint.list()
        assert len(result.data) == 1
        assert result.data[0].id == "ep_1"

    def test_create_endpoint(self):
        respx.post("/api/v1/endpoints").mock(
            return_value=httpx.Response(200, json={
                "id": "ep_2",
                "url": "https://new.com",
                "is_active": True,
            })
        )
        hs = HookSniff("test_key", options=HookSniffOptions(server_url="https://api.test.com"))
        result = hs.endpoint.create(EndpointIn(url="https://new.com"))
        assert result.id == "ep_2"
        assert result.url == "https://new.com"

    def test_delete_endpoint(self):
        respx.delete("/api/v1/endpoints/ep_1").mock(
            return_value=httpx.Response(204)
        )
        hs = HookSniff("test_key", options=HookSniffOptions(server_url="https://api.test.com"))
        hs.endpoint.delete("ep_1")  # should not raise


@respx.mock
class TestMessage:
    def test_send_message(self):
        respx.post("/api/v1/messages").mock(
            return_value=httpx.Response(200, json={
                "id": "msg_1",
                "event": "order.created",
                "data": {"order_id": "123"},
            })
        )
        hs = HookSniff("test_key", options=HookSniffOptions(server_url="https://api.test.com"))
        result = hs.message.create(MessageIn(event="order.created", data={"order_id": "123"}))
        assert result.id == "msg_1"
        assert result.event == "order.created"


@respx.mock
class TestAuth:
    def test_register(self):
        respx.post("/api/v1/auth/register").mock(
            return_value=httpx.Response(200, json={
                "access_token": "tok_xxx",
                "refresh_token": "ref_xxx",
                "token_type": "Bearer",
                "expires_in": 3600,
                "user": {"id": "u_1", "email": "test@test.com"},
            })
        )
        hs = HookSniff("test_key", options=HookSniffOptions(server_url="https://api.test.com"))
        result = hs.authentication.register("test@test.com", "password123")
        assert result.access_token == "tok_xxx"


@respx.mock
class TestHealth:
    def test_health_check(self):
        respx.get("/api/v1/health").mock(
            return_value=httpx.Response(200, json={
                "status": "ok",
                "version": "0.5.0",
            })
        )
        hs = HookSniff("test_key", options=HookSniffOptions(server_url="https://api.test.com"))
        result = hs.health.check()
        assert result.status == "ok"


class TestWebhook:
    def test_webhook_verify_missing_headers(self):
        wh = Webhook("whsec_" + "dGVzdHNlY3JldA==" * 2)
        with pytest.raises(WebhookVerificationError):
            wh.verify(b"test", {})
