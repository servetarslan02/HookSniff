"""
HookSniff SDK — Webhook Signature Verification

Verifies incoming webhook signatures using HMAC-SHA256.
Compatible with Standard Webhooks format (whsec_ prefix secrets).

Usage:
    from hooksniff import Webhook
    wh = Webhook("whsec_...")
    payload = wh.verify(raw_body, headers)
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any, Union

from .exceptions import WebhookVerificationError

TIMESTAMP_TOLERANCE_SECONDS = 5 * 60  # 5 minutes


def _decode_secret(secret: str | bytes) -> bytes:
    if isinstance(secret, bytes):
        return secret
    raw = secret[6:] if secret.startswith("whsec_") else secret
    try:
        return base64.b64decode(raw)
    except Exception:
        return raw.encode("utf-8")


def _build_signed_content(msg_id: str, timestamp: str, body: str | bytes) -> str:
    body_str = body.decode("utf-8") if isinstance(body, bytes) else body
    return f"{msg_id}.{timestamp}.{body_str}"


def _sign(secret: bytes, msg_id: str, timestamp: int, body: str | bytes) -> str:
    ts = str(timestamp)
    content = _build_signed_content(msg_id, ts, body)
    sig = hmac.new(secret, content.encode("utf-8"), hashlib.sha256).digest()
    return f"v1,{base64.b64encode(sig).decode('utf-8')}"


def _verify_signature(expected: str, actual: str) -> bool:
    signatures = [s.strip() for s in actual.split(",")]
    for sig in signatures:
        parts = sig.split(",", 1)
        sig_part = parts[1] if len(parts) > 1 else parts[0]

        expected_parts = expected.split(",", 1)
        expected_sig = expected_parts[1] if len(expected_parts) > 1 else expected_parts[0]

        if len(expected_sig) != len(sig_part):
            continue

        if hmac.compare_digest(expected_sig, sig_part):
            return True

    return False


class Webhook:
    """
    Webhook signature verifier.

    Supports both Standard Webhooks (webhook-id, webhook-timestamp, webhook-signature)
    and legacy svix-* prefixed headers.

    Usage:
        wh = Webhook("whsec_...")
        payload = wh.verify(raw_body, headers)
    """

    def __init__(self, secret: str | bytes):
        self._secret = _decode_secret(secret)

    def verify(self, payload: str | bytes, headers: dict[str, str]) -> Any:
        """
        Verify a webhook payload against its signature headers.

        Args:
            payload: The raw request body (string or bytes)
            headers: The request headers containing webhook signature info

        Returns:
            The parsed JSON payload if verification succeeds

        Raises:
            WebhookVerificationError: If verification fails
        """
        # Normalize headers to lowercase
        normalized: dict[str, str] = {k.lower(): v for k, v in headers.items()}

        msg_id = normalized.get("svix-id") or normalized.get("webhook-id")
        timestamp = normalized.get("svix-timestamp") or normalized.get("webhook-timestamp")
        signature = normalized.get("svix-signature") or normalized.get("webhook-signature")

        if not msg_id:
            raise WebhookVerificationError("Missing webhook-id header")
        if not timestamp:
            raise WebhookVerificationError("Missing webhook-timestamp header")
        if not signature:
            raise WebhookVerificationError("Missing webhook-signature header")

        # Validate timestamp
        try:
            timestamp_num = int(timestamp)
        except ValueError:
            raise WebhookVerificationError("Invalid webhook-timestamp header")

        now = int(time.time())
        if abs(now - timestamp_num) > TIMESTAMP_TOLERANCE_SECONDS:
            raise WebhookVerificationError(
                f"Webhook timestamp is too old or too new (tolerance: {TIMESTAMP_TOLERANCE_SECONDS}s)"
            )

        # Compute expected signature
        content = _build_signed_content(msg_id, timestamp, payload)
        sig = hmac.new(self._secret, content.encode("utf-8"), hashlib.sha256).digest()
        expected = f"v1,{base64.b64encode(sig).decode('utf-8')}"

        if not _verify_signature(expected, signature):
            raise WebhookVerificationError("Invalid webhook signature")

        # Parse and return
        raw = payload.decode("utf-8") if isinstance(payload, bytes) else payload
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            return raw

    def sign(self, msg_id: str, timestamp: int, payload: str | bytes) -> str:
        """Sign a payload (for testing or server-side webhook sending)."""
        return _sign(self._secret, msg_id, timestamp, payload)
