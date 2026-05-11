"""
HookSniff API Resource: Auth

Register, login, 2FA, email verification, password reset, GDPR.
"""

from typing import Any, Dict, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext


class Auth:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def register(self, data: Dict[str, str]) -> Any:
        """Register a new account."""
        req = HookSniffRequest("POST", "/v1/auth/register")
        req.set_body(data)
        return req.send(self._ctx)

    def login(self, data: Dict[str, str]) -> Any:
        """Login and get a JWT token."""
        req = HookSniffRequest("POST", "/v1/auth/login")
        req.set_body(data)
        return req.send(self._ctx)

    def enable_2fa(self) -> Any:
        """Enable two-factor authentication."""
        req = HookSniffRequest("POST", "/v1/auth/2fa/enable")
        return req.send(self._ctx)

    def verify_email(self, token: str) -> None:
        """Verify email address."""
        req = HookSniffRequest("GET", "/v1/auth/verify-email")
        req.set_query_params({"token": token})
        req.send_void(self._ctx)

    def forgot_password(self, email: str) -> None:
        """Request password reset."""
        req = HookSniffRequest("POST", "/v1/auth/forgot-password")
        req.set_body({"email": email})
        req.send_void(self._ctx)

    def export_data(self) -> Any:
        """Export user data (GDPR)."""
        req = HookSniffRequest("GET", "/v1/auth/export")
        return req.send(self._ctx)

    def delete_account(self) -> None:
        """Delete account (GDPR)."""
        req = HookSniffRequest("DELETE", "/v1/auth/account")
        req.send_void(self._ctx)
