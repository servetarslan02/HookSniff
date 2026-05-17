"""
HookSniff SDK — HTTP Request Client

Handles auth, retries with exponential backoff, timeout, and idempotency keys.
Svix-style request handling adapted for HookSniff.
"""

from __future__ import annotations

import json
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode

from .exceptions import (
    ApiException,
    RateLimitError,
    NotFoundException,
    ValidationException,
    UnauthorizedException,
    ForbiddenException,
    ServerException,
)

LIB_VERSION = "0.5.0"
USER_AGENT = f"hooksniff-python-sdk/{LIB_VERSION}"
DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app"


@dataclass
class RequestConfig:
    """Configuration for the HTTP request client."""
    base_url: str = DEFAULT_BASE_URL
    token: str = ""
    timeout: float | None = 30.0
    num_retries: int = 2
    retry_schedule_ms: list[int] | None = None
    debug: bool = False


class HookSniffRequest:
    """Builds and sends HTTP requests to the HookSniff API."""

    def __init__(self, method: str, path: str):
        self.method = method
        self.path = path
        self._body: str | None = None
        self._query_params: dict[str, str] = {}
        self._header_params: dict[str, str] = {}

    def set_path_param(self, name: str, value: str) -> None:
        new_path = self.path.replace(f"{{{name}}}", _quote(value))
        if new_path == self.path:
            raise ValueError(f"path parameter '{name}' not found in path")
        self.path = new_path

    def set_query_params(self, params: dict[str, Any]) -> None:
        for name, value in params.items():
            self.set_query_param(name, value)

    def set_query_param(self, name: str, value: Any) -> None:
        if value is None:
            return
        if isinstance(value, bool):
            self._query_params[name] = "true" if value else "false"
        elif isinstance(value, (int, float)):
            self._query_params[name] = str(value)
        elif isinstance(value, str):
            self._query_params[name] = value
        elif isinstance(value, list):
            if value:
                self._query_params[name] = ",".join(str(v) for v in value)
        elif hasattr(value, "isoformat"):  # datetime
            self._query_params[name] = value.isoformat()

    def set_header_param(self, name: str, value: str | None) -> None:
        if value is not None:
            self._header_params[name] = value

    def set_body(self, value: Any) -> None:
        self._body = json.dumps(value, separators=(",", ":"))

    def send(self, config: RequestConfig, parse: Callable[[Any], T]) -> T:
        """Send request and parse response."""
        response = self._send_inner(config)
        if response["status"] == 204:
            return None  # type: ignore
        return parse(response["body"])

    def send_no_body(self, config: RequestConfig) -> None:
        """Send request, discard response body."""
        self._send_inner(config)

    def _send_inner(self, config: RequestConfig) -> dict[str, Any]:
        url = config.base_url + self.path
        if self._query_params:
            url += "?" + urlencode(self._query_params, doseq=True)

        # Auto idempotency key for POST
        if "idempotency-key" not in self._header_params and self.method == "POST":
            self._header_params["idempotency-key"] = f"auto_{uuid.uuid4()}"

        headers = {
            "accept": "application/json, */*;q=0.8",
            "authorization": f"Bearer {config.token}",
            "user-agent": USER_AGENT,
            "hooksniff-req-id": str(uuid.uuid4().int)[:16],
        }
        if self._body is not None:
            headers["content-type"] = "application/json"
        headers.update(self._header_params)

        if config.debug:
            print(f"[HookSniff] {self.method} {url}")

        return _send_with_retry(
            url=url,
            method=self.method,
            body=self._body,
            headers=headers,
            timeout=config.timeout,
            num_retries=config.num_retries,
            retry_schedule_ms=config.retry_schedule_ms,
            debug=config.debug,
        )


# ─── Internal helpers ──────────────────────────────────────────────

T = Any  # generic type var placeholder


def _quote(value: str) -> str:
    from urllib.parse import quote as _url_quote
    return _url_quote(str(value), safe="")


def _send_with_retry(
    url: str,
    method: str,
    body: str | None,
    headers: dict[str, str],
    timeout: float | None,
    num_retries: int,
    retry_schedule_ms: list[int] | None,
    debug: bool,
    retry_count: int = 0,
) -> dict[str, Any]:
    """Send HTTP request with exponential backoff retry on 5xx."""
    try:
        req = Request(url, data=body.encode("utf-8") if body else None, headers=headers, method=method)
        resp = urlopen(req, timeout=timeout)
        resp_body = resp.read().decode("utf-8")
        status = resp.status

        if debug:
            print(f"[HookSniff] ← {status}")

        return {
            "status": status,
            "body": json.loads(resp_body) if resp_body else None,
            "headers": dict(resp.headers),
        }

    except HTTPError as e:
        status = e.code
        resp_body = e.read().decode("utf-8", errors="replace")
        resp_headers = dict(e.headers)

        if debug:
            print(f"[HookSniff] ← {status} (attempt {retry_count + 1})")

        # Retry on 5xx
        if status >= 500 and retry_count < num_retries:
            delay_ms = _get_retry_delay(retry_count, retry_schedule_ms)
            if debug:
                print(f"[HookSniff] Retrying in {delay_ms}ms...")
            time.sleep(delay_ms / 1000)
            return _send_with_retry(
                url=url, method=method, body=body, headers=headers,
                timeout=timeout, num_retries=num_retries,
                retry_schedule_ms=retry_schedule_ms, debug=debug,
                retry_count=retry_count + 1,
            )

        # Parse error body
        try:
            error_body = json.loads(resp_body)
        except (json.JSONDecodeError, ValueError):
            error_body = resp_body

        _raise_for_status(status, error_body, resp_headers)
        raise  # unreachable

    except Exception as e:
        if debug:
            print(f"[HookSniff] Error: {e}")
        raise


def _get_retry_delay(retry_count: int, schedule: list[int] | None) -> int:
    if schedule and retry_count < len(schedule):
        return schedule[retry_count]
    return 50 * (2 ** retry_count)  # exponential backoff: 50, 100, 200, ...


def _raise_for_status(status: int, body: object, headers: dict[str, str]) -> None:
    """Raise the appropriate exception for the given HTTP status code."""
    if status == 401:
        raise UnauthorizedException(status, body, headers)
    if status == 403:
        raise ForbiddenException(status, body, headers)
    if status == 404:
        raise NotFoundException(status, body, headers)
    if status == 422:
        raise ValidationException(status, body, headers)
    if status == 429:
        retry_after = headers.get("retry-after")
        raise RateLimitError(
            status_code=status, body=body, headers=headers,
            retry_after=float(retry_after) if retry_after else None,
        )
    if status >= 500:
        raise ServerException(status, body, headers)
    raise ApiException(status, body, headers)
