"""Tests for HookSniff webhook verification."""
import pytest
import time
import hmac
import hashlib
import base64
import json

from hooksniff.webhooks import Webhook, WebhookVerificationError


def sign(secret: str, msg_id: str, timestamp: int, payload: str) -> str:
    """Helper to sign a webhook payload."""
    to_sign = f"{msg_id}.{timestamp}.{payload}"
    signature = base64.b64encode(
        hmac.new(base64.b64decode(secret), to_sign.encode(), hashlib.sha256).digest()
    ).decode()
    return f"v1,{signature}"


TEST_SECRET = "whsec_dGVzdA=="  # base64("test")
TEST_MSG_ID = "msg_test123"
TEST_TIMESTAMP = int(time.time())
TEST_PAYLOAD = '{"event":"test"}'


class TestWebhook:
    def test_verify_valid_signature(self):
        wh = Webhook(TEST_SECRET)
        sig = sign(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_PAYLOAD)
        headers = {
            "webhook-id": TEST_MSG_ID,
            "webhook-timestamp": str(TEST_TIMESTAMP),
            "webhook-signature": sig,
        }
        result = wh.verify(TEST_PAYLOAD, headers)
        assert result == {"event": "test"}

    def test_reject_invalid_signature(self):
        wh = Webhook(TEST_SECRET)
        headers = {
            "webhook-id": TEST_MSG_ID,
            "webhook-timestamp": str(TEST_TIMESTAMP),
            "webhook-signature": "v1,invalid",
        }
        with pytest.raises(WebhookVerificationError):
            wh.verify(TEST_PAYLOAD, headers)

    def test_reject_old_timestamp(self):
        wh = Webhook(TEST_SECRET)
        old_ts = int(time.time()) - 600
        sig = sign(TEST_SECRET, TEST_MSG_ID, old_ts, TEST_PAYLOAD)
        headers = {
            "webhook-id": TEST_MSG_ID,
            "webhook-timestamp": str(old_ts),
            "webhook-signature": sig,
        }
        with pytest.raises(WebhookVerificationError):
            wh.verify(TEST_PAYLOAD, headers)

    def test_accept_svix_branded_headers(self):
        wh = Webhook(TEST_SECRET)
        sig = sign(TEST_SECRET, TEST_MSG_ID, TEST_TIMESTAMP, TEST_PAYLOAD)
        headers = {
            "svix-id": TEST_MSG_ID,
            "svix-timestamp": str(TEST_TIMESTAMP),
            "svix-signature": sig,
        }
        result = wh.verify(TEST_PAYLOAD, headers)
        assert result == {"event": "test"}

    def test_missing_headers_raises(self):
        wh = Webhook(TEST_SECRET)
        with pytest.raises(WebhookVerificationError):
            wh.verify(TEST_PAYLOAD, {})


class TestExceptions:
    def test_import_exceptions(self):
        from hooksniff import (
            HookSniffError,
            BadRequestError,
            UnauthorizedError,
            ForbiddenError,
            NotFoundError,
            ConflictError,
            UnprocessableEntityError,
            RateLimitError,
            InternalServerError,
            BadGatewayError,
            ServiceUnavailableError,
            GatewayTimeoutError,
        )
        assert issubclass(BadRequestError, HookSniffError)
        assert issubclass(RateLimitError, HookSniffError)
