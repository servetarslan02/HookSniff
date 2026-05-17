"""
HookSniff SDK — Authentication Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import (
    AuthResponse,
    CustomerResponse,
    Enable2faResponse,
)
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class AuthLoginOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params({"idempotency-key": self.idempotency_key})


class AuthenticationAsync(ApiBase):
    async def register(
        self, email: str, password: str, name: t.Optional[str] = None
    ) -> AuthResponse:
        """Register a new account."""
        body: t.Dict[str, t.Any] = {"email": email, "password": password}
        if name:
            body["name"] = name
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/auth/register",
            json_body=body,
        )
        return AuthResponse(**response.json())

    async def login(
        self,
        email: str,
        password: str,
        totp_code: t.Optional[str] = None,
        options: AuthLoginOptions = AuthLoginOptions(),
    ) -> AuthResponse:
        """Login and get access token."""
        body: t.Dict[str, t.Any] = {"email": email, "password": password}
        if totp_code:
            body["totp_code"] = totp_code
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/auth/login",
            header_params=options._header_params(),
            json_body=body,
        )
        return AuthResponse(**response.json())

    async def refresh(self, refresh_token: str) -> AuthResponse:
        """Refresh access token."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/auth/refresh",
            json_body={"refresh_token": refresh_token},
        )
        return AuthResponse(**response.json())

    async def logout(self) -> None:
        """Logout (invalidate current token)."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/logout",
        )

    async def get_profile(self) -> CustomerResponse:
        """Get current user profile."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/auth/profile",
        )
        return CustomerResponse(**response.json())

    async def update_profile(self, name: t.Optional[str] = None) -> CustomerResponse:
        """Update user profile."""
        body: t.Dict[str, t.Any] = {}
        if name is not None:
            body["name"] = name
        response = await self._request_asyncio(
            method="patch",
            path="/api/v1/auth/profile",
            json_body=body,
        )
        return CustomerResponse(**response.json())

    async def change_password(self, current_password: str, new_password: str) -> None:
        """Change password."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/change-password",
            json_body={"current_password": current_password, "new_password": new_password},
        )

    async def forgot_password(self, email: str) -> None:
        """Request password reset email."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/forgot-password",
            json_body={"email": email},
        )

    async def reset_password(self, token: str, new_password: str) -> None:
        """Reset password with token."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/reset-password",
            json_body={"token": token, "new_password": new_password},
        )

    async def verify_email(self, token: str) -> None:
        """Verify email address."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/verify-email",
            json_body={"token": token},
        )

    async def resend_verification(self, email: t.Optional[str] = None) -> None:
        """Resend verification email."""
        body: t.Dict[str, t.Any] = {}
        if email:
            body["email"] = email
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/resend-verification",
            json_body=body if body else None,
        )

    async def enable_2fa(self, password: str) -> Enable2faResponse:
        """Enable 2FA."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/auth/2fa/enable",
            json_body={"password": password},
        )
        return Enable2faResponse(**response.json())

    async def confirm_2fa(self, code: str) -> None:
        """Confirm 2FA setup with TOTP code."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/2fa/confirm",
            json_body={"code": code},
        )

    async def disable_2fa(self, code: str, password: str) -> None:
        """Disable 2FA."""
        await self._request_asyncio(
            method="post",
            path="/api/v1/auth/2fa/disable",
            json_body={"code": code, "password": password},
        )

    async def export_data(self) -> t.Dict[str, t.Any]:
        """Export user data (GDPR)."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/auth/export",
        )
        return response.json()

    async def delete_account(self, password: str) -> None:
        """Delete account (GDPR)."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/auth/account",
            json_body={"password": password},
        )


class Authentication(ApiBase):
    def register(
        self, email: str, password: str, name: t.Optional[str] = None
    ) -> AuthResponse:
        """Register a new account."""
        body: t.Dict[str, t.Any] = {"email": email, "password": password}
        if name:
            body["name"] = name
        response = self._request_sync(
            method="post",
            path="/api/v1/auth/register",
            json_body=body,
        )
        return AuthResponse(**response.json())

    def login(
        self,
        email: str,
        password: str,
        totp_code: t.Optional[str] = None,
        options: AuthLoginOptions = AuthLoginOptions(),
    ) -> AuthResponse:
        """Login and get access token."""
        body: t.Dict[str, t.Any] = {"email": email, "password": password}
        if totp_code:
            body["totp_code"] = totp_code
        response = self._request_sync(
            method="post",
            path="/api/v1/auth/login",
            header_params=options._header_params(),
            json_body=body,
        )
        return AuthResponse(**response.json())

    def refresh(self, refresh_token: str) -> AuthResponse:
        """Refresh access token."""
        response = self._request_sync(
            method="post",
            path="/api/v1/auth/refresh",
            json_body={"refresh_token": refresh_token},
        )
        return AuthResponse(**response.json())

    def logout(self) -> None:
        """Logout."""
        self._request_sync(method="post", path="/api/v1/auth/logout")

    def get_profile(self) -> CustomerResponse:
        """Get current user profile."""
        response = self._request_sync(method="get", path="/api/v1/auth/profile")
        return CustomerResponse(**response.json())

    def update_profile(self, name: t.Optional[str] = None) -> CustomerResponse:
        """Update user profile."""
        body: t.Dict[str, t.Any] = {}
        if name is not None:
            body["name"] = name
        response = self._request_sync(
            method="patch", path="/api/v1/auth/profile", json_body=body
        )
        return CustomerResponse(**response.json())

    def change_password(self, current_password: str, new_password: str) -> None:
        """Change password."""
        self._request_sync(
            method="post",
            path="/api/v1/auth/change-password",
            json_body={"current_password": current_password, "new_password": new_password},
        )

    def forgot_password(self, email: str) -> None:
        """Request password reset email."""
        self._request_sync(
            method="post", path="/api/v1/auth/forgot-password", json_body={"email": email}
        )

    def reset_password(self, token: str, new_password: str) -> None:
        """Reset password with token."""
        self._request_sync(
            method="post",
            path="/api/v1/auth/reset-password",
            json_body={"token": token, "new_password": new_password},
        )

    def verify_email(self, token: str) -> None:
        """Verify email address."""
        self._request_sync(
            method="post", path="/api/v1/auth/verify-email", json_body={"token": token}
        )

    def enable_2fa(self, password: str) -> Enable2faResponse:
        """Enable 2FA."""
        response = self._request_sync(
            method="post", path="/api/v1/auth/2fa/enable", json_body={"password": password}
        )
        return Enable2faResponse(**response.json())

    def confirm_2fa(self, code: str) -> None:
        """Confirm 2FA setup."""
        self._request_sync(
            method="post", path="/api/v1/auth/2fa/confirm", json_body={"code": code}
        )

    def disable_2fa(self, code: str, password: str) -> None:
        """Disable 2FA."""
        self._request_sync(
            method="post",
            path="/api/v1/auth/2fa/disable",
            json_body={"code": code, "password": password},
        )

    def export_data(self) -> t.Dict[str, t.Any]:
        """Export user data (GDPR)."""
        response = self._request_sync(method="get", path="/api/v1/auth/export")
        return response.json()

    def delete_account(self, password: str) -> None:
        """Delete account (GDPR)."""
        self._request_sync(
            method="delete", path="/api/v1/auth/account", json_body={"password": password}
        )
