"""
HookSniff Webhook Signature Verification Tests

Tests for HMAC-SHA256 signature verification with Standard Webhooks format.
"""

import time
import json
import base64
import hmac
import hashlib
import pytest

from hooksniff.webhook import (
    Webhook,
    WebhookVerificationError,
    verify_signature,
    _decode_secret,
    _build_signed_content,
    _sign,
    _verify_signature,
    TIMESTAMP_TOLERANCE_SECONDS,
)


# Test secret (base64-encoded)
TEST_SECRET_B64 = base64.b64encode(b"test-secret-key-for-hmac-signing").decode("utf-8")
TEST_SECRET = f"whsec_{TEST_SECRET_B64}"
TEST_SECRET_RAW = base64.b64decode(TEST_SECRET_B64)


def _make_signature(secret: bytes, msg_id: str, timestamp: int, body: str) -> str:
    """Helper: create a valid signature."""
    content = f"{msg_id}.{timestamp}.{body}"
    sig = hmac.new(secret, content.encode("utf-8"), hashlib.sha256).digest()
    return f"v1,{base64.b64encode(sig).decode('utf-8')}"


def _make_headers(msg_id: str = "msg_test123", timestamp: int = None, signature: str = None) -> dict:
    """Helper: create webhook headers."""
    if timestamp is None:
        timestamp = int(time.time())
    if signature is None:
        signature = _make_signature(TEST_SECRET_RAW, msg_id, timestamp, '{"test": true}')
    return {
        "webhook-id": msg_id,
        "webhook-timestamp": str(timestamp),
        "webhook-signature": signature,
    }


class TestDecodeSecret:
    """Tests for secret decoding."""

    def test_whsec_prefix_stripped(self):
        """whsec_ prefix should be stripped and remaining decoded as base64."""
        result = _decode_secret(TEST_SECRET)
        assert result == TEST_SECRET_RAW

    def test_raw_base64_decoded(self):
        """Raw base64 without prefix should be decoded."""
        result = _decode_secret(TEST_SECRET_B64)
        assert result == TEST_SECRET_RAW

    def test_bytes_passthrough(self):
        """Bytes input should pass through unchanged."""
        raw = b"raw-secret-bytes"
        result = _decode_secret(raw)
        assert result == raw


class TestBuildSignedContent:
    """Tests for signed content construction."""

    def test_string_body(self):
        """Should build correct content string with string body."""
        result = _build_signed_content("msg_123", "1234567890", '{"key":"value"}')
        assert result == "msg_123.1234567890.{\"key\":\"value\"}"

    def test_bytes_body(self):
        """Should build correct content string with bytes body."""
        result = _build_signed_content("msg_123", "1234567890", b'{"key":"value"}')
        assert result == "msg_123.1234567890.{\"key\":\"value\"}"


class TestSign:
    """Tests for signing function."""

    def test_sign_returns_v1_format(self):
        """Signature should be in v1,base64 format."""
        sig = _sign(TEST_SECRET_RAW, "msg_test", 1234567890, '{"data":1}')
        assert sig.startswith("v1,")

    def test_sign_deterministic(self):
        """Same inputs should produce same signature."""
        sig1 = _sign(TEST_SECRET_RAW, "msg_test", 1234567890, '{"data":1}')
        sig2 = _sign(TEST_SECRET_RAW, "msg_test", 1234567890, '{"data":1}')
        assert sig1 == sig2


class TestVerifySignature:
    """Tests for signature comparison."""

    def test_matching_signatures(self):
        """Identical signatures should verify."""
        sig = _make_signature(TEST_SECRET_RAW, "msg_1", 100, '{"a":1}')
        assert _verify_signature(sig, sig) is True

    def test_mismatched_signatures(self):
        """Different signatures should fail."""
        sig1 = _make_signature(TEST_SECRET_RAW, "msg_1", 100, '{"a":1}')
        sig2 = _make_signature(TEST_SECRET_RAW, "msg_2", 100, '{"a":1}')
        assert _verify_signature(sig1, sig2) is False

    def test_multiple_signatures(self):
        """Should match any one of comma-separated signatures."""
        good = _make_signature(TEST_SECRET_RAW, "msg_1", 100, '{"a":1}')
        multi = f"v1,fakesig,{good.split(',')[1]}"
        # The first "fakesig" won't match, but the second real one should
        # Actually let's construct this properly
        sig_real = good.split(",")[1]
        combined = f"v1,fakesigdoesnotmatch==,v1,{sig_real}"
        # Wait, verify_signature splits by comma, so we need the right format
        # Each sig is "v1,<base64>" but multiple are separated by spaces
        combined = f"v1,fakesigdoesnotmatch== {good}"
        assert _verify_signature(good, combined) is True


