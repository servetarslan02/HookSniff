"""
HookSniff Error Classes

Provides specific error types for different HTTP status codes.
All errors extend `HookSniffError`.
"""


class HookSniffError(Exception):
    """Base error class for all HookSniff errors."""

    def __init__(self, status_code: int, message: str, headers: dict | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.headers = headers or {}


class BadRequestError(HookSniffError):
    """400 Bad Request — The request was malformed or missing required fields."""

    def __init__(self, detail: str | None = None, headers: dict | None = None):
        super().__init__(400, detail or "Bad request", headers)
        self.detail = detail


class UnauthorizedError(HookSniffError):
    """401 Unauthorized — Invalid or missing authentication."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(401, message or "Unauthorized", headers)


class ForbiddenError(HookSniffError):
    """403 Forbidden — Insufficient permissions."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(403, message or "Forbidden", headers)


class NotFoundError(HookSniffError):
    """404 Not Found — Resource does not exist."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(404, message or "Not found", headers)


class ConflictError(HookSniffError):
    """409 Conflict — Resource already exists or conflict with current state."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(409, message or "Conflict", headers)


class UnprocessableEntityError(HookSniffError):
    """422 Unprocessable Entity — Validation error."""

    def __init__(
        self,
        validation_errors: list[dict] | None = None,
        message: str | None = None,
        headers: dict | None = None,
    ):
        super().__init__(422, message or "Unprocessable entity", headers)
        self.validation_errors = validation_errors or []


class RateLimitError(HookSniffError):
    """429 Too Many Requests — Rate limit exceeded."""

    def __init__(self, retry_after: int | None = None, headers: dict | None = None):
        msg = f"Rate limit exceeded (retry after {retry_after}s)" if retry_after else "Rate limit exceeded"
        super().__init__(429, msg, headers)
        self.retry_after = retry_after


class InternalServerError(HookSniffError):
    """500 Internal Server Error."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(500, message or "Internal server error", headers)


class BadGatewayError(HookSniffError):
    """502 Bad Gateway."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(502, message or "Bad gateway", headers)


class ServiceUnavailableError(HookSniffError):
    """503 Service Unavailable."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(503, message or "Service unavailable", headers)


class GatewayTimeoutError(HookSniffError):
    """504 Gateway Timeout."""

    def __init__(self, message: str | None = None, headers: dict | None = None):
        super().__init__(504, message or "Gateway timeout", headers)


def create_error_from_status(
    status_code: int, body: dict | None = None, headers: dict | None = None
) -> HookSniffError:
    """Create the appropriate error class from a status code and response body."""
    detail = (body or {}).get("detail")

    error_map = {
        400: lambda: BadRequestError(detail, headers),
        401: lambda: UnauthorizedError(detail, headers),
        403: lambda: ForbiddenError(detail, headers),
        404: lambda: NotFoundError(detail, headers),
        409: lambda: ConflictError(detail, headers),
        404: lambda: NotFoundError(detail, headers),
        500: lambda: InternalServerError(detail, headers),
        502: lambda: BadGatewayError(detail, headers),
        503: lambda: ServiceUnavailableError(detail, headers),
        504: lambda: GatewayTimeoutError(detail, headers),
    }

    if status_code == 422:
        return UnprocessableEntityError(
            validation_errors=(body or {}).get("detail", []),
            message=detail,
            headers=headers,
        )

    if status_code == 429:
        retry_after = None
        if headers and "retry-after" in headers:
            try:
                retry_after = int(headers["retry-after"])
            except ValueError:
                pass
        return RateLimitError(retry_after, headers)

    factory = error_map.get(status_code)
    if factory:
        return factory()

    return HookSniffError(status_code, detail or f"HTTP {status_code}", headers)
