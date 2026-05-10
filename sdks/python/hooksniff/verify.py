"""
Standard Webhooks verification for HookSniff.

Compatible with the Standard Webhooks spec (https://www.standardwebhooks.com/)
and Svix's Python SDK verification flow.

Example:
    from hooksniff.verify import WebhookVerifier

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
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Optional, Union

DEFAULT_TOLERANCE_SECS = 300  # 5 minutes


def _decode_secret(secret: str) -> bytes:
    """Decode a Standard Webhooks secret.

    Handles two formats:
    - ``whsec_`` prefixed: base64-decodes the part after the prefix.
    - Raw string: encodes as UTF-8 bytes.

    Args:
        secret: The signing secret string.

    Returns:
        The decoded secret as bytes.
    """
    stripped = secret[6:] if secret.startswith("whsec_") else secret
    try:
        # Add padding in case secret is unpadded base64
        return base64.b64decode(stripped + "==")
    except Exception:
        return secret.encode("utf-8")


@dataclass
class WebhookEvent:
    """
    A verified incoming webhook event.

    Attributes:
        id: The webhook-id header value (empty for legacy webhooks).
        timestamp: The unix timestamp string from the webhook-timestamp header.
        event: The event type extracted from the payload (e.g. "order.created").
        data: The parsed JSON payload, or the raw body string if not JSON.
        raw_body: The original request body.
    """

    id: str = ""
    timestamp: str = ""
    event: str = ""
    data: Any = None
    raw_body: str = ""


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
        if now - ts > self.tolerance_secs:
            return {"valid": False, "error": "Message timestamp too old"}
        if ts > now + self.tolerance_secs:
            return {"valid": False, "error": "Message timestamp too new"}

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
        """Decode a Standard Webhooks secret.

        .. deprecated::
            Use the module-level :func:`_decode_secret` instead.
            This method delegates to it for backward compatibility.
        """
        return _decode_secret(secret)


def verify_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verify a webhook signature using HMAC-SHA256.

    Supports both legacy format (``sha256=<hex>``) and Standard Webhooks
    format (``v1,<base64>``).

    Args:
        payload: The raw request body as a string.
        signature: The signature value from the request header.
        secret: The endpoint's signing secret.

    Returns:
        True if the signature is valid, False otherwise.

    Example:
        >>> from hooksniff.verify import verify_signature
        >>> valid = verify_signature(body, "sha256=abc123...", "whsec_...")
    """
    if not payload or not signature or not secret:
        return False

    # Standard Webhooks format: v1,<base64>
    if signature.startswith("v1,"):
        secret_bytes = _decode_secret(secret)
        expected_hmac = hmac.new(
            secret_bytes,
            payload.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        expected_sig = f"v1,{base64.b64encode(expected_hmac).decode('utf-8')}"
        return hmac.compare_digest(signature, expected_sig)

    # Legacy format: sha256=<hex>
    expected_hex = signature[7:] if signature.startswith("sha256=") else signature
    computed = hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(computed, expected_hex)


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
        from hooksniff.verify import verify_webhook

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


def verify_webhook_request(request, secret: str) -> WebhookEvent:
    """
    Verify an incoming webhook from a request object (Flask, Django, or generic WSGI).

    Extracts the body and relevant headers automatically, verifies the signature,
    and returns a ``WebhookEvent``. Supports both Standard Webhooks headers and
    legacy ``X-Hooksniff-Signature`` header.

    Args:
        request: A Flask, Django, or WSGI-like request object. Must have
            ``body``/``data``/``get_data()`` attribute and ``headers``/``META``.
        secret: The endpoint's signing secret.

    Returns:
        A ``WebhookEvent`` with the verified payload.

    Raises:
        ValueError: If signature verification fails or no signature headers found.

    Example:
        # Flask
        from flask import request
        from hooksniff.verify import verify_webhook_request

        event = verify_webhook_request(request, "whsec_...")
        print(event.event, event.data)

        # Django
        event = verify_webhook_request(request, "whsec_...")
    """
    body_str = _extract_body(request)
    headers = _extract_headers(request)

    if not body_str:
        raise ValueError("Missing request body")

    # Try Standard Webhooks headers first
    msg_id = _get_header(headers, "webhook-id")
    timestamp = _get_header(headers, "webhook-timestamp")
    sig_header = _get_header(headers, "webhook-signature")

    # Fall back to Svix headers
    if not msg_id:
        msg_id = _get_header(headers, "svix-id")
    if not timestamp:
        timestamp = _get_header(headers, "svix-timestamp")
    if not sig_header:
        sig_header = _get_header(headers, "svix-signature")

    # Standard Webhooks path
    if msg_id and timestamp and sig_header:
        verifier = WebhookVerifier(secret)
        result = verifier.verify(body_str, msg_id, timestamp, sig_header)

        if not result["valid"]:
            raise ValueError(result.get("error", "Signature verification failed"))

        event = WebhookEvent(
            id=msg_id,
            timestamp=timestamp,
            raw_body=body_str,
            data=result["payload"],
        )

        # Extract event type from payload
        if isinstance(result["payload"], dict):
            event.event = result["payload"].get("event", "")

        return event

    # Legacy path: X-Hooksniff-Signature
    legacy_sig = _get_header(headers, "x-hooksniff-signature")
    if not legacy_sig:
        raise ValueError("No webhook signature headers found")

    if not verify_signature(body_str, legacy_sig, secret):
        raise ValueError("Invalid legacy signature")

    event = WebhookEvent(raw_body=body_str)

    try:
        parsed = json.loads(body_str)
        event.data = parsed
        if isinstance(parsed, dict):
            event.event = parsed.get("event", "")
    except json.JSONDecodeError:
        event.data = body_str

    return event


def _extract_body(request) -> str:
    """Extract the raw body string from a request object."""
    # Flask: get_data() returns bytes
    if hasattr(request, "get_data"):
        data = request.get_data(as_text=True)
        if data:
            return data
    # Flask/Django: .body is bytes
    if hasattr(request, "body"):
        body = request.body
        if isinstance(body, bytes):
            return body.decode("utf-8")
        return str(body)
    # Django: .POST for form data (not ideal for webhooks, but fallback)
    # WSGI: wsgi.input
    if hasattr(request, "environ") and "wsgi.input" in request.environ:
        raw = request.environ["wsgi.input"].read()
        return raw.decode("utf-8")
    return ""


def _extract_headers(request) -> Dict[str, str]:
    """Extract headers from a request object as a case-insensitive dict."""
    # Flask: request.headers is a werkzeug.Headers object
    if hasattr(request, "headers") and hasattr(request.headers, "get"):
        try:
            return {k: v for k, v in request.headers.items()}
        except Exception:
            pass
    # Django: request.META with HTTP_ prefix
    if hasattr(request, "META"):
        headers = {}
        for key, value in request.META.items():
            if key.startswith("HTTP_"):
                # HTTP_X_HOOKSNIFF_SIGNATURE -> X-Hooksniff-Signature
                header_name = key[5:].replace("_", "-")
                headers[header_name] = value
            elif key == "CONTENT_TYPE":
                headers["Content-Type"] = value
        return headers
    # Fallback: try dict()
    try:
        return dict(request.headers)
    except Exception:
        return {}


def _get_header(headers: Dict[str, str], name: str) -> Optional[str]:
    """Case-insensitive header lookup."""
    lower = name.lower()
    for key, value in headers.items():
        if key.lower() == lower:
            return value
    return None


class WebhookHandler:
    """
    Decorator-based webhook handler for routing events.

    Handles signature verification and event routing for Flask, Django,
    FastAPI, and other Python web frameworks.

    Supports both Standard Webhooks headers and legacy
    ``X-Hooksniff-Signature`` header.

    Args:
        secret: The endpoint's signing secret.
        handlers: Optional dict mapping event names to handler functions.

    Example (Flask):
        from flask import Flask, request, jsonify
        from hooksniff.verify import WebhookHandler, WebhookEvent

        app = Flask(__name__)
        handler = WebhookHandler("whsec_...")

        @handler.on("order.created")
        def handle_order(event: WebhookEvent):
            print(f"New order: {event.data}")

        @handler.on("payment.failed")
        def handle_payment(event: WebhookEvent):
            print(f"Payment failed: {event.data}")

        @app.route("/webhook", methods=["POST"])
        def webhook():
            return handler.handle(request)

    Example (FastAPI):
        from fastapi import FastAPI, Request, Response
        from hooksniff.verify import WebhookHandler, WebhookEvent

        app = FastAPI()
        handler = WebhookHandler("whsec_...")

        @handler.on("order.created")
        def handle_order(event: WebhookEvent):
            print(f"New order: {event.data}")

        @app.post("/webhook")
        async def webhook(request: Request):
            result = handler.handle_request(
                body=(await request.body()).decode(),
                headers=dict(request.headers),
            )
            return Response(
                content=json.dumps(result["body"]),
                status_code=result["status_code"],
                media_type="application/json",
            )
    """

    def __init__(
        self,
        secret: str,
        handlers: Optional[Dict[str, Callable]] = None,
        on_event: Optional[Callable] = None,
    ):
        self.secret = secret
        self.handlers: Dict[str, Callable] = handlers or {}
        self.on_event = on_event

    def on(self, event_name: str):
        """
        Decorator to register a handler for a specific event type.

        Args:
            event_name: The event name to handle (e.g. "order.created").

        Example:
            @handler.on("order.created")
            def handle_order(event: WebhookEvent):
                print(event.data)
        """
        def decorator(func: Callable):
            self.handlers[event_name] = func
            return func
        return decorator

    def catch_all(self, func: Callable):
        """
        Decorator to register a fallback handler for unmatched events.

        Example:
            @handler.catch_all
            def handle_unknown(event: WebhookEvent):
                print(f"Unknown event: {event.event}")
        """
        self.on_event = func
        return func

    def handle(self, request) -> Dict[str, Any]:
        """
        Process an incoming webhook from a Flask/Django/WSGI request.

        Args:
            request: The framework request object.

        Returns:
            A dict with ``status_code`` (int) and ``body`` (dict) for the HTTP response.

        Example:
            @app.route("/webhook", methods=["POST"])
            def webhook():
                result = handler.handle(request)
                return jsonify(result["body"]), result["status_code"]
        """
        body_str = _extract_body(request)
        headers = _extract_headers(request)
        return self.handle_request(body_str, headers)

    def handle_request(
        self,
        body: str,
        headers: Dict[str, str],
    ) -> Dict[str, Any]:
        """
        Process an incoming webhook from raw body and headers.

        Use this for frameworks where you don't have a request object
        (e.g. raw ASGI/WSGI).

        Args:
            body: The raw request body as a string.
            headers: The request headers as a dict.

        Returns:
            A dict with ``status_code`` (int) and ``body`` (dict) for the HTTP response.
        """
        try:
            event = _verify_and_build_event(body, headers, self.secret)
        except ValueError as e:
            return {
                "status_code": 401,
                "body": {
                    "error": {
                        "code": "INVALID_SIGNATURE",
                        "message": str(e),
                    }
                },
            }

        try:
            handler = self.handlers.get(event.event)
            if handler:
                handler(event)
            elif self.on_event:
                self.on_event(event)

            return {"status_code": 200, "body": {"received": True}}
        except Exception as e:
            return {
                "status_code": 500,
                "body": {
                    "error": {
                        "code": "HANDLER_ERROR",
                        "message": f"Internal webhook handler error: {e}",
                    }
                },
            }


def _verify_and_build_event(
    body: str, headers: Dict[str, str], secret: str
) -> WebhookEvent:
    """Internal helper: verify signature and build a WebhookEvent."""
    if not body:
        raise ValueError("Missing request body")

    msg_id = _get_header(headers, "webhook-id")
    timestamp = _get_header(headers, "webhook-timestamp")
    sig_header = _get_header(headers, "webhook-signature")

    if not msg_id:
        msg_id = _get_header(headers, "svix-id")
    if not timestamp:
        timestamp = _get_header(headers, "svix-timestamp")
    if not sig_header:
        sig_header = _get_header(headers, "svix-signature")

    # Standard Webhooks path
    if msg_id and timestamp and sig_header:
        verifier = WebhookVerifier(secret)
        result = verifier.verify(body, msg_id, timestamp, sig_header)

        if not result["valid"]:
            raise ValueError(result.get("error", "Signature verification failed"))

        event = WebhookEvent(
            id=msg_id,
            timestamp=timestamp,
            raw_body=body,
            data=result["payload"],
        )
        if isinstance(result["payload"], dict):
            event.event = result["payload"].get("event", "")
        return event

    # Legacy path
    legacy_sig = _get_header(headers, "x-hooksniff-signature")
    if not legacy_sig:
        raise ValueError("No webhook signature headers found")

    if not verify_signature(body, legacy_sig, secret):
        raise ValueError("Invalid legacy signature")

    event = WebhookEvent(raw_body=body)
    try:
        parsed = json.loads(body)
        event.data = parsed
        if isinstance(parsed, dict):
            event.event = parsed.get("event", "")
    except json.JSONDecodeError:
        event.data = body

    return event