class TestWebhookVerify:
    """Tests for the Webhook class verify method."""

    def test_valid_signature_passes(self):
        """A valid signature should pass verification."""
        wh = Webhook(TEST_SECRET)
        body = '{"event":"test"}'
        msg_id = "msg_valid123"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = wh.verify(body, headers)
        assert result == {"event": "test"}

    def test_valid_signature_returns_parsed_json(self):
        """Verify should parse and return JSON payload."""
        wh = Webhook(TEST_SECRET)
        body = '{"order_id":"12345","status":"shipped"}'
        msg_id = "msg_json"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = _make_headers(msg_id, ts, sig)
        headers["webhook-id"] = msg_id
        result = wh.verify(body, headers)
        assert result["order_id"] == "12345"
        assert result["status"] == "shipped"

    def test_invalid_signature_fails(self):
        """An invalid signature should raise WebhookVerificationError."""
        wh = Webhook(TEST_SECRET)
        body = '{"event":"test"}'
        ts = int(time.time())
        headers = {
            "webhook-id": "msg_invalid",
            "webhook-timestamp": str(ts),
            "webhook-signature": "v1,fakesignature==",
        }
        with pytest.raises(WebhookVerificationError, match="Invalid webhook signature"):
            wh.verify(body, headers)

    def test_expired_timestamp_fails(self):
        """A timestamp older than 5 minutes should fail (replay protection)."""
        wh = Webhook(TEST_SECRET)
        body = '{"event":"test"}'
        msg_id = "msg_old"
        ts = int(time.time()) - TIMESTAMP_TOLERANCE_SECONDS - 1
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        with pytest.raises(WebhookVerificationError, match="timestamp"):
            wh.verify(body, headers)

    def test_future_timestamp_fails(self):
        """A timestamp too far in the future should fail."""
        wh = Webhook(TEST_SECRET)
        body = '{"event":"test"}'
        msg_id = "msg_future"
        ts = int(time.time()) + TIMESTAMP_TOLERANCE_SECONDS + 1
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        with pytest.raises(WebhookVerificationError, match="timestamp"):
            wh.verify(body, headers)

    def test_missing_webhook_id_fails(self):
        """Missing webhook-id header should fail."""
        wh = Webhook(TEST_SECRET)
        with pytest.raises(WebhookVerificationError, match="Missing webhook-id"):
            wh.verify("{}", {"webhook-timestamp": "123", "webhook-signature": "v1,sig"})

    def test_missing_timestamp_fails(self):
        """Missing webhook-timestamp header should fail."""
        wh = Webhook(TEST_SECRET)
        with pytest.raises(WebhookVerificationError, match="Missing webhook-timestamp"):
            wh.verify("{}", {"webhook-id": "msg_1", "webhook-signature": "v1,sig"})

    def test_missing_signature_fails(self):
        """Missing webhook-signature header should fail."""
        wh = Webhook(TEST_SECRET)
        with pytest.raises(WebhookVerificationError, match="Missing webhook-signature"):
            wh.verify("{}", {"webhook-id": "msg_1", "webhook-timestamp": "123"})

    def test_svix_headers_supported(self):
        """Svix-prefixed headers should also work."""
        wh = Webhook(TEST_SECRET)
        body = '{"event":"svix-test"}'
        msg_id = "msg_svix"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "svix-id": msg_id,
            "svix-timestamp": str(ts),
            "svix-signature": sig,
        }
        result = wh.verify(body, headers)
        assert result == {"event": "svix-test"}

    def test_bytes_payload(self):
        """Bytes payload should also verify."""
        wh = Webhook(TEST_SECRET)
        body = b'{"event":"bytes-test"}'
        msg_id = "msg_bytes"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body.decode())
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = wh.verify(body, headers)
        assert result == {"event": "bytes-test"}

    def test_non_json_payload_returns_string(self):
        """Non-JSON payload should return as string."""
        wh = Webhook(TEST_SECRET)
        body = "not-json-payload"
        msg_id = "msg_plain"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = wh.verify(body, headers)
        assert result == "not-json-payload"


class TestWebhookSign:
    """Tests for the Webhook.sign method."""

    def test_sign_produces_valid_signature(self):
        """Signed payload should verify correctly."""
        wh = Webhook(TEST_SECRET)
        msg_id = "msg_sign_test"
        ts = int(time.time())
        body = '{"action":"test"}'
        sig = wh.sign(msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = wh.verify(body, headers)
        assert result == {"action": "test"}


class TestVerifySignatureStandalone:
    """Tests for the standalone verify_signature function."""

    def test_standalone_verify(self):
        """Standalone function should work the same as Webhook class."""
        body = '{"standalone":true}'
        msg_id = "msg_standalone"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = verify_signature(body, headers, TEST_SECRET)
        assert result == {"standalone": True}

    def test_standalone_with_bytes_secret(self):
        """Standalone function should accept bytes secret."""
        body = '{"bytes_secret":true}'
        msg_id = "msg_bytes_sec"
        ts = int(time.time())
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = verify_signature(body, headers, TEST_SECRET_RAW)
        assert result == {"bytes_secret": True}


class TestBoundaryTimestamps:
    """Tests for boundary timestamp values."""

    def test_exactly_at_tolerance_boundary(self):
        """Timestamp exactly at the tolerance boundary should pass."""
        wh = Webhook(TEST_SECRET)
        body = '{"boundary":true}'
        msg_id = "msg_boundary"
        ts = int(time.time()) - TIMESTAMP_TOLERANCE_SECONDS
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        result = wh.verify(body, headers)
        assert result == {"boundary": True}

    def test_one_second_past_boundary_fails(self):
        """Timestamp one second past boundary should fail."""
        wh = Webhook(TEST_SECRET)
        body = '{"past_boundary":true}'
        msg_id = "msg_past"
        ts = int(time.time()) - TIMESTAMP_TOLERANCE_SECONDS - 1
        sig = _make_signature(TEST_SECRET_RAW, msg_id, ts, body)
        headers = {
            "webhook-id": msg_id,
            "webhook-timestamp": str(ts),
            "webhook-signature": sig,
        }
        with pytest.raises(WebhookVerificationError):
            wh.verify(body, headers)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
