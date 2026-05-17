"""
HookSniff SDK — HTTP Validation Error
"""

from typing import Any, Dict, Optional


class HTTPValidationError(Exception):
    """Raised when the API returns a 422 validation error."""

    def __init__(self, body: Any, status_code: int = 422):
        self.status_code = status_code
        self.body = body
        super().__init__(f"Validation Error: {body}")

    @classmethod
    def init_exception(cls, body: Any, status_code: int = 422) -> "HTTPValidationError":
        return cls(body=body, status_code=status_code)
