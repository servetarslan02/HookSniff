"""
HookSniff Python SDK — Comprehensive Unit Tests

Tests cover:
1. Webhook signature verification (14 tests)
2. Model serialization/deserialization (30+ tests)
3. Request helper (15 tests)
4. Client initialization (5 tests)
5. Pagination (10 tests)

Run: python -m pytest test/ -v
"""

import json
import time
import hmac
import hashlib
import base64
import unittest
from unittest.mock import patch, MagicMock
from typing import Any, Dict

# === Webhook Tests ===
from hooksniff.webhook import (
    Webhook,
    WebhookVerificationError,
    _decode_secret,
    _build_signed_content,
    _sign,
    _verify_signature,
)


def _make_signature(secret: bytes, msg_id: str, timestamp: int, body: str) -> str:
    """Helper: create a valid webhook signature."""
    content = f"{msg_id}.{timestamp}.{body}"
    h = hmac.new(secret, content.encode("utf-8"), hashlib.sha256).digest()
    return f"v1,{base64.b64encode(h).decode('utf-8')}"


def _make_headers(msg_id: str, timestamp: int, signature: str) -> Dict[str, str]:
    """Helper: create webhook headers."""
    return {
        "webhook-id": msg_id,
        "webhook-timestamp": str(timestamp),
        "webhook-signature": signature,
    }


class TestWebhookVerification(unittest.TestCase):
    """Webhook signature verification tests."""

    def setUp(self):
        self.secret_raw = base64.b64encode(b"test-secret-key-1234").decode()
        self.secret = f"whsec_{self.secret_raw}"
        self.wh = Webhook(self.secret)
        self.msg_id = "msg_123"
        self.timestamp = int(time.time())
        self.body = '{"event":"test","data":{}}'

    def test_verify_valid_signature(self):
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, self.body)
        headers = _make_headers(self.msg_id, self.timestamp, sig)
        result = self.wh.verify(self.body, headers)
        self.assertEqual(result["event"], "test")

    def test_verify_returns_parsed_json(self):
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, self.body)
        headers = _make_headers(self.msg_id, self.timestamp, sig)
        result = self.wh.verify(self.body, headers)
        self.assertIsInstance(result, dict)

    def test_verify_bytes_payload(self):
        body_bytes = self.body.encode("utf-8")
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, self.body)
        headers = _make_headers(self.msg_id, self.timestamp, sig)
        result = self.wh.verify(body_bytes, headers)
        self.assertEqual(result["event"], "test")

    def test_verify_invalid_signature_raises(self):
        headers = _make_headers(self.msg_id, self.timestamp, "v1,invalid_signature")
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_missing_id_header_raises(self):
        headers = {
            "webhook-timestamp": str(self.timestamp),
            "webhook-signature": "v1,sig",
        }
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_missing_timestamp_header_raises(self):
        headers = {
            "webhook-id": self.msg_id,
            "webhook-signature": "v1,sig",
        }
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_missing_signature_header_raises(self):
        headers = {
            "webhook-id": self.msg_id,
            "webhook-timestamp": str(self.timestamp),
        }
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_expired_timestamp_raises(self):
        old_ts = self.timestamp - 600  # 10 minutes ago
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, old_ts, self.body)
        headers = _make_headers(self.msg_id, old_ts, sig)
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_future_timestamp_raises(self):
        future_ts = self.timestamp + 600  # 10 minutes in future
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, future_ts, self.body)
        headers = _make_headers(self.msg_id, future_ts, sig)
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_invalid_timestamp_raises(self):
        headers = _make_headers(self.msg_id, 0, "v1,sig")
        headers["webhook-timestamp"] = "not_a_number"
        with self.assertRaises(WebhookVerificationError):
            self.wh.verify(self.body, headers)

    def test_verify_svix_headers(self):
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, self.body)
        headers = {
            "svix-id": self.msg_id,
            "svix-timestamp": str(self.timestamp),
            "svix-signature": sig,
        }
        result = self.wh.verify(self.body, headers)
        self.assertEqual(result["event"], "test")

    def test_verify_case_insensitive_headers(self):
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, self.body)
        headers = {
            "Webhook-Id": self.msg_id,
            "Webhook-Timestamp": str(self.timestamp),
            "Webhook-Signature": sig,
        }
        result = self.wh.verify(self.body, headers)
        self.assertEqual(result["event"], "test")

    def test_verify_multiple_signatures(self):
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, self.body)
        multi_sig = f"v1,other_sig,{sig.split(',')[1]}"
        headers = _make_headers(self.msg_id, self.timestamp, multi_sig)
        result = self.wh.verify(self.body, headers)
        self.assertEqual(result["event"], "test")

    def test_verify_non_json_payload_returns_string(self):
        body = "not json"
        sig = _make_signature(base64.b64decode(self.secret_raw), self.msg_id, self.timestamp, body)
        headers = _make_headers(self.msg_id, self.timestamp, sig)
        result = self.wh.verify(body, headers)
        self.assertEqual(result, "not json")


