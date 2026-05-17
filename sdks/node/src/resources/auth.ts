/**
 * HookSniff SDK — Auth Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  TwoFactorRequiredResponse,
  CustomerResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RefreshTokenRequest,
  Verify2faRequest,
  Enable2faRequest,
  Confirm2faRequest,
  Disable2faRequest,
  Enable2faResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ExportDataResponse,
} from "../models";

export class Auth {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Register a new account. */
  public register(body: RegisterRequest): Promise<AuthResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/register");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AuthResponse);
  }

  /** Login with email and password. */
  public login(body: LoginRequest): Promise<AuthResponse | TwoFactorRequiredResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/login");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AuthResponse | TwoFactorRequiredResponse);
  }

  /** Logout (invalidate current token). */
  public logout(): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/logout");
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Get current user profile. */
  public me(): Promise<CustomerResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/auth/me");
    return request.send(this.requestCtx, (json) => json as CustomerResponse);
  }

  /** Refresh the access token. */
  public refresh(body: RefreshTokenRequest): Promise<AuthResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/refresh");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AuthResponse);
  }

  /** Send forgot password email. */
  public forgotPassword(body: ForgotPasswordRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/forgot-password");
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Reset password with token. */
  public resetPassword(body: ResetPasswordRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/reset-password");
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Verify email with token. */
  public verifyEmail(body: VerifyEmailRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/verify-email");
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Resend verification email. */
  public resendVerification(body?: ResendVerificationRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/resend-verification");
    if (body) request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Update profile. */
  public updateProfile(body: UpdateProfileRequest): Promise<CustomerResponse> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/auth/profile");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as CustomerResponse);
  }

  /** Change password. */
  public changePassword(body: ChangePasswordRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/auth/password");
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Export account data (GDPR). */
  public exportData(): Promise<ExportDataResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/auth/export");
    return request.send(this.requestCtx, (json) => json as ExportDataResponse);
  }

  /** Get 2FA status. */
  public get2faStatus(): Promise<{ enabled: boolean }> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/auth/2fa/status");
    return request.send(this.requestCtx, (json) => json as { enabled: boolean });
  }

  /** Enable 2FA (returns QR code and backup codes). */
  public enable2fa(body: Enable2faRequest): Promise<Enable2faResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/2fa/enable");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as Enable2faResponse);
  }

  /** Confirm 2FA setup. */
  public confirm2fa(body: Confirm2faRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/2fa/confirm");
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Disable 2FA. */
  public disable2fa(body: Disable2faRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/2fa/disable");
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Verify 2FA code (during login). */
  public verify2fa(body: Verify2faRequest): Promise<AuthResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/auth/2fa/verify");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AuthResponse);
  }
}
