"""
HookSniff SDK — Tests
"""

import json
import time
import hmac
import hashlib
import base64
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError

import pytest

from hooksniff import HookSniff, Webhook, WebhookVerificationError
from hooksniff.exceptions import (
    ApiException,
    RateLimitError,
    NotFoundException,
    ValidationException,
    UnauthorizedException,
    ServerException,
)
from hooksniff.request import HookSniffRequest, RequestConfig
from hooksniff.pagination import paginate, collect_all


# ─── Webhook Tests ─────────────────────────────────────────────────

class TestWebhook:
    def _make_secret(self) -> bytes:
        return base64.b64encode(b"test-secret-key-for-hmac")

    def _sign(self, raw_secret: bytes, msg_id: str, timestamp: int, body: str) -> str:
        """Sign using the raw (decoded) secret, same as Webhook class."""
        content = f"{msg_id}.{timestamp}.{body}"
        sig = hmac.new(raw_secret, content.encode(), hashlib.sha256).digest()
        return f"v1,{base64.b64encode(sig).decode()}"

    def test_verify_valid_signature(self):
        secret_b64 = self._make_secret()
        raw_secret = base64.b64decode(secret_b64)
        wh = Webhook(f"whsec_{secret_b64.decode()}")
        body = '{"event":"test"}'
        ts = int(time.time())
        msg_id = "msg_123"
        sig = self._sign(raw_secret, msg_id, ts, body)

        result = wh.verify(body, {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        })
        assert result == {"event": "test"}

    def test_verify_svix_headers(self):
        secret_b64 = self._make_secret()
        raw_secret = base64.b64decode(secret_b64)
        wh = Webhook(f"whsec_{secret_b64.decode()}")
        body = '{"event":"test"}'
        ts = int(time.time())
        msg_id = "msg_456"
        sig = self._sign(raw_secret, msg_id, ts, body)

        result = wh.verify(body, {
            "svix-id": msg_id,
            "svix-timestamp": str(ts),
            "svix-signature": sig,
        })
        assert result == {"event": "test"}

    def test_verify_invalid_signature(self):
        secret = self._make_secret()
        wh = Webhook(f"whsec_{secret.decode()}")
        body = '{"event":"test"}'
        ts = int(time.time())

        with pytest.raises(WebhookVerificationError, match="Invalid webhook signature"):
            wh.verify(body, {
                "webhook-id": "msg_123",
                "webhook-timestamp": str(ts),
                "webhook-signature": "v1,invalid",
            })

    def test_verify_expired_timestamp(self):
        secret = self._make_secret()
        wh = Webhook(f"whsec_{secret.decode()}")
        body = '{"event":"test"}'
        ts = int(time.time()) - 600  # 10 minutes ago

        with pytest.raises(WebhookVerificationError, match="too old"):
            wh.verify(body, {
                "webhook-id": "msg_123",
                "webhook-timestamp": str(ts),
                "webhook-signature": "v1,abc",
            })

    def test_verify_missing_headers(self):
        secret = self._make_secret()
        wh = Webhook(f"whsec_{secret.decode()}")

        with pytest.raises(WebhookVerificationError, match="Missing webhook-id"):
            wh.verify("{}", {})

    def test_sign(self):
        secret_b64 = self._make_secret()
        wh = Webhook(f"whsec_{secret_b64.decode()}")
        ts = int(time.time())
        sig = wh.sign("msg_123", ts, '{"event":"test"}')
        assert sig.startswith("v1,")


# ─── Request Tests ─────────────────────────────────────────────────

class TestRequest:
    def test_set_path_param(self):
        req = HookSniffRequest("GET", "/v1/endpoints/{id}")
        req.set_path_param("id", "ep_123")
        assert "/v1/endpoints/ep_123" in req.path

    def test_set_query_params(self):
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.set_query_params({"limit": 10, "is_active": True})
        assert req._query_params["limit"] == "10"
        assert req._query_params["is_active"] == "true"

    def test_set_body(self):
        req = HookSniffRequest("POST", "/v1/endpoints")
        req.set_body({"url": "https://example.com"})
        body = json.loads(req._body)
        assert body["url"] == "https://example.com"

    def test_none_query_params_ignored(self):
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.set_query_params({"limit": None, "iterator": None})
        assert len(req._query_params) == 0


# ─── Pagination Tests ──────────────────────────────────────────────

class TestPagination:
    def test_single_page(self):
        def fetch(**kwargs):
            return {"data": [{"id": "1"}, {"id": "2"}], "done": True}

        items = list(paginate(fetch))
        assert len(items) == 2
        assert items[0]["id"] == "1"

    def test_multi_page(self):
        call_count = 0

        def fetch(**kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return {"data": [{"id": "1"}], "iterator": "abc"}
            return {"data": [{"id": "2"}], "done": True}

        items = list(paginate(fetch))
        assert len(items) == 2
        assert call_count == 2

    def test_empty_response(self):
        def fetch(**kwargs):
            return {"data": []}

        items = list(paginate(fetch))
        assert len(items) == 0

    def test_collect_all(self):
        def fetch(**kwargs):
            return {"data": [{"id": "1"}, {"id": "2"}], "done": True}

        items = collect_all(fetch)
        assert len(items) == 2


# ─── Client Tests ──────────────────────────────────────────────────

class TestClient:
    def test_initialization(self):
        hs = HookSniff(api_key="hooksniff_test")
        assert hs._config.token == "hooksniff_test"
        assert hs._config.num_retries == 2
        assert hs._config.timeout == 30.0

    def test_custom_config(self):
        hs = HookSniff(
            api_key="hooksniff_test",
            server_url="https://custom.api.com",
            timeout=60,
            num_retries=5,
            debug=True,
        )
        assert hs._config.base_url == "https://custom.api.com"
        assert hs._config.timeout == 60
        assert hs._config.num_retries == 5
        assert hs._config.debug is True

    def test_resources_exist(self):
        hs = HookSniff(api_key="hooksniff_test")
        assert hasattr(hs, "endpoints")
        assert hasattr(hs, "webhooks")
        assert hasattr(hs, "auth")
        assert hasattr(hs, "api_keys")
        assert hasattr(hs, "teams")
        assert hasattr(hs, "alerts")
        assert hasattr(hs, "analytics")
        assert hasattr(hs, "billing")
        assert hasattr(hs, "health")
        assert hasattr(hs, "search")
        assert hasattr(hs, "notifications")
        assert hasattr(hs, "admin")


# ─── Error Handling Tests ──────────────────────────────────────────

class TestExceptions:
    def test_api_exception(self):
        e = ApiException(400, {"code": "bad_request"}, {"x-request-id": "123"})
        assert e.status_code == 400
        assert e.body == {"code": "bad_request"}
        assert "400" in str(e)

    def test_rate_limit_error(self):
        e = RateLimitError(
            retry_after=30.0,
            status_code=429, body={"message": "rate limited"}, headers={}
        )
        assert e.retry_after == 30.0
        assert e.status_code == 429