class TestWebhookSign(unittest.TestCase):
    """Webhook signing tests."""

    def test_sign_produces_valid_signature(self):
        secret = base64.b64encode(b"test-secret")
        wh = Webhook(f"whsec_{secret.decode()}")
        sig = wh.sign("msg_1", 1234567890, '{"test":true}')
        self.assertTrue(sig.startswith("v1,"))

    def test_sign_roundtrip(self):
        secret = base64.b64encode(b"test-secret")
        wh = Webhook(f"whsec_{secret.decode()}")
        ts = int(time.time())
        body = '{"event":"test"}'
        sig = wh.sign("msg_1", ts, body)
        headers = {"webhook-id": "msg_1", "webhook-timestamp": str(ts), "webhook-signature": sig}
        result = wh.verify(body, headers)
        self.assertEqual(result["event"], "test")


class TestDecodeSecret(unittest.TestCase):
    """Secret decoding tests."""

    def test_decode_whsec_prefix(self):
        raw = base64.b64encode(b"secret").decode()
        result = _decode_secret(f"whsec_{raw}")
        self.assertEqual(result, b"secret")

    def test_decode_raw_bytes(self):
        result = _decode_secret(b"raw-bytes")
        self.assertEqual(result, b"raw-bytes")

    def test_decode_base64_no_prefix(self):
        raw = base64.b64encode(b"secret").decode()
        result = _decode_secret(raw)
        self.assertEqual(result, b"secret")

    def test_decode_plain_string(self):
        result = _decode_secret("plain-string")
        self.assertIsInstance(result, bytes)


class TestStandaloneVerifySignature(unittest.TestCase):
    """Test the standalone verify_signature function."""

    def test_standalone_verify_works(self):
        from hooksniff.webhook import verify_signature as standalone_verify

        secret_raw = base64.b64encode(b"test-secret-key-1234").decode()
        secret = f"whsec_{secret_raw}"
        msg_id = "msg_standalone"
        timestamp = int(time.time())
        body = '{"event":"standalone_test"}'

        sig = _make_signature(base64.b64decode(secret_raw), msg_id, timestamp, body)
        headers = _make_headers(msg_id, timestamp, sig)

        result = standalone_verify(body, headers, secret)
        self.assertEqual(result["event"], "standalone_test")


# === Serialization Tests ===
from hooksniff.models.endpoint import Endpoint
from hooksniff.models.retry_policy import RetryPolicy
from hooksniff.models.delivery import Delivery
from hooksniff.models.delivery_list_response import DeliveryListResponse
from hooksniff.serialization import _to_json_static, _from_json_static, SerializationError


