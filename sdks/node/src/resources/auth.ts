/**
 * HookSniff API Resource: Auth
 *
 * Register, login, 2FA, email verification, password reset, GDPR.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  totp_code?: string;
}

export interface AuthOutput {
  token: string;
  user_id: string;
  email: string;
  plan: string;
  is_admin: boolean;
}

export interface TwoFactorSetupOutput {
  secret: string;
  qr_code_url: string;
}

export class Auth {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Register a new account */
  async register(input: RegisterInput): Promise<AuthOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/auth/register");
    req.setBody(input);
    return req.send<AuthOutput>(this.ctx);
  }

  /** Login and get a JWT token */
  async login(input: LoginInput): Promise<AuthOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/auth/login");
    req.setBody(input);
    return req.send<AuthOutput>(this.ctx);
  }

  /** Enable two-factor authentication */
  async enable2fa(): Promise<TwoFactorSetupOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/auth/2fa/enable");
    return req.send<TwoFactorSetupOutput>(this.ctx);
  }

  /** Verify email address */
  async verifyEmail(token: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/auth/verify-email");
    req.setQueryParams({ token });
    return req.sendVoid(this.ctx);
  }

  /** Request password reset */
  async forgotPassword(email: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/auth/forgot-password");
    req.setBody({ email });
    return req.sendVoid(this.ctx);
  }

  /** Export user data (GDPR) */
  async exportData(): Promise<unknown> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/auth/export");
    return req.send<unknown>(this.ctx);
  }

  /** Delete account (GDPR) */
  async deleteAccount(): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/auth/account");
    return req.sendVoid(this.ctx);
  }
}
