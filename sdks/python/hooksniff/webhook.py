"""
HookSniff Webhook Signature Verification

Verifies incoming webhook signatures using HMAC-SHA256.
Compatible with Standard Webhooks format (whsec_ prefix secrets).

Usage:
    from hooksniff import Webhook

    wh = Webhook("whsec_...")
    payload = wh.verify(raw_body, headers)
"""

import hmac
import hashlib
import json
import time
import base64
from typing import Any, Dict, Optional, Union


TIMESTAMP_TOLERANCE_SECONDS = 5 * 60  # 5 minutes


class WebhookVerificationError(Exception):
    """Raised when webhook signature verification fails."""
    pass


def _decode_secret(secret: Union[str, bytes]) -> bytes:
    """Decode a whsec_ prefixed secret to raw bytes."""
    if isinstance(secret, bytes):
        return secret

    # Strip whsec_ prefix if present
    raw = secret[6:] if secret.startswith("whsec_") else secret

    # Try base64 decode
    try:
        return base64.b64decode(raw)
    except Exception:
        return raw.encode("utf-8")


def _build_signed_content(msg_id: str, timestamp: str, body: Union[str, bytes]) -> str:
    """Build the signed content string per Standard Webhooks spec: {msgId}.{timestamp}.{body}"""
    body_str = body.decode("utf-8") if isinstance(body, bytes) else body
    return f"{msg_id}.{timestamp}.{body_str}"


def _sign(secret: bytes, msg_id: str, timestamp: int, body: Union[str, bytes]) -> str:
    """Compute HMAC-SHA256 signature and return in Standard Webhooks format."""
    ts = str(timestamp)
    content = _build_signed_content(msg_id, ts, body)
    h = hmac.new(secret, content.encode("utf-8"), hashlib.sha256).digest()
    sig = base64.b64encode(h).decode("utf-8")
    return f"v1,{sig}"


def _verify_signature(expected: str, actual: str) -> bool:
    """Verify that a signature matches using timing-safe comparison."""
    # Extract expected signature part (strip version prefix)
    expected_parts = expected.split(",", 1)
    expected_sig = expected_parts[1] if len(expected_parts) > 1 else expected_parts[0]

    # Each signature can be comma-separated (v1 sig1, v1 sig2, ...)
    signatures = [s.strip() for s in actual.split(",")]

    for sig in signatures:
        # Handle "v1,signature" format
        parts = sig.split(",", 1)
        signature_part = parts[1] if len(parts) > 1 else parts[0]

        if len(expected_sig) != len(signature_part):
            continue

        if hmac.compare_digest(expected_sig, signature_part):
            return True

    return False


def verify_signature(payload: Union[str, bytes], headers: Dict[str, str], secret: Union[str, bytes]) -> Any:
    """
    Verify a webhook payload against its signature headers.

    Standalone function version — useful for frameworks that don't use the Webhook class.

    Args:
        payload: The raw request body (string or bytes).
        headers: The request headers containing webhook-id, webhook-timestamp, webhook-signature.
        secret: The endpoint's signing secret (e.g., "whsec_base64encoded...").

    Returns:
        The parsed payload if verification succeeds.

    Raises:
        WebhookVerificationError: If verification fails.
    """
    wh = Webhook(secret)
    return wh.verify(payload, headers)


class Webhook:
    """
    Webhook signature verifier.

    Args:
        secret: The endpoint's signing secret (e.g., "whsec_base64encoded...").
    """

    def __init__(self, secret: Union[str, bytes]):
        self._secret = _decode_secret(secret)

    def verify(self, payload: Union[str, bytes], headers: Dict[str, str]) -> Any:
        """
        Verify a webhook payload against its signature headers.

        Args:
            payload: The raw request body (string or bytes).
            headers: The request headers containing webhook-id, webhook-timestamp, webhook-signature.

        Returns:
            The parsed payload if verification succeeds.

        Raises:
            WebhookVerificationError: If verification fails.
        """
        # Normalize headers to lowercase
        normalized = {k.lower(): v for k, v in headers.items()}

        # Support both svix- and webhook- prefixed headers
        msg_id = normalized.get("svix-id") or normalized.get("webhook-id")
        timestamp = normalized.get("svix-timestamp") or normalized.get("webhook-timestamp")
        signature = normalized.get("svix-signature") or normalized.get("webhook-signature")

        if not msg_id:
            raise WebhookVerificationError("Missing webhook-id header")
        if not timestamp:
            raise WebhookVerificationError("Missing webhook-timestamp header")
        if not signature:
            raise WebhookVerificationError("Missing webhook-signature header")

        # Validate timestamp (prevent replay attacks)
        try:
            timestamp_num = int(timestamp)
        except (ValueError, TypeError):
            raise WebhookVerificationError("Invalid webhook-timestamp header")

        now = int(time.time())
        if abs(now - timestamp_num) > TIMESTAMP_TOLERANCE_SECONDS:
            raise WebhookVerificationError(
                f"Webhook timestamp is too old or too new (tolerance: {TIMESTAMP_TOLERANCE_SECONDS}s)"
            )

        # Compute expected signature
        content = _build_signed_content(msg_id, timestamp, payload)
        expected_sig = hmac.new(self._secret, content.encode("utf-8"), hashlib.sha256).digest()
        expected = f"v1,{base64.b64encode(expected_sig).decode('utf-8')}"

        # Timing-safe comparison
        if not _verify_signature(expected, signature):
            raise WebhookVerificationError("Invalid webhook signature")

        # Parse and return payload
        if isinstance(payload, bytes):
            payload = payload.decode("utf-8")

        try:
            return json.loads(payload)
        except (json.JSONDecodeError, ValueError):
            return payload

    def sign(self, msg_id: str, timestamp: int, payload: Union[str, bytes]) -> str:
        """
        Sign a payload (for testing or server-side webhook sending).

        Args:
            msg_id: The message ID.
            timestamp: Unix timestamp (seconds).
            payload: The payload to sign.

        Returns:
            The signature string (e.g., "v1,base64hmac").
        """
        return _sign(self._secret, msg_id, timestamp, payload)