class TestEndpointSerialization(unittest.TestCase):
    """Endpoint model serialization tests."""

    def _make_endpoint_dict(self) -> Dict[str, Any]:
        return {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "url": "https://example.com/webhook",
            "description": "Test endpoint",
            "is_active": True,
            "retry_policy": {"max_attempts": 3, "backoff": "exponential", "initial_delay_secs": 10, "max_delay_secs": 3600},
            "created_at": "2026-01-01T00:00:00Z",
            "allowed_ips": None,
            "event_filter": None,
            "custom_headers": None,
            "routing_strategy": "round-robin",
            "fallback_url": None,
            "avg_response_ms": 150,
            "failure_streak": 0,
            "format": "standard",
        }

    def test_from_json_valid(self):
        data = self._make_endpoint_dict()
        ep = Endpoint._from_json(data)
        self.assertEqual(str(ep.id), "550e8400-e29b-41d4-a716-446655440000")
        self.assertEqual(ep.url, "https://example.com/webhook")
        self.assertTrue(ep.is_active)
        # Verify retry_policy is correctly deserialized
        self.assertEqual(ep.retry_policy.max_attempts, 3)
        self.assertEqual(ep.retry_policy.backoff, "exponential")
        self.assertEqual(ep.retry_policy.initial_delay_secs, 10)
        self.assertEqual(ep.retry_policy.max_delay_secs, 3600)

    def test_to_json_valid(self):
        data = self._make_endpoint_dict()
        result = Endpoint._to_json(data)
        self.assertIn("id", result)
        self.assertIn("url", result)

    def test_to_json_strips_extra_fields(self):
        data = self._make_endpoint_dict()
        data["unknown_field"] = "should be stripped"
        result = Endpoint._to_json(data)
        self.assertNotIn("unknown_field", result)

    def test_from_json_missing_required_raises(self):
        data = {"url": "https://example.com"}  # missing id, is_active, etc.
        with self.assertRaises((SerializationError, Exception)):
            Endpoint._from_json(data)

    def test_roundtrip(self):
        data = self._make_endpoint_dict()
        ep = Endpoint._from_json(data)
        as_dict = ep.to_dict()
        self.assertEqual(as_dict["url"], data["url"])

    def test_from_json_with_optional_fields(self):
        data = self._make_endpoint_dict()
        data["description"] = "Updated desc"
        data["allowed_ips"] = ["192.168.1.0/24"]
        ep = Endpoint._from_json(data)
        self.assertEqual(ep.description, "Updated desc")
        self.assertIn("192.168.1.0/24", ep.allowed_ips)

    def test_routing_strategy_enum_validation(self):
        data = self._make_endpoint_dict()
        data["routing_strategy"] = "invalid"
        with self.assertRaises(Exception):
            Endpoint._from_json(data)

    def test_format_enum_validation(self):
        data = self._make_endpoint_dict()
        data["format"] = "invalid"
        with self.assertRaises(Exception):
            Endpoint._from_json(data)

    def test_valid_routing_strategies(self):
        for strategy in ["round-robin", "latency", "failover"]:
            data = self._make_endpoint_dict()
            data["routing_strategy"] = strategy
            ep = Endpoint._from_json(data)
            self.assertEqual(ep.routing_strategy, strategy)

    def test_valid_formats(self):
        for fmt in ["standard", "cloudevents"]:
            data = self._make_endpoint_dict()
            data["format"] = fmt
            ep = Endpoint._from_json(data)
            self.assertEqual(ep.format, fmt)


class TestDeliverySerialization(unittest.TestCase):
    """Delivery model serialization tests."""

    def _make_delivery_dict(self) -> Dict[str, Any]:
        return {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "endpoint_id": "550e8400-e29b-41d4-a716-446655440002",
            "event": "order.created",
            "status": "delivered",
            "attempt_count": 1,
            "response_status": 200,
            "replay_count": 0,
            "created_at": "2026-01-01T00:00:00Z",
        }

    def test_from_json_valid(self):
        data = self._make_delivery_dict()
        d = Delivery._from_json(data)
        self.assertEqual(str(d.id), "550e8400-e29b-41d4-a716-446655440001")
        self.assertEqual(d.event, "order.created")

    def test_to_json_valid(self):
        data = self._make_delivery_dict()
        result = Delivery._to_json(data)
        self.assertIn("id", result)
        self.assertIn("event", result)


