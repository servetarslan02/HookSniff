"""Custom exceptions for HookRelay SDK."""


class HookRelayError(Exception):
    """Base exception for all HookRelay errors."""

    def __init__(self, message: str, status_code: int = None, error_code: str = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


class AuthenticationError(HookRelayError):
    """Raised when the API key is invalid or missing."""

    def __init__(self, message: str = "Unauthorized: invalid or missing API key"):
        super().__init__(message, status_code=401, error_code="UNAUTHORIZED")


class NotFoundError(HookRelayError):
    """Raised when a resource is not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404, error_code="NOT_FOUND")


class RateLimitError(HookRelayError):
    """Raised when rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, status_code=429, error_code="RATE_LIMIT_EXCEEDED")


class ValidationError(HookRelayError):
    """Raised when the request is invalid."""

    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status_code=400, error_code="BAD_REQUEST")


class PayloadTooLargeError(HookRelayError):
    """Raised when the webhook payload exceeds the maximum size."""

    def __init__(self, message: str = "Payload too large"):
        super().__init__(message, status_code=413, error_code="PAYLOAD_TOO_LARGE")
