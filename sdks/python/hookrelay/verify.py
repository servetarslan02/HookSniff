"""
Standard Webhooks verification for HookRelay.

Compatible with the Standard Webhooks spec (https://www.standardwebhooks.com/)
and Svix's Python SDK verification flow.

Example:
    from hookrelay.verify import WebhookVerifier

    verifier = WebhookVerifier("whsec_...")

    result = verifier.verify(
        body=request.body.decode(),
        msg_id=request.headers.get("webhook-id"),
        timestamp=request.headers.get("webhook-timestamp"),
        signature_header=request.headers.get("webhook-signature"),
    )

    if result["valid"]:
        print("Payload:", result["payload"])
"""

import base64
import hashlib
import hmac
import json
import time
from typing import Any, Dict, Optional, Union

DEFAULT_TOLERANCE_SECS = 300  # 5 minutes


class WebhookVerifier:
    """
    Standard Webhooks verifier compatible with Svix's verification flow.

    Uses the same header names (webhook-id, webhook-timestamp, webhook-signature)
    and signature format (v1,<base64(hmac)>).

    Args:
        secret: The endpoint's signing secret (with or without ``whsec_`` prefix).
        tolerance_secs: Maximum age of webhook timestamp in seconds (default: 300).

    Example:
        verifier = WebhookVerifier("whsec_bWVzc2FnZQ==")
        result = verifier.verify(body, msg_id, timestamp, signature)
    """

    def __init__(self, secret: str, tolerance_secs: int = DEFAULT_TOLERANCE_SECS):
        self.secret = secret
        self.tolerance_secs = tolerance_secs

    def verify(
        self,
        body: str,
        msg_id: Optional[str],
        timestamp: Optional[str],
        signature_header: Optional[str],
    ) -> Dict[str, Any]:
        """
        Verify a webhook request using Standard Webhooks headers.

        Args:
            body: The raw request body as a string.
            msg_id: The ``webhook-id`` header value.
            timestamp: The ``webhook-timestamp`` header value.
            signature_header: The ``webhook-signature`` header value.

        Returns:
            A dict with ``valid`` (bool), and either ``payload`` (parsed JSON)
            or ``error`` (str).
        """
        if not msg_id:
            return {"valid": False, "error": "Missing webhook-id header"}

        if not timestamp:
            return {"valid": False, "error": "Missing webhook-timestamp header"}

        if not signature_header:
            return {"valid": False, "error": "Missing webhook-signature header"}

        if not body:
            return {"valid": False, "error": "Missing request body"}

        # Validate timestamp
        try:
            ts = int(timestamp)
        except (ValueError, TypeError):
            return {"valid": False, "error": "Invalid webhook timestamp"}

        now = int(time.time())
        age = abs(now - ts)

        if age > self.tolerance_secs:
            return {
                "valid": False,
                "error": f"Webhook timestamp expired: {age}s old (tolerance: {self.tolerance_secs}s)",
            }

        # Compute expected signature
        signed_content = f"{msg_id}.{timestamp}.{body}"
        secret_bytes = self._decode_secret(self.secret)

        expected_hmac = hmac.new(
            secret_bytes,
            signed_content.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        expected_sig = f"v1,{base64.b64encode(expected_hmac).decode('utf-8')}"

        # Check each signature in the header (space-separated)
        signatures = signature_header.split(" ")
        verified = False

        for sig in signatures:
            sig = sig.strip()
            if not sig.startswith("v1,"):
                continue

            # Constant-time comparison
            if hmac.compare_digest(sig, expected_sig):
                verified = True
                break

        if not verified:
            return {"valid": False, "error": "Invalid webhook signature"}

        # Parse the payload
        try:
            parsed = json.loads(body)
            return {"valid": True, "payload": parsed}
        except json.JSONDecodeError:
            # Body is valid (signature matched) but not JSON
            return {"valid": True, "payload": body}

    @staticmethod
    def _decode_secret(secret: str) -> bytes:
        """Decode a Standard Webhooks secret."""
        stripped = secret[6:] if secret.startswith("whsec_") else secret
        try:
            return base64.b64decode(stripped)
        except Exception:
            return secret.encode("utf-8")


def verify_webhook(
    secret: str,
    body: str,
    headers: Dict[str, str],
    tolerance_secs: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Standalone verification function (Svix-compatible).

    Convenience wrapper that extracts Standard Webhooks headers
    from a headers dict and verifies the request. Supports both
    Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
    and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.

    Args:
        secret: The endpoint's signing secret.
        body: The raw request body as a string.
        headers: The request headers dict.
        tolerance_secs: Optional override for timestamp tolerance.

    Returns:
        A dict with ``valid`` (bool) and either ``payload`` or ``error``.

    Example:
        from hookrelay.verify import verify_webhook

        result = verify_webhook(
            "whsec_...",
            request.body.decode(),
            dict(request.headers),
        )
        if not result["valid"]:
            return {"error": result["error"]}, 401
    """
    # Case-insensitive header lookup
    def get_header(name: str) -> Optional[str]:
        lower = name.lower()
        for key, value in headers.items():
            if key.lower() == lower:
                return value
        return None

    # Try Standard Webhooks headers first, then Svix headers
    msg_id = get_header("webhook-id")
    timestamp = get_header("webhook-timestamp")
    signature_header = get_header("webhook-signature")

    if not msg_id or not timestamp or not signature_header:
        msg_id = msg_id or get_header("svix-id")
        timestamp = timestamp or get_header("svix-timestamp")
        signature_header = signature_header or get_header("svix-signature")

    kwargs = {}
    if tolerance_secs is not None:
        kwargs["tolerance_secs"] = tolerance_secs

    verifier = WebhookVerifier(secret, **kwargs)

    return verifier.verify(
        body=body,
        msg_id=msg_id,
        timestamp=timestamp,
        signature_header=signature_header,
    )