class TestRetryPolicySerialization(unittest.TestCase):
    """RetryPolicy model tests."""

    def test_from_json(self):
        data = {"max_attempts": 5, "backoff": "exponential", "initial_delay_secs": 10, "max_delay_secs": 3600}
        rp = RetryPolicy._from_json(data)
        self.assertEqual(rp.max_attempts, 5)
        self.assertEqual(rp.backoff, "exponential")
        self.assertEqual(rp.initial_delay_secs, 10)
        self.assertEqual(rp.max_delay_secs, 3600)


class TestDeliveryListResponseSerialization(unittest.TestCase):
    """DeliveryListResponse tests."""

    def test_from_json_with_data(self):
        data = {
            "deliveries": [
                {"id": "550e8400-e29b-41d4-a716-446655440001",
                 "endpoint_id": "550e8400-e29b-41d4-a716-446655440002",
                 "event": "test", "status": "delivered",
                 "attempt_count": 1, "response_status": 200,
                 "replay_count": 0, "created_at": "2026-01-01T00:00:00Z"}
            ],
            "total": 1,
            "page": 1,
            "per_page": 50,
        }
        resp = DeliveryListResponse._from_json(data)
        self.assertEqual(len(resp.deliveries), 1)
        self.assertEqual(resp.total, 1)


# === Request Helper Tests ===
from hooksniff.request import (
    HookSniffRequest,
    HookSniffRequestContext,
    ApiException,
    USER_AGENT,
)


class TestHookSniffRequest(unittest.TestCase):
    """HTTP request builder tests."""

    def test_path_param_replacement(self):
        req = HookSniffRequest("GET", "/v1/endpoints/{id}")
        req.set_path_param("id", "ep_123")
        self.assertIn("ep_123", req.path)
        self.assertNotIn("{id}", req.path)

    def test_path_param_encoding(self):
        req = HookSniffRequest("GET", "/v1/endpoints/{id}")
        req.set_path_param("id", "ep/123?test")
        self.assertIn("ep%2F123%3Ftest", req.path)

    def test_query_params(self):
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.set_query_params({"limit": 10, "offset": 0, "None_val": None})
        self.assertEqual(req._query_params["limit"], "10")
        self.assertEqual(req._query_params["offset"], "0")
        self.assertNotIn("None_val", req._query_params)

    def test_header_param(self):
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.set_header_param("X-Custom", "value")
        self.assertEqual(req._header_params["X-Custom"], "value")

    def test_header_param_none_ignored(self):
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.set_header_param("X-None", None)
        self.assertNotIn("X-None", req._header_params)

    def test_body_serialization(self):
        req = HookSniffRequest("POST", "/v1/endpoints")
        req.set_body({"url": "https://example.com"})
        self.assertIn("example.com", req._body)

    def test_user_agent_format(self):
        self.assertIn("hooksniff-sdk", USER_AGENT)
        self.assertIn("python", USER_AGENT)


class TestApiException(unittest.TestCase):
    """ApiException tests."""

    def test_creation(self):
        exc = ApiException(404, {"error": "not found"}, {"X-Req": "abc"})
        self.assertEqual(exc.code, 404)
        self.assertEqual(exc.body, {"error": "not found"})
        self.assertIn("404", str(exc))

    def test_headers_default(self):
        exc = ApiException(500, "error")
        self.assertEqual(exc.headers, {})


