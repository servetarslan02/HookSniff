"""
HookSniff SDK — HTTP Error
"""


class HttpError(Exception):
    """Raised when the API returns a non-2xx response."""

    def __init__(self, status_code: int, body: object):
        self.status_code = status_code
        self.body = body
        super().__init__(f"HTTP {status_code}: {body}")

    @classmethod
    def init_exception(cls, body: object, status_code: int) -> "HttpError":
        return cls(status_code=status_code, body=body)
