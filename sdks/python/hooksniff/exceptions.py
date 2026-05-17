"""
HookSniff SDK — Custom Exceptions
"""


class HookSniffError(Exception):
    """Base exception for all HookSniff SDK errors."""
    pass


class ApiException(HookSniffError):
    """Raised when the API returns a non-2xx response."""

    def __init__(self, status_code: int, body: object, headers: dict[str, str] | None = None):
        self.status_code = status_code
        self.body = body
        self.headers = headers or {}
        super().__init__(f"HTTP {status_code}: {body}")


class WebhookVerificationError(HookSniffError):
    """Raised when webhook signature verification fails."""
    pass


class RateLimitError(ApiException):
    """Raised when the API returns 429 Too Many Requests."""

    def __init__(self, retry_after: float | None = None, **kwargs):
        super().__init__(**kwargs)
        self.retry_after = retry_after


class NotFoundException(ApiException):
    """Raised when the API returns 404 Not Found."""
    pass


class ValidationException(ApiException):
    """Raised when the API returns 422 Unprocessable Entity."""
    pass


class UnauthorizedException(ApiException):
    """Raised when the API returns 401 Unauthorized."""
    pass


class ForbiddenException(ApiException):
    """Raised when the API returns 403 Forbidden."""
    pass


class ServerException(ApiException):
    """Raised when the API returns 5xx."""
    pass