class TestHookSniffRequestSend(unittest.TestCase):
    """Request send tests with mocked HTTP."""

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_success(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b'{"id":"ep_1"}'
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "test-key")
        req = HookSniffRequest("GET", "/v1/endpoints")
        result = req.send(ctx)
        self.assertEqual(result["id"], "ep_1")

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_204_returns_none(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 204
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "test-key")
        req = HookSniffRequest("DELETE", "/v1/endpoints/1")
        result = req.send(ctx)
        self.assertIsNone(result)

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_401_raises_api_exception(self, mock_urlopen):
        import urllib.error

        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"error":"unauthorized"}'
        mock_resp.headers = {}
        err = urllib.error.HTTPError("https://api.test.com", 401, "Unauthorized", {}, mock_resp)
        mock_urlopen.side_effect = err

        ctx = HookSniffRequestContext("https://api.test.com", "bad-key")
        req = HookSniffRequest("GET", "/v1/endpoints")
        with self.assertRaises(ApiException) as cm:
            req.send(ctx)
        self.assertEqual(cm.exception.code, 401)

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_500_retries(self, mock_urlopen):
        import urllib.error

        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"error":"server error"}'
        mock_resp.headers = {}
        err = urllib.error.HTTPError("https://api.test.com", 500, "Internal Error", {}, mock_resp)
        mock_urlopen.side_effect = err

        ctx = HookSniffRequestContext("https://api.test.com", "test-key", num_retries=2)
        req = HookSniffRequest("GET", "/v1/endpoints")
        with self.assertRaises(ApiException):
            req.send(ctx)
        self.assertEqual(mock_urlopen.call_count, 3)  # initial + 2 retries

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_adds_idempotency_key_for_post(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b'{"id":"1"}'
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "test-key")
        req = HookSniffRequest("POST", "/v1/endpoints")
        req.set_body({"url": "https://example.com"})
        req.send(ctx)

        call_args = mock_urlopen.call_args
        req_obj = call_args[0][0]
        # urllib capitalizes header keys
        self.assertIn("Idempotency-key", req_obj.headers)

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_custom_idempotency_key(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b'{"id":"1"}'
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "test-key")
        req = HookSniffRequest("POST", "/v1/endpoints")
        req.set_header_param("idempotency-key", "custom-key")
        req.set_body({"url": "https://example.com"})
        req.send(ctx)

        call_args = mock_urlopen.call_args
        req_obj = call_args[0][0]
        # urllib capitalizes header keys
        self.assertEqual(req_obj.headers["Idempotency-key"], "custom-key")

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_sets_auth_header(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b'[]'
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "my-api-key")
        req = HookSniffRequest("GET", "/v1/endpoints")
        req.send(ctx)

        call_args = mock_urlopen.call_args
        req_obj = call_args[0][0]
        self.assertEqual(req_obj.headers["Authorization"], "Bearer my-api-key")

    def test_send_void_calls_send(self):
        with patch.object(HookSniffRequest, "_send_with_retry") as mock_send:
            mock_resp = MagicMock()
            mock_resp.read.return_value = b""
            mock_send.return_value = mock_resp

            ctx = HookSniffRequestContext("https://api.test.com", "test-key")
            req = HookSniffRequest("DELETE", "/v1/endpoints/1")
            req.send_void(ctx)
            mock_send.assert_called_once()

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_empty_body_with_parser_raises(self, mock_urlopen):
        """Empty response body with parser should raise ApiException."""
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b""
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "test-key")
        req = HookSniffRequest("GET", "/v1/endpoints")
        # No parser = returns raw, but empty body with parser raises
        # Actually send() just does json.loads("") which raises JSONDecodeError
        with self.assertRaises(Exception):
            req.send(ctx, parser=lambda x: x)

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_500_error_body_is_parsed(self, mock_urlopen):
        """5xx error body should be parsed as JSON when possible."""
        import urllib.error

        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"error":"internal","code":"DB_ERROR"}'
        mock_resp.headers = {"X-Req": "abc"}
        err = urllib.error.HTTPError("https://api.test.com", 503, "Service Unavailable", {}, mock_resp)
        mock_urlopen.side_effect = err

        ctx = HookSniffRequestContext("https://api.test.com", "test-key", num_retries=0)
        req = HookSniffRequest("GET", "/v1/endpoints")
        with self.assertRaises(ApiException) as cm:
            req.send(ctx)
        self.assertEqual(cm.exception.code, 503)
        self.assertEqual(cm.exception.body["error"], "internal")

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_non_json_error_body(self, mock_urlopen):
        """Non-JSON error body should be stored as string."""
        import urllib.error

        mock_resp = MagicMock()
        mock_resp.read.return_value = b"Service Temporarily Unavailable"
        mock_resp.headers = {}
        err = urllib.error.HTTPError("https://api.test.com", 502, "Bad Gateway", {}, mock_resp)
        mock_urlopen.side_effect = err

        ctx = HookSniffRequestContext("https://api.test.com", "test-key", num_retries=0)
        req = HookSniffRequest("GET", "/v1/endpoints")
        with self.assertRaises(ApiException) as cm:
            req.send(ctx)
        self.assertEqual(cm.exception.code, 502)
        self.assertIsInstance(cm.exception.body, str)

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_send_empty_body_no_parser_returns_none(self, mock_urlopen):
        """Empty response body without parser should return None (not crash)."""
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = b""
        mock_resp.headers = {}
        mock_urlopen.return_value = mock_resp

        ctx = HookSniffRequestContext("https://api.test.com", "test-key")
        req = HookSniffRequest("GET", "/v1/endpoints")
        result = req.send(ctx)
        self.assertIsNone(result)


