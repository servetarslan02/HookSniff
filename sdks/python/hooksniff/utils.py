"""Utility functions for HookSniff SDK."""

import hashlib
import hmac
import json
from typing import Any, Callable, Dict, Optional


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
        >>> from hooksniff import verify_signature
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


def verify_webhook_signature(
    payload: str,
    signature: Optional[str],
    secret: str,
) -> Dict[str, Any]:
    """
    Verify a webhook signature and parse the payload.

    Higher-level convenience function that handles common edge cases
    and returns a structured result.

    Args:
        payload: The raw request body as a string.
        signature: The signature header value (e.g., "sha256=abc123...").
        secret: The endpoint's signing secret (starts with "whsec_").

    Returns:
        A dict with 'valid' bool and either 'payload' (parsed JSON) or 'error' (str).

    Example:
        >>> from hooksniff import verify_webhook_signature
        >>> result = verify_webhook_signature(
        ...     request.body.decode(),
        ...     request.headers.get("X-Hookrelay-Signature"),
        ...     "whsec_..."
        ... )
        >>> if result["valid"]:
        ...     print(result["payload"]["event"])
    """
    if not signature:
        return {"valid": False, "error": "Missing signature header"}

    if not secret:
        return {"valid": False, "error": "Missing signing secret"}

    if not payload:
        return {"valid": False, "error": "Missing request body"}

    is_valid = verify_signature(payload, signature, secret)
    if not is_valid:
        return {"valid": False, "error": "Invalid signature"}

    try:
        parsed = json.loads(payload)
        return {"valid": True, "payload": parsed}
    except json.JSONDecodeError:
        return {"valid": False, "error": "Invalid JSON payload"}


class WebhookHandler:
    """
    Webhook handler for Flask and FastAPI integration.

    Handles signature verification, event routing, and error handling.

    Example (Flask):
        from flask import Flask, request
        from hooksniff import WebhookHandler

        app = Flask(__name__)
        handler = WebhookHandler(
            secret="whsec_...",
            handlers={
                "order.created": lambda p: print(f"New order: {p['data']}"),
            },
        )

        @app.route("/webhook", methods=["POST"])
        def webhook():
            return handler.handle(
                body=request.data.decode(),
                signature=request.headers.get("X-Hookrelay-Signature"),
            )

    Example (FastAPI):
        from fastapi import FastAPI, Request, Response
        from hooksniff import WebhookHandler

        app = FastAPI()
        handler = WebhookHandler(secret="whsec_...")

        @app.post("/webhook")
        async def webhook(request: Request):
            body = (await request.body()).decode()
            sig = request.headers.get("X-Hookrelay-Signature")
            return handler.handle(body=body, signature=sig)
    """

    def __init__(
        self,
        secret: str,
        handlers: Optional[Dict[str, Callable]] = None,
        on_event: Optional[Callable] = None,
        signature_header: str = "X-Hookrelay-Signature",
    ):
        self.secret = secret
        self.handlers = handlers or {}
        self.on_event = on_event
        self.signature_header = signature_header

    def handle(
        self,
        body: str,
        signature: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Process an incoming webhook request.

        Args:
            body: The raw request body as a string.
            signature: The signature value. If None, tries to extract from headers.
            headers: Optional dict of request headers (for auto-extracting signature).

        Returns:
            A dict with 'status_code' and 'body' for the HTTP response.
        """
        # Auto-extract signature from headers if not provided
        if signature is None and headers:
            # Try common header names
            for header_name in [
                self.signature_header,
                self.signature_header.lower(),
                "x-hooksniff-signature",
            ]:
                if header_name in headers:
                    signature = headers[header_name]
                    break

        result = verify_webhook_signature(body, signature, self.secret)

        if not result["valid"]:
            return {
                "status_code": 401,
                "body": {
                    "error": {
                        "code": "INVALID_SIGNATURE",
                        "message": result.get("error", "Signature verification failed"),
                    }
                },
            }

        payload = result["payload"]

        try:
            # Route to specific handler
            event = payload.get("event", "")
            handler = self.handlers.get(event)
            if handler:
                handler(payload)
            elif self.on_event:
                self.on_event(payload)

            return {"status_code": 200, "body": {"received": True}}
        except Exception as e:
            return {
                "status_code": 500,
                "body": {
                    "error": {
                        "code": "HANDLER_ERROR",
                        "message": f"Internal webhook handler error: {str(e)}",
                    }
                },
            }
