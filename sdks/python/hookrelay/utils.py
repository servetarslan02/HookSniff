"""Utility functions for HookRelay SDK."""

import hashlib
import hmac


def verify_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verify a webhook signature using HMAC-SHA256.

    Args:
        payload: The raw request body as a string.
        signature: The signature from the X-Hookrelay-Signature header.
                   Expected format: "sha256=<hex_digest>"
        secret: The endpoint's signing secret (starts with "whsec_").

    Returns:
        True if the signature is valid, False otherwise.

    Example:
        >>> from hookrelay import verify_signature
        >>> is_valid = verify_signature(request.body, request.headers["X-Hookrelay-Signature"], "whsec_...")
    """
    if not payload or not signature or not secret:
        return False

    # Extract the hex digest from "sha256=<hex>"
    if signature.startswith("sha256="):
        expected_hex = signature[7:]
    else:
        expected_hex = signature

    # Compute HMAC-SHA256
    computed = hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    # Constant-time comparison
    return hmac.compare_digest(computed, expected_hex)
