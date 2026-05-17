"""
HookSniff SDK — Auth Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Auth:
    """Authentication & account management."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def register(self, email: str, password: str, name: str | None = None) -> dict[str, Any]:
        """Register a new account."""
        req = HookSniffRequest("POST", "/v1/auth/register")
        body: dict[str, Any] = {"email": email, "password": password}
        if name:
            body["name"] = name
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def login(self, email: str, password: str, totp_code: str | None = None) -> dict[str, Any]:
        """Login and get access token."""
        req = HookSniffRequest("POST", "/v1/auth/login")
        body: dict[str, Any] = {"email": email, "password": password}
        if totp_code:
            body["totp_code"] = totp_code
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def refresh(self, refresh_token: str) -> dict[str, Any]:
        """Refresh access token."""
        req = HookSniffRequest("POST", "/v1/auth/refresh")
        req.set_body({"refresh_token": refresh_token})
        return req.send(self._config, lambda j: j)

    def logout(self) -> None:
        """Logout (invalidate current token)."""
        req = HookSniffRequest("POST", "/v1/auth/logout")
        req.send_no_body(self._config)

    def get_profile(self) -> dict[str, Any]:
        """Get current user profile."""
        req = HookSniffRequest("GET", "/v1/auth/profile")
        return req.send(self._config, lambda j: j)

    def update_profile(self, name: str | None = None) -> dict[str, Any]:
        """Update user profile."""
        req = HookSniffRequest("PATCH", "/v1/auth/profile")
        body: dict[str, Any] = {}
        if name is not None:
            body["name"] = name
        req.set_body(body)
        return req.send(self._config, lambda j: j)

    def change_password(self, current_password: str, new_password: str) -> None:
        """Change password."""
        req = HookSniffRequest("POST", "/v1/auth/change-password")
        req.set_body({
            "current_password": current_password,
            "new_password": new_password,
        })
        req.send_no_body(self._config)

    def forgot_password(self, email: str) -> dict[str, Any]:
        """Request password reset email."""
        req = HookSniffRequest("POST", "/v1/auth/forgot-password")
        req.set_body({"email": email})
        return req.send(self._config, lambda j: j)

    def reset_password(self, token: str, new_password: str) -> dict[str, Any]:
        """Reset password with token."""
        req = HookSniffRequest("POST", "/v1/auth/reset-password")
        req.set_body({"token": token, "new_password": new_password})
        return req.send(self._config, lambda j: j)

    def verify_email(self, token: str) -> dict[str, Any]:
        """Verify email address."""
        req = HookSniffRequest("POST", "/v1/auth/verify-email")
        req.set_body({"token": token})
        return req.send(self._config, lambda j: j)

    def resend_verification(self, email: str | None = None) -> dict[str, Any]:
        """Resend verification email."""
        req = HookSniffRequest("POST", "/v1/auth/resend-verification")
        if email:
            req.set_body({"email": email})
        return req.send(self._config, lambda j: j)

    def enable_2fa(self, password: str) -> dict[str, Any]:
        """Enable 2FA (returns QR code URL and secret)."""
        req = HookSniffRequest("POST", "/v1/auth/2fa/enable")
        req.set_body({"password": password})
        return req.send(self._config, lambda j: j)

    def confirm_2fa(self, code: str) -> dict[str, Any]:
        """Confirm 2FA setup with TOTP code."""
        req = HookSniffRequest("POST", "/v1/auth/2fa/confirm")
        req.set_body({"code": code})
        return req.send(self._config, lambda j: j)

    def disable_2fa(self, code: str, password: str) -> dict[str, Any]:
        """Disable 2FA."""
        req = HookSniffRequest("POST", "/v1/auth/2fa/disable")
        req.set_body({"code": code, "password": password})
        return req.send(self._config, lambda j: j)

    def export_data(self) -> dict[str, Any]:
        """Export user data (GDPR)."""
        req = HookSniffRequest("GET", "/v1/auth/export")
        return req.send(self._config, lambda j: j)

    def delete_account(self, password: str) -> None:
        """Delete account (GDPR)."""
        req = HookSniffRequest("DELETE", "/v1/auth/account")
        req.set_body({"password": password})
        req.send_no_body(self._config)
