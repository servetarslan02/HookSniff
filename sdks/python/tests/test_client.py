"""Tests for HookSniff Python SDK."""
import hashlib
import hmac
import json
import pytest
from hooksniff import HookSniffClient
from hooksniff.verify import verify_signature
from hooksniff.utils import verify_webhook_signature


class TestVerifySignature:
    """Tests for webhook signature verification."""

    SECRET = "whsec_test_secret_key_1234567890abcdef"
    PAYLOAD = '{"event":"order.created","data":{"id":"123"}}'

    def _sign(self, payload: str, secret: str) -> str:
        return hmac.new(
            secret.encode(), payload.encode(), hashlib.sha256
        ).hexdigest()

    def test_valid_signature(self):
        sig = self._sign(self.PAYLOAD, self.SECRET)
        assert verify_signature(self.PAYLOAD, sig, self.SECRET) is True

    def test_valid_signature_with_prefix(self):
        sig = "sha256=" + self._sign(self.PAYLOAD, self.SECRET)
        assert verify_signature(self.PAYLOAD, sig, self.SECRET) is True

    def test_invalid_signature(self):
        assert verify_signature(self.PAYLOAD, "deadbeef", self.SECRET) is False

    def test_wrong_secret(self):
        sig = self._sign(self.PAYLOAD, self.SECRET)
        assert verify_signature(self.PAYLOAD, sig, "whsec_wrong") is False

    def test_empty_inputs(self):
        assert verify_signature("", "sig", "sec") is False
        assert verify_signature("payload", "", "sec") is False
        assert verify_signature("payload", "sig", "") is False

    def test_tampered_payload(self):
        sig = self._sign(self.PAYLOAD, self.SECRET)
        assert verify_signature(self.PAYLOAD + "tampered", sig, self.SECRET) is False


class TestVerifyWebhookSignature:
    """Tests for webhook signature verification with JSON parsing."""

    SECRET = "whsec_test_secret_key_1234567890abcdef"

    def _sign(self, payload: str, secret: str) -> str:
        return "sha256=" + hmac.new(
            secret.encode(), payload.encode(), hashlib.sha256
        ).hexdigest()

    def test_valid_webhook(self):
        payload = '{"event":"order.created","data":{"id":"123"}}'
        sig = self._sign(payload, self.SECRET)
        result = verify_webhook_signature(payload, sig, self.SECRET)
        assert result["valid"] is True
        assert result["payload"]["event"] == "order.created"

    def test_missing_signature(self):
        result = verify_webhook_signature("{}", None, self.SECRET)
        assert result["valid"] is False
        assert "Missing signature" in result["error"]

    def test_invalid_json(self):
        sig = self._sign("not-json", self.SECRET)
        result = verify_webhook_signature("not-json", sig, self.SECRET)
        assert result["valid"] is False
        assert "Invalid JSON" in result["error"]


class TestHookSniffClient:
    """Tests for the HookSniff client."""

    def test_constructs_with_config(self):
        client = HookSniffClient(api_key="hr_live_test123")
        assert client is not None

    def test_has_endpoints_resource(self):
        client = HookSniffClient(api_key="hr_live_test123")
        assert hasattr(client, "endpoints")

    def test_has_webhooks_resource(self):
        client = HookSniffClient(api_key="hr_live_test123")
        assert hasattr(client, "webhooks")
