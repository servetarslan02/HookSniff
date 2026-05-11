"""
HookSniff HTTP Request Helper

Zero-dependency HTTP client using urllib.request.
Handles auth, retries, error mapping, and idempotency keys.
"""

import json
import time
import uuid
import urllib.request
import urllib.error
import urllib.parse
from typing import Any, Dict, Optional

LIB_VERSION = "0.4.0"
USER_AGENT = f"hooksniff-sdk/{LIB_VERSION}/python"


class ApiException(Exception):
    """HookSniff API error."""

    def __init__(self, code: int, body: Any, headers: Dict[str, str] = None):
        self.code = code
        self.body = body
        self.headers = headers or {}
        # Safe serialization — body might be a string (non-JSON response)
        try:
            body_str = json.dumps(body) if not isinstance(body, str) else body
        except (TypeError, ValueError):
            body_str = str(body)
        super().__init__(f"HookSniff API Error {code}: {body_str}")


class HookSniffRequestContext:
    """Request context holding base URL, token, timeout, and retry config."""

    def __init__(self, base_url: str, token: str, timeout: int = 30000, num_retries: int = 2):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout
        self.num_retries = num_retries


class HookSniffRequest:
    """HTTP request builder and executor."""

    def __init__(self, method: str, path: str):
        self.method = method
        self.path = path
        self._body: Optional[str] = None
        self._query_params: Dict[str, str] = {}
        self._header_params: Dict[str, str] = {}

    def set_path_param(self, name: str, value: str):
        self.path = self.path.replace(f"{{{name}}}", urllib.parse.quote(str(value), safe=""))

    def set_query_params(self, params: Dict[str, Any]):
        for key, value in params.items():
            if value is not None:
                self._query_params[key] = str(value)

    def set_header_param(self, name: str, value: str):
        if value is not None:
            self._header_params[name] = value

    def set_body(self, value: Any):
        self._body = json.dumps(value)

    def send(self, ctx: HookSniffRequestContext, parser=None) -> Any:
        response = self._send_with_retry(ctx)
        if response.status == 204:
            return None
        text = response.read().decode("utf-8")

        # Empty body check — match Node.js behavior
        if not text or len(text.strip()) == 0:
            if parser:
                raise ApiException(
                    response.status, "Empty response body", dict(response.headers)
                )
            return None

        data = json.loads(text)
        return parser(data) if parser else data

    def send_void(self, ctx: HookSniffRequestContext):
        response = self._send_with_retry(ctx)
        # Consume response body to free the connection (matches Node.js behavior)
        try:
            response.read()
        except Exception:
            pass

    def _send_with_retry(self, ctx: HookSniffRequestContext) -> urllib.request.Request:
        url = ctx.base_url + self.path
        if self._query_params:
            url += "?" + urllib.parse.urlencode(self._query_params)

        # Auto idempotency key for POST
        if "idempotency-key" not in self._header_params and self.method == "POST":
            self._header_params["idempotency-key"] = f"auto_{uuid.uuid4()}"

        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {ctx.token}",
            "User-Agent": USER_AGENT,
            **self._header_params,
        }

        if self._body is not None:
            headers["Content-Type"] = "application/json"

        max_retries = ctx.num_retries
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                data = self._body.encode("utf-8") if self._body else None
                req = urllib.request.Request(url, data=data, headers=headers, method=self.method)
                response = urllib.request.urlopen(req, timeout=ctx.timeout / 1000)
                return response

            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8", errors="replace")
                try:
                    parsed = json.loads(error_body)
                except (json.JSONDecodeError, ValueError):
                    parsed = error_body
                if e.code < 500:
                    raise ApiException(e.code, parsed, dict(e.headers)) from e
                last_error = ApiException(e.code, parsed, dict(e.headers))

            except Exception as e:
                last_error = e

            if attempt < max_retries:
                time.sleep(0.05 * (2 ** attempt))

        raise last_error or Exception("Request failed after retries")