# === Client Tests ===
from hooksniff.client import HookSniff


class TestHookSniffClient(unittest.TestCase):
    """Client initialization tests."""

    def test_client_creation(self):
        hs = HookSniff(api_key="test-key")
        self.assertIsNotNone(hs.endpoints)
        self.assertIsNotNone(hs.webhooks)
        self.assertIsNotNone(hs.auth)
        self.assertIsNotNone(hs.analytics)
        self.assertIsNotNone(hs.api_keys)
        self.assertIsNotNone(hs.alerts)
        self.assertIsNotNone(hs.teams)
        self.assertIsNotNone(hs.search)
        self.assertIsNotNone(hs.billing)
        self.assertIsNotNone(hs.health)

    def test_client_requires_api_key(self):
        with self.assertRaises(ValueError):
            HookSniff(api_key="")

    def test_client_custom_base_url(self):
        hs = HookSniff(api_key="test", base_url="https://custom.api.com")
        self.assertEqual(hs._ctx.base_url, "https://custom.api.com")

    def test_client_trailing_slash_stripped(self):
        hs = HookSniff(api_key="test", base_url="https://api.com/")
        self.assertEqual(hs._ctx.base_url, "https://api.com")

    def test_client_default_timeout(self):
        hs = HookSniff(api_key="test")
        self.assertEqual(hs._ctx.timeout, 30000)

    def test_client_custom_timeout(self):
        hs = HookSniff(api_key="test", timeout=5000)
        self.assertEqual(hs._ctx.timeout, 5000)

    def test_client_default_retries(self):
        hs = HookSniff(api_key="test")
        self.assertEqual(hs._ctx.num_retries, 2)


# === Pagination Tests ===
from hooksniff.pagination import paginate, collect_all, Page


