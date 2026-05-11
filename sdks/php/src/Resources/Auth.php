<?php

declare(strict_types=1);

namespace HookSniff\Resources;

use HookSniff\Request;

/**
 * HookSniff API Resource: Auth
 *
 * Register, login, 2FA, email verification, password reset, GDPR.
 */
class Auth
{
    /**
     * @param array{baseUrl: string, token: string, timeout: int, numRetries: int} $ctx
     */
    public function __construct(private readonly array $ctx) {}

    /**
     * Register a new account.
     *
     * @param array{email: string, password: string} $input
     * @return array{token: string, user_id: string, email: string, plan: string, is_admin: bool}
     * @throws \HookSniff\ApiException
     */
    public function register(array $input): array
    {
        $req = new Request('POST', '/v1/auth/register');
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * Login and get a JWT token.
     *
     * @param array{email: string, password: string, totp_code?: string} $input
     * @return array{token: string, user_id: string, email: string, plan: string, is_admin: bool}
     * @throws \HookSniff\ApiException
     */
    public function login(array $input): array
    {
        $req = new Request('POST', '/v1/auth/login');
        $req->setBody($input);
        return $req->send($this->ctx);
    }

    /**
     * Enable two-factor authentication.
     *
     * @return array{secret: string, qr_code_url: string}
     * @throws \HookSniff\ApiException
     */
    public function enable2fa(): array
    {
        $req = new Request('POST', '/v1/auth/2fa/enable');
        return $req->send($this->ctx);
    }

    /**
     * Verify email address.
     *
     * @throws \HookSniff\ApiException
     */
    public function verifyEmail(string $token): void
    {
        $req = new Request('GET', '/v1/auth/verify-email');
        $req->setQueryParams(['token' => $token]);
        $req->sendVoid($this->ctx);
    }

    /**
     * Request password reset.
     *
     * @throws \HookSniff\ApiException
     */
    public function forgotPassword(string $email): void
    {
        $req = new Request('POST', '/v1/auth/forgot-password');
        $req->setBody(['email' => $email]);
        $req->sendVoid($this->ctx);
    }

    /**
     * Export user data (GDPR).
     *
     * @return mixed
     * @throws \HookSniff\ApiException
     */
    public function exportData(): mixed
    {
        $req = new Request('GET', '/v1/auth/export');
        return $req->send($this->ctx);
    }

    /**
     * Delete account (GDPR).
     *
     * @throws \HookSniff\ApiException
     */
    public function deleteAccount(): void
    {
        $req = new Request('DELETE', '/v1/auth/account');
        $req->sendVoid($this->ctx);
    }
}