class TestPagination(unittest.TestCase):
    """Pagination utility tests."""

    def test_single_page(self):
        def fetch(limit, offset):
            return Page(data=[1, 2, 3], has_more=False)

        result = list(paginate(fetch))
        self.assertEqual(result, [1, 2, 3])

    def test_multiple_pages(self):
        pages = [
            Page(data=[1, 2], has_more=True),
            Page(data=[3, 4], has_more=True),
            Page(data=[5], has_more=False),
        ]
        call_count = [0]

        def fetch(limit, offset):
            idx = call_count[0]
            call_count[0] += 1
            return pages[idx]

        result = list(paginate(fetch, limit=2))
        self.assertEqual(result, [1, 2, 3, 4, 5])
        self.assertEqual(call_count[0], 3)

    def test_empty_result(self):
        def fetch(limit, offset):
            return Page(data=[], has_more=False)

        result = list(paginate(fetch))
        self.assertEqual(result, [])

    def test_collect_all(self):
        pages = [
            Page(data=["a", "b"], has_more=True),
            Page(data=["c"], has_more=False),
        ]
        call_count = [0]

        def fetch(limit, offset):
            idx = call_count[0]
            call_count[0] += 1
            return pages[idx]

        result = collect_all(fetch, limit=2)
        self.assertEqual(result, ["a", "b", "c"])

    def test_max_pages_limit(self):
        call_count = [0]

        def fetch(limit, offset):
            call_count[0] += 1
            return Page(data=[1], has_more=True)  # always has more

        result = list(paginate(fetch, max_pages=3))
        self.assertEqual(len(result), 3)
        self.assertEqual(call_count[0], 3)

    def test_offset_increments(self):
        offsets = []

        def fetch(limit, offset):
            offsets.append(offset)
            if offset >= 4:
                return Page(data=[offset], has_more=False)
            return Page(data=[offset], has_more=True)

        list(paginate(fetch, limit=2))
        # Each page has 1 item → offset advances by 1 each time
        # Stops when fetch returns has_more=False at offset=4
        self.assertEqual(offsets, [0, 1, 2, 3, 4])

    def test_empty_page_stops_iteration(self):
        """Empty page with has_more=True should stop (safety against infinite loop)."""
        call_count = [0]

        def fetch(limit, offset):
            call_count[0] += 1
            return Page(data=[], has_more=True)  # empty but says has_more

        result = list(paginate(fetch))
        self.assertEqual(result, [])
        self.assertEqual(call_count[0], 1)  # only called once, then stopped

    def test_custom_limit(self):
        def fetch(limit, offset):
            self.assertEqual(limit, 25)
            return Page(data=[], has_more=False)

        list(paginate(fetch, limit=25))

    def test_page_data_class(self):
        page = Page(data=[1, 2, 3], has_more=True)
        self.assertEqual(page.data, [1, 2, 3])
        self.assertTrue(page.has_more)

    def test_pagination_with_dict_items(self):
        items = [{"id": i, "name": f"item_{i}"} for i in range(5)]

        def fetch(limit, offset):
            chunk = items[offset : offset + limit]
            return Page(data=chunk, has_more=offset + limit < len(items))

        result = list(paginate(fetch, limit=2))
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0]["id"], 0)

    def test_pagination_generator_protocol(self):
        def fetch(limit, offset):
            return Page(data=[], has_more=False)

        gen = paginate(fetch)
        self.assertTrue(hasattr(gen, "__iter__"))
        self.assertTrue(hasattr(gen, "__next__"))


# === Resource Tests (Mocked) ===
from hooksniff.resources.endpoints import Endpoints as EndpointsResource


class TestEndpointsResource(unittest.TestCase):
    """Endpoints resource tests with mocked HTTP."""

    def _make_ctx(self):
        return HookSniffRequestContext("https://api.test.com", "test-key")

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_list_calls_correct_path(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({
            "data": [],
            "total": 0,
            "has_more": False,
        }).encode()
        mock_urlopen.return_value = mock_resp

        ctx = self._make_ctx()
        resource = EndpointsResource(ctx)
        resource.list()

        call_args = mock_urlopen.call_args
        req = call_args[0][0]
        self.assertIn("/v1/endpoints", req.get_full_url())

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_get_sets_path_param(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "url": "https://example.com",
            "is_active": True,
            "retry_policy": {"max_attempts": 3, "backoff": "exponential", "initial_delay_secs": 10, "max_delay_secs": 3600},
            "created_at": "2026-01-01T00:00:00Z",
            "routing_strategy": "round-robin",
            "avg_response_ms": 100,
            "failure_streak": 0,
            "format": "standard",
        }).encode()
        mock_urlopen.return_value = mock_resp

        ctx = self._make_ctx()
        resource = EndpointsResource(ctx)
        resource.get("550e8400-e29b-41d4-a716-446655440000")

        call_args = mock_urlopen.call_args
        req = call_args[0][0]
        self.assertIn("550e8400", req.get_full_url())

    @patch("hooksniff.request.urllib.request.urlopen")
    def test_delete_calls_void(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.status = 204
        mock_urlopen.return_value = mock_resp

        ctx = self._make_ctx()
        resource = EndpointsResource(ctx)
        result = resource.delete("ep_123")
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
